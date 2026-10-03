'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import CustomizePathModal from '@/components/CustomizePathModal';
import Link from 'next/link';
import { ENGINEERING_BRANCHES as BRANCHES } from '@/lib/taxonomy';

export default function ProfilePage() {
  const { userData, signOut } = useAuth();
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  const branchKey = userData?.engineeringBranch || userData?.engineeringField || 'Computer Science';
  const branchInfo = BRANCHES[branchKey] || BRANCHES['Computer Science'];

  return (
    <ProtectedRoute>
      <Navigation />
      <main className="min-h-screen bg-[#FBFBFA] text-[#0F172A] pb-24">
        <div className="max-w-5xl mx-auto px-6 pt-8 space-y-8">
          {/* Header Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-[#0A66FF] text-white flex items-center justify-center font-headline font-bold text-2xl shadow-md">
                  {userData?.displayName?.charAt(0) || 'E'}
                </div>
                <div>
                  <h1 className="font-headline font-bold text-2xl text-slate-900">
                    {userData?.displayName || 'Engineer'}
                  </h1>
                  <p className="text-slate-500 text-xs mt-0.5">{userData?.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0A66FF] text-[11px] font-mono font-bold">
                      {branchInfo.shortName}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      Goal: {userData?.careerGoal || branchInfo.careerGoals[0]}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsCustomizeOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-[#0A66FF] hover:bg-[#0052DB] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2"
              >
                <span>✨</span>
                <span>Customize Path</span>
              </button>
            </div>

            {/* Metrics Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-center">
                <div className="font-mono text-2xl font-bold text-[#0A66FF]">{userData?.xp || 0}</div>
                <div className="font-mono text-[10px] font-bold text-blue-700 uppercase mt-1">Total XP</div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 text-center">
                <div className="font-mono text-2xl font-bold text-amber-600">{userData?.currentStreak || 0}d</div>
                <div className="font-mono text-[10px] font-bold text-amber-700 uppercase mt-1">Streak</div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-center">
                <div className="font-mono text-2xl font-bold text-indigo-600">Level {userData?.level || 1}</div>
                <div className="font-mono text-[10px] font-bold text-indigo-700 uppercase mt-1">Level</div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-center">
                <div className="font-mono text-2xl font-bold text-emerald-600">{userData?.dailyGoal || 30}m</div>
                <div className="font-mono text-[10px] font-bold text-emerald-700 uppercase mt-1">Daily Pacing</div>
              </div>
            </div>
          </div>

          {/* Active Learning Path Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h2 className="font-headline font-bold text-slate-900 text-lg">Active Path & Selected Subjects</h2>
              <button
                onClick={() => setIsCustomizeOpen(true)}
                className="text-xs font-mono font-bold text-[#0A66FF] hover:underline"
              >
                Change Path →
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-mono text-[10px] uppercase block">Selected Core Subjects</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {(userData?.selectedSubjects || branchInfo.subjects).map((s: string) => (
                    <span key={s} className="px-3 py-1 rounded-xl bg-blue-50 text-[#0A66FF] font-semibold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-mono text-[10px] uppercase block">Preferred Languages & Tools</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {(userData?.preferredLanguages || branchInfo.recommendedTechnologies).map((l: string) => (
                    <span key={l} className="px-3 py-1 rounded-xl bg-slate-900 text-white font-semibold">
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Account Footer */}
          <div className="flex justify-between items-center">
            <Link href="/settings" className="text-xs font-mono font-semibold text-slate-600 hover:text-slate-900">
              ⚙️ Account & Privacy Settings
            </Link>
            <button
              onClick={signOut}
              className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs"
            >
              Sign Out
            </button>
          </div>
        </div>
      </main>

      <CustomizePathModal isOpen={isCustomizeOpen} onClose={() => setIsCustomizeOpen(false)} />
    </ProtectedRoute>
  );
}