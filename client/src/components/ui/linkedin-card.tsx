"use client";

import { cn } from "@/lib/utils";
import { Bookmark, MessageCircle, MoreHorizontal, Share2, ThumbsUp } from "lucide-react";
import { useState, type ReactNode } from "react";

export interface LinkedInCardProps {
  avatarUrl: string;
  authorName: string;
  handle?: string;
  headline?: string;
  timestamp?: string;
  content?: string;
  mediaUrl?: string; // optional image or preview
  engagement?: {
    likes?: number;
    comments?: number;
    shares?: number;
    isLiked?: boolean;
    isBookmarked?: boolean;
  };
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  onMore?: () => void;
  size?: "default" | "compact";
  className?: string;
  footerSlot?: ReactNode;
}

export function LinkedInCard({
  avatarUrl,
  authorName,
  handle,
  headline,
  timestamp,
  content,
  mediaUrl,
  engagement,
  onLike,
  onComment,
  onShare,
  onBookmark,
  onMore,
  size = "default",
  className,
  footerSlot,
}: LinkedInCardProps) {
  const [isLiked, setIsLiked] = useState(engagement?.isLiked ?? false);
  const [isBookmarked, setIsBookmarked] = useState(engagement?.isBookmarked ?? false);
  const [likes, setLikes] = useState(engagement?.likes ?? 0);
  const [expanded, setExpanded] = useState(false);

  const maxChars = 300;
  const isLong = (content?.length ?? 0) > maxChars;
  const display = !isLong || expanded ? content : content!.slice(0, maxChars).trimEnd() + "...";

  const isCompact = size === "compact";

  const handleLike = () => {
    setIsLiked((prev) => !prev);
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
    onLike?.();
  };

  const handleBookmark = () => {
    setIsBookmarked((prev) => !prev);
    onBookmark?.();
  };

  return (
    <div
      className={cn(
        "w-full mx-auto max-h-fit",
        isCompact ? "max-w-sm" : "max-w-2xl",
        "bg-white dark:bg-zinc-900",
        "border border-zinc-200 dark:border-zinc-800",
        "rounded-xl shadow-sm",
        className
      )}
    >
      {/* Header */}
      <div className={cn("flex items-start gap-3", isCompact ? "p-3" : "p-4")}>
        <img
          src={avatarUrl}
          alt={authorName}
          className={cn("rounded-full ring-2 ring-white dark:ring-zinc-800", isCompact ? "w-8 h-8" : "w-11 h-11")}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className={cn("font-semibold text-zinc-900 dark:text-zinc-100", isCompact ? "text-xs" : "text-sm")}>
                  {authorName}
                </h3>
                {handle && (
                  <span className={cn("text-zinc-500", isCompact ? "text-[10px]" : "text-xs")}>{handle}</span>
                )}
                <span className={cn("ml-2 inline-flex items-center rounded-full bg-[#0A66C2]/10 text-[#0A66C2] font-medium", isCompact ? "px-1.5 py-[1px] text-[9px]" : "px-2 py-0.5 text-[10px]")}>
                  LinkedIn
                </span>
              </div>
              {headline && (
                <p className={cn("text-zinc-500 dark:text-zinc-400", isCompact ? "text-[10px]" : "text-xs")}>{headline}</p>
              )}
              {timestamp && (
                <p className={cn("text-zinc-400 mt-0.5", isCompact ? "text-[10px]" : "text-[11px]")}>{timestamp}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onMore}
              className={cn("hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full", isCompact ? "p-1.5" : "p-2")}
            >
              <MoreHorizontal className={cn("text-zinc-400", isCompact ? "w-4 h-4" : "w-5 h-5")} />
            </button>
          </div>

          {content && (
            <div className="mt-3">
              <p className={cn("text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap", isCompact ? "text-[12px]" : "text-sm")}>{display}</p>
              {isLong && (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className={cn("mt-1 text-[#0A66C2] hover:underline", isCompact ? "text-[11px]" : "text-xs")}
                >
                  {expanded ? "Show less" : "Show more"}
                </button>
              )}
            </div>
          )}

          {mediaUrl && (
            <div className="mt-3 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
              <img src={mediaUrl} alt="media" className={cn("w-full object-cover", isCompact ? "max-h-[260px]" : "max-h-[420px]")} />
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className={cn(isCompact ? "px-3 pb-2" : "px-4 pb-3")}>
        <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className={cn("grid grid-cols-4", isCompact ? "px-2 pb-2" : "px-2 pb-2")}> 
        <button
          type="button"
          onClick={handleLike}
          className={cn(
            "flex items-center justify-center gap-2 rounded-md",
            isCompact ? "py-1.5 text-[12px]" : "py-2 text-sm",
            isLiked
              ? "text-[#0A66C2] bg-[#0A66C2]/10"
              : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          )}
        >
          <ThumbsUp className={cn(isCompact ? "w-3.5 h-3.5" : "w-4 h-4")} />
          <span>{likes}</span>
        </button>
        <button
          type="button"
          onClick={onComment}
          className={cn("flex items-center justify-center gap-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md", isCompact ? "py-1.5 text-[12px]" : "py-2 text-sm")}
        >
          <MessageCircle className={cn(isCompact ? "w-3.5 h-3.5" : "w-4 h-4")} />
          <span>{engagement?.comments ?? 0}</span>
        </button>
        <button
          type="button"
          onClick={onShare}
          className={cn("flex items-center justify-center gap-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md", isCompact ? "py-1.5 text-[12px]" : "py-2 text-sm")}
        >
          <Share2 className={cn(isCompact ? "w-3.5 h-3.5" : "w-4 h-4")} />
          <span>{engagement?.shares ?? 0}</span>
        </button>
        <button
          type="button"
          onClick={handleBookmark}
          className={cn(
            "flex items-center justify-center gap-2 rounded-md",
            isCompact ? "py-1.5 text-[12px]" : "py-2 text-sm",
            isBookmarked
              ? "text-[#0A66C2] bg-[#0A66C2]/10"
              : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          )}
        >
          <Bookmark className={cn(isCompact ? "w-3.5 h-3.5" : "w-4 h-4")} />
        </button>
      </div>
      {footerSlot && (
        <div className={cn(isCompact ? "px-3 pb-3" : "px-4 pb-4")}> 
          <div className="h-px bg-zinc-200 dark:bg-zinc-800 mb-2" />
          {footerSlot}
        </div>
      )}
    </div>
  );
}
