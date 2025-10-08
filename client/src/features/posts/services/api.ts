import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '@/store/store';
import {
  Post,
  PostFilters,
  UpdatePostRequest,
  PostResponse,
  PostsListResponse,
  GeneratedResponse,
  GeneratePayload
} from '../types';
import { useAuth } from '@clerk/nextjs'
import { baseQuery } from '@/lib/api/baseApi';

// Create API service
export const postApi = createApi({
  reducerPath: 'postApi',
  baseQuery,
  tagTypes: ['Post'],
  endpoints: (builder) => ({
    getPosts: builder.query<Post[], Partial<PostFilters> | void>({
      query: (filters = {}) => ({
        url: '/posts',
        params: {
          page: filters?.page,
          limit: filters?.limit,
          status: filters?.status,
          platform_id: filters?.platform_id,
          context_id: filters?.context_id,
          search: filters?.search,
          sortBy: filters?.sortBy,
          sortOrder: filters?.sortOrder,
        },
      }),
      transformResponse: (response: PostsListResponse) => response.data,
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: 'Post' as const, id })),
            { type: 'Post', id: 'LIST' },
          ]
          : [{ type: 'Post', id: 'LIST' }],
    }),

    getPostById: builder.query<Post, number>({
      query: (id) => `/posts/${id}`,
      transformResponse: (response: PostResponse) => response.data,
      providesTags: (result, error, id) => [{ type: 'Post', id }],
    }),

    generatePost: builder.mutation<Post[], GeneratePayload>({
      query: (postData) => ({
        url: '/posts/generate',
        method: 'POST',
        body: postData,
      }),
      transformResponse: (response: GeneratedResponse) => response.data.results,
      invalidatesTags: [{ type: 'Post', id: 'LIST' }],
    }),

    createPost: builder.mutation<Post, Partial<Post>>({
      query: (post) => ({
        url: '/posts',
        method: 'POST',
        body: post,
      }),
      transformResponse: (response: PostResponse) => response.data,
      invalidatesTags: [{ type: 'Post', id: 'LIST' }],
    }),

    updatePost: builder.mutation<Post, { id: number; updates: UpdatePostRequest }>({
      query: ({ id, updates }) => ({
        url: `/posts/${id}`,
        method: 'PUT',
        body: updates,
      }),
      transformResponse: (response: PostResponse) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: 'Post', id },
        { type: 'Post', id: 'LIST' },
      ],
    }),

    deletePost: builder.mutation<void, number>({
      query: (id) => ({
        url: `/posts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Post', id },
        { type: 'Post', id: 'LIST' },
      ],
    }),

    publishPost: builder.mutation<Post, number>({
      query: (id) => ({
        url: `/posts/${id}/publish`,
        method: 'POST',
      }),
      transformResponse: (response: PostResponse) => response.data,
      invalidatesTags: (result, error, id) => [
        { type: 'Post', id },
        { type: 'Post', id: 'LIST' },
      ],
    }),

    schedulePost: builder.mutation<Post, { id: number; scheduled_for: string }>({
      query: ({ id, scheduled_for }) => ({
        url: `/posts/${id}/schedule`,
        method: 'POST',
        body: { scheduled_for },
      }),
      transformResponse: (response: PostResponse) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: 'Post', id },
        { type: 'Post', id: 'LIST' },
      ],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetPostsQuery,
  useGetPostByIdQuery,
  useGeneratePostMutation,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  usePublishPostMutation,
  useSchedulePostMutation,
} = postApi;
