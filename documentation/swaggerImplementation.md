 Swagger Setup & Configuration
**AI Prompt Template**:
```
Set up Swagger/OpenAPI 3.0 documentation with:
1. Install swagger-ui-express, swagger-jsdoc, @types/swagger-ui-express
2. Create swagger configuration in src/config/swagger.ts
3. OpenAPI 3.0 specification with:
   - API info (title, version, description)
   - Server configurations (dev, staging, prod)
   - Security schemes (Bearer JWT)
   - Global response schemas
   - Error response schemas
4. Swagger middleware integration in main app
5. Route: /api-docs for Swagger UI
6. Route: /api-docs.json for OpenAPI spec
Include proper TypeScript types and environment-based configuration
```

**Dependencies to Add**:
```json
{
  "swagger-ui-express": "^4.6.3",
  "swagger-jsdoc": "^6.2.8",
  "@types/swagger-ui-express": "^4.1.3"
}
```

#### Step 5.2: Controllers with Swagger Annotations
**AI Prompt Template**:
```
Create controllers with comprehensive Swagger JSDoc annotations:
1. Async methods with proper error handling
2. Request validation using middleware
3. Service layer calls
4. Standardized response format
5. Proper HTTP status codes
6. Security checks for user ownership

For EACH controller method, include:
/**
 * @swagger
 * /api/v1/contexts:
 *   post:
 *     summary: Create new context
 *     tags: [Contexts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateContextRequest'
 *     responses:
 *       201:
 *         description: Context created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContextResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */

Create: AuthController, ContextController, TemplateController, PostController, PlatformController
Each should have complete Swagger documentation for all endpoints
```

#### Step 5.3: Routes with OpenAPI Integration
**AI Prompt Template**:
```
Create route files with Swagger integration:
1. Express Router setup
2. Middleware application (auth, validation, rate limiting)
3. Route definitions with proper HTTP methods
4. Request validation schemas (Joi schemas that match OpenAPI)
5. Complete Swagger JSDoc annotations for each route
6. Error boundary handling
7. Route grouping with tags

Example route structure:
/**
 * @swagger
 * tags:
 *   name: Contexts
 *   description: Context management operations
 */

Routes: /api/v1/auth, /api/v1/contexts, /api/v1/templates, /api/v1/posts, /api/v1/platforms
Each route file should be fully documented with request/response schemas
```

#### Step 5.4: Schema Definitions
**AI Prompt Template**:
```
Create comprehensive OpenAPI schema definitions in src/config/swagger-schemas.ts:

1. Request Schemas:
   - CreateUserRequest, LoginRequest
   - CreateContextRequest, UpdateContextRequest
   - CreateTemplateRequest, UpdateTemplateRequest
   - GeneratePostRequest, CreatePostRequest

2. Response Schemas:
   - User, Context, Template, Post
   - ApiResponse<T>, PaginatedResponse<T>
   - ErrorResponse, ValidationErrorResponse

3. Component Schemas:
   - Platform, ContentCategory, TemplateVariable
   - AIGenerationResponse, BatchGenerationResult

4. Security Schemas:
   - bearerAuth (JWT)

5. Common Response Types:
   - Success responses (200, 201)
   - Error responses (400, 401, 403, 404, 500)

Use OpenAPI 3.0 format with proper examples, validation rules, and descriptions
```

### Phase 6: Application Setup (Days 14-15)
**Goal**: Complete application assembly

#### Step 6.1: Main Application with Swagger
**AI Prompt Template**:
```
Create main application (app.ts) with Swagger integration:
1. Express app initialization
2. Security middleware (helmet, cors, compression)
3. Body parsing with limits
4. Rate limiting configuration
5. Swagger UI middleware setup:
   - /api-docs for interactive documentation
   - /api-docs.json for OpenAPI specification
6. Route mounting with API versioning
7. Error handling middleware
8. Health check endpoint with OpenAPI documentation
9. 404 handler
10. Graceful shutdown handling
Include proper middleware order and Swagger security configuration
```

#### Step 6.2: Database Integration
**AI Prompt Template**:
```
Create database integration:
1. Connection pool management
2. Query logging and performance monitoring
3. Transaction helpers
4. Migration runner
5. Seed data loader
6. Database health checks
7. Connection retry logic
Include proper error handling and connection cleanup
```

