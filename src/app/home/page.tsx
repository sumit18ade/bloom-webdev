'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import MultiStepLearningBuilder from '@/components/MultiStepLearningBuilder';
import ChangeTechnologyModal from '@/components/ChangeTechnologyModal';
import Link from 'next/link';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProgress, UserRoadmap } from '@/types/firestore';
import { ENGINEERING_BRANCHES } from '@/lib/taxonomy';
import { buildDynamicUserRoadmap, calculateCentralizedProgress, getRecommendedCoursesForUser } from '@/lib/recommendations';

export default function HomePage() {
  const { userData } = useAuth();
  const [recentProgress, setRecentProgress] = useState<UserProgress[]>([]);
  const [userRoadmap, setUserRoadmap] = useState<UserRoadmap | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isChangeTechOpen, setIsChangeTechOpen] = useState(false);

  const loadUserData = useCallback(async () => {
    if (!userData) {
      setLoading(false);
      return;
    }

    try {
      // Fetch progress
      const progressQuery = query(
        collection(db, 'userProgress'),
        where('userId', '==', userData.uid)
      );
      const progressSnapshot = await getDocs(progressQuery);
      const items = progressSnapshot.docs.map((doc) => doc.data() as UserProgress);
      
      const getTimestampMs = (val: unknown): number => {
        if (!val) return 0;
        if (typeof (val as { toMillis?: () => number }).toMillis === 'function') {
          return (val as { toMillis: () => number }).toMillis();
        }
        if (typeof (val as { toDate?: () => Date }).toDate === 'function') {
          return (val as { toDate: () => Date }).toDate().getTime();
        }
        if (val instanceof Date) return val.getTime();
        if (typeof val === 'number') return val;
        if (typeof val === 'string') return new Date(val).getTime();
        return 0;
      };

      items.sort((a, b) => getTimestampMs(b.lastAccessedAt) - getTimestampMs(a.lastAccessedAt));
      setRecentProgress(items);

      // Load active roadmap
      const progressMap: Record<string, UserProgress> = {};
      items.forEach(p => { progressMap[p.lessonId] = p; });

      const branch = userData.engineeringBranch || userData.engineeringField || 'Computer Science';
      const branchInfo = ENGINEERING_BRANCHES[branch] || ENGINEERING_BRANCHES['Computer Science'];

      const generated = buildDynamicUserRoadmap(userData.uid, {
        branch,
        careerGoal: userData.careerGoal || branchInfo.careerGoals[0],
        subjects: userData.selectedSubjects || branchInfo.subjects.slice(0, 5),
        technologies: userData.selectedTechnologies || branchInfo.recommendedTechnologies,
        activeTechnology: userData.activeTechnology || branchInfo.recommendedTechnologies[0] || 'C',
        level: userData.experienceLevel || 'Beginner',
        learningTime: userData.dailyLearningTime || '1 hr/day',
        learningStyle: userData.preferredLearningStyle || 'Comprehensive'
      }, progressMap);

      setUserRoadmap(generated);

    } catch (error) {
      console.error('Error loading user progress:', error);
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const branchKey = userData?.engineeringBranch || userData?.engineeringField || 'Computer Science';
  const branchInfo = ENGINEERING_BRANCHES[branchKey] || ENGINEERING_BRANCHES['Computer Science'];
  const activeTech = userData?.activeTechnology || userRoadmap?.activeTechnology || 'C';

  const progressMetrics = useMemo(() => {
    return calculateCentralizedProgress(userRoadmap, recentProgress);
  }, [userRoadmap, recentProgress]);

  const activeCourseList = useMemo(() => {
    return getRecommendedCoursesForUser(userData);
  }, [userData]);

  const activeNode = useMemo(() => {
    if (!userRoadmap || !userRoadmap.nodes || userRoadmap.nodes.length === 0) {
      // Fallback node based on real activeTech — no hardcoded C
      const techLabel = activeTech || 'Engineering';
      return {
        id: `node-${techLabel.toLowerCase().replace(/[^a-z0-9]/g, '-')}-1`,
        title: `${techLabel} Foundations`,
        description: `Core principles, theoretical concepts, and practical execution for ${techLabel}.`,
        lessonIds: [],
        courseId: '',
        status: 'available' as const
      };
    }
    return userRoadmap.nodes.find(n => n.status === 'in_progress' || n.status === 'available') || userRoadmap.nodes[0];
  }, [userRoadmap, activeTech]);

  const activeProgressItem = useMemo(() => {
    if (!userRoadmap || !userRoadmap.nodes) return undefined;
    const activeLessonIds = new Set(userRoadmap.nodes.flatMap(n => n.lessonIds || []));
    return recentProgress.find(p => activeLessonIds.has(p.lessonId));
  }, [userRoadmap, recentProgress]);

  // Resolve the best lesson link for the active node — prefer in-progress, then first lesson of active node, then first lesson in the whole roadmap
  const targetLessonId = useMemo(() => {
    if (activeProgressItem?.lessonId) return activeProgressItem.lessonId;
    if (activeNode.lessonIds && activeNode.lessonIds.length > 0) return activeNode.lessonIds[0];
    // Walk all nodes for any lesson
    if (userRoadmap?.nodes) {
      for (const n of userRoadmap.nodes) {
        if (n.lessonIds && n.lessonIds.length > 0) return n.lessonIds[0];
      }
    }
    // Last resort: derive from activeTech (no hardcoded c-intro)
    const t = activeTech.toLowerCase();
    if (t.includes('postgres') || t.includes('sql') || t.includes('mysql')) return 'dbms-relational-sql';
    if (t === 'python') return 'python-intro';
    if (t === 'c++') return 'c-intro';
    if (t === 'java' || t.includes('spring')) return 'c-intro';
    if (t === 'c') return 'c-intro';
    if (t.includes('javascript') || t.includes('typescript') || t === 'react' || t === 'node.js') return 'python-intro';
    return activeNode.courseId ? activeNode.courseId : 'explore';
  }, [activeProgressItem, activeNode, userRoadmap, activeTech]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center bg-[#FBFBFA]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#0A66FF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-mono text-xs text-slate-500">Loading personalized cockpit...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Navigation />
      <main className="min-h-screen bg-[#FBFBFA] text-[#0F172A] pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 sm:pt-8">
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px] sm:text-[11px] text-[#0A66FF] font-bold uppercase tracking-wider mb-1">
                <span>YOUR BLOOM JOURNEY</span>
                <span>•</span>
                <span>{branchInfo.shortName}</span>
                <span>•</span>
                <span>TECH: {activeTech}</span>
              </div>
              <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {getGreeting()}, {userData?.displayName?.split(' ')[0] || 'Engineer'}
              </h1>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={() => setIsChangeTechOpen(true)}
                className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all shadow-sm text-center truncate"
              >
                Change Tech ⚙️
              </button>
              <button
                onClick={() => setIsBuilderOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#0A66FF] hover:bg-[#0052DB] text-white text-xs font-bold transition-all shadow-md text-center truncate"
              >
                Build Path ✨
              </button>
            </div>
          </div>

          {/* ========================================================== */}
          {/* 1. YOUR NEXT MOVE (COCKPIT HERO)                           */}
          {/* ========================================================== */}
          <div className="mb-8 sm:mb-10">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-8 shadow-sm relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="space-y-3 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0A66FF] font-mono text-[11px] font-bold max-w-full">
                    <span className="w-2 h-2 rounded-full bg-[#0A66FF] animate-pulse shrink-0" />
                    <span className="truncate">YOUR NEXT MOVE ({activeTech})</span>
                  </div>

                  <div>
                    <span className="font-mono text-[10px] sm:text-xs text-slate-500 block uppercase font-medium">
                      {activeProgressItem ? 'IN PROGRESS' : `RECOMMENDED FOR ${branchInfo.shortName}`}
                    </span>
                    <h2 className="font-headline text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 leading-tight">
                      {activeNode.title?.replace(/^Core Concept:\s*/i, '')}
                    </h2>
                  </div>

                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {activeNode.description}
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
                    <Link
                      href={`/lessons/${targetLessonId}`}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#0A66FF] hover:bg-[#0052DB] text-white text-xs font-bold shadow-md transition-all w-full sm:w-auto text-center"
                    >
                      <span>{activeProgressItem ? 'Resume Lesson' : 'Start Learning Path'}</span>
                      <span>→</span>
                    </Link>
                    <Link
                      href="/roadmap"
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      View Full Roadmap
                    </Link>
                  </div>
                </div>

                {/* Centralized Progress Indicator */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center shrink-0 min-w-[200px]">
                  <div className="font-headline text-4xl font-bold text-[#0A66FF]">
                    {progressMetrics.overallPercentage}%
                  </div>
                  <div className="font-mono text-[11px] text-slate-500 mt-1 uppercase font-bold">
                    PATH PROGRESS
                  </div>
                  <div className="w-32 bg-slate-200 h-2.5 rounded-full overflow-hidden mt-3">
                    <div
                      className="bg-[#0A66FF] h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressMetrics.overallPercentage}%` }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 mt-2.5">
                    {progressMetrics.completedNodes} of {progressMetrics.totalNodes} Nodes Cleared
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================== */}
          {/* 2. TODAY'S RECOMMENDED LEARNING                            */}
          {/* ========================================================== */}
          <div className="mb-10">
            <h3 className="font-headline text-lg font-bold text-slate-900 mb-4">
              Today&apos;s Recommended Learning
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {/* Card 1: Learn */}
              <Link
                href="/explore"
                className="bg-white rounded-3xl border border-slate-200/90 p-6 hover:border-slate-300 transition-all flex flex-col justify-between group shadow-sm"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0A66FF] flex items-center justify-center font-mono font-bold text-xs mb-3 group-hover:scale-105 transition-transform">
                    01
                  </div>
                  <h4 className="font-headline font-bold text-slate-900 text-sm">Learn</h4>
                  <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                    {activeCourseList[0] ? activeCourseList[0].title : `${activeTech} Fundamentals`}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>CONCEPT LESSON</span>
                  <span className="text-[#0A66FF] font-bold group-hover:underline">Start →</span>
                </div>
              </Link>

              {/* Card 2: Practice */}
              <Link
                href="/practice"
                className="bg-white rounded-3xl border border-slate-200/90 p-6 hover:border-slate-300 transition-all flex flex-col justify-between group shadow-sm"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-mono font-bold text-xs mb-3 group-hover:scale-105 transition-transform">
                    02
                  </div>
                  <h4 className="font-headline font-bold text-slate-900 text-sm">Practice</h4>
                  <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                    Active recall challenges for {activeTech} and {branchInfo.shortName}.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>ACTIVE RECALL</span>
                  <span className="text-[#0A66FF] font-bold group-hover:underline">Practice →</span>
                </div>
              </Link>

              {/* Card 3: Build */}
              <Link
                href="/projects"
                className="bg-white rounded-3xl border border-slate-200/90 p-6 hover:border-slate-300 transition-all flex flex-col justify-between group shadow-sm"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-mono font-bold text-xs mb-3 group-hover:scale-105 transition-transform">
                    03
                  </div>
                  <h4 className="font-headline font-bold text-slate-900 text-sm">Build</h4>
                  <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                    Guided capstones tailored to your {userData?.careerGoal || branchInfo.careerGoals[0]} goal.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>CAPSTONE PROJECT</span>
                  <span className="text-[#0A66FF] font-bold group-hover:underline">Build →</span>
                </div>
              </Link>
            </div>
          </div>

          {/* ========================================================== */}
          {/* 3. RECENT ACTIVITY                                         */}
          {/* ========================================================== */}
          <div>
            <h3 className="font-headline text-lg font-bold text-slate-900 mb-4">
              Recent Learning Activity
            </h3>
            {recentProgress.length > 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200/90 divide-y divide-slate-100 shadow-sm">
                {recentProgress.map((item, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <div>
                        <div className="font-bold text-slate-900">Lesson {item.lessonId}</div>
                        <div className="text-slate-500 text-[11px] font-mono">
                          {item.completed ? 'Completed' : 'In Progress'}
                        </div>
                      </div>
                    </div>
                    <div className="font-mono text-slate-600 font-bold">{item.progress}%</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-8 text-center shadow-sm">
                <h4 className="font-headline font-bold text-slate-800 text-sm">
                  Your Bloom journey starts here
                </h4>
                <p className="text-slate-500 text-xs mt-1 mb-4 max-w-sm mx-auto">
                  Select your first topic from your personalized {branchInfo.shortName} roadmap ({activeTech}).
                </p>
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0A66FF] hover:bg-[#0052DB] text-white text-xs font-bold transition-all shadow-sm"
                >
                  <span>Explore Courses & Paths</span>
                  <span>→</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <MultiStepLearningBuilder
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        onRoadmapGenerated={(updated) => setUserRoadmap(updated)}
      />
      <ChangeTechnologyModal
        isOpen={isChangeTechOpen}
        onClose={() => { setIsChangeTechOpen(false); loadUserData(); }}
      />
    </ProtectedRoute>
  );
}