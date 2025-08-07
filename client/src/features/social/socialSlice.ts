import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { socialApi } from './services/socialApi';
import { SocialAccount, Platform, SocialState } from './types';

const initialState: SocialState = {
    accounts: [],
    platforms: [],
    selectedAccount: null,
    loading: false,
    error: null,
};

export const socialSlice = createSlice({
    name: 'social',
    initialState,
    reducers: {
        setSelectedAccount: (state, action: PayloadAction<SocialAccount | null>) => {
            state.selectedAccount = action.payload;
        },
        clearSelectedAccount: (state) => {
            state.selectedAccount = null;
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        setPlatforms: (state, action: PayloadAction<Platform[]>) => {
            state.platforms = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Handle getSocialAccounts states
            .addMatcher(
                socialApi.endpoints.getSocialAccounts.matchPending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )
            .addMatcher(
                socialApi.endpoints.getSocialAccounts.matchFulfilled,
                (state, { payload }) => {
                    state.loading = false;
                    state.accounts = payload;
                }
            )
            .addMatcher(
                socialApi.endpoints.getSocialAccounts.matchRejected,
                (state, { error }) => {
                    state.loading = false;
                    state.error = error.message || 'Failed to fetch social accounts';
                }
            )
            // Handle connectAccount states
            .addMatcher(
                socialApi.endpoints.connectAccount.matchPending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )
            .addMatcher(
                socialApi.endpoints.connectAccount.matchFulfilled,
                (state, { payload }) => {
                    state.loading = false;
                    state.accounts = [...state.accounts, payload];
                }
            )
            .addMatcher(
                socialApi.endpoints.connectAccount.matchRejected,
                (state, { error }) => {
                    state.loading = false;
                    state.error = error.message || 'Failed to connect account';
                }
            )
            // Handle disconnectAccount states
            .addMatcher(
                socialApi.endpoints.disconnectAccount.matchPending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )
            .addMatcher(
                socialApi.endpoints.disconnectAccount.matchFulfilled,
                (state, { meta }) => {
                    state.loading = false;
                    const accountId = meta.arg.originalArgs;
                    state.accounts = state.accounts.filter(account => account.id !== accountId);
                    if (state.selectedAccount?.id === accountId) {
                        state.selectedAccount = null;
                    }
                }
            )
            .addMatcher(
                socialApi.endpoints.disconnectAccount.matchRejected,
                (state, { error }) => {
                    state.loading = false;
                    state.error = error.message || 'Failed to disconnect account';
                }
            )
            // Handle getPlatforms states
            .addMatcher(
                socialApi.endpoints.getPlatforms.matchPending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )
            .addMatcher(
                socialApi.endpoints.getPlatforms.matchFulfilled,
                (state, { payload }) => {
                    state.loading = false;
                    state.platforms = payload;
                }
            )
            .addMatcher(
                socialApi.endpoints.getPlatforms.matchRejected,
                (state, { error }) => {
                    state.loading = false;
                    state.error = error.message || 'Failed to fetch platforms';
                }
            )
            // Handle Twitter OAuth states
            .addMatcher(
                socialApi.endpoints.initiateTwitterOAuth.matchPending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )
            .addMatcher(
                socialApi.endpoints.initiateTwitterOAuth.matchFulfilled,
                (state) => {
                    state.loading = false;
                }
            )
            .addMatcher(
                socialApi.endpoints.initiateTwitterOAuth.matchRejected,
                (state, { error }) => {
                    state.loading = false;
                    state.error = error.message || 'Failed to initiate Twitter OAuth';
                }
            )
            // Handle Twitter callback states
            .addMatcher(
                socialApi.endpoints.handleTwitterCallback.matchPending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )
            .addMatcher(
                socialApi.endpoints.handleTwitterCallback.matchFulfilled,
                (state, { payload }) => {
                    state.loading = false;
                    state.accounts = [...state.accounts, payload.account];
                }
            )
            .addMatcher(
                socialApi.endpoints.handleTwitterCallback.matchRejected,
                (state, { error }) => {
                    state.loading = false;
                    state.error = error.message || 'Failed to complete Twitter authentication';
                }
            );
    },
});

export const {
    setSelectedAccount,
    clearSelectedAccount,
    setError,
    clearError,
    setPlatforms,
} = socialSlice.actions;

export default socialSlice.reducer; 