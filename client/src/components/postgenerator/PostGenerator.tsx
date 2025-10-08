'use client';

import { AI_Prompt } from '@/components/ai-input/animated-ai-input';
import { PostCards } from '@/components/post-cards/post-cards';
import { useGeneratePostMutation } from '@/features/posts';
import { useCreateCampaignMutation } from '@/features/campaign';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { GeneratePayload, Post } from '@/features/posts/types';

interface PostGeneratorProps {
    campaignId?: number;
    initialPosts?: Post[];
    postLoading?: boolean;
    onPostsGenerated?: (posts: Post[]) => void;
}

export const PostGenerator = ({
    campaignId,
    initialPosts = [],
    postLoading = false,
    onPostsGenerated
}: PostGeneratorProps) => {
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [generatePost, { isLoading }] = useGeneratePostMutation();
    const [createCampaign] = useCreateCampaignMutation();

    useEffect(() => {
        if (initialPosts.length > 0) {
            setPosts(initialPosts);
        }
    }, [initialPosts]);

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
            let targetCampaignId = campaignId;

            // If no campaignId provided, create a new campaign (new campaign flow)
            if (!targetCampaignId) {
                const campaignNumber = Date.now().toString().slice(-4);
                const defaultTitle = `Campaign ${campaignNumber}`;

                const campaign = await createCampaign({
                    title: defaultTitle,
                }).unwrap();

                if (!campaign) {
                    toast.error('Failed to create campaign');
                    return;
                }

                targetCampaignId = campaign.id;
            }

            const newPosts = await generatePost({
                context_id: data.context_id,
                platforms: data.platforms,
                campaign_id: targetCampaignId,
                prompt: data.prompt,
            }).unwrap();

            if (newPosts?.length === 0) {
                toast.error('No posts generated. Please try again.');
                return;
            }

            // Update posts state - new posts first for existing campaigns, append for new campaigns
            const updatedPosts = campaignId
                ? [...newPosts, ...posts]  // Existing campaign: new posts first
                : [...posts, ...newPosts]; // New campaign: append new posts

            setPosts(updatedPosts);

            // Call callback if provided
            if (onPostsGenerated) {
                onPostsGenerated(updatedPosts);
            }

        } catch (error) {
            console.error('Error in post generation:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to generate post';
            toast.error(errorMessage);
        }
    };

    return (
        <div className='w-full flex flex-col items-center justify-between'>
            <div className="w-full h-[70vh] flex items-center justify-center overflow-y-scroll">
                <PostCards posts={posts} postLoading={postLoading} />
            </div>
            <AI_Prompt
                handleGenerate={handleGenerate}
                isSubmitting={isLoading}
            />
        </div>
    );
};