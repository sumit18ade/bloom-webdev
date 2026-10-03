'use client';

import React, { useState } from 'react';
import GameShell from './GameShell';

interface DebugDuelGameProps {
  onClose: () => void;
}

const BUG_SNIPPETS = [
  {
    id: 1,
    language: 'C',
    title: 'Dangling Pointer Bug',
    code: `int* createBuffer() {\n    int temp = 42;\n    return &temp; // Bug line\n}`,
    options: [
      'Return pointer to heap allocated memory using malloc().',
      'Change return type to float.',
      'Pass temp by value instead of pointer.',
      'Add free(temp) before returning.'
    ],
    correctAnswerIdx: 0,
    explanation: 'Returning address of local stack variable `temp` creates a dangling pointer because `temp` is destroyed when stack frame exits.'
  },
  {
    id: 2,
    language: 'Python',
    title: 'Mutable Default Argument Bug',
    code: `def append_tag(tag, tags=[]): // Bug line\n    tags.append(tag)\n    return tags`,
    options: [
      'Use `tags=None` as default and initialize `tags = []` inside function.',
      'Use `tags=tuple()` as default.',
      'Add `@staticmethod` decorator.',
      'Use global keyword.'
    ],
    correctAnswerIdx: 0,
    explanation: 'In Python, default parameter list arguments are evaluated once at function definition time, sharing the single list instance across all calls.'
  }
];

export default function DebugDuelGame({ onClose }: DebugDuelGameProps) {
  const [snippetIdx, setSnippetIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  const snippet = BUG_SNIPPETS[snippetIdx];

  const handleFixBug = (setScore: React.Dispatch<React.SetStateAction<number>>, onCompleteGame: (score: number, accuracy: number) => void) => {
    if (selectedOpt === null) return;

    if (selectedOpt === snippet.correctAnswerIdx) {
      setScore(prev => prev + 50);
      setResultMsg(`✅ Bug Patched! ${snippet.explanation}`);

      if (snippetIdx < BUG_SNIPPETS.length - 1) {
        setTimeout(() => {
          setSnippetIdx(prev => prev + 1);
          setSelectedOpt(null);
          setResultMsg(null);
        }, 2000);
      } else {
        setTimeout(() => {
          onCompleteGame(100, 100);
        }, 1500);
      }
    } else {
      setResultMsg('❌ Patch Failed: The selected fix does not address memory safety or scope rules.');
    }
  };

  return (
    <GameShell
      gameId="c-debug-duel"
      title="Debug Duel: Code Leak & Memory Safety"
      subtitle="Inspect code snippets, identify pointer dangling or mutability bugs, and choose the correct production fix."
      difficulty="Intermediate"
      skill="Debugging & Code Safety"
      instructions={[
        'Examine the source code snippet for memory leaks or scoping bugs.',
        'Select the production-grade architectural fix.',
        'Verify compiler execution safety.'
      ]}
      onClose={onClose}
    >
      {({ setScore, onCompleteGame }) => (
        <div className="space-y-6">
          {/* Snippet Card */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white font-mono text-xs space-y-3 border border-slate-800 shadow-sm">
            <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase font-bold border-b border-slate-800 pb-2">
              <span>{snippet.language} Snippet: {snippet.title}</span>
              <span className="text-red-400 font-bold">Bug Detected</span>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 overflow-x-auto text-xs leading-relaxed">
              {snippet.code}
            </pre>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <label className="font-mono text-[10px] text-slate-500 uppercase font-bold block">Select Correct Bug Patch</label>
            <div className="space-y-2">
              {snippet.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedOpt(idx)}
                  className={`w-full text-left p-4 rounded-2xl border text-xs font-medium transition-all ${selectedOpt === idx ? 'border-[#0A66FF] bg-blue-50 text-[#0A66FF] font-bold' : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback */}
          {resultMsg && (
            <div className={`p-4 rounded-2xl text-xs font-mono ${resultMsg.includes('✅') ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-red-50 text-red-900 border border-red-200'}`}>
              {resultMsg}
            </div>
          )}

          {/* Action */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => handleFixBug(setScore, onCompleteGame)}
              disabled={selectedOpt === null}
              className="px-6 py-2.5 rounded-xl bg-[#0A66FF] hover:bg-[#0052DB] text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
            >
              Apply Bug Patch →
            </button>
          </div>
        </div>
      )}
    </GameShell>
  );
}
