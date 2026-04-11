import { NextResponse } from 'next/server';

const APIFY_TOKEN = process.env.APIFY_API_TOKEN || '';

// --- HELPER: FALLBACK GENERATOR ---
async function synthesizeFallback(acc: any, baseMultiplier: number) {
  return {
    ...acc,
    stats: {
      subscribers: Math.floor(150000 * baseMultiplier),
      totalVideosPosts: Math.floor(450 * baseMultiplier),
      avgLikes: Math.floor(12000 * baseMultiplier),
      avgComments: Math.floor(800 * baseMultiplier),
      reach: Math.floor(250000 * baseMultiplier),
      engagementRate: parseFloat((Math.random() * 5 + 1).toFixed(2))
    },
    recentContent: Array.from({ length: 6 }).map((_, i) => ({
      date: new Date(Date.now() - (5 - i) * 86400000 * 3).toISOString().split('T')[0],
      engagement: Math.floor(5000 * baseMultiplier * (1 + Math.random()))
    }))
  };
}


// --- 1. INSTAGRAM HANDLER ---
async function fetchApifyInstagram(handle: string) {
  if (!APIFY_TOKEN) return null;
  let username = handle.trim();
  if (username.includes('instagram.com/')) {
    username = username.split('instagram.com/')[1].split('/')[0].split('?')[0];
  }

  const url = `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}`;
  const response = await fetch(url, {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernames: [username] })
  });

  if (!response.ok) return null;
  const data = await response.json();
  if (!data || data.length === 0 || data.error) return null;

  const profile = data[0];
  const posts = profile.latestPosts || [];
  let totalLikes = 0, totalComments = 0, totalViews = 0, viewCount = 0;

  posts.forEach((p: any) => {
    totalLikes += (p.likesCount || 0);
    totalComments += (p.commentsCount || 0);
    if (p.videoViewCount) { totalViews += p.videoViewCount; viewCount++; }
  });

  const avgLikes = posts.length ? Math.floor(totalLikes / posts.length) : 0;
  const avgComments = posts.length ? Math.floor(totalComments / posts.length) : 0;
  const estimatedReach = viewCount > 0 ? Math.floor(totalViews / viewCount) : Math.floor((profile.followersCount || 0) * 0.15);
  const engagementRate = profile.followersCount ? ((avgLikes + avgComments) / profile.followersCount) * 100 : 0;

  return {
    platform: 'Instagram',
    handle: profile.url || handle,
    stats: {
      subscribers: profile.followersCount || 0,
      totalVideosPosts: profile.postsCount || 0,
      avgLikes,
      avgComments,
      reach: estimatedReach,
      engagementRate: parseFloat(engagementRate.toFixed(2))
    },
    recentContent: posts.slice(0, 10).map((p: any) => ({
      title: p.caption ? p.caption.slice(0, 30) + '...' : 'Post',
      views: p.videoViewCount || Math.floor((p.likesCount || 0) * 3),
      likes: p.likesCount || 0,
      comments: p.commentsCount || 0,
      date: p.timestamp ? p.timestamp.split('T')[0] : new Date().toISOString().split('T')[0]
    })).reverse()
  };
}


