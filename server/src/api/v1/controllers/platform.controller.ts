import { Request, Response } from 'express';
import { platformService } from '../../../services/platform.service';
import { respondWithSuccess, respondWithError } from '../../../utils/response.utils';
import { logger } from '../../../utils/logger.utils';

export class PlatformController {
    async getById(req: Request, res: Response): Promise<void> {
        try {
            const platformId = parseInt(req.params.id);
            const platform = await platformService.getById(platformId);
            if (!platform) {
                respondWithError(res, 'Platform not found', 404);
                return;
            }
            respondWithSuccess(res, platform, 'Platform retrieved successfully');
        } catch (error) {
            logger.error('Platform retrieval error:', error);
            respondWithError(res, 'Failed to retrieve platform', 500);
        }
    }

    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const platforms = await platformService.getAll();
            respondWithSuccess(res, platforms, 'Platforms retrieved successfully');
        } catch (error) {
            logger.error('Platforms retrieval error:', error);
            respondWithError(res, 'Failed to retrieve platforms', 500);
        }
    }
}

export const platformController = new PlatformController(); 