import { supabaseAdmin } from "./supabase";

interface InstagramPublishParams {
    connectionId: string;
    text: string;
    mediaUrl?: string | null;
    mediaUrls?: string[]; // Support for multiple media
}

/**
 * Error from the Graph API, keeping Meta's error code so callers can tell an
 * expired/revoked token (190) apart from a bad media URL etc.
 */
class InstagramApiError extends Error {
    code?: number;
    constructor(message: string, code?: number) {
        super(message);
        this.code = code;
    }
}

function graphError(data: { error?: { message?: string; code?: number } } | null, fallback: string) {
    return new InstagramApiError(data?.error?.message || fallback, data?.error?.code);
}

/**
 * Helper to check if a URL is likely a video
 */
function checkIsVideo(url: string): boolean {
    // Rely on file extensions. Avoid broad 'supabase' or 'inngest' checks that catch images.
    return !!url.match(/\.(mp4|mov|avi|wmv|flv|mkv|webm)($|\?)/i);
}

/**
 * Helper to create a media container (item or standalone)
 */
async function createContainer(
    igUserId: string,
    accessToken: string,
    params: {
        caption?: string;
        mediaUrl: string;
        isVideo: boolean;
        isCarouselItem?: boolean;
    }
) {
    const containerUrl = `https://graph.facebook.com/v21.0/${igUserId}/media`;
    
    const containerParams: any = {
        access_token: accessToken,
    };

    if (params.caption) {
        containerParams.caption = params.caption;
    }

    if (params.isCarouselItem) {
        containerParams.is_carousel_item = true;
    }

    if (params.isVideo) {
        // Standalone videos must be REELS. Carousel video items use VIDEO media_type.
        containerParams.media_type = params.isCarouselItem ? 'VIDEO' : 'REELS';
        containerParams.video_url = params.mediaUrl;
    } else {
        containerParams.image_url = params.mediaUrl;
    }

    const res = await fetch(containerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(containerParams)
    });

    const data = await res.json();
    if (!res.ok) {
        console.error("[Instagram] Container Error:", data);
        throw graphError(data, "Failed to create Instagram container");
    }

    return data.id;
}

/**
 * Helper to poll container status
 */
