import { inngest } from "./client";
import { supabaseAdmin } from "@/lib/supabase";
import { generateScriptPrompt, model } from "@/lib/gemini";
import { generateTTS } from "@/lib/tts";
import { generateCaptions } from "@/lib/captions";
import { generateImages } from "@/lib/images";
import { triggerVideoRender, pollRenderStatus } from "@/lib/remotion";
import { sendVideoReadyEmail } from "@/lib/plunk";
import { publishToYouTube } from "@/lib/youtube-publish";
import { publishToLinkedIn } from "@/lib/linkedin-publish";
import { publishToFacebook } from "@/lib/facebook-publish";
import { publishToInstagram } from "@/lib/instagram-publish";
import { publishToTikTok } from "@/lib/tiktok-publish";
import { syncCrmCalendarForAllOwners, civilDayFromUtcDate } from "@/lib/sync-crm-calendar-posts";

export const helloWorld = inngest.createFunction(
    { id: "hello-world" },
    { event: "test/hello.world" },
    async ({ event, step }) => {
        await step.sleep("wait-a-moment", "1s");
        return { message: `Hello ${event.data.name ?? "World"}!` };
    }
);

export const scheduleDailyVideos = inngest.createFunction(
    { id: "schedule-daily-videos" },
    { cron: "0 0 * * *" }, // Run daily at midnight
    async ({ step }) => {
        const seriesList = await step.run("fetch-active-series", async () => {
            const { data, error } = await supabaseAdmin
                .from('series')
                .select('*')
                .eq('status', 'active');
            if (error) throw new Error(`Failed to fetch active series: ${error.message}`);
            return data as any[];
        });

        for (const series of seriesList) {
            await step.sendEvent(`trigger-scheduled-${series.id}`, {
                name: "video/generate",
                data: {
                    seriesId: series.id,
                    isScheduled: true
                }
            });
        }

        return { scheduled: seriesList.length };
    }
);

