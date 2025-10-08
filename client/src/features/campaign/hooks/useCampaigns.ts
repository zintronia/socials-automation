import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  useGetCampaignsQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
} from '../services/api';
import { CampaignFilters, CreateCampaignRequest, UpdateCampaignRequest } from '../types';

export const useCampaigns = () => {
  const [filters, setFilters] = useState<CampaignFilters>({
    page: 1,
    limit: 20,
    sortBy: 'created_at',
    sortOrder: 'DESC',
  });

  // API hooks
  const { data: campaigns = [], isLoading, error, refetch } = useGetCampaignsQuery(filters);
  const [createCampaign] = useCreateCampaignMutation();
  const [updateCampaign] = useUpdateCampaignMutation();
  const [deleteCampaign] = useDeleteCampaignMutation();

  // Redux state
  const { selectedCampaign, loading: stateLoading } = useSelector(
    (state: RootState) => state.campaign
  );

  // Filter campaigns based on search
  const filteredCampaigns = useMemo(() => {
    if (!filters.search) return campaigns;

    const searchTerm = filters.search.toLowerCase();
    return campaigns.filter(
      (campaign) =>
        campaign.title.toLowerCase().includes(searchTerm) ||
        campaign.description?.toLowerCase().includes(searchTerm)
    );
  }, [campaigns, filters.search]);

  // Create a new campaign
  const createNewCampaign = useCallback(async (campaignData: CreateCampaignRequest) => {
    try {
      await createCampaign(campaignData).unwrap();
      return { success: true };
    } catch (error) {
      console.error('Error creating campaign:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create campaign'
      };
    }
  }, [createCampaign]);

  // Update an existing campaign
  const updateExistingCampaign = useCallback(async (campaignData: UpdateCampaignRequest) => {
    try {
      await updateCampaign(campaignData).unwrap();
      return { success: true };
    } catch (error) {
      console.error('Error updating campaign:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update campaign'
      };
    }
  }, [updateCampaign]);

  // Delete a campaign
  const deleteExistingCampaign = useCallback(async (id: number) => {
    try {
      await deleteCampaign(id).unwrap();
      return { success: true };
    } catch (error) {
      console.error('Error deleting campaign:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete campaign'
      };
    }
  }, [deleteCampaign]);

  return {
    // State
    campaigns: filteredCampaigns,
    selectedCampaign,
    isLoading: isLoading || stateLoading,
    error,
    filters,

    // Actions
    setFilters,
    createCampaign: createNewCampaign,
    updateCampaign: updateExistingCampaign,
    deleteCampaign: deleteExistingCampaign,
    refreshCampaigns: refetch,
  };
};

export default useCampaigns;
