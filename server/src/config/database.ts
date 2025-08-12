import { Pool, PoolConfig } from 'pg';
import { config } from './environment';
import { logger } from '../utils/logger.utils';

class Database {
    private pool: Pool;

    constructor() {
        const poolConfig: PoolConfig = {
            host: config.database.host,
            port: config.database.port,
            database: config.database.name,
            user: config.database.user,
            password: config.database.password,
            max: config.database.maxConnections,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
            ssl: config.database.ssl || false,
        };
        this.pool = new Pool(poolConfig);
        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        this.pool.on('connect', () => {
            logger.info('Database connection established');
        });
        this.pool.on('error', (err) => {
            logger.error('Database connection error:', err);
        });
    }

    async query(text: string, params?: any[]): Promise<any> {
        const start = Date.now();
        try {
            const result = await this.pool.query(text, params);
            const duration = Date.now() - start;
            logger.debug('Query executed', { text, duration, rows: result.rowCount });
            return result;
        } catch (error) {
            logger.error('Query error:', { text, params, error });
            throw error;
        }
    }

    async getClient() {
        return await this.pool.connect();
    }

    async close(): Promise<void> {
        await this.pool.end();
        logger.info('Database connection pool closed');
    }
}

export const database = new Database(); 