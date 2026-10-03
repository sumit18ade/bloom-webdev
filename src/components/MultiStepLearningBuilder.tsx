'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ENGINEERING_BRANCHES } from '@/lib/taxonomy';
import { buildDynamicUserRoadmap } from '@/lib/recommendations';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserRoadmap } from '@/types/firestore';

interface MultiStepLearningBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onRoadmapGenerated?: (roadmap: UserRoadmap) => void;
}

export default function MultiStepLearningBuilder({
  isOpen,
  onClose,
  onRoadmapGenerated
}: MultiStepLearningBuilderProps) {
  const { userData, refreshUserData } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [selectedBranch, setSelectedBranch] = useState<string>('Computer Science');
  const [careerGoal, setCareerGoal] = useState<string>('Backend Engineer');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>(['C', 'SQL']);
  const [activeTechnology, setActiveTechnology] = useState<string>('C');
  const [level, setLevel] = useState<string>('Beginner');
  const [learningTime, setLearningTime] = useState<string>('1 hr/day');
  const [learningStyle, setLearningStyle] = useState<string>('Comprehensive');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    if (userData) {
      const branch = userData.engineeringBranch || userData.engineeringField || 'Computer Science';
      const branchInfo = ENGINEERING_BRANCHES[branch] || ENGINEERING_BRANCHES['Computer Science'];
      setSelectedBranch(branch);
      setCareerGoal(userData.careerGoal || branchInfo.careerGoals[0]);
      setSelectedSubjects(userData.selectedSubjects || branchInfo.subjects.slice(0, 5));
      setSelectedTechnologies(userData.selectedTechnologies || branchInfo.recommendedTechnologies);
      setActiveTechnology(userData.activeTechnology || branchInfo.recommendedTechnologies[0] || 'C');
      setLevel(userData.experienceLevel || 'Beginner');
      setLearningTime(userData.dailyLearningTime || '1 hr/day');
      setLearningStyle(userData.preferredLearningStyle || 'Comprehensive');
    }
  }, [userData, isOpen]);

  if (!isOpen) return null;

  const currentBranchInfo = ENGINEERING_BRANCHES[selectedBranch] || ENGINEERING_BRANCHES['Computer Science'];

  const handleBranchSelect = (branchId: string) => {
    setSelectedBranch(branchId);
    const info = ENGINEERING_BRANCHES[branchId];
    if (info) {
      setCareerGoal(info.careerGoals[0]);
      setSelectedSubjects(info.subjects.slice(0, 6));
      setSelectedTechnologies(info.recommendedTechnologies);
      setActiveTechnology(info.recommendedTechnologies[0] || 'C');
    }
  };

  const toggleSubject = (sub: string) => {
    setSelectedSubjects(prev =>
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  const toggleTechnology = (tech: string) => {
    setSelectedTechnologies(prev => {
      const updated = prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech];
      if (!updated.includes(activeTechnology) && updated.length > 0) {
        setActiveTechnology(updated[0]);
      }
      return updated;
    });
  };

  const handleSelectAllRecommendedTech = () => {
    setSelectedTechnologies(currentBranchInfo.recommendedTechnologies);
    if (currentBranchInfo.recommendedTechnologies.length > 0) {
      setActiveTechnology(currentBranchInfo.recommendedTechnologies[0]);
    }
  };

  const handleGenerateRoadmap = async () => {
    if (!userData) return;
    setIsGenerating(true);

    try {
      // 1. Build roadmap object
      const generatedRoadmap = buildDynamicUserRoadmap(userData.uid, {
        branch: selectedBranch,
        careerGoal,
        subjects: selectedSubjects,
        technologies: selectedTechnologies,
        activeTechnology,
        level,
        learningTime,
        learningStyle
      });

      // 2. Persist roadmap in Firestore under users/{uid}/roadmaps/{roadmapId}
      const roadmapRef = doc(db, 'users', userData.uid, 'roadmaps', generatedRoadmap.id);
      await setDoc(roadmapRef, generatedRoadmap, { merge: true });

      // 3. Update User profile in Firestore
      const userRef = doc(db, 'users', userData.uid);
      await updateDoc(userRef, {
        engineeringBranch: selectedBranch,
        engineeringField: selectedBranch,
        careerGoal,
        selectedSubjects,
        selectedTechnologies,
        activeTechnology,
        preferredLanguages: selectedTechnologies,
        experienceLevel: level,
        dailyLearningTime: learningTime,
        preferredLearningStyle: learningStyle,
        activeRoadmapId: generatedRoadmap.id,
        updatedAt: new Date()
      });

      await refreshUserData();

      if (onRoadmapGenerated) {
        onRoadmapGenerated(generatedRoadmap);
      }

      setIsGenerating(false);
      onClose();
    } catch (err) {
      console.error('Error generating roadmap:', err);
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold uppercase tracking-wider border border-blue-400/30">
                BLOOM LEARNING BUILDER
              </span>
              <span className="text-xs text-slate-400 font-mono">Step {step} of 8</span>
            </div>
            <h2 className="text-lg font-headline font-bold text-white">
              {step === 1 && 'Select Your Engineering Branch'}
              {step === 2 && 'Choose Your Career Goal'}
              {step === 3 && 'Select Core Subjects'}
              {step === 4 && 'Choose Technologies & Active Language'}
              {step === 5 && 'Define Learning Experience Level'}
              {step === 6 && 'Set Daily Learning Time'}
              {step === 7 && 'Preferred Learning Style'}
              {step === 8 && 'Review & Generate Personalized Roadmap'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs transition-all"
          >
            ✕
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-slate-100 h-1">
          <div
            className="bg-[#0A66FF] h-full transition-all duration-300"
            style={{ width: `${(step / 8) * 100}%` }}
          />
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-900">
          {/* STEP 1: ENGINEERING BRANCH */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Select your academic engineering branch to tailor career goals, subjects, and curriculum.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.values(ENGINEERING_BRANCHES).map(b => (
                  <button
                    key={b.id}
                    onClick={() => handleBranchSelect(b.id)}
                    className={`text-left p-4 rounded-2xl border text-xs transition-all ${
                      selectedBranch === b.id
                        ? 'border-[#0A66FF] bg-blue-50/70 text-[#0A66FF] ring-2 ring-blue-500/20 shadow-sm font-semibold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-headline text-sm font-bold text-slate-900">{b.name}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">{b.shortName}</span>
                    </div>
                    <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2">{b.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: CAREER GOAL */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-600">
                  Select your target career goal for <strong className="text-slate-900">{selectedBranch}</strong>:
                </p>
                <span className="text-[11px] font-mono text-[#0A66FF] font-semibold">Branch-Specific Roles</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {currentBranchInfo.careerGoals.map(goal => (
                  <button
                    key={goal}
                    onClick={() => setCareerGoal(goal)}
                    className={`p-3.5 rounded-xl text-xs font-semibold text-left border transition-all ${
                      careerGoal === goal
                        ? 'bg-[#0A66FF] text-white border-[#0A66FF] shadow-md'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {careerGoal === goal ? '✓ ' : ''}{goal}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: SUBJECTS SELECTION */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Choose the academic subjects you want to include in your personalized path:
              </p>
              <div className="flex flex-wrap gap-2">
                {currentBranchInfo.subjects.map(sub => {
                  const isSelected = selectedSubjects.includes(sub);
                  return (
                    <button
                      key={sub}
                      onClick={() => toggleSubject(sub)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        isSelected
                          ? 'bg-blue-50 border-[#0A66FF] text-[#0A66FF] ring-1 ring-blue-500/30'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}{sub}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: TECHNOLOGIES & ACTIVE LANGUAGE */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Select Technologies / Languages
                  </label>
                  <button
                    onClick={handleSelectAllRecommendedTech}
                    className="text-xs font-mono text-[#0A66FF] hover:underline font-semibold"
                  >
                    Select All Recommended
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentBranchInfo.allTechnologies.map(tech => {
                    const isSelected = selectedTechnologies.includes(tech);
                    return (
                      <button
                        key={tech}
                        onClick={() => toggleTechnology(tech)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-slate-900 border-slate-900 text-white font-semibold'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{tech}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Technology Choice */}
              {selectedTechnologies.length > 0 && (
                <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 text-xs space-y-2">
                  <label className="font-bold text-blue-950 block">
                    Choose Primary Active Technology for Roadmap:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedTechnologies.map(tech => (
                      <button
                        key={tech}
                        onClick={() => setActiveTechnology(tech)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          activeTechnology === tech
                            ? 'bg-[#0A66FF] text-white shadow-sm'
                            : 'bg-white text-blue-900 border border-blue-200 hover:bg-blue-100'
                        }`}
                      >
                        {activeTechnology === tech ? '⭐ Active: ' : ''}{tech}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-blue-900/80">
                    Your active technology (e.g. {activeTechnology}) tailors video recommendations, practice questions, games, and projects! You can switch technology anytime without losing historical progress.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: LEARNING LEVEL */}
          {step === 5 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">Select your current mastery level:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { title: 'Beginner', desc: 'Starting from fundamental concepts and zero prerequisite knowledge.' },
                  { title: 'Intermediate', desc: 'Familiar with basic code or theory; seeking core engineering depth.' },
                  { title: 'Advanced', desc: 'Experienced learner focusing on specialization and system design.' },
                  { title: 'Exam Sprint', desc: 'Fast-paced revision plan focused on high-frequency exam topics.' },
                ].map(item => (
                  <button
                    key={item.title}
                    onClick={() => setLevel(item.title)}
                    className={`text-left p-4 rounded-2xl border text-xs transition-all ${
                      level === item.title
                        ? 'border-[#0A66FF] bg-blue-50/70 text-[#0A66FF] ring-2 ring-blue-500/20 font-semibold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="font-bold text-slate-900 text-sm mb-1">{item.title}</div>
                    <p className="text-slate-500 text-[11px]">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: LEARNING TIME */}
          {step === 6 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">How much time can you commit each day?</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: '30 mins/day', value: '30 mins/day' },
                  { label: '1 hour/day', value: '1 hr/day' },
                  { label: '2 hours/day', value: '2 hrs/day' },
                  { label: '4+ hours/day', value: '4+ hrs/day' },
                ].map(item => (
                  <button
                    key={item.value}
                    onClick={() => setLearningTime(item.value)}
                    className={`p-4 rounded-2xl border text-center text-xs font-bold transition-all ${
                      learningTime === item.value
                        ? 'border-[#0A66FF] bg-[#0A66FF] text-white shadow-md'
                        : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 7: LEARNING STYLE */}
          {step === 7 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">What is your preferred learning modality?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { style: 'Video-First', desc: 'Curated video tutorials with timestamp references and AI notes.' },
                  { style: 'Practice-First', desc: 'Interactive coding challenges, diagnostic quizzes, and flashcards.' },
                  { style: 'Project-Driven', desc: 'Milestone-based guided projects with real code artifacts.' },
                  { style: 'Comprehensive', desc: 'Balanced loop of video, notes, practice, games, and capstones.' },
                ].map(item => (
                  <button
                    key={item.style}
                    onClick={() => setLearningStyle(item.style)}
                    className={`text-left p-4 rounded-2xl border text-xs transition-all ${
                      learningStyle === item.style
                        ? 'border-[#0A66FF] bg-blue-50/70 text-[#0A66FF] ring-2 ring-blue-500/20 font-semibold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="font-bold text-slate-900 text-sm mb-1">{item.style}</div>
                    <p className="text-slate-500 text-[11px]">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 8: REVIEW & PATH PREVIEW */}
          {step === 8 && (
            <div className="space-y-5">
              <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-300">
                  <span className="font-mono text-blue-400 font-bold uppercase">{selectedBranch}</span>
                  <span>{learningTime} • {level}</span>
                </div>
                <h3 className="font-headline text-xl font-bold text-white">
                  {careerGoal} ({activeTechnology})
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSubjects.map(s => (
                    <span key={s} className="px-2.5 py-1 rounded-md bg-white/10 text-white text-[11px] font-mono">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Custom Path Flow Preview */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  Generated Path Sequence ({activeTechnology})
                </h4>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-800">
                  <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200">{activeTechnology} Foundations</span>
                  <span>→</span>
                  <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200">Data Structures</span>
                  <span>→</span>
                  <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200">DBMS & SQL</span>
                  <span>→</span>
                  <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200">Networks & APIs</span>
                  <span>→</span>
                  <span className="px-3 py-1.5 rounded-xl bg-[#0A66FF] text-white">{careerGoal} Capstone</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-all"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          {step < 8 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 rounded-xl bg-[#0A66FF] hover:bg-[#0052DB] text-white text-xs font-semibold transition-all shadow-md"
            >
              Next Step →
            </button>
          ) : (
            <button
              onClick={handleGenerateRoadmap}
              disabled={isGenerating}
              className="px-8 py-3 rounded-2xl bg-[#0A66FF] hover:bg-[#0052DB] text-white text-sm font-bold transition-all shadow-lg disabled:opacity-50"
            >
              {isGenerating ? 'Generating Your System...' : 'GENERATE MY ROADMAP ✨'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
