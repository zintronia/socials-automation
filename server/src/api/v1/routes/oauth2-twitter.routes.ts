import { Router } from 'express';
import { oauth2TwitterController } from '../controllers/oauth2-twitter.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /api/oauth2/twitter/initiate:
 *   post:
 *     summary: Initiate Twitter OAuth 2.0 flow with PKCE
 *     description: Generate OAuth 2.0 authorization URL with PKCE code challenge and state parameter for CSRF protection
 *     tags: [OAuth 2.0 Twitter]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - callbackUrl
 *             properties:
 *               callbackUrl:
 *                 type: string
 *                 description: The URL to redirect to after Twitter authorization
 *                 example: "https://yourapp.com/oauth/callback"
 *               scopes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: OAuth scopes to request
 *                 example: ["tweet.read", "tweet.write", "users.read", "offline.access"]
 *     responses:
 *       200:
 *         description: OAuth 2.0 authorization URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     authUrl:
 *                       type: string
 *                       description: Twitter OAuth 2.0 authorization URL
 *                       example: "https://twitter.com/oauth/authorize?response_type=code&client_id=...&redirect_uri=...&scope=...&state=...&code_challenge=...&code_challenge_method=S256"
 *                     state:
 *                       type: string
 *                       description: OAuth state parameter for CSRF protection
 *                       example: "abc123def456..."
 *                     platformId:
 *                       type: integer
 *                       description: Platform ID for Twitter
 *                       example: 1
 *                     scopes:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Requested OAuth scopes
 *                       example: ["tweet.read", "tweet.write", "users.read", "offline.access"]
 *                 message:
 *                   type: string
 *                   example: "Twitter OAuth 2.0 URL generated successfully"
 *       400:
 *         description: Missing callbackUrl parameter
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Failed to generate OAuth 2.0 URL
 */
router.post('/initiate', oauth2TwitterController.initiateAuth);

/**
 * @swagger
 * /api/oauth2/twitter/callback:
 *   post:
 *     summary: Handle Twitter OAuth 2.0 callback
 *     description: Exchange authorization code for access and refresh tokens using PKCE code verifier
 *     tags: [OAuth 2.0 Twitter]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - state
 *             properties:
 *               code:
 *                 type: string
 *                 description: Authorization code from Twitter
 *                 example: "abc123def456..."
 *               state:
 *                 type: string
 *                 description: OAuth state parameter for CSRF protection
 *                 example: "xyz789uvw012..."
 *     responses:
 *       200:
 *         description: Twitter account connected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     account:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: Social account ID
 *                         account_name:
 *                           type: string
 *                           description: Display name of the Twitter account
 *                         account_username:
 *                           type: string
 *                           description: Twitter username/handle
 *                         profile_image_url:
 *                           type: string
 *                           description: Profile image URL
 *                         is_verified:
 *                           type: boolean
 *                           description: Whether the account is verified
 *                         connection_status:
 *                           type: string
 *                           description: Connection status
 *                           example: "connected"
 *                         platform_id:
 *                           type: integer
 *                           description: Platform ID
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                           description: When the account was connected
 *                     userData:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: Twitter user ID
 *                         username:
 *                           type: string
 *                           description: Twitter username
 *                         name:
 *                           type: string
 *                           description: Display name
 *                         description:
 *                           type: string
 *                           description: User bio/description
 *                         profileImageUrl:
 *                           type: string
 *                           description: Profile image URL
 *                         followersCount:
 *                           type: integer
 *                           description: Number of followers
 *                         verified:
 *                           type: boolean
 *                           description: Whether the account is verified
 *                 message:
 *                   type: string
 *                   example: "Twitter account connected successfully"
 *       400:
 *         description: Missing required parameters or invalid state
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Failed to complete OAuth 2.0 flow
 */
router.post('/callback', oauth2TwitterController.handleCallback);

/**
 * @swagger
 * /api/oauth2/twitter/accounts:
 *   get:
 *     summary: Get connected Twitter accounts
 *     description: Retrieve all connected Twitter accounts for the authenticated user
 *     tags: [OAuth 2.0 Twitter]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of connected Twitter accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Social account ID
 *                       account_name:
 *                         type: string
 *                         description: Display name
 *                       account_username:
 *                         type: string
 *                         description: Twitter username
 *                       profile_image_url:
 *                         type: string
 *                         description: Profile image URL
 *                       is_verified:
 *                         type: boolean
 *                         description: Verification status
 *                       connection_status:
 *                         type: string
 *                         description: Connection status
 *                       follower_count:
 *                         type: integer
 *                         description: Number of followers
 *                       following_count:
 *                         type: integer
 *                         description: Number of following
 *                       oauth_version:
 *                         type: string
 *                         description: OAuth version used
 *                         example: "2.0"
 *                       token_expires_at:
 *                         type: string
 *                         format: date-time
 *                         description: When the access token expires
 *                       last_sync_at:
 *                         type: string
 *                         format: date-time
 *                         description: Last sync timestamp
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         description: When the account was connected
 *                       platform_data:
 *                         type: object
 *                         description: Platform-specific data
 *                 message:
 *                   type: string
 *                   example: "Connected Twitter accounts retrieved successfully"
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Failed to get connected accounts
 */
