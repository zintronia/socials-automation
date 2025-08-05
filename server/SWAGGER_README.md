# Social Media Automation API - Swagger Documentation

## Overview

This API provides comprehensive social media automation capabilities including AI-powered content generation, multi-platform publishing, and content management. The API is fully documented using Swagger/OpenAPI 3.0 specification.

## Accessing the Documentation

### Development Environment
Once the server is running, you can access the Swagger documentation at:
```
http://localhost:3000/api-docs
```

### Production Environment
```
https://your-domain.com/api-docs
```

## API Endpoints Overview

### 🔐 Authentication Routes
- **POST** `/api/v1/auth/register` - User registration
- **POST** `/api/v1/auth/login` - User login
- **POST** `/api/v1/auth/refresh` - Token refresh
- **POST** `/api/v1/auth/logout` - User logout

### 📝 Context Routes
- **GET** `/api/v1/contexts` - List user contexts (with filters, pagination)
- **POST** `/api/v1/contexts` - Create new context
- **GET** `/api/v1/contexts/:id` - Get specific context
- **PUT** `/api/v1/contexts/:id` - Update context
- **DELETE** `/api/v1/contexts/:id` - Delete context

### 📋 Template Routes
- **GET** `/api/v1/templates` - List templates (user + public)
- **POST** `/api/v1/templates` - Create custom template
- **GET** `/api/v1/templates/:id` - Get template details
- **PUT** `/api/v1/templates/:id` - Update template
- **DELETE** `/api/v1/templates/:id` - Delete template

### 📮 Post Routes
- **GET** `/api/v1/posts` - List user posts (with filters)
- **POST** `/api/v1/posts/generate` - Generate post from context
- **GET** `/api/v1/posts/:id` - Get post details
- **PUT** `/api/v1/posts/:id` - Update post content
- **POST** `/api/v1/posts/:id/schedule` - Schedule post
- **POST** `/api/v1/posts/:id/publish` - Publish post immediately
- **DELETE** `/api/v1/posts/:id` - Delete post

### 🌐 Platform Routes
- **GET** `/api/v1/platforms` - List all available platforms
- **GET** `/api/v1/platforms/:id` - Get platform details

## Authentication

The API uses JWT (JSON Web Token) authentication. Most endpoints require authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Getting Started with Authentication

1. **Register a new user:**
   ```bash
   POST /api/v1/auth/register
   {
     "email": "user@example.com",
     "password": "securepassword123",
     "first_name": "John",
     "last_name": "Doe"
   }
   ```

2. **Login to get access token:**
   ```bash
   POST /api/v1/auth/login
   {
     "email": "user@example.com",
     "password": "securepassword123"
   }
   ```

3. **Use the token in subsequent requests:**
   ```bash
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## Key Features

### 🔍 Interactive Documentation
- **Try It Out**: Test endpoints directly from the Swagger UI
- **Request/Response Examples**: See real examples for each endpoint
- **Schema Validation**: Automatic validation of request/response schemas
- **Error Documentation**: Comprehensive error response documentation

### 📊 Comprehensive Schemas
- **User Management**: Complete user registration, authentication, and profile management
- **Context Management**: Document, text, YouTube, URL, and manual content types
- **Template System**: Customizable AI templates with variables and constraints
- **Post Management**: Full CRUD operations with scheduling and publishing
- **Platform Integration**: Multi-platform support with platform-specific constraints

### 🛡️ Security Features
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Detailed error responses with proper HTTP status codes
- **Rate Limiting**: Built-in rate limiting for API protection

## Data Models

### User
- Email, password, first name, last name
- Role-based access control
- Account status and last login tracking

### Context
- Multiple content types (document, text, YouTube, URL, manual)
- Template variables and metadata
- Processing status and error tracking

### Template
- AI system instructions and writing style
- Platform-specific constraints
- Variable definitions and validation
- Public/private template management

### Post
- Multi-platform content generation
- Scheduling and publishing capabilities
- Engagement metrics tracking
- Error handling and retry mechanisms

### Platform
- Platform-specific constraints and capabilities
- Media support and content limits
- Integration configuration

## Error Handling

The API provides consistent error responses with:
- **HTTP Status Codes**: Proper status codes (200, 201, 400, 401, 404, 500)
- **Error Messages**: Descriptive error messages
- **Error Codes**: Machine-readable error codes
- **Validation Details**: Field-level validation errors

Example error response:
```json
{
  "success": false,
  "message": "Validation failed",
  "error": "VALIDATION_ERROR",
  "details": {
    "email": ["Email is required"],
    "password": ["Password must be at least 8 characters"]
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Pagination

List endpoints support pagination with the following parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sortBy`: Sort field
- `sortOrder`: Sort order (ASC/DESC)

Example paginated response:
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Development

### Running the Server
```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Production build
npm run build
npm start
```

### Database Setup
```bash
# Setup database
npm run db:setup

# Seed with default data
npm run db:seed

# Reset database
npm run db:reset
```

### Testing
```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## API Versioning

The API uses versioning in the URL path:
- Current version: `v1`
- Base path: `/api/v1/`
- Future versions will be available at `/api/v2/`, etc.

## Rate Limiting

The API implements rate limiting to prevent abuse:
- Default: 100 requests per 15 minutes per IP
- Authentication endpoints: 5 requests per 15 minutes per IP
- Customizable per endpoint

## Support

For API support and questions:
- Email: support@socialmediaautomation.com
- Documentation: Available at `/api-docs`
- GitHub Issues: For bug reports and feature requests

## License

This API is licensed under the MIT License. See the LICENSE file for details. 