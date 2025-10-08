import { Request, Response, NextFunction } from 'express';
import { getAuth, requireAuth } from '@clerk/express';
import { userService } from '../../../services/user.service';
import { respondWithError } from '../../../utils/response.utils';
import { logger } from '../../../utils/logger.utils';

export const clerkAuthMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // First, ensure user is authenticated with Clerk
        const auth = getAuth(req);
        
        if (!auth.userId) {
            respondWithError(res, 'Unauthorized - Authentication required', 401);
            return;
        }

        const clerkUserId = auth.userId;

        // Check if user exists in our database
        const user = await userService.findUserByClerkId(clerkUserId);
        
        if (!user) {
            respondWithError(res, 'User not found in database', 404);
            return;
        }

        // Set user data on request object
        (req as any).user = {
            id: clerkUserId, 
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            profile_image_url: user.profile_image_url,
            created_at: user.created_at,
            updated_at: user.updated_at
        };

        (req as any).userId = clerkUserId;

        logger.debug('User authenticated successfully', { 
            clerkUserId, 
            email: user.email 
        });

        next();
    } catch (error) {
        logger.error('Clerk auth middleware error:', error);
        respondWithError(res, 'Authentication error', 500);
    }
};

