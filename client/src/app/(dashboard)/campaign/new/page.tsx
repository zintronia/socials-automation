'use client';

import { AI_Prompt } from '@/components/ai-input/animated-ai-input';
import { PostCards } from '@/components/post-cards/post-cards';
import { useGeneratePostMutation } from '@/features/posts';
import { toast } from 'sonner';
import { useState } from 'react';
import { GeneratePayload, Post } from '@/features/posts/types';
import { useCreateCampaignMutation } from '@/features/campaign';

const GeneratePage = () => {
    const [posts, setPost] = useState<Post[]>([])
    const [generatePost, { isLoading }] = useGeneratePostMutation();
    const [createCampaign] = useCreateCampaignMutation();


    const handleGenerate = async (data: GeneratePayload) => {
        console.log('data', data);

        if (!data.platforms || data.platforms.length === 0) {
            toast.error('Please select a platform');
            return;
        }
        if (!data.prompt.trim()) {
            toast.error('Please enter a prompt');
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

            if (!campaign) {
                toast.error('Failed to create campaign');
                return;
            }

            const post = await generatePost({
                context_id: data.context_id,
                platforms: data.platforms,
                campaign_id: campaign.id,
                prompt: data.prompt,
            }).unwrap();

            if (post?.length === 0) {
                toast.error('No posts generated. Please try again.');
                return;
            }
            setPost([...posts, ...post]);

        } catch (error) {
            console.error('Error in post generation:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to generate post';
            toast.error(errorMessage);
        }
    };

    return (
        <div className='w-full flex flex-col items-center justify-between'>
            <div className="w-full h-[70vh] flex items-center justify-center overflow-y-scroll">
                <PostCards posts={posts} />
            </div>
            <AI_Prompt
                handleGenerate={handleGenerate}
                isSubmitting={isLoading}
            />
        </div>
    );
};

export default GeneratePage;