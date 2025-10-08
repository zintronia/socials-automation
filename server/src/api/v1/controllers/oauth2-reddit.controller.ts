import { Request, Response } from 'express';
import { oauth2RedditService } from '../../../integrations/social/Reddit/oauth2-reddit.service';
import { socialAccountService } from '../../../services/social-account.service';
import { respondWithSuccess, respondWithError } from '../../../utils/response.utils';
import { logger } from '../../../utils/logger.utils';
import { AuthenticatedRequest } from '../../../types';

export class OAuth2RedditController {
  /** Initiate OAuth 2.0 flow with PKCE (optional depending on app type) */
  async initiateAuth(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { callbackUrl, scopes } = req.body;
      if (!userId) return respondWithError(res, 'User not authenticated', 401);
      if (!callbackUrl) return respondWithError(res, 'callbackUrl is required', 400);

      // TODO: replace with correct platformId from your seed (mirroring LinkedIn pattern)
      const platformId = 3; // assuming Reddit id = 3

      const { url, state } = await oauth2RedditService.generateAuthUrl(
        userId,
        platformId,
        callbackUrl,
        scopes
      );

      return respondWithSuccess(
        res,
        { authUrl: url, state, platformId, scopes },
        'Reddit OAuth 2.0 URL generated successfully'
      );
    } catch (error) {
      logger.error('Error initiating Reddit OAuth 2.0:', error);
      return respondWithError(res, 'Failed to initiate Reddit authentication', 500);
    }
  }

  /** Handle OAuth 2.0 callback */
  async handleCallback(req: AuthenticatedRequest, res: Response) {
    try {
      const { code, state } = req.body;
      const userId = (req as any).user?.id;
      if (!userId) return respondWithError(res, 'User not authenticated', 401);
      if (!code || !state) return respondWithError(res, 'Authorization code and state are required', 400);

      const { account, userData } = await oauth2RedditService.handleCallback(code, state);

      return respondWithSuccess(
        res,
        {
          account: {
            id: account.id,
            account_name: account.account_name,
            account_username: account.account_username,
            profile_image_url: account.profile_image_url,
            is_verified: account.is_verified,
            connection_status: account.connection_status,
            platform_id: account.platform_id,
            created_at: account.created_at,
          },
          userData,
        },
        'Reddit account connected successfully'
      );
    } catch (error) {
      logger.error('Error handling Reddit OAuth 2.0 callback:', error);
      return respondWithError(res, 'Failed to complete Reddit authentication', 500);
    }
  }

  /** Get connected Reddit accounts for user */
  async getConnectedAccounts(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const platformId = 3;
      if (!userId) return respondWithError(res, 'User not authenticated', 401);

      const accounts = await socialAccountService.getActiveSocialAccounts(userId, platformId);
      const formatted = accounts.map((a: any) => ({
        id: a.id,
        account_name: a.account_name,
        account_username: a.account_username,
        profile_image_url: a.profile_image_url,
        is_verified: a.is_verified,
        connection_status: a.connection_status,
        follower_count: a.follower_count,
        following_count: a.following_count,
        oauth_version: a.oauth_version,
        token_expires_at: a.token_expires_at,
        last_sync_at: a.last_sync_at,
        created_at: a.created_at,
        platform_data: a.platform_data,
      }));

      return respondWithSuccess(res, formatted, 'Connected Reddit accounts retrieved successfully');
    } catch (error) {
      logger.error('Error getting connected Reddit accounts:', error);
      return respondWithError(res, 'Failed to get connected accounts', 500);
    }
  }

  /** Refresh access token for a specific account */
  async refreshToken(req: AuthenticatedRequest, res: Response) {
    try {
      const { accountId } = req.params;
      const userId = (req as any).user?.id;
      if (!userId) return respondWithError(res, 'User not authenticated', 401);

      const account = await socialAccountService.getSocialAccountById(accountId);
      if (!account || account.user_id !== userId) {
        return respondWithError(res, 'Account not found or access denied', 404);
      }

      const { accessToken, expiresIn } = await oauth2RedditService.refreshAccessToken(accountId);
      return respondWithSuccess(
        res,
        { accountId, expiresIn, expiresAt: new Date(Date.now() + expiresIn * 1000) },
        'Access token refreshed successfully'
      );
    } catch (error) {
      logger.error('Error refreshing Reddit access token:', error);
      return respondWithError(res, 'Failed to refresh access token', 500);
    }
  }

  /** Disconnect a Reddit account */
  async disconnectAccount(req: AuthenticatedRequest, res: Response) {
    try {
      const { accountId } = req.params;
      const userId = (req as any).user?.id;
      if (!userId) return respondWithError(res, 'User not authenticated', 401);

      const account = await socialAccountService.getSocialAccountById(accountId);
      if (!account || account.user_id !== userId) {
        return respondWithError(res, 'Account not found or access denied', 404);
      }

      await oauth2RedditService.disconnectAccount(accountId);
      return respondWithSuccess(res, null, 'Reddit account disconnected successfully');
    } catch (error) {
      logger.error('Error disconnecting Reddit account:', error);
      return respondWithError(res, 'Failed to disconnect Reddit account', 500);
    }
  }
}

export const oauth2RedditController = new OAuth2RedditController();
