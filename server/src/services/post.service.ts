import { database } from '../config/database';
import { contextService } from './context.service';
import { templateService } from './template.service';
// platformService to be implemented
import { Post, CreatePostRequest, GeneratePostRequest } from '../types';
import { logger } from '../utils/logger.utils';
import { llmService } from '../integrations/llm/llm.service';
import { twitterPostingService } from '../integrations/social/X(twitter)/twitter-posting.service';
import { enqueueScheduledPost } from '../jobs/post-scheduler';
import { config } from '../config/environment';
import { platformService } from './platform.service';

class PostService {
    async publishPost(id: number, userId: number): Promise<Post> {
        // Fetch post with platform info
        const selectQuery = `
      SELECT p.*, pl.name as platform_name
      FROM posts p
      JOIN platforms pl ON p.platform_id = pl.id
      WHERE p.id = $1 AND p.user_id = $2
    `;
        const { rows } = await database.query(selectQuery, [id, userId]);
        const post = rows[0];
        if (!post) {
            throw new Error('Post not found or not accessible');
        }

        if (!post.social_account_id) {
            throw new Error('No social account linked to this post');
        }

        // Allow publishing from draft or scheduled
        if (!['draft', 'scheduled'].includes(post.status)) {
            throw new Error(`Post status '${post.status}' is not publishable`);
        }

        try {
            let result: { id: string; url: string } | null = null;

            switch ((post.platform_name || '').toLowerCase()) {
                case 'twitter':
                    result = await twitterPostingService.postTweet(String(post.social_account_id), post.content);
                    break;
                default:
                    throw new Error(`Publishing not implemented for platform: ${post.platform_name}`);
            }

            const updateQuery = `
        UPDATE posts
        SET status = 'published',
            published_at = CURRENT_TIMESTAMP,
            platform_post_id = $1,
            platform_url = $2,
            platform_response = $3,
            error_message = NULL,
            retry_count = 0,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $4 AND user_id = $5
        RETURNING *
      `;

            const updateValues = [
                result?.id || null,
                result?.url || null,
                JSON.stringify({ platform: post.platform_name, result }),
                id,
                userId
            ];

            const updateRes = await database.query(updateQuery, updateValues);
            return updateRes.rows[0];
        } catch (error: any) {
            logger.error('Error publishing post:', error);

            // Update post with failure info
            const failQuery = `
        UPDATE posts
        SET status = 'failed',
            error_message = $1,
            retry_count = COALESCE(retry_count, 0) + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND user_id = $3
        RETURNING *
      `;
            const failRes = await database.query(failQuery, [
                error?.message || 'Failed to publish post',
                id,
                userId
            ]);
            throw new Error(failRes.rows[0]?.error_message || 'Failed to publish post');
        }
    }
    async generateAndCreate(userId: number, request: GeneratePostRequest): Promise<any> {
        const client = await database.getClient();
        try {
            await client.query('BEGIN');
            logger.info('Generating post', { request });
            // Decide whether to use raw prompt or DB context
            const usePrompt = Boolean(request.prompt && request.prompt.trim().length > 0);

            let context: any | undefined = undefined;
            if (!usePrompt) {
                if (!request.context_id) {
                    throw new Error('Either prompt or context_id is required');
                }
                context = await contextService.getById(request.context_id, userId);
                if (!context) throw new Error('Context not found');
            }

            const template = request.template_id ? await templateService.getById(request.template_id) : await templateService.getDefaultForPlatform(request.platform_id);
            if (!template) throw new Error('No template available for content generation');

            const platform = await platformService.getById(request.platform_id);
            if (!platform) throw new Error('Platform not found');

            const provider = llmService.getProvider();

            // Call LLM with either prompt or context (prompt takes precedence)
            const aiResponse = await provider.generatePost({ context, prompt: request.prompt, template, platform });
            const createPostData: CreatePostRequest = {
                user_id: userId,
                context_id: request.context_id,
                template_id: template.id,
                platform_id: request.platform_id,
                campaign_id: request.campaign_id,
                social_account_id: request.social_account_id,
                content: aiResponse.content,
                status: 'draft',
                scheduled_for: request.scheduled_for,
                metadata: {
                    ai_model: aiResponse.model,
                    ai_usage: aiResponse.usage,
                    template_id: template.id,
                    used_prompt: Boolean(request.prompt),
                    user_prompt: request.prompt || undefined,
                    generation_timestamp: new Date().toISOString()
                }
            };
            logger.info('Post generated successfully', { createPostData });
            const post = await this.create(createPostData);
            // Only mark context as processed if it was used
            if (!usePrompt && request.context_id) {
                await contextService.markAsProcessed(request.context_id, userId);
            }
            await client.query('COMMIT');
            // Return the joined representation as requested (context/template/platform/campaign/social_account fields)
            const joined = await this.getById(post.id, userId);
            logger.info('Post generated and created successfully', { postId: post.id, userId, contextId: request.context_id });
            return joined;
        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Error generating post:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async create(postData: CreatePostRequest): Promise<Post> {
        const query = `
      INSERT INTO posts (
        user_id, context_id, template_id, platform_id, campaign_id, social_account_id, content, content_type, hashtags, mentions, status, 
        scheduled_for, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;
        const values = [
            postData.user_id,
            postData.context_id,
            postData.template_id,
            postData.platform_id,
            postData.campaign_id,
            postData.social_account_id,
            postData.content,
            postData.content_type || 'text',
            postData.hashtags || [],
            postData.mentions || [],
            postData.status || 'draft',
            postData.scheduled_for,
            JSON.stringify(postData.metadata || {})
        ];
        const result = await database.query(query, values);
        return result.rows[0];
    }

    async getById(id: number, userId: number): Promise<any | null> {
        const query = `
      SELECT 
        p.id,
        c.title AS context_name,
        t.name AS template_name,
        pl.name AS platform_name,
        pc.title AS campaign_name,
        JSON_BUILD_OBJECT(
          'account_name', sa.account_name,
          'account_username', sa.account_username,
          'profile_image_url', sa.profile_image_url
        ) AS social_account,
        p.status,
        p.scheduled_for,
        p.published_at,
        p.content
      FROM posts p
      LEFT JOIN contexts c ON p.context_id = c.id
      LEFT JOIN context_templates t ON p.template_id = t.id
      LEFT JOIN platforms pl ON p.platform_id = pl.id
      LEFT JOIN campaigns pc ON p.campaign_id = pc.id
      LEFT JOIN social_accounts sa ON p.social_account_id = sa.id
      WHERE p.id = $1 AND p.user_id = $2
    `;
        const result = await database.query(query, [id, userId]);
        return result.rows[0] || null;
    }

    async getByUser(userId: number, filters?: any): Promise<any[]> {
        let query = `
      SELECT 
        p.id,
        c.title AS context_name,
        t.name AS template_name,
        pl.name AS platform_name,
        pc.title AS campaign_name,
        JSON_BUILD_OBJECT(
          'account_name', sa.account_name,
          'account_username', sa.account_username,
          'profile_image_url', sa.profile_image_url
        ) AS social_account,
        p.status,
        p.scheduled_for,
        p.published_at,
        p.content
      FROM posts p
      LEFT JOIN contexts c ON p.context_id = c.id
      LEFT JOIN context_templates t ON p.template_id = t.id
      LEFT JOIN platforms pl ON p.platform_id = pl.id
      LEFT JOIN campaigns pc ON p.campaign_id = pc.id
      LEFT JOIN social_accounts sa ON p.social_account_id = sa.id
      WHERE p.user_id = $1
    `;
        const params = [userId];
        let paramCount = 1;
        if (filters?.status) {
            query += ` AND p.status = $${++paramCount}`;
            params.push(filters.status);
        }
        if (filters?.platform_id) {
            query += ` AND p.platform_id = $${++paramCount}`;
            params.push(filters.platform_id);
        }
        if (filters?.campaign_id) {
            query += ` AND p.campaign_id = $${++paramCount}`;
            params.push(filters.campaign_id);
        }
        query += ' ORDER BY p.created_at DESC';
        if (filters?.limit) {
            query += ` LIMIT $${++paramCount}`;
            params.push(filters.limit);
        }
        const result = await database.query(query, params);
        return result.rows;
    }

    async updateStatus(id: number, userId: number, status: string, metadata?: any): Promise<Post> {
        const query = `
      UPDATE posts 
      SET status = $1, metadata = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND user_id = $4
      RETURNING *
    `;
        const result = await database.query(query, [
            status,
            JSON.stringify(metadata || {}),
            id,
            userId
        ]);
        if (result.rows.length === 0) throw new Error('Post not found or not accessible');
        return result.rows[0];
    }

    async schedulePost(id: number, userId: number, scheduledFor: Date): Promise<Post> {
        const query = `
      UPDATE posts 
      SET scheduled_for = $1, status = 'scheduled', updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `;
        const result = await database.query(query, [scheduledFor, id, userId]);
        if (result.rows.length === 0) throw new Error('Post not found or not accessible');
        const updated = result.rows[0];
        try {
            // In production, enqueue a delayed job; in dev, cron scanner picks it up
            if (config.environment === 'production') {
                await enqueueScheduledPost(id, userId, scheduledFor);
            }
        } catch (e) {
            logger.warn('Failed to enqueue scheduled post (will rely on scanner)', { id, error: e });
        }
        return updated;
    }

    async getScheduledPosts(): Promise<Post[]> {
        const query = `
      SELECT p.*, pl.name as platform_name, u.email as user_email
      FROM posts p
      JOIN platforms pl ON p.platform_id = pl.id
      JOIN users u ON p.user_id = u.id
      WHERE p.status = 'scheduled' 
      AND p.scheduled_for <= CURRENT_TIMESTAMP
      ORDER BY p.scheduled_for ASC
    `;
        const result = await database.query(query);
        return result.rows;
    }
}

export const postService = new PostService(); 