import { config } from '../../../config/environment';
import { redisService } from '../../../config/redis';
import { TokenEncryption } from '../../../utils/token-encryption.utils';
import { socialAccountService } from '../../../services/social-account.service';
import { logger } from '../../../utils/logger.utils';
import { webcrypto as crypto } from 'crypto';

export interface OAuth2State {
    userId: string;
    platformId: number;
    codeVerifier: string;
    callbackUrl: string;
    scope: string[];
    createdAt: Date;
}

export interface LinkedInUserData {
    id: string;
    name: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
    email?: string;
}

export interface LinkedInTokens {
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
    scope?: string[];
}

// LinkedIn official scopes
const DEFAULT_SCOPES = ['r_liteprofile', 'r_emailaddress', 'w_member_social'] as const;
type DefaultScope = typeof DEFAULT_SCOPES[number];

// Normalize application-configured scopes to LinkedIn's expected values
function normalizeScopes(scopes?: string[]): string[] {
    if (!scopes || scopes.length === 0) return [...DEFAULT_SCOPES];
    // Map common aliases to official scopes
    const aliasMap: Record<string, DefaultScope> = {
        profile: 'r_liteprofile',
        email: 'r_emailaddress',
        posts: 'w_member_social',
        w_member_social: 'w_member_social',
        r_liteprofile: 'r_liteprofile',
        r_emailaddress: 'r_emailaddress',
    };
    const out: Set<string> = new Set();
    for (const s of scopes) {
        const key = s.trim();
        const mapped = aliasMap[key] || key;
        out.add(mapped);
    }
    // Ensure PKCE-capable read scopes are present for profile
    if (!out.has('r_liteprofile')) out.add('r_liteprofile');
    return Array.from(out);
}

class OAuth2LinkedInService {
    private authBase = 'https://www.linkedin.com/oauth/v2';
    private apiBase = 'https://api.linkedin.com/v2';

    constructor() {
        if (!config.linkedin.clientId || !config.linkedin.clientSecret) {
            throw new Error('LinkedIn OAuth 2.0 credentials not configured');
        }
    }

    async generateAuthUrl(
        userId: string,
        platformId: number,
        callbackUrl: string,
        scopes: string[] = normalizeScopes(config.linkedin.scopes)
    ): Promise<{ url: string; state: string }> {
        try {
            // PKCE: create code verifier and challenge
            const codeVerifier = this.randomString(config.oauth.pkceCodeVerifierLength || 128);
            const codeChallenge = await this.pkceChallenge(codeVerifier);
            const state = this.randomString(32);

            // Store state and code verifier in Redis
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
                response_type: 'code',
                client_id: config.linkedin.clientId,
                redirect_uri: callbackUrl,
                state,
                scope: scopes.join(' '),
                code_challenge: codeChallenge,
                code_challenge_method: 'S256',
            });

