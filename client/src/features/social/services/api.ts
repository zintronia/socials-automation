import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '@/store/store';
import {
    SocialAccount,
    Platform,
    ConnectAccountRequest,
    OAuthInitiateRequest,
    OAuthInitiateResponse,
    OAuthCallbackRequest,
    OAuthCallbackResponse,
    SocialAccountResponse,
    SocialAccountsListResponse,
    PlatformResponse,
    SocialAccountStats,
    SocialFilters,
} from '../types';
import { baseQuery } from '@/lib/api/baseApi';

export const socialApi = createApi({
    reducerPath: 'socialApi',
    baseQuery,
    tagTypes: ['SocialAccount', 'Platform'],
    endpoints: (builder) => ({
        // Get all social accounts
        getSocialAccounts: builder.query<SocialAccount[], SocialFilters | void>({
            query: (filters) => ({
                url: '/social-accounts',
                params: filters || {},
            }),
            transformResponse: (response: SocialAccountsListResponse) => response.data,
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: 'SocialAccount' as const, id })),
                        { type: 'SocialAccount', id: 'LIST' },
                    ]
                    : [{ type: 'SocialAccount', id: 'LIST' }],
        }),

        // Get a specific social account
        getSocialAccountById: builder.query<SocialAccount, string>({
            query: (id) => `/social-accounts/${id}`,
            transformResponse: (response: SocialAccountResponse) => response.data,
            providesTags: (result, error, id) => [{ type: 'SocialAccount', id }],
        }),

        // Connect a social account
        connectAccount: builder.mutation<SocialAccount, ConnectAccountRequest>({
            query: (account) => ({
                url: '/social-accounts/connect',
                method: 'POST',
                body: account,
            }),
            transformResponse: (response: SocialAccountResponse) => response.data,
            invalidatesTags: [{ type: 'SocialAccount', id: 'LIST' }],
        }),

        // Disconnect a social account
        disconnectAccount: builder.mutation<void, string>({
            query: (id) => ({
                url: `/social-accounts/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'SocialAccount', id: 'LIST' }],
        }),

        // Get all platforms
        getPlatforms: builder.query<Platform[], void>({
            query: () => '/platforms',
            transformResponse: (response: PlatformResponse) => response.data,
            providesTags: [{ type: 'Platform', id: 'LIST' }],
        }),

        // Twitter OAuth 2.0 endpoints
        initiateTwitterOAuth: builder.mutation<OAuthInitiateResponse, OAuthInitiateRequest>({
            query: (request) => ({
                url: '/oauth2/twitter/initiate',
                method: 'POST',
                body: request,
            }),
            transformResponse: (response: { success: boolean; message: string; data: OAuthInitiateResponse; timestamp: string }) => response.data,
        }),

        handleTwitterCallback: builder.mutation<OAuthCallbackResponse, OAuthCallbackRequest>({
            query: (request) => ({
                url: '/oauth2/twitter/callback',
                method: 'POST',
                body: request,
            }),
            transformResponse: (response: { success: boolean; message: string; data: OAuthCallbackResponse; timestamp: string }) => response.data,
            invalidatesTags: [{ type: 'SocialAccount', id: 'LIST' }],
        }),

        // Get connected Twitter accounts
        getTwitterAccounts: builder.query<SocialAccount[], void>({
            query: () => '/oauth2/twitter/accounts',
            transformResponse: (response: { success: boolean; message: string; data: SocialAccount[]; timestamp: string }) => response.data,
            providesTags: [{ type: 'SocialAccount', id: 'LIST' }],
        }),

        // Refresh Twitter access token
        refreshTwitterToken: builder.mutation<{ accountId: string; expiresIn: number; expiresAt: string }, string>({
            query: (accountId) => ({
                url: `/oauth2/twitter/accounts/${accountId}/refresh`,
                method: 'POST',
            }),
            transformResponse: (response: { success: boolean; message: string; data: { accountId: string; expiresIn: number; expiresAt: string }; timestamp: string }) => response.data,
            invalidatesTags: (result, error, accountId) => [
                { type: 'SocialAccount', id: accountId },
                { type: 'SocialAccount', id: 'LIST' },
            ],
        }),

        // Disconnect Twitter account
        disconnectTwitterAccount: builder.mutation<void, string>({
            query: (accountId) => ({
                url: `/oauth2/twitter/accounts/${accountId}/disconnect`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'SocialAccount', id: 'LIST' }],
        }),

        // Get Twitter account statistics
        getTwitterStats: builder.query<SocialAccountStats, void>({
            query: () => '/oauth2/twitter/stats',
            transformResponse: (response: { success: boolean; message: string; data: SocialAccountStats; timestamp: string }) => response.data,
        }),

        // Validate OAuth state (for debugging)
        validateOAuthState: builder.query<{
            valid: boolean;
            userId: string;
            platformId: number;
            callbackUrl: string;
            scope: string[];
            createdAt: string;
        }, string>({
            query: (state) => `/oauth2/twitter/state/${state}/validate`,
            transformResponse: (response: { success: boolean; message: string; data: any; timestamp: string }) => response.data,
        }),

        // Get access token (for debugging)
        getAccessToken: builder.query<{
            accountId: string;
            hasAccessToken: boolean;
            tokenLength: number;
        }, string>({
            query: (accountId) => `/oauth2/twitter/accounts/${accountId}/token`,
            transformResponse: (response: { success: boolean; message: string; data: any; timestamp: string }) => response.data,
        }),
    }),
});

// Export hooks for usage in components
export const {
    useGetSocialAccountsQuery,
    useGetSocialAccountByIdQuery,
    useConnectAccountMutation,
    useDisconnectAccountMutation,
    useGetPlatformsQuery,
    useInitiateTwitterOAuthMutation,
    useHandleTwitterCallbackMutation,
    useGetTwitterAccountsQuery,
    useRefreshTwitterTokenMutation,
    useDisconnectTwitterAccountMutation,
    useGetTwitterStatsQuery,
    useValidateOAuthStateQuery,
    useGetAccessTokenQuery,
} = socialApi; 