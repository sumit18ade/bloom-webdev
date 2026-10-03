'use client';

import React, { useState } from 'react';
import GameShell from './GameShell';

interface LossCurveGameProps {
  onClose: () => void;
}

export default function LossCurveGame({ onClose }: LossCurveGameProps) {
  const [learningRate, setLearningRate] = useState(0.01);
  const [batchSize, setBatchSize] = useState(32);
  const [epochs, setEpochs] = useState(20);
  const [result, setResult] = useState<{ loss: number; valLoss: number; status: 'converged' | 'overfitting' | 'exploding' } | null>(null);

  const handleTrainModel = (setScore: React.Dispatch<React.SetStateAction<number>>, onCompleteGame: (score: number, accuracy: number) => void) => {
    let loss = 0.8;
    let valLoss = 0.85;
    let status: 'converged' | 'overfitting' | 'exploding' = 'converged';

    if (learningRate >= 0.5) {
      status = 'exploding';
      loss = 12.4;
      valLoss = 15.8;
    } else if (epochs > 35 && batchSize < 16) {
      status = 'overfitting';
      loss = 0.02;
      valLoss = 0.65;
    } else {
      status = 'converged';
      loss = 0.12;
      valLoss = 0.14;
    }

    setResult({ loss, valLoss, status });

    if (status === 'converged') {
      setScore(100);
      setTimeout(() => {
        onCompleteGame(100, 96);
      }, 1500);
    }
  };

  return (
    <GameShell
      gameId="model-trainer"
      title="Loss Curve Challenge: AI Hyperparameter Optimizer"
      subtitle="Tune neural network learning rates, batch sizes, and epochs to achieve model convergence without overfitting."
      difficulty="Advanced"
      skill="Neural Networks & Machine Learning"
      instructions={[
        'Avoid high learning rates (> 0.1) that cause exploding gradient loss.',
        'Avoid tiny batch sizes with excessive epochs that cause validation loss divergence (overfitting).',
        'Target a converged loss < 0.2 with matching validation loss.'
      ]}
      onClose={onClose}
    >
      {({ setScore, onCompleteGame }) => (
        <div className="space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-xs">
            <div>
              <label className="font-mono text-[10px] text-slate-500 uppercase font-bold block mb-1">
                Learning Rate (α): <span className="text-[#0A66FF] font-bold">{learningRate}</span>
              </label>
              <input
                type="range"
                min="0.001"
                max="0.8"
                step="0.01"
                value={learningRate}
                onChange={e => setLearningRate(parseFloat(e.target.value))}
                className="w-full accent-[#0A66FF]"
              />
            </div>

            <div>
              <label className="font-mono text-[10px] text-slate-500 uppercase font-bold block mb-1">
                Batch Size: <span className="text-[#0A66FF] font-bold">{batchSize}</span>
              </label>
              <select
                value={batchSize}
                onChange={e => setBatchSize(parseInt(e.target.value, 10))}
                className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs outline-none"
              >
                <option value={8}>8 (Small / High Variance)</option>
                <option value={32}>32 (Standard)</option>
                <option value={128}>128 (Large / Smooth)</option>
              </select>
            </div>

            <div>
              <label className="font-mono text-[10px] text-slate-500 uppercase font-bold block mb-1">
                Epochs: <span className="text-[#0A66FF] font-bold">{epochs}</span>
              </label>
              <input
                type="range"
                min="5"
                max="50"
                value={epochs}
                onChange={e => setEpochs(parseInt(e.target.value, 10))}
                className="w-full accent-[#0A66FF]"
              />
            </div>
          </div>

          {/* Loss Curve Visualization Canvas Simulation */}
          <div className="p-6 rounded-2xl bg-slate-900 text-white font-mono text-xs space-y-4">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800 pb-2">
              <span>Training vs Validation Loss Curve</span>
              <span>Optimizer: Adam</span>
            </div>

            <div className="h-40 flex items-end justify-between gap-1 pt-4 px-2 border-l border-b border-slate-700">
              {Array.from({ length: 20 }).map((_, idx) => {
                let trainH = Math.max(10, 100 - idx * 4.5);
                let valH = Math.max(12, 100 - idx * 4.2);

                if (result?.status === 'exploding') {
                  trainH = Math.min(100, 20 + idx * 8);
                  valH = Math.min(100, 30 + idx * 9);
                } else if (result?.status === 'overfitting' && idx > 10) {
                  trainH = Math.max(5, 50 - idx * 2);
                  valH = Math.min(95, 30 + (idx - 10) * 6);
                }

                return (
                  <div key={idx} className="flex-1 flex items-end gap-0.5 h-full">
                    <div className="w-1/2 bg-[#0A66FF] rounded-t transition-all" style={{ height: `${trainH}%` }} />
                    <div className="w-1/2 bg-purple-400 rounded-t transition-all" style={{ height: `${valH}%` }} />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center gap-6 text-[10px] pt-1">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#0A66FF] rounded" /> Training Loss</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-purple-400 rounded" /> Validation Loss</div>
            </div>
          </div>

          {/* Result Status */}
          {result && (
            <div className={`p-4 rounded-2xl text-xs font-mono ${result.status === 'converged' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-red-50 text-red-900 border border-red-200'}`}>
              <div className="font-bold mb-1 uppercase">
                {result.status === 'converged' && '✅ Model Converged Successfully!'}
                {result.status === 'exploding' && '💥 Exploding Gradients! Learning rate is too high.'}
                {result.status === 'overfitting' && '⚠️ Overfitting Detected! Validation loss diverged.'}
              </div>
              <div>Training Loss: {result.loss} | Validation Loss: {result.valLoss}</div>
            </div>
          )}

          {/* Action */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => handleTrainModel(setScore, onCompleteGame)}
              className="px-6 py-2.5 rounded-xl bg-[#0A66FF] hover:bg-[#0052DB] text-white text-xs font-bold shadow-sm transition-all"
            >
              Run Epoch Simulation →
            </button>
          </div>
        </div>
      )}
    </GameShell>
  );
}
