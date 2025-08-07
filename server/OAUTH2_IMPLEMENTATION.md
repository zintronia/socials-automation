# OAuth 2.0 Implementation for Social Media Automation

## Overview

This implementation provides a modern, secure OAuth 2.0 flow for connecting social media accounts (Twitter, LinkedIn) with the following security enhancements:

### Security Features

✅ **PKCE (Proof Key for Code Exchange)** - Prevents authorization code interception  
✅ **State Parameter** - CSRF protection  
✅ **Token Encryption** - AES-256-GCM encryption at rest  
✅ **Redis State Management** - Production-ready session storage  
✅ **Automatic Token Refresh** - Seamless token renewal  
✅ **Multiple Account Support** - Connect multiple accounts per platform per user  

## Architecture

### Database Schema

The implementation includes enhanced database tables:

1. **`oauth_states`** - Stores OAuth state and PKCE code verifier
2. **Enhanced `social_accounts`** - Supports OAuth 2.0 with encrypted tokens
3. **Automatic cleanup** - Expired states are automatically removed

### Key Components

- **Redis Service** - State management and caching
- **Token Encryption** - Secure token storage
- **OAuth 2.0 Services** - Platform-specific implementations
- **Enhanced Controllers** - Modern API endpoints

## Setup Instructions

### 1. Environment Variables

Create a `.env` file with the following variables:

```bash
# Redis Configuration (Required for OAuth 2.0)
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# OAuth 2.0 Configuration
TOKEN_ENCRYPTION_KEY=your_32_character_encryption_key_here
OAUTH_STATE_EXPIRY_MINUTES=10
PKCE_CODE_VERIFIER_LENGTH=128
OAUTH_MAX_REFRESH_ATTEMPTS=3

# Twitter OAuth 2.0
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
TWITTER_CALLBACK_URL=http://localhost:3001/oauth/callback
TWITTER_OAUTH2_ENABLED=true

# LinkedIn OAuth 2.0 (Future)
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_CALLBACK_URL=http://localhost:3001/oauth/linkedin/callback
```

### 2. Database Migration

Run the new migration to add OAuth 2.0 support:

```bash
# Apply the new migration
psql -d your_database -f src/database/migrations/003_oauth2_enhancements.sql
```

### 3. Install Dependencies

```bash
npm install redis crypto
```

### 4. Start Redis

```bash
# Using Docker
docker run -d -p 6379:6379 redis:alpine

# Or install locally
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS
brew install redis
```

## API Endpoints

### Twitter OAuth 2.0

#### 1. Initiate OAuth Flow

```http
POST /api/v1/oauth2/twitter/initiate
Content-Type: application/json
Authorization: Bearer <your_jwt_token>

{
  "callbackUrl": "https://yourapp.com/oauth/callback",
  "scopes": ["tweet.read", "tweet.write", "users.read", "offline.access"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "authUrl": "https://twitter.com/oauth/authorize?response_type=code&client_id=...&redirect_uri=...&scope=...&state=...&code_challenge=...&code_challenge_method=S256",
    "state": "abc123def456...",
    "platformId": 1,
    "scopes": ["tweet.read", "tweet.write", "users.read", "offline.access"]
  },
  "message": "Twitter OAuth 2.0 URL generated successfully"
}
```

#### 2. Handle Callback

```http
POST /api/v1/oauth2/twitter/callback
Content-Type: application/json
Authorization: Bearer <your_jwt_token>

{
  "code": "authorization_code_from_twitter",
  "state": "state_parameter_from_initiate"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "account": {
      "id": "123",
      "account_name": "John Doe",
      "account_username": "johndoe",
      "profile_image_url": "https://...",
      "is_verified": true,
      "connection_status": "connected",
      "platform_id": 1,
      "created_at": "2024-01-01T00:00:00Z"
    },
    "userData": {
      "id": "123456789",
      "username": "johndoe",
      "name": "John Doe",
      "description": "Software Developer",
      "profileImageUrl": "https://...",
      "followersCount": 1000,
      "verified": true
    }
  },
  "message": "Twitter account connected successfully"
}
```

#### 3. Get Connected Accounts

```http
GET /api/v1/oauth2/twitter/accounts
Authorization: Bearer <your_jwt_token>
```

#### 4. Refresh Access Token

```http
POST /api/v1/oauth2/twitter/accounts/{accountId}/refresh
Authorization: Bearer <your_jwt_token>
```

#### 5. Disconnect Account

```http
DELETE /api/v1/oauth2/twitter/accounts/{accountId}/disconnect
Authorization: Bearer <your_jwt_token>
```

## Security Implementation

### 1. PKCE (Proof Key for Code Exchange)

