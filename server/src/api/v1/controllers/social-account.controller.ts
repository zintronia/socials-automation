import { Request, Response } from 'express';
import { socialAccountService } from '../../../services/social-account.service';
import { respondWithSuccess, respondWithError } from '../../../utils/response.utils';
import { logger } from '../../../utils/logger.utils';

export class SocialAccountController {
  async connectAccount(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id; // Assuming user is authenticated and user ID is in the request
      const { platformId, accountId, accountName, accessToken, refreshToken, platform_data } = req.body;

      if (!userId || !platformId || !accountId || !accountName || !accessToken) {
        respondWithError(res, 'Missing required fields', 400);
        return;
      }

      // Check if account already exists for this user and platform
      const existingAccount = await socialAccountService.getSocialAccountByPlatform(
        userId,
        platformId,
        accountId
      );

      let account;

      if (existingAccount) {
        // Update existing account
        account = await socialAccountService.updateSocialAccount(existingAccount.id, {
          account_name: accountName,
          access_token: accessToken,
          refresh_token: refreshToken,
          token_expires_at: platform_data?.expires_in
            ? new Date(Date.now() + (parseInt(platform_data.expires_in) * 1000))
            : undefined,
          is_active: true,
          last_sync_at: new Date(),
          platform_data
        });
      } else {
        // Create new account
        account = await socialAccountService.createSocialAccount({
          user_id: userId,
          platform_id: platformId,
          account_id: accountId,
          account_name: accountName,
          access_token: accessToken,
          refresh_token: refreshToken,
          token_expires_at: platform_data?.expires_in
            ? new Date(Date.now() + (parseInt(platform_data.expires_in) * 1000))
            : undefined,
          is_active: true,
          platform_data
        });
      }

      respondWithSuccess(res, account, 'Account connected successfully');
    } catch (error) {
      logger.error('Error connecting account:', error);
      respondWithError(res, 'Failed to connect account', 500);
    }
  }

  async getAccounts(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { platformId } = req.query;

      if (!userId) {
        respondWithError(res, 'Unauthorized', 401);
        return;
      }

      let accounts = await socialAccountService.getSocialAccountsByUser(userId);

      if (platformId) {
        accounts = accounts.filter((account: { platform_id: number }) => account.platform_id === parseInt(platformId as string));
      }

      respondWithSuccess(res, accounts, 'Accounts retrieved successfully');
    } catch (error) {
      logger.error('Error getting accounts:', error);
      respondWithError(res, 'Failed to get accounts', 500);
    }
  }

  async getAccount(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const account = await socialAccountService.getSocialAccountById(id);

      if (!account) {
        respondWithError(res, 'Account not found', 404);
        return;
      }

      respondWithSuccess(res, account, 'Account retrieved successfully');
    } catch (error) {
      logger.error('Error getting account:', error);
      respondWithError(res, 'Failed to get account', 500);
    }
  }

  async disconnectAccount(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        respondWithError(res, 'Unauthorized', 401);
        return;
      }

      // Verify the account belongs to the user
      const account = await socialAccountService.getSocialAccountById(id);
      if (!account || account.user_id !== userId) {
        respondWithError(res, 'Account not found or access denied', 404);
        return;
      }

      await socialAccountService.deleteSocialAccount(id);
      respondWithSuccess(res, null, 'Account disconnected successfully');
    } catch (error) {
      logger.error('Error disconnecting account:', error);
      respondWithError(res, 'Failed to disconnect account', 500);
    }
  }
}

export const socialAccountController = new SocialAccountController();
