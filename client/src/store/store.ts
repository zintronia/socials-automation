import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { templateApi } from '@/features/templates/services/api';
import templateReducer from '@/features/templates/templateSlice';
import { contextApi } from '@/features/context/services/api';
import contextReducer from '@/features/context/contextSlice';
import { postApi } from '@/features/posts/services/api';
import postReducer from '@/features/posts/postSlice';
import { campaignApi } from '@/features/campaign/services/api';
import campaignReducer from '@/features/campaign/campaignSlice';
import { socialApi } from '@/features/social/services/api';
import socialReducer from '@/features/social/socialSlice';
import authReducer from '@/features/auth/slice';

export const store = configureStore({
  reducer: {
    [templateApi.reducerPath]: templateApi.reducer,
    [contextApi.reducerPath]: contextApi.reducer,
    [postApi.reducerPath]: postApi.reducer,
    [campaignApi.reducerPath]: campaignApi.reducer,
    [socialApi.reducerPath]: socialApi.reducer,
    auth: authReducer,
    templates: templateReducer,
    context: contextReducer,
    posts: postReducer,
    campaign: campaignReducer,
    social: socialReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(templateApi.middleware)
      .concat(contextApi.middleware)
      .concat(postApi.middleware)
      .concat(campaignApi.middleware)
      .concat(socialApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
