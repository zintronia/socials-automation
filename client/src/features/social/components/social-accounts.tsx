'use client';

import React, { useState, useEffect } from 'react';
import { useSocial } from '../hooks/useSocial';
import { SocialAccount, Platform } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
    Twitter,
    Linkedin,
    Instagram,
    Facebook,
    MoreVertical,
    Plus,
    RefreshCw,
    Trash2,
    ExternalLink,
    CheckCircle,
    XCircle,
    AlertCircle,
    Clock
} from 'lucide-react';

const SocialAccounts: React.FC = () => {
    const {
        accounts,
        platforms,
        twitterAccounts,
        twitterStats,
        accountsLoading,
        platformsLoading,
        twitterLoading,
        statsLoading,
        accountsError,
        platformsError,
        twitterError,
        statsError,
        setFilters,
        connectAccount,
        disconnectAccount,
        startTwitterOAuth,
        completeTwitterOAuth,
        refreshTwitterToken,
        disconnectTwitterAccount,
        refreshAccounts,
    } = useSocial();

    const [isConnecting, setIsConnecting] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');

    // Handle Twitter OAuth flow
    const handleTwitterConnect = async () => {
        setIsConnecting(true);
        try {
            const callbackUrl = `${window.location.origin}/social/callback`;
            console.log('Initiating Twitter OAuth with callback URL:', callbackUrl);

            const result = await startTwitterOAuth(callbackUrl, [
                'tweet.read',
                'tweet.write',
                'users.read',
                'offline.access'
            ]);

            console.log('Twitter OAuth result:', result);

            if (result.success && result.data) {
                console.log('OAuth data received:', result.data);
                // Store state for callback
                localStorage.setItem('twitter_oauth_state', result.data.state);
                // Redirect to Twitter OAuth
                window.location.href = result.data.authUrl;
            } else {
                console.error('OAuth initiation failed:', result.error);
                toast.error(result.error || 'Failed to initiate Twitter OAuth');
            }
        } catch (error) {
            console.error('Exception in Twitter OAuth:', error);
            toast.error('Failed to connect Twitter account');
        } finally {
            setIsConnecting(false);
        }
    };

    // Handle OAuth callback
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const storedState = localStorage.getItem('twitter_oauth_state');

        if (code && state && storedState === state) {
            handleOAuthCallback(code, state);
        }
    }, []);

    const handleOAuthCallback = async (code: string, state: string) => {
        try {
            const result = await completeTwitterOAuth(code, state);
            if (result.success) {
                toast.success('Twitter account connected successfully!');
                localStorage.removeItem('twitter_oauth_state');
                // Clean up URL
                window.history.replaceState({}, document.title, window.location.pathname);
            } else {
                toast.error(result.error || 'Failed to complete Twitter OAuth');
            }
        } catch (error) {
            toast.error('Failed to complete Twitter OAuth');
        }
    };

    // Handle token refresh
    const handleRefreshToken = async (accountId: string) => {
        try {
            const result = await refreshTwitterToken(accountId);
            if (result.success) {
                toast.success('Token refreshed successfully');
                refreshAccounts();
            } else {
                toast.error(result.error || 'Failed to refresh token');
            }
        } catch (error) {
            toast.error('Failed to refresh token');
        }
    };

    // Handle account disconnect
    const handleDisconnectAccount = async (accountId: string, platformName: string) => {
        try {
            const result = await disconnectAccount(accountId);
            if (result.success) {
                toast.success(`${platformName} account disconnected successfully`);
                refreshAccounts();
            } else {
                toast.error(result.error || 'Failed to disconnect account');
            }
        } catch (error) {
            toast.error('Failed to disconnect account');
        }
    };

    // Get platform icon
    const getPlatformIcon = (platformName: string) => {
        switch (platformName.toLowerCase()) {
            case 'twitter':
            case 'twitter oauth2':
                return <Twitter className="h-5 w-5" />;
            case 'linkedin':
            case 'linkedin oauth2':
                return <Linkedin className="h-5 w-5" />;
            case 'instagram':
                return <Instagram className="h-5 w-5" />;
            case 'facebook':
                return <Facebook className="h-5 w-5" />;
            default:
                return <ExternalLink className="h-5 w-5" />;
        }
    };

    // Get connection status icon and color
    const getConnectionStatus = (account: SocialAccount) => {
        switch (account.connection_status) {
            case 'connected':
                return { icon: <CheckCircle className="h-4 w-4" />, color: 'bg-green-500' };
            case 'disconnected':
                return { icon: <XCircle className="h-4 w-4" />, color: 'bg-red-500' };
            case 'expired':
                return { icon: <Clock className="h-4 w-4" />, color: 'bg-yellow-500' };
            case 'error':
                return { icon: <AlertCircle className="h-4 w-4" />, color: 'bg-red-500' };
            default:
                return { icon: <AlertCircle className="h-4 w-4" />, color: 'bg-gray-500' };
        }
    };

    // Filter accounts based on search and platform
    const filteredAccounts = accounts.filter(account => {
        const matchesSearch = account.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.account_username?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPlatform = !selectedPlatform || account.platform_name?.toLowerCase().includes(selectedPlatform.toLowerCase());
        return matchesSearch && matchesPlatform;
    });

    if (accountsLoading || platformsLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
            </div>
        );
    }

    if (accountsError || platformsError) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Failed to load social accounts. Please try again.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Social Accounts</h1>
                    <p className="text-muted-foreground">
                        Connect and manage your social media accounts
                    </p>
                </div>
                <Button onClick={refreshAccounts} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Stats */}
            {twitterStats && (
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
                            <Twitter className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{twitterStats.total_accounts}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Connected</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{twitterStats.connected_accounts}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Expired</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{twitterStats.expired_accounts}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Errors</CardTitle>
                            <AlertCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{twitterStats.error_accounts}</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <Input
                        placeholder="Search accounts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="All platforms" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem >All platforms</SelectItem>
                        {platforms.map((platform) => (
                            <SelectItem key={platform.id} value={platform.name}>
                                {platform.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Connect New Account */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Connect New Account
                    </CardTitle>
                    <CardDescription>
                        Connect your social media accounts to start posting
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {/* Twitter */}
                        <Card className="relative">
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Twitter className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold">Twitter</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Connect your Twitter account
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    className="w-full mt-4"
                                    onClick={handleTwitterConnect}
                                    disabled={isConnecting}
                                >
                                    {isConnecting ? 'Connecting...' : 'Connect Twitter'}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* LinkedIn */}
                        <Card className="relative">
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Linkedin className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold">LinkedIn</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Connect your LinkedIn account
                                        </p>
                                    </div>
                                </div>
                                <Button className="w-full mt-4" variant="outline" disabled>
                                    Coming Soon
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Instagram */}
                        <Card className="relative">
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-pink-100 rounded-lg">
                                        <Instagram className="h-6 w-6 text-pink-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold">Instagram</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Connect your Instagram account
                                        </p>
                                    </div>
                                </div>
                                <Button className="w-full mt-4" variant="outline" disabled>
                                    Coming Soon
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>

            <Separator />

            {/* Connected Accounts */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Connected Accounts</h2>
                {filteredAccounts.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <div className="text-muted-foreground">
                                No accounts connected yet. Connect your first social media account above.
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredAccounts.map((account) => {
                            const status = getConnectionStatus(account);
                            return (
                                <Card key={account.id} className="relative">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={account.profile_image_url} />
                                                    <AvatarFallback>
                                                        {getPlatformIcon(account.platform_name || '')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <CardTitle className="text-sm">
                                                        {account.account_name}
                                                    </CardTitle>
                                                    <CardDescription className="text-xs">
                                                        @{account.account_username}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {account.connection_status === 'expired' && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleRefreshToken(account.id)}
                                                        >
                                                            <RefreshCw className="h-4 w-4 mr-2" />
                                                            Refresh Token
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem
                                                        onClick={() => handleDisconnectAccount(account.id, account.platform_name || '')}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Disconnect
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <div className={`w-2 h-2 rounded-full ${status.color}`} />
                                                <span className="text-xs capitalize">
                                                    {account.connection_status}
                                                </span>
                                            </div>
                                            <Badge variant="secondary" className="text-xs">
                                                {account.platform_name}
                                            </Badge>
                                        </div>
                                        {account.follower_count > 0 && (
                                            <div className="mt-2 text-xs text-muted-foreground">
                                                {account.follower_count.toLocaleString()} followers
                                            </div>
                                        )}
                                        {account.last_error && (
                                            <div className="mt-2 text-xs text-red-600">
                                                Error: {account.last_error}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SocialAccounts; 