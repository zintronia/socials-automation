# Social Media Automation Backend - AI Development Strategy for Cursor/Windsurf

## 🎯 Project Overview
You are building a Node.js + TypeScript backend for a social media automation platform that generates AI-powered content for multiple platforms (Twitter, LinkedIn, Instagram, Facebook). The system processes user contexts, applies templates, and generates platform-optimized posts using OpenAI's GPT-4.

## 🏗️ Clean Architecture Strategy

### Layered Architecture Pattern
```
Presentation Layer (Controllers/Routes)
    ↓
Business Logic Layer (Services)
    ↓
Data Access Layer (Models/Database)
    ↓
Infrastructure Layer (External APIs/Database)
```

### Dependency Injection Strategy
- Services depend on abstractions, not implementations
- Database connections are injected
- AI services are modular and swappable
- Configuration is environment-based

## 📋 Development Phases & Strategy

### Phase 1: Foundation Setup (Days 1-2)
**Goal**: Establish solid foundation with zero configuration errors

#### Step 1.1: Project Initialization
```bash
# Ask AI to create these files in exact order:
1. package.json with exact dependencies
2. tsconfig.json with strict TypeScript configuration
3. .env.example with all required variables
4. Basic folder structure
```

**AI Prompt Template**:
```
Create a Node.js TypeScript project setup with:
- package.json with dependencies: express, pg, bcrypt, jsonwebtoken, openai, joi, winston, cors, helmet, compression, express-rate-limit, dotenv
- tsconfig.json with strict compilation, target ES2020, module commonjs
- Folder structure following the provided architecture
- .env.example with all environment variables
- Basic .gitignore for Node.js project
```

#### Step 1.2: Database Setup
```bash
# Ask AI to create these in order:
1. Database configuration with connection pooling
2. Migration files (001_initial_schema.sql)
3. Seed data files (002_seed_default_data.sql)
4. Database utility functions
```

**AI Prompt Template**:
```
Create PostgreSQL database setup:
1. Database configuration class with connection pooling using pg library
2. Complete database schema with all tables: users, platforms, content_categories, template_types, context_templates, template_variables, contexts, context_tags, posts, media
3. Proper indexes for performance
4. Seed data for platforms, categories, and default templates
5. Database utility functions for common operations
Include proper error handling and logging
```

#### Step 1.3: Environment & Configuration
**AI Prompt Template**:
```
Create environment configuration system:
1. config/environment.ts that validates required env vars
2. Separate configs for development, production, testing
3. Type-safe configuration interface
4. Error handling for missing required variables
5. Database SSL configuration for production
```

### Phase 2: Core Models & Types (Days 3-4)
**Goal**: Establish type safety and data models

#### Step 2.1: Type Definitions
**AI Prompt Template**:
```
Create comprehensive TypeScript type definitions for:
1. User types (User, CreateUserRequest, LoginRequest, AuthResponse)
2. Platform types (Platform with constraints)
3. Template types (ContextTemplate, CreateTemplateRequest, TemplateVariable)
4. Context types (Context, CreateContextRequest, UpdateContextRequest)
5. Post types (Post, CreatePostRequest, GeneratePostRequest)
6. AI types (AIGenerationRequest, AIGenerationResponse)
7. API response types (ApiResponse, PaginatedResponse)
8. Error types (ApiError)

Ensure all types are properly exported and documented
```

#### Step 2.2: Base Models
**AI Prompt Template**:
```
Create base model classes with:
1. Base model with common fields (id, created_at, updated_at)
2. Database query helpers
3. Validation methods
4. Serialization methods
5. Proper error handling
Follow the Active Record pattern but keep it lightweight
```

### Phase 3: Authentication & Security (Days 5-6)
**Goal**: Secure foundation with JWT authentication

#### Step 3.1: Authentication Service
**AI Prompt Template**:
```
Create authentication system:
1. AuthService class with register, login, verify methods
2. Password hashing with bcrypt (saltRounds: 12)
3. JWT token generation and verification
4. Refresh token mechanism
5. User session management
6. Password validation rules
Include comprehensive error handling and security best practices
```

