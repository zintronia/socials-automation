'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Search, Edit, Trash2, Calendar, FileText } from 'lucide-react';
import { useGetCampaignsQuery, useDeleteCampaignMutation } from '../services/campaignApi';
import { toast } from 'sonner';
import { Campaign } from '../types';
import ComponentCard from '@/components/ComponentCard';

interface CampaignsProps {
    onSelectCampaign?: (campaign: Campaign) => void;
    selectedCampaignId?: number | null;
    showActions?: boolean;
}

const Campaigns: React.FC<CampaignsProps> = ({
    onSelectCampaign,
    selectedCampaignId,
    showActions = true
}) => {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);

    // RTK Query hooks
    const { data: campaigns = [], isLoading, error, refetch } = useGetCampaignsQuery({
        search: searchTerm || undefined,
        limit: 50,
        sortBy: 'created_at',
        sortOrder: 'DESC'
    });
    const [deleteCampaign, { isLoading: isDeleting }] = useDeleteCampaignMutation();

    // Handle campaign deletion
    const handleDeleteClick = (campaign: Campaign, e: React.MouseEvent) => {
        e.stopPropagation();
        setCampaignToDelete(campaign);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!campaignToDelete) return;

        try {
            await deleteCampaign(campaignToDelete.id).unwrap();
            toast.success('Campaign deleted successfully');
            setDeleteDialogOpen(false);
            setCampaignToDelete(null);
            refetch();
        } catch (error) {
            console.error('Error deleting campaign:', error);
            toast.error('Failed to delete campaign');
        }
    };

    // Handle campaign navigation
    const handleCampaignClick = (campaign: Campaign) => {
        if (onSelectCampaign) {
            onSelectCampaign(campaign);
        } else {
            router.push(`/campaign/${campaign.id}`);
        }
    };

    const handleCreateCampaign = () => {
        router.push('/campaign/new');
    };

    // Format date helper
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading campaigns...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <p className="text-red-500 mb-4">Failed to load campaigns</p>
                    <Button onClick={() => refetch()} variant="outline">
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <ComponentCard title='Campaigns' desc='Manage your campaigns effectively' actionButton={
            <Button onClick={handleCreateCampaign} className="mb-4" >
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
            </Button>
        }>
            {/* Search */}
            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search campaigns..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Campaigns Grid */}
            {campaigns.length === 0 ? (
                <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
                    <p className="text-muted-foreground mb-4">
                        {searchTerm ? 'No campaigns match your search criteria.' : 'Get started by creating your first campaign.'}
                    </p>
                    {!searchTerm && (
                        <Button onClick={handleCreateCampaign}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Your First Campaign
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {campaigns.map((campaign) => (
                        <Card
                            key={campaign.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${selectedCampaignId === campaign.id ? 'ring-2 ring-primary' : ''
                                }`}
                            onClick={() => handleCampaignClick(campaign)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-lg truncate">{campaign.title}</CardTitle>
                                        {campaign.description && (
                                            <CardDescription className="mt-1 line-clamp-2">
                                                {campaign.description}
                                            </CardDescription>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <div className="space-y-3">
                                    {/* Campaign Stats */}
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <div className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-1" />
                                            <span>Created {formatDate(campaign.created_at)}</span>
                                        </div>
                                    </div>

                                    {/* Last Updated */}
                                    {campaign.updated_at !== campaign.created_at && (
                                        <div className="text-xs text-muted-foreground">
                                            Updated {formatDate(campaign.updated_at)}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    {showActions && (
                                        <div className="flex justify-end space-x-2 pt-2 border-t">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/campaign/${campaign.id}/edit`);
                                                }}
                                            >
                                                <Edit className="h-4 w-4 mr-1" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={(e) => handleDeleteClick(campaign, e)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-1" />
                                                Delete
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{campaignToDelete?.title}"? This action cannot be undone.
                            All posts associated with this campaign will also be affected.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Campaign'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </ComponentCard>
    );
};

export default Campaigns;
