'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated, selectToken } from '../authSlice';
import { useAuth } from '../lib/useAuth';

/**
 * TokenRefreshProvider - Handles automatic token refresh
 * This component only manages token refresh logic and doesn't duplicate auth state management
 */
export function TokenRefreshProvider({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const token = useAppSelector(selectToken);
    const { refreshToken } = useAuth();
    const router = useRouter();

    // Handle automatic token refresh
    useEffect(() => {
        if (!isAuthenticated || !token) return;

        const handleTokenRefresh = async () => {
            try {
                await refreshToken();
            } catch (error) {
                console.error('Automatic token refresh failed:', error);
                // Redirect to login on refresh failure
                router.push('/login');
            }
        };

        // Refresh token every 14 minutes (tokens typically expire in 15 minutes)
        const interval = setInterval(handleTokenRefresh, 14 * 60 * 1000);
        
        return () => clearInterval(interval);
    }, [isAuthenticated, token, refreshToken, router]);

    return <>{children}</>;
}

// Export with original name for backward compatibility
export const AuthProvider = TokenRefreshProvider;
