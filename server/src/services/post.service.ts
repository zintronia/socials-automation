import { database } from '../config/database';
import { contextService } from './context.service';
import { templateService } from './template.service';
import { Post, CreatePostRequest, GeneratePostRequest } from '../types';
import { logger } from '../utils/logger.utils';
import { llmService } from '../integrations/llm/llm.service';
import { twitterPostingService } from '../integrations/social/X(twitter)/twitter-posting.service';
import { enqueueScheduledPost } from '../jobs/post-scheduler';
import { config } from '../config/environment';
import { platformService } from './platform.service';

class PostService {
    async publishPost(id: number, userId: string, socialAccountId?: number): Promise<Post> {
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

        // Get post_accounts for this post
        const postAccountsQuery = `
      SELECT pa.*, sa.account_name, sa.account_username
      FROM post_accounts pa
      JOIN social_accounts sa ON pa.social_account_id = sa.id
      WHERE pa.post_id = $1 ${socialAccountId ? 'AND pa.social_account_id = $2' : ''}
    `;
        const postAccountsParams = socialAccountId ? [id, socialAccountId] : [id];
        const postAccountsResult = await database.query(postAccountsQuery, postAccountsParams);

        if (postAccountsResult.rows.length === 0) {
            throw new Error('No social accounts linked to this post');
        }

        // Allow publishing from draft or ready status
        if (!['draft', 'ready'].includes(post.status)) {
            throw new Error(`Post status '${post.status}' is not publishable`);
        }

        const results = [];
        const errors = [];

        for (const postAccount of postAccountsResult.rows) {
            try {
                // Update post_account status to publishing
                await database.query(
                    'UPDATE post_accounts SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                    ['publishing', postAccount.id]
                );

                let result: { id: string; url: string } | null = null;

                switch ((post.platform_name || '').toLowerCase()) {
                    case 'twitter':
                        result = await twitterPostingService.postTweet(String(postAccount.social_account_id), post.content);
                        break;
                    default:
                        throw new Error(`Publishing not implemented for platform: ${post.platform_name}`);
                }

                // Update post_account with success
                const updateQuery = `
          UPDATE post_accounts
          SET status = 'published',
              published_at = CURRENT_TIMESTAMP,
              platform_post_id = $1,
              platform_url = $2,
              platform_response = $3,
              error_message = NULL,
              retry_count = 0,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $4
          RETURNING *
        `;

                const updateValues = [
                    result?.id || null,
                    result?.url || null,
                    JSON.stringify({ platform: post.platform_name, result }),
                    postAccount.id
                ];

                const updateRes = await database.query(updateQuery, updateValues);
                results.push(updateRes.rows[0]);
            } catch (error: any) {
                logger.error('Error publishing post to account:', { postAccountId: postAccount.id, error });

                // Update post_account with failure info
                const failQuery = `
          UPDATE post_accounts
          SET status = 'failed',
              error_message = $1,
              retry_count = COALESCE(retry_count, 0) + 1,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `;
                await database.query(failQuery, [
                    error?.message || 'Failed to publish post',
                    postAccount.id
                ]);
                errors.push({ accountId: postAccount.social_account_id, error: error?.message });
            }
        }

        // Update main post status based on results
        const allPublished = results.length === postAccountsResult.rows.length;
        const newPostStatus = allPublished ? 'published' : (results.length > 0 ? 'partially_published' : 'failed');

        await database.query(
            'UPDATE posts SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [newPostStatus, id]
        );

        if (errors.length > 0 && results.length === 0) {
            throw new Error(`Failed to publish to all accounts: ${errors.map(e => e.error).join(', ')}`);
        }

        return { ...post, status: newPostStatus, publishResults: results, publishErrors: errors };
    }
    async generateAndCreate(userId: string, request: GeneratePostRequest): Promise<any> {
        const client = await database.getClient();
        try {
            await client.query('BEGIN');
            logger.info('Generating post', { request });
            // Decide whether to use raw prompt or DB context

            let context;
            if (request?.context_id) {
                const contextdata = await contextService.getById(request.context_id, userId);
                if (contextdata) {
                    context = contextdata;
                }
            }

            const template = request.template_id ? await templateService.getById(request.template_id) : await templateService.getDefaultForPlatform(request.platform_id);
            if (!template) throw new Error('No template available for content generation');

            const platform = await platformService.getById(request.platform_id);
            if (!platform) throw new Error('Platform not found');

            const provider = llmService.getProvider();

            // const aiResponse = await provider.generatePost({ context, prompt: request.prompt, template, platform });

            const aiResponse = {
                content: `"From #IFA2025 unveilings to Amazon’s bold AI workspace debut—and major tech education pledges from Amazon, Google & Microsoft—the tech world is moving fast. Stay tuned. #AI #Innovation`,
                model: "gpt-3.5-turbo",
                usage: {
                    prompt_tokens: 50,
                    completion_tokens: 50,
                    total_tokens: 100
                }
            }

            const createPostData: CreatePostRequest = {
                user_id: userId,
                context_id: request.context_id,
                template_id: template.id,
                campaign_id: request.campaign_id,
                platform_id: request.platform_id,
                content: aiResponse.content,
                prompt: request.prompt || undefined,
                metadata: {
                    ai_model: aiResponse.model,
                    ai_usage: aiResponse.usage,
                    used_prompt: Boolean(request.prompt),
                    generation_timestamp: new Date().toISOString()
                },
                status: 'draft'
            };
            logger.info('Post generated successfully', { createPostData });

            const post = await this.create(createPostData);
            // Only mark context as processed if it was used
            if (request.context_id) {
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
        user_id, context_id, template_id, platform_id, campaign_id, content, content_type, status, 
        metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
        const values = [
            postData.user_id,
            postData.context_id,
            postData.template_id,
            postData.platform_id,
            postData.campaign_id,
            postData.content,
            postData.content_type || 'text',
            postData.status || 'draft',
            JSON.stringify(postData.metadata || {})
        ];
        const result = await database.query(query, values);
        return result.rows[0];
    }

    async getById(id: number, userId: string): Promise<any | null> {
        const query = `
SELECT
    p.id,
    c.title AS context_name,
    t.name AS template_name,
    pl.name AS platform_name,
    pc.title AS campaign_name,
    p.status,
    p.content,
    COALESCE(
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'account_name', sa.account_name,
          'account_username', sa.account_username,
          'profile_image_url', sa.profile_image_url
        )
      ) FILTER (WHERE sa.id IS NOT NULL),
      '[]'
    ) AS social_accounts
FROM posts p
LEFT JOIN contexts c ON p.context_id = c.id
LEFT JOIN context_templates t ON p.template_id = t.id
LEFT JOIN platforms pl ON p.platform_id = pl.id
LEFT JOIN campaigns pc ON p.campaign_id = pc.id
LEFT JOIN post_accounts pa ON p.id = pa.post_id
LEFT JOIN social_accounts sa ON pa.social_account_id = sa.id
WHERE p.id = $1 AND p.user_id = $2
GROUP BY p.id, c.title, t.name, pl.name, pc.title, p.status, p.content;
`;
        const result = await database.query(query, [id, userId]);
        return result.rows[0] || null;
    }

    async getByUser(userId: string, filters?: any): Promise<any[]> {
        const params: any[] = [userId];
        let paramCount = 1;

        let query = `
      SELECT
        p.id,
        c.title AS context_name,
        t.name AS template_name,
        pl.name AS platform_name,
        pc.title AS campaign_name,
        p.status,
        p.content,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'account_name', sa.account_name,
              'account_username', sa.account_username,
              'profile_image_url', sa.profile_image_url
            )
          ) FILTER (WHERE sa.id IS NOT NULL),
          '[]'
        ) AS social_accounts
      FROM posts p
      LEFT JOIN contexts c ON p.context_id = c.id
      LEFT JOIN context_templates t ON p.template_id = t.id
      LEFT JOIN platforms pl ON p.platform_id = pl.id
      LEFT JOIN campaigns pc ON p.campaign_id = pc.id
      LEFT JOIN post_accounts pa ON p.id = pa.post_id
      LEFT JOIN social_accounts sa ON pa.social_account_id = sa.id
      WHERE p.user_id = $1
    `;

        // Dynamic filters
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

        query += `
      GROUP BY p.id, c.title, t.name, pl.name, pc.title, p.status, p.content
      ORDER BY p.created_at DESC
    `;

        if (filters?.limit) {
            query += ` LIMIT $${++paramCount}`;
            params.push(filters.limit);
        }

        const result = await database.query(query, params);
        return result.rows;
    }


    async updateStatus(id: number, userId: string, status: string, metadata?: any): Promise<Post> {
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

    async schedulePost(id: number, userId: string, scheduledFor: Date, socialAccountIds?: number[]): Promise<Post> {
        // Verify post exists and belongs to user
        const postQuery = 'SELECT * FROM posts WHERE id = $1 AND user_id = $2';
        const postResult = await database.query(postQuery, [id, userId]);
        if (postResult.rows.length === 0) throw new Error('Post not found or not accessible');

        const post = postResult.rows[0];

        // Get post_accounts to schedule
        const postAccountsQuery = `
      SELECT pa.* FROM post_accounts pa
      WHERE pa.post_id = $1 ${socialAccountIds ? 'AND pa.social_account_id = ANY($2)' : ''}
    `;
        const postAccountsParams = socialAccountIds ? [id, socialAccountIds] : [id];
        const postAccountsResult = await database.query(postAccountsQuery, postAccountsParams);

        if (postAccountsResult.rows.length === 0) {
            throw new Error('No social accounts found for scheduling');
        }

        // Update all post_accounts with scheduled time
        const updateQuery = `
      UPDATE post_accounts 
      SET scheduled_for = $1, status = 'scheduled', updated_at = CURRENT_TIMESTAMP
      WHERE post_id = $2 ${socialAccountIds ? 'AND social_account_id = ANY($3)' : ''}
    `;
        const updateParams = socialAccountIds ? [scheduledFor, id, socialAccountIds] : [scheduledFor, id];
        await database.query(updateQuery, updateParams);

        // Update main post status to ready (ready for scheduling)
        await database.query(
            'UPDATE posts SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            ['ready', id]
        );

        try {
            // In production, enqueue a delayed job; in dev, cron scanner picks it up
            if (config.environment === 'production') {
                await enqueueScheduledPost(id, userId, scheduledFor);
            }
        } catch (e) {
            logger.warn('Failed to enqueue scheduled post (will rely on scanner)', { id, error: e });
        }

        return { ...post, status: 'ready', scheduled_for: scheduledFor };
    }

    async getScheduledPosts(): Promise<any[]> {
        const query = `
      SELECT 
        p.*, 
        pl.name as platform_name, 
        u.email as user_email,
        pa.id as post_account_id,
        pa.social_account_id,
        pa.scheduled_for,
        sa.account_name,
        sa.account_username
      FROM posts p
      JOIN platforms pl ON p.platform_id = pl.id
      JOIN users u ON p.user_id = u.id
      JOIN post_accounts pa ON p.id = pa.post_id
      JOIN social_accounts sa ON pa.social_account_id = sa.id
      WHERE pa.status = 'scheduled' 
      AND pa.scheduled_for <= CURRENT_TIMESTAMP
      ORDER BY pa.scheduled_for ASC
    `;
        const result = await database.query(query);
        return result.rows;
    }

    async linkPostToSocialAccounts(postId: number, socialAccountIds: number[], userId: string): Promise<any[]> {
        // Verify post exists and belongs to user
        const postQuery = 'SELECT * FROM posts WHERE id = $1 AND user_id = $2';
        const postResult = await database.query(postQuery, [postId, userId]);
        if (postResult.rows.length === 0) {
            throw new Error('Post not found or not accessible');
        }

        // Verify social accounts belong to user
        const accountsQuery = `
      SELECT id FROM social_accounts 
      WHERE id = ANY($1) AND user_id = $2
    `;
        const accountsResult = await database.query(accountsQuery, [socialAccountIds, userId]);
        if (accountsResult.rows.length !== socialAccountIds.length) {
            throw new Error('One or more social accounts not found or not accessible');
        }

        // Remove existing post_accounts for this post
        await database.query('DELETE FROM post_accounts WHERE post_id = $1', [postId]);

        // Insert new post_accounts
        const insertPromises = socialAccountIds.map(accountId => {
            const insertQuery = `
        INSERT INTO post_accounts (post_id, social_account_id, status)
        VALUES ($1, $2, 'scheduled')
        RETURNING *
      `;
            return database.query(insertQuery, [postId, accountId]);
        });

        const results = await Promise.all(insertPromises);
        return results.map(result => result.rows[0]);
    }

    async unlinkPostFromSocialAccount(postId: number, socialAccountId: number, userId: string): Promise<boolean> {
        // Verify post exists and belongs to user
        const postQuery = 'SELECT * FROM posts WHERE id = $1 AND user_id = $2';
        const postResult = await database.query(postQuery, [postId, userId]);
        if (postResult.rows.length === 0) {
            throw new Error('Post not found or not accessible');
        }

        const deleteQuery = `
      DELETE FROM post_accounts 
      WHERE post_id = $1 AND social_account_id = $2
      AND EXISTS (
        SELECT 1 FROM social_accounts sa 
        WHERE sa.id = $2 AND sa.user_id = $3
      )
    `;
        const result = await database.query(deleteQuery, [postId, socialAccountId, userId]);
        return result.rowCount > 0;
    }

    async getPostAccounts(postId: number, userId: string): Promise<any[]> {
        const query = `
      SELECT 
        pa.*,
        sa.account_name,
        sa.account_username,
        sa.profile_image_url,
        pl.name as platform_name
      FROM post_accounts pa
      JOIN social_accounts sa ON pa.social_account_id = sa.id
      JOIN posts p ON pa.post_id = p.id
      JOIN platforms pl ON sa.platform_id = pl.id
      WHERE pa.post_id = $1 AND p.user_id = $2
      ORDER BY pa.created_at ASC
    `;
        const result = await database.query(query, [postId, userId]);
        return result.rows;
    }
}

export const postService = new PostService(); 