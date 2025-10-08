'use client';

import { ReactNode } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { useAuthSync } from './useAuthSync';
import { Loader } from '@/components/ui/loader';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    return (
        <ClerkProvider>
            <AuthSync>{children}</AuthSync>
        </ClerkProvider>
    );
};

const AuthSync = ({ children }: { children: ReactNode }) => {
    const { isLoaded } = useAuthSync();

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader />
            </div>
        );
    }

    return <>{children}</>;
};
