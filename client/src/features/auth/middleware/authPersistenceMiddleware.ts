'use client'

import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { setCredentials, clearAuth } from '../authSlice';
import { authApi } from '../services/authApi';
import type { AuthState } from '../types';

const STORAGE_KEYS = {
    USER: 'auth_user',
    TOKEN: 'auth_token',
    REFRESH_TOKEN: 'auth_refresh_token',
} as const;

// SSR-safe utility functions for localStorage operations
const storage = {
    get: (key: string): string | null => {
        if (typeof window === 'undefined') return null;
        try {
            return localStorage.getItem(key);
        } catch {
            return null;
        }
    },
    set: (key: string, value: string): void => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
        }
    },
    remove: (key: string): void => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.warn('Failed to remove from localStorage:', error);
        }
    },
    clear: (): void => {
        if (typeof window === 'undefined') return;
        Object.values(STORAGE_KEYS).forEach(key => storage.remove(key));
    },
};

// Load initial auth state from localStorage
export const loadPersistedAuthState = (): AuthState => {
    const user = storage.get(STORAGE_KEYS.USER);
    const token = storage.get(STORAGE_KEYS.TOKEN);
    const refreshToken = storage.get(STORAGE_KEYS.REFRESH_TOKEN);

    if (user && token) {
        try {
            return {
                user: JSON.parse(user),
                token,
                currentRefreshToken: refreshToken,
                isAuthenticated: true,
                loading: false,
                error: null,
            };
        } catch (error) {
            console.error('Failed to parse stored auth data:', error);
            storage.clear();
        }
    }

    return {
        user: null,
        token: null,
        currentRefreshToken: null,
        isAuthenticated: false,
        loading: false,
        error: null,
    };
};

// Create persistence middleware
export const authPersistenceMiddleware = createListenerMiddleware();

// Listen for auth state changes and persist to localStorage
authPersistenceMiddleware.startListening({
    matcher: isAnyOf(
        setCredentials,
        clearAuth,
        authApi.endpoints.login.matchFulfilled,
        authApi.endpoints.register.matchFulfilled,
        authApi.endpoints.refreshToken.matchFulfilled,
        authApi.endpoints.logout.matchFulfilled
    ),
    effect: async (action, { getState }) => {
        const state = getState() as { auth: AuthState };
        const { user, token, currentRefreshToken, isAuthenticated } = state.auth;

        if (isAuthenticated && user && token) {
            // Persist authenticated state
            storage.set(STORAGE_KEYS.USER, JSON.stringify(user));
            storage.set(STORAGE_KEYS.TOKEN, token);
            if (currentRefreshToken) {
                storage.set(STORAGE_KEYS.REFRESH_TOKEN, currentRefreshToken);
            }
        } else {
            // Clear persisted state
            storage.clear();
        }
    },
});

export const persistenceMiddlewareEnhancer = authPersistenceMiddleware.middleware;
