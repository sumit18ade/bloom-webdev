'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, where, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import confetti from 'canvas-confetti';
import { getRecommendedProjectsForUser } from '@/lib/recommendations';
import { ENGINEERING_BRANCHES as BRANCHES } from '@/lib/taxonomy';
import type { Project, ProjectProgress } from '@/types/firestore';

export default function ProjectsPage() {
  const { userData, refreshUserData } = useAuth();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [completedMilestones, setCompletedMilestones] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const branchKey = userData?.engineeringBranch || userData?.engineeringField || 'Computer Science';
  const branchInfo = BRANCHES[branchKey] || BRANCHES['Computer Science'];
  const projects = getRecommendedProjectsForUser(userData);

  useEffect(() => {
    async function loadProjectProgress() {
      if (userData && selectedProject) {
        try {
          const q = query(
            collection(db, 'projectProgress'),
            where('userId', '==', userData.uid),
            where('projectId', '==', selectedProject.id)
          );
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            const data = snapshot.docs[0].data() as ProjectProgress;
            setCompletedMilestones(data.completedMilestones || []);
          } else {
            setCompletedMilestones([]);
          }
        } catch (err) {
          console.error('Error loading project progress:', err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
    loadProjectProgress();
  }, [userData, selectedProject]);

  const toggleMilestone = async (milestoneId: string) => {
    if (!userData || !selectedProject) return;

    const newMilestones = completedMilestones.includes(milestoneId)
      ? completedMilestones.filter(m => m !== milestoneId)
      : [...completedMilestones, milestoneId];

    setCompletedMilestones(newMilestones);

    try {
      const progressRef = doc(db, 'projectProgress', `${userData.uid}_${selectedProject.id}`);
      await setDoc(progressRef, {
        id: `${userData.uid}_${selectedProject.id}`,
        userId: userData.uid,
        projectId: selectedProject.id,
        currentStage: newMilestones.length === selectedProject.milestones.length ? 'Complete' : 'Build',
        completedMilestones: newMilestones,
        updatedAt: new Date(),
      }, { merge: true });

      // If milestone completed, award XP!
      if (!completedMilestones.includes(milestoneId)) {
        confetti({ particleCount: 50, spread: 60 });
        const userRef = doc(db, 'users', userData.uid);
        await updateDoc(userRef, {
          xp: (userData.xp || 0) + 50,
          updatedAt: new Date(),
        });
        await refreshUserData();
      }
    } catch (err) {
      console.error('Error updating project milestone:', err);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center bg-[#FBFBFA]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#0A66FF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-mono text-xs text-slate-500">Loading project build system...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Navigation />
      <main className="min-h-screen bg-[#FBFBFA] text-[#0F172A] pb-24">
        <div className="max-w-7xl mx-auto px-6 pt-8">
          {/* Header */}
          <div className="mb-8">
            <span className="text-[11px] font-bold font-mono text-[#0A66FF] uppercase tracking-wider block">
              CAPSTONE BUILD SYSTEM · {branchInfo.shortName}
            </span>
            <h1 className="font-headline text-3xl font-bold tracking-tight text-slate-900">
              Guided Engineering Projects
            </h1>
            <p className="text-slate-600 text-xs mt-1">
              Build production-grade systems, REST APIs, AI pipelines, and embedded hardware nodes with milestone verification.
            </p>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Project List */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="font-bold text-slate-900 text-sm">Recommended Projects</h2>
              {projects.map((p: Project) => {
                const isSelected = selectedProject?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProject(p)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all text-xs space-y-2 ${
                      isSelected
                        ? 'border-[#0A66FF] bg-blue-50/60 shadow-sm ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 text-sm">{p.title}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-mono font-bold text-slate-600">
                        {p.difficulty}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">{p.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 font-mono text-[10px] text-slate-400">
                      <span>{p.estimatedTime} Hours</span>
                      <span className="text-[#0A66FF] font-bold">Inspect Workspace →</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Project Detail / Workspace */}
            <div className="lg:col-span-2">
              {selectedProject ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
                  <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                    <div>
                      <span className="px-2.5 py-0.5 rounded bg-blue-50 text-[#0A66FF] font-mono text-xs font-bold uppercase">
                        {selectedProject.difficulty} Project
                      </span>
                      <h2 className="font-headline text-2xl font-bold text-slate-900 mt-2">{selectedProject.title}</h2>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                      ~{selectedProject.estimatedTime}h Estimated
                    </span>
                  </div>

                  {/* Overview */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">Project Overview</h3>
                    <p className="text-slate-600 text-xs leading-relaxed">{selectedProject.overview}</p>
                  </div>

                  {/* Requirements */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Prerequisites & Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.skills.map(s => (
                        <span key={s} className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 font-mono text-xs font-semibold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Milestone Checklist */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">Project Milestone Stages</h3>
                    <div className="space-y-3">
                      {selectedProject.milestones.map(m => {
                        const isDone = completedMilestones.includes(m.id);
                        return (
                          <div
                            key={m.id}
                            onClick={() => toggleMilestone(m.id)}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                              isDone
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={() => {}}
                              className="mt-0.5 rounded text-[#0A66FF] focus:ring-0 cursor-pointer"
                            />
                            <div>
                              <div className="font-bold text-xs">{m.title}</div>
                              <div className="text-[11px] text-slate-500 mt-0.5">{m.description}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm space-y-3">
                  <span className="material-symbols-outlined text-4xl text-slate-400">construction</span>
                  <h3 className="font-bold text-slate-900 text-base">Select a Capstone Project</h3>
                  <p className="text-slate-500 text-xs max-w-sm mx-auto">
                    Choose a project from the left shelf to inspect milestones and track real development progress.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}