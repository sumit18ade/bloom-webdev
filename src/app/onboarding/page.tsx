'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import BloomLogo from '@/components/BloomLogo';

// 1. Engineering Fields (Step 1)
const ENGINEERING_FIELDS = [
  { id: 'Computer Science', label: 'Computer Science', color: 'bg-blue-50 text-[#0A66FF] border-blue-200/80', desc: 'Software, Algorithms, Web & Distributed Systems' },
  { id: 'Information Technology', label: 'Information Technology', color: 'bg-sky-50 text-sky-600 border-sky-200/80', desc: 'Cloud, Networks, Databases & IT Infra' },
  { id: 'AI / ML', label: 'AI / ML', color: 'bg-purple-50 text-purple-600 border-purple-200/80', desc: 'Neural Nets, Deep Learning, MLOps & Data Science' },
  { id: 'Electronics', label: 'Electronics (ECE)', color: 'bg-amber-50 text-amber-600 border-amber-200/80', desc: 'VLSI, Embedded Systems, IoT & Semiconductors' },
  { id: 'Electrical', label: 'Electrical (EEE)', color: 'bg-cyan-50 text-cyan-600 border-cyan-200/80', desc: 'Power Systems, Control Systems & EV Engineering' },
  { id: 'Mechanical', label: 'Mechanical', color: 'bg-indigo-50 text-indigo-600 border-indigo-200/80', desc: 'CAD, Robotics, Mechatronics & Thermal Design' },
  { id: 'Civil', label: 'Civil', color: 'bg-emerald-50 text-emerald-600 border-emerald-200/80', desc: 'Structural Design, BIM, Infrastructure & Geotech' },
  { id: 'Other', label: 'Other Specialization', color: 'bg-violet-50 text-violet-600 border-violet-200/80', desc: 'General & Cross-Disciplinary Engineering' },
];

