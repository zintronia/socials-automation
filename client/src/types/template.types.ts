export interface Platform {
    id: number;
    name: string;
    max_content_length: number;
    supported_media_types: string[];
    icon: React.ComponentType<{ className?: string }>
}

export interface ContentCategory {
    id: number;
    name: string;
    description: string;
}


export interface ContextTemplate {
    id: number;
    name: string;
    description?: string;
    platform_id: number;
    platform_name?: string;
    category_id?: number;
    category_name?: string;
    tone: string;
    writing_style: string;
    target_audience: string;
    use_hashtags: boolean;
    max_hashtags: number;
    hashtag_strategy: string;
    include_cta: boolean;
    cta_type?: string;
    engagement_level: string;
    is_default: boolean;
    is_public: boolean;
    usage_count: number;
    created_at: string;
}

export interface CreateTemplateRequest {
    name: string;
    description?: string;
    platform_id: number;
    category_id?: number;
    system_instructions: string;
    tone: string;
    writing_style: string;
    target_audience: string;
    use_hashtags: boolean;
    max_hashtags: number;
    hashtag_strategy: string;
    include_cta: boolean;
    cta_type?: string;
    engagement_level: string;
    is_public: boolean;
}

export interface TemplateFilters {
    platform_id?: number;
    category_id?: number;
    search?: string;
    tone?: string;
    writing_style?: string;
}

export interface TemplatesProps {
    onSelectTemplate?: (template: ContextTemplate) => void;
    selectedTemplateId?: number;
    showActions?: boolean;
}