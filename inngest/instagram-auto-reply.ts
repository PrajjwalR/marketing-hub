/**
 * Auto Reply — Inngest Background Functions
 * Supports: Instagram, X (Twitter)
 *
 * Two functions:
 * 1. commentMonitor (cron every 5 min) — discovers active accounts
 * 2. processAccount (event driven) — processes comments for one account
 */

import { inngest } from "./client";
import { supabaseAdmin } from "@/lib/supabase";
import {
  getAccountUsername,
  getInstagramMedia,
  getMediaComments,
  replyToComment,
  hasOwnReply,
} from "@/lib/instagram-comments";
import { generateAIReply } from "@/lib/instagram-ai-reply";

// Platforms that support auto-reply
const SUPPORTED_PLATFORMS = ["instagram", "x", "twitter"];

// ─── 1. Cron: Poll for active accounts every 5 minutes ─────────────────────
export const instagramCommentMonitor = inngest.createFunction(
  { id: "instagram-comment-monitor" },
  { cron: "*/5 * * * *" },
  async ({ step }) => {
    const activeSettings = await step.run(
      "fetch-active-settings",
      async () => {
        const { data, error } = await supabaseAdmin
          .from("auto_reply_settings")
          .select(
            "*, social_connections!inner(id, platform, access_token, internal_id, profile_name, token_encrypted)"
          )
          .eq("enabled", true)
          .in("social_connections.platform", SUPPORTED_PLATFORMS);

        if (error)
          throw new Error(
            `Failed to fetch active settings: ${error.message}`
          );
        return data || [];
      }
    );

    if (activeSettings.length === 0) {
      return { message: "No active auto-reply accounts", dispatched: 0 };
    }

    // Dispatch per-account processing events
    for (const setting of activeSettings) {
      await step.sendEvent(`process-${setting.connection_id}`, {
        name: "instagram/process-account",
        data: {
          settingId: setting.id,
          connectionId: setting.connection_id,
          userId: setting.user_id,
        },
      });
    }

    return { dispatched: activeSettings.length };
  }
);

