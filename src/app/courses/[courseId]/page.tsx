'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Course, Module, Lesson, UserProgress } from '@/types/firestore';
import { seedCourses, seedModules, seedLessons } from '@/lib/seed-data';

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const { userData } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Record<string, Lesson[]>>({});
  const [userProgress, setUserProgress] = useState<Record<string, UserProgress>>({});
  const [loading, setLoading] = useState(true);

  const loadCourseData = useCallback(async () => {
    const courseId = params.courseId as string;
    if (!courseId) return;

    try {
      setLoading(true);

      // 1. Load course from Firestore or fallback to seed
      let targetCourse: Course | null = null;
      try {
        const courseDoc = await getDoc(doc(db, 'courses', courseId));
        if (courseDoc.exists()) {
          targetCourse = courseDoc.data() as Course;
        }
      } catch (e) {
        console.warn('Firestore fetch failed, checking seed data...', e);
      }

      if (!targetCourse) {
        targetCourse = seedCourses.find(c => c.id === courseId) || {
          id: courseId,
          title: courseId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          slug: courseId,
          description: 'Comprehensive engineering curriculum module with grounded video tutorials and interactive practice.',
          level: 'Intermediate',
          category: 'Engineering',
          estimatedHours: 35,
          skills: ['Engineering Principles', 'Problem Solving', 'System Design'],
          prerequisites: [],
          thumbnail: '/courses/default.jpg',
          published: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      setCourse(targetCourse);

      // 2. Load modules from Firestore or fallback to seed
      let modulesData: Module[] = [];
      try {
        const modulesQuery = query(
          collection(db, 'modules'),
          where('courseId', '==', courseId)
        );
        const modulesSnapshot = await getDocs(modulesQuery);
        modulesData = modulesSnapshot.docs.map(doc => doc.data() as Module);
      } catch (e) {
        console.warn('Firestore modules query warning:', e);
      }

      if (modulesData.length === 0) {
        modulesData = seedModules.filter(m => m.courseId === courseId);
      }

      // Synthetic fallback module if no module exists in seed
      if (modulesData.length === 0) {
        modulesData = [
          {
            id: `${courseId}-mod-1`,
            courseId: courseId,
            title: `${targetCourse.title} Foundations`,
            description: 'Core principles, theoretical framework, and execution models.',
            order: 1,
            estimatedMinutes: 120,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ];
      }

      modulesData.sort((a, b) => a.order - b.order);
      setModules(modulesData);

      // 3. Load lessons for each module
      const lessonsData: Record<string, Lesson[]> = {};
      for (const moduleData of modulesData) {
        let moduleLessons: Lesson[] = [];
        try {
          const lessonsQuery = query(
            collection(db, 'lessons'),
            where('moduleId', '==', moduleData.id)
          );
          const lessonsSnapshot = await getDocs(lessonsQuery);
          moduleLessons = lessonsSnapshot.docs.map(doc => doc.data() as Lesson);
        } catch (e) {
          console.warn('Firestore lessons query warning:', e);
        }

        if (moduleLessons.length === 0) {
          moduleLessons = seedLessons.filter(l => l.moduleId === moduleData.id);
        }

        // Synthetic fallback lesson if no lesson exists
        if (moduleLessons.length === 0) {
          moduleLessons = [
            {
              id: `${moduleData.id}-l1`,
              moduleId: moduleData.id,
              title: `Lesson 1: Introduction to ${moduleData.title}`,
              slug: `${moduleData.id}-l1`,
              description: 'Fundamental concept overview, architectural diagrams, and implementation details.',
              content: `# ${moduleData.title}\n\nDetailed breakdown of engineering principles and implementation execution.`,
              learningObjectives: [
                'Understand foundational mechanics and syntax',
                'Analyze performance metrics and algorithmic trade-offs',
                'Apply solutions to practical engineering problems'
              ],
              estimatedMinutes: 20,
              resources: [],
              videoResources: [],
              order: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          ];
        }

        moduleLessons.sort((a, b) => a.order - b.order);
        lessonsData[moduleData.id] = moduleLessons;
      }
      setLessons(lessonsData);

      // 4. Load user progress if authenticated
      if (userData) {
        try {
          const progressQuery = query(
            collection(db, 'userProgress'),
            where('userId', '==', userData.uid),
            where('courseId', '==', courseId)
          );
          const progressSnapshot = await getDocs(progressQuery);
          const progressData: Record<string, UserProgress> = {};
          progressSnapshot.docs.forEach(doc => {
            const progress = doc.data() as UserProgress;
            progressData[progress.lessonId] = progress;
          });
          setUserProgress(progressData);
        } catch (e) {
          console.warn('Firestore userProgress query warning:', e);
        }
      }

    } catch (error) {
      console.error('Error loading course data:', error);
    } finally {
      setLoading(false);
    }
  }, [params.courseId, userData]);

  useEffect(() => {
    loadCourseData();
  }, [loadCourseData]);

  const calculateModuleProgress = (moduleId: string) => {
    const moduleLessons = lessons[moduleId] || [];
    if (moduleLessons.length === 0) return 0;

    const completedLessons = moduleLessons.filter(lesson => 
      userProgress[lesson.id]?.completed
    ).length;

    return Math.round((completedLessons / moduleLessons.length) * 100);
  };

  const calculateCourseProgress = () => {
    const allLessons = Object.values(lessons).flat();
    if (allLessons.length === 0) return 0;

    const completedLessons = allLessons.filter(lesson => 
      userProgress[lesson.id]?.completed
    ).length;

    return Math.round((completedLessons / allLessons.length) * 100);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center bg-[#FBFBFA]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#0A66FF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-mono text-xs text-slate-500">Loading course curriculum...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!course) {
    return (
      <ProtectedRoute>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center bg-[#FBFBFA]">
          <div className="text-center space-y-3">
            <span className="material-symbols-outlined text-4xl text-slate-400">error_outline</span>
            <p className="font-headline font-bold text-slate-900 text-lg">Course Not Found</p>
            <Link href="/explore" className="inline-block px-4 py-2 rounded-xl bg-[#0A66FF] text-white text-xs font-semibold">
              Browse Course Catalog
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const courseProgress = calculateCourseProgress();

  return (
    <ProtectedRoute>
      <Navigation />
      <main className="min-h-screen bg-[#FBFBFA] text-[#0F172A] pb-24">
        <div className="max-w-6xl mx-auto px-6 pt-8">
          {/* Back Navigation */}
          <Link href="/explore" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0A66FF] hover:underline mb-6">
            ← Back to Explore Catalog
          </Link>

          {/* Header Banner */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 mb-10 shadow-sm flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0A66FF] text-xs font-mono font-bold">
                  {course.level}
                </span>
                <span className="font-mono text-xs text-slate-500">
                  {course.category}
                </span>
              </div>

              <h1 className="font-headline text-3xl font-bold text-slate-900 tracking-tight">
                {course.title}
              </h1>

              <p className="text-slate-600 text-sm leading-relaxed">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-lg text-[#0A66FF]">schedule</span>
                  <span>{course.estimatedHours} Hours Total</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-lg text-purple-600">school</span>
                  <span>{modules.length} Modules</span>
                </div>
              </div>
            </div>

            {/* Progress Box */}
            <div className="lg:w-64 bg-slate-900 text-white rounded-2xl p-6 text-center space-y-3 shrink-0 border border-slate-800">
              <div className="text-3xl font-headline font-bold text-[#0A66FF]">
                {courseProgress}%
              </div>
              <p className="text-xs text-slate-300 font-mono">Course Completion</p>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#0A66FF] h-full rounded-full transition-all duration-500"
                  style={{ width: `${courseProgress}%` }}
                />
              </div>

              {modules.length > 0 && lessons[modules[0].id]?.length > 0 && (
                <Link
                  href={`/lessons/${lessons[modules[0].id][0].id}`}
                  className="block w-full py-2.5 rounded-xl bg-[#0A66FF] hover:bg-[#0052DB] text-white text-xs font-bold transition-all shadow-md mt-2"
                >
                  Start / Resume →
                </Link>
              )}
            </div>
          </div>

          {/* Skills Covered */}
          <div className="mb-10">
            <h2 className="font-headline text-lg font-bold text-slate-900 mb-3">Skills & Invariants You&apos;ll Master</h2>
            <div className="flex flex-wrap gap-2">
              {course.skills.map((skill) => (
                <span key={skill} className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-mono font-semibold">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Modules List */}
          <div className="space-y-6">
            <h2 className="font-headline text-xl font-bold text-slate-900">Curriculum & Lessons</h2>
            {modules.map((module, index) => {
              const moduleLessons = lessons[module.id] || [];
              const moduleProgress = calculateModuleProgress(module.id);

              return (
                <div key={module.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                  {/* Module Header */}
                  <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
                    <div>
                      <div className="text-[11px] font-mono font-bold text-[#0A66FF] uppercase mb-1">
                        Module {index + 1} • {module.estimatedMinutes} Mins
                      </div>
                      <h3 className="font-headline font-bold text-slate-900 text-base">
                        {module.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {module.description}
                      </p>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#0A66FF]">
                      {moduleProgress}% Done
                    </span>
                  </div>

                  {/* Lessons List */}
                  <div className="divide-y divide-slate-100">
                    {moduleLessons.map((lesson) => {
                      const progress = userProgress[lesson.id];
                      const lessonCompleted = progress?.completed;

                      return (
                        <Link
                          key={lesson.id}
                          href={`/lessons/${lesson.id}`}
                          className="p-5 flex items-center justify-between hover:bg-blue-50/50 transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                              lessonCompleted
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-[#0A66FF]'
                            }`}>
                              {lessonCompleted ? '✓' : '▶'}
                            </div>
                            <div>
                              <h4 className="font-semibold text-xs text-slate-900 group-hover:text-[#0A66FF] transition-colors">
                                {lesson.title}
                              </h4>
                              <p className="text-[11px] text-slate-500">{lesson.estimatedMinutes} mins • {lesson.description}</p>
                            </div>
                          </div>

                          <span className="text-xs font-semibold text-[#0A66FF] group-hover:translate-x-1 transition-transform">
                            Open Lesson →
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}