import { Router } from 'express';
import { oauth2LinkedInController } from '../controllers/oauth2-linkedin.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * POST /api/oauth2/linkedin/initiate
 * Initiate LinkedIn OAuth 2.0 with PKCE
 */
router.post('/initiate', oauth2LinkedInController.initiateAuth);

/**
 * POST /api/oauth2/linkedin/callback
 * Handle LinkedIn OAuth 2.0 callback
 */
router.post('/callback', oauth2LinkedInController.handleCallback);

/**
 * GET /api/oauth2/linkedin/accounts
 * Get connected LinkedIn accounts
 */
router.get('/accounts', oauth2LinkedInController.getConnectedAccounts);

/**
 * POST /api/oauth2/linkedin/accounts/:accountId/refresh
 * Refresh LinkedIn access token
 */
router.post('/accounts/:accountId/refresh', oauth2LinkedInController.refreshToken);

/**
 * DELETE /api/oauth2/linkedin/accounts/:accountId/disconnect
 * Disconnect LinkedIn account
 */
router.delete('/accounts/:accountId/disconnect', oauth2LinkedInController.disconnectAccount);

/**
 * GET /api/oauth2/linkedin/stats
 * Get LinkedIn account stats
 */
router.get('/stats', oauth2LinkedInController.getAccountStats);

export default router;
