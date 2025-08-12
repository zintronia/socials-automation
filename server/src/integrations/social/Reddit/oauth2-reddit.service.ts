import { config } from '../../../config/environment';
import { redisService } from '../../../config/redis';
import { TokenEncryption } from '../../../utils/token-encryption.utils';
import { socialAccountService } from '../../../services/social-account.service';
import { logger } from '../../../utils/logger.utils';
import { webcrypto as crypto } from 'crypto';

interface OAuth2State {
  userId: string;
  platformId: number;
  codeVerifier: string;
  callbackUrl: string;
  scope: string[];
  createdAt: Date;
}

interface RedditUserData {
  id: string;
  name: string;
  profileImageUrl?: string;
  isEmployee?: boolean;
}

interface RedditTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  scope?: string[];
  tokenType: string;
}

const DEFAULT_SCOPES = ['identity', 'read', 'submit'] as const;

function normalizeScopes(scopes?: string[]): string[] {
  if (!scopes || scopes.length === 0) return Array.from(DEFAULT_SCOPES);
  return Array.from(new Set(scopes.map(s => s.trim())));
}

class OAuth2RedditService {
  private authBase = 'https://www.reddit.com/api/v1';
  private apiBase = 'https://oauth.reddit.com';

  constructor() {
    if (!config.reddit.clientId) {
      throw new Error('Reddit OAuth 2.0 clientId not configured');
    }
  }

  async generateAuthUrl(
    userId: string,
    platformId: number,
    callbackUrl: string,
    scopes: string[] = normalizeScopes(config.reddit.scopes)
  ): Promise<{ url: string; state: string }> {
    try {
      const codeVerifier = config.reddit.usePKCE ? this.randomString(config.oauth.pkceCodeVerifierLength || 128) : '';
      const codeChallenge = config.reddit.usePKCE ? await this.pkceChallenge(codeVerifier) : undefined;
      const state = this.randomString(32);

      const stateData: OAuth2State = {
        userId,
        platformId,
        codeVerifier,
        callbackUrl,
        scope: scopes,
        createdAt: new Date(),
      };
      await redisService.setOAuthState(state, stateData, config.oauth.stateExpiryMinutes);

      const params = new URLSearchParams({
        client_id: config.reddit.clientId,
        response_type: 'code',
        state,
        redirect_uri: callbackUrl,
        duration: config.reddit.duration,
        scope: scopes.join(' '),
      });
      if (config.reddit.usePKCE && codeChallenge) {
        params.set('code_challenge', codeChallenge);
        params.set('code_challenge_method', 'S256');
      }

      const url = `${this.authBase}/authorize?${params.toString()}`;
      logger.info('Reddit OAuth 2.0 URL generated', { userId, platformId });
      return { url, state };
    } catch (error) {
      logger.error('Error generating Reddit OAuth URL:', error);
      throw new Error('Failed to generate Reddit authorization URL');
    }
  }

  async handleCallback(code: string, state: string): Promise<{ account: any; userData: RedditUserData }> {
    try {
      const stateData = await redisService.getOAuthState(state);
      if (!stateData) throw new Error('Invalid or expired OAuth state');
      const { userId, platformId, codeVerifier, callbackUrl } = stateData as OAuth2State;

      const tokens = await this.exchangeCodeForToken({ code, codeVerifier, redirectUri: callbackUrl });
      const userData = await this.getUserData(tokens.accessToken);
      const account = await this.saveSocialAccount(userId, platformId, userData, tokens);

      logger.info('Reddit account connected', { userId, platformId, accountId: account?.id });
      return { account, userData };
    } catch (error) {
      logger.error('Error handling Reddit OAuth callback:', error);
      throw new Error('Failed to complete Reddit authentication');
    }
  }

  async refreshAccessToken(accountId: string): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const account = await socialAccountService.getSocialAccountById(accountId);
      if (!account) throw new Error('Account not found');

      const decrypted = TokenEncryption.decryptTokens({
        encryptedAccessToken: account.encrypted_access_token,
        encryptedRefreshToken: account.encrypted_refresh_token,
        iv: account.token_encryption_iv,
      });

      if (!decrypted.refreshToken) throw new Error('Refresh token not available for this account');

