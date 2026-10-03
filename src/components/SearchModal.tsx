'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { seedCourses, seedGames, seedProjects, seedLessons } from '@/lib/seed-data';
import { ENGINEERING_BRANCHES } from '@/lib/taxonomy';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();
  const tokens = trimmed.split(/\s+/).filter(Boolean);

  const matchesTokens = (text: string) => {
    const lower = text.toLowerCase();
    return tokens.every(token => lower.includes(token));
  };

  const matchingCourses = trimmed
    ? seedCourses.filter(c =>
        matchesTokens(c.title) ||
        matchesTokens(c.description) ||
        c.skills.some(s => matchesTokens(s))
      )
    : [];

  const matchingLessons = trimmed
    ? seedLessons.filter(l =>
        matchesTokens(l.title) ||
        matchesTokens(l.description) ||
        matchesTokens(l.content)
      )
    : [];

  const matchingGames = trimmed
    ? seedGames.filter(g =>
        matchesTokens(g.title) ||
        matchesTokens(g.description) ||
        matchesTokens(g.type)
      )
    : [];

  const matchingProjects = trimmed
    ? seedProjects.filter(p =>
        matchesTokens(p.title) ||
        matchesTokens(p.description) ||
        p.skills.some(s => matchesTokens(s))
      )
    : [];

  // Technologies / Skills match
  const matchingTechs: { name: string; branch: string }[] = [];
  if (trimmed) {
    Object.values(ENGINEERING_BRANCHES).forEach(b => {
      b.allTechnologies.forEach(t => {
        if (matchesTokens(t) && !matchingTechs.some(m => m.name === t)) {
          matchingTechs.push({ name: t, branch: b.shortName });
        }
      });
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[82vh]">
        {/* Search Input Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
          <span className="material-symbols-outlined text-slate-400 text-xl">search</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search skills, courses, concepts (e.g. 'C', 'SQL', 'React', 'Python', 'DSA')..."
            className="w-full bg-transparent outline-none text-slate-900 text-sm font-semibold placeholder-slate-400"
            autoFocus
          />
          <button
            onClick={onClose}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-200/80 text-slate-700 font-mono hover:bg-slate-300 font-bold"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {!trimmed && (
            <div className="py-10 text-center text-slate-400 text-xs">
              Type to search across courses, lessons, skills, games, and capstones...
            </div>
          )}

          {trimmed &&
            matchingCourses.length === 0 &&
            matchingLessons.length === 0 &&
            matchingGames.length === 0 &&
            matchingProjects.length === 0 &&
            matchingTechs.length === 0 && (
              <div className="py-10 text-center text-slate-500 text-xs">
                No exact match found for &quot;{query}&quot;. Try searching for &quot;C&quot;, &quot;Python&quot;, &quot;SQL&quot;, or &quot;Networks&quot;.
              </div>
            )}

          {/* Matching Technologies */}
          {matchingTechs.length > 0 && (
            <div>
              <div className="text-[10px] font-mono font-bold text-[#0A66FF] uppercase tracking-wider mb-2">
                Technologies & Languages
              </div>
              <div className="flex flex-wrap gap-2">
                {matchingTechs.map(t => (
                  <Link
                    key={t.name}
                    href="/explore"
                    onClick={onClose}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-[#0A66FF] text-xs font-bold hover:bg-blue-100 transition-all flex items-center gap-1.5"
                  >
                    <span>{t.name}</span>
                    <span className="text-[10px] font-mono text-blue-400">({t.branch})</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Courses */}
          {matchingCourses.length > 0 && (
            <div>
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">Courses</div>
              <div className="space-y-2">
                {matchingCourses.map(c => (
                  <Link
                    key={c.id}
                    href={`/courses/${c.id}`}
                    onClick={onClose}
                    className="block p-3.5 rounded-2xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-headline font-bold text-xs text-slate-900">{c.title}</span>
                      <span className="text-[10px] font-mono text-[#0A66FF] font-semibold">{c.level}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{c.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Lessons */}
          {matchingLessons.length > 0 && (
            <div>
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">Lessons</div>
              <div className="space-y-2">
                {matchingLessons.map(l => (
                  <Link
                    key={l.id}
                    href={`/lessons/${l.id}`}
                    onClick={onClose}
                    className="block p-3.5 rounded-2xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all"
                  >
                    <div className="font-headline font-bold text-xs text-slate-900">{l.title}</div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{l.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Games */}
          {matchingGames.length > 0 && (
            <div>
              <div className="text-[10px] font-mono font-bold text-purple-600 uppercase tracking-wider mb-2">Interactive Games</div>
              <div className="space-y-2">
                {matchingGames.map(g => (
                  <Link
                    key={g.id}
                    href="/games"
                    onClick={onClose}
                    className="block p-3.5 rounded-2xl border border-purple-100 hover:border-purple-300 hover:bg-purple-50/50 transition-all"
                  >
                    <div className="font-headline font-bold text-xs text-slate-900">{g.title}</div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{g.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {matchingProjects.length > 0 && (
            <div>
              <div className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-wider mb-2">Capstone Projects</div>
              <div className="space-y-2">
                {matchingProjects.map(p => (
                  <Link
                    key={p.id}
                    href="/projects"
                    onClick={onClose}
                    className="block p-3.5 rounded-2xl border border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all"
                  >
                    <div className="font-headline font-bold text-xs text-slate-900">{p.title}</div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{p.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
