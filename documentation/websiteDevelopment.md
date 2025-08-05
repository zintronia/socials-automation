# Social Media Automation Backend - Complete Implementation Guide

## Updated Architecture Overview

This documentation has been updated to reflect the new simplified database schema and backend architecture. The key changes include:

### Major Schema Changes
1. **Contexts Independence**: Contexts are now platform and template agnostic, making them reusable across different platforms
2. **Post Generation Flow**: Posts now reference both `context_id` and `template_id` for generation, providing more flexibility
3. **System Templates**: Added `is_system_template` flag to distinguish between system and user templates
4. **Simplified Structure**: Removed unnecessary tables (`template_types`, `template_variables`, `context_tags`)

### New Workflow
1. **Create Context**: Upload or create content independent of platform/template
2. **Select Template**: Choose appropriate template for target platform
3. **Generate Post**: AI generates platform-specific content using context + template
4. **Publish/Schedule**: Post is ready for publishing or scheduling

### Benefits of New Architecture
- **Reusability**: One context can generate posts for multiple platforms
- **Flexibility**: Templates can be applied to any context
- **Simplicity**: Cleaner data model with fewer dependencies
- **Scalability**: Easier to add new platforms and templates

## Tech Stack & Architecture

### Core Technologies
- **Runtime**: Node.js 18+ with TypeScript
- **Database**: PostgreSQL 15+
- **API Framework**: Express.js with TypeScript
- **Authentication**: JWT with bcrypt
- **AI Integration**: OpenAI GPT-4 API
- **Environment Management**: dotenv
- **Process Management**: PM2 (production)
- **Database Connection**: pg (node-postgres)
- **Validation**: Joi
- **Logging**: Winston
- **Rate Limiting**: express-rate-limit
- **CORS**: cors middleware

### Project Structure

```
social-media-backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── environment.ts
│   │   ├── ai.ts
│   │   └── constants.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── context.controller.ts
│   │   ├── template.controller.ts
│   │   ├── post.controller.ts
│   │   └── platform.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── rate-limit.middleware.ts
│   ├── models/
│   │   ├── base.model.ts
│   │   ├── user.model.ts
│   │   ├── context.model.ts
│   │   ├── template.model.ts
│   │   └── post.model.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── context.routes.ts
│   │   ├── template.routes.ts
│   │   ├── post.routes.ts
│   │   └── platform.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── context.service.ts
│   │   ├── template.service.ts
│   │   ├── post.service.ts
│   │   ├── ai.service.ts
│   │   └── platform.service.ts
│   ├── utils/
│   │   ├── database.utils.ts
│   │   ├── validation.utils.ts
│   │   ├── logger.utils.ts
│   │   └── response.utils.ts
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── context.types.ts
│   │   ├── template.types.ts
│   │   ├── post.types.ts
│   │   └── common.types.ts
│   └── app.ts
├── database/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   └── 002_seed_default_data.sql
│   └── scripts/
│       ├── setup.sql
│       └── cleanup.sql
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── docs/
│   ├── api.md
│   ├── deployment.md
│   └── ai-instructions.md
├── .env.example
├── .env.development
├── .env.production
├── package.json
├── tsconfig.json
├── ecosystem.config.js (PM2)
└── docker-compose.yml
```

## Environment Configuration

### .env.example
```env
# Application
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=social_media_automation
DB_USER=postgres
DB_PASSWORD=your_password
DB_MAX_CONNECTIONS=20

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# AI Configuration
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=2000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=./logs/app.log
```

## Updated Database Schema

### Key Changes from Previous Version

1. **Contexts Independence**: Contexts are now platform and template agnostic
2. **Post Generation Flow**: Posts reference both context and template for generation
3. **System Templates**: Added `is_system_template` flag for better template management
4. **Simplified Structure**: Removed unnecessary tables (template_types, template_variables, context_tags)

### Database Schema Overview

```sql
-- Core Tables
users                    -- User authentication and profiles
platforms               -- Social media platforms (Twitter, LinkedIn, etc.)
content_categories      -- Content types (promotional, educational, etc.)
context_templates       -- AI generation templates with system/user ownership
contexts                -- Content sources (independent of platform/template)
posts                   -- Generated posts linking context + template + platform
media                   -- File attachments and media content
```

## Core Implementation Files

### 1. Database Configuration (src/config/database.ts)

```typescript
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
```

### 2. AI Service (src/services/ai.service.ts)

```typescript
import OpenAI from 'openai';
import { config } from '../config/environment';
import { logger } from '../utils/logger.utils';
import { 
  ContextTemplate, 
  Context, 
  Platform, 
  AIGenerationRequest,
  AIGenerationResponse 
} from '../types';

class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.ai.apiKey,
    });
  }

  async generatePost(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    try {
      const { context, template, platform } = request;
      
      const systemPrompt = this.buildSystemPrompt(template, platform);
      const userPrompt = this.buildUserPrompt(context, template);

      const completion = await this.openai.chat.completions.create({
        model: config.ai.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: config.ai.maxTokens,
        temperature: 0.7,
      });

      const generatedContent = completion.choices[0]?.message?.content;
      
      if (!generatedContent) {
        throw new Error('No content generated from AI');
      }

      return {
        content: generatedContent,
        usage: completion.usage,
        model: completion.model,
      };

    } catch (error) {
      logger.error('AI generation error:', error);
      throw new Error('Failed to generate content');
    }
  }

  private buildSystemPrompt(template: ContextTemplate, platform: Platform): string {
    const baseInstructions = `
You are an expert social media content creator specializing in ${platform.name} content.

PLATFORM CONSTRAINTS:
- Maximum content length: ${platform.max_content_length} characters
- Supported media types: ${platform.supported_media_types?.join(', ')}
- Platform-specific rules: ${JSON.stringify(platform.platform_constraints)}

CONTENT REQUIREMENTS:
- Tone: ${template.tone}
- Writing Style: ${template.writing_style}
- Target Audience: ${template.target_audience}
- Content Category: ${template.category_id}

TEMPLATE INSTRUCTIONS:
${template.system_instructions}

FORMATTING RULES:
${this.getPlatformFormattingRules(platform)}

ENGAGEMENT OPTIMIZATION:
- Include ${template.use_hashtags ? `up to ${template.max_hashtags} relevant hashtags` : 'no hashtags'}
- Hashtag strategy: ${template.hashtag_strategy}
- Include call-to-action: ${template.include_cta ? 'Yes' : 'No'}
- CTA Type: ${template.cta_type}
- Engagement level: ${template.engagement_level}

OUTPUT FORMAT:
Return ONLY the final post content, properly formatted for ${platform.name}.
Do not include explanations or metadata.
    `;

    return baseInstructions.trim();
  }

  private buildUserPrompt(context: Context, template: ContextTemplate): string {
    let prompt = `
CONTENT SOURCE:
Title: ${context.title}
Topic: ${context.topic || 'Not specified'}
Brief: ${context.brief || 'Not provided'}

MAIN CONTENT:
${context.content}