router.get('/accounts', oauth2TwitterController.getConnectedAccounts);

/**
 * @swagger
 * /api/oauth2/twitter/accounts/{accountId}/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Refresh the access token for a specific Twitter account using the refresh token
 *     tags: [OAuth 2.0 Twitter]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: Social account ID
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     accountId:
 *                       type: string
 *                       description: Social account ID
 *                     expiresIn:
 *                       type: integer
 *                       description: Token expiry time in seconds
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       description: When the token expires
 *                 message:
 *                   type: string
 *                   example: "Access token refreshed successfully"
 *       401:
 *         description: User not authenticated
 *       404:
 *         description: Account not found or access denied
 *       500:
 *         description: Failed to refresh access token
 */
router.post('/accounts/:accountId/refresh', oauth2TwitterController.refreshToken);

/**
 * @swagger
 * /api/oauth2/twitter/accounts/{accountId}/disconnect:
 *   delete:
 *     summary: Disconnect Twitter account
 *     description: Disconnect and remove a connected Twitter account, revoking access tokens
 *     tags: [OAuth 2.0 Twitter]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: Social account ID to disconnect
 *     responses:
 *       200:
 *         description: Twitter account disconnected successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: User not authenticated
 *       404:
 *         description: Account not found or access denied
 *       500:
 *         description: Failed to disconnect Twitter account
 */
router.delete('/accounts/:accountId/disconnect', oauth2TwitterController.disconnectAccount);

/**
 * @swagger
 * /api/oauth2/twitter/stats:
 *   get:
 *     summary: Get Twitter account statistics
 *     description: Get statistics about connected Twitter accounts for the user
 *     tags: [OAuth 2.0 Twitter]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     platform_id:
 *                       type: integer
 *                       description: Platform ID for Twitter
 *                       example: 1
 *                     total_accounts:
 *                       type: integer
 *                       description: Total number of Twitter accounts
 *                       example: 3
 *                     connected_accounts:
 *                       type: integer
 *                       description: Number of connected accounts
 *                       example: 2
 *                     error_accounts:
 *                       type: integer
 *                       description: Number of accounts with errors
 *                       example: 1
 *                     expired_accounts:
 *                       type: integer
 *                       description: Number of accounts with expired tokens
 *                       example: 0
 *                 message:
 *                   type: string
 *                   example: "Account statistics retrieved successfully"
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Failed to get account statistics
 */
router.get('/stats', oauth2TwitterController.getAccountStats);

/**
 * @swagger
 * /api/oauth2/twitter/state/{state}/validate:
 *   get:
 *     summary: Validate OAuth state (Debug)
 *     description: Validate an OAuth state parameter (for debugging and testing purposes)
 *     tags: [OAuth 2.0 Twitter]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *         description: OAuth state parameter to validate
 *     responses:
 *       200:
 *         description: OAuth state is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     valid:
 *                       type: boolean
 *                       description: Whether the state is valid
 *                       example: true
 *                     userId:
 *                       type: string
 *                       description: User ID associated with the state
 *                     platformId:
 *                       type: integer
 *                       description: Platform ID
 *                     callbackUrl:
 *                       type: string
 *                       description: Callback URL
 *                     scope:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: OAuth scopes
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: When the state was created
 *                 message:
 *                   type: string
 *                   example: "OAuth state is valid"
 *       400:
 *         description: Invalid or expired state
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: State does not belong to current user
 *       500:
 *         description: Failed to validate OAuth state
 */
router.get('/state/:state/validate', oauth2TwitterController.validateState);

/**
 * @swagger
 * /api/oauth2/twitter/accounts/{accountId}/token:
 *   get:
 *     summary: Get access token (Debug)
 *     description: Get the access token for a specific account (with automatic refresh if needed)
 *     tags: [OAuth 2.0 Twitter]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: Social account ID
 *     responses:
 *       200:
 *         description: Access token retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     accountId:
 *                       type: string
 *                       description: Social account ID
 *                     hasAccessToken:
 *                       type: boolean
 *                       description: Whether access token is available
 *                       example: true
 *                     tokenLength:
 *                       type: integer
 *                       description: Length of the access token
 *                       example: 50
 *                 message:
 *                   type: string
 *                   example: "Access token retrieved successfully"
 *       401:
 *         description: User not authenticated
 *       404:
 *         description: Account not found or access denied
 *       500:
 *         description: Failed to get access token
 */
router.get('/accounts/:accountId/token', oauth2TwitterController.getAccessToken);

export default router; 