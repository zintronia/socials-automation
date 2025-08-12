"use client";

import React from "react";
import type { Post } from "@/features/posts/types";
import type { ScheduleEntry, PostControlsHandlers } from "./types";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon, X as XIcon } from "lucide-react";
import { formatISOForDisplay } from "./utils";

export function PostControls({
  post,
  schedule,
  handlers,
}: {
  post: Post;
  schedule: ScheduleEntry;
  handlers: PostControlsHandlers;
}) {
  const mode = schedule.mode || "idle";
  const dateLabel = schedule.date
    ? `${schedule.date.toDateString()}${schedule.time ? ` • ${schedule.time}` : ""}`
    : "Pick date & time";
  const hasDateTime = Boolean(schedule.date) && Boolean(schedule.time);

  // Prefer server truth for status display
  if ((post.status || '').toLowerCase() === 'published') {
    return (
      <div className="mt-1 flex items-center justify-between rounded-md bg-emerald-50 dark:bg-emerald-900/10 px-2 py-1 text-emerald-700 dark:text-emerald-400 text-xs">
        <span>
          This post was published at {formatISOForDisplay((post as any).published_at || schedule.publishedAt)}
        </span>
      </div>
    );
  }

  if ((post.status || '').toLowerCase() === 'scheduled') {
    return (
      <div className="mt-1 flex items-center justify-between rounded-md bg-blue-50 dark:bg-blue-900/10 px-2 py-1 text-blue-700 dark:text-blue-400 text-xs">
        <span>
          Post scheduled for {formatISOForDisplay((post as any).scheduled_for || schedule.scheduledISO)}
        </span>
      </div>
    );
  }

  if (mode === "published") {
    return (
      <div className="mt-1 flex items-center justify-between rounded-md bg-emerald-50 dark:bg-emerald-900/10 px-2 py-1 text-emerald-700 dark:text-emerald-400 text-xs">
        <span>This post was published at {formatISOForDisplay(schedule.publishedAt)}</span>
      </div>
    );
  }

  if (mode === "scheduled") {
    return (
      <div className="mt-1 flex items-center justify-between rounded-md bg-blue-50 dark:bg-blue-900/10 px-2 py-1 text-blue-700 dark:text-blue-400 text-xs">
        <span>Post scheduled for {formatISOForDisplay(schedule.scheduledISO)}</span>
        <button
          aria-label="Cancel schedule"
          className="p-0.5 hover:opacity-80"
          onClick={() => handlers.cancelScheduling(post.id)}
        >
          <XIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  if (mode === "scheduling") {
    return (
      <div className="mt-1 flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 px-2 text-xs justify-start">
                <CalendarIcon className="mr-1.5 h-3.5 w-3.5" /> {dateLabel}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[260px] p-2" align="start">
              <div className="space-y-2 text-xs">
                <Calendar
                  mode="single"
                  selected={schedule.date ?? undefined}
                  onSelect={(d) => handlers.setPostDate(post.id, d)}
                  initialFocus
                />
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">Time</label>
                  <Input
                    type="time"
                    className="h-7 text-xs"
                    value={schedule.time || ""}
                    onChange={(e) => handlers.setPostTime(post.id, e.target.value)}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => handlers.onSchedule(post)}
            disabled={!hasDateTime}
          >
            Schedule
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs"
            onClick={() => handlers.cancelScheduling(post.id)}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // idle
  return (
    <div className="mt-1 flex items-center gap-1">
      {(post.status || '').toLowerCase() !== 'published' && (
        <Button
          size="sm"
          variant="secondary"
          className="h-7 px-2 text-xs"
          onClick={() => handlers.onPublishNow(post)}
        >
          Publish now
        </Button>
      )}
      <Button size="sm" className="h-7 px-2 text-xs" onClick={() => handlers.startScheduling(post.id)}>
        Schedule later
      </Button>
    </div>
  );
}
