"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Loader2, Camera, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

type SessionSummary = {
  id: string;
  run_session_id: string;
  model_name: string | null;
  model_style: string | null;
  jewelry_type: string;
  image_count: number;
  preview_url: string | null;
  created_at: string;
};

export default function AiPhotoshootGenerationsPage() {
  const { getIdToken, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="relative min-h-[calc(100vh-4rem)] bg-zinc-50 pb-12">
      <div className="ai-photoshoot-bg-ambient pointer-events-none" />
      <div className="relative z-10 mx-auto max-w-5xl px-4 pt-6">
        <Link
          href="/dashboard/ai-photoshoot"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Studio
        </Link>

        <div className="flex items-start gap-3 mb-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
            <Camera className="h-5 w-5 text-emerald-800" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              My generations
            </h1>
            <p className="text-sm text-zinc-600 mt-1">
              Each run is saved as its own session. The short ID groups all images
              from that generation.
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-zinc-500">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-sm font-medium">Loading saved sessions…</span>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {!loading && !error && sessions.length === 0 && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
            <p className="text-zinc-700 font-medium">No saved generations yet.</p>
            <p className="text-sm text-zinc-500 mt-2">
              Generate a photoshoot in Studio — results are saved automatically when
              you&apos;re signed in.
            </p>
            <Link
              href="/dashboard/ai-photoshoot"
              className="inline-flex mt-6 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Open Studio
            </Link>
          </div>
        )}

        {!loading && sessions.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2">
            {sessions.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/dashboard/ai-photoshoot/generations/${s.id}`}
                  className="group flex gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md"
                >
                  <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                    {s.preview_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.preview_url}
                        alt=""
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-zinc-400">
                        <Camera className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 py-0.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                      Session · {s.run_session_id}
                    </p>
                    <p className="mt-1 font-semibold text-zinc-900 truncate">
                      {s.model_name || "Model"} · {s.jewelry_type}
                    </p>
                    {s.model_style && (
                      <p className="text-xs text-zinc-500 truncate">
                        {s.model_style}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-zinc-500">
                      {format(new Date(s.created_at), "MMM d, yyyy · h:mm a")} ·{" "}
                      {s.image_count} images
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
