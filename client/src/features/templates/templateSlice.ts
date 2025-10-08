import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { templateApi } from './services/api';
import { Template, TemplateState } from './types';

const initialState: TemplateState = {
    templates: [],
    selectedTemplate: null,
    loading: false,
    error: null,
};

export const templateSlice = createSlice({
    name: 'template',
    initialState,
    reducers: {
        setSelectedTemplate: (state, action: PayloadAction<Template | null>) => {
            state.selectedTemplate = action.payload;
        },
        clearSelectedTemplate: (state) => {
            state.selectedTemplate = null;
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
            // Handle getTemplates states
            .addMatcher(
                templateApi.endpoints.getTemplates.matchPending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )
            .addMatcher(
                templateApi.endpoints.getTemplates.matchFulfilled,
                (state, { payload }) => {
                    state.loading = false;
                    state.templates = payload;
                }
            )
            .addMatcher(
                templateApi.endpoints.getTemplates.matchRejected,
                (state, { error }) => {
                    state.loading = false;
                    state.error = error.message || 'Failed to fetch templates';
                }
            )
            // Handle createTemplate states
            .addMatcher(
                templateApi.endpoints.createTemplate.matchPending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )
            .addMatcher(
                templateApi.endpoints.createTemplate.matchFulfilled,
                (state, { payload }) => {
                    state.loading = false;
                    state.templates = [...state.templates, payload];
                }
            )
            .addMatcher(
                templateApi.endpoints.createTemplate.matchRejected,
                (state, { error }) => {
                    state.loading = false;
                    state.error = error.message || 'Failed to create template';
                }
            )
            // Handle updateTemplate states
            .addMatcher(
                templateApi.endpoints.updateTemplate.matchPending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )
            .addMatcher(
                templateApi.endpoints.updateTemplate.matchFulfilled,
                (state, { payload }) => {
                    state.loading = false;
                    state.templates = state.templates.map((template) =>
                        template.id === payload.id ? payload : template
                    );
                    if (state.selectedTemplate?.id === payload.id) {
                        state.selectedTemplate = payload;
                    }
                }
            )
            .addMatcher(
                templateApi.endpoints.updateTemplate.matchRejected,
                (state, { error }) => {
                    state.loading = false;
                    state.error = error.message || 'Failed to update template';
                }
            )
            // Handle deleteTemplate states
            .addMatcher(
                templateApi.endpoints.deleteTemplate.matchPending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )
            .addMatcher(
                templateApi.endpoints.deleteTemplate.matchFulfilled,
                (state) => {
                    state.loading = false;
                    if (state.selectedTemplate) {
                        state.templates = state.templates.filter(
                            (template) => template.id !== state.selectedTemplate?.id
                        );
                        state.selectedTemplate = null;
                    }
                }
            )
            .addMatcher(
                templateApi.endpoints.deleteTemplate.matchRejected,
                (state, { error }) => {
                    state.loading = false;
                    state.error = error.message || 'Failed to delete template';
                }
            );
    },
});

export const {
    setSelectedTemplate,
    clearSelectedTemplate,
    setError,
    clearError,
} = templateSlice.actions;

export default templateSlice.reducer;
