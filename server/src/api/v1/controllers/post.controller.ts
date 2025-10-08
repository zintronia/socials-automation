import { Request, Response } from 'express';
import { postService } from '../../../services/post.service';
import { respondWithSuccess, respondWithError } from '../../../utils/response.utils';
import { logger } from '../../../utils/logger.utils';
import { AuthenticatedRequest } from '../../../types';

export class PostController {
    async generatePost(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user.id;
            const { context_id, platform_id, campaign_id, scheduled_for, prompt, social_account_ids } = req.body;
            const post = await postService.generateAndCreate(userId, {
                context_id,
                platform_id,
                campaign_id,
                scheduled_for: scheduled_for ? new Date(scheduled_for) : undefined,
                prompt,
                social_account_ids
            });
            
            // If social accounts are provided, link them to the post
            if (social_account_ids && Array.isArray(social_account_ids) && social_account_ids.length > 0) {
                await postService.linkPostToSocialAccounts(post.id, social_account_ids, userId);
                
                // If scheduled_for is provided, schedule the post
                if (scheduled_for) {
                    await postService.schedulePost(post.id, userId, new Date(scheduled_for), social_account_ids);
                }
            }
            
            // Return the post with linked accounts
            const updatedPost = await postService.getById(post.id, userId);
            respondWithSuccess(res, updatedPost, 'Post generated successfully', 201);
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
                platforms: Array<{ platform_id: number; scheduled_for?: string | Date; template_id?: number; social_account_ids?: number[] }>;
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
                        social_account_ids: item.social_account_ids,
                        scheduled_for: item.scheduled_for ? new Date(item.scheduled_for) : undefined,
                    });
                    
                    // Link social accounts if provided
                    if (item.social_account_ids && Array.isArray(item.social_account_ids) && item.social_account_ids.length > 0) {
                        await postService.linkPostToSocialAccounts(post.id, item.social_account_ids, userId);
                        
                        // Schedule if needed
                        if (item.scheduled_for) {
                            await postService.schedulePost(post.id, userId, new Date(item.scheduled_for), item.social_account_ids);
                        }
                    }
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
            const { scheduled_for, social_account_ids } = req.body;
            if (!scheduled_for) {
                respondWithError(res, 'scheduled_for is required', 400);
                return;
            }
            const post = await postService.schedulePost(postId, userId, new Date(scheduled_for), social_account_ids);
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
            const { social_account_id } = req.body; // Optional: publish to specific account
            const post = await postService.publishPost(postId, userId, social_account_id);
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

    // New methods for post-account management
    async linkSocialAccounts(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user.id;
            const postId = parseInt(req.params.id);
            const { social_account_ids } = req.body;
            
            if (!Array.isArray(social_account_ids) || social_account_ids.length === 0) {
                respondWithError(res, 'social_account_ids must be a non-empty array', 400);
                return;
            }
            
            const postAccounts = await postService.linkPostToSocialAccounts(postId, social_account_ids, userId);
            respondWithSuccess(res, postAccounts, 'Social accounts linked successfully');
        } catch (error: any) {
            logger.error('Link social accounts error:', error);
            respondWithError(res, error.message || 'Failed to link social accounts', 400);
        }
    }

    async unlinkSocialAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user.id;
            const postId = parseInt(req.params.id);
            const socialAccountId = parseInt(req.params.accountId);
            
            const success = await postService.unlinkPostFromSocialAccount(postId, socialAccountId, userId);
            if (success) {
                respondWithSuccess(res, null, 'Social account unlinked successfully');
            } else {
                respondWithError(res, 'Social account not found or already unlinked', 404);
            }
        } catch (error: any) {
            logger.error('Unlink social account error:', error);
            respondWithError(res, error.message || 'Failed to unlink social account', 400);
        }
    }

    async getPostAccounts(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user.id;
            const postId = parseInt(req.params.id);
            
            const postAccounts = await postService.getPostAccounts(postId, userId);
            respondWithSuccess(res, postAccounts, 'Post accounts retrieved successfully');
        } catch (error: any) {
            logger.error('Get post accounts error:', error);
            respondWithError(res, error.message || 'Failed to retrieve post accounts', 400);
        }
    }
}

export const postController = new PostController();