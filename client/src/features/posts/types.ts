export interface Post {
  id: number;
  user_id: number;
  context_id?: number;
  platform_id: number;
  content: string;
  content_type: 'text' | 'image' | 'video' | 'carousel' | 'story' | 'reel';
  media_urls?: string[];
  hashtags?: string[];
  mentions?: string[];
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduled_for?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;

  // Optional fields from joined tables
  context_title?: string;
  platform_name?: string;
  user_email?: string;
}

export interface PostFilters {
  status?: string;
  platform_id?: number;
  context_id?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'updated_at' | 'scheduled_for' | 'published_at';
  sortOrder?: 'ASC' | 'DESC';
}

export interface GeneratePostRequest {
  context_id: number;
  platform_id: number;
  scheduled_for?: string;
  campaign_id?: number;
}

export interface UpdatePostRequest {
  content?: string;
  media_urls?: string[];
  hashtags?: string[];
  mentions?: string[];
  status?: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduled_for?: string;
}

export interface PostResponse {
  success: boolean;
  message: string;
  data: Post;
}

export interface PostsListResponse {
  success: boolean;
  message: string;
  data: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PostState {
  selectedPost: Post | null;
  isLoading: boolean;
  error: string | null;
}
