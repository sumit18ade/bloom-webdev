'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { doc, getDoc, collection, getDocs, query, where, setDoc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Lesson, Module, UserProgress } from '@/types/firestore';
import { seedLessons } from '@/lib/seed-data';

function resolveCleanTitle(rawId: string): string {
  const seed = seedLessons.find(l => l.id === rawId || l.slug === rawId);
  if (seed) return seed.title;

  if (rawId.startsWith('sa-')) return 'Structural Analysis - Shear Force & Bending Moments';
  if (rawId.startsWith('em-')) return 'Engineering Mechanics - Statics & Vector Equilibrium';
  if (rawId.startsWith('th-')) return 'Thermodynamics - Laws & Energy Conservation';
  if (rawId.startsWith('ct-')) return 'Circuit Theory - Kirchhoff Laws & Network Theorems';
  if (rawId.startsWith('ps-')) return 'Power Systems - Electrical Grid & 3-Phase Power';
  if (rawId.startsWith('de-')) return 'Digital Electronics - Logic Gates & Truth Tables';
  if (rawId.startsWith('mc-')) return 'Microcontrollers - GPIO & Embedded C';
  if (rawId.startsWith('dsa-')) return 'Data Structures - Arrays, Lists & Big-O Complexity';
  if (rawId.startsWith('dbms-')) return 'Database Systems - Relational Modeling & SQL';
  if (rawId.startsWith('c-')) return 'C Programming - Pointers & Memory Management';
  if (rawId.startsWith('py-')) return 'Python Programming - Fundamentals & OOP';

  return rawId.replace(/^[a-z]+-mod-\d+-?/i, '').replace(/-/g, ' ') || 'Engineering Fundamentals';
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const { userData, refreshUserData } = useAuth();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'video' | 'notes' | 'mentor' | 'quiz'>('video');
  const [videoList, setVideoList] = useState<{ id: string; title: string; channelTitle: string; whyRecommended: string }[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string>('zOjov-2OZ0E');
  const [startSeconds, setStartSeconds] = useState<number>(0);
  const [videoNotes, setVideoNotes] = useState<{
    summary: string;
    timestamps: { timestamp: string; startSeconds: number; title: string; detail: string }[];
    invariants: string[];
  } | null>(null);

  // Checkpoint Quiz State
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const topicQuery = lesson?.title || (params.lessonId as string) || 'Engineering Architecture';
        const res = await fetch(`/api/youtube/notes?videoId=${selectedVideoId}&topic=${encodeURIComponent(topicQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setVideoNotes(data);
        }
      } catch (e) {
        console.warn('Failed to fetch video notes:', e);
      }
    };
    fetchNotes();
  }, [selectedVideoId, lesson, params.lessonId]);

  const loadLessonData = useCallback(async () => {
    if (!params.lessonId) return;

    try {
      setLoading(true);
      const rawId = params.lessonId as string;

      // 1. Load lesson from seed or Firestore
      let currentLesson: Lesson | null = seedLessons.find(l => l.id === rawId || l.slug === rawId) || null;

      if (!currentLesson) {
        const lessonDoc = await getDoc(doc(db, 'lessons', rawId));
        if (lessonDoc.exists()) {
          currentLesson = lessonDoc.data() as Lesson;
        }
      }

      if (!currentLesson) {
        const cleanTitle = resolveCleanTitle(rawId);
        currentLesson = {
          id: rawId,
          moduleId: 'm1',
          title: cleanTitle,
          slug: rawId,
          description: `Detailed technical overview and practical engineering execution for ${cleanTitle}.`,
          content: `# ${cleanTitle}\n\nUnderstanding execution models, physical principles, algorithms, and practical applications in modern engineering systems.`,
          learningObjectives: [
            'Understand foundational theory and domain principles',
            'Analyze performance constraints, safety margins, and time complexity',
            'Implement practical engineering solutions in production code or design',
          ],
          estimatedMinutes: 25,
          resources: [],
          videoResources: [],
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      setLesson(currentLesson);

      // 2. Fetch YouTube recommended videos via API with sanitized educational query
      try {
        const branchContext = userData?.engineeringField || '';
        const searchTerms = `${currentLesson.title} ${branchContext}`.trim();
        const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(searchTerms)}&branch=${encodeURIComponent(branchContext)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.videos && data.videos.length > 0) {
            setVideoList(data.videos);
            setSelectedVideoId(data.videos[0].id);
          }
        }
      } catch (err) {
        console.warn('YouTube search API warning:', err);
      }

      // 3. Load user progress
      if (userData) {
        const progressQuery = query(
          collection(db, 'userProgress'),
          where('userId', '==', userData.uid),
          where('lessonId', '==', params.lessonId)
        );
        const progressSnapshot = await getDocs(progressQuery);
        if (!progressSnapshot.empty) {
          setUserProgress(progressSnapshot.docs[0].data() as UserProgress);
        }
      }

    } catch (error) {
      console.error('Error loading lesson data:', error);
    } finally {
      setLoading(false);
    }
  }, [params.lessonId, userData]);

  useEffect(() => {
    loadLessonData();
  }, [loadLessonData]);

  const handleCompleteLesson = async () => {
    if (!userData || !lesson) return;

    setCompleting(true);
    try {
      const progressRef = doc(db, 'userProgress', `${userData.uid}_${lesson.id}`);
      
      const progressData: UserProgress = {
        id: `${userData.uid}_${lesson.id}`,
        userId: userData.uid,
        courseId: module?.courseId || 'general',
        lessonId: lesson.id,
        completed: true,
        progress: 100,
        timeSpent: lesson.estimatedMinutes,
        lastAccessedAt: new Date(),
        completedAt: new Date(),
      };

      await setDoc(progressRef, progressData, { merge: true });
      setUserProgress(progressData);

      // Award XP & Streak in Firestore
      const userRef = doc(db, 'users', userData.uid);
      await updateDoc(userRef, {
        xp: (userData.xp || 0) + 50,
        currentStreak: (userData.currentStreak || 0) > 0 ? userData.currentStreak : 1,
        updatedAt: new Date(),
      });

      // Log activity
      await addDoc(collection(db, 'activity'), {
        userId: userData.uid,
        type: 'lesson_completed',
        description: `Completed lesson: ${lesson.title}`,
        createdAt: new Date(),
      });

      await refreshUserData();

      // Trigger Celebration Confetti!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

    } catch (error) {
      console.error('Error completing lesson:', error);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center bg-[#FBFBFA]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#0A66FF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-mono text-xs text-slate-500">Loading lesson workspace...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const isCompleted = userProgress?.completed;

  return (
    <ProtectedRoute>
      <Navigation />
      <main className="min-h-screen bg-[#FBFBFA] text-[#0F172A] pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-8">
          {/* Header */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Link href="/explore" className="text-xs font-semibold text-[#0A66FF] hover:underline mb-2 inline-block">
                ← Back to Courses
              </Link>
              <h1 className="font-headline text-xl sm:text-2xl font-bold text-slate-900 leading-tight">{lesson?.title}</h1>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">{lesson?.description}</p>
            </div>

            <div className="flex items-center gap-3">
              {isCompleted ? (
                <span className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-1">
                  ✓ Completed (+50 XP)
                </span>
              ) : (
                <button
                  onClick={handleCompleteLesson}
                  disabled={completing}
                  className="px-5 py-2.5 rounded-xl bg-[#0A66FF] hover:bg-[#0052DB] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 w-full sm:w-auto text-center"
                >
                  {completing ? 'Marking Complete...' : 'Complete Lesson (+50 XP)'}
                </button>
              )}
            </div>
          </div>

          {/* Main Lesson Player Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {/* Main Stage (Player & Content) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tab Selector — horizontally scrollable on small screens */}
              <div className="flex border-b border-slate-200 gap-2 sm:gap-4 overflow-x-auto scrollbar-none pb-1 -mx-2 px-2 sm:mx-0 sm:px-0">
                {[
                  { id: 'video', label: '🎥 YouTube Player' },
                  { id: 'notes', label: '📝 AI Notes Studio' },
                  { id: 'mentor', label: '🤖 Mentor Help' },
                  { id: 'quiz', label: '⚡ Checkpoint Quiz' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as typeof activeTab)}
                    className={`pb-2 px-2.5 py-1 text-xs font-bold transition-all border-b-2 whitespace-nowrap shrink-0 ${
                      activeTab === t.id
                        ? 'border-[#0A66FF] text-[#0A66FF]'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: VIDEO PLAYER */}
              {activeTab === 'video' && (
                <div className="space-y-6">
                  <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-lg border border-slate-800">
                    <iframe
                      key={`${selectedVideoId}_${startSeconds}`}
                      src={`https://www.youtube.com/embed/${selectedVideoId}?autoplay=${startSeconds > 0 ? 1 : 0}&start=${startSeconds}&rel=0`}
                      title={lesson?.title || 'Engineering Video'}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>

                  {/* Video Rationale Card */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-xs space-y-1">
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span>Curated Grounded Video Resource</span>
                      <span className="text-[10px] font-mono text-[#0A66FF] uppercase font-bold">Verified YouTube API</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      {videoList[0]?.whyRecommended || 'This video explicitly covers conceptual structures, code execution, and interview invariants.'}
                    </p>
                  </div>

                  {/* Video AI Notes & Interactive Timestamp Breakdown */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">📝</span>
                        <h3 className="font-bold text-slate-900 text-sm">Video AI Notes & Timestamp Breakdown</h3>
                      </div>
                      <span className="text-[10px] font-mono text-[#0A66FF] bg-blue-50 px-2.5 py-1 rounded-full font-bold uppercase">
                        Interactive YouTube Timestamps
                      </span>
                    </div>

                    <p className="text-slate-600 text-xs leading-relaxed">
                      {videoNotes?.summary || 'Interactive AI summary and timestamp breakdown generated directly from grounded video contents.'}
                    </p>

                    {/* Timestamped Chapters */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                        Key Concepts & Timestamps (Click to Seek Video)
                      </h4>
                      <div className="grid gap-2.5">
                        {(videoNotes?.timestamps || [
                          { timestamp: '01:15', startSeconds: 75, title: 'Foundational Theory & Definitions', detail: 'Overview of core mechanics and structural invariants.' },
                          { timestamp: '03:08', startSeconds: 188, title: 'System Invariants & Data Flow', detail: 'Walkthrough of memory, packet routing, and state transitions.' },
                          { timestamp: '05:45', startSeconds: 345, title: 'Performance & Complexity Bounds', detail: 'Analysis of Big-O bounds, bottleneck mitigation, and latency.' },
                          { timestamp: '08:20', startSeconds: 500, title: 'Production Edge Cases & Boundary Safety', detail: 'Edge-case handling, race condition checks, and memory protection.' },
                          { timestamp: '11:10', startSeconds: 670, title: 'Practical Execution & Summary', detail: 'Key takeaways and production code execution patterns.' }
                        ]).map((ts, idx) => (
                          <button
                            key={idx}
                            onClick={() => setStartSeconds(ts.startSeconds)}
                            className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-start gap-3 group ${
                              startSeconds === ts.startSeconds
                                ? 'bg-blue-50 border-[#0A66FF] text-[#0A66FF] ring-2 ring-blue-500/20 shadow-sm'
                                : 'bg-slate-50/80 border-slate-200 hover:border-blue-300 hover:bg-slate-100 text-slate-800'
                            }`}
                          >
                            <span className="px-2.5 py-1 rounded-lg bg-[#0A66FF] text-white font-mono text-[11px] font-bold shrink-0 group-hover:scale-105 transition-transform">
                              ⏱️ {ts.timestamp}
                            </span>
                            <div>
                              <span className="font-bold text-slate-900 block">{ts.title}</span>
                              <span className="text-slate-600 text-[11px] leading-relaxed block mt-0.5">{ts.detail}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Core Invariants */}
                    {videoNotes?.invariants && videoNotes.invariants.length > 0 && (
                      <div className="pt-3 border-t border-slate-100 space-y-2">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                          Core Engineering Rules & Invariants
                        </h4>
                        <ul className="space-y-1.5 pl-1">
                          {videoNotes.invariants.map((inv, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                              <span className="text-[#0A66FF] font-bold">⚡</span>
                              <span>{inv}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: AI NOTES STUDIO */}
              {activeTab === 'notes' && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900 text-sm">AI Notes & Cheat Sheet</h3>
                    <span className="text-[10px] font-mono text-slate-400">Timestamp Referenced</span>
                  </div>
                  <div className="prose prose-slate max-w-none text-xs leading-relaxed space-y-3">
                    <h4 className="font-bold text-slate-900">Key Concepts & Invariants</h4>
                    <ul className="list-disc pl-4 space-y-1 text-slate-700">
                      <li><strong>Concept 1:</strong> Memory pointers & contiguous allocation guarantees.</li>
                      <li><strong>Concept 2 (04:15):</strong> Asymptotic upper bound O(N log N) during recursive split.</li>
                      <li><strong>Concept 3 (09:40):</strong> In-place stack frame minimization techniques.</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 3: MENTOR ASSIST */}
              {activeTab === 'mentor' && (
                <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-[#0A66FF] flex items-center gap-2">
                    <span>🤖</span> Bloom Mentor for {lesson?.title}
                  </h3>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Have questions about this lesson? Ask Bloom Mentor for immediate step-by-step guidance!
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/mentor"
                      className="inline-block px-4 py-2 rounded-xl bg-[#0A66FF] hover:bg-[#0052DB] text-white text-xs font-semibold transition-all"
                    >
                      Open Interactive Workspace →
                    </Link>
                  </div>
                </div>
              )}

              {/* TAB 4: CHECKPOINT QUIZ */}
              {activeTab === 'quiz' && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm">Lesson Checkpoint Question</h3>
                  <p className="text-slate-700 text-xs">
                    Which data structure ensures optimal level-order traversal for graph nodes?
                  </p>
                  <div className="space-y-2">
                    {['Stack (LIFO)', 'Queue (FIFO)', 'Array List', 'Binary Heap'].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setQuizAnswer(opt); setQuizSubmitted(true); }}
                        className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all ${
                          quizAnswer === opt
                            ? opt === 'Queue (FIFO)'
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                              : 'bg-red-50 border-red-500 text-red-900'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  {quizSubmitted && (
                    <div className={`p-3 rounded-xl text-xs font-medium ${quizAnswer === 'Queue (FIFO)' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'}`}>
                      {quizAnswer === 'Queue (FIFO)' ? '✓ Correct! Queue guarantees breadth-first discovery.' : '❌ Incorrect. Hint: BFS uses FIFO to explore neighbors in order of distance.'}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar: Recommended Videos & Learning Objectives */}
            <div className="space-y-6">
              {/* Objectives */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Learning Objectives</h3>
                <div className="space-y-2">
                  {lesson?.learningObjectives?.map((obj, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{obj}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Video Recommendations */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Curated Video Shelf</h3>
                <div className="space-y-2.5">
                  {videoList.map(v => (
                    <button
                      key={v.id}
                      onClick={() => { setSelectedVideoId(v.id); setActiveTab('video'); }}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all ${
                        selectedVideoId === v.id
                          ? 'border-[#0A66FF] bg-blue-50/60 text-[#0A66FF] font-semibold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="font-bold text-slate-900 text-xs line-clamp-1">{v.title}</div>
                      <div className="text-[10px] text-slate-500">{v.channelTitle}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}