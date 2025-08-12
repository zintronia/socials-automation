import { Request, Response } from 'express';
import { postService } from '../../../services/post.service';
import { respondWithSuccess, respondWithError } from '../../../utils/response.utils';
import { logger } from '../../../utils/logger.utils';
import { AuthenticatedRequest } from '../../../types';

export class PostController {
    async generatePost(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user.id;
            const { context_id, platform_id, campaign_id, scheduled_for, prompt, social_account_id } = req.body;
            const post = await postService.generateAndCreate(userId, {
                context_id,
                platform_id,
                campaign_id,
                scheduled_for: scheduled_for ? new Date(scheduled_for) : undefined,
                prompt,
                social_account_id
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

    async generateBulkPosts(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user.id;
            const { context_id, campaign_id, platforms, prompt } = req.body as {
                context_id?: number;
                campaign_id?: number;
                prompt: string;
                platforms: Array<{ platform_id: number; scheduled_for?: string | Date; template_id?: number; social_account_id?: number }>;
            };

            if (!Array.isArray(platforms) || platforms.length === 0) {
                respondWithError(res, 'platforms must be a non-empty array', 400);
                return;
            }

            const results: any[] = [];
            const errors: Array<{ index: number; platform_id: number; error: string }> = [];

            for (let i = 0; i < platforms.length; i++) {
                const item = platforms[i];
                try {
                    const post = await postService.generateAndCreate(userId, {
                        context_id,
                        platform_id: item.platform_id,
                        template_id: item.template_id,
                        campaign_id,
                        prompt,
                        social_account_id: item.social_account_id,
                        scheduled_for: item.scheduled_for ? new Date(item.scheduled_for) : undefined,
                    });
                    results.push(post);
                } catch (error: any) {
                    logger.error('Bulk post generation platform item failed', { index: i, platform_id: item.platform_id, error });
                    errors.push({ index: i, platform_id: item.platform_id, error: error?.message || 'Generation failed' });
                }
            }

            const message = errors.length === 0 ? 'All posts generated successfully' : 'Some posts failed to generate';
            respondWithSuccess(res, { results, errors }, message, 201);
        } catch (error: any) {
            logger.error('Bulk post generation error:', error);
            respondWithError(res, error.message || 'Failed to generate posts in bulk', 400);
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
            const userId = req.user.id;
            const postId = parseInt(req.params.id);
            const post = await postService.publishPost(postId, userId);
            respondWithSuccess(res, post, 'Post published successfully');
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