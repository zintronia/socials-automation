'use client';

import { Contexts } from '@/features/context';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/lib/useAuth';

export default function ContextPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Content Hub</h1>
        <p className="text-muted-foreground">
          Manage your content contexts for AI-powered content generation
        </p>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <Contexts />
      </div>
    </div>
  );
}
