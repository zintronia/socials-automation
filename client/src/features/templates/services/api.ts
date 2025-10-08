import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
    Template,
    CreateTemplateRequest,
    UpdateTemplateRequest,
    TemplateResponse,
    TemplatesListResponse,
    TemplateFilters,
} from '../types';
import { baseQuery } from '@/lib/api/baseApi';


export const templateApi = createApi({
    reducerPath: 'templateApi',
    baseQuery: baseQuery,
    tagTypes: ['Template'],
    refetchOnFocus: true,
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
