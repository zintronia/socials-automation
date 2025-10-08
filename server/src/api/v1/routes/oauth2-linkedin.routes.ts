import { Router } from 'express';
import { oauth2LinkedInController } from '../controllers/oauth2-linkedin.controller';

const router = Router();


/**
 * POST /api/oauth2/linkedin/initiate
 * Initiate LinkedIn OAuth 2.0 with PKCE
 */
router.post('/initiate', (req, res) => oauth2LinkedInController.initiateAuth(req as any, res));

/**
 * POST /api/oauth2/linkedin/callback
 * Handle LinkedIn OAuth 2.0 callback
 */
router.post('/callback', (req, res) => oauth2LinkedInController.handleCallback(req as any, res));

/**
 * GET /api/oauth2/linkedin/accounts
 * Get connected LinkedIn accounts
 */
router.get('/accounts', (req, res) => oauth2LinkedInController.getConnectedAccounts(req as any, res));

/**
 * POST /api/oauth2/linkedin/accounts/:accountId/refresh
 * Refresh LinkedIn access token
 */
router.post('/accounts/:accountId/refresh', (req, res) => oauth2LinkedInController.refreshToken(req as any, res));

/**
 * DELETE /api/oauth2/linkedin/accounts/:accountId/disconnect
 * Disconnect LinkedIn account
 */
router.delete('/accounts/:accountId/disconnect', (req, res) => oauth2LinkedInController.disconnectAccount(req as any, res));

/**
 * GET /api/oauth2/linkedin/stats
 * Get LinkedIn account stats
 */
router.get('/stats', (req, res) => oauth2LinkedInController.getAccountStats(req as any, res));

export default router;
