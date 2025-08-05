import { database } from '../config/database';
import { Context, CreateContextRequest, UpdateContextRequest } from '../types';
import { logger } from '../utils/logger.utils';

// Simplified context service that handles only basic CRUD operations for contexts
// without any template or platform dependencies

class ContextService {
    async create(userId: number, contextData: CreateContextRequest): Promise<Context> {
        const client = await database.getClient();
        try {
            await client.query('BEGIN');

            const insertQuery = `
                INSERT INTO contexts (
                    user_id, type, title, topic, brief, content, source, mimetype, size
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *
            `;

            const values = [
                userId,
                contextData.type || 'text',
                contextData.title,
                contextData.topic || null,
                contextData.brief || null,
                contextData.content,
                contextData.source || null,
                contextData.mimetype || null,
                contextData.size || null
            ];

            const result = await client.query(insertQuery, values);
            const context = result.rows[0];

            await client.query('COMMIT');
            logger.info('Context created successfully', { contextId: context.id, userId });
            return context;
        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Error creating context:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async getById(id: number, userId: number): Promise<Context | null> {
        const query = `
            SELECT c.*
            FROM contexts c
            WHERE c.id = $1 AND c.user_id = $2
        `;
        const result = await database.query(query, [id, userId]);
        return result.rows[0] || null;
    }

    async getByUser(userId: number, filters?: any): Promise<Context[]> {
        let query = `
            SELECT c.*
            FROM contexts c
            WHERE c.user_id = $1
        `;
        const params = [userId];
        let paramCount = 1;

        // Only support type filter now
        if (filters?.type) {
            query += ` AND c.type = $${++paramCount}`;
            params.push(filters.type);
        }

        query += ' ORDER BY c.created_at DESC';

        if (filters?.limit) {
            query += ` LIMIT $${++paramCount}`;
            params.push(filters.limit);
        }

        const result = await database.query(query, params);
        return result.rows;
    }

    async update(id: number, userId: number, updateData: UpdateContextRequest): Promise<Context> {
        const allowedFields = ['title', 'topic', 'brief', 'content', 'source', 'type', 'mimetype', 'size'];
        const setClause = [];
        const values = [];
        let paramCount = 0;

        // Only allow updates to specific fields
        Object.entries(updateData).forEach(([key, value]) => {
            if (value !== undefined && allowedFields.includes(key)) {
                setClause.push(`${key} = $${++paramCount}`);
                values.push(value);
            }
        });

        if (setClause.length === 0) {
            throw new Error('No valid fields to update');
        }

        setClause.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id, userId);

        const query = `
            UPDATE contexts 
            SET ${setClause.join(', ')}
            WHERE id = $${++paramCount} AND user_id = $${++paramCount}
            RETURNING *
        `;

        const result = await database.query(query, values);
        if (result.rows.length === 0) {
            throw new Error('Context not found or not accessible');
        }

        return result.rows[0];
    }

    // markAsProcessed is no longer needed as processing is handled elsewhere
    async markAsProcessed(id: number, userId: number): Promise<void> {
        logger.warn('markAsProcessed is deprecated and has no effect');
        return Promise.resolve();
    }

    async delete(id: number, userId: number): Promise<boolean> {
        const client = await database.getClient();
        try {
            await client.query('BEGIN');

            // First delete any related data if needed
            // Note: context_tags table was removed, so no need to clean it up

            // Then delete the context
            const result = await client.query(
                'DELETE FROM contexts WHERE id = $1 AND user_id = $2',
                [id, userId]
            );

            await client.query('COMMIT');
            return (result?.rowCount ?? 0) > 0;
        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Error deleting context:', error);
            throw error;
        } finally {
            client.release();
        }
    }
}

export const contextService = new ContextService(); 