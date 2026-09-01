import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { helloWorld, generateVideo, scheduleDailyVideos, processScheduledPosts } from "@/inngest/functions";
import { instagramCommentMonitor, instagramProcessAccount } from "@/inngest/instagram-auto-reply";

// Give Vercel serverless functions more headroom. IG carousel publishes with
// video processing can take 30-60s. Vercel clamps to plan max (60s Hobby,
// 300s Pro, 800s Pro-Fluid) so setting 300 is safe on any plan.
export const maxDuration = 300;

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
