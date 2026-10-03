'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProgress, Activity } from '@/types/firestore';
import { ENGINEERING_BRANCHES as BRANCHES } from '@/lib/taxonomy';

export default function ProgressPage() {
  const { userData } = useAuth();
  const [progressItems, setProgressItems] = useState<UserProgress[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProgressData() {
      if (userData) {
        try {
          const progQ = query(collection(db, 'userProgress'), where('userId', '==', userData.uid));
          const progSnap = await getDocs(progQ);
          setProgressItems(progSnap.docs.map(d => d.data() as UserProgress));

          const actQ = query(collection(db, 'activity'), where('userId', '==', userData.uid));
          const actSnap = await getDocs(actQ);
          setActivities(actSnap.docs.map(d => d.data() as Activity));
        } catch (e) {
          console.error('Error loading progress data:', e);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
    loadProgressData();
  }, [userData]);

  const branchKey = userData?.engineeringBranch || userData?.engineeringField || 'Computer Science';
  const branchInfo = BRANCHES[branchKey] || BRANCHES['Computer Science'];

  const completedCount = progressItems.filter(p => p.completed).length;
  const xp = userData?.xp || 0;
  const streak = userData?.currentStreak || 0;
  const level = userData?.level || 1;

  if (loading) {
    return (
      <ProtectedRoute>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center bg-[#FBFBFA]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#0A66FF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-mono text-xs text-slate-500">Loading Skill Garden...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Navigation />
      <main className="min-h-screen bg-[#FBFBFA] text-[#0F172A] pb-24">
        <div className="max-w-6xl mx-auto px-6 pt-8">
          {/* Header */}
          <div className="mb-8">
            <span className="text-[11px] font-bold font-mono text-[#0A66FF] uppercase tracking-wider block">
              MASTERY & SKILL GARDEN · {branchInfo.shortName}
            </span>
            <h1 className="font-headline text-3xl font-bold tracking-tight text-slate-900">
              Your Learning Mastery & Growth
            </h1>
          </div>

          {/* Real Metric Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-mono text-slate-500 uppercase">Total XP</span>
              <div className="font-headline text-2xl font-bold text-slate-900">{xp} XP</div>
              <span className="text-[10px] text-slate-400 font-mono">Level {level} Engineer</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-mono text-slate-500 uppercase">Learning Streak</span>
              <div className="font-headline text-2xl font-bold text-amber-600 flex items-center gap-1">
                <span>🔥</span> {streak} Days
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Consecutive Study</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-mono text-slate-500 uppercase">Lessons Completed</span>
              <div className="font-headline text-2xl font-bold text-emerald-600">{completedCount}</div>
              <span className="text-[10px] text-slate-400 font-mono">Verified Units</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-mono text-slate-500 uppercase">Logged Activities</span>
              <div className="font-headline text-2xl font-bold text-[#0A66FF]">{activities.length}</div>
              <span className="text-[10px] text-slate-400 font-mono">Real Sessions</span>
            </div>
          </div>

          {/* Skill Garden (SVG Growth States) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm mb-10 space-y-6">
            <div>
              <h2 className="font-headline font-bold text-slate-900 text-lg">🌸 Your Skill Garden</h2>
              <p className="text-slate-600 text-xs mt-0.5">
                Skills bloom as you complete lessons and practice active recall.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {(branchInfo.subjects || []).map((subject: string, idx: number) => {
                const isMastered = completedCount > idx;
                return (
                  <div
                    key={subject}
                    className={`p-4 rounded-2xl border text-center space-y-2 transition-all ${
                      isMastered
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className="text-3xl">
                      {isMastered ? '🌸' : idx === 0 ? '🌿' : '🌱'}
                    </div>
                    <div className="font-bold text-xs">{subject}</div>
                    <div className="text-[10px] font-mono uppercase font-semibold">
                      {isMastered ? 'Mastered' : idx === 0 ? 'In Growth' : 'Seed State'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real Activity Stream */}
          <div>
            <h2 className="font-headline font-bold text-slate-900 text-lg mb-4">Activity History</h2>
            {activities.length > 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-sm">
                {activities.map((act, i) => (
                  <div key={i} className="p-4 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-900">{act.description}</span>
                    <span className="font-mono text-slate-400 text-[10px]">Verified Log</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm space-y-2">
                <span className="text-2xl">🌱</span>
                <h3 className="font-bold text-slate-800 text-sm">Your Bloom journey starts here.</h3>
                <p className="text-slate-500 text-xs max-w-sm mx-auto">
                  Complete your first lesson or practice challenge to start growing your skill garden!
                </p>
                <div className="pt-2">
                  <Link
                    href="/explore"
                    className="inline-block px-4 py-2 rounded-xl bg-[#0A66FF] text-white text-xs font-semibold"
                  >
                    Start First Lesson →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}