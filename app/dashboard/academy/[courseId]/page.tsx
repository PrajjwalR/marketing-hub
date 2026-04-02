import { getCourseById } from "@/lib/academy";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, PlayCircle, BookOpen, Clock } from "lucide-react";

export default async function CourseOverviewPage({ params }: { params: Promise<{ courseId: string }> }) {
  const p = await params;
  const course = getCourseById(p.courseId);
  if (!course) return notFound();

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const firstLesson = course.modules[0]?.lessons[0];

  return (
    <div className="w-full bg-[#F4F5F7] min-h-screen pb-10">
      <header className="sticky top-0 z-30 -mx-3 mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200/90 bg-[#F4F5F7] px-3 py-4 sm:-mx-4 sm:px-4">
          <div className="flex min-w-0 items-center gap-3">
              <Link href="/dashboard/academy" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-tl-lg rounded-br-lg bg-[#E2E8F0] text-sm font-bold text-[#475569] hover:bg-[#CBD5E1]">
                  <ChevronLeft className="h-5 w-5" />
              </Link>
              <div className="min-w-0">
                  <h1 className="truncate text-lg font-bold text-[#111827]">
                      {course.title}
                  </h1>
              </div>
          </div>
      </header>

      <div className="grid gap-6 md:grid-cols-[1fr_320px]">

        {/* Curriculum */}
        <div className="space-y-4">
          <div className="rounded-[5px] border border-[#E5E7EB] bg-white overflow-hidden p-6 mb-4">
             <h2 className="text-2xl font-extrabold text-[#111827] mb-2">{course.title}</h2>
             <p className="text-sm text-zinc-600 leading-relaxed">{course.description}</p>
          </div>

          <h3 className="text-lg font-bold text-[#111827] mt-8 mb-4">Course Curriculum</h3>
          {course.modules.map((module, idx) => (
            <div key={module.id} className="overflow-hidden rounded-[5px] border border-[#E5E7EB] bg-white">
              <div className="flex items-center gap-4 border-b border-[#E5E7EB] bg-zinc-50 px-5 py-3">
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Module {idx + 1}</span>
                <span className="font-bold text-[#111827] text-sm">{module.title}</span>
              </div>
              <div className="divide-y divide-[#E5E7EB]">
                {module.lessons.map((lesson, lIdx) => (
                  <Link
                    key={lesson.id}
                    href={`/dashboard/academy/${course.id}/${lesson.id}`}
                    className="group flex items-center justify-between px-5 py-4 transition-colors hover:bg-zinc-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-zinc-100 text-zinc-400 transition-colors group-hover:bg-[#205BC3]/10 group-hover:text-[#205BC3]">
                        <PlayCircle className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-700 transition-colors group-hover:text-[#205BC3]">
                          {lIdx + 1}. {lesson.title}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-500">{lesson.description}</p>
                      </div>
                    </div>
                    {lesson.duration && (
                      <div className="ml-4 flex shrink-0 items-center gap-1.5 text-[11px] font-semibold text-zinc-500 bg-zinc-100 px-2 py-1 rounded">
                        <Clock className="h-3.5 w-3.5" />
                        {lesson.duration}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sticky card */}
        <div>
          <div className="sticky top-[90px] rounded-[5px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div className="mb-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 text-sm">
                <span className="flex items-center gap-2 font-semibold text-zinc-600"><BookOpen className="h-4 w-4 text-[#10B981]" /> Total Lessons</span>
                <span className="font-bold text-[#111827]">{totalLessons}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-semibold text-zinc-600"><Clock className="h-4 w-4 text-[#205BC3]" /> Instructor</span>
                <span className="font-bold text-[#111827]">{course.instructor}</span>
              </div>
            </div>
            {firstLesson && (
              <Link href={`/dashboard/academy/${course.id}/${firstLesson.id}`} className="block">
                <button
                  className="flex w-full items-center justify-center gap-2 rounded-[5px] py-2.5 text-sm font-bold text-white transition-all bg-[#205BC3] hover:bg-[#1a4b9c]"
                >
                  <PlayCircle className="h-4 w-4" />
                  Start Learning
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
