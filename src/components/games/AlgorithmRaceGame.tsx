'use client';

import React, { useState, useEffect } from 'react';
import GameShell from './GameShell';

interface AlgorithmRaceGameProps {
  onClose: () => void;
}

const SCENARIOS = [
  {
    id: 1,
    task: 'Search target key 42 in a sorted array of 1,000,000 elements.',
    options: [
      { name: 'Binary Search', complexity: 'O(log N)', steps: 20, isCorrect: true, explanation: 'Binary Search cuts search space by 50% each step, finding key in log2(1,000,000) ≈ 20 iterations.' },
      { name: 'Linear Search', complexity: 'O(N)', steps: 500000, isCorrect: false, explanation: 'Linear Search checks elements sequentially, taking 500,000 steps on average.' },
      { name: 'Bubble Sort + Search', complexity: 'O(N^2)', steps: 1000000000, isCorrect: false, explanation: 'Re-sorting an already sorted array takes massive redundant O(N^2) iterations.' }
    ]
  },
  {
    id: 2,
    task: 'Find shortest path between two router nodes in a network graph with non-negative edge weights.',
    options: [
      { name: 'Dijkstra Algorithm', complexity: 'O((V + E) log V)', steps: 45, isCorrect: true, explanation: 'Dijkstra algorithm calculates exact shortest paths efficiently using a min-priority queue.' },
      { name: 'Breadth-First Search (BFS)', complexity: 'O(V + E)', steps: 120, isCorrect: false, explanation: 'Standard BFS only works for unweighted graphs, ignoring link edge weights.' },
      { name: 'Brute-force Path Enumeration', complexity: 'O(V!)', steps: 999999, isCorrect: false, explanation: 'Enumerating all simple paths leads to factorial explosive complexity.' }
    ]
  }
];

export default function AlgorithmRaceGame({ onClose }: AlgorithmRaceGameProps) {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [selectedAlgo, setSelectedAlgo] = useState<number | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const scenario = SCENARIOS[scenarioIdx];

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isSimulating && selectedAlgo !== null) {
      const targetSteps = scenario.options[selectedAlgo].steps;
      timer = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= Math.min(targetSteps, 30)) {
            setIsSimulating(false);
            if (timer) clearInterval(timer);
            return Math.min(targetSteps, 30);
          }
          return prev + 1;
        });
      }, 50);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSimulating, selectedAlgo, scenario.options]);

  const handleSelectAlgo = (idx: number, setScore: React.Dispatch<React.SetStateAction<number>>, onCompleteGame: (score: number, accuracy: number) => void) => {
    setSelectedAlgo(idx);
    setCurrentStep(0);
    setIsSimulating(true);

    const option = scenario.options[idx];
    if (option.isCorrect) {
      setScore(prev => prev + 50);
      setFeedback(`✅ Excellent Choice! ${option.name} (${option.complexity}) is optimal. ${option.explanation}`);

      if (scenarioIdx < SCENARIOS.length - 1) {
        setTimeout(() => {
          setScenarioIdx(prev => prev + 1);
          setSelectedAlgo(null);
          setFeedback(null);
        }, 3000);
      } else {
        setTimeout(() => {
          onCompleteGame(100, 100);
        }, 2500);
      }
    } else {
      setFeedback(`❌ Inefficient Algorithm! ${option.name} (${option.complexity}). ${option.explanation}`);
    }
  };

  return (
    <GameShell
      gameId="algorithm-race"
      title="Algorithm Race: Asymptotic Efficiency Challenge"
      subtitle="Select the optimal algorithmic structure for high-performance computing scenarios."
      difficulty="Beginner"
      skill="Data Structures & Algorithms"
      instructions={[
        'Read the computational engineering scenario.',
        'Compare time and space complexities (O(1), O(log N), O(N), O(N^2)).',
        'Select the most efficient algorithm and observe execution steps.'
      ]}
      onClose={onClose}
    >
      {({ setScore, onCompleteGame }) => (
        <div className="space-y-6">
          {/* Scenario Header */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2 text-xs">
            <div className="flex justify-between items-center font-mono">
              <span className="font-bold text-[#0A66FF] uppercase">Scenario #{scenario.id}</span>
              <span className="text-slate-400">Round {scenarioIdx + 1} of {SCENARIOS.length}</span>
            </div>
            <p className="text-slate-800 font-bold text-sm leading-relaxed">{scenario.task}</p>
          </div>

          {/* Algorithm Choices */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scenario.options.map((opt, idx) => {
              const isSelected = selectedAlgo === idx;
              let style = 'bg-white border-slate-200 hover:border-slate-300';
              if (isSelected) {
                style = opt.isCorrect ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold' : 'bg-red-50 border-red-500 text-red-950 font-bold';
              }

              return (
                <button
                  key={opt.name}
                  onClick={() => !isSimulating && handleSelectAlgo(idx, setScore, onCompleteGame)}
                  className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all space-y-3 ${style}`}
                >
                  <div>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0A66FF] text-[10px] font-mono font-bold block w-fit mb-2">
                      {opt.complexity}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{opt.name}</h4>
                  </div>
                  <span className="text-slate-500 text-[11px] font-mono">Est. Steps: {opt.steps.toLocaleString()}</span>
                </button>
              );
            })}
          </div>

          {/* Visual Simulation Bar */}
          {selectedAlgo !== null && (
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Executing {scenario.options[selectedAlgo].name}...</span>
                <span className="text-[#0A66FF] font-bold">{currentStep} / {Math.min(scenario.options[selectedAlgo].steps, 30)} Iterations</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-[#0A66FF] transition-all duration-75"
                  style={{ width: `${(currentStep / Math.min(scenario.options[selectedAlgo].steps, 30)) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <div className={`p-4 rounded-2xl text-xs font-mono leading-relaxed ${feedback.includes('Excellent') ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-red-50 text-red-900 border border-red-200'}`}>
              {feedback}
            </div>
          )}
        </div>
      )}
    </GameShell>
  );
}
