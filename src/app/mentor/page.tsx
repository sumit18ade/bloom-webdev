'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, where, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ENGINEERING_BRANCHES } from '@/lib/taxonomy';
import { assembleUnifiedLearningContext } from '@/lib/recommendations';
import Link from 'next/link';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function MentorPage() {
  const { userData } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [attemptsHistory, setAttemptsHistory] = useState<Array<{ id?: string; userId: string; questionId: string; correct: boolean; concept?: string }>>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const branchKey = userData?.engineeringBranch || userData?.engineeringField || 'Computer Science';
  const branchInfo = ENGINEERING_BRANCHES[branchKey] || ENGINEERING_BRANCHES['Computer Science'];
  const activeTech = userData?.activeTechnology || branchInfo.recommendedTechnologies[0] || 'C';

  useEffect(() => {
    async function loadDataAndHistory() {
      if (!userData?.uid) return;
      try {
        // Load user practice attempts for context assembly
        const q = query(collection(db, 'practiceAttempts'), where('userId', '==', userData.uid));
        const snap = await getDocs(q);
        const records = snap.docs.map(d => ({
          id: d.id,
          userId: userData.uid,
          questionId: d.data().questionId,
          correct: !!d.data().correct,
          concept: d.data().concept || d.data().topic
        }));
        setAttemptsHistory(records);

        // Load existing active mentor session if available
        const sDocId = `mentor_session_${userData.uid}`;
        setSessionId(sDocId);

        const sessionRef = doc(db, 'mentorSessions', sDocId);
        const sSnap = await getDoc(sessionRef);

        if (sSnap.exists() && sSnap.data().messages) {
          const loadedMsgs = sSnap.data().messages.map((m: { id: string; role: 'user' | 'assistant'; content: string; timestamp: unknown }) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: m.timestamp && typeof (m.timestamp as { toDate?: () => Date }).toDate === 'function' ? (m.timestamp as { toDate: () => Date }).toDate() : new Date()
          }));
          setMessages(loadedMsgs);
        } else {
          // Initialize welcome message
          const name = userData?.displayName?.split(' ')[0] || 'Engineer';
          const goal = userData?.careerGoal || branchInfo.careerGoals[0];
          const initialMsgs: Message[] = [
            {
              id: 'welcome-1',
              role: 'assistant',
              content: `Hello ${name}! I'm Bloom Mentor, your context-aware AI tutor for **${branchInfo.name}**.\n\nYour current learning path is configured for **${goal}** with active technology **${activeTech}**.\n\nHow can I help you master your current concepts today?`,
              timestamp: new Date()
            }
          ];
          setMessages(initialMsgs);
          await setDoc(sessionRef, {
            userId: userData.uid,
            branch: branchKey,
            activeTech,
            messages: initialMsgs,
            updatedAt: new Date()
          }, { merge: true });
        }
      } catch (err) {
        console.warn('Notice: Loading mentor history skipped:', err);
      }
    }
    loadDataAndHistory();
  }, [userData?.uid, branchKey, activeTech, branchInfo.name, branchInfo.careerGoals]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const ctx = useMemo(() => {
    return assembleUnifiedLearningContext(userData, attemptsHistory);
  }, [userData, attemptsHistory]);

  const handleSendMessage = async (customPrompt?: string, actionName?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || isThinking || !userData) return;

    const userMsg: Message = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `user-${messages.length + 1}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    const updatedMsgs = [...messages, userMsg];
    setMessages(updatedMsgs);
    if (!customPrompt) setInput('');
    setIsThinking(true);

    try {
      const apiRes = await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          action: actionName || 'General Guidance',
          context: {
            branch: ctx.branch,
            careerGoal: ctx.careerGoal,
            activeTechnology: ctx.activeTechnology,
            activeNodeTitle: ctx.activeNode.title,
            weakSkills: ctx.weakSkills,
            recentAccuracyPct: ctx.recentAccuracyPct
          }
        })
      });

      let replyText = '';
      if (apiRes.ok) {
        const data = await apiRes.json();
        replyText = data.reply;
      } else {
        replyText = `Regarding **"${textToSend}"** in **${activeTech}**:\n\nFocus on computational memory layout and check your pointer array bounds.\n\nWould you like a code snippet or a step-by-step hint?`;
      }

      const assistantMsg: Message = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `assistant-${messages.length + 2}`,
        role: 'assistant',
        content: replyText,
        timestamp: new Date()
      };

      const finalMsgs = [...updatedMsgs, assistantMsg];
      setMessages(finalMsgs);

      if (sessionId) {
        await setDoc(doc(db, 'mentorSessions', sessionId), {
          userId: userData.uid,
          messages: finalMsgs,
          updatedAt: new Date()
        }, { merge: true });
      }
    } catch (e) {
      console.error('Error querying Bloom Mentor API:', e);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <ProtectedRoute>
      <Navigation />
      <main className="min-h-screen bg-[#FBFBFA] text-[#0F172A] pb-24">
        <div className="max-w-7xl mx-auto px-6 pt-8">
          {/* Header */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold font-mono text-[#0A66FF] uppercase tracking-wider block">
                CONTEXT-AWARE AI MENTOR · {activeTech}
              </span>
              <h1 className="font-headline text-3xl font-bold tracking-tight text-slate-900">
                Bloom Mentor
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#0A66FF] text-xs font-mono font-bold">
                Goal: {ctx.careerGoal}
              </span>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversation Main Panel */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm flex flex-col h-[72vh]">
              {/* Message History */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {messages.map(m => (
                  <div
                    key={m.id}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-[#0A66FF] text-white font-medium shadow-sm'
                          : 'bg-slate-50 border border-slate-200/90 text-slate-800 space-y-2'
                      }`}
                    >
                      <div className="whitespace-pre-line leading-relaxed font-sans">{m.content}</div>
                    </div>
                  </div>
                ))}

                {isThinking && (
                  <div className="flex justify-start">
                    <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3 text-xs text-slate-500 font-mono animate-pulse flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#0A66FF] animate-ping" />
                      Bloom Mentor is analyzing your {activeTech} context...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Action Toolbar */}
              <div className="py-3 border-t border-slate-100 flex flex-wrap gap-2">
                {[
                  { label: 'Explain Simply', action: 'Explain Simply' },
                  { label: 'Deep Dive', action: 'Deep Dive' },
                  { label: 'Give Hint', action: 'Give Hint' },
                  { label: 'Show Example', action: 'Show Example' },
                  { label: 'Quiz Me', action: 'Quiz Me' },
                  { label: 'Revision Plan', action: 'Create Revision Plan' }
                ].map(act => (
                  <button
                    key={act.label}
                    onClick={() => handleSendMessage(`Help me with ${ctx.activeNode.title} (${act.label})`, act.action)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-[#0A66FF] font-semibold text-[11px] transition-all"
                  >
                    ✨ {act.label}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <div className="pt-2 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder={`Ask Bloom Mentor about ${activeTech} or ${ctx.activeNode.title}...`}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs outline-none focus:ring-2 focus:ring-[#0A66FF]"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || isThinking}
                  className="px-5 py-2.5 rounded-xl bg-[#0A66FF] text-white text-xs font-bold hover:bg-[#0052DB] shadow-sm disabled:opacity-50 transition-all"
                >
                  Send
                </button>
              </div>
            </div>

            {/* Right Drawer: YOUR CONTEXT */}
            <div className="space-y-6">
              <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#0A66FF] font-bold uppercase tracking-wider">YOUR CONTEXT</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold text-[10px]">GROUNDED</span>
                </div>

                <div className="space-y-3 text-xs divide-y divide-slate-800">
                  <div className="pt-2">
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Engineering Branch</span>
                    <span className="font-bold text-white text-sm">{branchInfo.name}</span>
                  </div>

                  <div className="pt-2">
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Active Technology</span>
                    <span className="font-bold text-[#0A66FF] text-sm">{activeTech}</span>
                  </div>

                  <div className="pt-2">
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Target Career Goal</span>
                    <span className="font-bold text-white text-sm">{ctx.careerGoal}</span>
                  </div>

                  <div className="pt-2">
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Active Roadmap Node</span>
                    <span className="font-bold text-slate-200">{ctx.activeNode.title}</span>
                  </div>

                  <div className="pt-2">
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Identified Weak Areas</span>
                    {ctx.weakSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {ctx.weakSkills.map((w: string) => (
                          <span key={w} className="px-2 py-0.5 rounded bg-red-950 text-red-400 text-[10px] font-mono">
                            ⚠️ {w}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-emerald-400 font-mono text-[11px] block mt-1">No weak areas flagged!</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Jump Action Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">RECOMMENDED NEXT ACTION</span>
                <p className="text-slate-800 font-bold text-xs">
                  Practice pointers and pointer dereferencing to resolve weak skills.
                </p>
                <Link
                  href="/practice"
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-[#0A66FF] text-white text-xs font-bold transition-all block text-center"
                >
                  Start Practice Session →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}