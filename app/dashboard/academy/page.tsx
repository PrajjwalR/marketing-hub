'use client';

import { academyData } from "@/lib/academy";
import Link from "next/link";
import { BookOpen, ListTree, PlayCircle, Gem } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from '@/lib/auth-context';
import type { User } from 'firebase/auth';
import { Button } from "@/components/ui/button";

function resolveWelcomeName(
    user: User | null | undefined,
    opts?: { dbName?: string | null }
): string {
    const db = opts?.dbName?.trim();
    if (db) return db;
    if (!user) return 'User';
    const dn = user.displayName?.trim();
    if (dn) return dn;
    for (const p of user.providerData || []) {
        const pd = p.displayName?.trim();
        if (pd) return pd;
    }
    const local = user.email?.split('@')[0]?.trim();
    if (local) return local;
    return 'User';
}

function getInitialsFromDisplayName(displayName: string): string {
    const parts = displayName.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    if (displayName.trim().length >= 2) return displayName.trim().slice(0, 2).toUpperCase();
    return displayName.trim().slice(0, 1).toUpperCase() || 'U';
}

const LEVEL_STYLES: Record<string, { badge: string; label: string }> = {
  Beginner:     { badge: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Beginner" },
  Intermediate: { badge: "bg-blue-100 text-blue-700 border-blue-200",         label: "Intermediate" },
  Advanced:     { badge: "bg-amber-100 text-amber-700 border-amber-200",       label: "Advanced" },
  Pro:          { badge: "bg-purple-100 text-purple-700 border-purple-200",    label: "Pro" },
};

const FILTERS = ["All", "Beginner", "Intermediate", "Advanced", "Pro"];

export default function AcademyPage() {
  const { user } = useAuth();
  const [profileNameFromDb, setProfileNameFromDb] = useState<string | null>(null);
  const displayName = resolveWelcomeName(user, { dbName: profileNameFromDb });

  useEffect(() => {
      if (!user) {
          setProfileNameFromDb(null);
          return;
      }
      let cancelled = false;
      (async () => {
          try {
              const token = await user.getIdToken();
              const res = await fetch('/api/user', {
                  headers: { Authorization: `Bearer ${token}` },
              });
              if (!cancelled && res.ok) {
                  const data = (await res.json()) as { name?: string };
                  const n = data.name?.trim();
                  setProfileNameFromDb(n || null);
              }
          } catch {
              if (!cancelled) setProfileNameFromDb(null);
          }
      })();
      return () => {
          cancelled = true;
      };
  }, [user]);

  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = activeFilter === "All"
    ? academyData
    : academyData.filter(c => c.level === activeFilter);

  const totalLessons = academyData.reduce((acc, c) =>
    acc + c.modules.reduce((a, m) => a + m.lessons.length, 0), 0
  );

  return (
    <div className="w-full bg-[#F4F5F7] min-h-screen pb-10">
      <header className="font-sans sticky top-0 z-30 -mx-3 mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200/90 bg-[#F4F5F7] px-3 py-3.5 sm:-mx-4 sm:px-4">
          <div id="dashboard-welcome" className="flex min-w-0 items-center gap-3">
              <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-tl-lg rounded-br-lg rounded-tr-none rounded-bl-none bg-[#D1FAE5] text-sm font-bold text-[#047857]"
                  title={displayName}
              >
                  {getInitialsFromDisplayName(displayName)}
              </div>
              <div className="min-w-0">
                  <h1 className="truncate text-lg font-bold text-[#111827]">
                      Welcome, {displayName}!
                  </h1>
              </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
              <Button
                  variant="outline"
                  className="h-9 gap-1.5 rounded-[6px] border-transparent bg-[#6F5ED3] px-4 font-semibold text-sm text-white shadow-sm hover:bg-[#7d6ed2] hover:text-white"
              >
                  <Gem className="h-3.5 w-3.5" />
                  Trial more features
              </Button>
              <Button className="h-9 rounded-[6px] border-0 bg-[#205BC3] px-4 font-semibold text-sm text-white shadow-sm hover:bg-[#7098dd]  hover:text-white">
                  Start my subscription
              </Button>
          </div>
      </header>

      <div className="w-full">
        {/* Header Stats */}
        <div className="mb-6 rounded-[5px] border border-[#E5E7EB] bg-white overflow-hidden">
            <div className="h-2 w-full bg-[#205BC3]" />
            <div className="p-6">
                <h2 className="text-2xl font-extrabold text-[#111827]">
                    Learn, grow & master marketing.
                </h2>
                <p className="text-base text-zinc-600 mt-1">
                    Deep-dive courses on AI-powered marketing strategies, built for modern growth teams.
                </p>
            </div>
        </div>

        {/* Filter bar */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`rounded-full border px-4 py-1.5 text-sm font-bold transition-all ${
                activeFilter === f 
                  ? "bg-[#205BC3] border-[#205BC3] text-white" 
                  : "bg-white border-[#E5E7EB] text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => {
            const levelStyle = LEVEL_STYLES[course.level ?? ""] ?? LEVEL_STYLES.Beginner;
            const totalCourseLessons = course.modules.reduce((a, m) => a + m.lessons.length, 0);
            const firstLesson = course.modules[0]?.lessons[0];

            return (
              <div
                key={course.id}
                className="flex flex-col overflow-hidden rounded-[5px] border border-[#E5E7EB] bg-white transition-all hover:border-[#D1D5DB] hover:shadow-sm"
              >
                {/* Thumbnail */}
                <div className="relative h-40 w-full shrink-0 bg-zinc-100 flex items-center justify-center overflow-hidden border-b border-[#E5E7EB]">
                  <span className="text-5xl opacity-40 select-none">🎓</span>
                  <span className={`absolute left-3 top-3 rounded-[4px] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border ${levelStyle.badge}`}>
                    {levelStyle.label}
                  </span>
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col p-5">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#205BC3] mb-1">
                    {course.modules[0]?.title}
                  </span>
                  <h2 className="text-lg font-extrabold text-[#111827] leading-tight mb-2">
                    {course.title}
                  </h2>
                  <p className="flex-1 text-[13px] text-zinc-600 leading-snug">
                    {course.description}
                  </p>

                  {/* Meta */}
                  <div className="mt-4 flex items-center gap-4 border-t border-[#E5E7EB] pt-4">
                    <div className="flex items-center gap-1.5 text-[12px] font-bold text-zinc-600">
                      <BookOpen className="h-4 w-4 text-[#6B7280]" />
                      {totalCourseLessons} Lessons
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px] font-bold text-zinc-600">
                      <ListTree className="h-4 w-4 text-[#6B7280]" />
                      {course.modules.length} Modules
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-4 flex items-center gap-3">
                    {firstLesson && (
                      <Link href={`/dashboard/academy/${course.id}/${firstLesson.id}`} className="flex-1">
                        <button className="w-full flex items-center justify-center gap-2 rounded-[5px] bg-[#205BC3] px-4 py-2 text-white text-sm font-bold transition-all hover:bg-[#1a4b9c]">
                          <PlayCircle className="h-4 w-4" />
                          Start Course
                        </button>
                      </Link>
                    )}
                    <Link href={`/dashboard/academy/${course.id}`} className="flex-1">
                      <button className="w-full rounded-[5px] border border-[#E5E7EB] px-4 py-2 text-sm font-bold text-zinc-700 transition-all hover:bg-zinc-50">
                        Details
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
