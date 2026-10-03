'use client';

import { useEffect, useState, useCallback } from 'react';
import BloomParticles from './BloomParticles';
import './BloomIntro.css';

export interface BloomIntroProps {
  onComplete: () => void;
  theme?: 'light' | 'dark';
  skipEnabled?: boolean;
}

export default function BloomIntro({
  onComplete,
  theme = 'light',
  skipEnabled = true,
}: BloomIntroProps) {
  const [phase, setPhase] = useState<'intro' | 'exit'>('intro');

  const skip = useCallback(() => {
    if (!skipEnabled || phase === 'exit') return;

    setPhase('exit');
    const timer = setTimeout(() => {
      onComplete();
    }, 380);

    return () => clearTimeout(timer);
  }, [skipEnabled, phase, onComplete]);

  useEffect(() => {
    // 2.5s: Sequence reaches brand lock-in
    // 2.55s: Start smooth 400ms fade-out transition directly revealing the page beneath
    const exitTimer = setTimeout(() => {
      setPhase('exit');
    }, 2550);

    // 2.95s: Complete transition and unmount intro overlay
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2950);

    // Keyboard accessibility: ESC or Space bar to skip
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ') {
        e.preventDefault();
        skip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onComplete, skip]);

  return (
    <div
      className={`bloom-intro bloom-intro--${theme} ${
        phase === 'exit' ? 'is-exiting' : ''
      }`}
      onClick={skip}
      role="presentation"
      aria-label="Bloom Brand Introduction Sequence"
    >
      {/* Particle Bloom Engine */}
      <BloomParticles theme={theme} duration={2950} isExiting={phase === 'exit'} />

      {/* Main Bloom Logo Mark */}
      <div className="bloom-mark-container">
        <div className="bloom-mark">
          <svg
            viewBox="0 0 200 200"
            className="bloom-logo-svg"
            aria-label="Bloom Mark"
          >
            <defs>
              <linearGradient id="petalBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#22D3EE" />
              </linearGradient>

              <linearGradient id="petalMintGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5EEAD4" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>

              <linearGradient id="petalVioletGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#4F46E5" />
              </linearGradient>

              <linearGradient id="petalIndigoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#312E81" />
                <stop offset="100%" stopColor="#2563EB" />
              </linearGradient>
            </defs>

            <g className="bloom-petals">
              {/* Top Petal */}
              <path
                className="petal petal-top"
                fill="url(#petalBlueGrad)"
                d="M100 22C131 28 151 52 145 77C139 98 113 103 91 89C72 77 66 51 78 35C83 28 91 24 100 22Z"
              />

              {/* Left Petal */}
              <path
                className="petal petal-left"
                fill="url(#petalMintGrad)"
                d="M35 108C45 89 66 82 83 95C98 106 96 128 80 143C66 156 43 155 34 138C29 129 29 117 35 108Z"
              />

              {/* Right Petal */}
              <path
                className="petal petal-right"
                fill="url(#petalVioletGrad)"
                d="M117 99C137 91 158 101 167 119C176 137 167 157 149 168C130 179 107 170 101 150C95 130 100 106 117 99Z"
              />

              {/* Center Accent Petal */}
              <path
                className="petal petal-center"
                fill="url(#petalIndigoGrad)"
                d="M99 88C114 83 128 91 132 105C136 119 128 131 114 135C100 139 87 131 84 118C81 104 87 93 99 88Z"
              />
            </g>
          </svg>
        </div>

        {/* Wordmark & Tagline */}
        <div className="bloom-typography-wrapper">
          <div className="bloom-wordmark">Bloom</div>
          <div className="bloom-tagline">
            LEARN · EXPLORE · BUILD · BLOOM
          </div>
        </div>
      </div>

      {/* Skip Action Pill */}
      {skipEnabled && (
        <button
          type="button"
          className="bloom-skip-button"
          onClick={(e) => {
            e.stopPropagation();
            skip();
          }}
          aria-label="Skip introduction animation"
        >
          <span>Skip</span>
          <span className="text-[10px] opacity-60">↵</span>
        </button>
      )}
    </div>
  );
}
