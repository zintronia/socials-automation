import { Request } from 'express';


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

// Authentication Types
export interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        profile_image_url?: string;
        created_at: Date;
        updated_at: Date;
    };
    userId: string;
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
export interface TemplateVariable {
    variable_name: string;
    variable_type: 'text' | 'number' | 'date' | 'url' | 'boolean';
    default_value?: string;
    is_required: boolean;
    description?: string;
}

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

export interface UpdateTemplateRequest extends Partial<CreateTemplateRequest> { }

// Context Types
export interface Context {
    id: number;
    userId: string;
    template_id?: number;
    platform_id: number;
    category_id?: number;
    type: 'document' | 'text' | 'youtube' | 'url' | 'manual';
    title: string;
    topic?: string;
    brief?: string;
    content: string;
    source?: string;
    language: string;
    region?: string;
    mimetype?: string;
    size?: number;
    template_variables: Record<string, any>;
    tone?: string;
    writing_style?: string;
    target_audience?: string;
    system_instructions?: string;
    is_processed: boolean;
    processed_at?: Date;
    processing_error?: string;
    metadata: Record<string, any>;
    created_at: Date;
    updated_at: Date;
    // Joined fields
    template_name?: string;
    platform_name?: string;
    category_name?: string;
    tags?: string[];
}

export interface CreateContextRequest {
    template_id?: number;
    platform_id: number;
    category_id?: number;
    type: Context['type'];
    title: string;
    topic?: string;
    brief?: string;
    content: string;
    source?: string;
    language?: string;
    region?: string;
    mimetype?: string;
    size?: number;
    template_variables?: Record<string, any>;
    tone?: string;
    writing_style?: string;
    target_audience?: string;
    system_instructions?: string;
    tags?: string[];
}

export interface UpdateContextRequest extends Partial<CreateContextRequest> { }

// Post Types
export interface Post {
    id: number;
    user_id: string;
    context_id?: number;
    template_id?: number;
    platform_id: number;
    campaign_id?: number;
    content: string;
    content_type: string;
    prompt?: string;
    metadata: Record<string, any>;
    status: 'draft' | 'ready' | 'published' | 'partially_published' | 'failed' | 'archived';
    created_at: Date;
    updated_at: Date;
    // Joined fields
    context_name?: string;
    template_name?: string;
    platform_name?: string;
    campaign_name?: string;
    user_email?: string;
    social_accounts?: SocialAccountInfo[];
}

// Post Account Types (new table)
export interface PostAccount {
    id: number;
    post_id: number;
    social_account_id: number;
    status: 'scheduled' | 'publishing' | 'published' | 'failed';
    scheduled_for?: Date;
    published_at?: Date;
    platform_post_id?: string;
    platform_url?: string;
    platform_response: Record<string, any>;
    error_message?: string;
    retry_count: number;
    engagement_metrics: Record<string, any>;
    last_metrics_update?: Date;
    created_at: Date;
    updated_at: Date;
    // Joined fields
    account_name?: string;
    account_username?: string;
    profile_image_url?: string;
    platform_name?: string;
}

// Social Account Info (for joined queries)
export interface SocialAccountInfo {
    id?: number;
    account_name: string;
    account_username?: string;
    profile_image_url?: string;
    platform_name?: string;
}

export interface CreatePostRequest {
    user_id: string;
    context_id?: number;
    template_id?: number;
    platform_id: number;
    campaign_id?: number;
    prompt?: string;
    content: string;
    content_type?: string;
    status?: Post['status'];
    metadata?: Record<string, any>;
}

export interface UpdatePostRequest {
    content?: string;
    metadata?: Record<string, any>;
    status?: Post['status'];
}

export interface GeneratePostRequest {
    context_id?: number;
    template_id?: number;
    platform_id: number;
    prompt?: string;
    campaign_id?: number;
    social_account_ids?: number[];
    scheduled_for?: Date;
}

// Post Account Management Types
export interface LinkPostAccountsRequest {
    social_account_ids: number[];
}

export interface SchedulePostRequest {
    scheduled_for: Date;
    social_account_ids?: number[];
}

export interface PublishPostRequest {
    social_account_id?: number; // Optional: publish to specific account only
}

// Post Collection Types
export interface PostCollection {
    id: number;
    userId: string;
    title: string;
    description?: string;
    created_at: Date;
    updated_at: Date;
    // Joined fields
    post_count?: number;
    user_email?: string;
}

export interface CreatePostCollectionRequest {
    title: string;
    description?: string;
}

export interface UpdatePostCollectionRequest {
    title?: string;
    description?: string;
}

// AI Types
export interface AIGenerationRequest {
    context?: Context | undefined;
    prompt?: string;
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


// Campaign Types
export interface Campaign {
    id: number;
    userId: string;
    title: string;
    description?: string;
    created_at: Date;
    updated_at: Date;
    // Joined fields
    user_email?: string;
    post_count?: number;
    posts?: Post[];
}

export interface CreateCampaignRequest {
    title: string;
    description?: string;
}

export interface UpdateCampaignRequest {
    title?: string;
    description?: string;
}

export interface CampaignWithPosts extends Campaign {
    posts: Post[];
}