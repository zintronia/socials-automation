import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '@/store/store';
import {
    Template,
    CreateTemplateRequest,
    UpdateTemplateRequest,
    TemplateResponse,
    TemplatesListResponse,
    TemplateFilters,
} from '../types';

// Helper function to handle API errors
const handleResponse = (response: any) => {
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

// Create API service
export const templateApi = createApi({
    reducerPath: 'templateApi',
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
        prepareHeaders: (headers, { getState }) => {
            // Get token from auth state
            const token = (getState() as RootState).auth.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            headers.set('Content-Type', 'application/json');
            return headers;
        },
    }),
    tagTypes: ['Template'],
    // Auto-refresh data when window regains focus
    refetchOnFocus: true,
    // Auto-refresh data when network reconnects
    refetchOnReconnect: true,
    endpoints: (builder) => ({
        getTemplates: builder.query<Template[], TemplateFilters | void>({
            query: (filters = {}) => ({
                url: '/templates',
                method: 'GET',
                params: {
                    page: 1,
                    limit: 100,
                    ...filters,
                },
            }),
            transformResponse: (response: TemplatesListResponse) => {
                if (!response || !response.data) {
                    throw new Error('Invalid response format');
                }
                return response.data;
            },
            providesTags: (result = []) => [
                ...result.map(({ id }) => ({ type: 'Template' as const, id })),
                { type: 'Template', id: 'LIST' },
            ],
        }),

        getTemplateById: builder.query<Template, string | number>({
            query: (id) => ({
                url: `/templates/${id}`,
                method: 'GET',
            }),
            transformResponse: (response: TemplateResponse) => {
                if (!response || !response.data) {
                    throw new Error('Template not found');
                }
                return response.data;
            },
            providesTags: (result, error, id) => [{ type: 'Template', id }],
        }),

        createTemplate: builder.mutation<Template, CreateTemplateRequest>({
            query: (template) => ({
                url: '/templates',
                method: 'POST',
                body: JSON.stringify(template),
            }),
            transformResponse: (response: TemplateResponse) => {
                if (!response || !response.data) {
                    throw new Error('Failed to create template');
                }
                return response.data;
            },
            transformErrorResponse: (response) => {
                return {
                    status: response.status,
                    data: response.data,
                    message: response.data?.message || 'Failed to create template',
                };
            },
            invalidatesTags: ['Template'],
        }),

        updateTemplate: builder.mutation<Template, { id: string | number; template: UpdateTemplateRequest }>({
            query: ({ id, template }) => ({
                url: `/templates/${id}`,
                method: 'PUT',
                body: JSON.stringify(template),
            }),
            transformResponse: (response: TemplateResponse) => {
                if (!response || !response.data) {
                    throw new Error('Failed to update template');
                }
                return response.data;
            },
            transformErrorResponse: (response) => ({
                status: response.status,
                data: response.data,
                message: response.data?.message || 'Failed to update template',
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Template', id },
                { type: 'Template', id: 'LIST' },
            ],
        }),

        deleteTemplate: builder.mutation<{ success: boolean }, string | number>({
            query: (id) => ({
                url: `/templates/${id}`,
                method: 'DELETE',
            }),
            transformResponse: (response: { success: boolean }) => {
                if (!response || response.success !== true) {
                    throw new Error('Failed to delete template');
                }
                return response;
            },
            transformErrorResponse: (response) => ({
                status: response.status,
                data: response.data,
                message: response.data?.message || 'Failed to delete template',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Template', id },
                { type: 'Template', id: 'LIST' },
            ],
        }),
    }),
});

// Export hooks for usage in components
export const {
    useGetTemplatesQuery,
    useGetTemplateByIdQuery,
    useCreateTemplateMutation,
    useUpdateTemplateMutation,
    useDeleteTemplateMutation,
} = templateApi;
