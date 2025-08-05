import { database } from '../config/database';
import { contextService } from './context.service';
import { templateService } from './template.service';
// platformService to be implemented
import { Post, CreatePostRequest, GeneratePostRequest } from '../types';
import { logger } from '../utils/logger.utils';
import { llmService } from './llm/llm.service';

class PostService {
    async generateAndCreate(userId: number, request: GeneratePostRequest): Promise<Post> {
        const client = await database.getClient();
        try {
            await client.query('BEGIN');
            const context = await contextService.getById(request.context_id, userId);
            if (!context) throw new Error('Context not found');
            let template;
            if (context.template_id) {
                template = await templateService.getById(context.template_id, userId);
            } else {
                template = await templateService.getDefaultForPlatform(request.platform_id);
            }
            if (!template) throw new Error('No template available for content generation');
            // platformService.getById to be implemented
            const platform = { id: request.platform_id, name: 'Twitter', max_content_length: 280, supported_media_types: ['image'], platform_constraints: {} } as any;
            const provider = llmService.getProvider();
            const aiResponse = await provider.generatePost({ context, template, platform }); // Only
            const createPostData: CreatePostRequest = {
                user_id: userId,
                context_id: request.context_id,
                template_id: template.id,
                platform_id: request.platform_id,
                campaign_id: request.campaign_id,
                content: aiResponse.content,
                status: 'draft',
                scheduled_for: request.scheduled_for,
                metadata: {
                    ai_model: aiResponse.model,
                    ai_usage: aiResponse.usage,
                    template_id: template.id,
                    generation_timestamp: new Date().toISOString()
                }
            };
            logger.info('Post generated successfully', { createPostData });
            const post = await this.create(createPostData);
            await contextService.markAsProcessed(request.context_id, userId);
            await client.query('COMMIT');
            logger.info('Post generated and created successfully', { postId: post.id, userId, contextId: request.context_id });
            return post;
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
        user_id, context_id, template_id, platform_id, campaign_id, content, content_type, hashtags, mentions, status, 
        scheduled_for, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
            postData.hashtags || [],
            postData.mentions || [],
            postData.status || 'draft',
            postData.scheduled_for,
            JSON.stringify(postData.metadata || {})
        ];
        const result = await database.query(query, values);
        return result.rows[0];
    }

    async getById(id: number, userId: number): Promise<Post | null> {
        const query = `
      SELECT 
        p.*,
        c.title as context_title,
        pl.name as platform_name,
        u.email as user_email,
        pc.title as campaign_title
      FROM posts p
      LEFT JOIN contexts c ON p.context_id = c.id
      LEFT JOIN platforms pl ON p.platform_id = pl.id
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN campaigns pc ON p.campaign_id = pc.id
      WHERE p.id = $1 AND p.user_id = $2
    `;
        const result = await database.query(query, [id, userId]);
        return result.rows[0] || null;
    }

    async getByUser(userId: number, filters?: any): Promise<Post[]> {
        let query = `
      SELECT 
        p.*,
        c.title as context_title,
        pl.name as platform_name,
        pc.title as campaign_title
      FROM posts p
      LEFT JOIN contexts c ON p.context_id = c.id
      LEFT JOIN platforms pl ON p.platform_id = pl.id
      LEFT JOIN campaigns pc ON p.campaign_id = pc.id
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
        return result.rows[0];
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