'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface GameShellProps {
  gameId: string;
  title: string;
  subtitle: string;
  difficulty: string;
  skill: string;
  xpReward?: number;
  instructions: string[];
  onClose: () => void;
  children: (props: {
    score: number;
    setScore: React.Dispatch<React.SetStateAction<number>>;
    onCompleteGame: (finalScore: number, accuracy: number) => void;
  }) => React.ReactNode;
}

export default function GameShell({
  gameId,
  title,
  subtitle,
  difficulty,
  skill,
  xpReward = 50,
  instructions,
  onClose,
  children,
}: GameShellProps) {
  const { userData, refreshUserData } = useAuth();
  const [score, setScore] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalAccuracy, setFinalAccuracy] = useState(100);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && !showInstructions && !isCompleted) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, showInstructions, isCompleted]);

  const handleCompleteGame = async (gameScore: number, accuracy: number) => {
    setIsActive(false);
    setIsCompleted(true);
    setFinalAccuracy(accuracy);
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });

    if (userData) {
      try {
        await addDoc(collection(db, 'gameSessions'), {
          userId: userData.uid,
          gameId,
          score: gameScore,
          accuracy,
          timeSpent: seconds,
          difficulty,
          completed: true,
          completedAt: new Date(),
        });

        const userRef = doc(db, 'users', userData.uid);
        await updateDoc(userRef, {
          xp: (userData.xp || 0) + xpReward,
          updatedAt: new Date(),
        });
        await refreshUserData();
      } catch (err) {
        console.error('Error persisting game session to Firestore:', err);
      }
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainderSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] text-[#0A66FF] font-bold uppercase tracking-wider mb-1">
              <span>SIMULATION ENGINE</span>
              <span>•</span>
              <span className="text-purple-400">{difficulty}</span>
              <span>•</span>
              <span className="text-emerald-400">{skill}</span>
            </div>
            <h2 className="font-headline font-bold text-lg text-white">{title}</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono">
              ⏱️ <span className="text-slate-200 font-bold ml-1">{formatTime(seconds)}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono">
              ⭐ Score: <span className="text-[#0A66FF] font-bold ml-1">{score}</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-all text-sm font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Game Body */}
        <div className="p-6 flex-1 overflow-y-auto bg-[#FBFBFA]">
          {showInstructions ? (
            <div className="max-w-xl mx-auto py-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#0A66FF] flex items-center justify-center mx-auto text-2xl font-bold border border-blue-100 shadow-sm">
                🎮
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-xl mb-2">{title}</h3>
                <p className="text-slate-600 text-xs leading-relaxed">{subtitle}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-left space-y-2 text-xs">
                <span className="font-mono text-[10px] text-slate-400 uppercase font-bold block">Mission Instructions</span>
                <ul className="space-y-2 text-slate-700 list-disc list-inside leading-relaxed">
                  {instructions.map((inst, i) => (
                    <li key={i}>{inst}</li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setShowInstructions(false)}
                className="w-full py-3.5 rounded-2xl bg-[#0A66FF] hover:bg-[#0052DB] text-white text-xs font-bold shadow-md transition-all"
              >
                Start Simulation Mission →
              </button>
            </div>
          ) : isCompleted ? (
            <div className="max-w-md mx-auto py-8 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-3xl font-bold border border-emerald-200 shadow-sm">
                🏆
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-2xl mb-1">Mission Completed!</h3>
                <p className="text-slate-600 text-xs">Your telemetry performance has been verified and recorded.</p>
              </div>

              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-white border border-slate-200 text-center font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Score</span>
                  <span className="text-lg font-bold text-slate-900">{score}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Accuracy</span>
                  <span className="text-lg font-bold text-emerald-600">{finalAccuracy}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">XP Earned</span>
                  <span className="text-lg font-bold text-[#0A66FF]">+{xpReward}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setIsCompleted(false);
                    setScore(0);
                    setSeconds(0);
                    setIsActive(true);
                  }}
                  className="flex-1 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
                >
                  Play Again 🔄
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all"
                >
                  Continue →
                </button>
              </div>
            </div>
          ) : (
            children({ score, setScore, onCompleteGame: handleCompleteGame })
          )}
        </div>
      </div>
    </div>
  );
}
