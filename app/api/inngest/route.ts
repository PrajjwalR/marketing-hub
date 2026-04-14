import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { helloWorld, generateVideo, scheduleDailyVideos, processScheduledPosts, syncCrmCalendarDaily } from "@/inngest/functions";

// Create an API route that serves the Inngest functions
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        helloWorld,
        generateVideo,
        scheduleDailyVideos,
        processScheduledPosts,
        syncCrmCalendarDaily,
    ],
});