ADDITIONAL CONTEXT:
- Language: ${context.language}
- Region: ${context.region || 'Global'}
- Source Type: ${context.type}
    `;

    // Add template variables if they exist
    if (context.template_variables) {
      prompt += `\n\nTEMPLATE VARIABLES:\n`;
      Object.entries(context.template_variables).forEach(([key, value]) => {
        prompt += `- ${key}: ${value}\n`;
      });
    }

    // Add specific instructions based on content category
    prompt += this.getCategorySpecificInstructions(template.category_id);

    prompt += `\n\nGenerate an engaging ${template.tone} post that will resonate with ${template.target_audience}.`;

    return prompt.trim();
  }

  private getPlatformFormattingRules(platform: Platform): string {
    const rules: Record<string, string> = {
      'Twitter': `
- Keep it concise and punchy
- Use line breaks for readability
- Include relevant hashtags at the end
- Consider thread format for longer content
      `,
      'LinkedIn': `
- Start with a compelling hook
- Use professional language
- Include paragraph breaks
- End with a thought-provoking question
- Use relevant professional hashtags
      `,
      'Instagram': `
- Start with an attention-grabbing first line
- Use emojis strategically
- Include line breaks for readability
- Use a mix of popular and niche hashtags
- Include a clear call-to-action
      `,
      'Facebook': `
- Write in a conversational tone
- Use storytelling when appropriate
- Include engaging questions
- Use minimal hashtags (2-3 max)
      `
    };

    return rules[platform.name] || 'Follow general social media best practices';
  }

  private getCategorySpecificInstructions(categoryId: number): string {
    const instructions: Record<number, string> = {
      1: '\nFocus on promotional messaging while providing value to the audience.',
      2: '\nPrioritize educational value and actionable insights.',
      3: '\nMaximize engagement potential with questions and interactive elements.',
      4: '\nCreate entertaining content that brings joy and shareability.',
      5: '\nPresent information clearly and objectively.',
      6: '\nUse authentic, personal storytelling approach.',
    };

    return instructions[categoryId] || '';
  }
}

export const aiService = new AIService();
```

### 3. Context Service (src/services/context.service.ts)

```typescript
import { database } from '../config/database';
import { Context, CreateContextRequest, UpdateContextRequest } from '../types';
import { logger } from '../utils/logger.utils';

class ContextService {
  async create(userId: number, contextData: CreateContextRequest): Promise<Context> {
    const client = await database.getClient();
    
    try {
      await client.query('BEGIN');

      // Insert context (now independent of platform/template)
      const insertQuery = `
        INSERT INTO contexts (
          user_id, type, title, topic, brief, content, source, mimetype, size
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;

      const values = [
        userId,
        contextData.type,
        contextData.title,
        contextData.topic,
        contextData.brief,
        contextData.content,
        contextData.source,
        contextData.mimetype,
        contextData.size
      ];

      const result = await client.query(insertQuery, values);
      const context = result.rows[0];

      await client.query('COMMIT');
      logger.info('Context created successfully', { contextId: context.id, userId });
      
      return context;

    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error creating context:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async getById(id: number, userId: number): Promise<Context | null> {
    const query = `
      SELECT c.*
      FROM contexts c
      WHERE c.id = $1 AND c.user_id = $2
    `;

    const result = await database.query(query, [id, userId]);
    return result.rows[0] || null;
  }

  async getByUser(userId: number, filters?: any): Promise<Context[]> {
    let query = `
      SELECT c.*
      FROM contexts c
      WHERE c.user_id = $1
    `;

    const params = [userId];
    let paramCount = 1;

    if (filters?.type) {
      query += ` AND c.type = $${++paramCount}`;
      params.push(filters.type);
    }

    query += ' ORDER BY c.created_at DESC';

    if (filters?.limit) {
      query += ` LIMIT $${++paramCount}`;
      params.push(filters.limit);
    }

    const result = await database.query(query, params);
    return result.rows;
  }

  async update(id: number, userId: number, updateData: UpdateContextRequest): Promise<Context> {
    const setClause = [];
    const values = [];
    let paramCount = 0;

    // Build dynamic update query
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        setClause.push(`${key} = $${++paramCount}`);
        values.push(key === 'template_variables' ? JSON.stringify(value) : value);
      }
    });

    if (setClause.length === 0) {
      throw new Error('No fields to update');
    }

    setClause.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id, userId);

    const query = `
      UPDATE contexts 
      SET ${setClause.join(', ')}
      WHERE id = $${++paramCount} AND user_id = $${++paramCount}
      RETURNING *
    `;

    const result = await database.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Context not found or not accessible');
    }

    return result.rows[0];
  }

  // Note: Contexts no longer have processing status since they're independent
  // Processing happens during post generation instead

  async delete(id: number, userId: number): Promise<boolean> {
    const query = 'DELETE FROM contexts WHERE id = $1 AND user_id = $2';
    const result = await database.query(query, [id, userId]);
    return result.rowCount > 0;
  }
}

export const contextService = new ContextService();
```

### 4. Post Generation Flow (src/services/post.service.ts)

```typescript
import { database } from '../config/database';
import { aiService } from './ai.service';
import { contextService } from './context.service';
import { templateService } from './template.service';
import { platformService } from './platform.service';
import { Post, CreatePostRequest, GeneratePostRequest } from '../types';
import { logger } from '../utils/logger.utils';

