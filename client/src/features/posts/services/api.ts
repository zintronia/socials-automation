import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '@/store/store';
import {
  Post,
  PostFilters,
  UpdatePostRequest,
  PostResponse,
  PostsListResponse,
  GeneratedResponse,
  GeneratePayload,
  PostSocialAccount
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

    // Post-Account Management
    linkSocialAccounts: builder.mutation<PostSocialAccount[], { postId: number; social_account_ids: number[] }>({
      query: ({ postId, social_account_ids }) => ({
        url: `/posts/${postId}/accounts`,
        method: 'POST',
        body: { social_account_ids },
      }),
      transformResponse: (response: { success: boolean; data: PostSocialAccount[] }) => response.data,
      invalidatesTags: (result, error, { postId }) => [
        { type: 'Post', id: postId },
        { type: 'Post', id: 'LIST' },
      ],
      // Optimistically update the cache
      async onQueryStarted({ postId }, { dispatch, queryFulfilled }) {
        try {
          const { data: newAccounts } = await queryFulfilled;
          // Update the posts list cache
          dispatch(
            postApi.util.updateQueryData('getPosts', undefined, (draft) => {
              const post = draft.find(p => p.id === postId);
              if (post) {
                post.social_accounts = newAccounts;
              }
            })
          );
        } catch {}
      },
    }),

    unlinkSocialAccount: builder.mutation<void, { postId: number; accountId: number }>({
      query: ({ postId, accountId }) => ({
        url: `/posts/${postId}/accounts/${accountId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'Post', id: postId },
        { type: 'Post', id: 'LIST' },
      ],
      // Optimistically update the cache
      async onQueryStarted({ postId, accountId }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Update the posts list cache
          dispatch(
            postApi.util.updateQueryData('getPosts', undefined, (draft) => {
              const post = draft.find(p => p.id === postId);
              if (post) {
                post.social_accounts = post.social_accounts.filter(acc => acc.id !== accountId);
              }
            })
          );
        } catch {}
      },
    }),

    getPostAccounts: builder.query<PostSocialAccount[], number>({
      query: (postId) => `/posts/${postId}/accounts`,
      transformResponse: (response: { success: boolean; data: PostSocialAccount[] }) => response.data,
      providesTags: (result, error, postId) => [{ type: 'Post', id: postId }],
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
  useLinkSocialAccountsMutation,
  useUnlinkSocialAccountMutation,
  useGetPostAccountsQuery,
} = postApi;
