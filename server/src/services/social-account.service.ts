import { database } from '../config/database';
import { logger } from '../utils/logger.utils';

export interface CreateSocialAccountInput {
  user_id: string;
  platform_id: number;
  account_id: string;
  account_name: string;
  account_username?: string;
  account_email?: string;
  profile_image_url?: string;
  follower_count?: number;
  following_count?: number;
  access_token?: string;
  refresh_token?: string;
  encrypted_access_token?: string;
  encrypted_refresh_token?: string;
  token_encryption_iv?: string;
  token_expires_at?: Date;
  oauth_version?: '1.0a' | '2.0';
  scope?: string[];
  is_active?: boolean;
  is_verified?: boolean;
  connection_status?: 'connected' | 'disconnected' | 'expired' | 'error' | 'pending';
  platform_data?: Record<string, any>;
  pkce_code_verifier?: string;
  oauth_state?: string;
}

export interface UpdateSocialAccountInput {
  account_name?: string;
  account_username?: string;
  account_email?: string;
  profile_image_url?: string;
  follower_count?: number;
  following_count?: number;
  access_token?: string;
  refresh_token?: string;
  encrypted_access_token?: string;
  encrypted_refresh_token?: string;
  token_encryption_iv?: string;
  token_expires_at?: Date;
  oauth_version?: '1.0a' | '2.0';
  scope?: string[];
  is_active?: boolean;
  is_verified?: boolean;
  connection_status?: 'connected' | 'disconnected' | 'expired' | 'error' | 'pending';
  last_sync_at?: Date;
  platform_data?: Record<string, any>;
  last_error?: string;
  error_count?: number;
  token_refresh_attempts?: number;
  last_token_refresh?: Date;
  token_refresh_error?: string;
}

export class SocialAccountService {
  async createSocialAccount(data: CreateSocialAccountInput) {
    try {
      const { rows } = await database.query(
        `INSERT INTO social_accounts (
          user_id, platform_id, account_id, account_name, account_username, account_email,
          profile_image_url, follower_count, following_count, access_token, refresh_token,
          encrypted_access_token, encrypted_refresh_token, token_encryption_iv, token_expires_at,
          oauth_version, scope, is_active, is_verified, connection_status, platform_data,
          pkce_code_verifier, oauth_state
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23) 
        RETURNING *`,
        [
          data.user_id, data.platform_id, data.account_id, data.account_name,
          data.account_username, data.account_email, data.profile_image_url,
          data.follower_count || 0, data.following_count || 0,
          data.access_token, data.refresh_token, data.encrypted_access_token,
          data.encrypted_refresh_token, data.token_encryption_iv, data.token_expires_at,
          data.oauth_version || '1.0a', data.scope || [], data.is_active ?? true,
          data.is_verified ?? false, data.connection_status || 'connected',
          JSON.stringify(data.platform_data || {}), data.pkce_code_verifier, data.oauth_state
        ]
      );

      return rows[0];
    } catch (error) {
      logger.error('Error creating social account:', error);
      throw new Error('Failed to create social account');
    }
  }

  async getSocialAccountById(id: string) {
    try {
      const { rows } = await database.query(
        'SELECT * FROM social_accounts WHERE id = $1',
        [id]
      );

      const account = rows[0];
      if (account?.platform_data) {
        account.platform_data = JSON.parse(account.platform_data);
      }

      return account;
    } catch (error) {
      logger.error('Error getting social account:', error);
      throw new Error('Failed to get social account');
    }
  }

  async getSocialAccountsByUser(userId: number, platformId?: number) {
    try {
      let query = 'SELECT * FROM social_accounts WHERE user_id = $1';
      const params = [userId];

      if (platformId) {
        query += ' AND platform_id = $2';
        params.push(platformId);
      }

      query += ' ORDER BY created_at DESC';

      const { rows } = await database.query(query, params);

      return rows.map((account: any) => {
        // Handle case where platform_data might already be an object or a string
        let platformData = {};
        if (account.platform_data) {
          try {
            platformData = typeof account.platform_data === 'string' 
              ? JSON.parse(account.platform_data) 
              : account.platform_data;
          } catch (e) {
            logger.warn('Failed to parse platform_data for account:', account.id, e);
            platformData = {};
          }
        }
        return {
          ...account,
          platform_data: platformData
        };
      });
    } catch (error) {
      logger.error('Error getting user social accounts:', error);
      throw new Error('Failed to get user social accounts');
    }
  }

  async updateSocialAccount(id: string, data: UpdateSocialAccountInput) {
    try {
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      // Build dynamic update query
      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
          updateFields.push(`${key} = $${paramIndex}`);
          values.push(key === 'platform_data' ? JSON.stringify(value) : value);
          paramIndex++;
        }
      }

      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      values.push(id);

      const { rows } = await database.query(
        `UPDATE social_accounts 
         SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $${paramIndex} 
         RETURNING *`,
        values
      );

      const result = rows[0];
      if (result?.platform_data) {
        result.platform_data = JSON.parse(result.platform_data);
      }

