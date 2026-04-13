"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Loader2, Sparkles, Camera, Film, Download } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  PhotoshootGenerationCard,
  formatFileTitleFromLabel,
  PHOTOSHOOT_GENERATIONS_GRID_CLASS,
} from "@/components/AI_photoshoot/PhotoshootGenerationCard";

const STUDIO_HREF = "/dashboard/ai-photoshoot/studio";

type ActiveTab = "photos" | "videos";

/** Rotates on full page refresh (new mount). */
const CATCHY_PHRASES = [
  "Every frame tells your brand story — mood, light, and message in sync.",
  "Fresh drops, same polish. Your catalog deserves runway energy.",
  "Turn uploads into campaign-ready visuals in one sitting.",
  "Where craft meets algorithm — shine that feels intentional.",
  "Lighting, pose, and detail — tuned for scroll-stopping feeds.",
  "Built for makers who want luxury looks without the studio bill.",
  "From raw shot to retail-ready — faster than your next coffee.",
  "Consistency is the real flex. We help you keep it effortless.",
];

type SessionSummary = {
  id: string;
  run_session_id: string;
  model_name: string | null;
  model_style: string | null;
  jewelry_type: string;
  generation_mode: "photo" | "video";
  image_count: number;
  preview_url: string | null;
  images?: { url: string; label: string }[];
  video_url?: string | null;
  created_at: string;
};

/** One cover image per session (first / preview). */
function getSessionCoverUrl(s: SessionSummary): string | null {
  if (s.preview_url) return s.preview_url;
  const first = s.images?.[0];
  return first?.url ?? null;
}