```typescript
// Generate code verifier and challenge
const codeVerifier = TokenEncryption.generateCodeVerifier(128);
const codeChallenge = TokenEncryption.generateCodeChallenge(codeVerifier);

// Store in Redis with expiry
await redisService.setOAuthState(state, {
  codeVerifier,
  userId,
  platformId,
  callbackUrl,
  scope
}, 10); // 10 minutes expiry
```

### 2. Token Encryption

```typescript
// Encrypt tokens before storage
const encryptedTokens = TokenEncryption.encryptTokens({
  accessToken: 'twitter_access_token',
  refreshToken: 'twitter_refresh_token'
});

// Store encrypted tokens
await socialAccountService.createSocialAccount({
  encrypted_access_token: encryptedTokens.encryptedAccessToken,
  encrypted_refresh_token: encryptedTokens.encryptedRefreshToken,
  token_encryption_iv: encryptedTokens.iv,
  // ... other fields
});
```

### 3. State Management

```typescript
// Store OAuth state in Redis
await redisService.setOAuthState(state, stateData, 10);

// Retrieve and validate state (auto-deletes after retrieval)
const stateData = await redisService.getOAuthState(state);
if (!stateData) {
  throw new Error('Invalid or expired OAuth state');
}
```

## Multiple Account Support

The implementation supports multiple accounts per platform per user:

```typescript
// User can have multiple Twitter accounts
const accounts = await socialAccountService.getActiveSocialAccounts(userId, 1);
// Returns array of all connected Twitter accounts for the user
```

## Token Refresh

Automatic token refresh is handled transparently:

```typescript
// Get access token (automatically refreshes if needed)
const accessToken = await oauth2TwitterService.getAccessToken(accountId);

// Manual refresh
const { accessToken, expiresIn } = await oauth2TwitterService.refreshAccessToken(accountId);
```

## Error Handling

Comprehensive error handling with proper logging:

```typescript
try {
  const result = await oauth2TwitterService.handleCallback(code, state);
} catch (error) {
  logger.error('OAuth callback failed:', error);
  // Update account status
  await socialAccountService.updateConnectionStatus(accountId, 'error', error.message);
}
```

## Monitoring and Health Checks

### Health Check Endpoint

```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "v1",
  "environment": "development",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

### Account Statistics

```http
GET /api/v1/oauth2/twitter/stats
Authorization: Bearer <your_jwt_token>
```

## Migration from OAuth 1.0a

The implementation maintains backward compatibility:

1. **Dual Support** - Both OAuth 1.0a and OAuth 2.0 are supported
2. **Gradual Migration** - Users can migrate accounts gradually
3. **Version Tracking** - `oauth_version` field tracks which version is used

## Production Considerations

### 1. Redis Configuration

```bash
# Production Redis configuration
REDIS_URL=redis://your-redis-cluster:6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0
```

### 2. Token Encryption Key

```bash
# Generate a secure 32-character key
TOKEN_ENCRYPTION_KEY=$(openssl rand -hex 16)
```

### 3. Rate Limiting

```bash
# Configure rate limits for OAuth endpoints
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Monitoring

- Monitor Redis connection status
- Track OAuth state expiry rates
- Monitor token refresh success rates
- Alert on failed OAuth flows

## Testing

### 1. Unit Tests

```bash
npm test
```

### 2. Integration Tests

```bash
# Test OAuth flow
curl -X POST http://localhost:3000/api/v1/oauth2/twitter/initiate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"callbackUrl": "http://localhost:3001/callback"}'
```

### 3. State Validation

```http
GET /api/v1/oauth2/twitter/state/{state}/validate
Authorization: Bearer <your_jwt_token>
```

## Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   - Check Redis server status
   - Verify connection parameters
   - Check firewall settings

2. **Token Encryption Errors**
   - Ensure `TOKEN_ENCRYPTION_KEY` is 32 characters
   - Check for special characters in the key

3. **OAuth State Expired**
   - Increase `OAUTH_STATE_EXPIRY_MINUTES`
   - Check Redis memory usage

4. **Token Refresh Failed**
   - Verify refresh token is valid
   - Check Twitter API rate limits
   - Review error logs

### Debug Endpoints

- `/api/v1/oauth2/twitter/state/{state}/validate` - Validate OAuth state
- `/api/v1/oauth2/twitter/accounts/{accountId}/token` - Check access token status

## Future Enhancements

1. **LinkedIn OAuth 2.0** - Full LinkedIn integration
2. **Facebook OAuth 2.0** - Facebook page management
3. **Instagram OAuth 2.0** - Instagram business accounts
4. **Token Rotation** - Automatic token rotation for enhanced security
5. **Webhook Support** - Real-time account status updates

## Support

For issues and questions:

1. Check the logs in `./logs/`
2. Verify environment variables
3. Test Redis connectivity
4. Review API documentation at `/api-docs` 