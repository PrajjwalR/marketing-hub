import { getCourseById, getLessonById } from "@/lib/academy";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, PlayCircle, Clock } from "lucide-react";

export default async function LessonPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  const p = await params;
  const course = getCourseById(p.courseId);
  if (!course) return notFound();

  const currentLesson = getLessonById(p.courseId, p.lessonId);
  if (!currentLesson) return notFound();

  return (
    <div className="w-full bg-[#F4F5F7] min-h-screen pb-10">

      {/* Top bar */}
      <header className="sticky top-0 z-30 -mx-3 mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200/90 bg-[#F4F5F7] px-3 py-4 sm:-mx-4 sm:px-4">
          <div className="flex min-w-0 items-center gap-3">
              <Link
                href={`/dashboard/academy/${course.id}`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-tl-lg rounded-br-lg bg-[#E2E8F0] text-sm font-bold text-[#475569] hover:bg-[#CBD5E1]"
              >
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#205BC3]">{course.title}</p>
                  <h1 className="truncate text-lg font-bold text-[#111827]">
                      {currentLesson.title}
                  </h1>
              </div>
          </div>
      </header>

      {/* Main layout */}
      <div className="w-full grid gap-6 lg:grid-cols-[1fr_320px]">

        {/* Left – Video + description */}
        <div className="flex-1 space-y-6">
            {/* Video embed */}
            <div className="relative w-full overflow-hidden rounded-[5px] border border-[#E5E7EB] bg-black shadow-sm" style={{ aspectRatio: "16/9" }}>
              {currentLesson.googleDriveVideoId ? (
                <iframe
                  src={`https://drive.google.com/file/d/${currentLesson.googleDriveVideoId}/preview`}
                  className="absolute inset-0 h-full w-full border-0"
                  allow="autoplay"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-zinc-400 font-medium bg-zinc-100">
                  No video available for this lesson.
                </div>
              )}
            </div>

            {/* Lesson info */}
            <div className="rounded-[5px] border border-[#E5E7EB] bg-white p-6">
              <h2 className="mb-2 text-2xl font-extrabold text-[#111827]">
                {currentLesson.title}
              </h2>
              <div className="mb-4 h-1 w-12 rounded-full bg-[#205BC3]" />
              <p className="text-sm leading-relaxed text-zinc-600">
                {currentLesson.description}
              </p>
            </div>
        </div>

        {/* Right – Curriculum sidebar */}
        <div className="flex flex-col gap-4">
          <div className="rounded-[5px] border border-[#E5E7EB] bg-white p-5">
            <h3 className="font-bold text-[#111827] text-base mb-4">Course Content</h3>
            
            <div className="space-y-6">
              {course.modules.map((module, mIdx) => (
                <div key={module.id} className="space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                    Section {mIdx + 1}: {module.title}
                  </p>
                  <div className="space-y-1.5">
                    {module.lessons.map((lesson, lIdx) => {
                      const isActive = lesson.id === currentLesson.id;
                      return (
                        <Link
                          key={lesson.id}
                          href={`/dashboard/academy/${course.id}/${lesson.id}`}
                          className={`flex gap-3 rounded-[5px] border p-3 transition-all ${
                            isActive 
                              ? 'border-[#205BC3]/20 bg-[#205BC3]/10' 
                              : 'border-transparent hover:bg-zinc-50'
                          }`}
                        >
                          <PlayCircle
                            className={`mt-0.5 h-4 w-4 shrink-0 ${isActive ? 'text-[#205BC3]' : 'text-zinc-400'}`}
                          />
                          <div>
                            <p className={`text-[13px] font-bold leading-snug ${isActive ? 'text-[#205BC3]' : 'text-zinc-700'}`}>
                              {lIdx + 1}. {lesson.title}
                            </p>
                            {lesson.duration && (
                              <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-zinc-500">
                                <Clock className="h-3 w-3" /> {lesson.duration}
                              </p>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
