'use client'

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useRefreshTokenMutation
} from '../services/authApi';
import {
    clearAuth,
    setError,
    selectAuth,
    selectAuthLoading,
    selectAuthError,
    selectIsAuthenticated,
    selectUser,
    selectToken
} from '../authSlice';
import { LoginRequest, RegisterRequest } from '../types';

export const useAuth = () => {
    const dispatch = useAppDispatch();

    // memoized selectors for better performance
    const user = useAppSelector(selectUser);
    const token = useAppSelector(selectToken);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const loading = useAppSelector(selectAuthLoading);
    const error = useAppSelector(selectAuthError);
    const auth = useAppSelector(selectAuth);

    const [loginMutation, { isLoading: isLoginLoading }] = useLoginMutation();
    const [registerMutation, { isLoading: isRegisterLoading }] = useRegisterMutation();
    const [logoutMutation, { isLoading: isLogoutLoading }] = useLogoutMutation();
    const [refreshTokenMutation, { isLoading: isRefreshLoading }] = useRefreshTokenMutation();

    const login = useCallback(async (credentials: LoginRequest) => {
        try {
            const result = await loginMutation(credentials).unwrap();
            return result;
        } catch (error: any) {
            const errorMessage = error?.data?.message || 'Login failed';
            dispatch(setError(errorMessage));
            throw error;
        }
    }, [loginMutation, dispatch]);

    const register = useCallback(async (userData: RegisterRequest) => {
        try {
            const result = await registerMutation(userData).unwrap();
            return result;
        } catch (error: any) {
            const errorMessage = error?.data?.message || 'Registration failed';
            dispatch(setError(errorMessage));
            throw error;
        }
    }, [registerMutation, dispatch]);

    // Logout function
    const logout = useCallback(async () => {
        try {
            await logoutMutation().unwrap();
        } catch (error) {
            console.warn('Logout API call failed, clearing local state anyway:', error);
        } finally {
            dispatch(clearAuth());
        }
    }, [logoutMutation, dispatch]);

    const refreshToken = useCallback(async () => {
        if (!auth.currentRefreshToken) {
            throw new Error('No refresh token available');
        }
        try {
            const result = await refreshTokenMutation({
                refreshToken: auth.currentRefreshToken
            }).unwrap();
            return result;
        } catch (error: any) {
            dispatch(clearAuth());
            throw error;
        }
    }, [refreshTokenMutation, auth.currentRefreshToken, dispatch]);

    // Clear error function
    const clearAuthError = useCallback(() => {
        dispatch(setError(null));
    }, [dispatch]);

    const isLoading = loading || isLoginLoading || isRegisterLoading || isLogoutLoading || isRefreshLoading;

    return {
        // State
        user,
        token,
        currentRefreshToken: auth.currentRefreshToken,
        isAuthenticated,
        error,
        loading: isLoading,

        // Actions
        login,
        register,
        logout,
        refreshToken,
        clearError: clearAuthError,
    };
};