// --- 2. YOUTUBE HANDLER ---
async function fetchApifyYouTube(handle: string) {
  if (!APIFY_TOKEN) return null;
  // Make sure it's a full URL for the startUrls schema
  const fullUrl = handle.includes('youtube.com') ? handle : `https://www.youtube.com/${handle.startsWith('@') ? '' : '@'}${handle}`;

  const url = `https://api.apify.com/v2/acts/streamers~youtube-channel-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}`;
  const response = await fetch(url, {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ startUrls: [{ url: fullUrl }] })
  });

  if (!response.ok) return null;
  const data = await response.json();
  if (!data || data.length === 0 || data.error) return null;

  const channel = data[0];
  
  // Safely extract potential youtube structural nested paths
  const subs = channel.numberOfSubscribers || channel.subscribersCount || channel.subscriberCount || channel.statistics?.subscriberCount || 0;
  const videos = channel.channelTotalVideos || channel.videosCount || channel.videoCount || channel.statistics?.videoCount || 0;
  const totalViews = channel.channelTotalViews || channel.viewCount || channel.totalViews || channel.statistics?.viewCount || 0;
  
  const estimatedAvgViews = videos > 0 ? Math.floor(totalViews / videos) : 0;
  // YouTube specific engagement rate based on views
  const engagementRate = subs ? (estimatedAvgViews / subs) * 100 : 0;

  return {
    platform: 'YouTube',
    handle: fullUrl,
    stats: {
      subscribers: parseInt(subs, 10) || 0,
      totalVideosPosts: parseInt(videos, 10) || 0,
      avgLikes: Math.floor(estimatedAvgViews * 0.04), // Rule of thumb: likes are typically 4% of views on YT
      avgComments: Math.floor(estimatedAvgViews * 0.005),
      reach: estimatedAvgViews,
      engagementRate: parseFloat(engagementRate.toFixed(2))
    },
    recentContent: [] // Could be populated if actor returns recent videos
  };
}


// --- 3. FACEBOOK HANDLER ---
async function fetchApifyFacebook(handle: string) {
  if (!APIFY_TOKEN) return null;
  const fullUrl = handle.includes('facebook.com') ? handle : `https://www.facebook.com/${handle}`;

  const url = `https://api.apify.com/v2/acts/apify~facebook-pages-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}`;
  const response = await fetch(url, {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ startUrls: [{ url: fullUrl }] })
  });

  if (!response.ok) return null;
  const data = await response.json();
  if (!data || data.length === 0 || data.error) return null;

  const page = data[0];
  const followers = page.followers || page.likes || 0;
  const likes = page.likes || followers;

  return {
    platform: 'Facebook',
    handle: fullUrl,
    stats: {
      subscribers: parseInt(followers, 10) || 0,
      totalVideosPosts: page.posts?.length || 0,
      avgLikes: Math.floor(likes * 0.02),
      avgComments: Math.floor(likes * 0.001),
      reach: Math.floor(followers * 0.05),
      engagementRate: 2.5
    },
    recentContent: []
  };
}


