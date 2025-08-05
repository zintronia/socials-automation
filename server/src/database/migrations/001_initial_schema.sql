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
  name VARCHAR(100) NOT NULL,
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

-- Template types (unchanged) // not required //removed
-- CREATE TABLE IF NOT EXISTS template_types (
--   id SERIAL PRIMARY KEY,
--   name VARCHAR(100) NOT NULL,
--   description TEXT
-- );

-- MODIFIED: Context templates - key changes for requirements
CREATE TABLE IF NOT EXISTS context_templates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id), -- NULL for system templates
  platform_id INTEGER REFERENCES platforms(id), -- NULL for generic templates
  -- template_type_id INTEGER REFERENCES template_types(id), // not required //removed
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
  -- required_elements TEXT[] NOT NULL DEFAULT ARRAY['main_content'],  //NOT REQUIRED  //removed
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

-- Template variables (unchanged)  //not required  //remove
-- CREATE TABLE IF NOT EXISTS template_variables (
--   id SERIAL PRIMARY KEY,
--   template_id INTEGER REFERENCES context_templates(id) ON DELETE CASCADE,
--   variable_name VARCHAR(100) NOT NULL,
--   variable_type VARCHAR(20) NOT NULL,
--   default_value VARCHAR(255),
--   is_required BOOLEAN NOT NULL DEFAULT FALSE,
--   description TEXT
-- );

-- MODIFIED: Contexts - removed direct platform_id and template_id references
CREATE TABLE IF NOT EXISTS contexts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  -- Removed: template_id and platform_id for independence
  -- category_id INTEGER REFERENCES content_categories(id),
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

-- Context tags (unchanged) //remove this (not used)
-- CREATE TABLE IF NOT EXISTS context_tags (
--   id SERIAL PRIMARY KEY,
--   context_id INTEGER REFERENCES contexts(id) ON DELETE CASCADE,
--   tag VARCHAR(50) NOT NULL
-- );

--Campaign table - added for campaign management
-- Campaigns allow grouping of posts and contexts for specific marketing efforts
-- Campaigns can have multiple posts and contexts associated with them
CREATE TABLE IF NOT EXISTS campaigns (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- MODIFIED: Posts - now references context_id and template_id for generation
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  context_id INTEGER REFERENCES contexts(id), -- Links to context
  template_id INTEGER REFERENCES context_templates(id), -- NULL = no template used
  platform_id INTEGER REFERENCES platforms(id), -- Target platform
  campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
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
)

