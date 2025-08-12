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
    REDIS_URL: process.env.REDIS_URL ? '✓' : '✗',
    TOKEN_ENCRYPTION_KEY: process.env.TOKEN_ENCRYPTION_KEY ? '✓' : '✗',
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
    redis: {
        url: string;
        host: string;
        port: number;
        password?: string;
        db: number;
        keyPrefix: string;
        maxRetriesPerRequest: number;
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
    session: {
        secret: string;
        name: string;
        maxAge: number;
        secure: boolean;
        httpOnly: boolean;
        sameSite: 'lax' | 'strict' | 'none' | boolean;
    };
    oauth: {
        tokenEncryptionKey: string;
        stateExpiryMinutes: number;
        pkceCodeVerifierLength: number;
        maxRefreshAttempts: number;
        refreshTokenExpiryDays: number;
    };
    twitter: {
        apiKey: string;
        apiSecret: string;
        clientId: string;
        clientSecret: string;
        callbackUrl: string;
        webhookEnv: string;
        oauth2Enabled: boolean;
    };
    linkedin: {
        clientId: string;
        clientSecret: string;
        callbackUrl: string;
        scopes: string[];
    };
    reddit: {
        clientId: string;
        clientSecret: string;
        callbackUrl: string;
        scopes: string[];
        usePKCE: boolean;
        duration: 'temporary' | 'permanent';
        userAgent: string;
    };
}

const requiredEnvVars = [
    'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD',
    'JWT_SECRET', 'AI_API_KEY', 'AI_MODEL',
    'REDIS_URL', 'TOKEN_ENCRYPTION_KEY',
    'TWITTER_CLIENT_ID', 'TWITTER_CLIENT_SECRET', 'TWITTER_CALLBACK_URL',
    'LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET', 'LINKEDIN_CALLBACK_URL'
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
    redis: {
        url: process.env.REDIS_URL!,
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
        keyPrefix: process.env.REDIS_KEY_PREFIX || 'social_media:',
        maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3')
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
    },
    session: {
        secret: process.env.SESSION_SECRET || process.env.JWT_SECRET!,
        name: 'sid',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax' as const,
    },
    oauth: {
        tokenEncryptionKey: process.env.TOKEN_ENCRYPTION_KEY!,
        stateExpiryMinutes: parseInt(process.env.OAUTH_STATE_EXPIRY_MINUTES || '10'),
        pkceCodeVerifierLength: parseInt(process.env.PKCE_CODE_VERIFIER_LENGTH || '128'),
        maxRefreshAttempts: parseInt(process.env.OAUTH_MAX_REFRESH_ATTEMPTS || '3'),
        refreshTokenExpiryDays: parseInt(process.env.OAUTH_REFRESH_TOKEN_EXPIRY_DAYS || '90')
    },
    twitter: {
        apiKey: process.env.TWITTER_API_KEY || '',
        apiSecret: process.env.TWITTER_API_SECRET || '',
        clientId: process.env.TWITTER_CLIENT_ID!,
        clientSecret: process.env.TWITTER_CLIENT_SECRET!,
        callbackUrl: process.env.TWITTER_CALLBACK_URL!,
        webhookEnv: process.env.TWITTER_WEBHOOK_ENV || 'development',
        oauth2Enabled: process.env.TWITTER_OAUTH2_ENABLED === 'true'
    },
    linkedin: {
        clientId: process.env.LINKEDIN_CLIENT_ID!,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
        callbackUrl: process.env.LINKEDIN_CALLBACK_URL!,
        scopes: process.env.LINKEDIN_SCOPES?.split(',') || [
            'profile',
            'email',
            'openid',
            'w_member_social',
            'w_organization_social'
        ]
    },
    reddit: {
        clientId: process.env.REDDIT_CLIENT_ID || '',
        clientSecret: process.env.REDDIT_CLIENT_SECRET || '',
        callbackUrl: process.env.REDDIT_CALLBACK_URL || '',
        scopes: process.env.REDDIT_SCOPES?.split(',') || [
            'identity',
            'read',
            'submit',
            'vote',
            'mysubreddits',
            'save'
        ],
        usePKCE: (process.env.REDDIT_USE_PKCE || 'true') === 'true',
        duration: (process.env.REDDIT_AUTH_DURATION as 'temporary' | 'permanent') || 'permanent',
        userAgent: process.env.REDDIT_USER_AGENT || 'social-automation/1.0 by your-app'
    }
};