// --- 4. X (TWITTER) HANDLER ---
async function fetchApifyTwitter(handle: string) {
  if (!APIFY_TOKEN) return null;

  // Normalize input so the Apify actor can reliably find the profile.
  // Examples:
  // - "@brand" -> "brand"
  // - "https://x.com/brand" -> "brand"
  // - "brand" -> "brand"
  let username = handle.trim();
  if (username.includes('x.com/') || username.includes('twitter.com/')) {
    username = username.split('.com/')[1].split('/')[0].split('?')[0];
  }
  username = username.replace(/^@/, '');

  function toNumber(val: any): number {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
    if (typeof val === 'string') {
      const cleaned = val.replace(/,/g, '').replace(/[^\d.]/g, '');
      const num = parseFloat(cleaned);
      return Number.isFinite(num) ? num : 0;
    }
    if (typeof val === 'object' && typeof val?.count !== 'undefined') {
      return toNumber(val.count);
    }
    return 0;
  }

  function firstDefined(...vals: any[]) {
    return vals.find(v => v !== null && v !== undefined);
  }

  const url = `https://api.apify.com/v2/acts/quacker~twitter-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}`;

  // Using Quacker's twitter scraper as it's the most reliable public one.
  // Correct input keys per Apify: `userName` and/or `url`.
  let datasetItems: any = null;
  let lastFailure: string | null = null;

  const xUrl = `https://x.com/${username}`;
  const twitterUrl = `https://twitter.com/${username}`;

  // Apify actors commonly accept `startUrls` (list of URLs to scrape).
  // We try multiple input shapes since Quacker actors have had schema changes over time.
  const inputVariants = [
    { startUrls: [{ url: xUrl }] },
    { startUrls: [{ url: twitterUrl }] },
    { urls: [xUrl] },
    { urls: [twitterUrl] },
    { url: xUrl },
    { url: twitterUrl },
    { userName: username, url: xUrl },
    { userName: `@${username}`, url: xUrl },
    { userName: username },
  ];

  for (const input of inputVariants) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        });

        if (!response.ok) {
          lastFailure = `Apify X request failed: ${response.status} ${response.statusText}`;
          continue;
        }

        const data = await response.json();
        if (!data) continue;

        if (Array.isArray(data)) {
          if (data.length === 0) continue;
          datasetItems = data;
          break;
        }

        if (typeof data === 'object') {
          datasetItems = [data];
          break;
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        lastFailure = msg || 'fetch failed';
      }
    }
    if (datasetItems) break;
  }

  if (!datasetItems || !Array.isArray(datasetItems) || datasetItems.length === 0) {
    return {
      platform: 'X',
      handle: `https://x.com/${username}`,
      error: `Apify X scrape failed${lastFailure ? `: ${lastFailure}` : ''}`,
      stats: {
        subscribers: 0,
        totalVideosPosts: 0,
        avgLikes: 0,
        avgComments: 0,
        reach: 0,
        engagementRate: 0
      },
      recentContent: []
    };
  }

  const raw = datasetItems[0];
  const user = raw.user || raw;
  const legacy = user?.legacy;

  // Apify/Quacker payload shape can vary a lot. Try multiple common keys/paths.
  const followersVal = firstDefined(
    // raw top-level
    raw.followers_count,
    raw.followersCount,
    raw.followers_total,
    raw.follower_count,
    raw.followerCount,
    raw.followers,
    // `user` level
    user?.followers_count,
    user?.followersCount,
    user?.followers_total,
    user?.follower_count,
    user?.followerCount,
    user?.followers,
    // legacy (often comes as numbers/strings)
    legacy?.followers_count,
    legacy?.followersCount,
    legacy?.followers_total,
    legacy?.follower_count,
    legacy?.followerCount,
    legacy?.followers,
    // public_metrics
    user?.public_metrics?.followers_count,
    user?.publicMetrics?.followers_count,
    user?.public_metrics?.followersCount,
    user?.publicMetrics?.followersCount
  );

  const tweetsVal = firstDefined(
    // raw top-level
    raw.statuses_count,
    raw.statusesCount,
    raw.tweets_count,
    raw.tweetsCount,
    raw.tweets_total,
    raw.statuses_total,
    // `user` level
    user?.statuses_count,
    user?.statusesCount,
    user?.tweets_count,
    user?.tweetsCount,
    user?.tweets_total,
    user?.statuses_total,
    // legacy
    legacy?.statuses_count,
    legacy?.statusesCount,
    legacy?.tweets_count,
    legacy?.tweetsCount,
    legacy?.tweets_total,
    legacy?.statuses_total,
    // public_metrics
    user?.public_metrics?.statuses_count,
    user?.publicMetrics?.statuses_count,
    user?.public_metrics?.statusesCount,
    user?.publicMetrics?.statusesCount
  );

  function findFirstNumberByKeyRegex(obj: any, keyRegex: RegExp, maxDepth = 4): number | undefined {
    const isObject = (v: any) => v !== null && typeof v === 'object';
    const visited = new Set<any>();

    function walk(v: any, depth: number): number | undefined {
      if (!isObject(v) || depth > maxDepth) return undefined;
      if (visited.has(v)) return undefined;
      visited.add(v);

      if (Array.isArray(v)) {
        for (const item of v) {
          const found = walk(item, depth + 1);
          if (typeof found === 'number') return found;
        }
        return undefined;
      }

      for (const [k, val] of Object.entries(v)) {
        if (keyRegex.test(k)) {
          if (val !== null && val !== undefined) {
            const n = toNumber(val);
            if (Number.isFinite(n)) return n;
          }
        }
        const nested = walk(val, depth + 1);
        if (typeof nested === 'number') return nested;
      }
      return undefined;
    }

    return walk(obj, 0);
  }

  const isNullish = (v: any) => v === null || v === undefined;

  // If we couldn't find the follower/tweets fields at all, try a generic nested-key search.
  let resolvedFollowersVal = followersVal;
  let resolvedTweetsVal = tweetsVal;

  if (isNullish(resolvedFollowersVal)) {
    const found = findFirstNumberByKeyRegex(raw, /(follower|followers|follower_count|followerCount)/i);
    if (!isNullish(found)) resolvedFollowersVal = found;
  }
  if (isNullish(resolvedTweetsVal)) {
    const found = findFirstNumberByKeyRegex(raw, /(statuses|status|tweets|tweets_count|statuses_count|tweetCount|statusesCount)/i);
    if (!isNullish(found)) resolvedTweetsVal = found;
  }

  // If the actor response doesn't contain follower fields, return an error so we don't overwrite with 0.
  if (isNullish(resolvedFollowersVal)) {
    console.warn('[X_SCRAPE_MISSING_FOLLOWERS]', {
      username,
      rawTopKeys: raw && typeof raw === 'object' ? Object.keys(raw) : [],
      userTopKeys: user && typeof user === 'object' ? Object.keys(user) : [],
      apifyError: raw?.error,
    });
    return {
      platform: 'X',
      handle: `https://x.com/${username}`,
      error: raw?.error ? String(raw.error) : 'Apify X actor did not return follower counts in expected fields',
      stats: {
        subscribers: 0,
        totalVideosPosts: 0,
        avgLikes: 0,
        avgComments: 0,
        reach: 0,
        engagementRate: 0
      },
      recentContent: []
    };
  }

  const followers = toNumber(resolvedFollowersVal);
  const tweets = toNumber(resolvedTweetsVal);

  return {
    platform: 'X',
    handle: `https://x.com/${username}`,
    stats: {
      subscribers: Number(followers) || 0,
      totalVideosPosts: Number(tweets) || 0,
      avgLikes: Math.floor((followers || 0) * 0.01),
      avgComments: Math.floor((followers || 0) * 0.001),
      reach: Math.floor((followers || 0) * 0.10),
      engagementRate: 1.0
    },
    recentContent: []
  };
}