### Phase 7: Advanced Features (Days 16-18)
**Goal**: Production-ready features

#### Step 7.1: Batch Operations
**AI Prompt Template**:
```
Create BatchService for:
1. generateMultiplePosts(userId, request) - bulk generation
2. scheduleBatchPosts(userId, postIds, dates) - bulk scheduling
3. Error handling for partial failures
4. Progress tracking
5. Transaction management for consistency
Include proper logging and rollback mechanisms
```

#### Step 7.2: Analytics & Monitoring
**AI Prompt Template**:
```
Create AnalyticsService for:
1. getUserAnalytics(userId, days) - user metrics
2. getSystemAnalytics() - admin metrics
3. Performance metrics collection
4. Usage tracking
5. Error rate monitoring
Include dashboard-ready data structures
```

## 📚 Complete Swagger Implementation Guide

### Swagger Configuration Files

#### 1. Main Swagger Config (src/config/swagger.ts)
**AI Prompt**:
```
Create complete Swagger configuration with:
1. OpenAPI 3.0 specification
2. API metadata (title, version, description)
3. Multiple server environments
4. JWT Bearer authentication scheme
5. Global error response schemas
6. Security definitions
7. Common response types
8. File path configuration for JSDoc scanning
```

#### 2. Schema Definitions (src/config/swagger-schemas.ts)
**AI Prompt**:
```
Create comprehensive OpenAPI schema definitions:

REQUEST SCHEMAS:
- CreateUserRequest (email, password, first_name, last_name)
- LoginRequest (email, password)
- CreateContextRequest (template_id, platform_id, type, title, content, etc.)
- UpdateContextRequest (partial update fields)
- CreateTemplateRequest (platform_id, name, system_instructions, tone, etc.)
- GeneratePostRequest (context_id, platform_id, scheduled_for)

RESPONSE SCHEMAS:
- User (id, email, first_name, last_name, role, created_at)
- Context (id, title, content, platform_id, is_processed, etc.)
- Template (id, name, platform_id, tone, writing_style, etc.)
- Post (id, content, status, platform_id, scheduled_for, etc.)
- Platform (id, name, max_content_length, supported_media_types)

COMMON SCHEMAS:
- ApiResponse<T> (success, message, data, timestamp)
- PaginatedResponse (data array, pagination object)
- ErrorResponse (success: false, message, error, timestamp)
- ValidationError (field, message, value)

Include proper examples, validation rules, and descriptions for each field
```

#### 3. Route Documentation Examples
**AI Prompt**:
```
For each API endpoint, create Swagger JSDoc annotations with:

AUTHENTICATION ROUTES:
POST /auth/register - User registration
POST /auth/login - User login
POST /auth/refresh - Token refresh
POST /auth/logout - User logout

CONTEXT ROUTES:
GET /contexts - List user contexts (with filters, pagination)
POST /contexts - Create new context
GET /contexts/:id - Get specific context
PUT /contexts/:id - Update context
DELETE /contexts/:id - Delete context

TEMPLATE ROUTES:
GET /templates - List templates (user + public)
POST /templates - Create custom template
GET /templates/:id - Get template details
PUT /templates/:id - Update template
DELETE /templates/:id - Delete template

POST ROUTES:
GET /posts - List user posts (with filters)
POST /posts/generate - Generate post from context
GET /posts/:id - Get post details
PUT /posts/:id - Update post content
POST /posts/:id/schedule - Schedule post
POST /posts/:id/publish - Publish post immediately
DELETE /posts/:id - Delete post

PLATFORM ROUTES:
GET /platforms - List all available platforms
GET /platforms/:id - Get platform details

Each endpoint should include:
- Complete parameter descriptions
- Request body schemas
- Response schemas for all status codes
- Security requirements
- Examples
- Error responses
```

### Implementation Strategy

#### Phase 5A: Swagger Setup (Day 11)
1. **Install Dependencies**: Add Swagger packages to package.json
2. **Basic Configuration**: Create swagger.ts config file
3. **Schema Definitions**: Define all OpenAPI schemas
4. **Middleware Setup**: Integrate Swagger UI in main app

#### Phase 5B: API Documentation (Day 12)
1. **Authentication Routes**: Document all auth endpoints
2. **Core CRUD Routes**: Document contexts, templates, posts
3. **Advanced Routes**: Document generation, scheduling, batch operations
4. **Error Handling**: Document all error responses

