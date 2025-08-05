import { Request, Response } from 'express';
import { templateService } from '../services/template.service';
import { respondWithSuccess, respondWithError } from '../utils/response.utils';
import { logger } from '../utils/logger.utils';
import { AuthenticatedRequest } from '../types';

export class TemplateController {
    async create(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user.id;
            const template = await templateService.create(userId, req.body);
            respondWithSuccess(res, template, 'Template created successfully', 201);
        } catch (error) {
            logger.error('Template creation error:', error);
            respondWithError(res, 'Failed to create template', 400);
        }
    }

    async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user.id;
            const templateId = parseInt(req.params.id);
            const template = await templateService.getById(templateId, userId);
            if (!template) {
                respondWithError(res, 'Template not found', 404);
                return;
            }
            respondWithSuccess(res, template, 'Template retrieved successfully');
        } catch (error) {
            logger.error('Template retrieval error:', error);
            respondWithError(res, 'Failed to retrieve template', 500);
        }
    }

    async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user.id;
            const filters = {
                platform_id: req.query.platform_id ? parseInt(req.query.platform_id as string) : undefined,
                category_id: req.query.category_id ? parseInt(req.query.category_id as string) : undefined
            };
            const templates = await templateService.getByUser(userId, filters);
            respondWithSuccess(res, templates, 'Templates retrieved successfully');
        } catch (error) {
            logger.error('Templates retrieval error:', error);
            respondWithError(res, 'Failed to retrieve templates', 500);
        }
    }

    async update(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user.id;
            const templateId = parseInt(req.params.id);
            const template = await templateService.update(templateId, userId, req.body);
            if (!template) {
                respondWithError(res, 'Template not found', 404);
                return;
            }
            respondWithSuccess(res, template, 'Template updated successfully');
        } catch (error) {
            logger.error('Template update error:', error);
            respondWithError(res, 'Failed to update template', 500);
        }
    }

    async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // Implement delete logic if needed
            respondWithSuccess(res, null, 'Delete not implemented');
        } catch (error) {
            logger.error('Template deletion error:', error);
            respondWithError(res, 'Failed to delete template', 500);
        }
    }
}

export const templateController = new TemplateController(); 