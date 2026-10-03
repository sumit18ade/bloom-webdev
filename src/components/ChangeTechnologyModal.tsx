'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ENGINEERING_BRANCHES } from '@/lib/taxonomy';
import { buildDynamicUserRoadmap } from '@/lib/recommendations';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ChangeTechnologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangeTechnologyModal({ isOpen, onClose }: ChangeTechnologyModalProps) {
  const { userData, refreshUserData } = useAuth();

  const [currentBranch, setCurrentBranch] = useState<string>('Computer Science');
  const [selectedTech, setSelectedTech] = useState<string>('C');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    if (userData) {
      const branch = userData.engineeringBranch || userData.engineeringField || 'Computer Science';
      setCurrentBranch(branch);
      setSelectedTech(userData.activeTechnology || 'C');
    }
  }, [userData, isOpen]);

  if (!isOpen) return null;

  const branchInfo = ENGINEERING_BRANCHES[currentBranch] || ENGINEERING_BRANCHES['Computer Science'];
  const availableTechs = branchInfo.allTechnologies;

  const handleConfirmSwitch = async () => {
    if (!userData || !selectedTech) return;
    setIsUpdating(true);

    try {
      const updatedSubjects = userData.selectedSubjects || branchInfo.subjects.slice(0, 5);
      const updatedTechList = Array.from(new Set([...(userData.selectedTechnologies || []), selectedTech]));

      // 1. Build updated dynamic roadmap with new active tech
      const updatedRoadmap = buildDynamicUserRoadmap(userData.uid, {
        branch: currentBranch,
        careerGoal: userData.careerGoal || branchInfo.careerGoals[0],
        subjects: updatedSubjects,
        technologies: updatedTechList,
        activeTechnology: selectedTech,
        level: userData.experienceLevel || 'Beginner',
        learningTime: userData.dailyLearningTime || '1 hr/day',
        learningStyle: userData.preferredLearningStyle || 'Comprehensive'
      });

      // 2. Persist updated roadmap in Firestore
      const roadmapRef = doc(db, 'users', userData.uid, 'roadmaps', updatedRoadmap.id);
      await setDoc(roadmapRef, updatedRoadmap, { merge: true });

      // 3. Update User profile in Firestore
      const userRef = doc(db, 'users', userData.uid);
      await updateDoc(userRef, {
        activeTechnology: selectedTech,
        selectedTechnologies: updatedTechList,
        activeRoadmapId: updatedRoadmap.id,
        updatedAt: new Date()
      });

      await refreshUserData();
      setIsUpdating(false);
      onClose();
    } catch (err) {
      console.error('Error switching technology:', err);
      setIsUpdating(false);
    }
  };

  const isCurrentActive = userData?.activeTechnology === selectedTech;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div>
            <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider font-bold block">
              BLOOM TECHNOLOGY ADAPTER
            </span>
            <h2 className="text-base sm:text-lg font-headline font-bold text-white">CHANGE TECHNOLOGY</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs transition-all"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 text-slate-900 overflow-y-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 sm:p-4 text-xs space-y-1.5">
            <div className="font-bold text-blue-950 flex items-center gap-2">
              <span>🔄</span> Seamless Path Adaptation
            </div>
            <p className="text-blue-900/80 leading-relaxed text-[11px] sm:text-xs">
              Select any language or tool below to adapt your active learning roadmap, practice questions, and AI mentor context. <strong>Your previous activity and XP remain saved.</strong>
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Select Target Technology:
              </label>
              <span className="text-xs font-mono text-[#0A66FF] font-bold">
                Selected: {selectedTech}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableTechs.map(tech => {
                const isSelected = (selectedTech === tech);
                const isCurrentInProfile = (userData?.activeTechnology === tech);

                return (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => setSelectedTech(tech)}
                    disabled={isUpdating}
                    className={`p-3 rounded-xl text-xs font-bold text-center border transition-all truncate ${
                      isSelected
                        ? 'bg-[#0A66FF] text-white border-[#0A66FF] shadow-md ring-2 ring-blue-500/20'
                        : isCurrentInProfile
                        ? 'bg-blue-50 border-blue-300 text-blue-800 hover:bg-blue-100'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    {isSelected ? `✓ ${tech}` : isCurrentInProfile ? `${tech} (Active)` : tech}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer with OK / Apply Button */}
        <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50 shrink-0 gap-3">
          <span className="text-[11px] text-slate-500 font-mono hidden sm:inline-block">
            {isCurrentActive ? 'Currently active technology' : `Ready to switch to ${selectedTech}`}
          </span>
          <div className="flex items-center gap-2.5 ml-auto">
            <button
              onClick={onClose}
              disabled={isUpdating}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSwitch}
              disabled={isUpdating}
              className="px-5 py-2.5 rounded-xl bg-[#0A66FF] hover:bg-[#0052DB] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {isUpdating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Applying...</span>
                </>
              ) : (
                <span>Apply Technology (OK) →</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
