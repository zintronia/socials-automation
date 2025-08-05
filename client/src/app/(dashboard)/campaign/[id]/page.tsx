'use client';

import { AI_Prompt } from '@/components/animated-ai-input';
import { CardsCarouselDemo } from '@/components/cards-carousel';
import { useCreateContextMutation } from '@/features/context';
import { useGeneratePostMutation } from '@/features/posts';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Post } from '@/features/posts/types';
import { useParams } from 'next/navigation';
import { useGetCampaignByIdQuery } from '@/features/campaign';

const GeneratePage = () => {
    const params = useParams();
    const campaignId = parseInt(params.id as string);
    const [posts, setPost] = useState<Post[]>([])
    const [createContext] = useCreateContextMutation();
    const [generatePost, { isLoading }] = useGeneratePostMutation();
    const { data: getCampaign } = useGetCampaignByIdQuery(campaignId);

    console.log(getCampaign);


    useEffect(() => {
        if (getCampaign) {
            setPost([...posts, ...getCampaign.posts]);
        }
    }, [getCampaign]);
    const handleGenerate = async (data: {
        content: string;
        platform_id: number | null;
        model: string;
        type: string;
        template_id?: number | null;
        context_id?: number | null;
    }) => {
        if (!data.platform_id) {
            toast.error('Please select a platform');
            return;
        }

        if (!data.context_id) {
            toast.error('Please select a context');
            return;
        }

        if (!campaignId) {
            toast.error('Please select a campaign');
            return;
        }

        try {
            // Then generate the post from the selected context
            const post = await generatePost({
                context_id: data.context_id,
                platform_id: data.platform_id,
                campaign_id: campaignId,
            }).unwrap();

            toast.success('Post generated successfully!');
            setPost([...posts, post]);
        } catch (error) {
            console.error('Error in post generation:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to generate post';
            toast.error(errorMessage);
            throw error; // Re-throw to allow error handling in the AI_Prompt component
        }
    };

    return (
        <div className='h-[calc(100vh-4rem)] w-full flex flex-col items-center justify-between'>
            <CardsCarouselDemo posts={posts} />
            <AI_Prompt
                handleGenerate={handleGenerate}
                isSubmitting={isLoading}
            />
        </div>
    );
};

export default GeneratePage;