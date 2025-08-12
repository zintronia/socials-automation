import {  TwitterApi } from 'twitter-api-v2';
import { config } from '../../../config/environment';
import { redisService } from '../../../config/redis';
import { TokenEncryption } from '../../../utils/token-encryption.utils';
import { socialAccountService } from '../../../services/social-account.service';
import { logger } from '../../../utils/logger.utils';

export interface OAuth2State {
    userId: string;
    platformId: number;
    codeVerifier: string;
    callbackUrl: string;
    scope: string[];
    createdAt: Date;
}

export interface TwitterUserData {
    id: string;
    username: string;
    name: string;
    description?: string;
    profileImageUrl?: string;
    followersCount?: number;
    followingCount?: number;
    tweetCount?: number;
    verified?: boolean;
}

export interface TwitterTokens {
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
    scope: string[];
}

export class OAuth2TwitterService {
    private client: TwitterApi;

    constructor() {
        if (!config.twitter.clientId || !config.twitter.clientSecret) {
            throw new Error('Twitter OAuth 2.0 credentials not configured');
        }

        this.client = new TwitterApi({
            clientId: config.twitter.clientId,
            clientSecret: config.twitter.clientSecret,
        });
    }

    /**
     * Generate OAuth 2.0 authorization URL 
     */
    async generateAuthUrl(userId: string, platformId: number, callbackUrl: string, scopes: string[] = ['tweet.read', 'tweet.write', 'users.read', 'offline.access']): Promise<{ url: string; state: string }> {
        try {



            // Generate authorization URL with proper type assertion
            const { url, codeVerifier, state } = this.client.generateOAuth2AuthLink(callbackUrl, {
                scope: scopes,
            } as any);

            logger.info(`Generated OAuth 2.0 auth URL: `, { url, codeVerifier, state });
            // Store state and code verifier in Redis
            const stateData: OAuth2State = {
                userId,
                platformId,
                codeVerifier,
                callbackUrl,
                scope: scopes,
                createdAt: new Date()
            };

            await redisService.setOAuthState(state, stateData, config.oauth.stateExpiryMinutes);

            logger.info(`Generated OAuth 2.0 auth URL for user ${userId}, platform ${platformId}`);

            return {
                url,
                state
            };
        } catch (error) {
            logger.error('Error generating Twitter OAuth 2.0 auth URL:', error);
            throw new Error('Failed to generate Twitter authorization URL');
        }
    }

    /**
     * Handle OAuth 2.0 callback and exchange authorization code for tokens
     */
    async handleCallback(code: string, state: string): Promise<{ account: any; userData: TwitterUserData }> {
        try {
            // Retrieve and validate state
            const stateData = await redisService.getOAuthState(state);
            if (!stateData) {
                throw new Error('Invalid or expired OAuth state');
            }

            const { userId, platformId, codeVerifier, callbackUrl } = stateData as OAuth2State;

            const { accessToken, refreshToken, expiresIn, scope } = await this.client.loginWithOAuth2({
                code,
                codeVerifier, // Use the verifier from Redis
                redirectUri: callbackUrl,
            });

            const tokens: TwitterTokens = {
                accessToken,
                refreshToken,
                expiresIn,
                scope: Array.isArray(scope) ? scope : (scope ? [scope] : [])
            }

            // Get user data from Twitter
            const userData = await this.getUserData(accessToken);

            // Save or update social account
            const account = await this.saveSocialAccount(userId, platformId, userData, tokens, scope);

            logger.info(`Successfully connected Twitter account ${userData.username} for user ${userId}`);

            return { account, userData };
        } catch (error) {
            logger.error('Error handling Twitter OAuth 2.0 callback:', error);
            throw new Error('Failed to complete Twitter authentication');
        }
    }

    /**
     * Get user data from Twitter API
     */
    private async getUserData(accessToken: string): Promise<TwitterUserData> {
        try {
            const userClient = new TwitterApi(accessToken);
            const { data: user } = await userClient.v2.me({
                'user.fields': ['profile_image_url', 'description', 'public_metrics', 'verified']
            });

            return {
                id: user.id,
                username: user.username,
                name: user.name,
                description: user.description,
                profileImageUrl: user.profile_image_url,
                followersCount: user.public_metrics?.followers_count,
                followingCount: user.public_metrics?.following_count,
                tweetCount: user.public_metrics?.tweet_count,
                verified: user.verified
            };
        } catch (error) {
            logger.error('Error getting Twitter user data:', error);
            throw new Error('Failed to get Twitter user data');
        }
    }

