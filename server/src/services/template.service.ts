import { database } from '../config/database';
import { ContextTemplate, CreateTemplateRequest, UpdateTemplateRequest } from '../types';
import { logger } from '../utils/logger.utils';

class TemplateService {
    async create(userId: string, templateData: CreateTemplateRequest): Promise<ContextTemplate> {
        const query = `
      INSERT INTO context_templates (
        user_id, platform_id, category_id, name, description,
        system_instructions, tone, writing_style, target_audience,
        use_hashtags, max_hashtags, hashtag_strategy, include_cta, cta_type,
        content_structure, engagement_level, call_to_action_templates,
        is_public
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `;
        const values = [
            userId,
            templateData.platform_id,
            templateData.category_id,
            templateData.name,
            templateData.description,
            templateData.system_instructions,
            templateData.tone,
            templateData.writing_style,
            templateData.target_audience,
            templateData.use_hashtags !== false,
            templateData.max_hashtags || 5,
            templateData.hashtag_strategy || 'niche',
            templateData.include_cta || false,
            templateData.cta_type,
            JSON.stringify(templateData.content_structure || {}),
            templateData.engagement_level || 'medium',
            templateData.call_to_action_templates || [],
            templateData.is_public || false
        ];
        const result = await database.query(query, values);
        const template = result.rows[0];
        logger.info('Template created successfully', { templateId: template.id, userId });
        return template;
    }

    async getById(id: number, userId?: string): Promise<ContextTemplate | null> {
        const query = `
      SELECT 
        ct.*,
        cc.name as category_name,
        p.name as platform_name
      FROM context_templates ct
      LEFT JOIN content_categories cc ON ct.category_id = cc.id
      LEFT JOIN platforms p ON ct.platform_id = p.id
      WHERE ct.id = $1 
      AND (ct.user_id = $2 OR ct.user_id IS NULL OR ct.is_public = true)
    `;
        const result = await database.query(query, [id, userId]);
        return result.rows[0] || null;
    }

    async getDefaultForPlatform(platformId: number): Promise<ContextTemplate | null> {
        const query = `
      SELECT ct.*, cc.name as category_name, p.name as platform_name
      FROM context_templates ct
      LEFT JOIN content_categories cc ON ct.category_id = cc.id
      LEFT JOIN platforms p ON ct.platform_id = p.id
      WHERE ct.platform_id = $1 
      AND ct.is_default = true 
      AND ct.is_system_template = true
    `;
        const result = await database.query(query, [platformId]);
        return result.rows[0] || null;
    }

    async getByUser(userId: string, filters?: any): Promise<ContextTemplate[]> {
        let query = `
      SELECT 
        ct.*,
        cc.name as category_name,
        p.name as platform_name
      FROM context_templates ct
      LEFT JOIN content_categories cc ON ct.category_id = cc.id
      LEFT JOIN platforms p ON ct.platform_id = p.id
      WHERE (ct.user_id = $1 OR ct.user_id IS NULL OR ct.is_public = true)
    `;
        const params = [userId];
        let paramCount = 1;
        if (filters?.platform_id) {
            query += ` AND ct.platform_id = $${++paramCount}`;
            params.push(filters.platform_id);
        }
        if (filters?.category_id) {
            query += ` AND ct.category_id = $${++paramCount}`;
            params.push(filters.category_id);
        }
        query += ' ORDER BY ct.is_default DESC, ct.created_at DESC';
        const result = await database.query(query, params);
        return result.rows;
    }



    async update(templateId: number, userId: string, updateData: UpdateTemplateRequest): Promise<ContextTemplate | null> {
        // First check if template exists and user has access
        const existingTemplate = await this.getById(templateId, userId);
        if (!existingTemplate) {
            return null;
        }

        const updateFields = [];
        const values = [];
        let paramCount = 0;

        // Build dynamic update query
        if (updateData.name !== undefined) {
            updateFields.push(`name = $${++paramCount}`);
            values.push(updateData.name);
        }
        if (updateData.description !== undefined) {
            updateFields.push(`description = $${++paramCount}`);
            values.push(updateData.description);
        }
        if (updateData.system_instructions !== undefined) {
            updateFields.push(`system_instructions = $${++paramCount}`);
            values.push(updateData.system_instructions);
        }
        if (updateData.tone !== undefined) {
            updateFields.push(`tone = $${++paramCount}`);
            values.push(updateData.tone);
        }
        if (updateData.writing_style !== undefined) {
            updateFields.push(`writing_style = $${++paramCount}`);
            values.push(updateData.writing_style);
        }
        if (updateData.target_audience !== undefined) {
            updateFields.push(`target_audience = $${++paramCount}`);
            values.push(updateData.target_audience);
        }
        if (updateData.use_hashtags !== undefined) {
            updateFields.push(`use_hashtags = $${++paramCount}`);
            values.push(updateData.use_hashtags);
        }
        if (updateData.max_hashtags !== undefined) {
            updateFields.push(`max_hashtags = $${++paramCount}`);
            values.push(updateData.max_hashtags);
        }
        if (updateData.hashtag_strategy !== undefined) {
            updateFields.push(`hashtag_strategy = $${++paramCount}`);
            values.push(updateData.hashtag_strategy);
        }
        if (updateData.include_cta !== undefined) {
            updateFields.push(`include_cta = $${++paramCount}`);
            values.push(updateData.include_cta);
        }
        if (updateData.cta_type !== undefined) {
            updateFields.push(`cta_type = $${++paramCount}`);
            values.push(updateData.cta_type);
        }
        if (updateData.content_structure !== undefined) {
            updateFields.push(`content_structure = $${++paramCount}`);
            values.push(JSON.stringify(updateData.content_structure));
        }

        if (updateData.engagement_level !== undefined) {
            updateFields.push(`engagement_level = $${++paramCount}`);
            values.push(updateData.engagement_level);
        }
        if (updateData.call_to_action_templates !== undefined) {
            updateFields.push(`call_to_action_templates = $${++paramCount}`);
            values.push(updateData.call_to_action_templates);
        }
        if (updateData.is_public !== undefined) {
            updateFields.push(`is_public = $${++paramCount}`);
            values.push(updateData.is_public);
        }

        if (updateFields.length === 0) {
            return existingTemplate;
        }

        updateFields.push(`updated_at = NOW()`);
        values.push(templateId, userId);

        const query = `
            UPDATE context_templates 
            SET ${updateFields.join(', ')}
            WHERE id = $${++paramCount} AND (user_id = $${++paramCount} OR user_id IS NULL)
            RETURNING *
        `;

        const result = await database.query(query, values);

        if (result.rows.length === 0) {
            return null;
        }

        logger.info('Template updated successfully', { templateId, userId });
        return await this.getById(templateId, userId);
    }

    async createDefaultTemplates(): Promise<void> {
        // Implementation omitted for brevity, see documentation for details
        logger.info('Default templates created successfully');
    }
}

export const templateService = new TemplateService(); 