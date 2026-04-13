"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  PhotoshootGenerationCard,
  formatFileTitleFromLabel,
  PHOTOSHOOT_GENERATIONS_GRID_CLASS,
} from "@/components/AI_photoshoot/PhotoshootGenerationCard";

const STUDIO_HREF = "/dashboard/ai-photoshoot/studio";

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
  image_count: number;
  preview_url: string | null;
  images?: { url: string; label: string }[];
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

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-[#F5F0E8] pb-16">
      <div className="relative z-10 mx-auto max-w-[1400px] px-4 pt-8 sm:px-6 lg:px-8">
        {/* Header row */}
        <div className="mb-10 flex flex-col gap-6 border-b border-zinc-200/80 pb-8 lg:flex-row lg:items-end lg:justify-between">
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

        {!loading && !error && sessions.length === 0 && (
          <div className="rounded-3xl border border-zinc-200 bg-white p-12 text-center shadow-sm">
            <p className="text-lg font-semibold text-zinc-900">
              No generations yet
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-600">
              Open Studio to run a virtual photoshoot — when you&apos;re signed in,
              results save here automatically.
            </p>
            <Link
              href={STUDIO_HREF}
              className="mt-8 inline-flex h-11 items-center justify-center rounded-full border border-[#E0B428] bg-[#F5C842] px-8 text-sm font-bold text-zinc-900 transition hover:bg-[#E0B428]"
            >
              Open Studio
            </Link>
          </div>
        )}

        {!loading && sessions.length > 0 && (
          <div className={PHOTOSHOOT_GENERATIONS_GRID_CLASS}>
            {sessions.map((s) => {
              const coverUrl = getSessionCoverUrl(s);
              const firstLabel = s.images?.[0]?.label?.trim() || "Cover";
              const fileTitle = formatFileTitleFromLabel(firstLabel);
              const headline = `${s.model_name || "Session"} · ${s.jewelry_type}`;
              const description =
                s.model_style?.trim() ||
                `Generated ${format(new Date(s.created_at), "MMM d, yyyy")} · open to see all ${s.image_count} image${s.image_count === 1 ? "" : "s"}.`;
              const tags = `${s.jewelry_type.toLowerCase()}, session ${s.run_session_id.slice(0, 8)}…`;
              return (
                <PhotoshootGenerationCard
                  key={s.id}
                  href={`/dashboard/ai-photoshoot/generations/${s.id}`}
                  imageUrl={coverUrl}
                  fileTitle={fileTitle}
                  headline={headline}
                  description={description}
                  tags={tags}
                  imageCountBadge={s.image_count}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
