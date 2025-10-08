import { database } from '../config/database';
import { Campaign, CreateCampaignRequest, UpdateCampaignRequest, CampaignWithPosts } from '../types';
import { logger } from '../utils/logger.utils';

class CampaignService {
    async create(userId: string, campaignData: CreateCampaignRequest): Promise<Campaign> {
        const query = `
            INSERT INTO campaigns (user_id, title, description)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const values = [
            userId,
            campaignData.title,
            campaignData.description
        ];
        
        const result = await database.query(query, values);
        logger.info('Campaign created successfully', { campaignId: result.rows[0].id, userId });
        return result.rows[0];
    }

    async getById(id: number, userId: string): Promise<CampaignWithPosts | null> {
        const query = `
            SELECT 
                c.*,
                u.email as user_email,
                COUNT(p.id) as post_count
            FROM campaigns c
            LEFT JOIN users u ON c.user_id = u.id
            LEFT JOIN posts p ON c.id = p.campaign_id
            WHERE c.id = $1 AND c.user_id = $2
            GROUP BY c.id, u.email
        `;
        
        const result = await database.query(query, [id, userId]);
        if (!result.rows[0]) {
            return null;
        }

        // Get posts for this campaign with linked social accounts
        const postsQuery = `
            SELECT 
                p.id,
                c.title AS context_name,
                t.name AS template_name,
                pl.name AS platform_name,
                pc.title AS campaign_name,
                p.status,
                p.content,
                p.created_at,
                p.updated_at,
                COALESCE(
                  JSON_AGG(
                    JSON_BUILD_OBJECT(
                      'id', sa.id,
                      'account_name', sa.account_name,
                      'account_username', sa.account_username,
                      'profile_image_url', sa.profile_image_url,
                      'status', pa.status,
                      'scheduled_for', pa.scheduled_for,
                      'published_at', pa.published_at,
                      'platform_post_id', pa.platform_post_id,
                      'platform_url', pa.platform_url
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
            WHERE p.campaign_id = $1
            GROUP BY p.id, c.title, t.name, pl.name, pc.title, p.status, p.content, p.created_at, p.updated_at
            ORDER BY p.created_at DESC
        `;
        
        const postsResult = await database.query(postsQuery, [id]);
        
        return {
            ...result.rows[0],
            posts: postsResult.rows
        };
    }

    async getByUser(userId: string, filters?: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<Campaign[]> {
        let query = `
            SELECT 
                c.*,
                u.email as user_email,
                COUNT(p.id) as post_count
            FROM campaigns c
            LEFT JOIN users u ON c.user_id = u.id
            LEFT JOIN posts p ON c.id = p.campaign_id
            WHERE c.user_id = $1
        `;
        
        const values: any[] = [userId];
        let valueIndex = 2;

        if (filters?.search) {
            query += ` AND (c.title ILIKE $${valueIndex} OR c.description ILIKE $${valueIndex})`;
            values.push(`%${filters.search}%`);
            valueIndex++;
        }

        query += ` GROUP BY c.id, u.email ORDER BY c.updated_at DESC`;

        if (filters?.limit) {
            query += ` LIMIT $${valueIndex}`;
            values.push(filters.limit);
            valueIndex++;
        }

        if (filters?.page && filters?.limit) {
            query += ` OFFSET $${valueIndex}`;
            values.push((filters.page - 1) * filters.limit);
        }

        const result = await database.query(query, values);
        return result.rows;
    }

    async update(id: number, userId: string, campaignData: UpdateCampaignRequest): Promise<Campaign> {
        const updateFields: string[] = [];
        const values: any[] = [];
        let valueIndex = 1;

        if (campaignData.title !== undefined) {
            updateFields.push(`title = $${valueIndex}`);
            values.push(campaignData.title);
            valueIndex++;
        }

        if (campaignData.description !== undefined) {
            updateFields.push(`description = $${valueIndex}`);
            values.push(campaignData.description);
            valueIndex++;
        }

        if (updateFields.length === 0) {
            throw new Error('No fields to update');
        }

        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id, userId);

        const query = `
            UPDATE campaigns 
            SET ${updateFields.join(', ')}
            WHERE id = $${valueIndex} AND user_id = $${valueIndex + 1}
            RETURNING *
        `;

        const result = await database.query(query, values);
        
        if (result.rows.length === 0) {
            throw new Error('Campaign not found or access denied');
        }

        logger.info('Campaign updated successfully', { campaignId: id, userId });
        return result.rows[0];
    }

    async delete(id: number, userId: string): Promise<void> {
        const client = await database.getClient();
        try {
            await client.query('BEGIN');

            // Check if campaign exists and belongs to user
            const checkQuery = 'SELECT id FROM campaigns WHERE id = $1 AND user_id = $2';
            const checkResult = await client.query(checkQuery, [id, userId]);
            
            if (checkResult.rows.length === 0) {
                throw new Error('Campaign not found or access denied');
            }

            // Delete post_accounts first (due to foreign key constraint)
            const deletePostAccountsQuery = `
                DELETE FROM post_accounts 
                WHERE post_id IN (
                    SELECT id FROM posts WHERE campaign_id = $1
                )
            `;
            await client.query(deletePostAccountsQuery, [id]);

            // Delete associated posts
            const deletePostsQuery = 'DELETE FROM posts WHERE campaign_id = $1';
            await client.query(deletePostsQuery, [id]);

            // Delete the campaign
            const deleteCampaignQuery = 'DELETE FROM campaigns WHERE id = $1 AND user_id = $2';
            const result = await client.query(deleteCampaignQuery, [id, userId]);

            if (result.rowCount === 0) {
                throw new Error('Campaign not found or access denied');
            }

            await client.query('COMMIT');
            logger.info('Campaign deleted successfully', { campaignId: id, userId });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async getCampaignStats(userId: string): Promise<{
        total_campaigns: number;
        total_posts: number;
        active_campaigns: number;
        scheduled_posts: number;
        published_posts: number;
        failed_posts: number;
    }> {
        const query = `
            SELECT 
                COUNT(DISTINCT c.id) as total_campaigns,
                COUNT(DISTINCT p.id) as total_posts,
                COUNT(DISTINCT CASE WHEN p.id IS NOT NULL THEN c.id END) as active_campaigns,
                COUNT(DISTINCT CASE WHEN pa.status = 'scheduled' THEN p.id END) as scheduled_posts,
                COUNT(DISTINCT CASE WHEN pa.status = 'published' THEN p.id END) as published_posts,
                COUNT(DISTINCT CASE WHEN pa.status = 'failed' THEN p.id END) as failed_posts
            FROM campaigns c
            LEFT JOIN posts p ON c.id = p.campaign_id
            LEFT JOIN post_accounts pa ON p.id = pa.post_id
            WHERE c.user_id = $1
        `;

        const result = await database.query(query, [userId]);
        return result.rows[0];
    }

    async getCampaignPostsWithStatus(campaignId: number, userId: string): Promise<any[]> {
        const query = `
            SELECT 
                p.id,
                p.content,
                p.status as post_status,
                p.created_at,
                c.title AS context_name,
                t.name AS template_name,
                pl.name AS platform_name,
                COUNT(pa.id) as total_accounts,
                COUNT(CASE WHEN pa.status = 'published' THEN 1 END) as published_accounts,
                COUNT(CASE WHEN pa.status = 'scheduled' THEN 1 END) as scheduled_accounts,
                COUNT(CASE WHEN pa.status = 'failed' THEN 1 END) as failed_accounts,
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'account_id', sa.id,
                        'account_name', sa.account_name,
                        'account_username', sa.account_username,
                        'status', pa.status,
                        'scheduled_for', pa.scheduled_for,
                        'published_at', pa.published_at,
                        'error_message', pa.error_message
                    )
                ) FILTER (WHERE sa.id IS NOT NULL) as account_details
            FROM posts p
            LEFT JOIN contexts c ON p.context_id = c.id
            LEFT JOIN context_templates t ON p.template_id = t.id
            LEFT JOIN platforms pl ON p.platform_id = pl.id
            LEFT JOIN post_accounts pa ON p.id = pa.post_id
            LEFT JOIN social_accounts sa ON pa.social_account_id = sa.id
            WHERE p.campaign_id = $1 AND p.user_id = $2
            GROUP BY p.id, p.content, p.status, p.created_at, c.title, t.name, pl.name
            ORDER BY p.created_at DESC
        `;

        const result = await database.query(query, [campaignId, userId]);
        return result.rows;
    }
}

export const campaignService = new CampaignService(); 