async function pollStatus(accessToken: string, creationId: string) {
    // Serverless-friendly polling. Total budget ≈ 45s so we stay well within
    // Vercel's 60s Hobby / 300s Pro function timeout even with other work.
    // Poll every 3s for the first 30s, then every 5s for another 15s.
    let status = 'IN_PROGRESS';
    let attempts = 0;
    const maxAttempts = 13;

    while (status !== 'FINISHED' && attempts < maxAttempts) {
        if (attempts > 0) {
            const delay = attempts < 10 ? 3000 : 5000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        const res = await fetch(`https://graph.facebook.com/v21.0/${creationId}?fields=status_code,status&access_token=${accessToken}`);
        const data = await res.json();

        if (res.ok) {
            status = data.status_code;
            console.log(`[Instagram] Container ${creationId} status (attempt ${attempts + 1}):`, status);
        } else {
            console.warn("[Instagram] Status check failed:", data);
            if (data?.error?.code === 190) throw graphError(data, 'Instagram access token is invalid');
        }

        if (status === 'ERROR') {
            // `status` carries Meta's reason, e.g. "Error: Media type is not supported".
            throw new Error(`Instagram could not process the media${data.status ? `: ${data.status}` : ''}`);
        }

        attempts++;
    }

    if (status !== 'FINISHED') {
        throw new Error(`Media processing timed out after ${attempts} attempts`);
    }
}

/**
 * Publish a post to Instagram (Single Image, Reel, or Carousel).
 */
export async function publishToInstagram({ connectionId, text, mediaUrl, mediaUrls }: InstagramPublishParams) {
    console.log('[Instagram] Starting publish flow for connection:', connectionId);

    // Normalize media to an array
    const urls = mediaUrls && mediaUrls.length > 0 ? mediaUrls : (mediaUrl ? [mediaUrl] : []);
    
    if (urls.length === 0) {
        throw new Error("Media URL is required for Instagram posts");
    }

    // 1. Fetch connection details
    const { data: connection, error } = await supabaseAdmin
        .from('social_connections')
        .select('access_token, internal_id, profile_name')
        .eq('id', connectionId)
        .eq('platform', 'instagram')
        .single();

    if (error || !connection) {
        throw new Error(`Instagram account is no longer connected. Reconnect it in Settings → Social, then reschedule this post.`);
    }

    const { access_token: accessToken, internal_id: igUserId, profile_name: profileName } = connection;

    if (!accessToken || !igUserId) {
        throw new Error("Instagram connection is incomplete. Reconnect it in Settings → Social, then reschedule this post.");
    }

    try {
        return await publishMedia(igUserId, accessToken, text, urls);
    } catch (err) {
        if (err instanceof InstagramApiError && err.code === 190) {
            // Token expired or revoked (password change, Meta security reset, app removed).
            // Flag the connection so the UI shows it needs reconnecting instead of "connected".
            await supabaseAdmin
                .from('social_connections')
                .update({ status: 'error' })
                .eq('id', connectionId);
            throw new Error(`Instagram connection${profileName ? ` for @${profileName}` : ''} has expired or was revoked by Meta. Reconnect it in Settings → Social, then reschedule this post.`);
        }
        throw err;
    }
}

async function publishMedia(igUserId: string, accessToken: string, text: string, urls: string[]) {
    let finalCreationId: string;

    if (urls.length === 1) {
        // --- SINGLE POST FLOW ---
        const url = urls[0];
        const isVideo = checkIsVideo(url);
        
        console.log(`[Instagram] Creating single ${isVideo ? 'Reel' : 'Image'} container...`);
        finalCreationId = await createContainer(igUserId, accessToken, {
            caption: text,
            mediaUrl: url,
            isVideo
        });

        await pollStatus(accessToken, finalCreationId);
    } else {
        // --- CAROUSEL FLOW ---
        console.log(`[Instagram] Creating carousel with ${urls.length} items...`);
        
        // Step 1: Create containers for each item
        const itemIds = [];
        for (const url of urls) {
            const isVideo = checkIsVideo(url);
            const itemId = await createContainer(igUserId, accessToken, {
                mediaUrl: url,
                isVideo,
                isCarouselItem: true
            });
            itemIds.push({ id: itemId, isVideo });
        }

        // Step 2: Poll status for each item (especially videos)
        for (const item of itemIds) {
            if (item.isVideo) {
                console.log(`[Instagram] Waiting for carousel video item ${item.id}...`);
                await pollStatus(accessToken, item.id);
            }
        }

        // Step 3: Create parent carousel container
        const parentUrl = `https://graph.facebook.com/v21.0/${igUserId}/media`;
        const parentRes = await fetch(parentUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                access_token: accessToken,
                caption: text,
                media_type: 'CAROUSEL',
                children: itemIds.map(i => i.id)
            })
        });

        const parentData = await parentRes.json();
        if (!parentRes.ok) {
            console.error("[Instagram] Carousel Parent Error:", parentData);
            throw graphError(parentData, "Failed to create carousel container");
        }

        finalCreationId = parentData.id;
        console.log('[Instagram] Carousel container created:', finalCreationId);
        
        // Polling parent status is usually fast but recommended
        await pollStatus(accessToken, finalCreationId);
    }

    // 4. Publish Final Container
    console.log('[Instagram] Publishing...');
    const publishUrl = `https://graph.facebook.com/v21.0/${igUserId}/media_publish`;
    const publishRes = await fetch(publishUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            access_token: accessToken,
            creation_id: finalCreationId
        })
    });

    const publishData = await publishRes.json();
    if (!publishRes.ok) {
        console.error("[Instagram] Publish Error:", publishData);
        throw graphError(publishData, "Failed to publish");
    }

    console.log('[Instagram] Successfully published! ID:', publishData.id);

    return {
        success: true,
        postId: publishData.id,
        platform: 'instagram'
    };
}

