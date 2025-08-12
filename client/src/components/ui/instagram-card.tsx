"use client";

import { cn } from "@/lib/utils";
import { Bookmark, MessageCircle, MoreHorizontal, Send } from "lucide-react";
import { useState } from "react";

export interface InstagramCardProps {
  avatarUrl: string;
  authorName: string;
  handle?: string;
  location?: string;
  timestamp?: string;
  content?: string;
  mediaUrl?: string; // main image
  engagement?: {
    likes?: number;
    comments?: number;
    isLiked?: boolean;
    isSaved?: boolean;
  };
  onLike?: () => void;
  onComment?: () => void;
  onSend?: () => void;
  onSave?: () => void;
  onMore?: () => void;
  size?: "default" | "compact";
  className?: string;
}

export function InstagramCard({
  avatarUrl,
  authorName,
  handle,
  location,
  timestamp,
  content,
  mediaUrl,
  engagement,
  onLike,
  onComment,
  onSend,
  onSave,
  onMore,
  size = "default",
  className,
}: InstagramCardProps) {
  const [liked, setLiked] = useState(engagement?.isLiked ?? false);
  const [saved, setSaved] = useState(engagement?.isSaved ?? false);
  const [likes, setLikes] = useState(engagement?.likes ?? 0);
  const [expanded, setExpanded] = useState(false);

  const maxChars = 220;
  const isLong = (content?.length ?? 0) > maxChars;
  const display = !isLong || expanded ? content : content!.slice(0, maxChars).trimEnd() + "...";

  const isCompact = size === "compact";

  const handleLike = () => {
    setLiked((l) => !l);
    setLikes((v) => (liked ? v - 1 : v + 1));
    onLike?.();
  };

  const handleSave = () => {
    setSaved((s) => !s);
    onSave?.();
  };

  return (
    <div
      className={cn(
        "w-full mx-auto",
        isCompact ? "max-w-[17rem]" : "max-w-md",
        "bg-white dark:bg-zinc-900",
        "border border-zinc-200 dark:border-zinc-800",
        "rounded-xl shadow-sm overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className={cn("flex items-center justify-between", isCompact ? "px-3 py-2" : "px-4 py-3") }>
        <div className="flex items-center gap-3">
          <img src={avatarUrl} alt={authorName} className={cn("rounded-full", isCompact ? "w-6 h-6" : "w-8 h-8")} />
          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <span className={cn("font-semibold text-zinc-900 dark:text-zinc-100", isCompact ? "text-[12px]" : "text-sm")}>{authorName}</span>
              {handle && <span className={cn("text-zinc-500", isCompact ? "text-[10px]" : "text-xs")}>{handle}</span>}
              <span className={cn("ml-2 inline-flex items-center rounded-full bg-pink-500/10 text-pink-600 font-medium", isCompact ? "px-1.5 py-[1px] text-[9px]" : "px-2 py-0.5 text-[10px]") }>
                Instagram
              </span>
            </div>
            {(location || timestamp) && (
              <div className={cn("text-zinc-500", isCompact ? "text-[10px]" : "text-[11px]") }>
                {location}
                {location && timestamp && " • "}
                {timestamp}
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

      {/* Media */}
      {mediaUrl && (
        <div className="bg-black">
          <img src={mediaUrl} alt="post" className={cn("w-full object-cover", isCompact ? "max-h-[260px]" : "max-h-[520px]")} />
        </div>
      )}

      {/* Actions */}
      <div className={cn("flex items-center justify-between", isCompact ? "px-3 py-2" : "px-4 py-2") }>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleLike}
            className={cn(
              "text-zinc-600 dark:text-zinc-300 hover:scale-105 transition",
              liked && "text-pink-600"
            )}
          >
            {/* Heart-like glyph via inline SVG for filled state feel */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={liked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.5"
              className={cn(isCompact ? "w-5 h-5" : "w-6 h-6")}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 8.063 11.25 9 11.25s9-4.03 9-11.25z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onComment}
            className="text-zinc-600 dark:text-zinc-300 hover:scale-105 transition"
          >
            <MessageCircle className={cn(isCompact ? "w-5 h-5" : "w-6 h-6")} />
          </button>
          <button
            type="button"
            onClick={onSend}
            className="text-zinc-600 dark:text-zinc-300 hover:scale-105 transition"
          >
            <Send className={cn(isCompact ? "w-5 h-5" : "w-6 h-6")} />
          </button>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className={cn(
            "text-zinc-600 dark:text-zinc-300 hover:scale-105 transition",
            saved && "text-pink-600"
          )}
        >
          <Bookmark className={cn(isCompact ? "w-5 h-5" : "w-6 h-6")} />
        </button>
      </div>

      {/* Like count */}
      <div className={cn(isCompact ? "px-3" : "px-4") }>
        <div className={cn("font-semibold text-zinc-900 dark:text-zinc-100", isCompact ? "text-[12px]" : "text-sm")}>{likes} likes</div>
      </div>

      {/* Caption */}
      {(content || handle) && (
        <div className={cn("text-zinc-800 dark:text-zinc-200", isCompact ? "px-3 py-2 text-[12px]" : "px-4 py-2 text-sm") }>
          {content && (
            <>
              <p className="whitespace-pre-wrap">{display}</p>
              {isLong && (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className={cn("mt-1 text-pink-600 hover:underline", isCompact ? "text-[11px]" : "text-xs")}
                >
                  {expanded ? "Show less" : "Show more"}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Comments preview */}
      {engagement?.comments !== undefined && (
        <div className={cn("text-zinc-500", isCompact ? "px-3 pb-2 text-[11px]" : "px-4 pb-3 text-xs") }>
          View all {engagement?.comments} comments
        </div>
      )}
    </div>
  );
}
