'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials, clearCredentials } from './slice';

export const useAuthSync = () => {
  const { isLoaded, isSignedIn, user, getToken } = useAuth();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const syncAuth = async () => {
      if (!isLoaded) return;

      if (isSignedIn && user) {
        const token = await getToken();
        if (token) {
          dispatch(
            setCredentials({
              token,
              user: {
                id: user.id,
                email: user.emailAddresses[0]?.emailAddress,
                firstName: user.firstName,
                lastName: user.lastName,
                imageUrl: user.imageUrl,
              },
            })
          );
        }
      } else {
        dispatch(clearCredentials());
      }
    };

    syncAuth();
  }, [isLoaded, isSignedIn, user, getToken, dispatch]);

  return { isLoaded, isSignedIn };
};