      const body = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: decrypted.refreshToken,
      });

      const headers: Record<string, string> = {
        'User-Agent': config.reddit.userAgent,
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: this.basicAuthHeader(config.reddit.clientId, config.reddit.clientSecret),
      };

      const resp = await fetch(`${this.authBase}/access_token`, { method: 'POST', headers, body: body.toString() });
      if (!resp.ok) {
        const txt = await resp.text();
        logger.error('Reddit refresh token failed', { status: resp.status, body: txt });
        throw new Error('Failed to refresh Reddit access token');
      }

      const json = (await resp.json()) as { access_token: string; expires_in: number; token_type: string };

      const encrypted = TokenEncryption.encryptTokens({ accessToken: json.access_token, refreshToken: decrypted.refreshToken });
      await socialAccountService.updateSocialAccount(accountId, {
        encrypted_access_token: encrypted.encryptedAccessToken,
        encrypted_refresh_token: encrypted.encryptedRefreshToken,
        token_encryption_iv: encrypted.iv,
        token_expires_at: new Date(Date.now() + json.expires_in * 1000),
      });

      return { accessToken: json.access_token, expiresIn: json.expires_in };
    } catch (error) {
      logger.error('Error refreshing Reddit access token:', error);
      throw error;
    }
  }

  async disconnectAccount(accountId: string): Promise<void> {
    try {
      const account = await socialAccountService.getSocialAccountById(accountId);
      if (!account) return;
      // No standard revoke endpoint for Reddit per user token; tokens expire or can be revoked by user
      await socialAccountService.deleteSocialAccount(accountId);
    } catch (error) {
      logger.error('Error disconnecting Reddit account:', error);
      throw error;
    }
  }

  private async exchangeCodeForToken(args: { code: string; codeVerifier: string; redirectUri: string }): Promise<RedditTokens> {
    const { code, codeVerifier, redirectUri } = args;

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    });
    if (config.reddit.usePKCE) body.set('code_verifier', codeVerifier);

    const headers: Record<string, string> = {
      'User-Agent': config.reddit.userAgent,
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: this.basicAuthHeader(config.reddit.clientId, config.reddit.clientSecret),
    };

    const resp = await fetch(`${this.authBase}/access_token`, { method: 'POST', headers, body: body.toString() });
    if (!resp.ok) {
      const txt = await resp.text();
      logger.error('Reddit token exchange failed:', { status: resp.status, body: txt });
      throw new Error('Failed to exchange authorization code for tokens');
    }

    const json = (await resp.json()) as { access_token: string; token_type: string; expires_in: number; refresh_token?: string; scope?: string };
    return {
      accessToken: json.access_token,
      tokenType: json.token_type,
      refreshToken: json.refresh_token,
      expiresIn: json.expires_in,
      scope: json.scope ? json.scope.split(',') : undefined,
    };
  }

  private async getUserData(accessToken: string): Promise<RedditUserData> {
    const resp = await fetch(`${this.apiBase}/api/v1/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': config.reddit.userAgent,
      },
    });
    if (!resp.ok) {
      const txt = await resp.text();
      logger.error('Reddit identity fetch failed:', { status: resp.status, body: txt });
      throw new Error('Failed to fetch Reddit user');
    }
    const me = await resp.json();
    return {
      id: me.id,
      name: me.name,
      profileImageUrl: me.icon_img || undefined,
      isEmployee: !!me.is_employee,
    };
  }

  private async saveSocialAccount(userId: string, platformId: number, userData: RedditUserData, tokens: RedditTokens): Promise<any> {
    const encryptedTokens = TokenEncryption.encryptTokens({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });

    const existingAccount = await socialAccountService.getSocialAccountByPlatform(userId, platformId, userData.id);

    const accountData: any = {
      user_id: userId,
      platform_id: platformId,
      account_id: userData.id,
      account_name: userData.name,
      account_username: userData.name,
      profile_image_url: userData.profileImageUrl,
      follower_count: 0,
      following_count: 0,
      oauth_version: '2.0',
      encrypted_access_token: encryptedTokens.encryptedAccessToken,
      encrypted_refresh_token: encryptedTokens.encryptedRefreshToken,
      token_encryption_iv: encryptedTokens.iv,
      token_expires_at: new Date(Date.now() + (tokens.expiresIn || 3600) * 1000),
      scope: tokens.scope || normalizeScopes(config.reddit.scopes),
      is_active: true,
      is_verified: false,
      connection_status: 'connected',
      last_sync_at: new Date(),
      platform_data: {
        token_type: tokens.tokenType,
      },
    };

    if (existingAccount) {
      return socialAccountService.updateSocialAccount(existingAccount.id, accountData);
    }
    return socialAccountService.createSocialAccount(accountData);
  }

  private async pkceChallenge(verifier: string): Promise<string> {
    const data = new TextEncoder().encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return this.base64UrlEncode(Buffer.from(digest));
  }

  private base64UrlEncode(buffer: Buffer): string {
    return buffer
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  private randomString(length: number): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
      result += charset[randomValues[i] % charset.length];
    }
    return result;
  }

  private basicAuthHeader(clientId: string, clientSecret?: string): string {
    // For installed apps without secret, Reddit expects empty password
    const secret = clientSecret || '';
    const token = Buffer.from(`${clientId}:${secret}`).toString('base64');
    return `Basic ${token}`;
  }
}

export const oauth2RedditService = new OAuth2RedditService();