#### Phase 5C: Testing & Validation (Day 13)
1. **Schema Validation**: Ensure all schemas match TypeScript types
2. **Example Testing**: Test all examples in Swagger UI
3. **Security Testing**: Verify JWT authentication works
4. **Response Validation**: Confirm all responses match schemas

### Swagger Best Practices

#### 1. Consistent Response Format
```yaml
responses:
  200:
    description: Success
    content:
      application/json:
        schema:
          allOf:
            - $ref: '#/components/schemas/ApiResponse'
            - type: object
              properties:
                data:
                  $ref: '#/components/schemas/Context'
```

#### 2. Proper Error Documentation
```yaml
responses:
  400:
    description: Bad Request
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/ValidationErrorResponse'
        example:
          success: false
          message: "Validation failed"
          errors: [
            {
              field: "title",
              message: "Title is required",
              value: ""
            }
          ]
```

#### 3. Security Scheme Usage
```yaml
security:
  - bearerAuth: []
```

#### 4. Parameter Documentation
```yaml
parameters:
  - name: id
    in: path
    required: true
    schema:
      type: integer
    description: Context ID
  - name: platform_id
    in: query
    schema:
      type: integer
    description: Filter by platform
```

### Integration with Development Workflow

#### 1. Route Development Pattern
```typescript
/**
 * @swagger
 * /contexts:
 *   post:
 *     summary: Create new context
 *     tags: [Contexts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateContextRequest'
 *           example:
 *             title: "My Blog Post"
 *             content: "Content to transform..."
 *             platform_id: 1
 *             type: "text"
 *     responses:
 *       201:
 *         description: Context created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Context'
 */
router.post('/', authMiddleware, validateRequest(createContextSchema), contextController.create);
```

#### 2. Type Safety Integration
```typescript
// Ensure Swagger schemas match TypeScript types
import { CreateContextRequest } from '../types';

// Use the same validation for both Swagger and runtime
const createContextSchema = Joi.object({
  title: Joi.string().required().max(200),
  content: Joi.string().required().max(10000),
  platform_id: Joi.number().integer().positive().required(),
  type: Joi.string().valid('document', 'text', 'youtube', 'url', 'manual').required()
});
```

### Final Checklist for Swagger Implementation

- [ ] All API endpoints documented with complete Swagger annotations
- [ ] Request/response schemas defined and validated
- [ ] Authentication and security properly documented
- [ ] Error responses documented for all endpoints
- [ ] Examples provided for all request/response types
- [ ] Swagger UI accessible at /api-docs
- [ ] OpenAPI spec downloadable at /api-docs.json
- [ ] Schema validation matches runtime validation
- [ ] All HTTP status codes properly documented
- [ ] API versioning clearly indicated in documentation

This comprehensive Swagger implementation will provide:
- **Interactive API Documentation**: Test endpoints directly from browser
- **Client Code Generation**: Generate SDKs for different languages
- **API Contract**: Clear contract between frontend and backend
- **Developer Experience**: Easy onboarding for new developers
- **API Testing**: Built-in testing capabilities

### 1. Package.json with Swagger Dependencies
```json
{
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
    "node-cron": "^3.0.2",
    "swagger-ui-express": "^4.6.3",
    "swagger-jsdoc": "^6.2.8"
  },
  "devDependencies": {
    "@types/swagger-ui-express": "^4.1.3",
    // ... other dev dependencies
  }
}
```

