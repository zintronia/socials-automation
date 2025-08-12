-- Users table (unchanged)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Platforms table (unchanged)
CREATE TABLE IF NOT EXISTS platforms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL,
  icon_url VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  max_content_length INTEGER NOT NULL,
  supports_media BOOLEAN NOT NULL DEFAULT TRUE,
  supported_media_types TEXT[],
  platform_constraints JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Content categories (unchanged)
CREATE TABLE IF NOT EXISTS content_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Context templates - key changes for requirements
CREATE TABLE IF NOT EXISTS context_templates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id), -- NULL for system templates
  platform_id INTEGER REFERENCES platforms(id), -- NULL for generic templates
  category_id INTEGER REFERENCES content_categories(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  system_instructions TEXT NOT NULL,
  tone VARCHAR(50) NOT NULL,
  writing_style VARCHAR(50) NOT NULL,
  target_audience VARCHAR(100) NOT NULL,
  use_hashtags BOOLEAN NOT NULL DEFAULT TRUE,
  max_hashtags INTEGER NOT NULL DEFAULT 5,
  hashtag_strategy VARCHAR(50) NOT NULL DEFAULT 'niche',
  include_cta BOOLEAN NOT NULL DEFAULT FALSE,
  cta_type VARCHAR(50),
  content_structure JSONB NOT NULL DEFAULT '{}',
  engagement_level VARCHAR(50) NOT NULL DEFAULT 'medium',
  call_to_action_templates TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  is_system_template BOOLEAN NOT NULL DEFAULT FALSE, -- NEW: Identifies system templates
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints to ensure proper template ownership
  CONSTRAINT check_template_ownership CHECK (
    (is_system_template = TRUE AND user_id IS NULL) OR 
    (is_system_template = FALSE AND user_id IS NOT NULL)
  )
);

-- Contexts - removed direct platform_id and template_id references
CREATE TABLE IF NOT EXISTS contexts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  type VARCHAR(20) NOT NULL,
  title VARCHAR(200) NOT NULL,
  topic VARCHAR(200),
  brief TEXT,
  content TEXT NOT NULL,
  source TEXT,
  mimetype VARCHAR(100),
  size INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Campaign table - added for campaign management
