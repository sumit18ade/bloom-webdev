'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import MultiStepLearningBuilder from '@/components/MultiStepLearningBuilder';
import ChangeTechnologyModal from '@/components/ChangeTechnologyModal';
import SearchModal from '@/components/SearchModal';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Course, UserProgress } from '@/types/firestore';
import { seedCourses, seedProjects, seedGames } from '@/lib/seed-data';
import { ENGINEERING_BRANCHES } from '@/lib/taxonomy';
import { getRecommendedCoursesForUser, buildDynamicUserRoadmap } from '@/lib/recommendations';

export default function ExplorePage() {
  const { userData, refreshUserData } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  // Modals
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isChangeTechOpen, setIsChangeTechOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Quick Checkbox Selection State
  const [quickBranch, setQuickBranch] = useState<string>('Computer Science');
  const [quickSelectedSubjects, setQuickSelectedSubjects] = useState<string[]>(['C Programming', 'Data Structures']);

  const loadData = useCallback(async () => {
    try {
      // 1. Load published courses from Firestore or fallback to seed
      const coursesQuery = query(collection(db, 'courses'), where('published', '==', true));
      const coursesSnapshot = await getDocs(coursesQuery);
      const fetchedCourses = coursesSnapshot.docs.map(doc => doc.data() as Course);

      setCourses(fetchedCourses.length > 0 ? fetchedCourses : seedCourses);

      // 2. Load user progress if logged in
      if (userData) {
        const progressQuery = query(collection(db, 'userProgress'), where('userId', '==', userData.uid));
        const progressSnapshot = await getDocs(progressQuery);
        setUserProgress(progressSnapshot.docs.map(doc => doc.data() as UserProgress));
      }
    } catch (error) {
      console.error('Error loading explore data:', error);
      setCourses(seedCourses);
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeBranchKey = userData?.engineeringBranch || userData?.engineeringField || 'Computer Science';
  const branchInfo = ENGINEERING_BRANCHES[activeBranchKey] || ENGINEERING_BRANCHES['Computer Science'];
  const activeTech = userData?.activeTechnology || branchInfo.recommendedTechnologies[0] || 'C';

  // Filter courses by branch and level
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchSearch = !searchQuery.trim() ||
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchBranch = selectedBranchFilter === 'All' ||
        (course.branch && course.branch === selectedBranchFilter) ||
        (selectedBranchFilter === 'Computer Science' && ['c-programming', 'cpp-programming', 'java-programming', 'python-programming', 'data-structures-algorithms', 'database-systems', 'computer-networks', 'web-development'].includes(course.id)) ||
        (selectedBranchFilter === 'Electronics / ECE' && ['digital-electronics', 'microcontrollers-embedded', 'c-programming'].includes(course.id)) ||
        (selectedBranchFilter === 'Electrical' && ['circuit-theory', 'power-systems'].includes(course.id)) ||
        (selectedBranchFilter === 'Mechanical' && ['engineering-mechanics', 'thermodynamics-fluids'].includes(course.id)) ||
        (selectedBranchFilter === 'Civil' && ['structural-analysis'].includes(course.id));

      const matchLevel = selectedLevel === 'All' || course.level === selectedLevel;

      return matchSearch && matchBranch && matchLevel;
    });
  }, [courses, searchQuery, selectedBranchFilter, selectedLevel]);

  const recommendedCourses = useMemo(() => {
    return getRecommendedCoursesForUser(userData);
  }, [userData]);

  const toggleQuickSubject = (sub: string) => {
    setQuickSelectedSubjects(prev =>
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center bg-[#FBFBFA]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#0A66FF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-mono text-xs text-slate-500">Loading discovery engine...</p>
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
          {/* ========================================================== */}
          {/* HERO: BLOOM DISCOVERY ENGINE                               */}
          {/* ========================================================== */}
          <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-10 mb-10 border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 font-mono text-xs font-semibold mb-4">
                <span>BLOOM DISCOVERY ENGINE</span>
                <span>•</span>
                <span>{branchInfo.shortName}</span>
                <span>•</span>
                <span>ACTIVE: {activeTech}</span>
              </div>

              <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-3">
                What do you want to learn?
              </h1>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-8 max-w-2xl">
                Choose a subject, technology, or career direction and build your own personalized engineering learning path.
              </p>

              {/* Large Search Bar */}
              <div className="relative max-w-xl mb-6">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search skills, courses, languages (e.g. 'C', 'Python', 'React', 'SQL', 'CAD')..."
                  className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm outline-none focus:ring-2 focus:ring-[#0A66FF] transition-all"
                />
                <span className="material-symbols-outlined absolute left-4 top-3.5 text-slate-400 text-xl">
                  search
                </span>
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="absolute right-3 top-2.5 px-2.5 py-1 rounded-lg bg-white/20 text-slate-200 text-xs font-mono hover:bg-white/30"
                >
                  ⌘K
                </button>
              </div>

              {/* Primary Action Button */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => setIsBuilderOpen(true)}
                  className="px-8 py-3.5 rounded-2xl bg-[#0A66FF] hover:bg-[#0052DB] text-white text-sm font-bold shadow-lg transition-all flex items-center gap-2"
                >
                  <span>✨ BUILD MY LEARNING PATH</span>
                  <span>→</span>
                </button>
                <button
                  onClick={() => setIsChangeTechOpen(true)}
                  className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all flex items-center gap-2"
                >
                  <span>CHANGE TECHNOLOGY ({activeTech})</span>
                  <span>⚙️</span>
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================== */}
          {/* 1. YOUR ACTIVE PATH BAR                                    */}
          {/* ========================================================== */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 mb-10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-[#0A66FF] uppercase tracking-wider mb-1">
                <span>ACTIVE PATHING ENVIRONMENT</span>
                <span>•</span>
                <span>{userData?.careerGoal || branchInfo.careerGoals[0]}</span>
              </div>
              <h2 className="font-headline text-lg font-bold text-slate-900">
                {activeBranchKey} — Focused on <span className="text-[#0A66FF]">{activeTech}</span>
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/roadmap"
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-sm"
              >
                View Full Roadmap →
              </Link>
              <button
                onClick={() => setIsChangeTechOpen(true)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-all"
              >
                Change Tech ({activeTech})
              </button>
            </div>
          </div>

          {/* ========================================================== */}
          {/* 2. QUICK "BUILD YOUR PATH" CHECKBOX SELECTION              */}
          {/* ========================================================== */}
          <div className="bg-gradient-to-br from-blue-50/70 to-slate-50 border border-blue-200/80 rounded-3xl p-6 md:p-8 mb-12 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono font-bold text-[#0A66FF] uppercase tracking-wider">
                  INTERACTIVE PATH BUILDER
                </span>
                <h2 className="font-headline text-xl font-bold text-slate-900">Quick Subject & Technology Selector</h2>
              </div>
              <div className="flex items-center gap-2">
                {Object.keys(ENGINEERING_BRANCHES).slice(0, 4).map(b => (
                  <button
                    key={b}
                    onClick={() => {
                      setQuickBranch(b);
                      setQuickSelectedSubjects(ENGINEERING_BRANCHES[b].subjects.slice(0, 4));
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      quickBranch === b
                        ? 'bg-slate-900 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {ENGINEERING_BRANCHES[b].shortName}
                  </button>
                ))}
              </div>
            </div>

            {/* Checkboxes Grid */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Select Core Subjects for {quickBranch}:
              </label>
              <div className="flex flex-wrap gap-2">
                {ENGINEERING_BRANCHES[quickBranch]?.subjects.map(sub => {
                  const isSelected = quickSelectedSubjects.includes(sub);
                  return (
                    <button
                      key={sub}
                      onClick={() => toggleQuickSubject(sub)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        isSelected
                          ? 'bg-[#0A66FF] text-white border-[#0A66FF] shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {isSelected ? '✓ ' : '□ '}{sub}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Path Preview Bar */}
            <div className="bg-white rounded-2xl p-4 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div>
                <span className="font-bold text-slate-900 block mb-1">YOUR CUSTOM PATH PREVIEW:</span>
                <div className="flex flex-wrap items-center gap-1.5 text-slate-700 font-medium">
                  {quickSelectedSubjects.map((s, i) => (
                    <span key={s} className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0A66FF] font-semibold">{s}</span>
                      {i < quickSelectedSubjects.length - 1 && <span>→</span>}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setIsBuilderOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-[#0A66FF] hover:bg-[#0052DB] text-white font-bold transition-all shrink-0"
              >
                Generate Path →
              </button>
            </div>
          </div>

          {/* ========================================================== */}
          {/* 3. EXPLORE BY ENGINEERING BRANCH FILTER                    */}
          {/* ========================================================== */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-headline text-2xl font-bold text-slate-900">Explore Course Catalog</h2>
                <p className="text-xs text-slate-500 mt-0.5">Filter real curriculum courses by branch and level</p>
              </div>

              {/* Branch Filter Pills */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedBranchFilter('All')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedBranchFilter === 'All'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  All Branches
                </button>
                {Object.keys(ENGINEERING_BRANCHES).map(b => (
                  <button
                    key={b}
                    onClick={() => setSelectedBranchFilter(b)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      selectedBranchFilter === b
                        ? 'bg-[#0A66FF] text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {ENGINEERING_BRANCHES[b].shortName}
                  </button>
                ))}
              </div>
            </div>

            {/* Level Filter */}
            <div className="flex items-center gap-2 mb-6 text-xs font-mono text-slate-500">
              <span>Filter Level:</span>
              {['All', 'Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    selectedLevel === lvl ? 'bg-slate-200 font-bold text-slate-900' : 'hover:bg-slate-100'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="bg-white rounded-3xl border border-slate-200/90 hover:border-[#0A66FF]/40 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-0.5 rounded-full bg-blue-50 text-[#0A66FF] text-[11px] font-mono font-bold">
                        {course.level}
                      </span>
                      <span className="font-mono text-xs text-slate-400">
                        {course.estimatedHours} Hours
                      </span>
                    </div>

                    <h3 className="font-headline font-bold text-slate-900 text-base mb-2 group-hover:text-[#0A66FF] transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-slate-600 text-xs leading-relaxed line-clamp-2 mb-4">
                      {course.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {course.skills.slice(0, 4).map((skill) => (
                        <span key={skill} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0A66FF]">
                    <span>View Curriculum & Lessons</span>
                    <span>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ========================================================== */}
          {/* 4. FEATURED GAMES & SIMULATIONS                            */}
          {/* ========================================================== */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline text-xl font-bold text-slate-900">Engineering Games & Simulations</h2>
              <Link href="/games" className="text-xs font-mono text-[#0A66FF] font-semibold hover:underline">
                All Games →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {seedGames.slice(0, 3).map((game) => (
                <Link
                  key={game.id}
                  href="/games"
                  className="bg-white rounded-3xl border border-slate-200 p-6 hover:border-purple-300 transition-all flex flex-col justify-between group shadow-sm"
                >
                  <div>
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-xl">sports_esports</span>
                    </div>
                    <h3 className="font-headline font-bold text-slate-900 text-sm mb-1">{game.title}</h3>
                    <p className="text-slate-600 text-xs leading-relaxed">{game.description}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-purple-600 font-semibold">
                    <span>PLAY SIMULATION</span>
                    <span>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ========================================================== */}
          {/* 5. CAPSTONE PROJECTS                                       */}
          {/* ========================================================== */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline text-xl font-bold text-slate-900">Guided Capstone Projects</h2>
              <Link href="/projects" className="text-xs font-mono text-[#0A66FF] font-semibold hover:underline">
                All Projects →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {seedProjects.map((proj) => (
                <Link
                  key={proj.id}
                  href="/projects"
                  className="bg-white rounded-3xl border border-slate-200 p-6 hover:border-emerald-300 transition-all shadow-sm group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-headline font-bold text-slate-900 text-base group-hover:text-[#0A66FF] transition-colors">
                      {proj.title}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold">
                      {proj.difficulty}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed mb-4">{proj.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {proj.skills.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <MultiStepLearningBuilder
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
      />
      <ChangeTechnologyModal
        isOpen={isChangeTechOpen}
        onClose={() => setIsChangeTechOpen(false)}
      />
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </ProtectedRoute>
  );
}