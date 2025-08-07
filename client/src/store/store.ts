import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from '@/features/auth/authSlice';
import { authApi } from '@/features/auth/services/authApi';
import { templateApi } from '@/features/templates/services/templateApi';
import templateReducer from '@/features/templates/templateSlice';
import { contextApi } from '@/features/context/services/contextApi';
import contextReducer from '@/features/context/contextSlice';
import { postApi } from '@/features/posts/services/postApi';
import postReducer from '@/features/posts/postSlice';
import { campaignApi } from '@/features/campaign/services/campaignApi';
import campaignReducer from '@/features/campaign/campaignSlice';
import { socialApi } from '@/features/social/services/socialApi';
import socialReducer from '@/features/social/socialSlice';
import { persistenceMiddlewareEnhancer } from '@/features/auth/middleware/authPersistenceMiddleware';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
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
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    })
      .concat(
        persistenceMiddlewareEnhancer,
        authApi.middleware,
        templateApi.middleware,
        contextApi.middleware,
        postApi.middleware,
        campaignApi.middleware,
        socialApi.middleware,
      ),
  devTools: process.env.NODE_ENV !== 'production',
});

// Enable refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