// ─── 2. Event: Process comments for a single Instagram account ─────────────
export const instagramProcessAccount = inngest.createFunction(
  {
    id: "instagram-process-account",
    retries: 2,
    concurrency: [{ limit: 3 }], // Max 3 accounts processed at once
  },
  { event: "instagram/process-account" },
  async ({ event, step }) => {
    const { settingId, connectionId, userId } = event.data;

    // 1. Fetch settings + connection
    const ctx = await step.run("fetch-context", async () => {
      const { data: settings } = await supabaseAdmin
        .from("auto_reply_settings")
        .select("*")
        .eq("id", settingId)
        .single();

      const { data: connection } = await supabaseAdmin
        .from("social_connections")
        .select("access_token, internal_id, profile_name")
        .eq("id", connectionId)
        .single();

      if (!settings || !connection) throw new Error("Settings or connection not found");

      return { settings, connection };
    });

    const { settings, connection } = ctx;
    const accessToken = connection.access_token;
    const igUserId = connection.internal_id;

    if (!accessToken || !igUserId) {
      throw new Error("Missing access token or IG user ID");
    }

    // 2. Get our username for own-comment detection
    const ownUsername = await step.run("get-own-username", async () => {
      return await getAccountUsername(accessToken, igUserId);
    });

    // 3. Check daily rate limit
    const dailyCount = await step.run("check-daily-limit", async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabaseAdmin
        .from("auto_reply_daily_counts")
        .select("reply_count")
        .eq("connection_id", connectionId)
        .eq("count_date", today)
        .single();

      return data?.reply_count || 0;
    });

    if (dailyCount >= settings.max_replies_per_day) {
      await step.run("log-rate-limited", async () => {
        await supabaseAdmin.from("auto_reply_logs").insert({
          user_id: userId,
          connection_id: connectionId,
          action: "rate_limited",
          metadata: {
            daily_count: dailyCount,
            max: settings.max_replies_per_day,
          },
        });
      });
      return { status: "rate_limited", dailyCount };
    }

    // 4. Fetch recent media
    const media = await step.run("fetch-media", async () => {
      const allMedia = await getInstagramMedia(accessToken, igUserId, 25);

      if (!settings.monitor_all_posts) {
        const { data: monitoredPosts } = await supabaseAdmin
          .from("monitored_posts")
          .select("post_id")
          .eq("connection_id", connectionId)
          .eq("active", true);

        const monitoredIds = new Set(
          (monitoredPosts || []).map((p: any) => p.post_id)
        );
        return allMedia.filter((m) => monitoredIds.has(m.id));
      }

      return allMedia;
    });

    // 5. Fetch templates (sorted by priority DESC)
    const templates = await step.run("fetch-templates", async () => {
      const { data } = await supabaseAdmin
        .from("reply_templates")
        .select("*")
        .eq("connection_id", connectionId)
        .eq("active", true)
        .order("priority", { ascending: false });

      return data || [];
    });

    // 6. Process comments for each post
    let repliesSent = 0;
    let commentsSkipped = 0;
    let currentDailyCount = dailyCount;

    for (const post of media) {
      if (currentDailyCount >= settings.max_replies_per_day) break;

      const comments = await step.run(
        `fetch-comments-${post.id}`,
        async () => {
          try {
            return await getMediaComments(accessToken, post.id);
          } catch (err: any) {
            console.warn(`[AutoReply] Skip media ${post.id}: ${err.message}`);
            return [];
          }
        }
      );

      for (const comment of comments) {
        if (currentDailyCount >= settings.max_replies_per_day) break;

        // Check if already processed
        const alreadyProcessed = await step.run(
          `check-processed-${comment.id}`,
          async () => {
            const { data } = await supabaseAdmin
              .from("processed_comments")
              .select("id")
              .eq("connection_id", connectionId)
              .eq("comment_id", comment.id)
              .single();

            return !!data;
          }
        );

        if (alreadyProcessed) continue;

        // Process this comment
        const processResult = await step.run(`process-comment-${comment.id}`, async () => {
          const commentText = comment.text || "";
          const commentLower = commentText.toLowerCase();

          // Skip own comments
          if (comment.username.toLowerCase() === ownUsername.toLowerCase()) {
            await supabaseAdmin.from("processed_comments").insert({
              user_id: userId,
              connection_id: connectionId,
              post_id: post.id,
              comment_id: comment.id,
              comment_text: commentText,
              commenter_username: comment.username,
              replied: false,
              skipped_reason: "own_comment",
            });
            return { status: "skipped" };
          }

          // Skip if already replied by us (check nested replies)
          if (hasOwnReply(comment, ownUsername)) {
            await supabaseAdmin.from("processed_comments").insert({
              user_id: userId,
              connection_id: connectionId,
              post_id: post.id,
              comment_id: comment.id,
              comment_text: commentText,
              commenter_username: comment.username,
              replied: false,
              skipped_reason: "already_replied",
            });
            return { status: "skipped" };
          }

          // Check blacklist
          const blacklisted = (settings.blacklist_keywords || []).some(
            (kw: string) => commentLower.includes(kw.toLowerCase())
          );
          if (blacklisted) {
            await supabaseAdmin.from("processed_comments").insert({
              user_id: userId,
              connection_id: connectionId,
              post_id: post.id,
              comment_id: comment.id,
              comment_text: commentText,
              commenter_username: comment.username,
              replied: false,
              skipped_reason: "blacklisted",
            });
            await supabaseAdmin.from("auto_reply_logs").insert({
              user_id: userId,
              connection_id: connectionId,
              action: "comment_skipped",
              post_id: post.id,
              comment_id: comment.id,
              comment_text: commentText,
              metadata: { reason: "blacklisted", commenter_username: comment.username },
            });
            return { status: "skipped" };
          }

          // Match template by keywords (priority ordered)
          let matchedTemplate = null;
          for (const template of templates) {
            if (template.is_fallback) continue;
            const keywords: string[] = template.keywords || [];
            if (keywords.length === 0) continue;
            const hasMatch = keywords.some((kw: string) =>
              commentLower.includes(kw.toLowerCase())
            );
            if (hasMatch) {
              matchedTemplate = template;
              break;
            }
          }

          // Fallback template
          if (!matchedTemplate) {
            matchedTemplate = templates.find((t: any) => t.is_fallback) || null;
          }

          // No match at all
          if (!matchedTemplate) {
            await supabaseAdmin.from("processed_comments").insert({
              user_id: userId,
              connection_id: connectionId,
              post_id: post.id,
              comment_id: comment.id,
              comment_text: commentText,
              commenter_username: comment.username,
              replied: false,
              skipped_reason: "no_match",
            });
            return { status: "skipped" };
          }

          // Generate reply
          let replyText: string;
          let aiUsed = false;

          if (matchedTemplate.ai_enabled) {
            replyText = await generateAIReply({
              postCaption: post.caption || "",
              commentText,
              commenterUsername: comment.username,
              aiGuidelines: matchedTemplate.ai_guidelines,
              templateReplyText: matchedTemplate.reply_text,
            });
            aiUsed = true;
          } else {
            replyText = matchedTemplate.reply_text || "Thanks for your comment! 🙌";
          }

          // Random delay for human-like behavior
          const minDelay = settings.min_delay_seconds || 2;
          const maxDelay = settings.max_delay_seconds || 12;
          const delay =
            Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
          await new Promise((resolve) => setTimeout(resolve, delay * 1000));

          // Post the reply
          try {
            const replyId = await replyToComment(accessToken, comment.id, replyText);

            // Success — save everything
            await supabaseAdmin.from("processed_comments").insert({
              user_id: userId,
              connection_id: connectionId,
              post_id: post.id,
              comment_id: comment.id,
              comment_text: commentText,
              commenter_username: comment.username,
              replied: true,
              reply_text: replyText,
              reply_id: replyId,
              template_id: matchedTemplate.id,
            });

            await supabaseAdmin.from("auto_reply_logs").insert({
              user_id: userId,
              connection_id: connectionId,
              action: "reply_sent",
              post_id: post.id,
              comment_id: comment.id,
              comment_text: commentText,
              reply_text: replyText,
              template_name: matchedTemplate.name,
              ai_used: aiUsed,
              metadata: { commenter_username: comment.username },
            });

            // Increment daily counter
            const today = new Date().toISOString().split("T")[0];
            await supabaseAdmin.rpc("increment_counter", {
              p_connection_id: connectionId,
              p_count_date: today,
            }).then(async () => {
              // Fallback if RPC doesn't exist: upsert manually
            }).catch(async () => {
              await supabaseAdmin
                .from("auto_reply_daily_counts")
                .upsert(
                  {
                    connection_id: connectionId,
                    count_date: today,
                    reply_count: currentDailyCount + 1,
                  },
                  { onConflict: "connection_id,count_date" }
                );
            });

            return { status: "replied" };
          } catch (replyError: any) {
            const errMsg = replyError.message || "Unknown error";
            await supabaseAdmin.from("processed_comments").insert({
              user_id: userId,
              connection_id: connectionId,
              post_id: post.id,
              comment_id: comment.id,
              comment_text: commentText,
              commenter_username: comment.username,
              replied: false,
              skipped_reason: `error: ${errMsg}`,
            });
            await supabaseAdmin.from("auto_reply_logs").insert({
              user_id: userId,
              connection_id: connectionId,
              action: "error",
              post_id: post.id,
              comment_id: comment.id,
              comment_text: commentText,
              error_message: errMsg,
              template_name: matchedTemplate.name,
              metadata: { commenter_username: comment.username },
            });
            return { status: "error" };
          }
        });

        if (processResult?.status === "skipped") commentsSkipped++;
        if (processResult?.status === "replied") {
          repliesSent++;
          currentDailyCount++;
        }
      }
    }

    // Polling run logs are no longer saved to auto_reply_logs to reduce noise.
    // We only log successful replies, skips, and errors.

    return {
      status: "complete",
      repliesSent,
      commentsSkipped,
      dailyCount: currentDailyCount,
    };
  }
);
