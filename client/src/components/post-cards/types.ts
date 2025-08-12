import type { Post } from "@/features/posts/types";

export type ScheduleMode = 'idle' | 'scheduling' | 'scheduled' | 'published';

export type ScheduleEntry = {
  date?: Date | null;
  time?: string; // HH:mm (24h)
  mode?: ScheduleMode;
  scheduledISO?: string | null;
  publishedAt?: string | null;
};

export type ScheduleState = {
  [postId: number]: ScheduleEntry;
};

export type PostControlsHandlers = {
  startScheduling: (postId: number) => void;
  cancelScheduling: (postId: number) => void;
  setPostDate: (postId: number, date?: Date | null) => void;
  setPostTime: (postId: number, time: string) => void;
  onPublishNow: (post: Post) => void;
  onSchedule: (post: Post) => void;
};
