import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { contextApi } from './services/api';
import { Context, ContextState } from './types';

const initialState: ContextState = {
    contexts: [],
    selectedContext: null,
    loading: false,
    error: null,
};

export const contextSlice = createSlice({
    name: 'context',
    initialState,
    reducers: {
        setSelectedContext: (state, action: PayloadAction<Context | null>) => {
            state.selectedContext = action.payload;
        },
        clearSelectedContext: (state) => {
            state.selectedContext = null;
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Handle getContexts states
            .addMatcher(
                contextApi.endpoints.getContexts.matchPending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )
            .addMatcher(
                contextApi.endpoints.getContexts.matchFulfilled,
                (state, { payload }) => {
                    state.loading = false;
                    state.contexts = payload;
                }
            )
            .addMatcher(
                contextApi.endpoints.getContexts.matchRejected,
                (state, { error }) => {
                    state.loading = false;
                    state.error = error.message || 'Failed to fetch contexts';
                }
            )
            // Handle createContext states
            .addMatcher(
                contextApi.endpoints.createContext.matchPending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )
            .addMatcher(
                contextApi.endpoints.createContext.matchFulfilled,
                (state, { payload }) => {
                    state.loading = false;
                    state.contexts = [...state.contexts, payload];
                }
            )
            .addMatcher(
                contextApi.endpoints.createContext.matchRejected,
                (state, { error }) => {
                    state.loading = false;
                    state.error = error.message || 'Failed to create context';
                }
            )
            // Handle updateContext states
            .addMatcher(
                contextApi.endpoints.updateContext.matchPending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )
            .addMatcher(
                contextApi.endpoints.updateContext.matchFulfilled,
                (state, { payload }) => {
                    state.loading = false;
                    state.contexts = state.contexts.map((context) =>
                        context.id === payload.id ? payload : context
                    );
                    if (state.selectedContext?.id === payload.id) {
                        state.selectedContext = payload;
                    }
                }
            )
            .addMatcher(
                contextApi.endpoints.updateContext.matchRejected,
                (state, { error }) => {
                    state.loading = false;
                    state.error = error.message || 'Failed to update context';
                }
            )
            // Handle deleteContext states
            .addMatcher(
                contextApi.endpoints.deleteContext.matchPending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )
            .addMatcher(
                contextApi.endpoints.deleteContext.matchFulfilled,
                (state) => {
                    state.loading = false;
                    if (state.selectedContext) {
                        state.contexts = state.contexts.filter(
                            (context) => context.id !== state.selectedContext?.id
                        );
                        state.selectedContext = null;
                    }
                }
            )
            .addMatcher(
                contextApi.endpoints.deleteContext.matchRejected,
                (state, { error }) => {
                    state.loading = false;
                    state.error = error.message || 'Failed to delete context';
                }
            );
    },
});

export const {
    setSelectedContext,
    clearSelectedContext,
    setError,
    clearError,
} = contextSlice.actions;

export default contextSlice.reducer;
