export interface PostSocialAccount {
  id: number;
  account_name?: string | null;
  account_username?: string | null;
  profile_image_url?: string | null;
  platform_id: number;
  scheduled_for?: string | null;
  published_at?: string | null;
  platform_post_id?: string | null;
  platform_url?: string | null;
  status: 'scheduled' | 'publishing' | 'published' | 'failed';
}

export interface Post {
  id: number;
  context_name?: string | null;
  template_name?: string | null;
  platform_name: string;
  campaign_name?: string | null;
  social_accounts: PostSocialAccount[]; // Changed from single object to array
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduled_for?: string | null;
  published_at?: string | null;
  content: string;
  created_at?: string | null;
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

export interface GeneratePayload {
  context_id?: number;
  campaign_id?: number;
  prompt: string;
  platforms: Array<{
    platform_id: number;
    template_id?: number | undefined;
    scheduled_for?: string | null;
    social_account_ids: number[]; // Changed from single social_account_id to array
  }>;
};

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


export interface GeneratedResponse {
  success: boolean;
  message: string;
  data: {
    results: Post[];
    error?: any;
  };
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
