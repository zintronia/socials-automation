import { Request, Response } from 'express';
import { authService } from '../../../services/auth.service';
import { respondWithSuccess, respondWithError } from '../../../utils/response.utils';
import { logger } from '../../../utils/logger.utils';
import { AuthenticatedRequest } from '../../../types';

export class AuthController {
    async register(req: Request, res: Response): Promise<void> {
        try {
            const user = await authService.register(req.body);
            respondWithSuccess(res, user, 'User registered successfully', 201);
        } catch (error: any) {
            logger.error('Registration error:', error);
            respondWithError(res, error.message || 'Failed to register', 400);
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            const result = await authService.login(req.body);
            respondWithSuccess(res, result, 'Login successful');
        } catch (error: any) {
            logger.error('Login error:', error);
            respondWithError(res, error.message || 'Failed to login', 400);
        }
    }

    async refresh(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                respondWithError(res, 'Refresh token is required', 400);
                return;
            }

            const result = await authService.refreshToken(refreshToken);
            respondWithSuccess(res, result, 'Token refreshed successfully');
        } catch (error: any) {
            logger.error('Token refresh error:', error);
            respondWithError(res, error.message || 'Failed to refresh token', 401);
        }
    }

    async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // In a real implementation, you might want to blacklist the token
            // For now, we'll just return a success response
            respondWithSuccess(res, null, 'Logout successful');
        } catch (error: any) {
            logger.error('Logout error:', error);
            respondWithError(res, 'Failed to logout', 500);
        }
    }
}

export const authController = new AuthController(); 