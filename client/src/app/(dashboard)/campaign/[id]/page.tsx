'use client';

import { PostGenerator } from '@/components/postgenerator/postgenerator';
import { useParams } from 'next/navigation';
import { useGetCampaignByIdQuery } from '@/features/campaign';

const ExistingCampaignPage = () => {
    const params = useParams();
    const campaignId = parseInt(params.id as string);
    const { data: getCampaign, isLoading: postLoading } = useGetCampaignByIdQuery(campaignId);

    return (
        <PostGenerator
            campaignId={campaignId}
            initialPosts={getCampaign?.posts || []}
            postLoading={postLoading}
            onPostsGenerated={(posts) => {
                console.log('Posts updated:', posts);
            }}
        />
    );
};

export default ExistingCampaignPage;