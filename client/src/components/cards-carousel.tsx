"use client";

import React, { useState } from "react";
import { Carousel, Card } from "./apple-cards-carousel";
import { SocialCard } from "./ui/social-card";
import { LinkIcon } from "lucide-react";
import { Post } from "@/features/posts/types";

export function CardsCarouselDemo({ posts }: { posts: Post[] }) {




    const SocialCardDemo = posts.map(card => (
        <SocialCard
            key={card.id}
            {...card}
            onLike={() => handleAction(card.id, 'liked')}
            onComment={() => handleAction(card.id, 'commented')}
            onShare={() => handleAction(card.id, 'shared')}
            onBookmark={() => handleAction(card.id, 'bookmarked')}
            onMore={() => handleAction(card.id, 'more')}
        />
    ))
    const handleAction = (id: number, action: string) => {
        console.log(`Card ${id}: ${action}`);
    };

    return (
        <div className="w-full">
            <Carousel items={SocialCardDemo} />
        </div>
    );
}