### 2. Swagger Configuration Example
```typescript
// src/config/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './environment';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Social Media Automation API',
      version: '1.0.0',
      description: 'AI-powered social media content generation and automation platform',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${config.server.port}/api/v1`,
        description: 'Development server'
      },
      {
        url: 'https://api.yourdomain.com/api/v1',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
```

### 2. Database Safety
```typescript
// Always use parameterized queries
const result = await database.query(
    'SELECT * FROM users WHERE id = $1',
    [userId]
);

// Use transactions for multi-step operations
const client = await database.getClient();
try {
    await client.query('BEGIN');
    // operations
    await client.query('COMMIT');
} catch (error) {
    await client.query('ROLLBACK');
    throw error;
} finally {
    client.release();
}
```

### 3. API Security
```typescript
// Input validation
const schema = Joi.object({
    title: Joi.string().required().max(200),
    content: Joi.string().required().max(10000)
});

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
```

## 🔧 Development Best Practices

### 1. Git Workflow
```bash
# Feature branch strategy
git checkout -b feature/context-service
git checkout -b feature/ai-integration
git checkout -b feature/authentication

# Commit message format
git commit -m "feat: add context creation service"
git commit -m "fix: handle database connection errors"
git commit -m "refactor: improve AI prompt building"
```

### 2. Testing Strategy
```typescript
// Test each service method
describe('ContextService', () => {
    beforeEach(() => {
        // Setup mocks
    });
    
    it('should create context with valid data', async () => {
        // Test implementation
    });
    
    it('should handle validation errors', async () => {
        // Error case testing
    });
});
```

### 3. Environment Management
```bash
# Development
NODE_ENV=development
DB_HOST=localhost
JWT_SECRET=dev-secret-key

# Production
NODE_ENV=production
DB_HOST=production-db-host
JWT_SECRET=production-secret-key
```

## 🚀 Deployment Strategy

### 1. Docker Configuration
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/app.js"]
```

### 2. Environment Variables
```bash
# Required for production
- DATABASE_URL
- JWT_SECRET
- OPENAI_API_KEY
- REDIS_URL (for caching)
- PORT
```

### 3. Health Checks
```typescript
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version
    });
});
```

## 📝 AI Development Prompts for Each Phase

### For Database Schema:
```
"Create a PostgreSQL schema for a social media automation platform with tables for users, platforms (Twitter, LinkedIn, Instagram), content templates, user contexts, and generated posts. Include proper relationships, indexes, and constraints. Use the exact schema from the provided specification."
```

### For Service Classes:
```
"Create a TypeScript service class for [entity] management with CRUD operations, proper error handling, database transactions, and TypeScript types. Follow the repository pattern and include comprehensive logging."
```

### For API Controllers:
```
"Create an Express.js controller for [entity] with async/await, proper error handling, request validation, and standardized JSON responses. Include authentication middleware and proper HTTP status codes."
```

### for AI Integration:
```
"Create an OpenAI service that generates social media content based on user context and platform-specific templates. Include dynamic prompt building, error handling, retry logic, and platform-specific formatting rules."
```

### For Swagger Documentation:
```
"Create comprehensive OpenAPI 3.0 documentation for the social media automation API with complete schemas for all request/response types, security definitions for JWT authentication, interactive examples, and proper error response documentation. Include schemas for User, Context, Template, Post, and all CRUD operations."
```

### For API Controllers with Swagger:
```
"Create Express.js controllers with complete Swagger JSDoc annotations for all endpoints. Include request/response schemas, security requirements, parameter descriptions, example payloads, and comprehensive error response documentation. Follow OpenAPI 3.0 standards."
```

## 🔍 Code Review Checklist

### Before Each Commit:
- [ ] TypeScript compilation passes without errors
- [ ] All environment variables are properly typed
- [ ] Database queries use parameterized statements
- [ ] Error handling is comprehensive
- [ ] Logging is implemented for debugging
- [ ] Input validation is applied
- [ ] Authentication checks are in place
- [ ] Response formats are consistent
- [ ] Swagger documentation is updated and valid
- [ ] All API endpoints return documented response formats
- [ ] OpenAPI schemas match TypeScript interfaces

### Performance Considerations:
- [ ] Database queries are optimized with indexes
- [ ] Connection pooling is configured
- [ ] Rate limiting is implemented
- [ ] Caching strategy is applied where needed
- [ ] File uploads have size limits
- [ ] API responses are paginated

### Security Checklist:
- [ ] JWT tokens expire appropriately
- [ ] Passwords are properly hashed
- [ ] SQL injection prevention
- [ ] XSS protection headers
- [ ] CORS is properly configured
- [ ] Rate limiting per user/IP
- [ ] Input sanitization

## 🎯 Success Metrics

### Development Quality:
- Zero TypeScript compilation errors
- 100% test coverage for critical paths
- All API endpoints return proper error codes
- Database transactions maintain consistency
- AI generation success rate > 95%

### Performance Targets:
- API response time < 200ms (95th percentile)
- Database connection pool efficiency > 90%
- AI content generation < 5 seconds
- Memory usage stable under load
- Error rate < 1%

Follow this strategy step by step, and you'll build a robust, scalable, and maintainable social media automation backend with minimal errors and clean architecture.