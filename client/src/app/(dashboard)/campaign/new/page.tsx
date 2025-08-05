'use client';

import { AI_Prompt } from '@/components/animated-ai-input';
import { CardsCarouselDemo } from '@/components/cards-carousel';
import { useCreateContextMutation } from '@/features/context';
import { useGeneratePostMutation } from '@/features/posts';
import { toast } from 'sonner';
import { useState } from 'react';
import { Post } from '@/features/posts/types';
import { useCreateCampaignMutation } from '@/features/campaign';

const GeneratePage = () => {
    const [posts, setPost] = useState<Post[]>([])
    const [createCampaign] = useCreateCampaignMutation();
    const [generatePost, { isLoading }] = useGeneratePostMutation();

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

        try {
            // Generate a default campaign title with timestamp
            const campaignNumber = Date.now().toString().slice(-4);
            const defaultTitle = `Campaign ${campaignNumber}`;

            // First create campaign
            const campaign = await createCampaign({
                title: defaultTitle,
            }).unwrap();

            // Then generate the post from the selected context
            const post = await generatePost({
                context_id: data.context_id,
                platform_id: data.platform_id,
                campaign_id: campaign.id,
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