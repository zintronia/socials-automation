import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
// import dotenv from 'dotenv'; // Loaded in config/environment
import { config } from './config/environment';
import { database } from './config/database';
import { redisService } from './config/redis';
import { logger } from './utils/logger.utils';
import { errorMiddleware } from './middleware/error.middleware';
import { rateLimitMiddleware } from './middleware/rate-limit.middleware';
import { specs } from './config/swagger';
import { authRoutes } from './routes/auth.routes';
import { contextRoutes } from './routes/context.routes';
import { templateRoutes } from './routes/template.routes';
import { postRoutes } from './routes/post.routes';
import { platformRoutes } from './routes/platform.routes';
import campaignRoutes from './routes/campaign.routes';
import socialAccountRoutes from './routes/social-account.routes';
import oauth2TwitterRoutes from './routes/oauth2-twitter.routes';

class Application {
    public app: express.Application;
    private apiPrefix: string;

    constructor() {
        this.app = express();
        this.apiPrefix = `/api/${config.api.version}`;
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    private setupMiddleware(): void {
        // Security middleware
        this.app.use(helmet());
        this.app.use(cors({
            origin: config.cors.allowedOrigins,
            credentials: true
        }));

        // Performance middleware
        this.app.use(compression());
        this.app.use(rateLimitMiddleware);

        // Body parsing middleware
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Request logging
        this.app.use((req, res, next) => {
            logger.info(`${req.method} ${req.path}`, {
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            next();
        });
    }

    private setupRoutes(): void {

        // Health check
        this.app.get('/health', async (req, res) => {
            try {
                // Check database connection
                await database.query('SELECT 1');
                const dbStatus = 'connected';

                // Check Redis connection
                const redisStatus = await redisService.ping() ? 'connected' : 'disconnected';

                res.json({
                    status: 'OK',
                    timestamp: new Date().toISOString(),
                    version: config.api.version,
                    environment: config.environment,
                    services: {
                        database: dbStatus,
                        redis: redisStatus
                    }
                });
            } catch (error) {
                logger.error('Health check failed:', error);
                res.status(503).json({
                    status: 'ERROR',
                    timestamp: new Date().toISOString(),
                    version: config.api.version,
                    environment: config.environment,
                    error: 'Service unavailable'
                });
            }
        });

        // Swagger documentation
        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
            customCss: '.swagger-ui .topbar { display: none }',
            customSiteTitle: 'Social Media Automation API Documentation',
            customfavIcon: '/favicon.ico',
            swaggerOptions: {
                docExpansion: 'list',
                filter: true,
                showRequestHeaders: true,
                tryItOutEnabled: true
            }
        }));

        // API routes
        this.app.use(`${this.apiPrefix}/auth`, authRoutes);
        this.app.use(`${this.apiPrefix}/platforms`, platformRoutes);
        this.app.use(`${this.apiPrefix}/contexts`, contextRoutes);
        this.app.use(`${this.apiPrefix}/templates`, templateRoutes);
        this.app.use(`${this.apiPrefix}/posts`, postRoutes);
        this.app.use(`${this.apiPrefix}/campaigns`, campaignRoutes);

        // social media integration routes
        this.app.use(`${this.apiPrefix}/social-accounts`, socialAccountRoutes);
        this.app.use(`${this.apiPrefix}/oauth2/twitter`, oauth2TwitterRoutes);

        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                message: 'Route not found',
                path: req.originalUrl
            });
        });
    }

    private setupErrorHandling(): void {
        this.app.use(errorMiddleware);
    }

    public async start(): Promise<void> {
        try {
            // Test database connection
            await database.query('SELECT 1');

            // Test Redis connection
            const redisConnected = await redisService.ping();
            if (redisConnected) {
                logger.info('Redis connection established');
            } else {
                logger.warn('Redis connection failed - OAuth 2.0 features may not work properly');
            }

            const port = config.server.port;
            this.app.listen(port, () => {
                const baseUrl = `http://${config.server.host}:${port}`;
                logger.info(`Server running on port ${port} in ${config.environment} mode`);
                logger.info(`API documentation available at:`);
                logger.info(`- Swagger UI:     ${baseUrl}/api-docs`);
                logger.info(`- OpenAPI Spec:   ${baseUrl}/api-docs.json`);
                logger.info(`- Health Check:   ${baseUrl}/health`);
                logger.info(`- API Base URL:   ${baseUrl}${this.apiPrefix}`);
            });

        } catch (error) {
            logger.error('Failed to start application:', error);
            process.exit(1);
        }
    }
}

// Start application
const app = new Application();
app.start();

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully');
    await database.close();
    await redisService.disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully');
    await database.close();
    await redisService.disconnect();
    process.exit(0);
});

export default app; 