"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import ResultGrid from "@/components/AI_photoshoot/ResultGrid";

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

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-zinc-50 pb-16">
      <div className="ai-photoshoot-bg-ambient pointer-events-none" />
      <div className="relative z-10 mx-auto max-w-3xl px-4 pt-6">
        <Link
          href="/dashboard/ai-photoshoot/generations"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          All generations
        </Link>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-zinc-500">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {!loading && session && (
          <>
            <div className="mb-8">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                Session · {session.run_session_id}
              </p>
              <h1 className="mt-1 text-2xl font-bold text-zinc-900">
                {session.model_name || "Photoshoot"} · {session.jewelry_type}
              </h1>
              {session.model_style && (
                <p className="text-sm text-zinc-600 mt-1">{session.model_style}</p>
              )}
              <p className="text-xs text-zinc-500 mt-3">
                {format(new Date(session.created_at), "MMMM d, yyyy · h:mm a")}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-zinc-800 mb-4">
                Generated images
              </h2>
              <div className="[&_.grid]:ml-0 [&_.grid]:max-w-none">
                <ResultGrid images={images} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
