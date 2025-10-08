import { Router } from 'express';
import { oauth2RedditController } from '../controllers/oauth2-reddit.controller';

const router = Router();

// Authentication is handled by requireAuth() in app.ts

// Initiate Reddit OAuth
router.post('/initiate', (req, res) => oauth2RedditController.initiateAuth(req as any, res));

// Handle Reddit OAuth callback
router.post('/callback', (req, res) => oauth2RedditController.handleCallback(req as any, res));

// Get connected Reddit accounts
router.get('/accounts', (req, res) => oauth2RedditController.getConnectedAccounts(req as any, res));

// Refresh Reddit access token for an account
router.post('/accounts/:accountId/refresh', (req, res) => oauth2RedditController.refreshToken(req as any, res));

// Disconnect a Reddit account
router.delete('/accounts/:accountId/disconnect', (req, res) => oauth2RedditController.disconnectAccount(req as any, res));

export default router;
