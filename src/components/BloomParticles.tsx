'use client';

import { useEffect, useRef } from 'react';

interface BloomParticlesProps {
  theme?: 'light' | 'dark';
  duration?: number; // total duration in ms
  isExiting?: boolean;
}

interface Particle {
  id: number;
  baseAngle: number;
  speed: number;
  orbitRadius: number;
  size: number;
  color: string;
  clusterIndex: number; // 0: top-right, 1: bottom-left, 2: bottom-right, 3: top-left
  phaseOffset: number;
  trailHistory: { x: number; y: number }[];
}

const PARTICLE_COLORS_LIGHT = [
  '#2563EB', // Electric Blue
  '#06B6D4', // Cyan
  '#8B5CF6', // Violet
  '#10B981', // Mint
  '#3B82F6', // Bright Blue
];

const PARTICLE_COLORS_DARK = [
  '#38BDF8', // Vivid Sky Blue
  '#22D3EE', // Cyan Glow
  '#A78BFA', // Light Violet
  '#34D399', // Mint Glow
  '#60A5FA', // Neon Blue
];

export default function BloomParticles({
  theme = 'light',
  duration = 3200,
  isExiting = false,
}: BloomParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let startTime: number | null = null;

    // Handle high DPI screens
    const updateSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    // Generate particles
    const particleCount = 96;
    const colors = theme === 'dark' ? PARTICLE_COLORS_DARK : PARTICLE_COLORS_LIGHT;

    const particles: Particle[] = Array.from({ length: particleCount }, (_, i) => {
      const clusterIndex = i % 4; // Map to 4 bloom petal directions
      return {
        id: i,
        baseAngle: (i / particleCount) * Math.PI * 2 + (Math.random() * 0.4 - 0.2),
        speed: 0.8 + Math.random() * 0.8,
        orbitRadius: 40 + Math.random() * 120,
        size: 1.5 + Math.random() * 2.2,
        color: colors[i % colors.length],
        clusterIndex,
        phaseOffset: Math.random() * Math.PI * 2,
        trailHistory: [],
      };
    });

    const render = (now: number) => {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);

      if (isExiting) {
        // Fade out canvas graphics quickly on skip/exit
        ctx.globalAlpha = Math.max(0, 1 - (elapsed % 450) / 450);
      }

      // Calculate timeline phases (0.0 to 1.0)
      // Phase 1 (0.0 - 0.14): Arrival & dust
      // Phase 2 & 3 (0.14 - 0.45): Activation & Bloom burst
      // Phase 4 & 5 (0.45 - 0.70): Petal expansion outward
      // Phase 6 (0.70 - 0.85): Reconverging spiral inward
      // Phase 7 & 8 (0.85 - 1.0): Lock in & dissolve

      let expansionFactor = 0;
      let globalOpacity = 0;
      let spiralAngleOffset = 0;

      if (progress < 0.14) {
        // Phase 1: Silent arrival
        const p1 = progress / 0.14;
        globalOpacity = p1 * 0.6;
        expansionFactor = 0.2 + p1 * 0.15;
      } else if (progress < 0.45) {
        // Phase 2 & 3: Activation & Bloom burst
        const p2 = (progress - 0.14) / 0.31;
        globalOpacity = 0.6 + p2 * 0.4;
        expansionFactor = 0.35 + Math.sin(p2 * Math.PI * 0.5) * 0.65;
        spiralAngleOffset = p2 * 0.8;
      } else if (progress < 0.70) {
        // Phase 4 & 5: Petal expansion
        const p3 = (progress - 0.45) / 0.25;
        globalOpacity = 0.95 - p3 * 0.15;
        expansionFactor = 1.0 + Math.sin(p3 * Math.PI) * 0.45;
        spiralAngleOffset = 0.8 + p3 * 0.6;
      } else if (progress < 0.88) {
        // Phase 6: Reconverging spiral
        const p4 = (progress - 0.70) / 0.18;
        globalOpacity = 0.85 * (1 - p4 * 0.5);
        expansionFactor = (1.45 - p4 * 1.35); // Shrink back to center
        spiralAngleOffset = 1.4 + p4 * 1.5; // Fast inner spiral
      } else {
        // Phase 7 & 8: Dissolve
        const p5 = (progress - 0.88) / 0.12;
        globalOpacity = Math.max(0, 0.42 * (1 - p5));
        expansionFactor = 0.1;
        spiralAngleOffset = 2.9;
      }

      // Render each particle
      particles.forEach((p) => {
        // Cluster directional bias (top-right, bottom-left, bottom-right, top-left)
        let clusterAngle = 0;
        if (p.clusterIndex === 0) clusterAngle = -Math.PI * 0.25; // Top-Right
        if (p.clusterIndex === 1) clusterAngle = Math.PI * 0.75;  // Bottom-Left
        if (p.clusterIndex === 2) clusterAngle = Math.PI * 0.35;  // Bottom-Right
        if (p.clusterIndex === 3) clusterAngle = -Math.PI * 0.75; // Top-Left

        // Combine base angle, cluster angle bias, and spiral offset
        const currentAngle = p.baseAngle * 0.4 + clusterAngle * 0.6 + spiralAngleOffset * p.speed;
        const dist = p.orbitRadius * expansionFactor * (1 + Math.sin(elapsed * 0.002 + p.phaseOffset) * 0.15);

        const x = cx + Math.cos(currentAngle) * dist;
        const y = cy + Math.sin(currentAngle) * dist;

        // Draw glowing particle
        ctx.save();
        ctx.globalAlpha = globalOpacity * (0.6 + Math.sin(elapsed * 0.004 + p.phaseOffset) * 0.4);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = theme === 'dark' ? 12 : 6;
        ctx.fillStyle = p.color;

        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Optional tiny fading trail behind fast particles
        if (p.trailHistory.length > 0 && progress > 0.15 && progress < 0.85) {
          ctx.beginPath();
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size * 0.6;
          ctx.globalAlpha = globalOpacity * 0.3;
          ctx.moveTo(p.trailHistory[0].x, p.trailHistory[0].y);
          for (let k = 1; k < p.trailHistory.length; k++) {
            ctx.lineTo(p.trailHistory[k].x, p.trailHistory[k].y);
          }
          ctx.stroke();
        }

        ctx.restore();

        // Update trail position
        p.trailHistory.push({ x, y });
        if (p.trailHistory.length > 4) {
          p.trailHistory.shift();
        }
      });

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updateSize);
    };
  }, [theme, duration, isExiting]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      aria-hidden="true"
    />
  );
}
