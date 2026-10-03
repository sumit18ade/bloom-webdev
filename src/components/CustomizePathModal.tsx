'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ENGINEERING_BRANCHES } from '@/lib/taxonomy';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CustomizePathModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomizePathModal({ isOpen, onClose }: CustomizePathModalProps) {
  const { userData, refreshUserData } = useAuth();

  const [selectedBranch, setSelectedBranch] = useState<string>('Computer Science');
  const [careerGoal, setCareerGoal] = useState<string>('Software Engineer');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState<'edit' | 'confirm'>('edit');

  useEffect(() => {
    if (userData) {
      const branch = userData.engineeringBranch || userData.engineeringField || 'Computer Science';
      setSelectedBranch(branch);
      const branchInfo = ENGINEERING_BRANCHES[branch] || ENGINEERING_BRANCHES['Computer Science'];
      setCareerGoal(userData.careerGoal || branchInfo.careerGoals[0]);
      setSelectedSubjects(userData.selectedSubjects || branchInfo.subjects);
      setSelectedLanguages(userData.preferredLanguages || branchInfo.recommendedTechnologies);
    }
  }, [userData, isOpen]);

  if (!isOpen) return null;

  const currentBranchInfo = ENGINEERING_BRANCHES[selectedBranch] || ENGINEERING_BRANCHES['Computer Science'];

  const handleBranchChange = (branch: string) => {
    setSelectedBranch(branch);
    const info = ENGINEERING_BRANCHES[branch];
    if (info) {
      setCareerGoal(info.careerGoals[0]);
      setSelectedSubjects(info.subjects);
      setSelectedLanguages(info.recommendedTechnologies);
    }
  };

  const toggleSubject = (sub: string) => {
    setSelectedSubjects(prev =>
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const handleSave = async () => {
    if (!userData) {
      console.error('No user data available');
      return;
    }
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', userData.uid);
      await updateDoc(userRef, {
        engineeringBranch: selectedBranch,
        engineeringField: selectedBranch,
        careerGoal,
        selectedSubjects,
        preferredLanguages: selectedLanguages,
        selectedTechnologies: selectedLanguages,
        activeTechnology: selectedLanguages[0] || 'C',
        updatedAt: new Date()
      });
      await refreshUserData();
      setIsSaving(false);
      onClose();
      setStep('edit');
    } catch (err) {
      console.error('Error updating path:', err);
      setIsSaving(false);
      alert('Failed to update path. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn text-slate-900">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] relative z-10 pointer-events-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-blue-400">
              Bloom Personalization Engine
            </span>
            <h2 className="text-lg font-headline font-bold text-white">Customize My Learning Path</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-900">
          {step === 'edit' ? (
            <>
              {/* Branch Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. Engineering Branch
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Object.values(ENGINEERING_BRANCHES).map(b => (
                    <button
                      key={b.id}
                      onClick={() => handleBranchChange(b.id)}
                      className={`text-left p-3.5 rounded-2xl border text-xs transition-all ${
                        selectedBranch === b.id
                          ? 'border-[#0A66FF] bg-blue-50/60 text-[#0A66FF] ring-2 ring-blue-500/20 font-semibold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <div className="font-bold text-sm text-slate-900 mb-0.5">{b.name}</div>
                      <div className="text-slate-500 text-[11px] line-clamp-1">{b.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Career Goal */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  2. Primary Career Goal
                </label>
                <div className="flex flex-wrap gap-2">
                  {currentBranchInfo.careerGoals.map(goal => (
                    <button
                      key={goal}
                      onClick={() => setCareerGoal(goal)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                        careerGoal === goal
                          ? 'bg-[#0A66FF] text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Subjects */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  3. Selected Subjects & Core Topics
                </label>
                <div className="flex flex-wrap gap-2">
                  {currentBranchInfo.subjects.map(sub => {
                    const isSelected = selectedSubjects.includes(sub);
                    return (
                      <button
                        key={sub}
                        onClick={() => toggleSubject(sub)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-[#0A66FF] text-[#0A66FF]'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{sub}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Languages / Tools */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  4. Preferred Technologies & Tools
                </label>
                <div className="flex flex-wrap gap-2">
                  {currentBranchInfo.allTechnologies.map(lang => {
                    const isSelected = selectedLanguages.includes(lang);
                    return (
                      <button
                        key={lang}
                        onClick={() => toggleLanguage(lang)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-slate-900 border-slate-900 text-white font-semibold'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{lang}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* Confirmation Step */
            <div className="py-4 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-blue-950 space-y-2">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <span>✨</span> Confirm Learning Path Update
                </h3>
                <p className="text-xs text-blue-900/80 leading-relaxed">
                  Your active path will immediately adapt your active recommendations without deleting any completed history!
                </p>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">New Branch:</span>
                  <span className="font-bold text-slate-900">{selectedBranch}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Career Goal:</span>
                  <span className="font-bold text-slate-900">{careerGoal}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
          {step === 'edit' ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep('confirm')}
                className="px-5 py-2.5 rounded-xl bg-[#0A66FF] hover:bg-[#0052DB] text-white text-xs font-semibold transition-all shadow-md"
              >
                Preview Changes →
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep('edit')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-all"
              >
                ← Edit Choices
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-[#0A66FF] hover:bg-[#0052DB] text-white text-xs font-bold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSaving ? 'Updating Path...' : 'Update My Path'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