            const url = `${this.authBase}/authorization?${params.toString()}`;
            logger.info('LinkedIn OAuth 2.0 URL generated', { userId, platformId });
            return { url, state };
        } catch (error) {
            logger.error('Error generating LinkedIn OAuth URL:', error);
            throw new Error('Failed to generate LinkedIn authorization URL');
        }
    }

    async handleCallback(code: string, state: string): Promise<{ account: any; userData: LinkedInUserData }> {
        try {
            const stateData = await redisService.getOAuthState(state);
            if (!stateData) {
                throw new Error('Invalid or expired OAuth state');
            }
            const { userId, platformId, codeVerifier, callbackUrl } = stateData as OAuth2State;

            const tokenData = await this.exchangeCodeForToken({ code, codeVerifier, redirectUri: callbackUrl });

            const userData = await this.getUserData(tokenData.accessToken);

            const account = await this.saveSocialAccount(userId, platformId, userData, tokenData);

            logger.info('LinkedIn account connected', { userId, platformId, accountId: account?.id });
            return { account, userData };
        } catch (error) {
            logger.error('Error handling LinkedIn OAuth callback:', error);
            throw new Error('Failed to complete LinkedIn authentication');
        }
    }

    async refreshAccessToken(accountId: string): Promise<{ accessToken: string; expiresIn: number }> {
        // LinkedIn may not always provide refresh tokens; implement only if available
        try {
            const account = await socialAccountService.getSocialAccountById(accountId);
            if (!account) throw new Error('Account not found');

            const decrypted = TokenEncryption.decryptTokens({
                encryptedAccessToken: account.encrypted_access_token,
                encryptedRefreshToken: account.encrypted_refresh_token,
                iv: account.token_encryption_iv,
            });

            if (!decrypted.refreshToken) {
                throw new Error('Refresh token not available for this account');
            }

            const params = new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: decrypted.refreshToken,
                client_id: config.linkedin.clientId,
                client_secret: config.linkedin.clientSecret,
            });

            const resp = await fetch(`${this.authBase}/accessToken`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString(),
            });

            if (!resp.ok) {
                const txt = await resp.text();
                logger.error('LinkedIn refresh token failed', { status: resp.status, body: txt });
                throw new Error('Failed to refresh LinkedIn access token');
            }

            const json = (await resp.json()) as { access_token: string; expires_in: number };

            const encrypted = TokenEncryption.encryptTokens({ accessToken: json.access_token, refreshToken: decrypted.refreshToken });
            await socialAccountService.updateSocialAccount(accountId, {
                encrypted_access_token: encrypted.encryptedAccessToken,
                encrypted_refresh_token: encrypted.encryptedRefreshToken,
                token_encryption_iv: encrypted.iv,
                token_expires_at: new Date(Date.now() + json.expires_in * 1000),
            });

            return { accessToken: json.access_token, expiresIn: json.expires_in };
        } catch (error) {
            logger.error('Error refreshing LinkedIn access token:', error);
            throw error;
        }
    }

    async disconnectAccount(accountId: string): Promise<void> {
        try {
            const account = await socialAccountService.getSocialAccountById(accountId);
            if (!account) return;
            // LinkedIn token revocation endpoint
            try {
                const decrypted = TokenEncryption.decryptTokens({
                    encryptedAccessToken: account.encrypted_access_token,
                    encryptedRefreshToken: account.encrypted_refresh_token,
                    iv: account.token_encryption_iv,
                });
                if (decrypted.accessToken) {
                    const params = new URLSearchParams({ token: decrypted.accessToken });
                    await fetch(`${this.authBase}/revoke`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: params.toString(),
                    });
                }
            } catch (e) {
                logger.warn('LinkedIn revoke failed (ignored):', e as any);
            }
            await socialAccountService.deleteSocialAccount(accountId);
        } catch (error) {
            logger.error('Error disconnecting LinkedIn account:', error);
            throw error;
        }
    }

    async validateState(state: string): Promise<OAuth2State | null> {
        try {
            const data = await redisService.getOAuthState(state);
            return (data || null) as OAuth2State | null;
        } catch (error) {
            logger.error('Error validating LinkedIn state:', error);
            return null;
        }
    }

    private async exchangeCodeForToken(args: { code: string; codeVerifier: string; redirectUri: string }): Promise<LinkedInTokens> {
        const { code, codeVerifier, redirectUri } = args;
        const params = new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            client_id: config.linkedin.clientId,
            client_secret: config.linkedin.clientSecret,
            code_verifier: codeVerifier,
        });

        const resp = await fetch(`${this.authBase}/accessToken`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString(),
        });

        if (!resp.ok) {
            const txt = await resp.text();
            logger.error('LinkedIn token exchange failed:', { status: resp.status, body: txt });
            throw new Error('Failed to exchange authorization code for tokens');
        }

        const json = (await resp.json()) as { access_token: string; expires_in: number; refresh_token?: string; scope?: string };
        return {
            accessToken: json.access_token,
            refreshToken: json.refresh_token,
            expiresIn: json.expires_in,
            scope: json.scope ? json.scope.split(' ') : undefined,
        };
    }

    private async getUserData(accessToken: string): Promise<LinkedInUserData> {
        // Fetch profile
        const profileResp = await fetch(
            `${this.apiBase}/me?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!profileResp.ok) {
            const txt = await profileResp.text();
            logger.error('LinkedIn profile fetch failed:', { status: profileResp.status, body: txt });
            throw new Error('Failed to fetch LinkedIn profile');
        }
        const profile = await profileResp.json();

        // Fetch email
        let email: string | undefined;
        try {
            const emailResp = await fetch(
                `${this.apiBase}/emailAddress?q=members&projection=(elements*(handle~))`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            if (emailResp.ok) {
                const emailJson = await emailResp.json();
                email = emailJson?.elements?.[0]?.['handle~']?.emailAddress;
            }
        } catch (e) {
            logger.warn('LinkedIn email fetch failed (ignored):', e as any);
        }

        const first = profile?.localizedFirstName || '';
        const last = profile?.localizedLastName || '';

        // Extract best profile image
        let profileImageUrl: string | undefined;
        try {
            const displays = profile?.profilePicture?.['displayImage~']?.elements || [];
            const best = displays[displays.length - 1];
            profileImageUrl = best?.identifiers?.[0]?.identifier;
        } catch { }

        return {
            id: profile.id,
            firstName: first,
            lastName: last,
            name: `${first} ${last}`.trim(),
            profileImageUrl,
            email,
        };
    }

    private async saveSocialAccount(
        userId: string,
        platformId: number,
        userData: LinkedInUserData,
        tokens: LinkedInTokens
    ): Promise<any> {
        // Encrypt tokens
        const encryptedTokens = TokenEncryption.encryptTokens({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        });

        const existingAccount = await socialAccountService.getSocialAccountByPlatform(
            userId,
            platformId,
            userData.id
        );

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
            account_username: userData.email || userData.id,
            profile_image_url: userData.profileImageUrl,
            follower_count: 0,
            following_count: 0,
            oauth_version: '2.0',
            encrypted_access_token: encryptedTokens.encryptedAccessToken,
            encrypted_refresh_token: encryptedTokens.encryptedRefreshToken,
            token_encryption_iv: encryptedTokens.iv,
            token_expires_at: new Date(Date.now() + (tokens.expiresIn || 3600) * 1000),
            scope: tokens.scope || normalizeScopes(config.linkedin.scopes),
            is_active: true,
            is_verified: false,
            connection_status: 'connected',
            last_sync_at: new Date(),
            platform_data: {
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
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
        const base64 = this.base64UrlEncode(Buffer.from(digest));
        return base64;
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
}

export const oauth2LinkedInService = new OAuth2LinkedInService();
