"use client";

import React from "react";
import type { Post } from "@/features/posts/types";
import { socialPlatformId } from "@/lib/constant";
import { LinkedInCard } from "../ui/linkedin-card";
import { TwitterCard } from "../ui/twitter-card";

export function PostCardRenderer({
  post,
  footerSlot,
}: {
  post: Post;
  footerSlot?: React.ReactNode;
}) {
  switch (post.platform_name) {
    case socialPlatformId.LINKEDIN:
      return (
        <LinkedInCard
          key={post.id}
          avatarUrl={post.social_account?.profile_image_url || ""}
          authorName={post.social_account?.account_name || ""}
          handle={post.social_account?.account_username || ""}
          headline=""
          timestamp={post.created_at || ""}
          content={post.content}
          mediaUrl=""
          engagement={{ likes: 120, comments: 14, shares: 6 }}
          footerSlot={footerSlot}
        />
      );
    case socialPlatformId.TWITTER:
      return (
        <TwitterCard
          key={post.id}
          avatarUrl={post.social_account?.profile_image_url || ""}
          authorName={post.social_account?.account_name || ""}
          handle={post.social_account?.account_username || ""}
          timestamp={post?.created_at || ""}
          content={post?.content || ""}
          mediaUrl=""
          engagement={{ likes: 12, replies: 3, retweets: 2, isLiked: false, isBookmarked: false, isRetweeted: false }}
          footerSlot={footerSlot}
        />
      );
    default:
      return null;
  }
}
