'use client';

import { AI_Prompt } from '@/components/ai-input/animated-ai-input';
import { PostCards } from '@/components/post-cards/post-cards';
import { useCreateContextMutation } from '@/features/context';
import { useGeneratePostMutation } from '@/features/posts';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { GeneratePayload, Post } from '@/features/posts/types';
import { useParams } from 'next/navigation';
import { useGetCampaignByIdQuery } from '@/features/campaign';

const GeneratePage = () => {
    const params = useParams();
    const campaignId = parseInt(params.id as string);
    const [posts, setPost] = useState<Post[]>([])
    const [createContext] = useCreateContextMutation();
    const [generatePost, { isLoading }] = useGeneratePostMutation();
    const { data: getCampaign } = useGetCampaignByIdQuery(campaignId);

    useEffect(() => {
        if (getCampaign) {
            console.log('getCampaign', getCampaign);

            setPost([...posts, ...getCampaign.posts]);
        }
    }, [getCampaign]);

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

        if (!campaignId) {
            toast.error('Please select a campaign');
            return;
        }

        try {
            const post = await generatePost({
                context_id: data.context_id,
                platforms: data.platforms,
                campaign_id: campaignId,
                prompt: data.prompt,
            }).unwrap();

            if (post?.length === 0) {
                toast.error('No posts generated. Please try again.');
                return;
            }
            console.log('post------', post);

            setPost([...post, ...posts]);

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