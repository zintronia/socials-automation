export interface Campaign {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignState {
  campaigns: Campaign[];
  selectedCampaign: Campaign | null;
  loading: boolean;
  error: string | null;
}

export interface CreateCampaignRequest {
  title: string;
  description?: string;
}

export interface UpdateCampaignRequest extends Partial<CreateCampaignRequest> {
  id: number;
}

export interface CampaignResponse {
  success: boolean;
  message: string;
  data: Campaign;
  timestamp: string;
}

export interface CampaignsListResponse {
  success: boolean;
  message: string;
  data: Campaign[];
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

export interface CampaignFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'created_at' | 'updated_at' | 'title';
  sortOrder?: 'ASC' | 'DESC';
}

export interface CampaignStats {
  total_campaigns: number;
  active_campaigns: number;
  total_posts: number;
  recent_activity: {
    campaigns_created_this_week: number;
    posts_created_this_week: number;
  };
}
