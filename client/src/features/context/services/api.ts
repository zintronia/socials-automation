import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
    Context,
    CreateContextRequest,
    UpdateContextRequest,
    ContextResponse,
    ContextsListResponse,
    ContextFilters,
} from '../types';
import { baseQuery } from '@/lib/api/baseApi';


// Create API service
export const contextApi = createApi({
    reducerPath: 'contextApi',
    baseQuery,
    tagTypes: ['Context'],
    endpoints: (builder) => ({
        getContexts: builder.query<Context[], ContextFilters | void>({
            query: (filters) => ({
                url: '/contexts',
                params: filters,
            }),
            transformResponse: (response: ContextsListResponse) => response.data,
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: 'Context' as const, id })),
                        { type: 'Context', id: 'LIST' },
                    ]
                    : [{ type: 'Context', id: 'LIST' }],
        }),

        getContextById: builder.query<Context, number>({
            query: (id) => `/contexts/${id}`,
            transformResponse: (response: ContextResponse) => response.data,
            providesTags: (result, error, id) => [{ type: 'Context', id }],
        }),

        createContext: builder.mutation<Context, CreateContextRequest>({
            query: (context) => ({
                url: '/contexts',
                method: 'POST',
                body: context,
            }),
            transformResponse: (response: ContextResponse) => response.data,
            invalidatesTags: [{ type: 'Context', id: 'LIST' }],
        }),

        updateContext: builder.mutation<Context, UpdateContextRequest>({
            query: ({ id, ...context }) => ({
                url: `/contexts/${id}`,
                method: 'PUT',
                body: context,
            }),
            transformResponse: (response: ContextResponse) => response.data,
            invalidatesTags: (result, error, { id }) => [
                { type: 'Context', id },
                { type: 'Context', id: 'LIST' },
            ],
        }),

        deleteContext: builder.mutation<void, number>({
            query: (id) => ({
                url: `/contexts/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'Context', id: 'LIST' }],
        }),
    }),
});

// Export hooks for usage in components
export const {
    useGetContextsQuery,
    useGetContextByIdQuery,
    useCreateContextMutation,
    useUpdateContextMutation,
    useDeleteContextMutation,
} = contextApi;
