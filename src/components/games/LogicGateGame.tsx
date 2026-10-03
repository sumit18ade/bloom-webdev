'use client';

import React, { useState } from 'react';
import GameShell from './GameShell';

interface LogicGateGameProps {
  onClose: () => void;
}

export default function LogicGateGame({ onClose }: LogicGateGameProps) {
  const [inputA, setInputA] = useState(1);
  const [inputB, setInputB] = useState(0);
  const [gateType, setGateType] = useState<'AND' | 'OR' | 'NAND' | 'XOR'>('AND');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const computeOutput = (a: number, b: number, gate: string) => {
    if (gate === 'AND') return a && b ? 1 : 0;
    if (gate === 'OR') return a || b ? 1 : 0;
    if (gate === 'NAND') return !(a && b) ? 1 : 0;
    if (gate === 'XOR') return (a ^ b) ? 1 : 0;
    return 0;
  };

  const outputVal = computeOutput(inputA, inputB, gateType);

  const handleVerifyTruthTable = (setScore: React.Dispatch<React.SetStateAction<number>>, onCompleteGame: (score: number, accuracy: number) => void) => {
    if (gateType === 'NAND' || gateType === 'XOR') {
      setScore(100);
      setStatusMessage('✅ Universal Logic Gate Circuit Synthesized Correctly!');
      setTimeout(() => {
        onCompleteGame(100, 100);
      }, 1500);
    } else {
      setStatusMessage('💡 Universal circuit requires NAND or XOR gates for full truth table completeness.');
    }
  };

  return (
    <GameShell
      gameId="logic-gate-simulator"
      title="Logic Gate Challenge: Digital Circuit Synthesizer"
      subtitle="Synthesize combinational logic gates and verify binary truth table outputs for microcontrollers."
      difficulty="Beginner"
      skill="Digital Logic & Gates"
      instructions={[
        'Toggle input binary switches (A, B) between 0 (Ground) and 1 (VCC).',
        'Select the target logic gate (AND, OR, NAND, XOR).',
        'Verify digital truth table binary outputs.'
      ]}
      onClose={onClose}
    >
      {({ setScore, onCompleteGame }) => (
        <div className="space-y-6">
          {/* Circuit Interactive Workbench */}
          <div className="p-6 rounded-2xl bg-slate-900 text-white font-mono text-xs space-y-6 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Combinational Logic Schematic</span>
              <span className="text-emerald-400 font-bold">VCC = 5V</span>
            </div>

            <div className="flex items-center justify-around py-4">
              {/* Inputs */}
              <div className="space-y-4">
                <button
                  onClick={() => setInputA(inputA === 1 ? 0 : 1)}
                  className={`px-4 py-2 rounded-xl font-bold border transition-all text-xs ${inputA === 1 ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                >
                  Input A: {inputA}
                </button>
                <button
                  onClick={() => setInputB(inputB === 1 ? 0 : 1)}
                  className={`px-4 py-2 rounded-xl font-bold border transition-all text-xs ${inputB === 1 ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                >
                  Input B: {inputB}
                </button>
              </div>

              {/* Logic Gate Block */}
              <div className="p-4 rounded-2xl bg-purple-900/80 border border-purple-600 text-center font-bold text-purple-200 text-sm shadow-md">
                {gateType} GATE
              </div>

              {/* Output */}
              <div className="text-center space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block">Output Q</span>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 ${outputVal === 1 ? 'bg-emerald-500 border-emerald-300 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                  {outputVal}
                </div>
              </div>
            </div>
          </div>

          {/* Gate Selector */}
          <div className="space-y-2">
            <label className="font-mono text-[10px] text-slate-500 uppercase font-bold block">Select Logic Gate Type</label>
            <div className="grid grid-cols-4 gap-3">
              {(['AND', 'OR', 'NAND', 'XOR'] as const).map(g => (
                <button
                  key={g}
                  onClick={() => setGateType(g)}
                  className={`py-3 rounded-2xl border font-mono font-bold text-xs transition-all ${gateType === g ? 'border-[#0A66FF] bg-blue-50 text-[#0A66FF]' : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback */}
          {statusMessage && (
            <div className={`p-4 rounded-2xl text-xs font-mono ${statusMessage.includes('✅') ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-blue-50 text-blue-900 border border-blue-200'}`}>
              {statusMessage}
            </div>
          )}

          {/* Action */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => handleVerifyTruthTable(setScore, onCompleteGame)}
              className="px-6 py-2.5 rounded-xl bg-[#0A66FF] hover:bg-[#0052DB] text-white text-xs font-bold shadow-sm transition-all"
            >
              Synthesize Circuit →
            </button>
          </div>
        </div>
      )}
    </GameShell>
  );
}
