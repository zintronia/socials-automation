export interface SocialAccount {
    id: string;
    user_id: number;
    platform_id: number;
    account_name: string;
    account_id: string;
    account_username?: string;
    account_email?: string;
    profile_image_url?: string;
    follower_count: number;
    following_count: number;
    oauth_version: '1.0a' | '2.0';
    encrypted_access_token?: string;
    encrypted_refresh_token?: string;
    token_encryption_iv?: string;
    pkce_code_verifier?: string;
    oauth_state?: string;
    token_expires_at?: string;
    scope: string[];
    token_refresh_attempts: number;
    last_token_refresh?: string;
    token_refresh_error?: string;
    is_active: boolean;
    is_verified: boolean;
    connection_status: 'connected' | 'disconnected' | 'expired' | 'error' | 'pending';
    last_sync_at?: string;
    platform_data: Record<string, any>;
    last_error?: string;
    error_count: number;
    created_at: string;
    updated_at: string;
    platform_name?: string;
    platform_type?: string;
}

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
    created_at: string;
    updated_at: string;
}

export interface SocialState {
    accounts: SocialAccount[];
    platforms: Platform[];
    selectedAccount: SocialAccount | null;
    loading: boolean;
    error: string | null;
}

export interface ConnectAccountRequest {
    platformId: number;
    accountId: string;
    accountName: string;
    accessToken: string;
    refreshToken?: string;
    platform_data?: Record<string, any>;
}

export interface OAuthInitiateRequest {
    callbackUrl: string;
    scopes?: string[];
}

export interface OAuthInitiateResponse {
    authUrl: string;
    state: string;
    platformId: number;
    scopes: string[];
}

export interface OAuthCallbackRequest {
    code: string;
    state: string;
}

export interface OAuthCallbackResponse {
    account: SocialAccount;
    userData: {
        id: string;
        username: string;
        name: string;
        description?: string;
        profileImageUrl?: string;
        followersCount?: number;
        verified?: boolean;
    };
}

export interface SocialAccountResponse {
    success: boolean;
    message: string;
    data: SocialAccount;
    timestamp: string;
}

export interface SocialAccountsListResponse {
    success: boolean;
    message: string;
    data: SocialAccount[];
    timestamp: string;
}

export interface PlatformResponse {
    success: boolean;
    message: string;
    data: Platform[];
    timestamp: string;
}

export interface SocialAccountStats {
    platform_id: number;
    total_accounts: number;
    connected_accounts: number;
    error_accounts: number;
    expired_accounts: number;
}

export interface SocialFilters {
    platformId?: number;
    connectionStatus?: 'connected' | 'disconnected' | 'expired' | 'error' | 'pending';
    isActive?: boolean;
} 