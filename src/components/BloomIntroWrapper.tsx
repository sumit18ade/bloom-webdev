'use client';

import { useState, useEffect, ReactNode } from 'react';
import BloomIntro from './BloomIntro';

interface BloomIntroWrapperProps {
  children: ReactNode;
  theme?: 'light' | 'dark';
}

export default function BloomIntroWrapper({
  children,
  theme = 'light',
}: BloomIntroWrapperProps) {
  // Always show intro on page load / refresh as requested
  const [showIntro, setShowIntro] = useState<boolean>(true);

  // Keyboard shortcut Shift + B to manually trigger intro anytime
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === 'B' || e.key === 'b')) {
        setShowIntro(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#fbfbfa]">
      {/* Intro Overlay positioned fixed over all page content */}
      {showIntro && (
        <BloomIntro
          theme={theme}
          skipEnabled={true}
          onComplete={() => setShowIntro(false)}
        />
      )}

      {/* Underlying Page Content */}
      <div className="relative z-0 w-full min-h-screen bg-[#fbfbfa]">
        {children}
      </div>
    </div>
  );
}
