import { Request, Response } from 'express';
import { postService } from '../services/post.service';
import { respondWithSuccess, respondWithError } from '../utils/response.utils';
import { logger } from '../utils/logger.utils';
import { AuthenticatedRequest } from '../types';

export class PostController {
    async generatePost(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user.id;
            const { context_id, platform_id, campaign_id, scheduled_for } = req.body;
            const post = await postService.generateAndCreate(userId, {
                context_id,
                platform_id,
                campaign_id,
                scheduled_for: scheduled_for ? new Date(scheduled_for) : undefined
            });
            respondWithSuccess(res, post, 'Post generated successfully', 201);
        } catch (error: any) {
            logger.error('Post generation error:', error);
            respondWithError(res, error.message || 'Failed to generate post', 400);
        }
    }

    async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user.id;
            const filters = {
                status: req.query.status as string,
                platform_id: req.query.platform_id ? parseInt(req.query.platform_id as string) : undefined,
                campaign_id: req.query.campaign_id ? parseInt(req.query.campaign_id as string) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 50
            };
            const posts = await postService.getByUser(userId, filters);
            respondWithSuccess(res, posts, 'Posts retrieved successfully');
        } catch (error) {
            logger.error('Posts retrieval error:', error);
            respondWithError(res, 'Failed to retrieve posts', 500);
        }
    }

    async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user.id;
            const postId = parseInt(req.params.id);
            const post = await postService.getById(postId, userId);
            if (!post) {
                respondWithError(res, 'Post not found', 404);
                return;
            }
            respondWithSuccess(res, post, 'Post retrieved successfully');
        } catch (error) {
            logger.error('Post retrieval error:', error);
            respondWithError(res, 'Failed to retrieve post', 500);
        }
    }

    async update(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // Implement update logic if needed
            respondWithSuccess(res, null, 'Update not implemented');
        } catch (error: any) {
            logger.error('Post update error:', error);
            respondWithError(res, error.message || 'Failed to update post', 400);
        }
    }

    async schedule(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user.id;
            const postId = parseInt(req.params.id);
            const { scheduled_for } = req.body;
            if (!scheduled_for) {
                respondWithError(res, 'scheduled_for is required', 400);
                return;
            }
            const post = await postService.schedulePost(postId, userId, new Date(scheduled_for));
            respondWithSuccess(res, post, 'Post scheduled successfully');
        } catch (error: any) {
            logger.error('Post scheduling error:', error);
            respondWithError(res, error.message || 'Failed to schedule post', 400);
        }
    }

    async publish(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // Implement publish logic if needed
            respondWithSuccess(res, null, 'Publish not implemented');
        } catch (error: any) {
            logger.error('Post publishing error:', error);
            respondWithError(res, error.message || 'Failed to publish post', 400);
        }
    }

    async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // Implement delete logic if needed
            respondWithSuccess(res, null, 'Delete not implemented');
        } catch (error) {
            logger.error('Post deletion error:', error);
            respondWithError(res, 'Failed to delete post', 500);
        }
    }
}

export const postController = new PostController(); 