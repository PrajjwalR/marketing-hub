import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { helloWorld, generateVideo, scheduleDailyVideos, processScheduledPosts } from "@/inngest/functions";
import { instagramCommentMonitor, instagramProcessAccount } from "@/inngest/instagram-auto-reply";

// Create an API route that serves the Inngest functions
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        helloWorld,
        generateVideo,
        scheduleDailyVideos,
        processScheduledPosts,
        instagramCommentMonitor,
        instagramProcessAccount,
    ],
});
