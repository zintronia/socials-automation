import { Request, Response } from 'express';
import { oauth2TwitterService } from '../services/oauth2-twitter.service';
import { socialAccountService } from '../services/social-account.service';
import { respondWithSuccess, respondWithError } from '../utils/response.utils';
import { logger } from '../utils/logger.utils';

export class OAuth2TwitterController {
    /**
     * Initiate OAuth 2.0 flow with PKCE
     */
    async initiateAuth(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            const { callbackUrl, scopes } = req.body;
            if (!userId) {
                respondWithError(res, 'User not authenticated', 401);
                return;
            }

            if (!callbackUrl) {
                respondWithError(res, 'callbackUrl is required', 400);
                return;
            }

            // Get Twitter platform ID 
            const platformId = 1;

            // Generate OAuth 2.0 authorization URL with PKCE
            const { url, state } = await oauth2TwitterService.generateAuthUrl(
                userId,
                platformId,
                callbackUrl,
                scopes || ['tweet.read', 'tweet.write', 'users.read', 'offline.access']
            );

            respondWithSuccess(res, {
                authUrl: url,
                state,
                platformId,
                scopes: scopes || ['tweet.read', 'tweet.write', 'users.read', 'offline.access']
            }, 'Twitter OAuth 2.0 URL generated successfully');

            return;
        } catch (error) {
            logger.error('Error initiating Twitter OAuth 2.0:', error);
            respondWithError(res, 'Failed to initiate Twitter authentication', 500);
        }
    }

    /**
     * Handle OAuth 2.0 callback
     */
    async handleCallback(req: Request, res: Response) {
        try {
            const { code, state } = req.body;
            const userId = (req as any).user?.id;

            if (!userId) {
                respondWithError(res, 'User not authenticated', 401);
                return;
            }

            if (!code || !state) {
                respondWithError(res, 'Authorization code and state are required', 400);
                return;
            }

            // Handle the OAuth 2.0 callback
            const { account, userData } = await oauth2TwitterService.handleCallback(code, state);

            respondWithSuccess(res, {
                account: {
                    id: account.id,
                    account_name: account.account_name,
                    account_username: account.account_username,
                    profile_image_url: account.profile_image_url,
                    is_verified: account.is_verified,
                    connection_status: account.connection_status,
                    platform_id: account.platform_id,
                    created_at: account.created_at
                },
                userData: {
                    id: userData.id,
                    username: userData.username,
                    name: userData.name,
                    description: userData.description,
                    profileImageUrl: userData.profileImageUrl,
                    followersCount: userData.followersCount,
                    verified: userData.verified
                }
            }, 'Twitter account connected successfully');
        } catch (error) {
            logger.error('Error handling Twitter OAuth 2.0 callback:', error);
            respondWithError(res, 'Failed to complete Twitter authentication', 500);
        }
    }

    /**
     * Get connected Twitter accounts for user
     */
    async getConnectedAccounts(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            const platformId = 1; // Twitter platform ID

            if (!userId) {
                respondWithError(res, 'User not authenticated', 401);
                return;
            }

            const accounts = await socialAccountService.getActiveSocialAccounts(userId, platformId);

            const formattedAccounts = accounts.map((account: any) => ({
                id: account.id,
                account_name: account.account_name,
                account_username: account.account_username,
                profile_image_url: account.profile_image_url,
                is_verified: account.is_verified,
                connection_status: account.connection_status,
                follower_count: account.follower_count,
                following_count: account.following_count,
                oauth_version: account.oauth_version,
                token_expires_at: account.token_expires_at,
                last_sync_at: account.last_sync_at,
                created_at: account.created_at,
                platform_data: account.platform_data
            }));

            respondWithSuccess(res, formattedAccounts, 'Connected Twitter accounts retrieved successfully');
        } catch (error) {
            logger.error('Error getting connected Twitter accounts:', error);
            respondWithError(res, 'Failed to get connected accounts', 500);
        }
    }

    /**
     * Refresh access token for a specific account
     */
    async refreshToken(req: Request, res: Response) {
        try {
            const { accountId } = req.params;
            const userId = (req as any).user?.id;

            if (!userId) {
                respondWithError(res, 'User not authenticated', 401);
                return;
            }

            // Verify the account belongs to the user
            const account = await socialAccountService.getSocialAccountById(accountId);
            if (!account || account.user_id !== userId) {
                respondWithError(res, 'Account not found or access denied', 404);
                return;
            }

            // Refresh the access token
            const { accessToken, expiresIn } = await oauth2TwitterService.refreshAccessToken(accountId);

            respondWithSuccess(res, {
                accountId,
                expiresIn,
                expiresAt: new Date(Date.now() + expiresIn * 1000)
            }, 'Access token refreshed successfully');
        } catch (error) {
            logger.error('Error refreshing access token:', error);
            respondWithError(res, 'Failed to refresh access token', 500);
        }
    }

    /**
     * Disconnect a Twitter account
     */
    async disconnectAccount(req: Request, res: Response) {
        try {
            const { accountId } = req.params;
            const userId = (req as any).user?.id;

            if (!userId) {
                respondWithError(res, 'User not authenticated', 401);
                return;
            }

            // Verify the account belongs to the user
            const account = await socialAccountService.getSocialAccountById(accountId);
            if (!account || account.user_id !== userId) {
                respondWithError(res, 'Account not found or access denied', 404);
                return;
            }

            // Disconnect the account
            await oauth2TwitterService.disconnectAccount(accountId);

            respondWithSuccess(res, null, 'Twitter account disconnected successfully');
        } catch (error) {
            logger.error('Error disconnecting Twitter account:', error);
            respondWithError(res, 'Failed to disconnect Twitter account', 500);
        }
    }

    /**
     * Get account statistics
     */
    async getAccountStats(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;

            if (!userId) {
                respondWithError(res, 'User not authenticated', 401);
                return;
            }

            const stats = await socialAccountService.getAccountStats(userId);
            const twitterStats = stats.find((stat: any) => stat.platform_id === 1) || {
                platform_id: 1,
                total_accounts: 0,
                connected_accounts: 0,
                error_accounts: 0,
                expired_accounts: 0
            };

            respondWithSuccess(res, twitterStats, 'Account statistics retrieved successfully');
        } catch (error) {
            logger.error('Error getting account stats:', error);
            respondWithError(res, 'Failed to get account statistics', 500);
        }
    }

    /**
     * Validate OAuth state (for debugging/testing)
     */
    async validateState(req: Request, res: Response) {
        try {
            const { state } = req.params;
            const userId = (req as any).user?.id;

            if (!userId) {
                respondWithError(res, 'User not authenticated', 401);
                return;
            }

            const stateData = await oauth2TwitterService.validateState(state);

            if (!stateData) {
                respondWithError(res, 'Invalid or expired state', 400);
                return;
            }

            // Only allow validation if the state belongs to the current user
            if (stateData.userId !== userId) {
                respondWithError(res, 'State does not belong to current user', 403);
                return;
            }

            respondWithSuccess(res, {
                valid: true,
                userId: stateData.userId,
                platformId: stateData.platformId,
                callbackUrl: stateData.callbackUrl,
                scope: stateData.scope,
                createdAt: stateData.createdAt
            }, 'OAuth state is valid');
        } catch (error) {
            logger.error('Error validating OAuth state:', error);
            respondWithError(res, 'Failed to validate OAuth state', 500);
        }
    }

    /**
     * Get access token for a specific account (with automatic refresh)
     */
    async getAccessToken(req: Request, res: Response) {
        try {
            const { accountId } = req.params;
            const userId = (req as any).user?.id;

            if (!userId) {
                respondWithError(res, 'User not authenticated', 401);
                return;
            }

            // Verify the account belongs to the user
            const account = await socialAccountService.getSocialAccountById(accountId);
            if (!account || account.user_id !== userId) {
                respondWithError(res, 'Account not found or access denied', 404);
                return;
            }

            // Get the access token (with automatic refresh if needed)
            const accessToken = await oauth2TwitterService.getAccessToken(accountId);

            respondWithSuccess(res, {
                accountId,
                hasAccessToken: !!accessToken,
                tokenLength: accessToken ? accessToken.length : 0
            }, 'Access token retrieved successfully');
        } catch (error) {
            logger.error('Error getting access token:', error);
            respondWithError(res, 'Failed to get access token', 500);
        }
    }
}

export const oauth2TwitterController = new OAuth2TwitterController(); 