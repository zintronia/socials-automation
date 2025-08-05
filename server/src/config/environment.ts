import dotenv from 'dotenv';
import path from 'path';

// Load environment-specific config
const NODE_ENV = process.env.NODE_ENV || 'development';
const envFile = `.env.${NODE_ENV}`;
const envPath = path.resolve(__dirname, '..', '..', envFile);

console.log('Loading environment configuration...');
console.log('Environment:', NODE_ENV);


try {
    const result = dotenv.config({ path: envPath });

    if (result.error) {
        throw new Error(`Failed to load environment file: ${result.error.message}`);
    }

    if (!result.parsed) {
        throw new Error('No environment variables were loaded');
    }

    console.log('Environment file loaded successfully');
} catch (error) {
    console.error('Error loading environment:', error);
    throw error;
}

// Debug: Print loaded environment variables (excluding sensitive data)
console.log('Loaded environment variables:', {
    NODE_ENV: process.env.NODE_ENV,
    DB_HOST: process.env.DB_HOST ? '✓' : '✗',
    DB_NAME: process.env.DB_NAME ? '✓' : '✗',
    DB_USER: process.env.DB_USER ? '✓' : '✗',
    JWT_SECRET: process.env.JWT_SECRET ? '✓' : '✗',
    AI_API_KEY: process.env.AI_API_KEY ? '✓' : '✗',
});

interface Config {
    environment: string;
    server: {
        port: number;
        host: string;
    };
    database: {
        host: string;
        port: number;
        name: string;
        user: string;
        password: string;
        maxConnections: number;
        ssl: boolean;
    };
    jwt: {
        secret: string;
        expiresIn: string;
        refreshSecret: string;
        refreshExpiresIn: string;
    };
    ai: {
        provider: 'openai' | 'gemini';
        apiKey: string;
        model: string;
        maxTokens: number;
        timeout: number;
    };
    rateLimit: {
        windowMs: number;
        maxRequests: number;
    };
    cors: {
        allowedOrigins: string[];
    };
    logging: {
        level: string;
        filePath: string;
    };
    api: {
        version: string;
    };
}

const requiredEnvVars = [
    'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD',
    'JWT_SECRET', 'AI_API_KEY', 'AI_MODEL',
];

// Validate required environment variables
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

export const config: Config = {
    environment: process.env.NODE_ENV || 'development',
    server: {
        port: parseInt(process.env.PORT || '3000'),
        host: process.env.HOST || 'localhost'
    },
    database: {
        host: process.env.DB_HOST!,
        port: parseInt(process.env.DB_PORT || '5432'),
        name: process.env.DB_NAME!,
        user: process.env.DB_USER!,
        password: process.env.DB_PASSWORD!,
        maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
        ssl: process.env.DB_SSL === 'true'
    },
    jwt: {
        secret: process.env.JWT_SECRET!,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!,
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
    },
    ai: {
        provider: (process.env.AI_PROVIDER || 'gemini') as 'openai' | 'gemini',
        apiKey: process.env.AI_API_KEY!,
        model: process.env.AI_MODEL || 'gpt-4',
        maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2000'),
        timeout: parseInt(process.env.AI_TIMEOUT || '30000')
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
    },
    cors: {
        allowedOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3001']
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        filePath: process.env.LOG_FILE_PATH || './logs/app.log'
    },
    api: {
        version: process.env.API_VERSION || 'v1'
    }
}; 