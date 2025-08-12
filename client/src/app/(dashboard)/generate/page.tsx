'use client';

import { AI_Prompt } from '@/components/ai-input/animated-ai-input';
import { PostCards } from '@/components/post-cards/post-cards';
import { useCreateContextMutation } from '@/features/context';
import { useGeneratePostMutation } from '@/features/posts';
import { toast } from 'sonner';
import { useState } from 'react';
import { Post } from '@/features/posts/types';

const GeneratePage = () => {
    const [posts, setPost] = useState<Post[]>([])
    const [createContext] = useCreateContextMutation();
    const [generatePost, { isLoading }] = useGeneratePostMutation();

    const handleGenerate = async (data: {
        content: string;
        platform_id: number | null;
        model: string;
        type: string;
    }) => {
        if (!data.platform_id) {
            toast.error('Please select a platform');
            return;
        }

        try {
            // First create the context
            const context = await createContext({
                title: `Generated Content - ${new Date().toLocaleString()}`,
                content: data.content,
                type: 'text',
                platform_id: data.platform_id,
            }).unwrap();

            // Then generate the post from the context
            const post = await generatePost({
                context_id: 10,
                platform_id: data.platform_id,
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
            <PostCards posts={posts} />
            <AI_Prompt
                handleGenerate={handleGenerate}
                isSubmitting={isLoading}
            />
        </div>
    );
};

export default GeneratePage;