'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import AuthModal from '@/components/AuthModal';
import BloomLogo from '@/components/BloomLogo';

// --- 8-STAGE MASTERY LOOP DATA ---
const MASTERY_STAGES = [
  {
    id: 'discover',
    name: 'DISCOVER',
    num: '01',
    title: 'Curriculum & Gap Analysis',
    tagline: 'Upload your university syllabus or career track',
    description: 'Bloom parses your course syllabus PDF into an acyclic skill graph, identifying prerequisite foundations, university exam weightage, and critical gap areas.',
    features: [
      'Automated PDF syllabus parsing via Google Gemini',
      'Diagnostic baseline test covering core prerequisites',
      'Personalized pacing calendar synchronized with exam dates'
    ],
    previewType: 'syllabus'
  },
  {
    id: 'learn',
    name: 'LEARN',
    num: '02',
    title: 'Hyper-Concise Conceptual Sparks',
    tagline: 'Timestamped lecture moments mapped to mental models',
    description: 'Curated 8–12 minute video chapters from world-class engineering educators, annotated with timestamped concept definitions, mathematical formulas, and common pitfalls.',
    features: [
      'Grounded in real university lectures & top engineering channels',
      'Clickable timestamp chips jump directly to proof moments',
      'Checkpoint questions trigger at critical inflection timestamps'
    ],
    previewType: 'video'
  },
  {
    id: 'explore',
    name: 'EXPLORE',
    num: '03',
    title: 'Interactive Visual Sandboxes',
    tagline: 'Don\'t read about memory registers. Manipulate them.',
    description: 'Step into real-time computational models: inspect call stacks, step through graph traversals, route network packets, and inspect query plan execution trees.',
    features: [
      'In-browser execution without fake animations',
      'Real-time memory allocation & pointer visualization',
      'Variable-speed stepping with reverse call-stack replay'
    ],
    previewType: 'lab'
  },
  {
    id: 'practice',
    name: 'PRACTICE',
    num: '04',
    title: 'Adaptive Diagnostic Quizzes',
    tagline: 'Spaced retrieval with misconception classification',
    description: 'Adaptive quizzes that analyze not just whether an answer is wrong, but why. Every mistake is tagged with a cognitive misconception and automatically scheduled for spaced review.',
    features: [
      'FSRS algorithm predicts memory retention decay curves',
      'Misconception tagging: off-by-one, state mutation, recursion depth',
      'Automated micro-remediation paths before advancing'
    ],
    previewType: 'quiz'
  },
  {
    id: 'play',
    name: 'PLAY',
    num: '05',
    title: 'Systems Engineering Games',
    tagline: 'Turn brutal architecture concepts into competitive games',
    description: 'Gamified technical simulators where winning requires writing real SQL, computing subnet masks, routing TCP packets, or predicting algorithmic time bounds.',
    features: [
      'SQL Detective: Query live SQLite wasm to solve cases',
      'Packet Runner: Route OSI packets across CIDR subnets',
      'Algorithm Race: Benchmark sorts against worst-case inputs'
    ],
    previewType: 'game'
  },
  {
    id: 'build',
    name: 'BUILD',
    num: '06',
    title: 'Production Capstone Systems',
    tagline: 'Ship verifiable systems to your public GitHub',
    description: 'Move from isolated algorithms to production architecture: distributed key-value stores, raw-socket packet sniffers, and custom database storage engines.',
    features: [
      'Step-by-step milestone test suites executed via CLI',
      'Automated AI code review checking architecture & edge cases',
      'Verifiable Skill Passport badge linked directly to commits'
    ],
    previewType: 'project'
  },
  {
    id: 'master',
    name: 'MASTER',
    num: '07',
    title: 'Long-Term Retention & Garden',
    tagline: 'A living mental model that blooms as intuition grows',
    description: 'Skills are represented as living nodes that flourish with active practice and gently wilt when spaced review is overdue, keeping engineering knowledge razor sharp.',
    features: [
      'Deterministic mastery score based on difficulty and retention stability',
      'Automated recovery quizzes before upcoming interviews',
      'Shareable Skill Passport demonstrating verified technical depth'
    ],
    previewType: 'garden'
  },
];

// --- GRAPH LAB NODES FOR REAL SIMULATION ---
type GraphNode = { id: string; label: string; x: number; y: number; neighbors: string[] };

const GRAPH_NODES: GraphNode[] = [
  { id: 'A', label: 'A', x: 70, y: 70, neighbors: ['B', 'C'] },
  { id: 'B', label: 'B', x: 190, y: 40, neighbors: ['A', 'D', 'E'] },
  { id: 'C', label: 'C', x: 190, y: 120, neighbors: ['A', 'F'] },
  { id: 'D', label: 'D', x: 310, y: 30, neighbors: ['B'] },
  { id: 'E', label: 'E', x: 310, y: 85, neighbors: ['B'] },
  { id: 'F', label: 'F', x: 310, y: 140, neighbors: ['C'] },
];

