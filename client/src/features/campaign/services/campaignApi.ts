import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '@/store/store';
import {
    Campaign,
    CreateCampaignRequest,
    UpdateCampaignRequest,
    CampaignResponse,
    CampaignsListResponse,
    CampaignFilters,
    CampaignStats,
} from '../types';

// Create API service
export const campaignApi = createApi({
    reducerPath: 'campaignApi',
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
        prepareHeaders: (headers, { getState }) => {
            // Get token from auth state
            const token = (getState() as RootState).auth.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Campaign'],
    endpoints: (builder) => ({
        getCampaigns: builder.query<Campaign[], CampaignFilters | void>({
            query: (filters) => ({
                url: '/campaigns',
                params: filters || undefined,
            }),
            transformResponse: (response: CampaignsListResponse) => response.data,
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: 'Campaign' as const, id })),
                        { type: 'Campaign', id: 'LIST' },
                    ]
                    : [{ type: 'Campaign', id: 'LIST' }],
        }),

        getCampaignById: builder.query<Campaign, number>({
            query: (id) => `/campaigns/${id}`,
            transformResponse: (response: CampaignResponse) => response.data,
            providesTags: (result, error, id) => [{ type: 'Campaign', id }],
        }),

        createCampaign: builder.mutation<Campaign, CreateCampaignRequest>({
            query: (campaign) => ({
                url: '/campaigns',
                method: 'POST',
                body: campaign,
            }),
            transformResponse: (response: CampaignResponse) => response.data,
            invalidatesTags: [{ type: 'Campaign', id: 'LIST' }],
        }),

        updateCampaign: builder.mutation<Campaign, UpdateCampaignRequest>({
            query: ({ id, ...campaign }) => ({
                url: `/campaigns/${id}`,
                method: 'PUT',
                body: campaign,
            }),
            transformResponse: (response: CampaignResponse) => response.data,
            invalidatesTags: (result, error, { id }) => [
                { type: 'Campaign', id },
                { type: 'Campaign', id: 'LIST' },
            ],
        }),

        deleteCampaign: builder.mutation<void, number>({
            query: (id) => ({
                url: `/campaigns/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'Campaign', id: 'LIST' }],
        }),

        getCampaignStats: builder.query<CampaignStats, void>({
            query: () => '/campaigns/stats',
            transformResponse: (response: { success: boolean; data: CampaignStats }) => response.data,
            providesTags: [{ type: 'Campaign', id: 'STATS' }],
        }),
    }),
});

// Export hooks for usage in components
export const {
    useGetCampaignsQuery,
    useGetCampaignByIdQuery,
    useCreateCampaignMutation,
    useUpdateCampaignMutation,
    useDeleteCampaignMutation,
    useGetCampaignStatsQuery,
} = campaignApi;
