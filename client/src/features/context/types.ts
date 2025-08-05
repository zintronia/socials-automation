export interface Context {
  id: number;
  user_id: number;
  platform_id?: number;
  type: 'document' | 'text' | 'youtube' | 'url' | 'manual';
  title: string;
  topic?: string;
  brief?: string;
  content: string;
  template_variables?: Record<string, any>;
  tone?: string;
  writing_style?: string;
  target_audience?: string;
  tags?: string[];
  is_processed: boolean;
  created_at: string;
  updated_at: string;
  platform_name?: string;
  category_name?: string;
}

export interface ContextState {
  contexts: Context[];
  selectedContext: Context | null;
  loading: boolean;
  error: string | null;
}

export interface CreateContextRequest {
  platform_id?: number;
  type: 'document' | 'text' | 'youtube' | 'url' | 'manual';
  title: string;
  topic?: string;
  brief?: string;
  content: string;
  template_variables?: Record<string, any>;
  tone?: string;
  writing_style?: string;
  target_audience?: string;
  tags?: string[];
}

export interface UpdateContextRequest extends Partial<CreateContextRequest> {
  id: number;
}

export interface ContextResponse {
  success: boolean;
  message: string;
  data: Context;
  timestamp: string;
}

export interface ContextsListResponse {
  success: boolean;
  message: string;
  data: Context[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  timestamp: string;
}

export interface ContextFilters {
  page?: number;
  limit?: number;
  type?: 'document' | 'text' | 'youtube' | 'url' | 'manual';
  platform_id?: number;
  category_id?: number;
  search?: string;
  sortBy?: 'created_at' | 'updated_at' | 'title';
  sortOrder?: 'ASC' | 'DESC';
}