export default function LandingPage() {
  // Global scroll progress for progress bar and parallax motion
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.18], [1, 0.75]);
  const heroY = useTransform(scrollYProgress, [0, 0.18], [0, -25]);
  const ambientGlowY = useTransform(scrollYProgress, [0, 1], [0, 250]);

  // Navigation elevation on scroll
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auth popup modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'forgot'>('signin');

  const openAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  // Check URL query parameters for ?auth=signin or ?auth=signup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const authParam = params.get('auth');
      if (authParam === 'signin' || authParam === 'signup') {
        setAuthModalMode(authParam);
        setAuthModalOpen(true);
      }
    }
  }, []);

  // The Bloom Method active stage
  const [activeStageIndex, setActiveStageIndex] = useState(1); // default to LEARN

  // Interactive Graph Traversal Lab state
  const [traversalMode, setTraversalMode] = useState<'bfs' | 'dfs'>('bfs');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Pre-calculated traversal steps for BFS & DFS starting at node A
  const bfsSteps = [
    { current: 'A', queue: ['A'], visited: ['A'], log: 'Start BFS: Enqueue root node A' },
    { current: 'A', queue: ['B', 'C'], visited: ['A'], log: 'Explore neighbors of A: Enqueue B and C' },
    { current: 'B', queue: ['C', 'D', 'E'], visited: ['A', 'B'], log: 'Dequeue B: Visit B and enqueue unvisited children D, E' },
    { current: 'C', queue: ['D', 'E', 'F'], visited: ['A', 'B', 'C'], log: 'Dequeue C: Visit C and enqueue unvisited child F' },
    { current: 'D', queue: ['E', 'F'], visited: ['A', 'B', 'C', 'D'], log: 'Dequeue D: Leaf node, no new neighbors' },
    { current: 'E', queue: ['F'], visited: ['A', 'B', 'C', 'D', 'E'], log: 'Dequeue E: Leaf node, no new neighbors' },
    { current: 'F', queue: [], visited: ['A', 'B', 'C', 'D', 'E', 'F'], log: 'Dequeue F: Traversal complete! All vertices visited in O(V + E)' },
  ];

  const dfsSteps = [
    { current: 'A', queue: ['A'], visited: ['A'], log: 'Start DFS: Push root node A onto call stack' },
    { current: 'B', queue: ['A', 'B'], visited: ['A', 'B'], log: 'Recurse into first neighbor B' },
    { current: 'D', queue: ['A', 'B', 'D'], visited: ['A', 'B', 'D'], log: 'Recurse deep into D (Leaf node reached)' },
    { current: 'E', queue: ['A', 'B', 'E'], visited: ['A', 'B', 'D', 'E'], log: 'Backtrack to B, then explore branch E' },
    { current: 'C', queue: ['A', 'C'], visited: ['A', 'B', 'D', 'E', 'C'], log: 'Backtrack to A, then explore branch C' },
    { current: 'F', queue: ['A', 'C', 'F'], visited: ['A', 'B', 'D', 'E', 'C', 'F'], log: 'Recurse into F: Traversal complete via call stack!' },
  ];

  const activeSteps = traversalMode === 'bfs' ? bfsSteps : dfsSteps;
  const currentStep = activeSteps[Math.min(currentStepIndex, activeSteps.length - 1)];

  // Simulation timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= activeSteps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1400);
    }
    return () => clearInterval(timer);
  }, [isPlaying, activeSteps.length]);

  const handleResetLab = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const handleStepLab = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => Math.min(prev + 1, activeSteps.length - 1));
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#0F172A] selection:bg-[#0A66FF]/15 selection:text-[#0A66FF] overflow-x-hidden">
      {/* Global Scroll Progress Indicator */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-[2.5px] bg-[#0A66FF] origin-left z-[100] shadow-[0_0_10px_rgba(10,102,255,0.7)]"
      />

      {/* ============================================================== */}
      {/* 1. HEADER / NAVIGATION                                         */}
      {/* ============================================================== */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#FBFBFA]/90 backdrop-blur-md border-b border-slate-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.02)]'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group">
            <BloomLogo size={34} showText={true} />
          </Link>

          {/* Primary Navigation */}
          <nav className="hidden md:flex items-center gap-7">
            <a
              href="#problem"
              className="text-[13px] font-medium text-slate-600 hover:text-[#0A66FF] transition-colors"
            >
              The Problem
            </a>
            <a
              href="#method"
              className="text-[13px] font-medium text-slate-600 hover:text-[#0A66FF] transition-colors"
            >
              The Method
            </a>
            <a
              href="#lab"
              className="text-[13px] font-medium text-slate-600 hover:text-[#0A66FF] transition-colors"
            >
              Interactive Labs
            </a>
            <a
              href="#roadmap"
              className="text-[13px] font-medium text-slate-600 hover:text-[#0A66FF] transition-colors"
            >
              Adaptive Roadmaps
            </a>
            <a
              href="#games"
              className="text-[13px] font-medium text-slate-600 hover:text-[#0A66FF] transition-colors"
            >
              Games
            </a>
            <a
              href="#mentor"
              className="text-[13px] font-medium text-slate-600 hover:text-[#0A66FF] transition-colors"
            >
              Mentor
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => openAuthModal('signin')}
              className="text-[13px] font-medium text-slate-600 hover:text-[#0F172A] px-3 py-1.5 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <motion.button
              type="button"
              onClick={() => openAuthModal('signup')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0A66FF] hover:bg-[#0052DB] text-white text-[13px] font-medium transition-all shadow-sm hover:shadow active:scale-[0.98] cursor-pointer"
            >
              <span>Start Learning</span>
              <span className="text-xs">→</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. HERO SECTION (ANIMATED & REFINED WITHOUT LIVE GRAPH BOX)    */}
      {/* ============================================================== */}
      <section className="relative pt-32 pb-24 md:pt-44 md:pb-32 px-6 overflow-hidden">
        {/* Subtle animated ambient gradient glow with scroll-driven movement */}
        <motion.div
          style={{ y: ambientGlowY }}
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.04, 0.08, 0.04],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-500 to-indigo-400 rounded-full blur-[100px] pointer-events-none"
        />

        {/* Subtle technical background grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(#0F172A 1px, transparent 1px), linear-gradient(to right, #0F172A 1px, transparent 1px), linear-gradient(to bottom, #0F172A 1px, transparent 1px)',
            backgroundSize: '40px 40px, 40px 40px, 40px 40px',
          }}
        />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="max-w-5xl mx-auto relative z-10 text-center"
        >
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#0F172A] max-w-4xl mx-auto leading-[1.12]"
          >
            Stop watching courses.
            <br />
            <span className="text-[#0A66FF]">Start building understanding.</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="font-sans text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mt-6 leading-relaxed"
          >
            Bloom transforms engineering curricula into an interactive journey of concepts,
            experiments, practice, games and real production projects.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex flex-wrap items-center justify-center gap-4 mt-8"
          >
            <motion.button
              type="button"
              onClick={() => openAuthModal('signup')}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#0A66FF] hover:bg-[#0052DB] text-white text-sm font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all cursor-pointer"
            >
              <span>Start Learning Free</span>
              <span>→</span>
            </motion.button>
            <motion.a
              href="#lab"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-all shadow-sm"
            >
              <span>Explore Interactive Labs</span>
            </motion.a>
          </motion.div>

          {/* Social Proof Strip */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="flex items-center justify-center gap-3 mt-10 text-xs text-slate-500 font-medium"
          >
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-700 shadow-sm">
                CS
              </div>
              <div className="w-7 h-7 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-[#0A66FF] shadow-sm">
                AI
              </div>
              <div className="w-7 h-7 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-emerald-700 shadow-sm">
                SYS
              </div>
            </div>
            <span>Engineered for computer science, software systems & engineering undergraduates</span>
          </motion.div>

          {/* ============================================================== */}
          {/* REPLACED HERO SHOWCASE: ANIMATED CAPABILITIES RAIL             */}
          {/* ============================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left"
          >
            {/* Card 1: Interactive Labs */}
            <motion.a
              href="#lab"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-[#0A66FF]/40 hover:shadow-md transition-all group block"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0A66FF] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 2v7.317a3 3 0 0 0 .75 1.996l4.5 5.374A3 3 0 0 1 13 22H7a3 3 0 0 1-2.25-5.313l4.5-5.374A3 3 0 0 0 10 9.317V2" />
                  <path d="M8.5 2h5" />
                  <path d="M7 16h10" />
                </svg>
              </div>
              <div className="font-mono text-[10px] font-bold text-[#0A66FF] uppercase tracking-wider">
                INTERACTIVE LABS
              </div>
              <h3 className="font-headline font-bold text-slate-900 text-sm mt-1">
                Touch the Algorithm
              </h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Step-by-step memory pointers, call stacks & live graph simulations in the browser.
              </p>
              <div className="mt-3 text-[11px] font-medium text-[#0A66FF] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                <span>Try BFS/DFS Lab</span>
                <span>↓</span>
              </div>
            </motion.a>

            {/* Card 2: Socratic Mentor */}
            <motion.a
              href="#mentor"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-indigo-400/40 hover:shadow-md transition-all group block"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a4.5 4.5 0 0 0-4.5 4.5c0 1.2.45 2.3 1.2 3.15L7 12.5A5.5 5.5 0 0 0 12.5 18H13v3h-2" />
                  <path d="M12 2a4.5 4.5 0 0 1 4.5 4.5c0 1.2-.45 2.3-1.2 3.15L17 12.5A5.5 5.5 0 0 1 11.5 18" />
                  <circle cx="12" cy="10" r="2" />
                </svg>
              </div>
              <div className="font-mono text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                BLOOM MENTOR
              </div>
              <h3 className="font-headline font-bold text-slate-900 text-sm mt-1">
                Video-Grounded AI
              </h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Never spoils answers. Delivers 3-level Socratic hints citing exact lecture timestamps.
              </p>
              <div className="mt-3 text-[11px] font-medium text-indigo-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                <span>View Mentor</span>
                <span>↓</span>
              </div>
            </motion.a>

            {/* Card 3: Engineering Games */}
            <motion.a
              href="#games"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-emerald-400/40 hover:shadow-md transition-all group block"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="6" y1="12" x2="10" y2="12" />
                  <line x1="8" y1="10" x2="8" y2="14" />
                  <circle cx="15" cy="13" r="1" fill="currentColor" />
                  <circle cx="18" cy="11" r="1" fill="currentColor" />
                  <rect x="2" y="6" width="20" height="12" rx="6" />
                </svg>
              </div>
              <div className="font-mono text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                WASM GAMES
              </div>
              <h3 className="font-headline font-bold text-slate-900 text-sm mt-1">
                SQL Detective
              </h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Investigate security cases with real SQLite wasm queries and CIDR packet routers.
              </p>
              <div className="mt-3 text-[11px] font-medium text-emerald-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                <span>Play Games</span>
                <span>↓</span>
              </div>
            </motion.a>

            {/* Card 4: Adaptive Pathways */}
            <motion.a
              href="#roadmap"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-amber-400/40 hover:shadow-md transition-all group block"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="6" cy="19" r="3" />
                  <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
                  <circle cx="18" cy="5" r="3" />
                </svg>
              </div>
              <div className="font-mono text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                ADAPTIVE DAG
              </div>
              <h3 className="font-headline font-bold text-slate-900 text-sm mt-1">
                Evolves With You
              </h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Syllabus parsed into acyclic skill paths with spaced retention decay tracking.
              </p>
              <div className="mt-3 text-[11px] font-medium text-amber-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                <span>See Roadmap</span>
                <span>↓</span>
              </div>
            </motion.a>
          </motion.div>

          {/* Animated Scroll Down Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-14 flex flex-col items-center justify-center gap-1 text-slate-400 text-[11px] font-mono select-none"
          >
            <span>SCROLL TO EXPLORE</span>
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className="text-[#0A66FF]"
            >
              <svg className="w-4.5 h-4.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ============================================================== */}
      {/* 3. THE PROBLEM SECTION (ANIMATED)                              */}
      {/* ============================================================== */}
      <section id="problem" className="py-24 px-6 border-t border-slate-200/70 bg-white relative">
        <div className="max-w-5xl mx-auto">
          {/* Eyebrow & Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="font-mono text-[11px] font-semibold text-[#0A66FF] tracking-wider uppercase">
              THE PROBLEM
            </span>
            <h2 className="font-headline text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A] mt-2 mb-4">
              Engineering education was built for passive watching.
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Videos create the illusion of competence. Real engineering intuition comes from
              breaking, inspecting, and synthesizing systems.
            </p>
          </motion.div>

          {/* Side-by-side contrast cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Card 1: Traditional Video Trap */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -3 }}
              className="rounded-3xl border border-red-200/80 bg-red-50/20 p-8 flex flex-col justify-between"
            >
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-red-100 text-red-700 font-mono text-[11px] font-semibold mb-6">
                  <span>TRADITIONAL LECTURE COURSES</span>
                </div>
                <h3 className="font-headline text-xl font-bold text-slate-900 mb-4">
                  The Passive Learning Trap
                </h3>
                <ul className="space-y-4 text-sm text-slate-600">
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-bold shrink-0">✕</span>
                    <span>
                      <strong>40+ hours of video</strong> watched at 1.5× speed forgotten within 72 hours.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-bold shrink-0">✕</span>
                    <span>
                      <strong>Copy-pasting boilerplate code</strong> without developing mental models of call stacks or memory.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-bold shrink-0">✕</span>
                    <span>
                      <strong>Blank-screen freeze</strong> during technical interviews and architectural design reviews.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-red-200/60 font-mono text-xs text-red-600 font-medium">
                Result: High drop-off, superficial understanding, zero retention.
              </div>
            </motion.div>

            {/* Card 2: The Bloom Active Loop */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -3 }}
              className="rounded-3xl border border-[#0A66FF] bg-[#0A66FF] text-white p-8 flex flex-col justify-between shadow-xl shadow-blue-500/10"
            >
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-white/20 text-white font-mono text-[11px] font-semibold mb-6">
                  <span>THE BLOOM METHOD</span>
                </div>
                <h3 className="font-headline text-xl font-bold mb-4">
                  The Active Mental Model Loop
                </h3>
                <ul className="space-y-4 text-sm text-blue-50">
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-300 font-bold shrink-0">✓</span>
                    <span>
                      <strong>Interactive Visual Sandboxes:</strong> Manipulate graph nodes, registers, and memory pointers in real time.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-300 font-bold shrink-0">✓</span>
                    <span>
                      <strong>Timestamp-Grounded AI Mentor:</strong> Cites precise lecture moments and code lines instead of spoiling answers.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-300 font-bold shrink-0">✓</span>
                    <span>
                      <strong>Production GitHub Capstones:</strong> Real distributed systems, packet sniffers, and database engines.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-white/20 font-mono text-xs text-blue-100 font-medium">
                Result: Server-verified mastery, retention decay tracking, deep intuition.
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. THE BLOOM METHOD (THE 8-STAGE MASTERY LOOP)                 */}
      {/* ============================================================== */}
      <section id="method" className="py-24 px-6 bg-[#FBFBFA] border-t border-slate-200/70">
        <div className="max-w-6xl mx-auto">
          {/* Eyebrow & Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <span className="font-mono text-[11px] font-semibold text-[#0A66FF] tracking-wider uppercase">
              THE BLOOM METHOD
            </span>
            <h2 className="font-headline text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A] mt-2 mb-4">
              The 8-Stage Cognitive Mastery Loop
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Every concept moves through an engineered sequence of active cognitive stages: from initial discovery to shipping verifiable code.
            </p>
          </motion.div>

          {/* Horizontal Stage Selector Tabs with Animated Glide */}
          <div className="flex items-center justify-start md:justify-center gap-1.5 overflow-x-auto pb-4 mb-8 no-scrollbar">
            {MASTERY_STAGES.map((stage, idx) => {
              const isActive = activeStageIndex === idx;
              return (
                <button
                  key={stage.id}
                  onClick={() => setActiveStageIndex(idx)}
                  className={`relative px-4 py-2 rounded-xl font-mono text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="absolute inset-0 bg-[#0A66FF] rounded-xl shadow-sm z-0"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className={`relative z-10 ${isActive ? 'text-blue-200 mr-1.5' : 'text-slate-400 mr-1.5'}`}>
                    {stage.num}
                  </span>
                  <span className="relative z-10">{stage.name}</span>
                </button>
              );
            })}
          </div>

          {/* Active Stage Interactive Showcase */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStageIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="grid lg:grid-cols-12 gap-8 items-center"
              >
                {/* Left Column: Stage Details */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="inline-flex items-center gap-2 font-mono text-xs text-[#0A66FF] font-bold uppercase tracking-wider">
                    <span>STAGE {MASTERY_STAGES[activeStageIndex].num}</span>
                    <span>•</span>
                    <span>{MASTERY_STAGES[activeStageIndex].name}</span>
                  </div>
                  <h3 className="font-headline text-2xl font-bold text-slate-900">
                    {MASTERY_STAGES[activeStageIndex].title}
                  </h3>
                  <p className="font-medium text-slate-700 text-sm">
                    {MASTERY_STAGES[activeStageIndex].tagline}
                  </p>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {MASTERY_STAGES[activeStageIndex].description}
                  </p>

                  <div className="pt-4 space-y-2.5">
                    {MASTERY_STAGES[activeStageIndex].features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-xs text-slate-700">
                        <span className="w-4 h-4 rounded-full bg-blue-50 text-[#0A66FF] flex items-center justify-center font-bold text-[10px]">
                          ✓
                        </span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Live Interface Mockup for this Stage */}
                <div className="lg:col-span-6">
                  <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 text-slate-200 font-mono text-xs shadow-xl">
                    {activeStageIndex === 1 ? (
                      // Video Grounding View (STAGE 02 / LEARN)
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <span className="text-[#0A66FF] font-bold">LECTURE STREAM • CS204</span>
                          <span className="text-slate-400">12:40 / 18:20</span>
                        </div>
                        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-300 font-bold">Chapter 3: BFS Queue Invariant</span>
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[10px]">
                              CHECKPOINT IMMINENT
                            </span>
                          </div>
                          <p className="text-slate-400 text-[11px] leading-relaxed">
                            Vertices are enqueued in strict non-decreasing order of distance from source s.
                          </p>
                        </div>
                        <div className="space-y-2">
                          <div className="text-[10px] text-slate-500 font-semibold uppercase">
                            Clickable Timestamp Chips (Auto-Seek):
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 cursor-pointer transition-colors">
                              ▶ 02:14 Call Stack Setup
                            </span>
                            <span className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 cursor-pointer transition-colors">
                              ▶ 05:40 Queue Enqueue Logic
                            </span>
                            <span className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 cursor-pointer transition-colors">
                              ▶ 09:12 Visited Set Check
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : activeStageIndex === 4 ? (
                      // Game View (STAGE 05 / PLAY)
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <span className="text-emerald-400 font-bold">SQL DETECTIVE • CASE #402</span>
                          <span className="text-slate-400">WASM SQLITE</span>
                        </div>
                        <p className="text-slate-300 text-xs">
                          Query the audit logs to identify the user who escalated privileges without approval:
                        </p>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-emerald-400">
                          <code>SELECT user_id, action, timestamp FROM security_events WHERE role = &apos;ADMIN&apos; AND verified = 0;</code>
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-slate-400">
                          <span>Answer validated against live database engine</span>
                          <span className="text-emerald-400 font-bold">MATCH: 1 RECORD</span>
                        </div>
                      </div>
                    ) : (
                      // Default Structured View
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="text-blue-400 font-bold">BLOOM PIPELINE</span>
                          <span className="text-slate-400">STAGE {MASTERY_STAGES[activeStageIndex].num}</span>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                          <div className="text-white font-bold text-sm">
                            {MASTERY_STAGES[activeStageIndex].title}
                          </div>
                          <div className="text-slate-400 text-xs">
                            {MASTERY_STAGES[activeStageIndex].description}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                          <span>Active Cognitive State: Verified</span>
                          <span className="text-[#0A66FF]">Progress: Continuous</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. INTERACTIVE LAB SECTION (REAL LIVE SIMULATION)              */}
      {/* ============================================================== */}
      <section id="lab" className="py-24 px-6 bg-white border-t border-slate-200/70">
        <div className="max-w-5xl mx-auto">
          {/* Eyebrow & Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-14"
          >
            <span className="font-mono text-[11px] font-semibold text-[#0A66FF] tracking-wider uppercase">
              INTERACTIVE LABS
            </span>
            <h2 className="font-headline text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A] mt-2 mb-4">
              Don&apos;t just read how a system works. Touch it.
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Real computational models right inside the browser. Step through algorithms, manipulate
              state queues, and build mental models that stick forever.
            </p>
          </motion.div>

          {/* Interactive Lab Widget */}
          <div className="rounded-3xl border border-slate-200/90 bg-[#FBFBFA] shadow-sm overflow-hidden">
            {/* Lab Header & Control Bar */}
            <div className="p-6 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="font-mono text-[11px] font-bold text-[#0A66FF] uppercase">
                  SIMULATION BENCH
                </span>
                <h3 className="font-headline text-lg font-bold text-slate-900">
                  Graph Traversal Lab (BFS vs DFS)
                </h3>
              </div>

              {/* Algorithm Switcher */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => {
                    setTraversalMode('bfs');
                    handleResetLab();
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    traversalMode === 'bfs'
                      ? 'bg-white text-[#0A66FF] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  BFS (Queue / Level-Order)
                </button>
                <button
                  onClick={() => {
                    setTraversalMode('dfs');
                    handleResetLab();
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    traversalMode === 'dfs'
                      ? 'bg-white text-[#0A66FF] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  DFS (Stack / Depth-First)
                </button>
              </div>

              {/* Player Controls */}
              <div className="flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-4 py-2 rounded-lg bg-[#0A66FF] hover:bg-[#0052DB] text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <span>{isPlaying ? '⏸ Pause' : '▶ Run Simulation'}</span>
                </motion.button>
                <button
                  onClick={handleStepLab}
                  disabled={currentStepIndex >= activeSteps.length - 1}
                  className="px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold disabled:opacity-50 transition-all cursor-pointer"
                >
                  ⏭ Step
                </button>
                <button
                  onClick={handleResetLab}
                  className="px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                >
                  ↺ Reset
                </button>
              </div>
            </div>

            {/* Visual Canvas and Data Structures Display */}
            <div className="p-8 grid md:grid-cols-12 gap-8 items-center">
              {/* Left: SVG Graph Canvas */}
              <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-center min-h-[280px] relative">
                <svg className="w-full max-w-[380px] h-[190px]" viewBox="0 0 380 180">
                  {/* Edges */}
                  <line x1="70" y1="70" x2="190" y2="40" stroke="#CBD5E1" strokeWidth="2" />
                  <line x1="70" y1="70" x2="190" y2="120" stroke="#CBD5E1" strokeWidth="2" />
                  <line x1="190" y1="40" x2="310" y2="30" stroke="#CBD5E1" strokeWidth="2" />
                  <line x1="190" y1="40" x2="310" y2="85" stroke="#CBD5E1" strokeWidth="2" />
                  <line x1="190" y1="120" x2="310" y2="140" stroke="#CBD5E1" strokeWidth="2" />

                  {/* Nodes */}
                  {GRAPH_NODES.map((node) => {
                    const isCurrent = currentStep.current === node.id;
                    const isVisited = currentStep.visited.includes(node.id);
                    const isInQueue = currentStep.queue.includes(node.id);

                    let fillColor = '#FFFFFF';
                    let strokeColor = '#94A3B8';
                    let textColor = '#0F172A';

                    if (isCurrent) {
                      fillColor = '#0A66FF';
                      strokeColor = '#004AC6';
                      textColor = '#FFFFFF';
                    } else if (isVisited) {
                      fillColor = '#ECFDF5';
                      strokeColor = '#10B981';
                      textColor = '#047857';
                    } else if (isInQueue) {
                      fillColor = '#FEF3C7';
                      strokeColor = '#F59E0B';
                      textColor = '#B45309';
                    }

                    return (
                      <g key={node.id} className="transition-all duration-300">
                        {isCurrent && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r="24"
                            fill="none"
                            stroke="#0A66FF"
                            strokeWidth="2"
                            className="animate-ping opacity-40"
                          />
                        )}
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="18"
                          fill={fillColor}
                          stroke={strokeColor}
                          strokeWidth="2.5"
                        />
                        <text
                          x={node.x}
                          y={node.y + 4}
                          textAnchor="middle"
                          fill={textColor}
                          fontSize="12"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                        >
                          {node.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* State Legend */}
                <div className="absolute bottom-3 left-4 flex items-center gap-3 text-[11px] font-mono text-slate-500">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0A66FF]" />
                    <span>Current</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Visited</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span>In {traversalMode === 'bfs' ? 'Queue' : 'Stack'}</span>
                  </div>
                </div>
              </div>

              {/* Right: Telemetry & Memory Buffer */}
              <div className="md:col-span-5 space-y-4">
                {/* Step Explanation */}
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-2">
                    <span>STEP {currentStepIndex + 1} OF {activeSteps.length}</span>
                    <span className="font-semibold text-[#0A66FF]">
                      {Math.round(((currentStepIndex + 1) / activeSteps.length) * 100)}% COMPLETE
                    </span>
                  </div>
                  <p className="text-slate-800 text-sm font-medium leading-snug">
                    {currentStep.log}
                  </p>
                </div>

                {/* Active Memory Buffer (Queue or Stack) */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 font-mono text-xs">
                  <div className="text-slate-500 text-[10px] font-bold uppercase mb-2">
                    ACTIVE DATA STRUCTURE ({traversalMode === 'bfs' ? 'FIFO QUEUE' : 'LIFO CALL STACK'}):
                  </div>
                  <div className="flex items-center gap-1.5 min-h-[32px]">
                    {currentStep.queue.length > 0 ? (
                      currentStep.queue.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold"
                        >
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic font-sans text-xs">Buffer Empty</span>
                    )}
                  </div>
                </div>

                {/* Visited Set */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 font-mono text-xs">
                  <div className="text-slate-500 text-[10px] font-bold uppercase mb-2">
                    VISITED SET (O(1) LOOKUP):
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {currentStep.visited.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Telemetry */}
            <div className="px-8 py-4 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center justify-between text-xs font-mono text-slate-600 gap-4">
              <div>TIME COMPLEXITY: <span className="text-slate-900 font-bold">O(V + E)</span></div>
              <div>SPACE COMPLEXITY: <span className="text-slate-900 font-bold">O(V)</span></div>
              <div>GUARANTEES: <span className="text-[#0A66FF] font-bold">{traversalMode === 'bfs' ? 'Shortest path in unweighted graph' : 'Exhaustive path discovery'}</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. ROADMAP SECTION (ANIMATED)                                  */}
      {/* ============================================================== */}
      <section id="roadmap" className="py-24 px-6 bg-[#FBFBFA] border-t border-slate-200/70">
        <div className="max-w-4xl mx-auto">
          {/* Eyebrow & Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="font-mono text-[11px] font-semibold text-[#0A66FF] tracking-wider uppercase">
              ADAPTIVE PATHWAYS
            </span>
            <h2 className="font-headline text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A] mt-2 mb-4">
              A roadmap that evolves with your cognitive velocity.
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Your college syllabus parsed by AI, compiled into an acyclic skill graph, adapting
              dynamically to diagnostic gaps, quiz accuracy, and spaced retention decay.
            </p>
          </motion.div>

          {/* Vertical Roadmap Timeline Nodes */}
          <div className="space-y-6 relative">
            {/* Background static line */}
            <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-slate-200 -translate-x-1/2" />
            {/* Scroll-animated active progression line */}
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: '62%' }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-4 top-8 w-0.5 bg-gradient-to-b from-emerald-500 via-[#0A66FF] to-blue-400 origin-top z-0 -translate-x-1/2"
            />

            {/* Node 1: Completed */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5 }}
              className="relative pl-14"
            >
              <div className="absolute left-4 top-5 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white shadow-sm -translate-x-1/2 z-10" />
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:border-slate-300 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    STAGE 01 • COMPLETED
                  </span>
                  <span className="font-mono text-xs text-slate-400">100% MASTERED</span>
                </div>
                <h3 className="font-headline text-lg font-bold text-slate-900">
                  Core Foundations: Memory & Pointer Arithmetic
                </h3>
                <p className="text-slate-600 text-sm mt-1">
                  Stack vs Heap allocation, pointer indirection, cache locality, and asymptotic notation.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>RETENTION STABILITY: 28 DAYS</span>
                  <span className="text-emerald-600 font-semibold">✓ VERIFIED BY QUIZ</span>
                </div>
              </div>
            </motion.div>

            {/* Node 2: Current In Progress */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative pl-14"
            >
              <div className="absolute left-4 top-5 w-4 h-4 rounded-full bg-[#0A66FF] border-4 border-white shadow-md shadow-blue-500/30 -translate-x-1/2 z-10" />
              <div className="bg-white rounded-2xl border-2 border-[#0A66FF] p-6 shadow-md shadow-blue-500/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-semibold text-[#0A66FF] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                    STAGE 02 • IN PROGRESS
                  </span>
                  <span className="font-mono text-xs font-bold text-[#0A66FF]">72% COMPLETE</span>
                </div>
                <h3 className="font-headline text-lg font-bold text-slate-900">
                  Data Structures: Trees, Heaps & Graph Traversal
                </h3>
                <p className="text-slate-600 text-sm mt-1">
                  Adjacency lists, BFS/DFS traversal invariants, cycle detection, and Dijkstra&apos;s shortest path.
                </p>
                {/* Active progress bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-4">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '72%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="bg-[#0A66FF] h-full rounded-full"
                  />
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-500">NEXT: BFS INTERACTIVE LAB</span>
                  <a
                    href="#lab"
                    className="font-medium text-[#0A66FF] hover:text-[#0052DB] flex items-center gap-1"
                  >
                    <span>Launch Traversal Lab</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Node 3: Locked / Upcoming */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative pl-14"
            >
              <div className="absolute left-4 top-5 w-4 h-4 rounded-full bg-slate-300 border-4 border-white -translate-x-1/2 z-10" />
              <div className="bg-white/70 rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded">
                    STAGE 03 • PREREQUISITES REQUIRED
                  </span>
                  <span className="font-mono text-xs text-slate-400">LOCKED</span>
                </div>
                <h3 className="font-headline text-lg font-bold text-slate-700">
                  Distributed Systems: Consensus & Storage Engines
                </h3>
                <p className="text-slate-500 text-sm mt-1">
                  Raft consensus, write-ahead logging, LSM-trees, and vector similarity indexing.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>REQUIRES: Graph Traversal & Network Sockets</span>
                  <span>0 / 4 UNLOCKED</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 7. ENGINEERING GAMES SECTION (CLEAR HIERARCHY)                */}
      {/* ============================================================== */}
      <section id="games" className="py-24 px-6 bg-white border-t border-slate-200/70">
        <div className="max-w-6xl mx-auto">
          {/* Eyebrow & Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="font-mono text-[11px] font-semibold text-[#0A66FF] tracking-wider uppercase">
              ENGINEERING GAMES
            </span>
            <h2 className="font-headline text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A] mt-2 mb-4">
              Turn brutal systems concepts into games you play.
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Technical challenges where scoring is validated by real database queries, packet routers,
              and algorithm race timers — not multiple-choice trivia.
            </p>
          </motion.div>

          {/* Featured Large Game + Secondary Games Grid */}
          <div className="grid lg:grid-cols-12 gap-6 items-stretch">
            {/* Featured Game: SQL Detective (Large Card) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 bg-[#FBFBFA] rounded-3xl border border-slate-200/90 p-8 flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[11px] font-bold text-[#0A66FF] bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                    FEATURED CHALLENGE • P0 ENGINE
                  </span>
                  <span className="text-xs font-mono text-slate-500">WASM SQLITE</span>
                </div>
                <h3 className="font-headline text-2xl font-bold text-slate-900 mb-2">
                  SQL Detective
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Investigate high-profile security leaks and unauthorized transaction alterations.
                  Write real SQL queries executed directly against real SQLite databases in your browser.
                </p>

                {/* Live Query Runner Preview */}
                <div className="bg-slate-900 rounded-xl p-4 text-xs font-mono text-slate-200 space-y-2 border border-slate-800 shadow-md">
                  <div className="text-slate-500 text-[10px] font-bold">CASE #04: THE GHOST TRANSACTION</div>
                  <div className="text-emerald-400">
                    <code>
                      SELECT emp.name, t.amount, t.timestamp
                      <br />
                      FROM transactions t JOIN employees emp ON t.emp_id = emp.id
                      <br />
                      WHERE t.amount &gt; 100000 AND t.approved = 0;
                    </code>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Validation: Row-set comparison (not regex)</span>
                    <span className="text-emerald-400 font-semibold">STATUS: VERIFIED</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-200/80 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-500">DIFFICULTY: ALL LEVELS</span>
                <Link
                  href="/games"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0A66FF] hover:bg-[#0052DB] text-white text-xs font-semibold transition-all shadow-sm"
                >
                  <span>Play SQL Detective</span>
                  <span>→</span>
                </Link>
              </div>
            </motion.div>

            {/* Secondary Games Column (3 distinct cards) */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-4">
              {/* Game 1: Packet Runner */}
              <motion.div
                initial={{ opacity: 0, x: 15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -3 }}
                className="bg-[#FBFBFA] rounded-2xl border border-slate-200 p-5 hover:border-slate-300 transition-all flex flex-col justify-between shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-indigo-600 uppercase">NETWORKING</span>
                    <h4 className="font-headline font-bold text-slate-900 text-base mt-0.5">Packet Runner</h4>
                    <p className="text-slate-600 text-xs mt-1">
                      Route IP packets through CIDR subnets, ARP tables, and NAT gateways before TTL expires.
                    </p>
                  </div>
                  <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    IP
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>OSI LAYERS 2-4</span>
                  <Link href="/games" className="text-[#0A66FF] font-medium hover:underline">Launch →</Link>
                </div>
              </motion.div>

              {/* Game 2: Algorithm Race */}
              <motion.div
                initial={{ opacity: 0, x: 15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ y: -3 }}
                className="bg-[#FBFBFA] rounded-2xl border border-slate-200 p-5 hover:border-slate-300 transition-all flex flex-col justify-between shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-emerald-600 uppercase">ALGORITHMS</span>
                    <h4 className="font-headline font-bold text-slate-900 text-base mt-0.5">Algorithm Race</h4>
                    <p className="text-slate-600 text-xs mt-1">
                      Predict time complexity and watch QuickSort, MergeSort, and TimSort race on adversarial inputs.
                    </p>
                  </div>
                  <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    O(n)
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>REAL CPU BENCHMARKS</span>
                  <Link href="/games" className="text-[#0A66FF] font-medium hover:underline">Launch →</Link>
                </div>
              </motion.div>

              {/* Game 3: Memory Maze */}
              <motion.div
                initial={{ opacity: 0, x: 15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ y: -3 }}
                className="bg-[#FBFBFA] rounded-2xl border border-slate-200 p-5 hover:border-slate-300 transition-all flex flex-col justify-between shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-amber-600 uppercase">SYSTEMS</span>
                    <h4 className="font-headline font-bold text-slate-900 text-base mt-0.5">Memory Maze</h4>
                    <p className="text-slate-600 text-xs mt-1">
                      Manage stack vs heap allocations, prevent memory leaks, and manually free dangling pointers.
                    </p>
                  </div>
                  <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    PTR
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>C / RUST MEMORY MODEL</span>
                  <Link href="/games" className="text-[#0A66FF] font-medium hover:underline">Launch →</Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 8. AI MENTOR SECTION (SPLIT IDE & TERMINAL)                    */}
      {/* ============================================================== */}
      <section id="mentor" className="py-24 px-6 bg-[#FBFBFA] border-t border-slate-200/70">
        <div className="max-w-6xl mx-auto">
          {/* Eyebrow & Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="font-mono text-[11px] font-semibold text-[#0A66FF] tracking-wider uppercase">
              BLOOM MENTOR
            </span>
            <h2 className="font-headline text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A] mt-2 mb-4">
              Not a generic chatbot. A compiler for your mental models.
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Grounded strictly in your current lesson code, video timestamps, and misconception history.
              Bloom Mentor guides via Socratic hints and never spoils answers.
            </p>
          </motion.div>

          {/* Split Screen IDE / Diagnostic Surface */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-[#0F172A] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden grid lg:grid-cols-12 text-slate-300"
          >
            {/* Left Column: Socratic Context */}
            <div className="lg:col-span-5 p-7 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-blue-400 font-bold mb-4">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span>SOCRATIC DIAGNOSTIC STATE</span>
                </div>
                <h3 className="font-headline text-lg font-bold text-white mb-2">
                  Cycle Detection in Directed Graphs
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Student attempted DFS cycle detection but failed on cyclic graphs with back-edges.
                </p>

                <div className="mt-6 space-y-3 font-mono text-xs">
                  <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">HINT LADDER:</span>
                    <span className="text-amber-400 font-bold">Level 2 of 3 (Guiding Question)</span>
                  </div>

                  <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">IDENTIFIED MISCONCEPTION:</span>
                    <span className="text-red-400 font-bold">Premature Backtracking State Mutation</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 font-mono text-[11px] text-slate-400">
                <span>Rule: Code solution locked until Level 3 hint exhausted</span>
              </div>
            </div>

            {/* Right Column: Code & Diagnostic Stream */}
            <div className="lg:col-span-7 p-7 flex flex-col justify-between font-mono text-xs">
              <div>
                {/* Code Window Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 text-slate-300 font-bold">cycle-detector.ts</span>
                  </div>
                  <span className="text-[11px] text-[#0A66FF]">LINE 14 ERROR DETECTED</span>
                </div>

                {/* Code Snippet with Bug Highlight */}
                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 text-slate-300 leading-relaxed overflow-x-auto">
                  <div className="text-slate-500">12 |  function hasCycle(node: number, state: State[]): boolean &#123;</div>
                  <div className="text-slate-500">13 |    state[node] = State.VISITING; // Gray</div>
                  <div className="bg-red-500/15 text-red-300 px-1 -mx-1 rounded border-l-2 border-red-500">
                    14 |    // BUG: Missing backtrack check on visited neighbors
                  </div>
                  <div className="text-slate-500">15 |    for (const neighbor of graph[node]) &#123;</div>
                  <div className="text-slate-500">16 |      if (state[neighbor] === State.VISITING) return true;</div>
                  <div className="text-slate-500">17 |    &#125;</div>
                  <div className="text-slate-500">18 |    state[node] = State.VISITED; // Black</div>
                  <div className="text-slate-500">19 |  &#125;</div>
                </div>

                {/* Mentor Socratic Response */}
                <div className="mt-4 bg-blue-950/40 rounded-xl p-4 border border-blue-900/50 space-y-2">
                  <div className="flex items-center gap-2 text-[#0A66FF] font-bold text-xs">
                    <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a4.5 4.5 0 0 0-4.5 4.5c0 1.2.45 2.3 1.2 3.15L7 12.5A5.5 5.5 0 0 0 12.5 18H13v3h-2" />
                      <path d="M12 2a4.5 4.5 0 0 1 4.5 4.5c0 1.2-.45 2.3-1.2 3.15L17 12.5A5.5 5.5 0 0 1 11.5 18" />
                      <circle cx="12" cy="10" r="2" />
                    </svg>
                    <span>BLOOM MENTOR (GROUNDED @ 14:22)</span>
                  </div>
                  <p className="text-slate-300 text-xs font-sans leading-relaxed">
                    Notice line 14: You correctly mark the current node as <code className="font-mono text-blue-300">VISITING</code>, but what happens when a neighbor is already in <code className="font-mono text-emerald-300">State.VISITED</code>? Does your recursive call check whether unvisited neighbors must be explored recursively?
                  </p>
                </div>
              </div>

              {/* Socratic Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <button className="px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/40 text-blue-300 border border-blue-500/40 transition-colors cursor-pointer">
                  ▶ See Video @ 14:22 (3-Color DFS)
                </button>
                <button className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer">
                  Inspect Call Stack
                </button>
                <button className="px-3 py-1.5 rounded-lg bg-[#0A66FF] hover:bg-[#0052DB] text-white transition-colors cursor-pointer">
                  Request Next Hint (3/3)
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 9. REAL PROJECTS SECTION (ANIMATED)                            */}
      {/* ============================================================== */}
      <section id="projects" className="py-24 px-6 bg-white border-t border-slate-200/70">
        <div className="max-w-6xl mx-auto">
          {/* Eyebrow & Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="font-mono text-[11px] font-semibold text-[#0A66FF] tracking-wider uppercase">
              PRODUCTION LABS
            </span>
            <h2 className="font-headline text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A] mt-2 mb-4">
              Learning becomes real when you build.
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Capstone portfolio systems with automated CLI verification test suites and AI code
              reviews of your public GitHub repositories.
            </p>
          </motion.div>

          {/* 3 Real Projects Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Project 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -4 }}
              className="bg-[#FBFBFA] rounded-2xl border border-slate-200/90 p-6 flex flex-col justify-between hover:border-slate-300 transition-all shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-3">
                  <span className="bg-blue-50 text-[#0A66FF] font-semibold px-2 py-0.5 rounded border border-blue-200">
                    ADVANCED • 25 HRS
                  </span>
                  <span>5 MILESTONES</span>
                </div>
                <h3 className="font-headline text-lg font-bold text-slate-900 mb-2">
                  Distributed Key-Value Store
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-4">
                  Implement Raft consensus, write-ahead logging (WAL), and LSM-tree storage engines capable of surviving network partitions.
                </p>
                <div className="flex flex-wrap gap-1.5 font-mono text-[10px] text-slate-600">
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200">Raft</span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200">WAL</span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200">LSM-Trees</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono">Automated CI Rubric</span>
                <Link href="/projects" className="text-[#0A66FF] font-medium hover:underline">
                  View Specs →
                </Link>
              </div>
            </motion.div>

            {/* Project 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-[#FBFBFA] rounded-2xl border border-slate-200/90 p-6 flex flex-col justify-between hover:border-slate-300 transition-all shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-3">
                  <span className="bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded border border-indigo-200">
                    INTERMEDIATE • 18 HRS
                  </span>
                  <span>4 MILESTONES</span>
                </div>
                <h3 className="font-headline text-lg font-bold text-slate-900 mb-2">
                  Packet Sniffer & Firewall
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-4">
                  Capture Ethernet frames using raw sockets, decode TCP/IP headers, and implement stateless BPF packet filtering rules.
                </p>
                <div className="flex flex-wrap gap-1.5 font-mono text-[10px] text-slate-600">
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200">Raw Sockets</span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200">BPF Filters</span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200">TCP FSM</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono">PCAP Benchmark Suite</span>
                <Link href="/projects" className="text-[#0A66FF] font-medium hover:underline">
                  View Specs →
                </Link>
              </div>
            </motion.div>

            {/* Project 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -4 }}
              className="bg-[#FBFBFA] rounded-2xl border border-slate-200/90 p-6 flex flex-col justify-between hover:border-slate-300 transition-all shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-3">
                  <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                    ADVANCED • 30 HRS
                  </span>
                  <span>6 MILESTONES</span>
                </div>
                <h3 className="font-headline text-lg font-bold text-slate-900 mb-2">
                  Vector Database from Scratch
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-4">
                  Construct hierarchical navigable small-world (HNSW) graphs and SIMD cosine similarity routines for sub-millisecond retrieval.
                </p>
                <div className="flex flex-wrap gap-1.5 font-mono text-[10px] text-slate-600">
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200">HNSW</span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200">SIMD Dot</span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200">SIFT Dataset</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono">SIFT 1M Accuracy Test</span>
                <Link href="/projects" className="text-[#0A66FF] font-medium hover:underline">
                  View Specs →
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 10. FINAL CTA SECTION (ANIMATED)                               */}
      {/* ============================================================== */}
      <section className="py-24 px-6 bg-[#FBFBFA] border-t border-slate-200/70">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl border border-slate-200/90 p-10 md:p-14 text-center shadow-sm relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-xl bg-[#0A66FF] text-white flex items-center justify-center mx-auto mb-6 shadow-md shadow-blue-500/20">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C13.5 6 17 8 21 8.5C17 11 15 14.5 15.5 19C13 16 10 16 7.5 19C8 14.5 6 11 2 8.5C6 8 9.5 6 12 2Z" />
              </svg>
            </div>

            <h2 className="font-headline text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A] mb-4">
              Your engineering mastery starts with one concept.
            </h2>
            <p className="text-slate-600 text-base max-w-xl mx-auto leading-relaxed mb-8">
              Build true intuition through active mental models, interactive experiments,
              and real production capstone projects.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3.5">
              <motion.button
                type="button"
                onClick={() => openAuthModal('signup')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#0A66FF] hover:bg-[#0052DB] text-white text-sm font-semibold shadow-md shadow-blue-500/15 hover:shadow-lg transition-all cursor-pointer"
              >
                <span>Start Learning Free</span>
                <span>→</span>
              </motion.button>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-all shadow-sm"
              >
                <span>Browse Full Curriculum</span>
              </Link>
            </div>

            <div className="mt-8 flex items-center justify-center gap-4 text-xs font-mono text-slate-500">
              <span>✓ Open Source Core</span>
              <span>•</span>
              <span>✓ Zero Credit Card Required</span>
              <span>•</span>
              <span>✓ Real Code Execution</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 11. FOOTER                                                     */}
      {/* ============================================================== */}
      <footer className="py-14 px-6 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="group">
              <BloomLogo size={30} showText={true} />
            </Link>
            <p className="text-slate-500 text-xs leading-relaxed max-w-sm">
              Interactive engineering learning platform. Grounded in university curricula,
              verified by in-browser computational engines and real capstones.
            </p>
            <div className="text-[11px] font-mono text-slate-400">
              Bloom Technologies Inc. • Engineered for deep intuition.
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3 text-xs">
            <div className="font-mono font-bold text-slate-900 text-[11px] tracking-wider uppercase">
              Product
            </div>
            <ul className="space-y-2 text-slate-600">
              <li><Link href="/explore" className="hover:text-[#0A66FF] transition-colors">Curriculum</Link></li>
              <li><Link href="/roadmap" className="hover:text-[#0A66FF] transition-colors">Skill Roadmaps</Link></li>
              <li><a href="#lab" className="hover:text-[#0A66FF] transition-colors">Interactive Labs</a></li>
              <li><Link href="/games" className="hover:text-[#0A66FF] transition-colors">Engineering Games</Link></li>
              <li><Link href="/projects" className="hover:text-[#0A66FF] transition-colors">Production Projects</Link></li>
              <li><Link href="/mentor" className="hover:text-[#0A66FF] transition-colors">Bloom Mentor</Link></li>
            </ul>
          </div>

          {/* Curriculum */}
          <div className="space-y-3 text-xs">
            <div className="font-mono font-bold text-slate-900 text-[11px] tracking-wider uppercase">
              Curriculum
            </div>
            <ul className="space-y-2 text-slate-600">
              <li><Link href="/courses/dsa" className="hover:text-[#0A66FF] transition-colors">Data Structures</Link></li>
              <li><Link href="/courses/algorithms" className="hover:text-[#0A66FF] transition-colors">Algorithms</Link></li>
              <li><Link href="/courses/os" className="hover:text-[#0A66FF] transition-colors">Operating Systems</Link></li>
              <li><Link href="/courses/dbms" className="hover:text-[#0A66FF] transition-colors">Database Systems</Link></li>
              <li><Link href="/courses/cn" className="hover:text-[#0A66FF] transition-colors">Computer Networks</Link></li>
            </ul>
          </div>

          {/* Resources & Legal */}
          <div className="space-y-3 text-xs">
            <div className="font-mono font-bold text-slate-900 text-[11px] tracking-wider uppercase">
              Platform
            </div>
            <ul className="space-y-2 text-slate-600">
              <li><Link href="/onboarding" className="hover:text-[#0A66FF] transition-colors">Syllabus Sync</Link></li>
              <li><Link href="/progress" className="hover:text-[#0A66FF] transition-colors">Skill Passport</Link></li>
              <li><a href="#" className="hover:text-[#0A66FF] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#0A66FF] transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-[#0A66FF] transition-colors">Security & Auditing</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-400 gap-4">
          <span>© 2026 Bloom Technologies Inc. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span>Server-Authoritative Mastery</span>
            <span>•</span>
            <span>Real-Data Verified</span>
          </div>
        </div>
      </footer>

      {/* Floating Back to Top Button */}
      <AnimatePresence>
        {scrolled && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 16 }}
            transition={{ duration: 0.2 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-slate-900/90 text-white shadow-xl backdrop-blur-md border border-slate-700/50 hover:bg-[#0A66FF] hover:border-[#0A66FF] transition-all cursor-pointer group"
            aria-label="Back to top"
          >
            <svg
              className="w-5 h-5 transition-transform group-hover:-translate-y-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Auth Modal (Pop-up over landing page) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
}
