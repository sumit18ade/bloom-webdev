'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

import BloomLogo from '@/components/BloomLogo';
import CustomizePathModal from '@/components/CustomizePathModal';
import SearchModal from '@/components/SearchModal';

export default function Navigation() {
  const pathname = usePathname();
  const { user, userData, signOut } = useAuth();
  
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/home' && pathname === '/home') return true;
    if (path !== '/home' && pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { path: '/home', label: 'Home', icon: 'home' },
    { path: '/explore', label: 'Learn', icon: 'auto_stories' },
    { path: '/roadmap', label: 'Roadmap', icon: 'route' },
    { path: '/practice', label: 'Practice', icon: 'psychology_alt' },
    { path: '/games', label: 'Games', icon: 'sports_esports' },
    { path: '/projects', label: 'Projects', icon: 'construction' },
    { path: '/mentor', label: 'Mentor', icon: 'psychology' },
  ];

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="bg-[#FBFBFA]/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/home" className="group flex items-center gap-2">
              <BloomLogo size={32} showText={true} />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                      active
                        ? 'bg-blue-50 text-[#0A66FF] font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Right Status / Search / Menu */}
            <div className="flex items-center gap-3">
              {/* Cmd+K Search trigger */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">search</span>
                <span>Search Bloom...</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono text-slate-400">⌘K</kbd>
              </button>

              {user && userData && (
                <div className="hidden sm:flex items-center gap-2">
                  {/* Real XP badge */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0A66FF]" />
                    <span>{userData.xp || 0} XP</span>
                  </div>
                  {/* Real Streak badge */}
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 font-mono text-xs font-semibold">
                    <svg className="w-3.5 h-3.5 text-amber-600 fill-current" viewBox="0 0 24 24">
                      <path d="M12 23c-4.97 0-9-3.58-9-8 0-3.07 1.76-5.83 4.5-7.15C8 7.35 8.5 6.45 8.5 5.5 8.5 4.12 7.62 3 6.5 3c-.28 0-.5.22-.5.5C6 7 8 9 8 11.5c0 1.93-1.57 3.5-3.5 3.5S1 13.43 1 11.5c0-4.14 3.58-7.5 8-7.5.28 0 .5.22.5.5C9.5 6.5 10.5 8 12 8c2.21 0 4-1.79 4-4 0-.28.22-.5.5-.5 4.42 0 8 3.36 8 7.5 0 4.42-4.03 8-9 8z" />
                    </svg>
                    <span>{userData.currentStreak || 0}d</span>
                  </div>
                </div>
              )}

              {user ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 focus:outline-none">
                    {userData?.photoURL ? (
                      <Image
                        src={userData.photoURL}
                        alt={userData.displayName || 'User'}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0A66FF] flex items-center justify-center font-mono text-xs font-bold border border-blue-200">
                        {userData?.displayName?.charAt(0) || 'U'}
                      </div>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <button
                      onClick={() => setIsCustomizeOpen(true)}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-[#0A66FF] hover:bg-blue-50 flex items-center gap-1.5"
                    >
                      <span>✨</span> Customize Learning
                    </button>
                    <div className="my-1 border-t border-slate-100" />
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Profile & Active Path
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Settings
                    </Link>
                    <Link
                      href="/progress"
                      className="block px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Skill Garden & Mastery
                    </Link>
                    <div className="my-1 border-t border-slate-100" />
                    <button
                      onClick={signOut}
                      className="block w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-[#0A66FF] hover:bg-[#0052DB] text-white text-[13px] font-medium transition-all shadow-sm"
                >
                  <span>Sign in</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar — sleek 5-item bar with More Drawer */}
      <nav
        aria-label="Mobile navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 6px)' }}
      >
        <div className="grid grid-cols-5 items-center px-2 py-1.5 max-w-md mx-auto">
          {[
            { path: '/home', label: 'Home', icon: 'home' },
            { path: '/explore', label: 'Learn', icon: 'auto_stories' },
            { path: '/roadmap', label: 'Roadmap', icon: 'route' },
            { path: '/practice', label: 'Practice', icon: 'psychology_alt' },
          ].map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-medium transition-all ${
                  active
                    ? 'text-[#0A66FF] font-bold bg-blue-50/80'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] mb-0.5 ${active ? 'text-[#0A66FF]' : 'text-slate-500'}`}>
                  {item.icon}
                </span>
                <span className="truncate max-w-[56px] text-center">{item.label}</span>
              </Link>
            );
          })}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-medium transition-all ${
              isMobileMenuOpen || ['/games', '/projects', '/mentor', '/profile', '/settings'].some(p => pathname.startsWith(p))
                ? 'text-[#0A66FF] font-bold bg-blue-50/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[20px] mb-0.5">grid_view</span>
            <span className="truncate max-w-[56px] text-center">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-t-3xl border-t border-slate-200 p-6 space-y-4 max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BloomLogo size={24} showText={true} />
                <span className="text-[10px] font-mono text-[#0A66FF] font-bold uppercase">Navigation Menu</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { path: '/games', label: 'Engineering Games', icon: 'sports_esports', desc: 'SQL, Packet, Code' },
                { path: '/projects', label: 'Guided Projects', icon: 'construction', desc: 'GitHub & AI Review' },
                { path: '/mentor', label: 'Bloom Mentor', icon: 'psychology', desc: 'AI Tutor & Hints' },
                { path: '/notes', label: 'AI Notes Studio', icon: 'edit_note', desc: 'Summaries & Cards' },
                { path: '/progress', label: 'Skill Garden', icon: 'eco', desc: 'Mastery & Heatmap' },
                { path: '/profile', label: 'Profile & Active Path', icon: 'account_circle', desc: 'Branch & Tech' },
                { path: '/settings', label: 'App Settings', icon: 'settings', desc: 'Preferences & Data' },
              ].map((m) => (
                <Link
                  key={m.path}
                  href={m.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    pathname.startsWith(m.path)
                      ? 'bg-blue-50 border-[#0A66FF] text-[#0A66FF]'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-[18px] text-[#0A66FF]">{m.icon}</span>
                    <span className="font-headline text-xs font-bold truncate">{m.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono truncate">{m.desc}</span>
                </Link>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => { setIsMobileMenuOpen(false); setIsCustomizeOpen(true); }}
                className="px-4 py-2.5 rounded-xl bg-blue-50 text-[#0A66FF] text-xs font-bold border border-blue-200 w-full text-center"
              >
                ✨ Customize Learning Path
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spacer so content isn't hidden behind fixed bottom nav on mobile */}
      <div className="lg:hidden h-20" aria-hidden="true" />

      {/* Global Modals */}
      <CustomizePathModal isOpen={isCustomizeOpen} onClose={() => setIsCustomizeOpen(false)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}