#### Step 3.2: Middleware
**AI Prompt Template**:
```
Create middleware stack:
1. authMiddleware for protected routes
2. validationMiddleware using Joi schemas
3. errorMiddleware for centralized error handling
4. rateLimitMiddleware with user-based limits
5. corsMiddleware with environment-based origins
6. loggingMiddleware for request tracking
Each middleware should have proper TypeScript types and error handling
```

### Phase 4: Core Services (Days 7-10)
**Goal**: Business logic implementation

#### Step 4.1: Context Service
**AI Prompt Template**:
```
Create ContextService with methods:
1. create(userId, contextData) - with validation and template handling
2. getById(id, userId) - with security checks
3. getByUser(userId, filters) - with pagination
4. update(id, userId, updateData) - partial updates
5. delete(id, userId) - soft delete preferred
6. markAsProcessed(id, userId) - for workflow
Include transaction handling, error logging, and proper SQL injection prevention
```

#### Step 4.2: Template Service
**AI Prompt Template**:
```
Create TemplateService with methods:
1. create(userId, templateData) - with variable handling
2. getById(id, userId) - with access control
3. getDefaultForPlatform(platformId) - system templates
4. getByUser(userId, filters) - user templates
5. createDefaultTemplates() - seed method
6. addTemplateVariable(templateId, variable) - dynamic vars
Include JSON handling for template variables and content structure
```

#### Step 4.3: AI Service
**AI Prompt Template**:
```
Create AIService for OpenAI integration:
1. generatePost(request) - main generation method
2. buildSystemPrompt(template, platform) - dynamic prompts
3. buildUserPrompt(context, template) - context-aware
4. getPlatformFormattingRules(platform) - platform-specific
5. getCategorySpecificInstructions(categoryId) - content types
Include retry logic, rate limiting, token counting, and error handling
Use the exact prompt engineering from the specification
```

#### Step 4.4: Post Service
**AI Prompt Template**:
```
Create PostService with methods:
1. generateAndCreate(userId, request) - full workflow
2. create(postData) - basic creation
3. getById(id, userId) - with joins
4. getByUser(userId, filters) - with pagination
5. updateStatus(id, userId, status, metadata) - status tracking
6. schedulePost(id, userId, scheduledFor) - scheduling
7. getScheduledPosts() - for cron jobs
Include transaction handling and workflow state management
```

### Phase 5: API Layer (Days 11-13)
**Goal**: RESTful API with proper error handling

#### Step 5.1: Controllers
**AI Prompt Template**:
```
Create controllers following this pattern for each entity:
1. Async methods with proper error handling
2. Request validation using middleware
3. Service layer calls
4. Standardized response format
5. Proper HTTP status codes
6. Security checks for user ownership

Create: AuthController, ContextController, TemplateController, PostController, PlatformController
Each should handle CRUD operations and entity-specific actions
```

#### Step 5.2: Routes
**AI Prompt Template**:
```
Create route files with:
1. Express Router setup
2. Middleware application (auth, validation, rate limiting)
3. Route definitions with proper HTTP methods
4. Request validation schemas
5. OpenAPI/Swagger documentation comments
6. Error boundary handling

Routes: /api/v1/auth, /api/v1/contexts, /api/v1/templates, /api/v1/posts, /api/v1/platforms
```

### Phase 6: Application Setup (Days 14-15)
**Goal**: Complete application assembly

#### Step 6.1: Main Application
**AI Prompt Template**:
```
Create main application (app.ts) with:
1. Express app initialization
2. Security middleware (helmet, cors, compression)
3. Body parsing with limits
4. Rate limiting configuration
5. Route mounting with API versioning
6. Error handling middleware
7. Health check endpoint
8. 404 handler
9. Graceful shutdown handling
Include proper middleware order and configuration
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

## 🛡️ Error Prevention Strategies

### 1. TypeScript Best Practices
```typescript
// Always use strict mode
"strict": true,
"noImplicitAny": true,
"strictNullChecks": true

// Use proper error types
interface ApiError extends Error {
    statusCode: number;
    code?: string;
}
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