import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Post, PostState } from './types';

const initialState: PostState = {
  selectedPost: null,
  isLoading: false,
  error: null,
};

const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    setSelectedPost: (state, action: PayloadAction<Post | null>) => {
      state.selectedPost = action.payload;
    },
    clearSelectedPost: (state) => {
      state.selectedPost = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  // Handle RTK Query actions
  extraReducers: (builder) => {
    // Add matchers for RTK Query pending/fulfilled/rejected actions
    builder
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled'),
        (state) => {
          state.isLoading = false;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action: { error: { message?: string } }) => {
          state.isLoading = false;
          state.error = action.error?.message || 'An error occurred';
        }
      );
  },
});

export const {
  setSelectedPost,
  clearSelectedPost,
  setLoading,
  setError,
  clearError,
} = postSlice.actions;

export default postSlice.reducer;