export const generateVideo = inngest.createFunction(
    { id: "generate-video" },
    { event: "video/generate" },
    async ({ event, step }) => {
        const { seriesId, isScheduled, testMode } = event.data;
        let { videoId } = event.data;

        // 1. Fetch Series data from supabase
        const series = await step.run("fetch-series-data", async () => {
            const { data, error } = await supabaseAdmin
                .from('series')
                .select('*')
                .eq('id', seriesId)
                .single();

            if (error) throw new Error(`Failed to fetch series: ${error.message}`);
            return data;
        });

        // 1.1 Handle Scheduling Delay (Generate 2 hours before)
        if (testMode) {
            // Accelerated test mode: wait 2 mins before starting generation
            await step.sleep("test-generation-delay", "2m");
        } else if (isScheduled && series.publish_time) {
            await step.run("wait-for-generation-window", async () => {
                const [hours, minutes] = series.publish_time.split(':').map(Number);
                const now = new Date();
                const genTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours - 2, minutes);

                // If the generation time has already passed for today, we skip the sleep
                if (genTime > now) {
                    const diff = genTime.getTime() - now.getTime();
                    console.log(`Sleeping for ${diff / 1000 / 60}m until generation window...`);
                    // We use sleep here instead of sleepUntil for relative day handling
                    await step.sleep("delay-generation", `${Math.floor(diff / 1000)}s`);
                }
            });
        }

        // 1.2 Create video record if not provided (for scheduled runs)
        if (!videoId) {
            videoId = await step.run("create-video-record", async () => {
                const { data, error } = await supabaseAdmin
                    .from('videos')
                    .insert({
                        series_id: seriesId,
                        status: 'processing'
                    })
                    .select('id')
                    .single();
                if (error) throw error;
                return data.id;
            });
        }

        // 2. Generate Video Script using AI
        const scriptData = await step.run("generate-video-script", async () => {
            const prompt = generateScriptPrompt(series.niche, series.duration, series.video_style);
            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            // Clean markdown blocks if AI accidentally included them
            const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
            return JSON.parse(jsonStr);
        });

        // 3. Generate Voice using TTS model
        const voiceUrl = await step.run("generate-voice", async () => {
            return await generateTTS(
                scriptData.script,
                series.voice,
                series.model_name,
                series.language,
                seriesId
            );
        });

        // 4. Generate Caption using Model
        const captions = await step.run("generate-captions", async () => {
            return await generateCaptions(voiceUrl);
        });

        // 5. Generate Images from image prompt
        const images = await step.run("generate-images", async () => {
            return await generateImages(scriptData.scenes, seriesId);
        });

        // 6. Save initial assets to database
        await step.run("save-initial-assets", async () => {
            const { error } = await supabaseAdmin
                .from('videos')
                .update({
                    title: scriptData.title,
                    script: scriptData,
                    voiceover_url: voiceUrl,
                    captions: captions,
                    images: images
                })
                .eq('id', videoId);

            if (error) throw new Error(`Failed to save video record: ${error.message}`);
            return { success: true };
        });

        // 7. Render Video on Remotion Lambda
        const renderResult = await step.run("render-video", async () => {
            const fps = 30;
            const durationInFrames = Math.floor((captions.duration + 2) * fps);

            return await triggerVideoRender({
                images: images.map((img: any) => img.url),
                audioUrl: voiceUrl,
                captions: captions.words,
                durationInFrames,
                fps,
                videoStyle: series.video_style,
                captionStyle: series.caption_style
            });
        });

        // 8. Wait for render to complete
        const finalVideoUrl = await step.run("wait-for-render", async () => {
            return await pollRenderStatus(renderResult.renderId, renderResult.bucketName);
        });

        // 9. Update final video URL and status
        await step.run("finalize-video", async () => {
            const { error } = await supabaseAdmin
                .from('videos')
                .update({
                    video_url: finalVideoUrl,
                    status: 'ready'
                })
                .eq('id', videoId);

            if (error) throw new Error(`Failed to finalize video record: ${error.message}`);
            return { success: true };
        });

        // 10. Wait for Publish Time
        if (testMode) {
            // Accelerated test mode: wait 2 mins before publishing
            await step.sleep("test-publish-delay", "2m");
        } else if (isScheduled && series.publish_time) {
            await step.run("wait-for-publish-time", async () => {
                const [hours, minutes] = series.publish_time.split(':').map(Number);
                const now = new Date();
                const pubTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

                if (pubTime > now) {
                    const diff = pubTime.getTime() - now.getTime();
                    await step.sleep("delay-publish", `${Math.floor(diff / 1000)}s`);
                }
            });
        }

        // 11. Multi-Platform Publishing
        await step.run("publish-to-platforms", async () => {
            const platforms = series.platforms || [];
            const results = [];

            // Email Notification - get email from Supabase users table
            const { data: userData } = await supabaseAdmin
                .from('users')
                .select('email')
                .eq('user_id', series.user_id)
                .single();
            const emailAddress = userData?.email;

            if (emailAddress) {
                await sendVideoReadyEmail({
                    email: emailAddress,
                    title: scriptData.title,
                    thumbnailUrl: images[0]?.url || "",
                    videoUrl: finalVideoUrl || "",
                    seriesName: series.series_name
                });
                results.push("email-sent");
            }

            // Platform Publishing
            if (platforms.includes('youtube')) {
                console.log(`[PUBLISH] Triggering YouTube Upload for ${finalVideoUrl}`);
                try {
                    if (!finalVideoUrl) throw new Error("Video URL is missing");
                    const ytResult = await publishToYouTube({
                        videoUrl: finalVideoUrl,
                        title: scriptData.title,
                        description: scriptData.summary || `Daily ${series.series_name} video.`,
                        userId: series.user_id
                    });
                    results.push(`youtube-published:${ytResult.id}`);
                } catch (err: any) {
                    console.error("YouTube Publish Error:", err);
                    results.push(`youtube-failed:${err.message}`);
                }
            }

            if (platforms.includes('linkedin')) {
                // Fetch ALL connected LinkedIn accounts for this user to publish to
                const { data: linkedinConnections } = await supabaseAdmin
                    .from('social_connections')
                    .select('id, profile_name')
                    .eq('user_id', series.user_id)
                    .eq('platform', 'linkedin');

                if (linkedinConnections && linkedinConnections.length > 0) {
                    for (const conn of linkedinConnections) {
                        console.log(`[PUBLISH] Triggering LinkedIn Post for ${finalVideoUrl} to account ${conn.profile_name}`);
                        try {
                            const lnResult = await publishToLinkedIn({
                                text: `${scriptData.title}\n\n${scriptData.summary || `Daily ${series.series_name} video.`}\n\Watch here: ${finalVideoUrl}`,
                                connectionId: conn.id // Pass specific connection ID for multi-account!
                            });
                            results.push(`linkedin-published:${conn.profile_name}:${lnResult.postId}`);
                        } catch (err: any) {
                            console.error(`LinkedIn Publish Error for ${conn.profile_name}:`, err);
                            results.push(`linkedin-failed:${conn.profile_name}:${err.message}`);
                        }
                    }
                } else {
                    console.log(`[PUBLISH] No LinkedIn connections found for user ${series.user_id}`);
                }
            }

            if (platforms.includes('instagram')) {
                // Fetch ALL connected Instagram accounts for this user
                const { data: instagramConnections } = await supabaseAdmin
                    .from('social_connections')
                    .select('id, profile_name')
                    .eq('user_id', series.user_id)
                    .eq('platform', 'instagram');

                if (instagramConnections && instagramConnections.length > 0) {
                    if (!finalVideoUrl) {
                        console.error("[PUBLISH] Instagram publish skipped: finalVideoUrl is null");
                        results.push("instagram-failed:video-url-missing");
                    } else {
                        for (const conn of instagramConnections) {
                            console.log(`[PUBLISH] Triggering Instagram Post for ${finalVideoUrl} to account ${conn.profile_name}`);
                            try {
                                const igResult = await publishToInstagram({
                                    connectionId: conn.id,
                                    text: `${scriptData.title}\n\n${scriptData.summary || `Daily ${series.series_name} video.`}`,
                                    mediaUrl: finalVideoUrl!
                                });
                                results.push(`instagram-published:${conn.profile_name}:${igResult.postId}`);
                            } catch (err: any) {
                                console.error(`Instagram Publish Error for ${conn.profile_name}:`, err);
                                results.push(`instagram-failed:${conn.profile_name}:${err.message}`);
                            }
                        }
                    }
                } else {
                    console.log(`[PUBLISH] No Instagram connections found for user ${series.user_id}`);
                }
            }

            if (platforms.includes('tiktok')) {
                // Fetch ALL connected TikTok accounts for this user
                const { data: tiktokConnections } = await supabaseAdmin
                    .from('social_connections')
                    .select('id, profile_name')
                    .eq('user_id', series.user_id)
                    .eq('platform', 'tiktok');

                if (tiktokConnections && tiktokConnections.length > 0) {
                    if (!finalVideoUrl) {
                        console.error("[PUBLISH] TikTok publish skipped: finalVideoUrl is null");
                        results.push("tiktok-failed:video-url-missing");
                    } else {
                        for (const conn of tiktokConnections) {
                            console.log(`[PUBLISH] Triggering TikTok Upload for ${finalVideoUrl} to account ${conn.profile_name}`);
                            try {
                                const ttResult = await publishToTikTok({
                                    userId: series.user_id, // publishToTikTok handles the fetch itself but we can pass the userId
                                    text: `${scriptData.title}\n\n${scriptData.summary || `Daily ${series.series_name} video.`}`,
                                    videoUrl: finalVideoUrl!
                                });
                                results.push(`tiktok-published:${conn.profile_name}:${ttResult.publishId}`);
                            } catch (err: any) {
                                console.error(`TikTok Publish Error for ${conn.profile_name}:`, err);
                                results.push(`tiktok-failed:${conn.profile_name}:${err.message}`);
                            }
                        }
                    }
                } else {
                    console.log(`[PUBLISH] No TikTok connections found for user ${series.user_id}`);
                }
            }

            return { published: results };
        });

        return {
            success: true,
            message: "Workflow completed successfully",
            videoUrl: finalVideoUrl,
            seriesName: series.series_name
        };
    }
);