CREATE TABLE IF NOT EXISTS campaigns (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- OAuth state management table for PKCE and CSRF protection
CREATE TABLE IF NOT EXISTS oauth_states (
  id SERIAL PRIMARY KEY,
  state VARCHAR(255) NOT NULL UNIQUE,
  code_verifier VARCHAR(255) NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  platform_id INTEGER REFERENCES platforms(id) ON DELETE CASCADE,
  callback_url TEXT NOT NULL,
  scope TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  
  -- Index for cleanup and lookups
  CONSTRAINT idx_oauth_states_expires_at CHECK (expires_at > created_at)
);

-- Social Accounts - for connecting and managing social media accounts
CREATE TABLE IF NOT EXISTS social_accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  platform_id INTEGER REFERENCES platforms(id) ON DELETE CASCADE,
  account_name VARCHAR(255) NOT NULL, -- Display name or username
  account_id VARCHAR(255) NOT NULL, -- Platform-specific account ID
  account_username VARCHAR(255), -- Username/handle (e.g., @username)
  account_email VARCHAR(255), -- Associated email if available
  profile_image_url VARCHAR(500), -- Profile picture URL
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  
  -- OAuth and Authentication (Enhanced for OAuth 2.0)
  access_token TEXT, -- Legacy field for backward compatibility
  refresh_token TEXT, -- Legacy field for backward compatibility
  oauth_version VARCHAR(10) NOT NULL DEFAULT '1.0a',
  encrypted_access_token TEXT, -- Encrypted OAuth access token
  encrypted_refresh_token TEXT, -- Encrypted OAuth refresh token
  token_encryption_iv VARCHAR(64), -- Initialization vector for token encryption
  pkce_code_verifier VARCHAR(255), -- PKCE code verifier used during OAuth flow
  oauth_state VARCHAR(255), -- OAuth state parameter for this connection
  token_expires_at TIMESTAMP, -- When the access token expires
  scope TEXT[], -- Granted permissions/scopes
  token_refresh_attempts INTEGER NOT NULL DEFAULT 0, -- Number of failed token refresh attempts
  last_token_refresh TIMESTAMP, -- Last time token was refreshed
  token_refresh_error TEXT, -- Last error message from token refresh
  
  -- Account Status
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE, -- Platform verification status
  connection_status VARCHAR(50) NOT NULL DEFAULT 'connected', -- connected, disconnected, expired, error
  last_sync_at TIMESTAMP, -- Last time account data was synced
  
  -- Platform-specific data
  platform_data JSONB NOT NULL DEFAULT '{}', -- Store platform-specific fields
  
  -- Error handling
  last_error TEXT, -- Last error message if any
  error_count INTEGER NOT NULL DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  UNIQUE(platform_id, account_id), -- Prevent duplicate account_id per platform (same account can't be connected twice)
  CONSTRAINT check_connection_status CHECK (
    connection_status IN ('connected', 'disconnected', 'expired', 'error', 'pending')
  ),
  CONSTRAINT check_oauth_version CHECK (oauth_version IN ('1.0a', '2.0'))
);

-- Posts 
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  context_id INTEGER REFERENCES contexts(id), 
  template_id INTEGER REFERENCES context_templates(id), -- NULL = no template used
  platform_id INTEGER REFERENCES platforms(id), -- Target platform
  campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
  social_account_id INTEGER REFERENCES social_accounts(id), -- Social account to post ,
  content TEXT NOT NULL,
  prompt TEXT NOT NULL,
  content_type VARCHAR(50) NOT NULL DEFAULT 'text',
  hashtags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  mentions TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  scheduled_for TIMESTAMP,
  published_at TIMESTAMP,
  platform_post_id VARCHAR(255),
  platform_url VARCHAR(255),
  platform_response JSONB NOT NULL DEFAULT '{}',
  engagement_metrics JSONB NOT NULL DEFAULT '{}',
  last_metrics_update TIMESTAMP,
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Media (unchanged)
CREATE TABLE IF NOT EXISTS media (
  id SERIAL PRIMARY KEY,
  mediaable_type VARCHAR(50) NOT NULL,
  mediaable_id INTEGER NOT NULL,
  url VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL,
  mime_type VARCHAR(100),
  size INTEGER,
  width INTEGER,
  height INTEGER,
  duration INTEGER,
  thumbnail_url VARCHAR(255),
  alt_text VARCHAR(255),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for OAuth states performance
CREATE INDEX IF NOT EXISTS idx_oauth_states_state ON oauth_states(state);
CREATE INDEX IF NOT EXISTS idx_oauth_states_user_id ON oauth_states(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires_at ON oauth_states(expires_at);

-- Create indexes for social accounts performance
CREATE INDEX IF NOT EXISTS idx_social_accounts_user_platform ON social_accounts(user_id, platform_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_connection_status ON social_accounts(connection_status);
CREATE INDEX IF NOT EXISTS idx_social_accounts_token_expires ON social_accounts(token_expires_at);
CREATE INDEX IF NOT EXISTS idx_social_accounts_oauth_version ON social_accounts(oauth_version);

-- Insert default data for OAuth 2.0 platforms
INSERT INTO platforms (name, type, icon_url, is_active, max_content_length, supports_media, supported_media_types, platform_constraints) VALUES 
('Twitter', 'social', 'https://example.com/twitter-oauth2.png', true, 280, true, ARRAY['image', 'video', 'gif'], '{"max_images": 4, "max_video_duration": 140, "thread_support": true, "oauth2_support": true}'),
('LinkedIn', 'social', 'https://example.com/linkedin-oauth2.png', true, 3000, true, ARRAY['image', 'video', 'document'], '{"max_images": 20, "professional_tone_preferred": true, "article_support": true, "oauth2_support": true}')
ON CONFLICT (name) DO UPDATE SET 
  type = EXCLUDED.type,
  is_active = EXCLUDED.is_active,
  platform_constraints = EXCLUDED.platform_constraints;