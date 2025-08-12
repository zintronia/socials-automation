import { Router } from 'express';
import { oauth2RedditController } from '../controllers/oauth2-reddit.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Initiate Reddit OAuth
router.post('/initiate', oauth2RedditController.initiateAuth);

// Handle Reddit OAuth callback
router.post('/callback', oauth2RedditController.handleCallback);

// Get connected Reddit accounts
router.get('/accounts', oauth2RedditController.getConnectedAccounts);

// Refresh Reddit access token for an account
router.post('/accounts/:accountId/refresh', oauth2RedditController.refreshToken);

// Disconnect a Reddit account
router.delete('/accounts/:accountId/disconnect', oauth2RedditController.disconnectAccount);

export default router;