export const processScheduledPosts = inngest.createFunction(
    // retries: 0 — critical. The publish step (esp. IG carousels with many
    // images) can take 30-60s and hit transient errors. Without retries: 0,
    // Inngest retries the step and IG creates a duplicate post because there's
    // no idempotency key on the platform side. Better to leave a failed row
    // as 'failed' and let the user reschedule than to silently duplicate.
    { id: "process-scheduled-posts", retries: 0 },
    { cron: "* * * * *" }, // Run every minute
    async ({ step }) => {
        // 0. Recover rows stuck in 'processing' for > 5 minutes.
        // If the function was killed mid-publish (Vercel timeout, IG stall, etc.)
        // a row can end up marked 'processing' with no cron picking it up again.
        // Safe to reset because the platform_post_id idempotency guard on the
        // publish step prevents duplicates even on retry.
        await step.run("recover-stuck-processing-rows", async () => {
            // Anything still 'processing' whose scheduled_at is > 5 min ago is stuck.
            // (No updated_at column, so scheduled_at is our next-best proxy.)
            const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            const { data, error } = await supabaseAdmin
                .from('calendar_events')
                .update({ status: 'scheduled' })
                .eq('status', 'processing')
                .eq('type', 'post')
                .lte('scheduled_at', fiveMinAgo)
                .select('id');
            if (error) {
                console.warn(`[recover-stuck] update failed: ${error.message}`);
                return { recovered: 0 };
            }
            if (data && data.length > 0) {
                console.log(`[recover-stuck] Reset ${data.length} stuck rows to scheduled`);
            }
            return { recovered: data?.length ?? 0 };
        });

        // 1. Atomically claim due posts by moving them from 'scheduled' -> 'processing'.
        // This prevents concurrent cron invocations (or Inngest retries) from picking
        // up the same row and publishing duplicates. Only one caller wins the update
        // per row; others get zero rows and skip. Supabase update+select is atomic.
        const duePosts = await step.run("fetch-and-claim-due-posts", async () => {
            const now = new Date().toISOString();
            const { data, error } = await supabaseAdmin
                .from('calendar_events')
                .update({ status: 'processing' })
                .eq('status', 'scheduled')
                .eq('type', 'post')
                .lte('scheduled_at', now)
                .select('*, social_connections(profile_name)')
                .order('scheduled_at', { ascending: true })
                .limit(50);

            if (error) throw new Error(`Failed to claim due posts: ${error.message}`);
            return data;
        });

        if (!duePosts || duePosts.length === 0) {
            return { processed: 0 };
        }

        const results = [];

        // 2. Process each post independently
        for (const post of duePosts) {
            try {
                // Publish based on platform
                if (post.platform?.toLowerCase() === 'linkedin') {
                    if (!post.account_id) throw new Error("Missing account_id for LinkedIn post");
                    
                    const textContent = `${post.title}${post.description ? `\n\n${post.description}` : ''}${post.media_url ? `\n\nWatch here: ${post.media_url}` : ''}`;
                    
                    await step.run(`publish-linkedin-${post.id}`, async () => {
                        await publishToLinkedIn({
                            text: textContent,
                            connectionId: post.account_id
                        });
                    });
                } else if (post.platform?.toLowerCase() === 'youtube') {
                    if (!post.media_url) throw new Error("Media URL (video) is required for YouTube");
                    
                    await step.run(`publish-youtube-${post.id}`, async () => {
                        await publishToYouTube({
                            videoUrl: post.media_url!,
                            title: post.title,
                            description: post.description || "",
                            userId: post.user_id
                        });
                    });
                } else if (post.platform?.toLowerCase() === 'facebook') {
                    if (!post.account_id) throw new Error("Missing account_id for Facebook post");

                    await step.run(`publish-facebook-${post.id}`, async () => {
                        await publishToFacebook({
                            connectionId: post.account_id,
                            text: `${post.title}${post.description ? `\n\n${post.description}` : ''}`,
                            mediaUrl: post.media_url
                        });
                    });
                } else if (post.platform?.toLowerCase() === 'instagram') {
                    if (!post.account_id) throw new Error("Missing account_id for Instagram post");
                    if (!post.media_url) throw new Error("Media URL is required for Instagram");

                    await step.run(`publish-instagram-${post.id}`, async () => {
                        // Idempotency: if platform_post_id is already set for this row, skip.
                        // Prevents duplicates even if the cron fires this step more than once
                        // (Inngest step retry, dual triggers, etc.).
                        const { data: current } = await supabaseAdmin
                            .from('calendar_events')
                            .select('platform_post_id')
                            .eq('id', post.id)
                            .single();

                        if (current?.platform_post_id) {
                            console.log(`[publish-instagram] Row ${post.id} already published as ${current.platform_post_id}, skipping.`);
                            return { skipped: true, existingId: current.platform_post_id };
                        }

                        const urls = post.media_url ? post.media_url.split(',').map((u: string) => u.trim()) : [];
                        const result = await publishToInstagram({
                            connectionId: post.account_id!,
                            text: `${post.title}${post.description ? `\n\n${post.description}` : ''}`,
                            mediaUrls: urls
                        });

                        // Save platform_post_id atomically. The .is('platform_post_id', null)
                        // guard means a concurrent run that already saved a post_id wins;
                        // this update simply becomes a no-op. Combined with the check above,
                        // the platform sees at most ONE publish per row for its lifetime.
                        if (result?.postId) {
                            await supabaseAdmin
                                .from('calendar_events')
                                .update({ platform_post_id: result.postId })
                                .eq('id', post.id)
                                .is('platform_post_id', null);
                        }

                        return { postId: result?.postId };
                    });
                } else if (post.platform?.toLowerCase() === 'tiktok') {
                    // TikTok typically expects userId to find connection if account_id isn't directly the connection record ID
                    // But in our social_connections it seems we use account_id for connectionId on other platforms
                    const connectionId = post.account_id;
                    if (!connectionId) throw new Error("Missing account_id for TikTok post");
                    if (!post.media_url) throw new Error("Media URL (video) is required for TikTok");

                    await step.run(`publish-tiktok-${post.id}`, async () => {
                        await publishToTikTok({
                            userId: post.user_id,
                            text: `${post.title}${post.description ? `\n\n${post.description}` : ''}`,
                            videoUrl: post.media_url!
                        });
                    });
                } else {
                    throw new Error(`Platform ${post.platform} not supported or not yet fully implemented for auto-publish.`);
                }

                // 3. Mark as published
                await step.run(`mark-published-${post.id}`, async () => {
                    await supabaseAdmin
                        .from('calendar_events')
                        .update({ status: 'published' })
                        .eq('id', post.id);
                });
                
                results.push({ id: post.id, status: 'success' });
            } catch (error: unknown) {
                console.error(`Failed to process post ${post.id}:`, error);
                const errorMessage = error instanceof Error ? error.message : "Unknown error";
                
                // Mark as failed
                await step.run(`mark-failed-${post.id}`, async () => {
                    await supabaseAdmin
                        .from('calendar_events')
                        .update({ status: 'failed' })
                        .eq('id', post.id);
                });
                results.push({ id: post.id, status: 'error', error: errorMessage });
            }
        }

        return { processed: duePosts.length, results };
    }
);

export const syncCrmCalendarDaily = inngest.createFunction(
    { id: "sync-crm-calendar-daily" },
    { cron: "20 0 * * *" },
    async ({ step }) => {
        const result = await step.run("sync-crm-birthdays-and-loyalty", async () => {
            return syncCrmCalendarForAllOwners(civilDayFromUtcDate(new Date()));
        });
        return result;
    }
);