class PostService {
  async generateAndCreate(userId: number, request: GeneratePostRequest): Promise<Post> {
    const client = await database.getClient();
    
    try {
      await client.query('BEGIN');

      // Fetch context (now independent)
      const context = await contextService.getById(request.context_id, userId);
      if (!context) {
        throw new Error('Context not found');
      }

      // Fetch template (required for generation)
      const template = await templateService.getById(request.template_id, userId);
      if (!template) {
        throw new Error('Template not found or not accessible');
      }

      // Fetch platform details
      const platform = await platformService.getById(request.platform_id);
      if (!platform) {
        throw new Error('Platform not found');
      }

      // Generate content using AI
      const aiResponse = await aiService.generatePost({
        context,
        template,
        platform
      });

      // Create post record with template reference
      const createPostData: CreatePostRequest = {
        user_id: userId,
        context_id: request.context_id,
        template_id: request.template_id,
        platform_id: request.platform_id,
        content: aiResponse.content,
        status: 'draft',
        scheduled_for: request.scheduled_for,
        metadata: {
          ai_model: aiResponse.model,
          ai_usage: aiResponse.usage,
          generation_timestamp: new Date().toISOString()
        }
      };

      const post = await this.create(createPostData);

      await client.query('COMMIT');
      logger.info('Post generated and created successfully', { 
        postId: post.id, 
        userId, 
        contextId: request.context_id,
        templateId: request.template_id
      });

      return post;

    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error generating post:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async create(postData: CreatePostRequest): Promise<Post> {
    const query = `
      INSERT INTO posts (
        user_id, context_id, template_id, platform_id, content, status, 
        scheduled_for, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      postData.user_id,
      postData.context_id,
      postData.template_id,
      postData.platform_id,
      postData.content,
      postData.status || 'draft',
      postData.scheduled_for,
      JSON.stringify(postData.metadata || {})
    ];

    const result = await database.query(query, values);
    return result.rows[0];
  }

  async getById(id: number, userId: number): Promise<Post | null> {
    const query = `
      SELECT 
        p.*,
        c.title as context_title,
        pl.name as platform_name,
        u.email as user_email
      FROM posts p
      LEFT JOIN contexts c ON p.context_id = c.id
      LEFT JOIN platforms pl ON p.platform_id = pl.id
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = $1 AND p.user_id = $2
    `;

    const result = await database.query(query, [id, userId]);
    return result.rows[0] || null;
  }

  async getByUser(userId: number, filters?: any): Promise<Post[]> {
    let query = `
      SELECT 
        p.*,
        c.title as context_title,
        pl.name as platform_name
      FROM posts p
      LEFT JOIN contexts c ON p.context_id = c.id
      LEFT JOIN platforms pl ON p.platform_id = pl.id
      WHERE p.user_id = $1
    `;

    const params = [userId];
    let paramCount = 1;

    if (filters?.status) {
      query += ` AND p.status = $${++paramCount}`;
      params.push(filters.status);
    }

    if (filters?.platform_id) {
      query += ` AND p.platform_id = $${++paramCount}`;
      params.push(filters.platform_id);
    }

    query += ' ORDER BY p.created_at DESC';

    if (filters?.limit) {
      query += ` LIMIT $${++paramCount}`;
      params.push(filters.limit);
    }

    const result = await database.query(query, params);
    return result.rows;
  }

  async updateStatus(id: number, userId: number, status: string, metadata?: any): Promise<Post> {
    const query = `
      UPDATE posts 
      SET status = $1, metadata = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND user_id = $4
      RETURNING *
    `;

    const result = await database.query(query, [
      status,
      JSON.stringify(metadata || {}),
      id,
      userId
    ]);

    if (result.rows.length === 0) {
      throw new Error('Post not found or not accessible');
    }

    return result.rows[0];
  }

  async schedulePost(id: number, userId: number, scheduledFor: Date): Promise<Post> {
    const query = `
      UPDATE posts 
      SET scheduled_for = $1, status = 'scheduled', updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `;

    const result = await database.query(query, [scheduledFor, id, userId]);

    if (result.rows.length === 0) {
      throw new Error('Post not found or not accessible');
    }

    return result.rows[0];
  }

  async getScheduledPosts(): Promise<Post[]> {
    const query = `
      SELECT p.*, pl.name as platform_name, u.email as user_email
      FROM posts p
      JOIN platforms pl ON p.platform_id = pl.id
      JOIN users u ON p.user_id = u.id
      WHERE p.status = 'scheduled' 
      AND p.scheduled_for <= CURRENT_TIMESTAMP
      ORDER BY p.scheduled_for ASC
    `;

    const result = await database.query(query);
    return result.rows;
  }
}

export const postService = new PostService();
```

## API Controllers & Routes

### Context Controller (src/controllers/context.controller.ts)

```typescript
import { Request, Response } from 'express';
import { contextService } from '../services/context.service';
import { respondWithSuccess, respondWithError } from '../utils/response.utils';
import { logger } from '../utils/logger.utils';

export class ContextController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id; // From auth middleware
      const context = await contextService.create(userId, req.body);
      respondWithSuccess(res, context, 'Context created successfully', 201);
    } catch (error) {
      logger.error('Context creation error:', error);
      respondWithError(res, 'Failed to create context', 400);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const contextId = parseInt(req.params.id);
      
      const context = await contextService.getById(contextId, userId);
      if (!context) {
        respondWithError(res, 'Context not found', 404);
        return;
      }

      respondWithSuccess(res, context, 'Context retrieved successfully');
    } catch (error) {
      logger.error('Context retrieval error:', error);
      respondWithError(res, 'Failed to retrieve context', 500);
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const filters = {
        type: req.query.type as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      };

      const contexts = await contextService.getByUser(userId, filters);
      respondWithSuccess(res, contexts, 'Contexts retrieved successfully');
    } catch (error) {
      logger.error('Contexts retrieval error:', error);
      respondWithError(res, 'Failed to retrieve contexts', 500);
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const contextId = parseInt(req.params.id);
      
      const context = await contextService.update(contextId, userId, req.body);
      respondWithSuccess(res, context, 'Context updated successfully');
    } catch (error) {
      logger.error('Context update error:', error);
      respondWithError(res, 'Failed to update context', 400);
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const contextId = parseInt(req.params.id);
      
      const deleted = await contextService.delete(contextId, userId);
      if (!deleted) {
        respondWithError(res, 'Context not found', 404);
        return;
      }

      respondWithSuccess(res, null, 'Context deleted successfully');
    } catch (error) {
      logger.error('Context deletion error:', error);
      respondWithError(res, 'Failed to delete context', 500);
    }
  }
}

export const contextController = new ContextController();
```

## Deployment & Environment Setup

### Docker Configuration (docker-compose.yml)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: social_media_automation
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/migrations:/docker-entrypoint-initdb.d
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - app-network

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      REDIS_HOST: redis
    depends_on:
      - postgres
      - redis
    networks:
      - app-network
    volumes:
      - ./logs:/app/logs

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

### PM2 Configuration (ecosystem.config.js)

```javascript
module.exports = {
  apps: [
    {
      name: 'social-media-api',
      script: 'dist/app.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      max_memory_restart: '1G',
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
```

## Complete Application Flow

### 1. Main Application Entry (src/app.ts)

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config/environment';
import { database } from './config/database';
import { logger } from './utils/logger.utils';
import { errorMiddleware } from './middleware/error.middleware';
import { rateLimitMiddleware } from './middleware/rate-limit.middleware';

// Route imports
import { authRoutes } from './routes/auth.routes';
import { contextRoutes } from './routes/context.routes';
import { templateRoutes } from './routes/template.routes';
import { postRoutes } from './routes/post.routes';
import { platformRoutes } from './routes/platform.routes';

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

    // API routes
    this.app.use(`${apiPrefix}/auth`, authRoutes);
    this.app.use(`${apiPrefix}/contexts`, contextRoutes);
    this.app.use(`${apiPrefix}/templates`, templateRoutes);
    this.app.use(`${apiPrefix}/posts`, postRoutes);
    this.app.use(`${apiPrefix}/platforms`, platformRoutes);

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
      logger.info('Database connection established');

      const port = config.server.port;
      this.app.listen(port, () => {
        logger.info(`Server running on port ${port} in ${config.environment} mode`);
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
```

### 2. Authentication Middleware (src/middleware/auth.middleware.ts)

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { database } from '../config/database';
import { logger } from '../utils/logger.utils';

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authMiddleware = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required'
      });
      return;
    }

    const decoded = jwt.verify(token, config.jwt.secret) as any;
    
    // Fetch user from database
    const userQuery = 'SELECT id, email, first_name, last_name, role, is_active FROM users WHERE id = $1';
    const userResult = await database.query(userQuery, [decoded.userId]);

    if (userResult.rows.length === 0) {
      res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
      return;
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
      return;
    }

    req.user = user;
    next();

  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

export const optionalAuthMiddleware = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    const userQuery = 'SELECT id, email, first_name, last_name, role FROM users WHERE id = $1';
    const userResult = await database.query(userQuery, [decoded.userId]);

    if (userResult.rows.length > 0) {
      req.user = userResult.rows[0];
    }
  } catch (error) {
    // Ignore invalid tokens for optional auth
    logger.debug('Optional auth failed:', error);
  }

  next();
};
```

### 3. Complete Post Routes (src/routes/post.routes.ts)

```typescript
import { Router } from 'express';
import { postController } from '../controllers/post.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { generatePostSchema, updatePostSchema } from '../utils/validation.utils';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Generate and create post from context
router.post('/generate', validateRequest(generatePostSchema), postController.generatePost);

// Get all posts for user
router.get('/', postController.getAll);

// Get specific post
router.get('/:id', postController.getById);

// Update post
router.put('/:id', validateRequest(updatePostSchema), postController.update);

// Schedule post
router.post('/:id/schedule', postController.schedule);

// Publish post immediately
router.post('/:id/publish', postController.publish);

// Delete post
router.delete('/:id', postController.delete);

// Get post analytics (if available)
router.get('/:id/analytics', postController.getAnalytics);

export { router as postRoutes };
```

### 4. Post Controller Complete Implementation (src/controllers/post.controller.ts)

```typescript
import { Request, Response } from 'express';
import { postService } from '../services/post.service';
import { respondWithSuccess, respondWithError } from '../utils/response.utils';
import { logger } from '../utils/logger.utils';

export class PostController {
  async generatePost(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { context_id, template_id, platform_id, scheduled_for } = req.body;

      const post = await postService.generateAndCreate(userId, {
        context_id,
        template_id,
        platform_id,
        scheduled_for: scheduled_for ? new Date(scheduled_for) : undefined
      });

      respondWithSuccess(res, post, 'Post generated successfully', 201);
    } catch (error) {
      logger.error('Post generation error:', error);
      respondWithError(res, error.message || 'Failed to generate post', 400);
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const filters = {
        status: req.query.status as string,
        platform_id: req.query.platform_id ? parseInt(req.query.platform_id as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50
      };

      const posts = await postService.getByUser(userId, filters);
      respondWithSuccess(res, posts, 'Posts retrieved successfully');
    } catch (error) {
      logger.error('Posts retrieval error:', error);
      respondWithError(res, 'Failed to retrieve posts', 500);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const postId = parseInt(req.params.id);

      const post = await postService.getById(postId, userId);
      if (!post) {
        respondWithError(res, 'Post not found', 404);
        return;
      }

      respondWithSuccess(res, post, 'Post retrieved successfully');
    } catch (error) {
      logger.error('Post retrieval error:', error);
      respondWithError(res, 'Failed to retrieve post', 500);
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const postId = parseInt(req.params.id);
      const { content, scheduled_for } = req.body;

      const post = await postService.update(postId, userId, {
        content,
        scheduled_for: scheduled_for ? new Date(scheduled_for) : undefined
      });

      respondWithSuccess(res, post, 'Post updated successfully');
    } catch (error) {
      logger.error('Post update error:', error);
      respondWithError(res, error.message || 'Failed to update post', 400);
    }
  }

  async schedule(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const postId = parseInt(req.params.id);
      const { scheduled_for } = req.body;

      if (!scheduled_for) {
        respondWithError(res, 'scheduled_for is required', 400);
        return;
      }

      const post = await postService.schedulePost(postId, userId, new Date(scheduled_for));
      respondWithSuccess(res, post, 'Post scheduled successfully');
    } catch (error) {
      logger.error('Post scheduling error:', error);
      respondWithError(res, error.message || 'Failed to schedule post', 400);
    }
  }

  async publish(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const postId = parseInt(req.params.id);

      // This would integrate with actual platform APIs
      const post = await postService.publishPost(postId, userId);
      respondWithSuccess(res, post, 'Post published successfully');
    } catch (error) {
      logger.error('Post publishing error:', error);
      respondWithError(res, error.message || 'Failed to publish post', 400);
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const postId = parseInt(req.params.id);

      const deleted = await postService.delete(postId, userId);
      if (!deleted) {
        respondWithError(res, 'Post not found', 404);
        return;
      }

      respondWithSuccess(res, null, 'Post deleted successfully');
    } catch (error) {
      logger.error('Post deletion error:', error);
      respondWithError(res, 'Failed to delete post', 500);
    }
  }

  async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const postId = parseInt(req.params.id);

      const analytics = await postService.getAnalytics(postId, userId);
      respondWithSuccess(res, analytics, 'Analytics retrieved successfully');
    } catch (error) {
      logger.error('Analytics retrieval error:', error);
      respondWithError(res, 'Failed to retrieve analytics', 500);
    }
  }
}

export const postController = new PostController();
```

## AI Training Instructions & Template Generation

### AI System Instructions Documentation (docs/ai-instructions.md)

```markdown
# AI Content Generation Instructions

## Core Principles

### 1. Platform-First Approach
The AI must understand that each social media platform has unique:
- Character limits and formatting requirements
- Audience expectations and content styles
- Engagement patterns and algorithms
- Visual content requirements

### 2. Context Understanding
The AI should analyze the provided context to understand:
- **Source Material**: What type of content is being adapted
- **Target Audience**: Who the content is intended for
- **Business Objective**: What the content should achieve
- **Brand Voice**: How the content should sound

### 3. Template-Driven Generation
Templates provide structured guidance including:
- **System Instructions**: Core generation rules
- **Tone & Style**: How content should feel
- **Formatting Rules**: Platform-specific structure
- **Engagement Strategy**: How to maximize interaction

## Platform-Specific Instructions

### Twitter/X Generation Rules
```
CONSTRAINTS:
- Maximum 280 characters
- Use threads for longer content (max 25 tweets)
- Include 1-3 relevant hashtags maximum
- Mention handles when appropriate (@username)

STYLE REQUIREMENTS:
- Start with a hook in the first tweet
- Use conversational tone
- Include actionable insights
- End with engagement question or CTA

FORMATTING:
- Use line breaks for readability
- Emojis sparingly (1-2 maximum)
- Numbers and statistics draw attention
- Use bullet points with • symbol
```

### LinkedIn Generation Rules  
```
CONSTRAINTS:
- Optimal length: 150-300 words
- Maximum 3000 characters
- Professional tone required
- Include 3-5 industry hashtags

STRUCTURE:
- Hook (first line is crucial)
- Context/Problem statement
- Solution/Insight
- Call to action or question

ENGAGEMENT:
- Ask thought-provoking questions
- Share personal experiences
- Include industry insights
- Tag relevant professionals when appropriate
```

### Instagram Generation Rules
```
CONSTRAINTS:
- First line must grab attention (appears in feed)
- 125 characters show without "more" button
- Use 15-30 hashtags (mix of popular and niche)
- Include emoji strategically

STRUCTURE:
- Attention-grabbing first line
- Story or valuable content
- Call to action
- Hashtags at the end

STYLE:
- Conversational and authentic
- Use storytelling approach
- Include personal touches
- Visual content descriptions when relevant
```

## Content Category Instructions

### Promotional Content
```
GUIDELINES:
- Lead with value, not the sale
- Use the 80/20 rule (80% value, 20% promotion)
- Include social proof when possible
- Clear but soft call-to-action

AVOID:
- Direct sales language
- Multiple CTAs in one post
- Overly promotional tone
- Generic marketing speak
```

### Educational Content
```
GUIDELINES:
- Break down complex topics
- Use numbered lists or steps
- Include actionable takeaways
- Cite credible sources when relevant

STRUCTURE:
- Clear headline/topic
- Key points or steps
- Practical application
- Encouragement to implement
```

### Engagement Content
```
GUIDELINES:
- Ask open-ended questions
- Create polls or surveys
- Share controversial (but respectful) opinions
- Use interactive elements

TECHNIQUES:
- "What's your experience with..."
- "Agree or disagree:"
- "Fill in the blank:"
- "This or that?"
```

## Dynamic Variable Handling

When template variables are provided:
- Replace {company_name} with actual company name
- Substitute {product_name} with specific product
- Use {event_date} in appropriate date format
- Adapt {target_audience} language accordingly

Example:
Template: "Excited to announce {product_name} launch at {event_date}! Perfect for {target_audience} looking to..."
Generated: "Excited to announce EcoClean Pro launch on March 15th! Perfect for busy professionals looking to..."
```

### 5. Template Service Implementation (src/services/template.service.ts)

```typescript
import { database } from '../config/database';
import { ContextTemplate, CreateTemplateRequest, UpdateTemplateRequest } from '../types';
import { logger } from '../utils/logger.utils';

class TemplateService {
  async create(userId: number, templateData: CreateTemplateRequest): Promise<ContextTemplate> {
    const query = `
      INSERT INTO context_templates (
        user_id, platform_id, category_id, name, description,
        system_instructions, tone, writing_style, target_audience,
        use_hashtags, max_hashtags, hashtag_strategy, include_cta, cta_type,
        content_structure, engagement_level, call_to_action_templates,
        is_public, is_system_template
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *
    `;

    const values = [
      userId,
      templateData.platform_id,
      templateData.category_id,
      templateData.name,
      templateData.description,
      templateData.system_instructions,
      templateData.tone,
      templateData.writing_style,
      templateData.target_audience,
      templateData.use_hashtags !== false,
      templateData.max_hashtags || 5,
      templateData.hashtag_strategy || 'niche',
      templateData.include_cta || false,
      templateData.cta_type,
      JSON.stringify(templateData.content_structure || {}),
      templateData.engagement_level || 'medium',
      templateData.call_to_action_templates || [],
      templateData.is_public || false,
      false // is_system_template - user templates are never system templates
    ];

    const result = await database.query(query, values);
    const template = result.rows[0];

    logger.info('Template created successfully', { templateId: template.id, userId });
    return template;
  }

  async getById(id: number, userId?: number): Promise<ContextTemplate | null> {
    const query = `
      SELECT 
        ct.*,
        cc.name as category_name,
        p.name as platform_name
      FROM context_templates ct
      LEFT JOIN content_categories cc ON ct.category_id = cc.id
      LEFT JOIN platforms p ON ct.platform_id = p.id
      WHERE ct.id = $1 
      AND (ct.user_id = $2 OR ct.is_system_template = true OR ct.is_public = true)
    `;

    const result = await database.query(query, [id, userId]);
    return result.rows[0] || null;
  }

  async getDefaultForPlatform(platformId: number): Promise<ContextTemplate | null> {
    const query = `
      SELECT ct.*, cc.name as category_name, p.name as platform_name
      FROM context_templates ct
      LEFT JOIN content_categories cc ON ct.category_id = cc.id
      LEFT JOIN platforms p ON ct.platform_id = p.id
      WHERE ct.platform_id = $1 
      AND ct.is_default = true 
      AND ct.is_system_template = true
    `;

    const result = await database.query(query, [platformId]);
    return result.rows[0] || null;
  }

  async getByUser(userId: number, filters?: any): Promise<ContextTemplate[]> {
    let query = `
      SELECT 
        ct.*,
        cc.name as category_name,
        p.name as platform_name
      FROM context_templates ct
      LEFT JOIN content_categories cc ON ct.category_id = cc.id
      LEFT JOIN platforms p ON ct.platform_id = p.id
      WHERE (ct.user_id = $1 OR ct.is_system_template = true OR ct.is_public = true)
    `;

    const params = [userId];
    let paramCount = 1;

    if (filters?.platform_id) {
      query += ` AND ct.platform_id = $${++paramCount}`;
      params.push(filters.platform_id);
    }

    if (filters?.category_id) {
      query += ` AND ct.category_id = $${++paramCount}`;
      params.push(filters.category_id);
    }

    if (filters?.is_system_template !== undefined) {
      query += ` AND ct.is_system_template = $${++paramCount}`;
      params.push(filters.is_system_template);
    }

    query += ' ORDER BY ct.is_default DESC, ct.created_at DESC';

    const result = await database.query(query, params);
    return result.rows;
  }

  // Note: Template variables are no longer used in the new schema

  async createDefaultTemplates(): Promise<void> {
    const defaultTemplates = [
      {
        platform_id: 1, // Twitter
        category_id: 2, // Educational
        name: 'Twitter Educational Default',
        description: 'Default template for educational Twitter content',
        system_instructions: `Create engaging, educational Twitter content that provides value in under 280 characters. Focus on actionable insights and encourage engagement.`,
        tone: 'professional',
        writing_style: 'concise',
        target_audience: 'general',
        use_hashtags: true,
        max_hashtags: 3,
        hashtag_strategy: 'trending',
        include_cta: true,
        cta_type: 'engage',
        content_structure: {
          format: 'hook_insight_cta',
          elements: ['hook', 'insight', 'hashtags']
        },
        engagement_level: 'high',
        call_to_action_templates: [
          'What\'s your experience with this?',
          'Thoughts?',
          'Have you tried this approach?'
        ]
      },
      {
        platform_id: 2, // LinkedIn
        category_id: 1, // Promotional
        name: 'LinkedIn Professional Default',
        description: 'Default template for professional LinkedIn content',
        system_instructions: `Create professional LinkedIn content that establishes thought leadership while subtly promoting services. Use storytelling and industry insights.`,
        tone: 'professional',
        writing_style: 'detailed',
        target_audience: 'professionals',
        use_hashtags: true,
        max_hashtags: 5,
        hashtag_strategy: 'niche',
        include_cta: true,
        cta_type: 'visit_link',
        content_structure: {
          format: 'story_insight_cta',
          elements: ['hook', 'story', 'insight', 'cta', 'hashtags']
        },
        engagement_level: 'medium',
        call_to_action_templates: [
          'What are your thoughts on this?',
          'How do you handle similar situations?',
          'What\'s worked best in your experience?'
        ]
      }
    ];

    for (const template of defaultTemplates) {
      const query = `
        INSERT INTO context_templates (
          user_id, platform_id, category_id, name, description,
          system_instructions, tone, writing_style, target_audience,
          use_hashtags, max_hashtags, hashtag_strategy, include_cta, cta_type,
          content_structure, engagement_level, 
          call_to_action_templates, is_default, is_public, is_system_template
        ) VALUES (NULL, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, true, true, true)
        ON CONFLICT (platform_id, is_default, is_system_template) DO NOTHING
      `;

      await database.query(query, [
        template.platform_id,
        template.category_id,
        template.name,
        template.description,
        template.system_instructions,
        template.tone,
        template.writing_style,
        template.target_audience,
        template.use_hashtags,
        template.max_hashtags,
        template.hashtag_strategy,
        template.include_cta,
        template.cta_type,
        JSON.stringify(template.content_structure),
        template.engagement_level,
        template.call_to_action_templates
      ]);
    }

    logger.info('Default templates created successfully');
  }
}

export const templateService = new TemplateService();
```

## Database Migration Scripts

### Initial Setup (database/migrations/001_initial_schema.sql)

```sql
-- This file contains the complete database schema from the previous artifact
-- Copy the entire schema here

-- After schema creation, create indexes
\i 003_indexes.sql

-- Insert seed data
\i 002_seed_default_data.sql
```

### Seed Data (database/migrations/002_seed_default_data.sql)

```sql
-- Insert content categories
INSERT INTO content_categories (id, name, description) VALUES 
(1, 'promotional', 'Marketing and promotional content'),
(2, 'educational', 'Educational and informative content'),
(3, 'engagement', 'Content designed to increase engagement'),
(4, 'entertainment', 'Fun and entertaining content'),
(5, 'news', 'News and updates'),
(6, 'personal', 'Personal stories and experiences')
ON CONFLICT (id) DO NOTHING;

-- Insert platforms
INSERT INTO platforms (id, name, type, max_content_length, supports_media, supported_media_types, platform_constraints) VALUES 
(1, 'Twitter', 'social', 280, true, ARRAY['image', 'video', 'gif'], '{"max_images": 4, "max_video_duration": 140, "thread_support": true}'),
(2, 'LinkedIn', 'social', 3000, true, ARRAY['image', 'video', 'document'], '{"max_images": 20, "professional_tone_preferred": true, "article_support": true}'),
(3, 'Instagram', 'social', 2200, true, ARRAY['image', 'video'], '{"requires_visual": true, "max_hashtags": 30, "story_support": true}'),
(4, 'Facebook', 'social', 63206, true, ARRAY['image', 'video', 'gif'], '{"max_images": 10, "event_support": true}'),
(5, 'TikTok', 'social', 150, true, ARRAY['video'], '{"requires_video": true, "max_duration": 180}')
ON CONFLICT (id) DO NOTHING;

-- Reset sequences
SELECT setval('content_categories_id_seq', (SELECT MAX(id) FROM content_categories));
SELECT setval('platforms_id_seq', (SELECT MAX(id) FROM platforms));
```

## Deployment Instructions

### Production Deployment Steps

1. **Server Setup**
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL 15
sudo apt-get install postgresql-15 postgresql-client-15

# Install PM2 globally
npm install -g pm2

# Install Docker & Docker Compose (optional)
sudo apt-get install docker.io docker-compose
```

2. **Application Deployment**
```bash
# Clone and setup
git clone <your-repo>
cd social-media-backend
npm install

# Environment setup
cp .env.example .env.production
# Edit .env.production with production values

# Database setup
sudo -u postgres createdb social_media_automation
sudo -u postgres psql social_media_automation < database/migrations/001_initial_schema.sql

# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

3. **Monitoring & Logging**
```bash
# View logs
pm2 logs social-media-api

# Monitor performance
pm2 monit

# Restart application
pm2 restart social-media-api
```

## Security Considerations

### 1. API Security
- JWT token expiration and refresh
- Rate limiting per user and IP
- Input validation and sanitization
- SQL injection prevention
- CORS configuration

### 2. Database Security
- Connection pooling with limits
- Encrypted connections (SSL/TLS)
- Regular database backups
- User role-based access control
- Audit logging for sensitive operations

### 3. Environment Security
```typescript
// src/config/environment.ts
import dotenv from 'dotenv';
import path from 'path';

// Load environment-specific config
const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

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
  'JWT_SECRET', 'OPENAI_API_KEY'
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
    apiKey: process.env.OPENAI_API_KEY!,
    model: process.env.OPENAI_MODEL || 'gpt-4',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000'),
    timeout: parseInt(process.env.OPENAI_TIMEOUT || '30000')
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
  },
  cors: {
    allowedOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000']
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || './logs/app.log'
  },
  api: {
    version: process.env.API_VERSION || 'v1'
  }
};
```

## Complete Type Definitions

### Type Definitions (src/types/index.ts)

```typescript
// Common Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// User Types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  last_login: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password_hash'>;
  token: string;
  refreshToken: string;
  expiresIn: string;
}

// Platform Types
export interface Platform {
  id: number;
  name: string;
  type: string;
  icon_url?: string;
  is_active: boolean;
  max_content_length: number;
  supports_media: boolean;
  supported_media_types: string[];
  platform_constraints: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

// Content Category Types
export interface ContentCategory {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: Date;
}

// Template Types
export interface ContextTemplate {
  id: number;
  user_id?: number;
  platform_id: number;
  category_id?: number;
  name: string;
  description?: string;
  system_instructions: string;
  tone: string;
  writing_style: string;
  target_audience: string;
  use_hashtags: boolean;
  max_hashtags: number;
  hashtag_strategy: string;
  include_cta: boolean;
  cta_type?: string;
  content_structure: Record<string, any>;
  engagement_level: string;
  call_to_action_templates: string[];
  is_default: boolean;
  is_public: boolean;
  is_system_template: boolean;
  is_active: boolean;
  usage_count: number;
  created_at: Date;
  updated_at: Date;
  
  // Joined fields
  category_name?: string;
  platform_name?: string;
}

export interface CreateTemplateRequest {
  platform_id: number;
  category_id?: number;
  name: string;
  description?: string;
  system_instructions: string;
  tone: string;
  writing_style: string;
  target_audience: string;
  use_hashtags?: boolean;
  max_hashtags?: number;
  hashtag_strategy?: string;
  include_cta?: boolean;
  cta_type?: string;
  content_structure?: Record<string, any>;
  engagement_level?: string;
  call_to_action_templates?: string[];
  is_public?: boolean;
}

export interface UpdateTemplateRequest extends Partial<CreateTemplateRequest> {}

// Context Types
export interface Context {
  id: number;
  user_id: number;
  type: 'document' | 'text' | 'youtube' | 'url' | 'manual';
  title: string;
  topic?: string;
  brief?: string;
  content: string;
  source?: string;
  mimetype?: string;
  size?: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateContextRequest {
  type: Context['type'];
  title: string;
  topic?: string;
  brief?: string;
  content: string;
  source?: string;
  mimetype?: string;
  size?: number;
}

export interface UpdateContextRequest extends Partial<CreateContextRequest> {}

// Post Types
export interface Post {
  id: number;
  user_id: number;
  context_id?: number;
  template_id?: number;
  platform_id: number;
  content: string;
  content_type: string;
  hashtags: string[];
  mentions: string[];
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduled_for?: Date;
  published_at?: Date;
  platform_post_id?: string;
  platform_url?: string;
  platform_response: Record<string, any>;
  engagement_metrics: Record<string, any>;
  last_metrics_update?: Date;
  error_message?: string;
  retry_count: number;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  
  // Joined fields
  context_title?: string;
  platform_name?: string;
  template_name?: string;
  user_email?: string;
}

export interface CreatePostRequest {
  user_id: number;
  context_id?: number;
  template_id?: number;
  platform_id: number;
  content: string;
  content_type?: string;
  hashtags?: string[];
  mentions?: string[];
  status?: Post['status'];
  scheduled_for?: Date;
  metadata?: Record<string, any>;
}

export interface UpdatePostRequest {
  content?: string;
  hashtags?: string[];
  mentions?: string[];
  scheduled_for?: Date;
  metadata?: Record<string, any>;
}

export interface GeneratePostRequest {
  context_id: number;
  template_id: number;
  platform_id: number;
  scheduled_for?: Date;
}

// AI Types
export interface AIGenerationRequest {
  context: Context;
  template: ContextTemplate;
  platform: Platform;
}

export interface AIGenerationResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

// Media Types
export interface Media {
  id: number;
  mediaable_type: string;
  mediaable_id: number;
  url: string;
  type: 'image' | 'video' | 'document' | 'audio';
  mime_type?: string;
  size?: number;
  width?: number;
  height?: number;
  duration?: number;
  thumbnail_url?: string;
  alt_text?: string;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

// Error Types
export interface ApiError extends Error {
  statusCode: number;
  code?: string;
  details?: any;
}
```

## Advanced Features Implementation

### 1. Batch Post Generation (src/services/batch.service.ts)

```typescript
import { database } from '../config/database';
import { postService } from './post.service';
import { contextService } from './context.service';
import { logger } from '../utils/logger.utils';

interface BatchGenerationRequest {
  context_ids: number[];
  platform_ids: number[];
  scheduled_dates?: Date[];
}

interface BatchGenerationResult {
  successful: number;
  failed: number;
  posts: any[];
  errors: any[];
}

class BatchService {
  async generateMultiplePosts(
    userId: number, 
    request: BatchGenerationRequest
  ): Promise<BatchGenerationResult> {
    const result: BatchGenerationResult = {
      successful: 0,
      failed: 0,
      posts: [],
      errors: []
    };

    const client = await database.getClient();
    
    try {
      await client.query('BEGIN');

      // Generate posts for each context-platform combination
      for (const contextId of request.context_ids) {
        for (let i = 0; i < request.platform_ids.length; i++) {
          const platformId = request.platform_ids[i];
          const scheduledFor = request.scheduled_dates?.[i];

          try {
            const post = await postService.generateAndCreate(userId, {
              context_id: contextId,
              platform_id: platformId,
              scheduled_for: scheduledFor
            });

            result.posts.push(post);
            result.successful++;

          } catch (error) {
            result.errors.push({
              context_id: contextId,
              platform_id: platformId,
              error: error.message
            });
            result.failed++;
            logger.error('Batch generation error:', { contextId, platformId, error });
          }
        }
      }

      await client.query('COMMIT');
      logger.info('Batch generation completed', { 
        userId, 
        successful: result.successful, 
        failed: result.failed 
      });

      return result;

    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Batch generation failed:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async scheduleBatchPosts(
    userId: number,
    postIds: number[],
    scheduleDates: Date[]
  ): Promise<BatchGenerationResult> {
    const result: BatchGenerationResult = {
      successful: 0,
      failed: 0,
      posts: [],
      errors: []
    };

    for (let i = 0; i < postIds.length; i++) {
      try {
        const post = await postService.schedulePost(
          postIds[i], 
          userId, 
          scheduleDates[i]
        );
        result.posts.push(post);
        result.successful++;
      } catch (error) {
        result.errors.push({
          post_id: postIds[i],
          error: error.message
        });
        result.failed++;
      }
    }

    return result;
  }
}

export const batchService = new BatchService();
```

### 2. Analytics Service (src/services/analytics.service.ts)

```typescript
import { database } from '../config/database';
import { logger } from '../utils/logger.utils';

interface UserAnalytics {
  total_contexts: number;
  total_posts: number;
  posts_by_status: Record<string, number>;
  posts_by_platform: Record<string, number>;
  most_used_templates: any[];
  recent_activity: any[];
  engagement_summary: Record<string, any>;
}

class AnalyticsService {
  async getUserAnalytics(userId: number, days: number = 30): Promise<UserAnalytics> {
    const dateFilter = `created_at >= CURRENT_DATE - INTERVAL '${days} days'`;

    // Total contexts
    const contextsQuery = `
      SELECT COUNT(*) as total_contexts
      FROM contexts
      WHERE user_id = $1 AND ${dateFilter}
    `;
    const contextsResult = await database.query(contextsQuery, [userId]);

    // Total posts
    const postsQuery = `
      SELECT COUNT(*) as total_posts
      FROM posts
      WHERE user_id = $1 AND ${dateFilter}
    `;
    const postsResult = await database.query(postsQuery, [userId]);

    // Posts by status
    const statusQuery = `
      SELECT status, COUNT(*) as count
      FROM posts
      WHERE user_id = $1 AND ${dateFilter}
      GROUP BY status
    `;
    const statusResult = await database.query(statusQuery, [userId]);

    // Posts by platform
    const platformQuery = `
      SELECT p.name, COUNT(*) as count
      FROM posts po
      JOIN platforms p ON po.platform_id = p.id
      WHERE po.user_id = $1 AND po.${dateFilter}
      GROUP BY p.name
      ORDER BY count DESC
    `;
    const platformResult = await database.query(platformQuery, [userId]);

    // Most used templates
    const templatesQuery = `
      SELECT ct.name, COUNT(*) as usage_count
      FROM contexts c
      JOIN context_templates ct ON c.template_id = ct.id
      WHERE c.user_id = $1 AND c.${dateFilter}
      GROUP BY ct.id, ct.name
      ORDER BY usage_count DESC
      LIMIT 5
    `;
    const templatesResult = await database.query(templatesQuery, [userId]);

    // Recent activity
    const activityQuery = `
      SELECT 
        'post' as type,
        p.id,
        p.content,
        pl.name as platform_name,
        p.status,
        p.created_at
      FROM posts p
      JOIN platforms pl ON p.platform_id = pl.id
      WHERE p.user_id = $1
      UNION ALL
      SELECT 
        'context' as type,
        c.id,
        c.title as content,
        p.name as platform_name,
        CASE WHEN c.is_processed THEN 'processed' ELSE 'pending' END as status,
        c.created_at
      FROM contexts c
      JOIN platforms p ON c.platform_id = p.id
      WHERE c.user_id = $1
      ORDER BY created_at DESC
      LIMIT 10
    `;
    const activityResult = await database.query(activityQuery, [userId]);

    return {
      total_contexts: parseInt(contextsResult.rows[0].total_contexts),
      total_posts: parseInt(postsResult.rows[0].total_posts),
      posts_by_status: statusResult.rows.reduce((acc, row) => {
        acc[row.status] = parseInt(row.count);
        return acc;
      }, {}),
      posts_by_platform: platformResult.rows.reduce((acc, row) => {
        acc[row.name] = parseInt(row.count);
        return acc;
      }, {}),
      most_used_templates: templatesResult.rows,
      recent_activity: activityResult.rows,
      engagement_summary: {} // To be implemented with platform APIs
    };
  }

  async getSystemAnalytics(): Promise<any> {
    const queries = {
      totalUsers: 'SELECT COUNT(*) FROM users WHERE is_active = true',
      totalPosts: 'SELECT COUNT(*) FROM posts',
      totalContexts: 'SELECT COUNT(*) FROM contexts',
      postsToday: `SELECT COUNT(*) FROM posts WHERE DATE(created_at) = CURRENT_DATE`,
      topPlatforms: `
        SELECT p.name, COUNT(*) as count
        FROM posts po
        JOIN platforms p ON po.platform_id = p.id
        WHERE po.created_at >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY p.name
        ORDER BY count DESC
        LIMIT 5
      `
    };

    const results = {};
    for (const [key, query] of Object.entries(queries)) {
      const result = await database.query(query);
      results[key] = result.rows;
    }

    return results;
  }
}

export const analyticsService = new AnalyticsService();
```

### 3. Content Scheduler (src/services/scheduler.service.ts)

```typescript
import cron from 'node-cron';
import { postService } from './post.service';
import { logger } from '../utils/logger.utils';

class SchedulerService {
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  initialize(): void {
    // Check for scheduled posts every minute
    const scheduledPostsJob = cron.schedule('* * * * *', async () => {
      await this.processScheduledPosts();
    }, {
      scheduled: false
    });

    // Clean up old data every day at 2 AM
    const cleanupJob = cron.schedule('0 2 * * *', async () => {
      await this.cleanupOldData();
    }, {
      scheduled: false
    });

    this.jobs.set('scheduled-posts', scheduledPostsJob);
    this.jobs.set('cleanup', cleanupJob);

    // Start all jobs
    this.startAll();
  }

  private async processScheduledPosts(): Promise<void> {
    try {
      const scheduledPosts = await postService.getScheduledPosts();
      
      for (const post of scheduledPosts) {
        try {
          // This would integrate with actual platform APIs
          await this.publishToSocialMedia(post);
          
          await postService.updateStatus(post.id, post.user_id, 'published', {
            published_at: new Date().toISOString(),
            platform_response: { success: true }
          });

          logger.info('Post published successfully', { postId: post.id });

        } catch (error) {
          await postService.updateStatus(post.id, post.user_id, 'failed', {
            error_message: error.message,
            retry_count: post.retry_count + 1
          });

          logger.error('Failed to publish post', { postId: post.id, error });
        }
      }

    } catch (error) {
      logger.error('Error processing scheduled posts:', error);
    }
  }

  private async publishToSocialMedia(post: any): Promise<void> {
    // Mock implementation - replace with actual platform APIs
    switch (post.platform_name) {
      case 'Twitter':
        // await twitterApi.tweet(post.content);
        break;
      case 'LinkedIn':
        // await linkedinApi.share(post.content);
        break;
      case 'Instagram':
        // await instagramApi.post(post.content);
        break;
      default:
        throw new Error(`Unsupported platform: ${post.platform_name}`);
    }
  }

  private async cleanupOldData(): Promise<void> {
    try {
      // Clean up old media files
      // Clean up processed contexts older than 90 days
      // Archive old posts
      logger.info('Data cleanup completed');
    } catch (error) {
      logger.error('Data cleanup failed:', error);
    }
  }

  startAll(): void {
    this.jobs.forEach((job, name) => {
      job.start();
      logger.info(`Started cron job: ${name}`);
    });
  }

  stopAll(): void {
    this.jobs.forEach((job, name) => {
      job.stop();
      logger.info(`Stopped cron job: ${name}`);
    });
  }

  getJobStatus(): Record<string, boolean> {
    const status = {};
    this.jobs.forEach((job, name) => {
      status[name] = job.running;
    });
    return status;
  }
}

export const schedulerService = new SchedulerService();
```

## Testing Strategy

### Unit Tests Example (tests/unit/services/context.service.test.ts)

```typescript
import { contextService } from '../../../src/services/context.service';
import { database } from '../../../src/config/database';

// Mock database
jest.mock('../../../src/config/database');
const mockDatabase = database as jest.Mocked<typeof database>;

describe('ContextService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a context successfully', async () => {
      const mockContext = {
        id: 1,
        user_id: 1,
        title: 'Test Context',
        content: 'Test content',
        type: 'text',
        platform_id: 1
      };

      mockDatabase.getClient.mockResolvedValue({
        query: jest.fn()
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockResolvedValueOnce({ rows: [mockContext] }) // INSERT
          .mockResolvedValueOnce({ rows: [] }), // COMMIT
        release: jest.fn()
      } as any);

      const result = await contextService.create(1, {
        title: 'Test Context',
        content: 'Test content',
        type: 'text',
        platform_id: 1
      });

      expect(result).toEqual(mockContext);
    });

    it('should handle creation errors', async () => {
      const error = new Error('Database error');
      
      mockDatabase.getClient.mockResolvedValue({
        query: jest.fn()
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockRejectedValueOnce(error), // INSERT fails
        release: jest.fn()
      } as any);

      await expect(contextService.create(1, {
        title: 'Test Context',
        content: 'Test content',
        type: 'text',
        platform_id: 1
      })).rejects.toThrow('Database error');
    });
  });
});
```

## Package.json Configuration

```json
{
  "name": "social-media-automation-backend",
  "version": "1.0.0",
  "description": "Social Media Automation Platform Backend",
  "main": "dist/app.js",
  "scripts": {
    "start": "node dist/app.js",
    "dev": "nodemon src/app.ts",
    "build": "tsc",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "migrate": "node dist/database/migrate.js",
    "seed": "node dist/database/seed.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.0",
    "bcrypt": "^5.1.0",
    "jsonwebtoken": "^9.0.0",
    "openai": "^4.0.0",
    "joi": "^17.9.0",
    "winston": "^3.10.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "compression": "^1.7.4",
    "express-rate-limit": "^6.8.0",
    "dotenv": "^16.1.0",
    "node-cron": "^3.0.2"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/pg": "^8.10.0",
    "@types/bcrypt": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.2",
    "@types/joi": "^17.2.3",
    "@types/cors": "^2.8.13",
    "@types/compression": "^1.7.2",
    "@types/node-cron": "^3.0.8",
    "@types/node": "^20.3.0",
    "@types/jest": "^29.5.2",
    "typescript": "^5.1.0",
    "nodemon": "^2.0.22",
    "ts-node": "^10.9.0",
    "jest": "^29.5.0",
    "ts-jest": "^29.1.0",
    "@typescript-eslint/eslint-plugin": "^5.59.0",
    "@typescript-eslint/parser": "^5.59.0",
    "eslint": "^8.42.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## Final Implementation Checklist

### Phase 1: Core Setup ✅
- [ ] Database schema implementation
- [ ] Environment configuration
- [ ] Basic authentication system
- [ ] Core models and services
- [ ] API routes structure

### Phase 2: AI Integration ✅
- [ ] OpenAI service integration
- [ ] Template system implementation
- [ ] Context processing
- [ ] Post generation pipeline

### Phase 3: Advanced Features
- [ ] Batch operations
- [ ] Scheduling system
- [ ] Analytics dashboard
- [ ] Media file handling
- [ ] Platform API integrations

### Phase 4: Production Ready
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Monitoring setup
- [ ] CI/CD pipeline

This comprehensive backend architecture provides a solid foundation for your social media automation platform. The modular design allows for easy extension and maintenance, while the detailed type definitions ensure code quality and developer experience.