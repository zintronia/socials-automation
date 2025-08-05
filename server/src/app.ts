import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
// import dotenv from 'dotenv'; // Loaded in config/environment
import { config } from './config/environment';
import { database } from './config/database';
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

class Application {
    public app: express.Application;

    constructor() {
        this.app = express();
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
        const apiPrefix = `/api/${config.api.version}`;

        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                version: config.api.version
            });
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
        this.app.use(`${apiPrefix}/auth`, authRoutes);
        this.app.use(`${apiPrefix}/platforms`, platformRoutes);
        this.app.use(`${apiPrefix}/contexts`, contextRoutes);
        this.app.use(`${apiPrefix}/templates`, templateRoutes);
        this.app.use(`${apiPrefix}/posts`, postRoutes);
        this.app.use(`${apiPrefix}/campaigns`, campaignRoutes);

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

            const port = config.server.port;
            this.app.listen(port, () => {
                const baseUrl = `http://${config.server.host}:${port}`;
                logger.info(`Server running on port ${port} in ${config.environment} mode`);
                logger.info(`API documentation available at:`);
                logger.info(`- Swagger UI:     ${baseUrl}/api-docs`);
                logger.info(`- OpenAPI Spec:   ${baseUrl}/api-docs.json`);
                logger.info(`- Health Check:   ${baseUrl}/health`);
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
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully');
    await database.close();
    process.exit(0);
});

export default app; 