import { createSlice, PayloadAction } from '@reduxjs/toolkit';
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
    }
});

export const {
    setSelectedCampaign,
    clearSelectedCampaign,
    setError,
    clearError,
} = campaignSlice.actions;

export default campaignSlice.reducer;