function BranchIcon({ id }: { id: string }) {
  switch (id) {
    case 'Computer Science':
      return (
        <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
          <line x1="14" y1="4" x2="10" y2="20" />
        </svg>
      );
    case 'Information Technology':
      return (
        <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
    case 'AI / ML':
      return (
        <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a4.5 4.5 0 0 0-4.5 4.5c0 1.2.45 2.3 1.2 3.15L7 12.5A5.5 5.5 0 0 0 12.5 18H13v3h-2" />
          <path d="M12 2a4.5 4.5 0 0 1 4.5 4.5c0 1.2-.45 2.3-1.2 3.15L17 12.5A5.5 5.5 0 0 1 11.5 18" />
          <circle cx="12" cy="10" r="2" />
        </svg>
      );
    case 'Electronics':
      return (
        <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="6" y="6" width="12" height="12" rx="2" />
          <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
        </svg>
      );
    case 'Electrical':
      return (
        <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case 'Mechanical':
      return (
        <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case 'Civil':
      return (
        <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18" />
          <path d="M5 21V7l7-4 7 4v14" />
          <path d="M9 21v-8h6v8" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      );
  }
}

// 2. Experience Levels (Step 2)
const EXPERIENCE_LEVELS = [
  { id: 'Beginner', label: 'Beginner', subtitle: 'First/second year or starting a new domain from scratch' },
  { id: 'Intermediate', label: 'Intermediate', subtitle: 'Solid core fundamentals, building projects and looking for depth' },
  { id: 'Advanced', label: 'Advanced', subtitle: 'Mastering complex systems, architecture & interview readiness' },
];

// 3. Dynamic Career Goals by Branch (Step 3)
const CAREER_GOALS_BY_BRANCH: Record<string, string[]> = {
  'Computer Science': [
    'Software Engineer',
    'Full Stack Developer',
    'Backend Engineer',
    'Frontend Engineer',
    'AI Engineer',
    'Machine Learning Engineer',
    'Data Scientist',
    'Cybersecurity Engineer',
    'Cloud Engineer',
    'DevOps Engineer',
    'Mobile App Developer',
    'Game Developer',
    'Systems Engineer',
    'Research Engineer',
    'Competitive Programmer',
    'Product Engineer',
  ],
  'Information Technology': [
    'Software Engineer',
    'Full Stack Developer',
    'Cloud Engineer',
    'DevOps Engineer',
    'Cybersecurity Engineer',
    'Network Engineer',
    'IT Consultant',
    'System Administrator',
    'Database Engineer',
    'Data Engineer',
    'IT Project Manager',
    'IT Support Engineer',
    'Web Developer',
    'Solutions Engineer',
  ],
  'AI / ML': [
    'AI Engineer',
    'Machine Learning Engineer',
    'Deep Learning Engineer',
    'Data Scientist',
    'NLP Engineer',
    'Computer Vision Engineer',
    'Generative AI Engineer',
    'ML Research Engineer',
    'MLOps Engineer',
    'Robotics / AI Engineer',
    'AI Product Engineer',
    'Research Scientist',
  ],
  'Electronics': [
    'Embedded Systems Engineer',
    'VLSI Engineer',
    'ASIC Design Engineer',
    'PCB Design Engineer',
    'Electronics Design Engineer',
    'IoT Engineer',
    'Robotics Engineer',
    'FPGA Engineer',
    'Control Systems Engineer',
    'Communication Systems Engineer',
    'Embedded AI Engineer',
    'Hardware Engineer',
    'Semiconductor Engineer',
  ],
  'Electrical': [
    'Electrical Design Engineer',
    'Power Systems Engineer',
    'Control Systems Engineer',
    'Electrical Automation Engineer',
    'Renewable Energy Engineer',
    'Power Electronics Engineer',
    'Electrical Maintenance Engineer',
    'Grid Engineer',
    'Instrumentation Engineer',
    'EV Systems Engineer',
    'Embedded Systems Engineer',
    'Energy Systems Engineer',
  ],
  'Mechanical': [
    'Mechanical Design Engineer',
    'CAD Engineer',
    'Automotive Engineer',
    'Robotics Engineer',
    'Mechatronics Engineer',
    'Manufacturing Engineer',
    'Production Engineer',
    'Aerospace Engineer',
    'Thermal Engineer',
    'HVAC Engineer',
    'Industrial Engineer',
    'Automation Engineer',
    'EV Systems Engineer',
    'Design & Simulation Engineer',
  ],
  'Civil': [
    'Structural Engineer',
    'Construction Engineer',
    'Site Engineer',
    'Transportation Engineer',
    'Geotechnical Engineer',
    'Environmental Engineer',
    'Water Resources Engineer',
    'Urban Planning Engineer',
    'Infrastructure Engineer',
    'Structural Design Engineer',
    'Quantity Surveyor',
    'Project Engineer',
    'BIM Engineer',
  ],
  'Other': [
    'Researcher',
    'Entrepreneur',
    'Product Engineer',
    'Technical Consultant',
    'Project Manager',
    'Design Engineer',
    'Automation Engineer',
    'Research Engineer',
    'Technology Specialist',
    'Other',
  ],
};

// 4. Preferred Learning Styles (Step 4)
const LEARNING_STYLES = [
  { id: 'Hands-on Projects & Code', label: 'Hands-on Projects & Code', desc: 'Build production software, hardware simulators & real capstones' },
  { id: 'Interactive Labs & Visuals', label: 'Interactive Labs & Visuals', desc: 'Step-by-step memory pointers, call stacks & live graph simulations' },
  { id: 'Smart Video & Timestamp Notes', label: 'Smart Video & Timestamp Notes', desc: 'Curated lectures paired with timestamped concept definitions & cheat sheets' },
  { id: 'Socratic Practice & Quizzes', label: 'Socratic Practice & Quizzes', desc: 'Adaptive question sets with 3-level hint ladders and active recall' },
];

// 5. Daily Time Commitment (Step 5)
const TIME_COMMITMENTS = [
  { id: '15 mins/day', label: '15 mins / day', subtitle: 'Casual daily sprint • Micro-learning consistency' },
  { id: '30 mins/day', label: '30 mins / day', subtitle: 'Steady Growth • Recommended pacing' },
  { id: '1 hour/day', label: '1 hour / day', subtitle: 'Deep Focus • Accelerate mastery & project milestones' },
  { id: '2+ hours/day', label: '2+ hours / day', subtitle: 'Exam / Placement Boot Camp • Intensive revision' },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [responses, setResponses] = useState({
    engineeringField: '',
    experienceLevel: '',
    careerGoal: '',
    learningStyle: '',
    dailyLearningTime: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { user, userData, refreshUserData } = useAuth();
  const router = useRouter();

  // If user is already onboarded, redirect to home
  useEffect(() => {
    if (userData?.onboardingCompleted) {
      router.replace('/home');
    }
  }, [userData, router]);

  // Handle Step 1 Change: Reset Step 3 if branch changes
  const handleSelectField = (field: string) => {
    if (responses.engineeringField !== field) {
      setResponses((prev) => ({
        ...prev,
        engineeringField: field,
        careerGoal: '', // Clear previous career goal if branch changes!
      }));
    }
  };

  // Step 3 Header Copy depending on branch
  const getStep3Header = () => {
    switch (responses.engineeringField) {
      case 'Computer Science':
        return 'What do you want to become in Computer Science?';
      case 'Information Technology':
        return 'What do you want to become in Information Technology?';
      case 'AI / ML':
        return 'What do you want to become in AI & Machine Learning?';
      case 'Electronics':
        return 'What do you want to build with Electronics?';
      case 'Electrical':
        return 'What direction do you want to pursue in Electrical Engineering?';
      case 'Mechanical':
        return 'What do you want to become as a Mechanical Engineer?';
      case 'Civil':
        return 'What do you want to build in Civil Engineering?';
      default:
        return 'What is your primary career goal?';
    }
  };

  // Dynamic Career Goals List for Step 3
  const activeCareerGoals =
    CAREER_GOALS_BY_BRANCH[responses.engineeringField] || CAREER_GOALS_BY_BRANCH['Other'];

  // Can proceed helper
  const canProceed = () => {
    switch (step) {
      case 1:
        return responses.engineeringField !== '';
      case 2:
        return responses.experienceLevel !== '';
      case 3:
        return responses.careerGoal !== '';
      case 4:
        return responses.learningStyle !== '';
      case 5:
        return responses.dailyLearningTime !== '';
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Final Save to Firestore
  const handleComplete = async () => {
    if (!user) {
      setError('You must be signed in to complete onboarding.');
      return;
    }

    setError('');
    setSaving(true);

    try {
      const userRef = doc(db, 'users', user.uid);

      // Parse minutes from dailyLearningTime
      const timeMinutesMap: Record<string, number> = {
        '15 mins/day': 15,
        '30 mins/day': 30,
        '1 hour/day': 60,
        '2+ hours/day': 120,
      };

      const updatePayload = {
        engineeringField: responses.engineeringField,
        experienceLevel: responses.experienceLevel as 'Beginner' | 'Intermediate' | 'Advanced',
        careerGoal: responses.careerGoal,
        learningGoals: [responses.careerGoal],
        preferredLearningStyle: responses.learningStyle,
        dailyLearningTime: responses.dailyLearningTime,
        dailyGoal: timeMinutesMap[responses.dailyLearningTime] || 30,
        onboardingCompleted: true,
        updatedAt: serverTimestamp(),
      };

      // 1. Await Firestore Write
      await setDoc(userRef, updatePayload, { merge: true });

      // 2. Refresh Auth Context State
      await refreshUserData();

      // 3. Navigate only after confirmed write
      router.replace('/home');
    } catch (err: unknown) {
      console.error('Failed to save onboarding profile:', err);
      setError("Couldn't save your learning profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const progressPercent = Math.round((step / 5) * 100);

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#0F172A] flex flex-col justify-between p-4 sm:p-6 md:p-10 font-sans selection:bg-[#0A66FF]/15 selection:text-[#0A66FF]">
      {/* Top Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-4">
        <BloomLogo size={34} showText={true} />
        <div className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
          STEP {step} OF 5
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto w-full my-auto py-6">
        {/* Step Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-2">
            <span className="font-semibold text-[#0A66FF]">Personalizing your Bloom experience...</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="h-full bg-gradient-to-r from-[#0A66FF] to-blue-500 rounded-full"
            />
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between gap-4 shadow-sm">
            <span>{error}</span>
            <button
              onClick={handleComplete}
              disabled={saving}
              className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-xs transition-colors shrink-0 cursor-pointer"
            >
              {saving ? 'Retrying...' : 'Retry'}
            </button>
          </div>
        )}

        {/* Step Cards Card Container */}
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xl shadow-slate-900/5 relative overflow-hidden"
        >
          {/* STEP 1: Engineering Branch */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <span className="font-mono text-[11px] font-bold text-[#0A66FF] tracking-wider uppercase">
                  STEP 01 • ACADEMIC TRACK
                </span>
                <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] mt-1">
                  What are you studying?
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  Select your engineering branch to customize your skill DAG and lecture moments.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3.5">
                {ENGINEERING_FIELDS.map((item) => {
                  const isSelected = responses.engineeringField === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectField(item.id)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 group ${
                        isSelected
                          ? 'border-[#0A66FF] bg-blue-50/50 shadow-sm ring-1 ring-[#0A66FF]/30'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${item.color}`}>
                        <BranchIcon id={item.id} />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-headline font-bold text-sm text-slate-900">
                            {item.label}
                          </span>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-[#0A66FF] text-white flex items-center justify-center text-[10px] font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Experience Level */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <span className="font-mono text-[11px] font-bold text-[#0A66FF] tracking-wider uppercase">
                  STEP 02 • FOUNDATIONAL BASELINE
                </span>
                <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] mt-1">
                  What&apos;s your current experience level?
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  Bloom adjusts roadmap node prerequisites based on your cognitive starting point.
                </p>
              </div>

              <div className="space-y-3">
                {EXPERIENCE_LEVELS.map((item) => {
                  const isSelected = responses.experienceLevel === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setResponses({ ...responses, experienceLevel: item.id })}
                      className={`w-full p-5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-[#0A66FF] bg-blue-50/50 shadow-sm ring-1 ring-[#0A66FF]/30'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div>
                        <div className="font-headline font-bold text-base text-slate-900">
                          {item.label}
                        </div>
                        <div className="text-slate-500 text-xs mt-0.5">{item.subtitle}</div>
                      </div>
                      {isSelected && (
                        <span className="w-6 h-6 rounded-full bg-[#0A66FF] text-white flex items-center justify-center text-xs font-bold shrink-0">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: DYNAMIC Career Goal by Branch */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <span className="font-mono text-[11px] font-bold text-[#0A66FF] tracking-wider uppercase">
                  STEP 03 • BRANCH-SPECIFIC AMBITION
                </span>
                <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] mt-1">
                  {getStep3Header()}
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  Tailored career path options for{' '}
                  <span className="font-semibold text-slate-800">{responses.engineeringField}</span>.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
                {activeCareerGoals.map((goal) => {
                  const isSelected = responses.careerGoal === goal;
                  return (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => setResponses({ ...responses, careerGoal: goal })}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between text-xs font-semibold ${
                        isSelected
                          ? 'border-[#0A66FF] bg-blue-50 text-[#0A66FF] ring-1 ring-[#0A66FF]/30'
                          : 'border-slate-200 hover:border-slate-300 text-slate-800 hover:bg-slate-50/50'
                      }`}
                    >
                      <span>{goal}</span>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-[#0A66FF] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Preferred Learning Style */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <span className="font-mono text-[11px] font-bold text-[#0A66FF] tracking-wider uppercase">
                  STEP 04 • LEARNING METHODOLOGY
                </span>
                <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] mt-1">
                  How do you learn best?
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  Bloom prioritizes labs, videos, quizzes, or code challenges based on your preference.
                </p>
              </div>

              <div className="space-y-3">
                {LEARNING_STYLES.map((item) => {
                  const isSelected = responses.learningStyle === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setResponses({ ...responses, learningStyle: item.id })}
                      className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start justify-between ${
                        isSelected
                          ? 'border-[#0A66FF] bg-blue-50/50 shadow-sm ring-1 ring-[#0A66FF]/30'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-headline font-bold text-sm text-slate-900">
                          {item.label}
                        </div>
                        <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                      </div>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-[#0A66FF] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: Daily Time Commitment */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <span className="font-mono text-[11px] font-bold text-[#0A66FF] tracking-wider uppercase">
                  STEP 05 • DAILY PACING
                </span>
                <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] mt-1">
                  How much time can you dedicate daily?
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  We schedule your daily focus queue and spaced retention reminders to fit your life.
                </p>
              </div>

              <div className="space-y-3">
                {TIME_COMMITMENTS.map((item) => {
                  const isSelected = responses.dailyLearningTime === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setResponses({ ...responses, dailyLearningTime: item.id })}
                      className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-[#0A66FF] bg-blue-50/50 shadow-sm ring-1 ring-[#0A66FF]/30'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div>
                        <div className="font-headline font-bold text-sm text-slate-900">
                          {item.label}
                        </div>
                        <div className="text-slate-500 text-xs mt-0.5">{item.subtitle}</div>
                      </div>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-[#0A66FF] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Controls Footer */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1 || saving}
              className={`px-5 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer ${
                step === 1 || saving
                  ? 'opacity-0 pointer-events-none'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80'
              }`}
            >
              ← Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed() || saving}
              className={`px-7 py-3 rounded-xl font-semibold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer ${
                canProceed() && !saving
                  ? 'bg-[#0A66FF] hover:bg-[#0052DB] text-white shadow-blue-500/25 hover:scale-[1.02]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Building Path...</span>
                </>
              ) : step === 5 ? (
                <span>Finish & Build Path →</span>
              ) : (
                <span>Continue →</span>
              )}
            </button>
          </div>
        </motion.div>
      </main>

      {/* Bottom Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center text-xs font-mono text-slate-400 py-4">
        Bloom Engineering Learning • Server-Authoritative Progression
      </footer>
    </div>
  );
}