import { Request, Response } from 'express';
import { contextService } from '../services/context.service';
import { respondWithSuccess, respondWithError } from '../utils/response.utils';
import { logger } from '../utils/logger.utils';
import { AuthenticatedRequest } from '../types';

/**
 * Controller for handling context-related HTTP requests
 * Handles CRUD operations for user contexts
 */
export class ContextController {
    /**
     * Create a new context
     */
    async create(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user.id;
            const context = await contextService.create(userId, req.body);
            respondWithSuccess(res, context, 'Context created successfully', 201);
        } catch (error) {
            logger.error('Context creation error:', error);
            respondWithError(res, 'Failed to create context', 400);
        }
    }

    /**
     * Get a single context by ID
     */
    async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user.id;
            const contextId = parseInt(req.params.id);

            if (isNaN(contextId)) {
                respondWithError(res, 'Invalid context ID', 400);
                return;
            }

            const context = await contextService.getById(contextId, userId);
            if (!context) {
                respondWithError(res, 'Context not found', 404);
                return;
            }

            respondWithSuccess(res, context, 'Context retrieved successfully');
        } catch (error) {
            logger.error('Context retrieval error:', error);
            respondWithError(res, 'Failed to retrieve context', 500);
        }
    }

    /**
     * Get all contexts for the authenticated user
     * Optional query params:
     * - type: Filter by context type
     * - limit: Limit the number of results
     */
    async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user.id;
            const filters = {
                type: req.query.type as string | undefined,
                limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
            };

            // Validate limit parameter
            if (filters.limit && isNaN(filters.limit)) {
                respondWithError(res, 'Invalid limit parameter', 400);
                return;
            }

            const contexts = await contextService.getByUser(userId, filters);
            respondWithSuccess(res, contexts, 'Contexts retrieved successfully');
        } catch (error) {
            logger.error('Contexts retrieval error:', error);
            respondWithError(res, 'Failed to retrieve contexts', 500);
        }
    }

    /**
     * Update an existing context
     * Only allows updating specific fields defined in the service
     */
    async update(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user.id;
            const contextId = parseInt(req.params.id);

            if (isNaN(contextId)) {
                respondWithError(res, 'Invalid context ID', 400);
                return;
            }

            // Only include allowed fields in the update
            const allowedFields = ['title', 'topic', 'brief', 'content', 'source', 'type', 'mimetype', 'size'];
            const updateData = Object.keys(req.body)
                .filter(key => allowedFields.includes(key))
                .reduce((obj, key) => {
                    obj[key] = req.body[key];
                    return obj;
                }, {} as Record<string, any>);

            if (Object.keys(updateData).length === 0) {
                respondWithError(res, 'No valid fields provided for update', 400);
                return;
            }

            const context = await contextService.update(contextId, userId, updateData);
            respondWithSuccess(res, context, 'Context updated successfully');
        } catch (error: any) {
            logger.error('Context update error:', error);
            const statusCode = error.message.includes('not found') ? 404 : 400;
            respondWithError(res, error.message || 'Failed to update context', statusCode);
        }
    }

    /**
     * Delete a context
     */
    async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user.id;
            const contextId = parseInt(req.params.id);

            if (isNaN(contextId)) {
                respondWithError(res, 'Invalid context ID', 400);
                return;
            }

            const deleted = await contextService.delete(contextId, userId);
            if (!deleted) {
                respondWithError(res, 'Context not found', 404);
                return;
            }

            respondWithSuccess(res, null, 'Context deleted successfully');
        } catch (error) {
            logger.error('Context deletion error:', error);
            respondWithError(res, 'Failed to delete context', 500);
        }
    }
}

export const contextController = new ContextController();