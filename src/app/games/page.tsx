'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ENGINEERING_BRANCHES } from '@/lib/taxonomy';
import { assembleUnifiedLearningContext, getRecommendedGamesForUser } from '@/lib/recommendations';

// Interactive Game Modal Components
import SqlDetectiveGame from '@/components/games/SqlDetectiveGame';
import AlgorithmRaceGame from '@/components/games/AlgorithmRaceGame';
import PacketRunnerGame from '@/components/games/PacketRunnerGame';
import LossCurveGame from '@/components/games/LossCurveGame';
import LogicGateGame from '@/components/games/LogicGateGame';
import DebugDuelGame from '@/components/games/DebugDuelGame';

export default function GamesPage() {
  const { userData } = useAuth();
  const [activeGameModal, setActiveGameModal] = useState<string | null>(null);
  const [userGameScores, setUserGameScores] = useState<Record<string, number>>({});
  const [gameSessionsList, setGameSessionsList] = useState<Array<{ id: string; userId: string; gameId: string; score: number; completed: boolean; completedAt?: Date }>>([]);
  const [loading, setLoading] = useState(true);

  const branchKey = userData?.engineeringBranch || userData?.engineeringField || 'Computer Science';
  const branchInfo = ENGINEERING_BRANCHES[branchKey] || ENGINEERING_BRANCHES['Computer Science'];
  const activeTech = userData?.activeTechnology || 'C';

  const reloadGameSessions = async () => {
    if (userData) {
      try {
        const q = query(collection(db, 'gameSessions'), where('userId', '==', userData.uid));
        const snapshot = await getDocs(q);
        const scores: Record<string, number> = {};
        const sessionsArr: Array<{ id: string; userId: string; gameId: string; score: number; completed: boolean; completedAt?: Date }> = [];
        
        snapshot.docs.forEach(docSnap => {
          const data = docSnap.data();
          const gameId = data.gameId as string;
          const score = (data.score as number) || 0;
          scores[gameId] = Math.max(scores[gameId] || 0, score);
          sessionsArr.push({
            id: docSnap.id,
            userId: userData.uid,
            gameId,
            score,
            completed: !!data.completed,
            completedAt: data.completedAt?.toDate ? data.completedAt.toDate() : undefined
          });
        });

        setUserGameScores(scores);
        setGameSessionsList(sessionsArr);
      } catch (err) {
        console.error('Error loading game sessions from Firestore:', err);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadGameSessions();
  }, [userData]);

  const ctx = assembleUnifiedLearningContext(userData, [], gameSessionsList);
  const games = getRecommendedGamesForUser(userData);

  const handleModalClose = () => {
    setActiveGameModal(null);
    reloadGameSessions();
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center bg-[#FBFBFA]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#0A66FF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-mono text-xs text-slate-500">Initializing Bloom simulation engine...</p>
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-[#0A66FF] font-bold uppercase tracking-wider mb-1">
                <span>GAMIFIED SIMULATION ENGINE</span>
                <span>•</span>
                <span>{branchInfo.shortName}</span>
                <span>•</span>
                <span>{activeTech}</span>
              </div>
              <h1 className="font-headline text-3xl font-bold tracking-tight text-slate-900">
                Engineering Simulations & Interactive Games
              </h1>
              <p className="text-slate-600 text-xs mt-1">
                Real interactive simulations for {branchInfo.name} ({activeTech}). Test concepts with execution models, network routing, and query engines.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-700 shadow-sm">
                Played: {gameSessionsList.length} Sessions
              </div>
            </div>
          </div>

          {/* Active Path Spotlight */}
          <div className="mb-8 p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-[#0A66FF] uppercase">YOUR ACTIVE PATH SPOTLIGHT</span>
              <h3 className="font-headline font-bold text-xl text-white">
                {ctx.activeNode.title} Simulation
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed max-w-2xl">
                Master hardware memory, algorithm efficiency, and systems analysis required for your goal as a <strong>{ctx.careerGoal}</strong>.
              </p>
            </div>

            <button
              onClick={() => setActiveGameModal(games[0]?.id || 'algorithm-race')}
              className="px-6 py-3 rounded-2xl bg-[#0A66FF] hover:bg-[#0052DB] text-white text-xs font-bold shadow-md transition-all whitespace-nowrap"
            >
              Launch Featured Simulation →
            </button>
          </div>

          {/* Games Catalog Grid */}
          <div className="space-y-4">
            <h2 className="font-headline text-lg font-bold text-slate-900">
              Recommended Games for {branchInfo.shortName} ({activeTech})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map(game => {
                const bestScore = userGameScores[game.id];
                return (
                  <div
                    key={game.id}
                    className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all group"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="px-2.5 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-mono font-bold">
                          {game.difficulty}
                        </span>
                        {bestScore ? (
                          <span className="text-xs font-mono font-bold text-emerald-600">
                            Best Score: {bestScore}
                          </span>
                        ) : (
                          <span className="text-xs font-mono text-slate-400">
                            Not played yet
                          </span>
                        )}
                      </div>

                      <h3 className="font-headline font-bold text-slate-900 text-base mb-2 group-hover:text-[#0A66FF] transition-colors">
                        {game.title}
                      </h3>
                      <p className="text-slate-600 text-xs leading-relaxed mb-4">{game.description}</p>
                    </div>

                    <button
                      onClick={() => setActiveGameModal(game.id)}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-[#0A66FF] text-white text-xs font-semibold shadow-sm transition-all text-center"
                    >
                      Play Simulation →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Render Specific Interactive Game Modal */}
      {activeGameModal === 'sql-detective' && (
        <SqlDetectiveGame onClose={handleModalClose} />
      )}
      {activeGameModal === 'algorithm-race' && (
        <AlgorithmRaceGame onClose={handleModalClose} />
      )}
      {activeGameModal === 'packet-runner' && (
        <PacketRunnerGame onClose={handleModalClose} />
      )}
      {activeGameModal === 'model-trainer' && (
        <LossCurveGame onClose={handleModalClose} />
      )}
      {activeGameModal === 'logic-gate-simulator' && (
        <LogicGateGame onClose={handleModalClose} />
      )}
      {(activeGameModal === 'c-debug-duel' || (activeGameModal && !['sql-detective', 'algorithm-race', 'packet-runner', 'model-trainer', 'logic-gate-simulator'].includes(activeGameModal))) && (
        <DebugDuelGame onClose={handleModalClose} />
      )}
    </ProtectedRoute>
  );
}