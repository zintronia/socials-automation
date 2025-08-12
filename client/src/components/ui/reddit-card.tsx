"use client";

import { cn } from "@/lib/utils";
import { Bookmark, MessageCircle, MoreHorizontal, Share2, ArrowUp, ArrowDown } from "lucide-react";
import { useState } from "react";

export interface RedditCardProps {
  avatarUrl: string;
  authorName: string;
  subreddit?: string;
  timestamp?: string;
  title?: string;
  content?: string;
  mediaUrl?: string;
  engagement?: {
    votes?: number;
    comments?: number;
    isUpvoted?: boolean;
    isDownvoted?: boolean;
    isSaved?: boolean;
  };
  onUpvote?: () => void;
  onDownvote?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onSave?: () => void;
  onMore?: () => void;
  size?: "default" | "compact";
  className?: string;
}

export function RedditCard({
  avatarUrl,
  authorName,
  subreddit,
  timestamp,
  title,
  content,
  mediaUrl,
  engagement,
  onUpvote,
  onDownvote,
  onComment,
  onShare,
  onSave,
  onMore,
  size = "default",
  className,
}: RedditCardProps) {
  const [votes, setVotes] = useState(engagement?.votes ?? 0);
  const [up, setUp] = useState(engagement?.isUpvoted ?? false);
  const [down, setDown] = useState(engagement?.isDownvoted ?? false);
  const [saved, setSaved] = useState(engagement?.isSaved ?? false);
  const [expanded, setExpanded] = useState(false);

  const maxChars = 300;
  const isLong = (content?.length ?? 0) > maxChars;
  const display = !isLong || expanded ? content : content!.slice(0, maxChars).trimEnd() + "...";

  const isCompact = size === "compact";

  const handleUp = () => {
    if (up) {
      setUp(false);
      setVotes((v) => v - 1);
    } else {
      setUp(true);
      setDown(false);
      setVotes((v) => (down ? v + 2 : v + 1));
    }
    onUpvote?.();
  };

  const handleDown = () => {
    if (down) {
      setDown(false);
      setVotes((v) => v + 1);
    } else {
      setDown(true);
      setUp(false);
      setVotes((v) => (up ? v - 2 : v - 1));
    }
    onDownvote?.();
  };

  const handleSave = () => {
    setSaved((s) => !s);
    onSave?.();
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
      <div className="flex">
        {/* Vote rail */}
        <div className={cn("flex flex-col items-center gap-1 bg-zinc-50 dark:bg-zinc-900/50 rounded-l-xl", isCompact ? "p-2 w-10" : "p-3 w-12")}>
          <button
            type="button"
            onClick={handleUp}
            className={cn(
              "rounded hover:bg-zinc-100 dark:hover:bg-zinc-800",
              isCompact ? "p-1" : "p-1.5",
              up ? "text-orange-600" : "text-zinc-500"
            )}
          >
            <ArrowUp className={cn(isCompact ? "w-4 h-4" : "w-5 h-5")} />
          </button>
          <span className={cn("font-medium text-zinc-700 dark:text-zinc-300", isCompact ? "text-[12px]" : "text-sm")}>{votes}</span>
          <button
            type="button"
            onClick={handleDown}
            className={cn(
              "rounded hover:bg-zinc-100 dark:hover:bg-zinc-800",
              isCompact ? "p-1" : "p-1.5",
              down ? "text-blue-600" : "text-zinc-500"
            )}
          >
            <ArrowDown className={cn(isCompact ? "w-4 h-4" : "w-5 h-5")} />
          </button>
        </div>

        {/* Body */}
        <div className={cn("flex-1", isCompact ? "p-3" : "p-4")}>
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <img src={avatarUrl} alt={authorName} className={cn("rounded-full", isCompact ? "w-6 h-6" : "w-8 h-8")} />
              <div className={cn("text-zinc-500", isCompact ? "text-[11px]" : "text-xs")}>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">{subreddit ?? "r/yourSubreddit"}</span>
                <span className="mx-1">•</span>
                <span>Posted by {authorName}</span>
                {timestamp && <span className="ml-1">• {timestamp}</span>}
                <span className={cn("ml-2 inline-flex items-center rounded-full bg-orange-500/10 text-orange-600 font-medium", isCompact ? "px-1.5 py-[1px] text-[9px]" : "px-2 py-0.5 text-[10px]")}>
                  Reddit
                </span>
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

          {title && (
            <h3 className={cn("mt-2 font-semibold text-zinc-900 dark:text-zinc-100", isCompact ? "text-[13px]" : "text-[15px]")}>
              {title}
            </h3>
          )}

          {content && (
            <div className="mt-2">
              <p className={cn("text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap", isCompact ? "text-[12px]" : "text-sm")}>{display}</p>
              {isLong && (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className={cn("mt-1 text-orange-600 hover:underline", isCompact ? "text-[11px]" : "text-xs")}
                >
                  {expanded ? "Show less" : "Show more"}
                </button>
              )}
            </div>
          )}

          {mediaUrl && (
            <div className="mt-3 overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-800">
              <img src={mediaUrl} alt="media" className={cn("w-full object-cover", isCompact ? "max-h-[260px]" : "max-h-[520px]")} />
            </div>
          )}

          {/* Actions */}
          <div className={cn("mt-3 flex items-center justify-between", isCompact ? "text-[12px]" : "text-sm")}>
            <button
              type="button"
              onClick={onComment}
              className="flex items-center gap-2 text-zinc-500 hover:text-zinc-700"
            >
              <MessageCircle className={cn(isCompact ? "w-3.5 h-3.5" : "w-4 h-4")} />
              <span>{engagement?.comments ?? 0} Comments</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onShare}
                className="flex items-center gap-2 text-zinc-500 hover:text-zinc-700"
              >
                <Share2 className={cn(isCompact ? "w-3.5 h-3.5" : "w-4 h-4")} />
                <span>Share</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                className={cn(
                  "flex items-center gap-2 rounded",
                  isCompact ? "px-1.5 py-1" : "px-2 py-1",
                  saved ? "text-orange-600 bg-orange-500/10" : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                )}
              >
                <Bookmark className={cn(isCompact ? "w-3.5 h-3.5" : "w-4 h-4")} />
                <span>{saved ? "Saved" : "Save"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
