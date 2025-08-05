import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from './types';
import { authApi } from './services/authApi';

const initialState: AuthState = {
  user: null,
  token: null,
  currentRefreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Single source of truth for setting credentials
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
        token: string;
        currentRefreshToken?: string | null;
      }>
    ) => {
      const { user, token, currentRefreshToken } = action.payload;
      state.user = user;
      state.token = token;
      state.currentRefreshToken = currentRefreshToken || null;
      state.isAuthenticated = true;
      state.error = null;
      state.loading = false;
    },
    // Clear all auth state
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.currentRefreshToken = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    // Set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addMatcher(
        authApi.endpoints.login.matchPending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        authApi.endpoints.login.matchFulfilled,
        (state, { payload }) => {
          const { user, token, refreshToken } = payload.data;
          state.user = user;
          state.token = token;
          state.currentRefreshToken = refreshToken;
          state.isAuthenticated = true;
          state.loading = false;
          state.error = null;
        }
      )
      .addMatcher(
        authApi.endpoints.login.matchRejected,
        (state, { error }) => {
          state.loading = false;
          state.error = (error as any)?.data?.message || 'Login failed';
        }
      )
      // Register
      .addMatcher(
        authApi.endpoints.register.matchPending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        authApi.endpoints.register.matchFulfilled,
        (state, { payload }) => {
          const { user, token, refreshToken } = payload.data;
          state.user = user;
          state.token = token;
          state.currentRefreshToken = refreshToken;
          state.isAuthenticated = true;
          state.loading = false;
          state.error = null;
        }
      )
      .addMatcher(
        authApi.endpoints.register.matchRejected,
        (state, { error }) => {
          state.loading = false;
          state.error = (error as any)?.data?.message || 'Registration failed';
        }
      )
      // Refresh token
      .addMatcher(
        authApi.endpoints.refreshToken.matchFulfilled,
        (state, { payload }) => {
          const { token, refreshToken } = payload.data;
          state.token = token;
          state.currentRefreshToken = refreshToken;
        }
      )
      .addMatcher(
        authApi.endpoints.refreshToken.matchRejected,
        (state) => {
          // Token refresh failed, clear auth state
          state.user = null;
          state.token = null;
          state.currentRefreshToken = null;
          state.isAuthenticated = false;
          state.loading = false;
        }
      )
      // Logout
      .addMatcher(
        authApi.endpoints.logout.matchFulfilled,
        (state) => {
          state.user = null;
          state.token = null;
          state.currentRefreshToken = null;
          state.isAuthenticated = false;
          state.loading = false;
        }
      );
  },
});

export const { setCredentials, clearAuth, setLoading, setError } = authSlice.actions;

// Selectors for memoized access
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectToken = (state: { auth: AuthState }) => state.auth.token;

export default authSlice.reducer;