    /**
     * Save or update social account in database
     */
    private async saveSocialAccount(userId: string, platformId: number, userData: TwitterUserData, tokens: TwitterTokens, scope: string[]): Promise<any> {
        try {
            // Encrypt tokens
            const encryptedTokens = TokenEncryption.encryptTokens({
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            });

            // Check if account already exists
            const existingAccount = await socialAccountService.getSocialAccountByPlatform(
                userId,
                platformId,
                userData.id
            );

            // Define account data with proper types
            const accountData: {
                user_id: string;
                platform_id: number;
                account_id: string;
                account_name: string;
                account_username: string;
                profile_image_url?: string;
                follower_count: number;
                following_count: number;
                oauth_version: '2.0';
                encrypted_access_token: string | undefined;
                encrypted_refresh_token: string | undefined;
                token_encryption_iv: string;
                token_expires_at: Date;
                scope: string[];
                is_active: boolean;
                is_verified: boolean;
                connection_status: 'connected' | 'disconnected' | 'expired' | 'error' | 'pending';
                last_sync_at: Date;
                platform_data: Record<string, any>;
            } = {
                user_id: userId,
                platform_id: platformId,
                account_id: userData.id,
                account_name: userData.name,
                account_username: userData.username,
                profile_image_url: userData.profileImageUrl,
                follower_count: userData.followersCount || 0,
                following_count: userData.followingCount || 0,
                oauth_version: '2.0',
                encrypted_access_token: encryptedTokens.encryptedAccessToken,
                encrypted_refresh_token: encryptedTokens.encryptedRefreshToken,
                token_encryption_iv: encryptedTokens.iv,
                token_expires_at: TokenEncryption.calculateExpiryTime(tokens.expiresIn),
                scope,
                is_active: true,
                is_verified: userData.verified || false,
                connection_status: 'connected',
                last_sync_at: new Date(),
                platform_data: {
                    description: userData.description,
                    tweet_count: userData.tweetCount,
                    verified: userData.verified
                }
            };

            let account;
            if (existingAccount) {
                // Update existing account
                const { user_id, platform_id, account_id, ...updateData } = accountData;
                account = await socialAccountService.updateSocialAccount(existingAccount.id, updateData);
            } else {
                // Create new account
                account = await socialAccountService.createSocialAccount(accountData);
            }

            return account;
        } catch (error) {
            logger.error('Error saving social account:', error);
            throw new Error('Failed to save social account');
        }
    }

    /**
     * Refresh access token using refresh token
     */
    async refreshAccessToken(accountId: string): Promise<{ accessToken: string; expiresIn: number }> {
        const account = await socialAccountService.getSocialAccountById(accountId);

        try {
            if (!account) {
                throw new Error('Social account not found');
            }

            if (!account.encrypted_refresh_token) {
                throw new Error('No refresh token available');
            }

            // Decrypt refresh token
            const refreshToken = TokenEncryption.decrypt(
                account.encrypted_refresh_token,
                account.token_encryption_iv
            );

            // Refresh the token
            const { accessToken, refreshToken: newRefreshToken, expiresIn } = await this.client.refreshOAuth2Token(refreshToken);

            // Update account with new tokens
            const encryptedTokens = TokenEncryption.encryptTokens({
                accessToken,
                refreshToken: newRefreshToken
            });

            await socialAccountService.updateSocialAccount(accountId, {
                encrypted_access_token: encryptedTokens.encryptedAccessToken,
                encrypted_refresh_token: encryptedTokens.encryptedRefreshToken,
                token_encryption_iv: encryptedTokens.iv,
                token_expires_at: TokenEncryption.calculateExpiryTime(expiresIn),
                last_token_refresh: new Date(),
                token_refresh_attempts: 0,
                token_refresh_error: undefined
            });

            logger.info(`Refreshed access token for account ${accountId}`);

            return { accessToken, expiresIn };
        } catch (error) {
            logger.error('Error refreshing access token:', error);

            // Update error count
            await socialAccountService.updateSocialAccount(accountId, {
                token_refresh_attempts: ((account as any)?.token_refresh_attempts || 0) + 1,
                token_refresh_error: error instanceof Error ? error.message : 'Unknown error',
                last_token_refresh: new Date()
            });

            throw new Error('Failed to refresh access token');
        }
    }

    /**
     * Get decrypted access token (with automatic refresh if needed)
     */
    async getAccessToken(accountId: string): Promise<string> {
        try {
            const account = await socialAccountService.getSocialAccountById(accountId);
            if (!account) {
                throw new Error('Social account not found');
            }

            // Check if token needs refresh
            if (account.token_expires_at && TokenEncryption.needsRefresh(account.token_expires_at)) {
                const { accessToken } = await this.refreshAccessToken(accountId);
                return accessToken;
            }

            // Decrypt and return current access token
            return TokenEncryption.decrypt(
                account.encrypted_access_token,
                account.token_encryption_iv
            );
        } catch (error) {
            logger.error('Error getting access token:', error);
            throw new Error('Failed to get access token');
        }
    }

    /**
     * Disconnect Twitter account
     */
    async disconnectAccount(accountId: string): Promise<void> {
        try {
            const account = await socialAccountService.getSocialAccountById(accountId);
            if (!account) {
                throw new Error('Social account not found');
            }

            // Revoke tokens if possible
            try {
                const accessToken = await this.getAccessToken(accountId);
                await this.client.revokeOAuth2Token(accessToken);
            } catch (revokeError) {
                logger.warn('Failed to revoke Twitter tokens:', revokeError);
            }

            // Delete account
            await socialAccountService.deleteSocialAccount(accountId);

            logger.info(`Disconnected Twitter account ${accountId}`);
        } catch (error) {
            logger.error('Error disconnecting Twitter account:', error);
            throw new Error('Failed to disconnect Twitter account');
        }
    }

    /**
     * Validate OAuth state
     */
    async validateState(state: string): Promise<OAuth2State | null> {
        try {
            const stateData = await redisService.getOAuthState(state);
            return stateData as OAuth2State;
        } catch (error) {
            logger.error('Error validating OAuth state:', error);
            return null;
        }
    }
}

export const oauth2TwitterService = new OAuth2TwitterService(); 