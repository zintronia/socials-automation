// Auth State
export interface AuthState {
  user: User | null;
  token: string | null;
  currentRefreshToken?: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// User Interface
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
}

// Login
export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    refreshToken: string;
    expiresIn: string;
  };
  timestamp: string;
}

// Register
export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    refreshToken: string;
    expiresIn: string;
  };
  timestamp: string;
}

// Refresh Token
export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    refreshToken: string;
    expiresIn: string;
  };
  timestamp: string;
}

// Error Response
export interface ErrorResponse {
  success: boolean;
  message: string;
  error: string;
  details?: Record<string, string[]>;
  timestamp: string;
}
