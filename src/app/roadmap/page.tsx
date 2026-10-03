'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import MultiStepLearningBuilder from '@/components/MultiStepLearningBuilder';
import ChangeTechnologyModal from '@/components/ChangeTechnologyModal';
import Link from 'next/link';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProgress, UserRoadmap, RoadmapNode } from '@/types/firestore';
import { ENGINEERING_BRANCHES } from '@/lib/taxonomy';
import { buildDynamicUserRoadmap, calculateCentralizedProgress } from '@/lib/recommendations';

export default function RoadmapPage() {
  const { userData } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [userRoadmap, setUserRoadmap] = useState<UserRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);

  // Modals
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isChangeTechOpen, setIsChangeTechOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      if (userData) {
        // 1. Fetch user progress
        const progressQuery = query(collection(db, 'userProgress'), where('userId', '==', userData.uid));
        const progressSnapshot = await getDocs(progressQuery);
        const progressList = progressSnapshot.docs.map(doc => doc.data() as UserProgress);
        setUserProgress(progressList);

        // 2. Fetch user active roadmap from Firestore subcollection or generate dynamically
        const progressMap: Record<string, UserProgress> = {};
        progressList.forEach(p => { progressMap[p.lessonId] = p; });

        let fetchedRoadmap: UserRoadmap | null = null;
        try {
          const roadmapsQuery = query(collection(db, 'users', userData.uid, 'roadmaps'), where('active', '==', true));
          const roadmapsSnapshot = await getDocs(roadmapsQuery);
          if (!roadmapsSnapshot.empty) {
            fetchedRoadmap = roadmapsSnapshot.docs[0].data() as UserRoadmap;
          }
        } catch (e) {
          console.warn('Roadmaps subcollection fetch warning:', e);
        }

        if (!fetchedRoadmap) {
          const branch = userData.engineeringBranch || userData.engineeringField || 'Computer Science';
          const branchInfo = ENGINEERING_BRANCHES[branch] || ENGINEERING_BRANCHES['Computer Science'];

          fetchedRoadmap = buildDynamicUserRoadmap(userData.uid, {
            branch,
            careerGoal: userData.careerGoal || branchInfo.careerGoals[0],
            subjects: userData.selectedSubjects || branchInfo.subjects.slice(0, 5),
            technologies: userData.selectedTechnologies || branchInfo.recommendedTechnologies,
            activeTechnology: userData.activeTechnology || branchInfo.recommendedTechnologies[0] || 'C',
            level: userData.experienceLevel || 'Beginner',
            learningTime: userData.dailyLearningTime || '1 hr/day',
            learningStyle: userData.preferredLearningStyle || 'Comprehensive'
          }, progressMap);
        }

        setUserRoadmap(fetchedRoadmap);
      }
    } catch (err) {
      console.error('Error loading roadmap data:', err);
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeBranchKey = userData?.engineeringBranch || userData?.engineeringField || 'Computer Science';
  const branchInfo = ENGINEERING_BRANCHES[activeBranchKey] || ENGINEERING_BRANCHES['Computer Science'];
  const activeTech = userData?.activeTechnology || userRoadmap?.activeTechnology || 'C';

  const progressMetrics = useMemo(() => {
    return calculateCentralizedProgress(userRoadmap, userProgress);
  }, [userRoadmap, userProgress]);

  if (loading) {
    return (
      <ProtectedRoute>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center bg-[#FBFBFA]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#0A66FF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-mono text-xs text-slate-500">Generating dynamic learning journey graph...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Navigation />
      <main className="min-h-screen bg-[#FBFBFA] text-[#0F172A] pb-24">
        <div className="max-w-5xl mx-auto px-6 pt-8">
          {/* Top Banner */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-[#0A66FF] font-bold uppercase tracking-wider mb-1">
                <span>BLOOM LEARNING JOURNEY</span>
                <span>•</span>
                <span>{branchInfo.shortName}</span>
                <span>•</span>
                <span>ACTIVE TECH: {activeTech}</span>
              </div>
              <h1 className="font-headline text-3xl font-bold tracking-tight text-slate-900">
                {userRoadmap?.title || `${activeBranchKey} — ${userData?.careerGoal || 'Engineer'}`}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsChangeTechOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all shadow-sm"
              >
                Change Tech ({activeTech}) ⚙️
              </button>
              <button
                onClick={() => setIsBuilderOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-[#0A66FF] hover:bg-[#0052DB] text-white text-xs font-bold transition-all shadow-md"
              >
                Build New Path ✨
              </button>
            </div>
          </div>

          {/* Progress Header Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm mb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="font-headline font-bold text-slate-900 text-xl">Real Learning Journey Progress</h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  Calculated from actual completed lessons, quizzes, labs, and capstones in Firestore
                </p>
              </div>
              <div className="font-headline text-4xl font-bold text-[#0A66FF]">
                {progressMetrics.overallPercentage}%
              </div>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-3">
              <div
                className="bg-[#0A66FF] h-full rounded-full transition-all duration-500"
                style={{ width: `${progressMetrics.overallPercentage}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-600 pt-1">
              <span>Nodes Cleared: <strong>{progressMetrics.completedNodes} / {progressMetrics.totalNodes}</strong></span>
              <span>•</span>
              <span>Completed Lessons: <strong>{progressMetrics.completedLessons}</strong></span>
            </div>
          </div>

          {/* Milestone Nodes Flow */}
          <div className="space-y-6 relative">
            <div className="absolute left-8 top-4 bottom-4 w-0.5 bg-slate-200 -z-0" />

            {userRoadmap?.nodes.map((node, idx) => {
              const isCompleted = node.status === 'completed';
              const isInProgress = node.status === 'in_progress';
              const isAvailable = node.status === 'available' || isInProgress;

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className="relative pl-16 cursor-pointer group"
                >
                  {/* Node Circle */}
                  <div
                    className={`absolute left-5 top-4 w-7 h-7 rounded-full border-2 flex items-center justify-center font-mono text-xs font-bold transition-all ${
                      isCompleted
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                        : isInProgress || isAvailable
                        ? 'bg-[#0A66FF] border-[#0A66FF] text-white shadow-sm ring-4 ring-blue-100'
                        : 'bg-white border-slate-300 text-slate-400 group-hover:border-[#0A66FF]'
                    }`}
                  >
                    {isCompleted ? '✓' : idx + 1}
                  </div>

                  {/* Node Card */}
                  <div className={`bg-white rounded-3xl border p-6 shadow-sm group-hover:shadow-md transition-all space-y-3 ${
                    isCompleted
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : isInProgress
                      ? 'border-[#0A66FF] ring-1 ring-blue-500/20'
                      : 'border-slate-200/90 hover:border-[#0A66FF]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                        node.category === 'Foundation' ? 'bg-blue-50 text-[#0A66FF]' :
                        node.category === 'Language' ? 'bg-indigo-50 text-indigo-700' :
                        node.category === 'Core Skills' ? 'bg-purple-50 text-purple-700' :
                        node.category === 'Specialization' ? 'bg-amber-50 text-amber-900' :
                        'bg-emerald-50 text-emerald-800'
                      }`}>
                        {node.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">{node.estimatedHours} Hours</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          isCompleted ? 'bg-emerald-100 text-emerald-800' :
                          isInProgress ? 'bg-blue-100 text-[#0A66FF]' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {node.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-headline font-bold text-slate-900 text-lg group-hover:text-[#0A66FF] transition-colors">
                      {node.title}
                    </h3>
                    <p className="text-slate-600 text-xs leading-relaxed">{node.description}</p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {node.skills.map(skill => (
                        <span key={skill} className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0A66FF]">
                      <span>View Node Learning Package & Activities</span>
                      <span>Inspect →</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* NODE DETAIL PANEL / MODAL */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider">{selectedNode.category}</span>
                <h3 className="font-headline font-bold text-white text-lg">{selectedNode.title}</h3>
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <div className="p-6 space-y-5 text-xs text-slate-900 overflow-y-auto flex-1">
              <div>
                <label className="font-bold uppercase text-[10px] tracking-wider text-slate-400 block mb-1">What You&apos;ll Learn & Why It Matters</label>
                <p className="text-slate-700 leading-relaxed bg-blue-50/60 p-4 rounded-2xl border border-blue-100">{selectedNode.whyItMatters}</p>
              </div>

              <div>
                <label className="font-bold uppercase text-[10px] tracking-wider text-slate-400 block mb-1">Skills & Key Invariants</label>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.skills.map(s => (
                    <span key={s} className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 font-mono font-semibold">{s}</span>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold uppercase text-[10px] tracking-wider text-slate-400 block mb-1">Estimated Time</label>
                <span className="font-mono text-slate-700 font-semibold">{selectedNode.estimatedHours} Hours of interactive study</span>
              </div>

              {/* Recommended Activities Buttons */}
              <div className="border-t border-slate-100 pt-4 space-y-2">
                <label className="font-bold uppercase text-[10px] tracking-wider text-slate-400 block mb-2">Available Learning Activities</label>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={selectedNode.courseId ? `/courses/${selectedNode.courseId}` : '/explore'}
                    onClick={() => setSelectedNode(null)}
                    className="p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0A66FF] font-bold text-xs text-center border border-blue-200 transition-all"
                  >
                    📚 Start Lessons
                  </Link>
                  <Link
                    href="/practice"
                    onClick={() => setSelectedNode(null)}
                    className="p-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs text-center border border-purple-200 transition-all"
                  >
                    ⚡ Practice Questions
                  </Link>
                  <Link
                    href="/games"
                    onClick={() => setSelectedNode(null)}
                    className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs text-center border border-emerald-200 transition-all"
                  >
                    🎮 Play Game
                  </Link>
                  <Link
                    href="/projects"
                    onClick={() => setSelectedNode(null)}
                    className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs text-center border border-amber-200 transition-all"
                  >
                    🛠️ Capstone Project
                  </Link>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => setSelectedNode(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200"
              >
                Close Panel
              </button>
              <Link
                href={selectedNode.courseId ? `/courses/${selectedNode.courseId}` : '/explore'}
                onClick={() => setSelectedNode(null)}
                className="px-6 py-2.5 rounded-xl bg-[#0A66FF] hover:bg-[#0052DB] text-white text-xs font-bold shadow-md transition-all"
              >
                Open Course Curriculum →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <MultiStepLearningBuilder
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        onRoadmapGenerated={(updated) => setUserRoadmap(updated)}
      />
      <ChangeTechnologyModal
        isOpen={isChangeTechOpen}
        onClose={() => { setIsChangeTechOpen(false); loadData(); }}
      />
    </ProtectedRoute>
  );
}