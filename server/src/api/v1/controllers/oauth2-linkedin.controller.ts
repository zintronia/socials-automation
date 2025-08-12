import { Request, Response } from 'express';
import { oauth2LinkedInService } from '../../../integrations/social/Likedin/oauth2-linkedin.service';
import { socialAccountService } from '../../../services/social-account.service';
import { respondWithSuccess, respondWithError } from '../../../utils/response.utils';
import { logger } from '../../../utils/logger.utils';

export class OAuth2LinkedInController {
  /** Initiate OAuth 2.0 flow with PKCE */
  async initiateAuth(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { callbackUrl, scopes } = req.body;

      if (!userId) return respondWithError(res, 'User not authenticated', 401);
      if (!callbackUrl) return respondWithError(res, 'callbackUrl is required', 400);

      // LinkedIn platform ID (ensure it matches your DB seed)
      const platformId = 2;

      const { url, state } = await oauth2LinkedInService.generateAuthUrl(
        userId,
        platformId,
        callbackUrl,
        scopes || ['r_liteprofile', 'r_emailaddress', 'w_member_social']
      );

      return respondWithSuccess(
        res,
        { authUrl: url, state, platformId, scopes: scopes || ['r_liteprofile', 'r_emailaddress', 'w_member_social'] },
        'LinkedIn OAuth 2.0 URL generated successfully'
      );
    } catch (error) {
      logger.error('Error initiating LinkedIn OAuth 2.0:', error);
      return respondWithError(res, 'Failed to initiate LinkedIn authentication', 500);
    }
  }

  /** Handle OAuth 2.0 callback */
  async handleCallback(req: Request, res: Response) {
    try {
      const { code, state } = req.body;
      const userId = (req as any).user?.id;

      if (!userId) return respondWithError(res, 'User not authenticated', 401);
      if (!code || !state) return respondWithError(res, 'Authorization code and state are required', 400);

      const { account, userData } = await oauth2LinkedInService.handleCallback(code, state);

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
        'LinkedIn account connected successfully'
      );
    } catch (error) {
      logger.error('Error handling LinkedIn OAuth 2.0 callback:', error);
      return respondWithError(res, 'Failed to complete LinkedIn authentication', 500);
    }
  }

  /** Get connected LinkedIn accounts for user */
  async getConnectedAccounts(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const platformId = 2;
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

      return respondWithSuccess(res, formatted, 'Connected LinkedIn accounts retrieved successfully');
    } catch (error) {
      logger.error('Error getting connected LinkedIn accounts:', error);
      return respondWithError(res, 'Failed to get connected accounts', 500);
    }
  }

  /** Refresh access token for a specific account */
  async refreshToken(req: Request, res: Response) {
    try {
      const { accountId } = req.params;
      const userId = (req as any).user?.id;
      if (!userId) return respondWithError(res, 'User not authenticated', 401);

      const account = await socialAccountService.getSocialAccountById(accountId);
      if (!account || account.user_id !== userId) {
        return respondWithError(res, 'Account not found or access denied', 404);
      }

      const { accessToken, expiresIn } = await oauth2LinkedInService.refreshAccessToken(accountId);
      return respondWithSuccess(
        res,
        { accountId, expiresIn, expiresAt: new Date(Date.now() + expiresIn * 1000) },
        'Access token refreshed successfully'
      );
    } catch (error) {
      logger.error('Error refreshing LinkedIn access token:', error);
      return respondWithError(res, 'Failed to refresh access token', 500);
    }
  }

  /** Disconnect a LinkedIn account */
  async disconnectAccount(req: Request, res: Response) {
    try {
      const { accountId } = req.params;
      const userId = (req as any).user?.id;
      if (!userId) return respondWithError(res, 'User not authenticated', 401);

      const account = await socialAccountService.getSocialAccountById(accountId);
      if (!account || account.user_id !== userId) {
        return respondWithError(res, 'Account not found or access denied', 404);
      }

      await oauth2LinkedInService.disconnectAccount(accountId);
      return respondWithSuccess(res, null, 'LinkedIn account disconnected successfully');
    } catch (error) {
      logger.error('Error disconnecting LinkedIn account:', error);
      return respondWithError(res, 'Failed to disconnect LinkedIn account', 500);
    }
  }

  /** Get account statistics for LinkedIn */
  async getAccountStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return respondWithError(res, 'User not authenticated', 401);

      const stats = await socialAccountService.getAccountStats(userId);
      const linkedinStats = stats.find((s: any) => s.platform_id === 2) || {
        platform_id: 2,
        total_accounts: 0,
        connected_accounts: 0,
        error_accounts: 0,
        expired_accounts: 0,
      };

      return respondWithSuccess(res, linkedinStats, 'Account statistics retrieved successfully');
    } catch (error) {
      logger.error('Error getting LinkedIn account stats:', error);
      return respondWithError(res, 'Failed to get account statistics', 500);
    }
  }
}

export const oauth2LinkedInController = new OAuth2LinkedInController();
