'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import CustomizePathModal from '@/components/CustomizePathModal';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function SettingsPage() {
  const { userData, refreshUserData } = useAuth();
  
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [dailyGoal, setDailyGoal] = useState<number>(userData?.dailyGoal || 30);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const handleSaveSettings = async () => {
    if (!userData) return;
    try {
      const userRef = doc(db, 'users', userData.uid);
      await updateDoc(userRef, {
        dailyGoal,
        updatedAt: new Date(),
      });
      await refreshUserData();
      setSavedMessage('Settings saved successfully!');
      setTimeout(() => setSavedMessage(null), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
    }
  };

  return (
    <ProtectedRoute>
      <Navigation />
      <main className="min-h-screen bg-[#FBFBFA] text-[#0F172A] pb-24">
        <div className="max-w-4xl mx-auto px-6 pt-8 space-y-8">
          {/* Header */}
          <div>
            <span className="text-[11px] font-bold font-mono text-[#0A66FF] uppercase tracking-wider block">
              PLATFORM SETTINGS
            </span>
            <h1 className="font-headline text-3xl font-bold tracking-tight text-slate-900">
              Settings & Preferences
            </h1>
          </div>

          {savedMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              ✓ {savedMessage}
            </div>
          )}

          {/* Section 1: Customize Learning Path */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Customize My Learning Path</h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Change your engineering branch, career goal, selected subjects, or preferred languages.
              </p>
            </div>
            <button
              onClick={() => setIsCustomizeOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#0A66FF] hover:bg-[#0052DB] text-white text-xs font-semibold shadow-sm transition-all"
            >
              Update Path →
            </button>
          </div>

          {/* Section 2: Learning Pacing */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">Learning Pacing</h2>
            <div className="space-y-3 text-xs">
              <label className="block text-slate-700 font-semibold">Daily Study Target (Minutes)</label>
              <div className="flex gap-2">
                {[15, 30, 45, 60].map(mins => (
                  <button
                    key={mins}
                    onClick={() => setDailyGoal(mins)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      dailyGoal === mins
                        ? 'bg-blue-50 border-[#0A66FF] text-[#0A66FF]'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {mins} mins / day
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Notifications & Reminders */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">Notifications & Reminders</h2>
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Daily Study Reminders</div>
                  <div className="text-slate-500">Receive gentle alerts to preserve your daily streak.</div>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${notifications ? 'bg-[#0A66FF]' : 'bg-slate-200'}`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${notifications ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Weekly Progress Report</div>
                  <div className="text-slate-500">Summary of unlocked skills and completed project milestones.</div>
                </div>
                <button
                  onClick={() => setEmailUpdates(!emailUpdates)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${emailUpdates ? 'bg-[#0A66FF]' : 'bg-slate-200'}`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${emailUpdates ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Appearance */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">Appearance</h2>
            <div className="flex gap-2">
              {(['light', 'dark', 'system'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border capitalize transition-all ${
                    theme === t ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Save Action */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="px-6 py-2.5 rounded-xl bg-[#0A66FF] hover:bg-[#0052DB] text-white text-xs font-semibold shadow-sm transition-all"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </main>

      <CustomizePathModal isOpen={isCustomizeOpen} onClose={() => setIsCustomizeOpen(false)} />
    </ProtectedRoute>
  );
}