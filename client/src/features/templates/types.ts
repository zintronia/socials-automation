export interface Template {
  id: number;
  platform_id: number;
  category_id: number | null;
  user_id: number | null;
  name: string;
  description: string | null;
  system_instructions: string;
  tone: string;
  writing_style: string;
  target_audience: string;
  use_hashtags: boolean;
  max_hashtags: number;
  hashtag_strategy: string | null;
  include_cta: boolean;
  cta_type: string | null;
  content_structure: Record<string, any> | null;
  engagement_level: string | null;
  call_to_action_templates: string[] | null;
  is_public: boolean;
  is_active: boolean;
  is_system: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  platform_name?: string;
  category_name?: string | null;
}

export interface CreateTemplateRequest {
  platform_id: number | string;
  category_id?: number | string | null;
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

export type UpdateTemplateRequest = Partial<CreateTemplateRequest>;

export interface TemplateResponse {
  success: boolean;
  data: Template;
}

export interface TemplatesListResponse {
  success: boolean;
  data: Template[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface TemplateFilters {
  search?: string;
  platform_id?: number;
  category_id?: number;
  is_public?: boolean;
  is_active?: boolean;
  user_id?: number;
  page?: number;
  limit?: number;
}

// UI Related Types
export interface TemplateFormValues extends Omit<CreateTemplateRequest, 'platform_id' | 'category_id'> {
  platform_id: string;
  category_id?: string | null;
}

// Constants
export const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'formal', label: 'Formal' },
  { value: 'informative', label: 'Informative' },
  { value: 'persuasive', label: 'Persuasive' },
];

export const WRITING_STYLE_OPTIONS = [
  { value: 'business', label: 'Business' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'technical', label: 'Technical' },
  { value: 'creative', label: 'Creative' },
  { value: 'academic', label: 'Academic' },
];

export const HASHTAG_STRATEGY_OPTIONS = [
  { value: 'minimal', label: 'Minimal (1-2)' },
  { value: 'moderate', label: 'Moderate (3-5)' },
  { value: 'high', label: 'High (5-10)' },
  { value: 'trending', label: 'Trending' },
  { value: 'branded', label: 'Branded' },
];

export const CTA_TYPE_OPTIONS = [
  { value: 'learn_more', label: 'Learn More' },
  { value: 'sign_up', label: 'Sign Up' },
  { value: 'shop_now', label: 'Shop Now' },
  { value: 'contact_us', label: 'Contact Us' },
  { value: 'book_now', label: 'Book Now' },
  { value: 'download', label: 'Download' },
];

// Redux State Interface
export interface TemplateState {
  templates: Template[];
  selectedTemplate: Template | null;
  loading: boolean;
  error: string | null;
}