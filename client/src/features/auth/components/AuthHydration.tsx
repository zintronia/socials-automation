'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '../authSlice';
import { loadPersistedAuthState } from '../middleware/authPersistenceMiddleware';

/**
 * AuthHydration - Handles client-side hydration of auth state from localStorage
 * This component ensures SSR compatibility by only running on the client
 */
export function AuthHydration() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Only run on client-side after hydration
    const persistedState = loadPersistedAuthState();
    
    // If we have valid persisted auth data, restore it
    if (persistedState.isAuthenticated && persistedState.user && persistedState.token) {
      dispatch(setCredentials({
        user: persistedState.user,
        token: persistedState.token,
        currentRefreshToken: persistedState.currentRefreshToken,
      }));
    }
  }, [dispatch]);

  // This component doesn't render anything
  return null;
}
