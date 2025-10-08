"use client";

import React, { useState } from "react";
import { Post } from "@/features/posts/types";
import { PostControls } from "./PostControls";
import { PostCardRenderer } from "./PostCardRenderer";
import { buildISOFromDateTime } from "./utils";
import type { ScheduleState, ScheduleEntry, PostControlsHandlers } from "./types";
import { usePublishPostMutation, useSchedulePostMutation } from "@/features/posts/services/api";
import { Loader } from "../ui/loader";

export function PostCards({ posts, postLoading }: { posts: Post[], postLoading?: boolean }) {
    const [schedule, setSchedule] = useState<ScheduleState>({});
    const [publishPost, { isLoading: isPublishing }] = usePublishPostMutation();
    const [schedulePost, { isLoading: isScheduling }] = useSchedulePostMutation();


    if (postLoading) {
        return <Loader />;
    }

    if (!posts || posts.length === 0) {
        return <div className="text-center text-gray-500">No posts available</div>;
    }

    return (
        <div className="w-full h-[70vh] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-5">

            {posts.map((post) => {
                const ps: ScheduleEntry = schedule[post.id] || {};

                const handlers: PostControlsHandlers = {
                    startScheduling: (postId) =>
                        setSchedule((prev) => ({ ...prev, [postId]: { ...(prev[postId] || {}), mode: "scheduling" } })),
                    cancelScheduling: (postId) =>
                        setSchedule((prev) => ({ ...prev, [postId]: { date: undefined, time: undefined, mode: "idle", scheduledISO: null, publishedAt: prev[postId]?.publishedAt || null } })),
                    setPostDate: (postId, date) =>
                        setSchedule((prev) => ({ ...prev, [postId]: { ...(prev[postId] || {}), date } })),
                    setPostTime: (postId, time) =>
                        setSchedule((prev) => ({ ...prev, [postId]: { ...(prev[postId] || {}), time } })),
                    onPublishNow: async (p) => {
                        setSchedule((prev) => ({ ...prev, [p.id]: { ...(prev[p.id] || {}), mode: "scheduling" } }));
                        try {
                            const updated = await publishPost(p.id).unwrap();
                            const publishedAtIso = updated?.published_at || new Date().toISOString();
                            setSchedule((prev) => ({
                                ...prev,
                                [p.id]: { ...(prev[p.id] || {}), mode: "published", publishedAt: publishedAtIso }
                            }));
                        } catch (e) {
                            // eslint-disable-next-line no-console
                            console.error("Failed to publish post", e);
                            setSchedule((prev) => ({
                                ...prev,
                                [p.id]: { ...(prev[p.id] || {}), mode: "idle" }
                            }));
                        }
                    },
                    onSchedule: (p) => {
                        const entry = schedule[p.id] || {};
                        const iso = buildISOFromDateTime(entry.date, entry.time || null);
                        if (!iso) {
                            // eslint-disable-next-line no-console
                            console.error("Please select a valid date and time to schedule");
                            setSchedule((prev) => ({ ...prev, [p.id]: { ...(prev[p.id] || {}), mode: "idle" } }));
                            return;
                        }
                        setSchedule((prev) => ({ ...prev, [p.id]: { ...(prev[p.id] || {}), mode: "scheduling" } }));
                        (async () => {
                            try {
                                const updated = await schedulePost({ id: p.id, scheduled_for: iso }).unwrap();
                                setSchedule((prev) => ({
                                    ...prev,
                                    [p.id]: { ...(prev[p.id] || {}), mode: "scheduled", scheduledISO: updated?.scheduled_for || iso }
                                }));
                            } catch (e) {
                                // eslint-disable-next-line no-console
                                console.error("Failed to schedule post", e);
                                setSchedule((prev) => ({ ...prev, [p.id]: { ...(prev[p.id] || {}), mode: "idle" } }));
                            }
                        })();
                    },
                };

                return (
                    <PostCardRenderer
                        key={post.id}
                        post={post}
                        footerSlot={<PostControls post={post} schedule={ps} handlers={handlers} />}
                    />
                );
            })}
        </div>
    );
}

