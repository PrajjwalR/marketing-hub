'use client';

import { academyData } from "@/lib/academy";
import Link from "next/link";
import { BookOpen, GraduationCap, ListTree, PlayCircle, Gem } from "lucide-react";
import { PageHero, heroButtonClass } from "@/components/dashboard/page-hero";
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
    <div className="mx-auto w-full max-w-7xl pb-10 md:pt-6">
      <PageHero
        titleId="dashboard-welcome"
        title="Learn, grow & master marketing."
        breadcrumb={['Academy']}
        icon={GraduationCap}
        description={<>Welcome, {displayName}! Deep-dive courses on AI-powered marketing strategies, built for modern growth teams.</>}
        stats={[
          { label: 'Courses', value: academyData.length, icon: BookOpen },
          { label: 'Lessons', value: totalLessons, icon: PlayCircle },
        ]}
        actions={
          <>
            <Link href="/dashboard/billing" className={heroButtonClass('ghost')}>
              <Gem className="h-4 w-4" />
              Trial more features
            </Link>
            <Link href="/dashboard/billing" className={heroButtonClass('gold')}>
              Start my subscription
            </Link>
          </>
        }
        overlap={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="ae-section-label">Filter by level</p>
            <div className="flex flex-wrap rounded-full bg-brand-800 p-1">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`rounded-full px-4 py-1.5 text-sm font-bold transition-all ${
                    activeFilter === f ? 'bg-white text-brand-900 shadow-sm' : 'text-white/75 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((course) => {
          const levelStyle = LEVEL_STYLES[course.level ?? ""] ?? LEVEL_STYLES.Beginner;
          const totalCourseLessons = course.modules.reduce((a, m) => a + m.lessons.length, 0);
          const firstLesson = course.modules[0]?.lessons[0];

          return (
            <div key={course.id} className="ae-tile ae-tile-interactive flex flex-col">
              {/* Thumbnail: green dome with gold coin, like the Mcoins screens */}
              <div className="ae-hero ae-contour ae-contour-dark relative m-2 mb-0 flex h-40 items-center justify-center rounded-xl">
                <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_25%,#fff7dc_0%,#f9c02a_45%,#c98009_100%)] shadow-[inset_0_-4px_0_rgba(109,60,18,0.35),inset_0_3px_0_rgba(255,255,255,0.6),0_14px_30px_-12px_rgba(0,0,0,0.5)]">
                  <GraduationCap className="h-7 w-7 text-brand-950" />
                </span>
                <span className={`absolute left-3 top-3 rounded-md border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${levelStyle.badge}`}>
                  {levelStyle.label}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <span className="ae-section-label mb-1 text-brand-700">{course.modules[0]?.title}</span>
                <h2 className="mb-2 text-lg font-extrabold leading-tight text-zinc-900">{course.title}</h2>
                <p className="flex-1 text-[13px] leading-snug text-zinc-500">{course.description}</p>

                <div className="mt-4 flex items-center gap-4 border-t border-dashed border-zinc-200 pt-4">
                  <div className="flex items-center gap-1.5 text-[12px] font-bold text-zinc-600">
                    <BookOpen className="h-4 w-4 text-brand-600" />
                    {totalCourseLessons} Lessons
                  </div>
                  <div className="flex items-center gap-1.5 text-[12px] font-bold text-zinc-600">
                    <ListTree className="h-4 w-4 text-brand-600" />
                    {course.modules.length} Modules
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  {firstLesson && (
                    <Link href={`/dashboard/academy/${course.id}/${firstLesson.id}`} className="flex-1">
                      <Button variant="gold" className="w-full">
                        <PlayCircle className="h-4 w-4" />
                        Start course
                      </Button>
                    </Link>
                  )}
                  <Link href={`/dashboard/academy/${course.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">Details</Button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
