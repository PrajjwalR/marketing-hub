"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  PhotoshootGenerationCard,
  formatFileTitleFromLabel,
  PHOTOSHOOT_GENERATIONS_GRID_CLASS,
} from "@/components/AI_photoshoot/PhotoshootGenerationCard";

const STUDIO_HREF = "/dashboard/ai-photoshoot/studio";

type SessionRow = {
  id: string;
  run_session_id: string;
  model_id: string | null;
  model_name: string | null;
  model_style: string | null;
  jewelry_type: string;
  images: { url: string; label: string }[];
  created_at: string;
};

export default function AiPhotoshootGenerationDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { getIdToken, loading: authLoading } = useAuth();
  const [session, setSession] = useState<SessionRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setError(null);
    const token = await getIdToken();
    if (!token) {
      setSession(null);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/AI-photoshoot/sessions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setSession(data.session);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, [id, getIdToken]);

  useEffect(() => {
    if (authLoading || !id) return;
    load();
  }, [authLoading, id, load]);

  const images =
    session?.images && Array.isArray(session.images) ? session.images : [];

  const headline =
    session &&
    `${session.model_name || "Photoshoot"} · ${session.jewelry_type}`;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-[#F5F0E8] pb-16">
      <div className="relative z-10 mx-auto max-w-[1400px] px-4 pt-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 border-b border-zinc-200/80 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/dashboard/ai-photoshoot/generations"
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
            >
              <ArrowLeft className="h-4 w-4" />
              All generations
            </Link>
            {session && (
              <div className="mt-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                  Session · {session.run_session_id}
                </p>
                <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
                  {headline}
                </h1>
                {session.model_style && (
                  <p className="mt-2 text-sm text-zinc-600">{session.model_style}</p>
                )}
                <p className="mt-2 text-xs text-zinc-500">
                  {format(new Date(session.created_at), "MMMM d, yyyy · h:mm a")}
                </p>
              </div>
            )}
          </div>
          <Link
            href={STUDIO_HREF}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-[#E0B428] bg-[#F5C842] px-5 text-sm font-bold text-zinc-900 shadow-sm transition hover:bg-[#E0B428]"
          >
            Generate more
          </Link>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-zinc-500">
            <Loader2 className="h-8 w-8 animate-spin text-[#F97316]" />
            <span className="text-sm font-medium">Loading session…</span>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {!loading && session && images.length > 0 && headline && (
          <>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Generated images ({images.length})
            </p>
            <div className={PHOTOSHOOT_GENERATIONS_GRID_CLASS}>
              {images.map((img, index) => {
                const fileTitle = formatFileTitleFromLabel(
                  img.label || `Variation ${index + 1}`,
                  index
                );
                const description =
                  session.model_style?.trim() ||
                  `${img.label || `Variation ${index + 1}`} — from this run.`;
                const tags = `${session.jewelry_type.toLowerCase()}, ${(img.label || "shot").toLowerCase()}, refined`;
                return (
                  <PhotoshootGenerationCard
                    key={`${img.url}-${index}`}
                    imageUrl={img.url}
                    fileTitle={fileTitle}
                    headline={headline}
                    description={description}
                    tags={tags}
                    downloadUrl={img.url}
                    downloadLabel={img.label || `Variation ${index + 1}`}
                  />
                );
              })}
            </div>
          </>
        )}

        {!loading && session && images.length === 0 && (
          <div className="rounded-3xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
            <p className="font-semibold text-zinc-900">No images in this session</p>
            <Link
              href={STUDIO_HREF}
              className="mt-6 inline-flex h-10 items-center justify-center rounded-full border border-[#E0B428] bg-[#F5C842] px-6 text-sm font-bold text-zinc-900 hover:bg-[#E0B428]"
            >
              Open Studio
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