export default function AiPhotoshootGenerationsPage() {
  const { getIdToken, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("photos");

  const catchyPhrase = useMemo(
    () =>
      CATCHY_PHRASES[Math.floor(Math.random() * CATCHY_PHRASES.length)] ??
      CATCHY_PHRASES[0],
    []
  );

  const load = useCallback(async () => {
    setError(null);
    const token = await getIdToken();
    if (!token) {
      setSessions([]);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/AI-photoshoot/sessions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [getIdToken]);

  useEffect(() => {
    if (authLoading) return;
    load();
  }, [authLoading, load]);

  const photoSessions = useMemo(
    () => sessions.filter((s) => s.generation_mode === "photo"),
    [sessions]
  );
  const videoSessions = useMemo(
    () => sessions.filter((s) => s.generation_mode === "video"),
    [sessions]
  );

  const activeSessions = activeTab === "photos" ? photoSessions : videoSessions;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-[#F5F0E8] pb-16">
      <div className="relative z-10 mx-auto max-w-[1400px] px-4 pt-8 sm:px-6 lg:px-8">
        {/* Header row */}
        <div className="mb-8 flex flex-col gap-6 border-b border-zinc-200/80 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              AI Photoshoot
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
              Recently generated
            </h1>
            <p className="mt-3 text-base italic leading-relaxed text-[#EA580C] sm:text-lg">
              {catchyPhrase}
            </p>
          </div>
          <Link
            href={STUDIO_HREF}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-full border border-[#E0B428] bg-[#F5C842] px-6 text-sm font-bold text-zinc-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-[#E0B428] lg:self-auto"
          >
            <Sparkles className="h-4 w-4" />
            Generate more
          </Link>
        </div>

        {/* ─── Photos / Videos tab toggle ───────────────────────────── */}
        <div className="mb-6 flex items-center gap-1 rounded-full bg-white/70 border border-zinc-200/90 p-1 w-fit backdrop-blur-sm shadow-sm">
          <TabButton
            id="tab-photos"
            active={activeTab === "photos"}
            icon={<Camera className="h-3.5 w-3.5" />}
            label="Photos"
            count={photoSessions.length}
            onClick={() => setActiveTab("photos")}
          />
          <TabButton
            id="tab-videos"
            active={activeTab === "videos"}
            icon={<Film className="h-3.5 w-3.5" />}
            label="Videos"
            count={videoSessions.length}
            onClick={() => setActiveTab("videos")}
          />
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-zinc-500">
            <Loader2 className="h-8 w-8 animate-spin text-[#F97316]" />
            <span className="text-sm font-medium">Loading your generations…</span>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {!loading && !error && activeSessions.length === 0 && (
          <div className="rounded-3xl border border-zinc-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100">
              {activeTab === "photos" ? (
                <Camera className="h-7 w-7 text-zinc-400" />
              ) : (
                <Film className="h-7 w-7 text-zinc-400" />
              )}
            </div>
            <p className="text-lg font-semibold text-zinc-900">
              {activeTab === "photos"
                ? "No photos yet"
                : "No videos yet"}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-600">
              {activeTab === "photos"
                ? "Open Studio to run a virtual photoshoot — when you're signed in, results save here automatically."
                : "Switch to Video mode in Studio to generate a luxury jewelry video ad — results will appear here."}
            </p>
            <Link
              href={STUDIO_HREF}
              className="mt-8 inline-flex h-11 items-center justify-center rounded-full border border-[#E0B428] bg-[#F5C842] px-8 text-sm font-bold text-zinc-900 transition hover:bg-[#E0B428]"
            >
              Open Studio
            </Link>
          </div>
        )}

        {/* ─── Photo grid ───────────────────────────────────────────── */}
        {!loading && activeTab === "photos" && photoSessions.length > 0 && (
          <div className={PHOTOSHOOT_GENERATIONS_GRID_CLASS}>
            {photoSessions.map((s) => {
              const coverUrl = getSessionCoverUrl(s);
              const firstLabel = s.images?.[0]?.label?.trim() || "Cover";
              const fileTitle = formatFileTitleFromLabel(firstLabel);
              const headline = `${s.model_name || "Session"} · ${s.jewelry_type}`;
              const description =
                s.model_style?.trim() ||
                `Generated ${format(new Date(s.created_at), "MMM d, yyyy")} · ${s.image_count} image${s.image_count === 1 ? "" : "s"}.`;
              const tags = `${s.jewelry_type.toLowerCase()}, ${format(new Date(s.created_at), "MMM d")}`;
              return (
                <PhotoshootGenerationCard
                  key={s.id}
                  href={`/dashboard/ai-photoshoot/generations/${s.id}`}
                  imageUrl={coverUrl}
                  headline={headline}
                  description={description}
                  tags={tags}
                  imageCountBadge={s.image_count}
                />
              );
            })}
          </div>
        )}

        {/* ─── Video grid ───────────────────────────────────────────── */}
        {!loading && activeTab === "videos" && videoSessions.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {videoSessions.map((s) => (
              <VideoSessionCard key={s.id} session={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* SUB-COMPONENTS                                                           */
/* ────────────────────────────────────────────────────────────────────────── */

function TabButton({
  id,
  active,
  icon,
  label,
  count,
  onClick,
}: {
  id: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-300 ${
        active
          ? "bg-zinc-900 text-white shadow-md"
          : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100/80"
      }`}
    >
      {icon}
      <span>{label}</span>
      {count > 0 && (
        <span
          className={`ml-0.5 rounded-full px-1.5 py-[1px] text-[10px] font-bold tabular-nums ${
            active
              ? "bg-white/20 text-white"
              : "bg-zinc-200/80 text-zinc-500"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function VideoSessionCard({ session: s }: { session: SessionSummary }) {
  const headline = `${s.model_name || "Session"} · ${s.jewelry_type}`;
  const dateStr = format(new Date(s.created_at), "MMM d, yyyy");
  const description = s.model_style?.trim() || `Generated ${dateStr}`;

  return (
    <Link
      href={`/dashboard/ai-photoshoot/generations/${s.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200/90 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#E0B428] hover:shadow-md hover:ring-1 hover:ring-[#F5C842]/80"
    >
      {/* Video thumbnail / player preview */}
      <div className="relative aspect-[9/16] max-h-56 w-full overflow-hidden bg-zinc-900">
        {s.video_url ? (
          <video
            src={s.video_url}
            muted
            playsInline
            preload="metadata"
            onMouseEnter={(e) => {
              const v = e.currentTarget;
              v.currentTime = 0;
              v.play().catch(() => {});
            }}
            onMouseLeave={(e) => {
              e.currentTarget.pause();
              e.currentTarget.currentTime = 0;
            }}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2">
            <Film className="h-8 w-8 text-zinc-600" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              No preview
            </span>
          </div>
        )}

        {/* "Video" badge */}
        <span className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-full bg-zinc-900/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
          <Film className="h-2.5 w-2.5" />
          Video
        </span>

        {/* Download button on hover */}
        {s.video_url && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const a = document.createElement("a");
              a.href = s.video_url!;
              a.download = `jewelry-video-${s.id.slice(0, 8)}.mp4`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}
            className="absolute bottom-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white opacity-0 backdrop-blur-sm transition-all hover:bg-white/25 group-hover:opacity-100"
            title="Download video"
            aria-label="Download video"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="truncate text-[9px] font-bold uppercase tracking-[0.12em] text-[#EA580C]">
          AI VIDEO
        </p>
        <p className="line-clamp-1 text-xs font-bold leading-snug text-zinc-900">
          {headline}
        </p>
        <p className="line-clamp-1 text-[11px] leading-snug text-zinc-600">
          {description}
        </p>
        <p className="mt-auto truncate pt-0.5 text-[10px] italic text-zinc-500">
          {s.jewelry_type.toLowerCase()}, {format(new Date(s.created_at), "MMM d")}
        </p>
      </div>
    </Link>
  );
}
