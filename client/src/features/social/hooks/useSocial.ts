import { useState, useCallback } from 'react';
import {
    useGetSocialAccountsQuery,
    useConnectAccountMutation,
    useDisconnectAccountMutation,
    useGetPlatformsQuery,
    useInitiateTwitterOAuthMutation,
    useHandleTwitterCallbackMutation,
    useGetTwitterAccountsQuery,
    useRefreshTwitterTokenMutation,
    useDisconnectTwitterAccountMutation,
    useGetTwitterStatsQuery
} from '../services/api';
import { SocialAccount, ConnectAccountRequest, SocialFilters } from '../types';

export const useSocial = () => {
    const [filters, setFilters] = useState<SocialFilters>({
        platformId: undefined,
        connectionStatus: undefined,
        isActive: undefined
    });

    // RTK Query hooks
    const {
        data: accounts = [],
        isLoading: accountsLoading,
        error: accountsError,
        refetch: refetchAccounts
    } = useGetSocialAccountsQuery(filters);

    const {
        data: platforms = [],
        isLoading: platformsLoading,
        error: platformsError
    } = useGetPlatformsQuery();

    const {
        data: twitterAccounts = [],
        isLoading: twitterLoading,
        error: twitterError
    } = useGetTwitterAccountsQuery();

    const {
        data: twitterStats,
        isLoading: statsLoading,
        error: statsError
    } = useGetTwitterStatsQuery();

    // Mutations
    const [connectAccount] = useConnectAccountMutation();
    const [disconnectAccount] = useDisconnectAccountMutation();
    const [initiateTwitterOAuth] = useInitiateTwitterOAuthMutation();
    const [handleTwitterCallback] = useHandleTwitterCallbackMutation();
    const [refreshTwitterToken] = useRefreshTwitterTokenMutation();
    const [disconnectTwitterAccount] = useDisconnectTwitterAccountMutation();

    // Filter accounts based on current filters
    const filteredAccounts = accounts.filter(account => {
        if (filters.platformId && account.platform_id !== filters.platformId) {
            return false;
        }
        if (filters.connectionStatus && account.connection_status !== filters.connectionStatus) {
            return false;
        }
        if (filters.isActive !== undefined && account.is_active !== filters.isActive) {
            return false;
        }
        return true;
    });

    // Connect a social account
    const connectSocialAccount = useCallback(async (accountData: ConnectAccountRequest) => {
        try {
            const result = await connectAccount(accountData).unwrap();
            return { success: true, data: result };
        } catch (error) {
            console.error('Error connecting account:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to connect account'
            };
        }
    }, [connectAccount]);

    // Disconnect a social account
    const disconnectSocialAccount = useCallback(async (accountId: string) => {
        try {
            await disconnectAccount(accountId).unwrap();
            return { success: true };
        } catch (error) {
            console.error('Error disconnecting account:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to disconnect account'
            };
        }
    }, [disconnectAccount]);

    // Initiate Twitter OAuth
    const startTwitterOAuth = useCallback(async (callbackUrl: string, scopes?: string[]) => {
        try {
            const result = await initiateTwitterOAuth({ callbackUrl, scopes }).unwrap();
            console.log('OAuth initiate result:', result); // Debug log

            return { success: true, data: result };
        } catch (error) {
            console.error('Error initiating Twitter OAuth:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to initiate Twitter OAuth'
            };
        }
    }, [initiateTwitterOAuth]);

    // Handle Twitter OAuth callback
    const completeTwitterOAuth = useCallback(async (code: string, state: string) => {
        try {
            const result = await handleTwitterCallback({ code, state }).unwrap();
            return { success: true, data: result };
        } catch (error) {
            console.error('Error completing Twitter OAuth:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to complete Twitter OAuth'
            };
        }
    }, [handleTwitterCallback]);

    // Refresh Twitter token
    const refreshTwitterAccessToken = useCallback(async (accountId: string) => {
        try {
            const result = await refreshTwitterToken(accountId).unwrap();
            return { success: true, data: result };
        } catch (error) {
            console.error('Error refreshing Twitter token:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to refresh Twitter token'
            };
        }
    }, [refreshTwitterToken]);

    // Disconnect Twitter account
    const disconnectTwitterSocialAccount = useCallback(async (accountId: string) => {
        try {
            await disconnectTwitterAccount(accountId).unwrap();
            return { success: true };
        } catch (error) {
            console.error('Error disconnecting Twitter account:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to disconnect Twitter account'
            };
        }
    }, [disconnectTwitterAccount]);

    return {
        // State
        accounts: filteredAccounts,
        platforms,
        twitterAccounts,
        twitterStats,
        filters,

        // Loading states
        accountsLoading,
        platformsLoading,
        twitterLoading,
        statsLoading,

        // Error states
        accountsError,
        platformsError,
        twitterError,
        statsError,

        // Actions
        setFilters,
        connectAccount: connectSocialAccount,
        disconnectAccount: disconnectSocialAccount,
        startTwitterOAuth,
        completeTwitterOAuth,
        refreshTwitterToken: refreshTwitterAccessToken,
        disconnectTwitterAccount: disconnectTwitterSocialAccount,
        refreshAccounts: refetchAccounts,
    };
};

export default useSocial; 