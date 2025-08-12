import { Request, Response } from 'express';
import { campaignService } from '../../../services/campaign.service';
import { respondWithSuccess, respondWithError } from '../../../utils/response.utils';
import { logger } from '../../../utils/logger.utils';
import { AuthenticatedRequest } from '../../../types';

export class CampaignController {
    createCampaign = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user.id;
            const { title, description } = req.body;

            const campaign = await campaignService.create(userId, {
                title,
                description
            });

            respondWithSuccess(res, campaign, 'Campaign created successfully', 201);
        } catch (error: any) {
            logger.error('Campaign creation error:', error);
            respondWithError(res, error.message || 'Failed to create campaign', 400);
        }
    }

    getCampaignById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user.id;
            const campaignId = parseInt(req.params.id);

            if (isNaN(campaignId)) {
                respondWithError(res, 'Invalid campaign ID', 400);
                return;
            }

            const campaign = await campaignService.getById(campaignId, userId);

            if (!campaign) {
                respondWithError(res, 'Campaign not found', 404);
                return;
            }

            respondWithSuccess(res, campaign, 'Campaign retrieved successfully');
        } catch (error: any) {
            logger.error('Campaign retrieval error:', error);
            respondWithError(res, error.message || 'Failed to retrieve campaign', 500);
        }
    }

    getAllCampaigns = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user.id;
            const filters = {
                page: req.query.page ? parseInt(req.query.page as string) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
                search: req.query.search as string
            };

            const campaigns = await campaignService.getByUser(userId, filters);
            respondWithSuccess(res, campaigns, 'Campaigns retrieved successfully');
        } catch (error: any) {
            logger.error('Campaigns retrieval error:', error);
            respondWithError(res, error.message || 'Failed to retrieve campaigns', 500);
        }
    }

    updateCampaign = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user.id;
            const campaignId = parseInt(req.params.id);
            const { title, description } = req.body;

            if (isNaN(campaignId)) {
                respondWithError(res, 'Invalid campaign ID', 400);
                return;
            }

            const campaign = await campaignService.update(campaignId, userId, {
                title,
                description
            });

            respondWithSuccess(res, campaign, 'Campaign updated successfully');
        } catch (error: any) {
            logger.error('Campaign update error:', error);
            respondWithError(res, error.message || 'Failed to update campaign', 400);
        }
    }

    deleteCampaign = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user.id;
            const campaignId = parseInt(req.params.id);

            if (isNaN(campaignId)) {
                respondWithError(res, 'Invalid campaign ID', 400);
                return;
            }

            await campaignService.delete(campaignId, userId);
            respondWithSuccess(res, null, 'Campaign deleted successfully', 204);
        } catch (error: any) {
            logger.error('Campaign deletion error:', error);
            respondWithError(res, error.message || 'Failed to delete campaign', 400);
        }
    }

    getCampaignStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user.id;
            const stats = await campaignService.getCampaignStats(userId);
            respondWithSuccess(res, stats, 'Campaign statistics retrieved successfully');
        } catch (error: any) {
            logger.error('Campaign stats retrieval error:', error);
            respondWithError(res, error.message || 'Failed to retrieve campaign statistics', 500);
        }
    }
}

export const campaignController = new CampaignController();
