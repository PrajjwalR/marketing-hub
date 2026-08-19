import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { helloWorld, generateVideo, scheduleDailyVideos, processScheduledPosts } from "@/inngest/functions";
import { instagramCommentMonitor, instagramProcessAccount } from "@/inngest/instagram-auto-reply";

const serveHost =
    process.env.INNGEST_SERVE_HOST ||
    (process.env.NODE_ENV === "production" ? undefined : "http://localhost:3100");

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
    serveHost,
});
