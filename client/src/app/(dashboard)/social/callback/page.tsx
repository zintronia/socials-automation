'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useSocial } from '@/features/social';
import { toast } from 'sonner';

export default function SocialCallbackPage() {
    const router = useRouter();
    const { completeTwitterOAuth } = useSocial();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Processing authentication...');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const code = urlParams.get('code');
                const state = urlParams.get('state');
                const storedState = localStorage.getItem('twitter_oauth_state');

                if (!code || !state) {
                    setStatus('error');
                    setMessage('Missing authorization code or state parameter');
                    return;
                }

                if (state !== storedState) {
                    setStatus('error');
                    setMessage('Invalid state parameter. Please try again.');
                    return;
                }

                const result = await completeTwitterOAuth(code, state);

                if (result.success) {
                    setStatus('success');
                    setMessage('Twitter account connected successfully!');
                    localStorage.removeItem('twitter_oauth_state');
                    toast.success('Twitter account connected successfully!');

                    // Redirect back to social accounts page after 2 seconds
                    setTimeout(() => {
                        router.push('/social');
                    }, 2000);
                } else {
                    setStatus('error');
                    setMessage(result.error || 'Failed to complete authentication');
                    toast.error(result.error || 'Failed to complete authentication');
                }
            } catch (error) {
                setStatus('error');
                setMessage('An unexpected error occurred');
                toast.error('An unexpected error occurred');
            }
        };

        handleCallback();
    }, [completeTwitterOAuth, router]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2">
                        {status === 'loading' && <Loader2 className="h-6 w-6 animate-spin" />}
                        {status === 'success' && <CheckCircle className="h-6 w-6 text-green-500" />}
                        {status === 'error' && <XCircle className="h-6 w-6 text-red-500" />}
                        {status === 'loading' ? 'Connecting Account...' :
                            status === 'success' ? 'Success!' : 'Error'}
                    </CardTitle>
                    <CardDescription>
                        {message}
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    {status === 'loading' && (
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4 mx-auto" />
                        </div>
                    )}

                    {status === 'error' && (
                        <Button
                            onClick={() => router.push('/social')}
                            className="w-full"
                        >
                            Back to Social Accounts
                        </Button>
                    )}

                    {status === 'success' && (
                        <div className="text-sm text-muted-foreground">
                            Redirecting you back to social accounts...
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 