      return result;
    } catch (error) {
      logger.error('Error updating social account:', error);
      throw new Error('Failed to update social account');
    }
  }

  async deleteSocialAccount(id: string) {
    try {
      await database.query(
        'DELETE FROM social_accounts WHERE id = $1',
        [id]
      );

      return true;
    } catch (error) {
      logger.error('Error deleting social account:', error);
      throw new Error('Failed to delete social account');
    }
  }

  async getSocialAccountByPlatform(userId: string, platformId: number, accountId: string) {
    try {
      const { rows } = await database.query(
        'SELECT * FROM social_accounts WHERE user_id = $1 AND platform_id = $2 AND account_id = $3',
        [userId, platformId, accountId]
      );

      const account = rows[0];
      if (account?.platform_data) {
        account.platform_data = JSON.parse(account.platform_data);
      }

      return account;
    } catch (error) {
      logger.error('Error getting social account by platform:', error);
      throw new Error('Failed to get social account by platform');
    }
  }

  async getActiveSocialAccounts(userId: number, platformId?: number) {
    try {
      let query = `
        SELECT sa.*, p.name as platform_name, p.type as platform_type 
        FROM social_accounts sa
        JOIN platforms p ON sa.platform_id = p.id
        WHERE sa.user_id = $1 
          AND sa.is_active = true 
          AND sa.connection_status = 'connected'
      `;
      const params = [userId];

      if (platformId) {
        query += ' AND sa.platform_id = $2';
        params.push(platformId);
      }

      query += ' ORDER BY sa.created_at DESC';

      const { rows } = await database.query(query, params);

      return rows.map((account: any) => {
        // Handle case where platform_data might already be an object or a string
        let platformData = {};
        if (account.platform_data) {
          try {
            platformData = typeof account.platform_data === 'string' 
              ? JSON.parse(account.platform_data) 
              : account.platform_data;
          } catch (e) {
            logger.warn('Failed to parse platform_data for account:', account.id, e);
            platformData = {};
          }
        }
        return {
          ...account,
          platform_data: platformData
        };
      });
    } catch (error) {
      logger.error('Error getting active social accounts:', error);
      throw new Error('Failed to get active social accounts');
    }
  }

  async getExpiredTokens() {
    try {
      const { rows } = await database.query(
        `SELECT * FROM social_accounts 
         WHERE token_expires_at IS NOT NULL 
           AND token_expires_at < CURRENT_TIMESTAMP
           AND connection_status = 'connected'
           AND is_active = true`
      );

      return rows.map((account: any) => {
        // Handle case where platform_data might already be an object or a string
        let platformData = {};
        if (account.platform_data) {
          try {
            platformData = typeof account.platform_data === 'string' 
              ? JSON.parse(account.platform_data) 
              : account.platform_data;
          } catch (e) {
            logger.warn('Failed to parse platform_data for account:', account.id, e);
            platformData = {};
          }
        }
        return {
          ...account,
          platform_data: platformData
        };
      });
    } catch (error) {
      logger.error('Error getting expired tokens:', error);
      throw new Error('Failed to get expired tokens');
    }
  }

  async getAccountsNeedingRefresh(bufferMinutes: number = 5) {
    try {
      const { rows } = await database.query(
        `SELECT * FROM social_accounts 
         WHERE token_expires_at IS NOT NULL 
           AND token_expires_at <= (CURRENT_TIMESTAMP + INTERVAL '${bufferMinutes} minutes')
           AND connection_status = 'connected'
           AND is_active = true
           AND oauth_version = '2.0'`
      );

      return rows.map((account: any) => {
        // Handle case where platform_data might already be an object or a string
        let platformData = {};
        if (account.platform_data) {
          try {
            platformData = typeof account.platform_data === 'string' 
              ? JSON.parse(account.platform_data) 
              : account.platform_data;
          } catch (e) {
            logger.warn('Failed to parse platform_data for account:', account.id, e);
            platformData = {};
          }
        }
        return {
          ...account,
          platform_data: platformData
        };
      });
    } catch (error) {
      logger.error('Error getting accounts needing refresh:', error);
      throw new Error('Failed to get accounts needing refresh');
    }
  }

  async updateConnectionStatus(id: string, status: 'connected' | 'disconnected' | 'expired' | 'error' | 'pending', errorMessage?: string) {
    try {
      const updateData: any = {
        connection_status: status,
        last_sync_at: new Date()
      };

      if (errorMessage) {
        updateData.last_error = errorMessage;
        updateData.error_count = database.query(
          'SELECT error_count + 1 FROM social_accounts WHERE id = $1',
          [id]
        ).then((result: any) => result.rows[0]?.error_count || 0);
      }

      return await this.updateSocialAccount(id, updateData);
    } catch (error) {
      logger.error('Error updating connection status:', error);
      throw new Error('Failed to update connection status');
    }
  }

  async getAccountStats(userId: string) {
    try {
      const { rows } = await database.query(
        `SELECT 
           platform_id,
           COUNT(*) as total_accounts,
           COUNT(CASE WHEN connection_status = 'connected' THEN 1 END) as connected_accounts,
           COUNT(CASE WHEN connection_status = 'error' THEN 1 END) as error_accounts,
           COUNT(CASE WHEN token_expires_at < CURRENT_TIMESTAMP THEN 1 END) as expired_accounts
         FROM social_accounts 
         WHERE user_id = $1 
         GROUP BY platform_id`,
        [userId]
      );

      return rows;
    } catch (error) {
      logger.error('Error getting account stats:', error);
      throw new Error('Failed to get account stats');
    }
  }
}

export const socialAccountService = new SocialAccountService();
