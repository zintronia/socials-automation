import crypto from 'crypto';
import { config } from '../config/environment';
import { logger } from './logger.utils';

export class TokenEncryption {
    private static readonly ALGORITHM = 'aes-256-gcm';
    private static readonly IV_LENGTH = 16;
    private static readonly TAG_LENGTH = 16;
    private static readonly KEY_LENGTH = 32;

    /**
     * Generate a secure encryption key from the environment key
     */
    private static getEncryptionKey(): Buffer {
        const key = config.oauth.tokenEncryptionKey;
        if (!key || key.length < 32) {
            throw new Error('Token encryption key must be at least 32 characters long');
        }

        // Use SHA-256 to ensure consistent key length
        return crypto.createHash('sha256').update(key).digest();
    }

    /**
     * Generate a random initialization vector
     */
    private static generateIV(): Buffer {
        return crypto.randomBytes(this.IV_LENGTH);
    }

    /**
     * Encrypt a token using AES-256-GCM
     */
    static encrypt(token: string): { encryptedToken: string; iv: string } {
        try {
            if (!token) {
                throw new Error('Token cannot be empty');
            }

            const key = this.getEncryptionKey();
            const iv = this.generateIV();

            // Use createCipheriv for GCM mode - correct Node.js API
            const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);

            // Set Additional Authenticated Data (AAD)
            cipher.setAAD(Buffer.from('social-media-automation', 'utf8'));

            const encrypted = Buffer.concat([
                cipher.update(token, 'utf8'),
                cipher.final()
            ]);

            const authTag = cipher.getAuthTag();

            // Combine IV + AuthTag + EncryptedData
            const combined = Buffer.concat([iv, authTag, encrypted]);

            return {
                encryptedToken: combined.toString('base64'),
                iv: iv.toString('base64')
            };
        } catch (error) {
            logger.error('Token encryption failed:', error);
            throw new Error('Failed to encrypt token');
        }
    }

    /**
     * Decrypt a token using AES-256-GCM
     */
    static decrypt(encryptedToken: string, iv: string): string {
        try {
            if (!encryptedToken || !iv) {
                throw new Error('Encrypted token and IV are required');
            }

            const key = this.getEncryptionKey();
            const combined = Buffer.from(encryptedToken, 'base64');

            // Extract IV, AuthTag, and encrypted data
            const extractedIV = combined.subarray(0, this.IV_LENGTH);
            const authTag = combined.subarray(this.IV_LENGTH, this.IV_LENGTH + this.TAG_LENGTH);
            const encryptedData = combined.subarray(this.IV_LENGTH + this.TAG_LENGTH);

            // Use createDecipheriv for GCM mode
            const decipher = crypto.createDecipheriv(this.ALGORITHM, key, extractedIV);
            decipher.setAAD(Buffer.from('social-media-automation', 'utf8'));
            decipher.setAuthTag(authTag);

            const decrypted = Buffer.concat([
                decipher.update(encryptedData),
                decipher.final()
            ]);

            return decrypted.toString('utf8');
        } catch (error) {
            logger.error('Token decryption failed:', error);
            throw new Error('Failed to decrypt token');
        }
    }

    /**
     * Encrypt multiple tokens at once
     */
    static encryptTokens(tokens: { accessToken?: string; refreshToken?: string }): {
        encryptedAccessToken?: string;
        encryptedRefreshToken?: string;
        iv: string;
    } {
        const iv = this.generateIV().toString('base64');
        const result: any = { iv };

        if (tokens.accessToken) {
            const encrypted = this.encrypt(tokens.accessToken);
            result.encryptedAccessToken = encrypted.encryptedToken;
        }

        if (tokens.refreshToken) {
            const encrypted = this.encrypt(tokens.refreshToken);
            result.encryptedRefreshToken = encrypted.encryptedToken;
        }

        return result;
    }

    /**
     * Decrypt multiple tokens at once
     */
    static decryptTokens(encryptedTokens: {
        encryptedAccessToken?: string;
        encryptedRefreshToken?: string;
        iv: string;
    }): { accessToken?: string; refreshToken?: string } {
        const result: any = {};

        if (encryptedTokens.encryptedAccessToken) {
            result.accessToken = this.decrypt(encryptedTokens.encryptedAccessToken, encryptedTokens.iv);
        }

        if (encryptedTokens.encryptedRefreshToken) {
            result.refreshToken = this.decrypt(encryptedTokens.encryptedRefreshToken, encryptedTokens.iv);
        }

        return result;
    }

    /**
     * Generate a secure random string for PKCE code verifier
     */
    static generateCodeVerifier(length: number = 128): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
        let result = '';

        for (let i = 0; i < length; i++) {
            result += chars.charAt(crypto.randomInt(0, chars.length));
        }

        return result;
    }

    /**
     * Generate PKCE code challenge from code verifier
     */
    static generateCodeChallenge(codeVerifier: string): string {
        const hash = crypto.createHash('sha256').update(codeVerifier).digest();
        return hash.toString('base64url');
    }

    /**
     * Generate a secure state parameter for OAuth
     */
    static generateState(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Validate token format (basic validation)
     */
    static validateToken(token: string): boolean {
        if (!token || typeof token !== 'string') {
            return false;
        }

        // Basic validation - tokens should be reasonably long
        return token.length >= 10;
    }

    /**
     * Check if token is expired
     */
    static isTokenExpired(expiresAt: Date | string | number): boolean {
        const expiryDate = new Date(expiresAt);
        return expiryDate <= new Date();
    }

    /**
     * Calculate token expiry time
     */
    static calculateExpiryTime(expiresInSeconds: number): Date {
        return new Date(Date.now() + expiresInSeconds * 1000);
    }

    /**
     * Check if token needs refresh (within 5 minutes of expiry)
     */
    static needsRefresh(expiresAt: Date | string | number, bufferMinutes: number = 5): boolean {
        const expiryDate = new Date(expiresAt);
        const bufferTime = new Date(Date.now() + bufferMinutes * 60 * 1000);
        return expiryDate <= bufferTime;
    }
}

// Export utility functions for convenience
export const {
    encrypt,
    decrypt,
    encryptTokens,
    decryptTokens,
    generateCodeVerifier,
    generateCodeChallenge,
    generateState,
    validateToken,
    isTokenExpired,
    calculateExpiryTime,
    needsRefresh
} = TokenEncryption;