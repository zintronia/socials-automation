import { createClient, RedisClientType } from 'redis';
import { config } from './environment';
import { logger } from '../utils/logger.utils';

class RedisService {
    private client: RedisClientType;
    private isConnected: boolean = false;

    constructor() {
        this.client = createClient({
            url: config.redis.url,
            socket: {
                host: config.redis.host,
                port: config.redis.port,
                // reconnectStrategy: (retries) => {
                //     if (retries > 10) {
                //         logger.error('Redis max reconnection attempts reached');
                //         return new Error('Redis max reconnection attempts reached');
                //     }
                //     return Math.min(retries * 100, 3000);
                // }
            },
            password: config.redis.password,
            database: config.redis.db,
        });

        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        this.client.on('connect', () => {
            logger.info('Redis client connected');
            this.isConnected = true;
        });

        this.client.on('ready', () => {
            logger.info('Redis client ready');
        });

        this.client.on('error', (err) => {
            logger.error('Redis client error:', err);
            this.isConnected = false;
        });

        this.client.on('end', () => {
            logger.info('Redis client disconnected');
            this.isConnected = false;
        });

        this.client.on('reconnecting', () => {
            logger.info('Redis client reconnecting...');
        });
    }

    async connect(): Promise<void> {
        if (!this.isConnected) {
            try {
                await this.client.connect();
            } catch (error) {
                logger.error('Failed to connect to Redis:', error);
                throw error;
            }
        }
    }

    async disconnect(): Promise<void> {
        if (this.isConnected) {
            try {
                await this.client.quit();
            } catch (error) {
                logger.error('Error disconnecting from Redis:', error);
            }
        }
    }

    async set(key: string, value: any, expirySeconds?: number): Promise<void> {
        try {
            await this.connect();
            const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);

            if (expirySeconds) {
                await this.client.setEx(key, expirySeconds, serializedValue);
            } else {
                await this.client.set(key, serializedValue);
            }
        } catch (error) {
            logger.error(`Redis SET error for key ${key}:`, error);
            throw error;
        }
    }

    async get(key: string): Promise<any> {
        try {
            await this.connect();
            const value = await this.client.get(key);

            if (!value) return null;

            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        } catch (error) {
            logger.error(`Redis GET error for key ${key}:`, error);
            throw error;
        }
    }

    async delete(key: string): Promise<void> {
        try {
            await this.connect();
            await this.client.del(key);
        } catch (error) {
            logger.error(`Redis DELETE error for key ${key}:`, error);
            throw error;
        }
    }

    async exists(key: string): Promise<boolean> {
        try {
            await this.connect();
            const result = await this.client.exists(key);
            return result === 1;
        } catch (error) {
            logger.error(`Redis EXISTS error for key ${key}:`, error);
            throw error;
        }
    }

    async setOAuthState(state: string, data: any, expiryMinutes: number = 10): Promise<void> {
        const key = `oauth_state:${state}`;
        await this.set(key, data, expiryMinutes * 60);
    }

    async getOAuthState(state: string): Promise<any> {
        const key = `oauth_state:${state}`;
        const data = await this.get(key);

        if (data) {
            // Delete the state after retrieval for security
            await this.delete(key);
        }

        return data;
    }

    /**
     * Explicitly delete an OAuth state from Redis
     * @param state The state token to delete
     */
    async deleteOAuthState(state: string): Promise<void> {
        const key = `oauth_state:${state}`;
        await this.delete(key);
        logger.info('Deleted OAuth state from Redis', { state });
    }

    async setUserTokens(userId: string, platform: string, accountId: string, tokens: any): Promise<void> {
        const key = `user_tokens:${userId}:${platform}:${accountId}`;
        await this.set(key, tokens, 24 * 60 * 60); // 24 hours
    }

    async getUserTokens(userId: string, platform: string, accountId: string): Promise<any> {
        const key = `user_tokens:${userId}:${platform}:${accountId}`;
        return await this.get(key);
    }

    async deleteUserTokens(userId: string, platform: string, accountId: string): Promise<void> {
        const key = `user_tokens:${userId}:${platform}:${accountId}`;
        await this.delete(key);
    }

    async setRateLimit(key: string, windowMs: number): Promise<number> {
        const current = Date.now();
        const windowStart = current - windowMs;

        try {
            await this.connect();

            // Remove old entries
            await this.client.zRemRangeByScore(key, 0, windowStart);

            // Add current request
            await this.client.zAdd(key, { score: current, value: current.toString() });

            // Set expiry on the key
            await this.client.expire(key, Math.ceil(windowMs / 1000));

            // Get count of requests in window
            const count = await this.client.zCard(key);
            return count;
        } catch (error) {
            logger.error(`Redis rate limit error for key ${key}:`, error);
            throw error;
        }
    }

    async getRateLimitCount(key: string, windowMs: number): Promise<number> {
        const current = Date.now();
        const windowStart = current - windowMs;

        try {
            await this.connect();
            await this.client.zRemRangeByScore(key, 0, windowStart);
            return await this.client.zCard(key);
        } catch (error) {
            logger.error(`Redis rate limit count error for key ${key}:`, error);
            throw error;
        }
    }

    // Health check method
    async ping(): Promise<boolean> {
        try {
            await this.connect();
            const result = await this.client.ping();
            return result === 'PONG';
        } catch (error) {
            logger.error('Redis ping failed:', error);
            return false;
        }
    }

    // Get connection status
    getConnectionStatus(): boolean {
        return this.isConnected;
    }
}

// Create singleton instance
export const redisService = new RedisService();

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, disconnecting Redis...');
    await redisService.disconnect();
});

process.on('SIGINT', async () => {
    logger.info('SIGINT received, disconnecting Redis...');
    await redisService.disconnect();
}); 