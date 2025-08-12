"use client";

import { cn } from "@/lib/utils";
import { Bookmark, MessageCircle, MoreHorizontal, Repeat, Heart } from "lucide-react";
import { useState, type ReactNode } from "react";

export interface TwitterCardProps {
  avatarUrl: string;
  authorName: string;
  handle?: string;
  timestamp?: string;
  content?: string;
  mediaUrl?: string; // optional image or preview
  engagement?: {
    likes?: number;
    replies?: number;
    retweets?: number;
    isLiked?: boolean;
    isBookmarked?: boolean;
    isRetweeted?: boolean;
  };
  onLike?: () => void;
  onReply?: () => void;
  onRetweet?: () => void;
  onBookmark?: () => void;
  onMore?: () => void;
  size?: "default" | "compact";
  className?: string;
  footerSlot?: ReactNode;
}

export function TwitterCard({
  avatarUrl,
  authorName,
  handle,
  timestamp,
  content,
  mediaUrl,
  engagement,
  onLike,
  onReply,
  onRetweet,
  onBookmark,
  onMore,
  size = "default",
  className,
  footerSlot,
}: TwitterCardProps) {
  const isCompact = size === "compact";

  const [liked, setLiked] = useState(engagement?.isLiked ?? false);
  const [bookmarked, setBookmarked] = useState(engagement?.isBookmarked ?? false);
  const [retweeted, setRetweeted] = useState(engagement?.isRetweeted ?? false);
  const [likes, setLikes] = useState(engagement?.likes ?? 0);
  const [retweets, setRetweets] = useState(engagement?.retweets ?? 0);
  const [expanded, setExpanded] = useState(false);

  const maxChars = 180;
  const isLong = (content?.length ?? 0) > maxChars;
  const display = !isLong || expanded ? content : content!.slice(0, maxChars).trimEnd() + "...";

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikes((prev) => (liked ? Math.max(0, prev - 1) : prev + 1));
    onLike?.();
  };

  const handleRetweet = () => {
    setRetweeted((prev) => !prev);
    setRetweets((prev) => (retweeted ? Math.max(0, prev - 1) : prev + 1));
    onRetweet?.();
  };

  const handleBookmark = () => {
    setBookmarked((prev) => !prev);
    onBookmark?.();
  };

  return (
    <div
      className={cn(
        "w-full mx-auto max-h-fit",
        isCompact ? "max-w-[17rem]" : "max-w-2xl",
        "bg-white dark:bg-zinc-900",
        "border border-zinc-200 dark:border-zinc-800",
        "rounded-xl shadow-sm",
        className
      )}
    >
      {/* Header */}
      <div className={cn("flex items-start justify-between", isCompact ? "p-3" : "p-4")}>
        <div className="flex items-start gap-3 min-w-0">
          <img
            src={avatarUrl}
            alt={authorName}
            className={cn("rounded-full", isCompact ? "w-7 h-7" : "w-10 h-10")}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn("font-semibold text-zinc-900 dark:text-zinc-100", isCompact ? "text-[12px]" : "text-sm")}>{authorName}</span>
              {handle && (
                <span className={cn("text-zinc-500", isCompact ? "text-[10px]" : "text-xs")}>{handle}</span>
              )}
              <span className={cn(
                "ml-2 inline-flex items-center rounded-full bg-[#1D9BF0]/10 text-[#1D9BF0] font-medium",
                isCompact ? "px-1.5 py-[1px] text-[9px]" : "px-2 py-0.5 text-[10px]"
              )}>
                Twitter
              </span>
              {timestamp && (
                <span className={cn("text-zinc-400", isCompact ? "text-[10px]" : "text-[11px]")}>• {timestamp}</span>
              )}
            </div>
            {content && (
              <div className="mt-2">
                <p className={cn("text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap", isCompact ? "text-[12px]" : "text-sm")}>{display}</p>
                {isLong && (
                  <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    className={cn("mt-1 text-[#1D9BF0] hover:underline", isCompact ? "text-[11px]" : "text-xs")}
                  >
                    {expanded ? "Show less" : "Show more"}
                  </button>
                )}
              </div>
            )}
            {mediaUrl && (
              <div className={cn("mt-3 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800", isCompact ? "" : "")}>
                <img src={mediaUrl} alt="media" className={cn("w-full object-cover", isCompact ? "max-h-[260px]" : "max-h-[420px]")} />
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onMore}
          className={cn("hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full", isCompact ? "p-1.5" : "p-2")}
        >
          <MoreHorizontal className={cn("text-zinc-400", isCompact ? "w-4 h-4" : "w-5 h-5")} />
        </button>
      </div>

      {/* Actions */}
      <div className={cn("flex items-center justify-between", isCompact ? "px-3 pb-2" : "px-4 pb-3")}>
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={onReply}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-700"
          >
            <MessageCircle className={cn(isCompact ? "w-4 h-4" : "w-5 h-5")} />
            <span className={cn(isCompact ? "text-[11px]" : "text-sm")}>{engagement?.replies ?? 0}</span>
          </button>
          <button
            type="button"
            onClick={handleRetweet}
            className={cn(
              "flex items-center gap-2 rounded",
              isCompact ? "px-1.5 py-1" : "px-2 py-1",
              retweeted ? "text-[#1D9BF0] bg-[#1D9BF0]/10" : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            )}
          >
            <Repeat className={cn(isCompact ? "w-4 h-4" : "w-5 h-5")} />
            <span className={cn(isCompact ? "text-[11px]" : "text-sm")}>{retweets}</span>
          </button>
          <button
            type="button"
            onClick={handleLike}
            className={cn(
              "flex items-center gap-2 rounded",
              isCompact ? "px-1.5 py-1" : "px-2 py-1",
              liked ? "text-rose-600 bg-rose-500/10" : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            )}
          >
            <Heart className={cn(isCompact ? "w-4 h-4" : "w-5 h-5")} />
            <span className={cn(isCompact ? "text-[11px]" : "text-sm")}>{likes}</span>
          </button>
        </div>
        <button
          type="button"
          onClick={handleBookmark}
          className={cn(
            "flex items-center gap-2 rounded",
            isCompact ? "px-1.5 py-1" : "px-2 py-1",
            bookmarked ? "text-[#1D9BF0] bg-[#1D9BF0]/10" : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          )}
        >
          <Bookmark className={cn(isCompact ? "w-4 h-4" : "w-5 h-5")} />
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
