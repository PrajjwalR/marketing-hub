export interface Lesson {
  id: string;
  title: string;
  description: string;
  googleDriveVideoId?: string;
  duration?: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  modules: Module[];
  level?: string;
  instructor?: string;
}

export const academyData: Course[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Learn the fundamentals of using the platform to grow your marketing reach efficiently.",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop",
    level: "Beginner",
    instructor: "Agent Elephant Team",
    modules: [
      {
        id: "module-1",
        title: "Platform Basics",
        lessons: [
          {
            id: "lesson-1",
            title: "Welcome & Overview",
            description: "A quick tour of what Agent Elephant can do.",
            googleDriveVideoId: "1IGkwsmhJXIzYP5vkoBHuLkfh_qbuz-S-", 
            duration: "5:00",
          },
          {
            id: "lesson-2",
            title: "Navigating the Dashboard",
            description: "How to interpret your stats and navigate around.",
            googleDriveVideoId: "1WHn6OvPLFyFpiUW-uWKOzymKEbGxUEq4",
            duration: "3:30",
          }
        ]
      },
      {
        id: "module-2",
        title: "Content Creation",
        lessons: [
          {
            id: "lesson-3",
            title: "Using the Strategy Planner",
            description: "Create your first posting strategy.",
            googleDriveVideoId: "1PZz4eR8KxJvq0MhQ-_Vq_d4Tq4H-dCgZ",
            duration: "7:15",
          }
        ]
      }
    ]
  },
  {
    id: "advanced-marketing",
    title: "Advanced Marketing Strategies",
    description: "Deep dive into competitor analysis and data enrichment.",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
    level: "Advanced",
    instructor: "Agent Elephant Team",
    modules: [
      {
        id: "module-1",
        title: "Competitor Analysis",
        lessons: [
          {
            id: "lesson-1",
            title: "Tracking Competitors",
            description: "How to add and analyze competitor social media.",
            googleDriveVideoId: "1PZz4eR8KxJvq0MhQ-_Vq_d4Tq4H-dCgZ",
            duration: "10:00",
          }
        ]
      }
    ]
  }
];

export function getCourseById(id: string): Course | undefined {
  return academyData.find(c => c.id === id);
}

export function getLessonById(courseId: string, lessonId: string): Lesson | undefined {
  const course = getCourseById(courseId);
  if (!course) return undefined;
  
  for (const module of course.modules) {
    const lesson = module.lessons.find(l => l.id === lessonId);
    if (lesson) return lesson;
  }
  return undefined;
}
