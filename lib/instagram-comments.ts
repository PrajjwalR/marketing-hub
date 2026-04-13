/**
 * Instagram Graph API — Comment Management Helpers
 *
 * Uses the Instagram Graph API (via Facebook Graph) to:
 * - Fetch recent media for an IG Business Account
 * - Fetch comments on media
 * - Reply to comments
 *
 * Required permission: instagram_manage_comments (already in OAuth flow)
 */

const GRAPH_API_VERSION = "v21.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

export interface IGMedia {
  id: string;
  caption?: string;
  timestamp: string;
  media_type: string;
  permalink?: string;
}

export interface IGComment {
  id: string;
  text: string;
  username: string;
  timestamp: string;
  replies?: { data: IGComment[] };
}

/**
 * Fetch the Instagram Business Account's username (used to detect own comments).
 */
export async function getAccountUsername(
  accessToken: string,
  igUserId: string
): Promise<string> {
  const res = await fetch(
    `${GRAPH_BASE}/${igUserId}?fields=username&access_token=${accessToken}`
  );
  const data = await res.json();
  if (data.error) {
    throw new Error(
      `Failed to get IG username: ${data.error.message}`
    );
  }
  return data.username || "";
}

/**
 * Fetch recent media (posts) for an IG Business Account.
 * Returns up to `limit` posts, most recent first.
 */
export async function getInstagramMedia(
  accessToken: string,
  igUserId: string,
  limit: number = 25
): Promise<IGMedia[]> {
  const fields = "id,caption,timestamp,media_type,permalink";
  const res = await fetch(
    `${GRAPH_BASE}/${igUserId}/media?fields=${fields}&limit=${limit}&access_token=${accessToken}`
  );
  const data = await res.json();

  if (data.error) {
    throw new Error(
      `Failed to fetch IG media: ${data.error.message} (code ${data.error.code})`
    );
  }

  return (data.data || []) as IGMedia[];
}

/**
 * Fetch comments on a specific Instagram media object.
 * Also fetches nested replies so we can detect our own replies.
 */
export async function getMediaComments(
  accessToken: string,
  mediaId: string
): Promise<IGComment[]> {
  const fields =
    "id,text,username,timestamp,replies{id,text,username,timestamp}";
  const res = await fetch(
    `${GRAPH_BASE}/${mediaId}/comments?fields=${fields}&access_token=${accessToken}`
  );
  const data = await res.json();

  if (data.error) {
    // Some media types (e.g. stories) don't support comments
    if (
      data.error.code === 100 &&
      data.error.error_subcode === 33
    ) {
      return [];
    }
    throw new Error(
      `Failed to fetch comments for ${mediaId}: ${data.error.message}`
    );
  }

  return (data.data || []) as IGComment[];
}

/**
 * Reply to a specific comment on an Instagram post.
 * Uses POST /{comment-id}/replies endpoint.
 *
 * @returns The created reply's ID
 */
export async function replyToComment(
  accessToken: string,
  commentId: string,
  message: string
): Promise<string> {
  const res = await fetch(`${GRAPH_BASE}/${commentId}/replies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      access_token: accessToken,
    }),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    const errMsg =
      data.error?.message || `Reply failed (${res.status})`;

    // Handle specific Instagram errors gracefully
    if (
      data.error?.code === 10 ||
      errMsg.includes("limited who can reply")
    ) {
      throw new Error(`REPLY_RESTRICTED: ${errMsg}`);
    }

    throw new Error(errMsg);
  }

  return data.id;
}

/**
 * Check if a comment has already been replied to by our account.
 * Looks through the comment's nested replies for our username.
 */
export function hasOwnReply(
  comment: IGComment,
  ownUsername: string
): boolean {
  if (!comment.replies?.data) return false;
  return comment.replies.data.some(
    (reply) =>
      reply.username.toLowerCase() === ownUsername.toLowerCase()
  );
}
