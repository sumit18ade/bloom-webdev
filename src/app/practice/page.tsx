'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import confetti from 'canvas-confetti';
import { ENGINEERING_BRANCHES } from '@/lib/taxonomy';
import { assembleUnifiedLearningContext, getUnifiedRecommendations } from '@/lib/recommendations';
import { getQuestionsForContext, PracticeQuestion } from '@/lib/question-bank';
import Link from 'next/link';

type PracticeMode = 
  | 'QUICK_5' 
  | 'FOCUSED_10' 
  | 'DEEP_PRACTICE' 
  | 'WEAK_AREA' 
  | 'ROADMAP' 
  | 'EXAM' 
  | 'RANDOM';

interface AttemptRecord {
  userId: string;
  questionId: string;
  correct: boolean;
  concept?: string;
}

export default function PracticePage() {
  const { userData, refreshUserData } = useAuth();
  
  const branchKey = userData?.engineeringBranch || userData?.engineeringField || 'Computer Science';
  const activeTech = userData?.activeTechnology || 'C';
  const branchInfo = ENGINEERING_BRANCHES[branchKey] || ENGINEERING_BRANCHES['Computer Science'];

  const [attemptsHistory, setAttemptsHistory] = useState<AttemptRecord[]>([]);
  const [selectedMode, setSelectedMode] = useState<PracticeMode>('QUICK_5');
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const reloadUserAttempts = useCallback(async () => {
    if (!userData?.uid) return;
    try {
      const q = query(collection(db, 'practiceAttempts'), where('userId', '==', userData.uid));
      const snap = await getDocs(q);
      const records: AttemptRecord[] = snap.docs.map(d => ({
        userId: userData.uid,
        questionId: d.data().questionId,
        correct: !!d.data().correct,
        concept: d.data().concept || d.data().topic
      }));
      setAttemptsHistory(records);
    } catch (e) {
      console.warn('Notice: Practice attempts loading skipped:', e);
    }
  }, [userData?.uid]);

  useEffect(() => {
    reloadUserAttempts();
  }, [reloadUserAttempts]);

  const ctx = useMemo(() => {
    return assembleUnifiedLearningContext(userData, attemptsHistory);
  }, [userData, attemptsHistory]);

  const recs = useMemo(() => {
    return getUnifiedRecommendations(ctx);
  }, [ctx]);

  const startSession = useCallback((mode: PracticeMode) => {
    setSelectedMode(mode);
    setCurrentIndex(0);
    setSessionScore(0);
    setSessionSeconds(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setShowHint(false);
    setIsFinished(false);

    let count = 5;
    if (mode === 'FOCUSED_10') count = 10;
    if (mode === 'DEEP_PRACTICE' || mode === 'EXAM') count = 20;

    const loaded = getQuestionsForContext({
      branch: branchKey,
      activeTechnology: activeTech,
      skill: ctx.activeNode.skills[0] || activeTech,
      mode: mode === 'WEAK_AREA' ? 'WEAK_AREA' : undefined,
      weakSkills: ctx.weakSkills,
      limit: count
    });

    setQuestions(loaded);
  }, [branchKey, activeTech, ctx.activeNode.skills, ctx.weakSkills]);

  useEffect(() => {
    startSession('QUICK_5');
  }, [branchKey, activeTech]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (!isFinished && questions.length > 0) {
      timer = setInterval(() => {
        setSessionSeconds(s => s + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isFinished, questions.length]);

  const currentQ = questions[currentIndex];

  const handleGenerateAiQuestions = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/practice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch: branchKey,
          careerGoal: userData?.careerGoal || branchInfo.careerGoals[0],
          technology: activeTech,
          topic: ctx.weakSkills[0] || ctx.activeNode.title,
          difficulty: 'Intermediate',
          count: 5
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
          setCurrentIndex(0);
          setSessionScore(0);
          setSelectedOption(null);
          setIsSubmitted(false);
          setShowHint(false);
        }
      }
    } catch (err) {
      console.error('Error requesting AI practice questions:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedOption || !currentQ || !userData || isSubmitted) return;

    setIsSubmitted(true);
    const isCorrect = Array.isArray(currentQ.correctAnswer)
      ? currentQ.correctAnswer.includes(selectedOption)
      : selectedOption === currentQ.correctAnswer;

    if (isCorrect) {
      setSessionScore(prev => prev + 1);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }

    try {
      await addDoc(collection(db, 'practiceAttempts'), {
        userId: userData.uid,
        questionId: currentQ.id,
        userAnswer: selectedOption,
        correct: isCorrect,
        topic: currentQ.topic,
        concept: currentQ.topic,
        skill: currentQ.skills[0] || activeTech,
        difficulty: currentQ.difficulty,
        completedAt: new Date(),
      });

      const userRef = doc(db, 'users', userData.uid);
      await updateDoc(userRef, {
        xp: (userData.xp || 0) + (isCorrect ? 15 : 5),
        updatedAt: new Date(),
      });
      await refreshUserData();
      await reloadUserAttempts();
    } catch (err) {
      console.error('Error saving practice attempt:', err);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setSelectedOption(null);
      setIsSubmitted(false);
      setShowHint(false);
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainderSecs.toString().padStart(2, '0')}`;
  };

  return (
    <ProtectedRoute>
      <Navigation />
      <main className="min-h-screen bg-[#FBFBFA] text-[#0F172A] pb-24">
        <div className="max-w-4xl mx-auto px-6 pt-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-[#0A66FF] font-bold uppercase tracking-wider mb-1">
                <span>PRACTICE WORKSPACE</span>
                <span>•</span>
                <span>{branchInfo.shortName}</span>
                <span>•</span>
                <span>{activeTech}</span>
              </div>
              <h1 className="font-headline text-3xl font-bold tracking-tight text-slate-900">
                Practice what you&apos;re learning.
              </h1>
              <p className="text-slate-600 text-xs mt-1">
                Focused questions based on your current roadmap, skills and recent performance.
              </p>
            </div>

            <button
              onClick={handleGenerateAiQuestions}
              disabled={isGeneratingAi}
              className="px-4 py-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold font-mono border border-purple-200 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isGeneratingAi ? '✨ Generating Questions...' : '✨ Generate AI Practice'}
            </button>
          </div>

          {/* Mode Selector Tabs */}
          <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'QUICK_5', label: '⚡ Quick 5' },
              { id: 'FOCUSED_10', label: '🎯 Focused 10' },
              { id: 'DEEP_PRACTICE', label: '🔥 Deep 20' },
              { id: 'WEAK_AREA', label: '💡 Weak Area' },
              { id: 'ROADMAP', label: '🗺️ Roadmap' },
              { id: 'EXAM', label: '⏱️ Exam Mode' },
              { id: 'RANDOM', label: '🎲 Random' },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => startSession(m.id as PracticeMode)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${selectedMode === m.id ? 'bg-slate-900 text-white shadow-sm font-bold' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Top Status Summary Bar */}
          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-2xl bg-white border border-slate-200 text-xs font-mono shadow-sm">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Skill Target</span>
              <span className="font-bold text-slate-900 truncate block">{ctx.activeNode.skills[0] || activeTech}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Progress</span>
              <span className="font-bold text-[#0A66FF]">{currentIndex + 1} of {questions.length}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Session Time</span>
              <span className="font-bold text-slate-700">{formatTime(sessionSeconds)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Score</span>
              <span className="font-bold text-emerald-600">{sessionScore} Correct</span>
            </div>
          </div>

          {/* Main Question Card */}
          {!isFinished && currentQ ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm space-y-6">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0A66FF] font-bold">
                  {currentQ.topic}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-purple-600 font-bold px-2 py-0.5 rounded bg-purple-50">
                    {currentQ.difficulty}
                  </span>
                  <button
                    onClick={() => setShowHint(h => !h)}
                    className="text-slate-500 hover:text-[#0A66FF] transition-colors"
                  >
                    💡 Hint
                  </button>
                </div>
              </div>

              {/* Hint Drawer */}
              {showHint && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono">
                  💡 <strong>Socratic Hint:</strong> {currentQ.hint}
                </div>
              )}

              {/* Question Text */}
              <h2 className="font-bold text-slate-900 text-base md:text-lg whitespace-pre-line leading-relaxed">
                {currentQ.question}
              </h2>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options?.map(opt => {
                  const isSelected = selectedOption === opt;
                  const isCorrect = Array.isArray(currentQ.correctAnswer)
                    ? currentQ.correctAnswer.includes(opt)
                    : opt === currentQ.correctAnswer;

                  let btnStyle = 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white';
                  if (isSubmitted) {
                    if (isCorrect) {
                      btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                    } else if (isSelected) {
                      btnStyle = 'border-red-500 bg-red-50 text-red-900 font-bold';
                    }
                  } else if (isSelected) {
                    btnStyle = 'border-[#0A66FF] bg-blue-50 text-[#0A66FF] font-semibold ring-2 ring-blue-500/20';
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => !isSubmitted && setSelectedOption(opt)}
                      className={`w-full text-left p-4 rounded-2xl border text-xs font-medium transition-all ${btnStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Immediate Feedback Area */}
              {isSubmitted && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>💡 Concept Breakdown & Solution</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{currentQ.explanation}</p>
                  {currentQ.commonMistake && (
                    <div className="pt-2 text-amber-800 font-mono text-[11px]">
                      ⚠️ <strong>Common Pitfall:</strong> {currentQ.commonMistake}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                {!isSubmitted ? (
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedOption}
                    className="px-6 py-2.5 rounded-xl bg-[#0A66FF] hover:bg-[#0052DB] text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all"
                  >
                    {currentIndex < questions.length - 1 ? 'Next Question →' : 'View Final Report →'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Final Report View */
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
                🎯
              </div>

              <div>
                <h2 className="font-headline font-bold text-slate-900 text-2xl mb-1">Practice Session Complete</h2>
                <p className="text-slate-600 text-xs">Performance summary for {branchInfo.shortName} ({activeTech}).</p>
              </div>

              <div className="grid grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Accuracy</span>
                  <span className="text-xl font-bold text-emerald-600">
                    {questions.length > 0 ? Math.round((sessionScore / questions.length) * 100) : 0}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Correct</span>
                  <span className="text-xl font-bold text-slate-900">{sessionScore} / {questions.length}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Time Spent</span>
                  <span className="text-xl font-bold text-[#0A66FF]">{formatTime(sessionSeconds)}</span>
                </div>
              </div>

              {/* RECOMMENDED NEXT STEP */}
              <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-100 text-left space-y-3">
                <span className="font-mono text-[10px] font-bold text-[#0A66FF] uppercase">RECOMMENDED NEXT STEP</span>
                <h4 className="font-bold text-slate-900 text-sm">{recs.nextPractice.reason}</h4>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href={`/games`}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all"
                  >
                    Play {recs.nextGame.title} →
                  </Link>
                  <Link
                    href={`/mentor`}
                    className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all"
                  >
                    Ask Bloom Mentor →
                  </Link>
                  <button
                    onClick={() => startSession('QUICK_5')}
                    className="px-4 py-2.5 rounded-xl bg-[#0A66FF] text-white text-xs font-bold hover:bg-[#0052DB] transition-all"
                  >
                    Start New Practice Session 🔄
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
