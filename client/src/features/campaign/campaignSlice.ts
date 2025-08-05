import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { campaignApi } from './services/campaignApi';
import { Campaign, CampaignState } from './types';

const initialState: CampaignState = {
    campaigns: [],
    selectedCampaign: null,
    loading: false,
    error: null,
};

export const campaignSlice = createSlice({
    name: 'campaign',
    initialState,
    reducers: {
        setSelectedCampaign: (state, action: PayloadAction<Campaign | null>) => {
            state.selectedCampaign = action.payload;
        },
        clearSelectedCampaign: (state) => {
            state.selectedCampaign = null;
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
            // Handle getCampaigns states
            .addMatcher(
                campaignApi.endpoints.getCampaigns.matchPending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )
            .addMatcher(
                campaignApi.endpoints.getCampaigns.matchFulfilled,
                (state, { payload }) => {
                    state.loading = false;
                    state.campaigns = payload;
                }
            )
            .addMatcher(
                campaignApi.endpoints.getCampaigns.matchRejected,
                (state, { error }) => {
                    state.loading = false;
                    state.error = error.message || 'Failed to fetch campaigns';
                }
            )
            // Handle createCampaign states
            .addMatcher(
                campaignApi.endpoints.createCampaign.matchPending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )
            .addMatcher(
                campaignApi.endpoints.createCampaign.matchFulfilled,
                (state, { payload }) => {
                    state.loading = false;
                    state.campaigns = [...state.campaigns, payload];
                }
            )
            .addMatcher(
                campaignApi.endpoints.createCampaign.matchRejected,
                (state, { error }) => {
                    state.loading = false;
                    state.error = error.message || 'Failed to create campaign';
                }
            )
            // Handle updateCampaign states
            .addMatcher(
                campaignApi.endpoints.updateCampaign.matchPending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )
            .addMatcher(
                campaignApi.endpoints.updateCampaign.matchFulfilled,
                (state, { payload }) => {
                    state.loading = false;
                    state.campaigns = state.campaigns.map((campaign) =>
                        campaign.id === payload.id ? payload : campaign
                    );
                    if (state.selectedCampaign?.id === payload.id) {
                        state.selectedCampaign = payload;
                    }
                }
            )
            .addMatcher(
                campaignApi.endpoints.updateCampaign.matchRejected,
                (state, { error }) => {
                    state.loading = false;
                    state.error = error.message || 'Failed to update campaign';
                }
            )
            // Handle deleteCampaign states
            .addMatcher(
                campaignApi.endpoints.deleteCampaign.matchPending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )
            .addMatcher(
                campaignApi.endpoints.deleteCampaign.matchFulfilled,
                (state) => {
                    state.loading = false;
                    if (state.selectedCampaign) {
                        state.campaigns = state.campaigns.filter(
                            (campaign) => campaign.id !== state.selectedCampaign?.id
                        );
                        state.selectedCampaign = null;
                    }
                }
            )
            .addMatcher(
                campaignApi.endpoints.deleteCampaign.matchRejected,
                (state, { error }) => {
                    state.loading = false;
                    state.error = error.message || 'Failed to delete campaign';
                }
            );
    },
});

export const {
    setSelectedCampaign,
    clearSelectedCampaign,
    setError,
    clearError,
} = campaignSlice.actions;

export default campaignSlice.reducer;
