import { Router } from 'express';
import { socialAccountController } from '../controllers/social-account.controller';

const router = Router();


/**
 * @swagger
 * /api/social-accounts/connect:
 *   post:
 *     summary: Connect a social media account
 *     description: Connect a social media account using OAuth tokens
 *     tags: [Social Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - platformId
 *               - accountId
 *               - accountName
 *               - accessToken
 *             properties:
 *               platformId:
 *                 type: integer
 *                 description: ID of the platform (e.g., 1 for Twitter, 2 for LinkedIn)
 *               accountId:
 *                 type: string
 *                 description: The unique ID of the account from the social platform
 *               accountName:
 *                 type: string
 *                 description: Display name of the account
 *               accessToken:
 *                 type: string
 *                 description: OAuth access token
 *               refreshToken:
 *                 type: string
 *                 description: OAuth refresh token (if available)
 *               metadata:
 *                 type: object
 *                 description: Additional metadata about the account
 *     responses:
 *       200:
 *         description: Account connected successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/connect', (req, res) => socialAccountController.connectAccount(req as any, res));

/**
 * @swagger
 * /api/social-accounts:
 *   get:
 *     summary: Get connected social accounts
 *     description: Retrieve all connected social accounts for the authenticated user
 *     tags: [Social Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: platformId
 *         schema:
 *           type: integer
 *         description: Filter accounts by platform ID
 *     responses:
 *       200:
 *         description: List of connected accounts
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', (req, res) => socialAccountController.getAccounts(req as any, res));

/**
 * @swagger
 * /api/social-accounts/{id}:
 *   get:
 *     summary: Get a specific connected account
 *     description: Retrieve details of a specific connected social account
 *     tags: [Social Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Social account ID
 *     responses:
 *       200:
 *         description: Account details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Account not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', (req, res) => socialAccountController.getAccount(req as any, res));

/**
 * @swagger
 * /api/social-accounts/{id}:
 *   delete:
 *     summary: Disconnect a social account
 *     description: Disconnect and remove a connected social account
 *     tags: [Social Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Social account ID to disconnect
 *     responses:
 *       200:
 *         description: Account disconnected successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Account not found or access denied
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', (req, res) => socialAccountController.disconnectAccount(req as any, res));

export default router;