// --- 5. LINKEDIN HANDLER ---
async function fetchApifyLinkedIn(handle: string) {
  if (!APIFY_TOKEN) return null;
  const fullUrl = handle.includes('linkedin.com') ? handle : `https://www.linkedin.com/company/${handle}`;

  const url = `https://api.apify.com/v2/acts/apify~linkedin-company-profile-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}`;
  const response = await fetch(url, {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urls: [fullUrl] })
  });

  if (!response.ok) return null;
  const data = await response.json();
  if (!data || data.length === 0 || data.error) return null;

  const company = data[0];
  const followers = company.followerCount || company.followers || 0;

  return {
    platform: 'LinkedIn',
    handle: fullUrl,
    stats: {
      subscribers: parseInt(followers, 10) || 0,
      totalVideosPosts: company.updates?.length || 0,
      avgLikes: Math.floor((followers || 0) * 0.03),
      avgComments: Math.floor((followers || 0) * 0.005),
      reach: Math.floor((followers || 0) * 0.08),
      engagementRate: 3.5
    },
    recentContent: []
  };
}

// ==========================================
// UNIVERSAL PLATFORM ROUTER MAP
// ==========================================
// Maps the exact exact platform string to its async handler
const SCRAPER_MAP: Record<string, (url: string) => Promise<any>> = {
  'Instagram': fetchApifyInstagram,
  'YouTube': fetchApifyYouTube,
  'Facebook': fetchApifyFacebook,
  'X': fetchApifyTwitter,
  'LinkedIn': fetchApifyLinkedIn
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category = ['general'], accounts, strictRealData = false } = body;

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({ error: 'At least one valid social account is required' }, { status: 400 });
    }

    const hash = name.split('').reduce((a: number, b: string) => a + b.charCodeAt(0), 0);
    const analyzedAccounts = [];

    // Loop through each requested platform (e.g. YouTube, Instagram simultaneously)
    for (let i = 0; i < accounts.length; i++) {
      const acc = accounts[i];
      const baseMultiplier = 1 + ((hash % 10) / 10) + (i * 0.2);
      
      const scraperFn = SCRAPER_MAP[acc.platform];
      let realData = null;

      if (scraperFn) {
        try {
          // Attempt to fetch real Apify data via the mapped actor
          realData = await scraperFn(acc.handle);
          
          // SAFETY GUARD: If the scraper returned data but entirely failed to map ANYTHING 
          // (all stats are 0), this signals a schema mismatch. Drop to fallback.
          if (realData) {
            const stats = realData.stats;
            const allZero = stats.subscribers === 0 && stats.totalVideosPosts === 0 
              && stats.avgLikes === 0 && stats.reach === 0;
            // X accounts can legitimately have 0 followers/posts (e.g. brand new profiles),
            // so do not treat an all-zero payload as a schema failure for X.
            if (allZero && acc.platform !== 'LinkedIn' && acc.platform !== 'X') {
              console.warn(`[ROUTER] Schema for ${acc.platform} returned ALL ZEROS. Dropping to fallback.`);
              realData = null;
            }
          }
        } catch (e) {
          console.error(`Scraper failed for ${acc.platform}:`, e);
          // Fails safely, realData remains null
        }
      }
      
      // If the targeted Apify actor succeeds and returns data, push it to the frontend!
      if (realData) {
        analyzedAccounts.push(realData);
      } else if (acc.platform === 'LinkedIn') {
        // If LinkedIn fails (e.g. Apify paywall or blocked proxy), do NOT synthesize realistic fallback data.
        // Return explicit 0s so the user visually sees the scrape was blocked and requires a subscription.
        analyzedAccounts.push({
          platform: 'LinkedIn',
          handle: acc.handle,
          error: 'Apify Actor Subscription Required',
          stats: {
            subscribers: 0,
            totalVideosPosts: 0,
            avgLikes: 0,
            avgComments: 0,
            reach: 0,
            engagementRate: 0
          },
          recentContent: []
        });
      } else if (strictRealData || acc.platform !== 'LinkedIn') {
        // For this competitor analysis flow, we do NOT want synthetic/fake numbers.
        // If scraping fails, return an error payload and let the UI keep the previous values.
        analyzedAccounts.push({
          platform: acc.platform,
          handle: acc.handle,
          error: 'Live scrape unavailable',
          stats: {
            subscribers: 0,
            totalVideosPosts: 0,
            avgLikes: 0,
            avgComments: 0,
            reach: 0,
            engagementRate: 0
          },
          recentContent: []
        });
      } else {
        // LinkedIn failure without strict mode: keep existing explicit 0s behaviour.
        analyzedAccounts.push({
          platform: 'LinkedIn',
          handle: acc.handle,
          error: 'Apify Actor Subscription Required',
          stats: {
            subscribers: 0,
            totalVideosPosts: 0,
            avgLikes: 0,
            avgComments: 0,
            reach: 0,
            engagementRate: 0
          },
          recentContent: []
        });
      }
    }

    const safeId = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const initials = name.substring(0, 2).toUpperCase();
    
    const newCompetitor = {
      id: safeId,
      name,
      category,
      avatarInitials: initials,
      avatarColor: '#' + Math.floor(Math.random()*16777215).toString(16).padEnd(6, '0'),
      isOurs: false,
      accounts: analyzedAccounts
    };

    return NextResponse.json(newCompetitor);

  } catch (error) {
    console.error('API Error during Universal Analysis:', error);
    return NextResponse.json({ error: 'Failed to complete unified competitor analysis' }, { status: 500 });
  }
}
