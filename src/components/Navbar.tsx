import React, { useEffect, useState } from 'react';
import {
  GraduationCap,
  CalendarCheck2,
  FileText,
  Settings,
  Database,
  Menu,
  X,
  Smartphone,
  BookOpen,
  Megaphone,
  CalendarDays,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useSchoolData } from '../hooks/useSchoolData';
import { PWAInstallButton } from './PWAInstallButton';
import { SupabaseConfigModal } from './supabase/SupabaseConfigModal';

export type AppModule = 'portal' | 'diary' | 'attendance' | 'results' | 'communication' | 'datesheets' | 'admin';

interface NavbarProps {
  activeModule: AppModule;
  setActiveModule: (m: AppModule) => void;
}

interface NavItem {
  id: AppModule;
  label: string;
  shortLabel: string;
  Icon: LucideIcon;
  allowedRoles: string[];
}

const ALL_ROLES = ['admin', 'teacher', 'parent'];

const NAV_ITEMS: NavItem[] = [
  { id: 'portal', label: 'Campus Portal', shortLabel: 'Home', Icon: Smartphone, allowedRoles: ALL_ROLES },
  { id: 'diary', label: 'Digital Diary', shortLabel: 'Diary', Icon: BookOpen, allowedRoles: ALL_ROLES },
  { id: 'attendance', label: 'Attendance', shortLabel: 'Attendance', Icon: CalendarCheck2, allowedRoles: ALL_ROLES },
  { id: 'results', label: 'Result Cards', shortLabel: 'Results', Icon: FileText, allowedRoles: ALL_ROLES },
  { id: 'communication', label: 'Notices & Chat', shortLabel: 'Notices', Icon: Megaphone, allowedRoles: ALL_ROLES },
  { id: 'datesheets', label: 'Datesheets', shortLabel: 'Datesheets', Icon: CalendarDays, allowedRoles: ALL_ROLES },
  { id: 'admin', label: 'Admin', shortLabel: 'Admin', Icon: Settings, allowedRoles: ['admin', 'teacher'] },
];

// A phone tab bar comfortably fits 5 slots. When there are more sections, the last slot becomes "More".
const MAX_BOTTOM_SLOTS = 5;

export const Navbar: React.FC<NavbarProps> = ({ activeModule, setActiveModule }) => {
  const { currentSchool, currentUser, isSupabaseActive } = useSchoolData();
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  // Header colours follow the app palette (Owner Studio / theme.config.json).
  const primaryColor = 'var(--t-primary)';
  const secondaryColor = 'var(--t-primary-deep)';

  const visibleNavItems = NAV_ITEMS.filter((item) =>
    item.allowedRoles.includes(currentUser?.role || 'admin')
  );

  const overflows = visibleNavItems.length > MAX_BOTTOM_SLOTS;
  const bottomItems = overflows ? visibleNavItems.slice(0, MAX_BOTTOM_SLOTS - 1) : visibleNavItems;
  const moreItems = overflows ? visibleNavItems.slice(MAX_BOTTOM_SLOTS - 1) : [];
  const moreActive = moreItems.some((item) => item.id === activeModule);

  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoreOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [moreOpen]);

  const go = (id: AppModule) => {
    setActiveModule(id);
    setMoreOpen(false);
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <header
        className="sticky top-0 z-40 text-[#EDE7C7] shadow-lg border-b border-[#D4AF37]/30 transition-colors top-safe"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between gap-2 h-14 md:h-18">
            {/* School brand & logo */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              {currentSchool?.logo_url ? (
                <img
                  src={currentSchool.logo_url}
                  alt={currentSchool.name}
                  className="w-9 h-9 md:w-11 md:h-11 shrink-0 rounded-xl md:rounded-2xl object-cover border-2 border-[#D4AF37]/70 shadow-md ring-1 ring-black/20"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-9 h-9 md:w-11 md:h-11 shrink-0 rounded-xl md:rounded-2xl bg-[#5B0202] border border-[#D4AF37]/60 flex items-center justify-center font-bold text-[#EDE7C7] shadow-sm">
                  <GraduationCap className="w-5 h-5 md:w-6 md:h-6 text-[#D4AF37]" />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-bold text-base sm:text-xl tracking-tight text-[#EDE7C7] truncate font-['Cormorant_Garamond',serif] italic">
                    {currentSchool?.name || 'School Management PWA'}
                  </span>
                  <span
                    className="hidden sm:inline-block shrink-0 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest text-[#EDE7C7] border border-[#D4AF37]/60 shadow-xs font-['Cinzel',serif]"
                    style={{ backgroundColor: secondaryColor }}
                  >
                    Est. 1928
                  </span>
                </div>
                <p className="text-[11px] text-[#EDE7C7]/80 truncate font-medium hidden sm:block tracking-wide">
                  {currentSchool?.motto || 'Perseverantia et Virtus • Knowledge is Light'}
                </p>
              </div>
            </div>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center gap-1.5 bg-[#5B0202]/70 p-1.5 rounded-2xl border border-[#D4AF37]/30 shadow-inner">
              {visibleNavItems.map((item) => {
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-link-${item.id}`}
                    onClick={() => setActiveModule(item.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-[#EDE7C7] text-[#8B0000] border border-[#D4AF37] shadow-sm font-black'
                        : 'text-[#EDE7C7]/80 hover:text-[#EDE7C7] hover:bg-white/10'
                    }`}
                  >
                    <item.Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right controls */}
            <div className="flex items-center gap-2 shrink-0">
              <PWAInstallButton />

              {/* Database status pill: desktop only. On phones it lives in the "More" sheet. */}
              <button
                id="supabase-status-pill"
                onClick={() => setIsDbModalOpen(true)}
                title="Supabase Database & Authentication Configuration"
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold border transition ${
                  isSupabaseActive
                    ? 'bg-emerald-900/60 text-emerald-200 border-emerald-500/50 hover:bg-emerald-800/60'
                    : 'bg-[#5B0202]/80 text-[#EDE7C7] border-[#D4AF37]/30 hover:bg-[#5B0202]'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="text-[11px]">{isSupabaseActive ? 'Cloud Live' : 'Demo DB'}</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSupabaseActive ? 'bg-emerald-400 animate-pulse' : 'bg-[#D4AF37]'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Phone bottom tab bar (hidden on md+ where the header tabs take over) */}
      <nav
        aria-label="Primary"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EDE7C7] shadow-[0_-4px_20px_rgba(32,14,1,0.08)] bottom-nav-safe"
      >
        <div className="flex items-stretch h-16">
          {bottomItems.map((item) => {
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition active:scale-95 ${
                  isActive ? 'text-[#8B0000]' : 'text-[#5B0202]/60'
                }`}
              >
                <span
                  className={`px-4 py-1 rounded-full transition ${isActive ? 'bg-[#F8EBEB]' : ''}`}
                >
                  <item.Icon className="w-5 h-5" />
                </span>
                <span className="truncate max-w-full px-1">{item.shortLabel}</span>
              </button>
            );
          })}

          {overflows && (
            <button
              onClick={() => setMoreOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={moreOpen}
              className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition active:scale-95 ${
                moreActive ? 'text-[#8B0000]' : 'text-[#5B0202]/60'
              }`}
            >
              <span className={`px-4 py-1 rounded-full transition ${moreActive ? 'bg-[#F8EBEB]' : ''}`}>
                <Menu className="w-5 h-5" />
              </span>
              <span className="truncate max-w-full px-1">More</span>
            </button>
          )}
        </div>
      </nav>

      {/* "More" bottom sheet */}
      {moreOpen && (
        <div
          className="md:hidden fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-label="More sections"
        >
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-black/50"
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 bg-[#200E01] text-[#EDE7C7] rounded-t-3xl border-t border-[#D4AF37]/40 shadow-2xl bottom-nav-safe">
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#D4AF37] font-['Cinzel',serif]">
                More
              </span>
              <button
                aria-label="Close"
                onClick={() => setMoreOpen(false)}
                className="p-2 -mr-2 rounded-xl hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-3 pb-3 space-y-1.5">
              {moreItems.map((item) => {
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => go(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full flex items-center gap-3 px-4 min-h-[52px] rounded-2xl text-sm font-bold text-left transition ${
                      isActive
                        ? 'bg-[#EDE7C7] text-[#8B0000] border border-[#D4AF37]'
                        : 'text-[#EDE7C7] hover:bg-[#2D1605]'
                    }`}
                  >
                    <item.Icon className={`w-5 h-5 ${isActive ? 'text-[#8B0000]' : 'text-[#D4AF37]'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <button
                onClick={() => {
                  setMoreOpen(false);
                  setIsDbModalOpen(true);
                }}
                className="w-full flex items-center gap-3 px-4 min-h-[52px] rounded-2xl text-sm font-bold text-left text-[#EDE7C7] hover:bg-[#2D1605] transition"
              >
                <Database className="w-5 h-5 text-[#D4AF37]" />
                <span>Database status</span>
                <span
                  className={`ml-auto text-[11px] font-semibold ${
                    isSupabaseActive ? 'text-emerald-300' : 'text-[#EDE7C7]/60'
                  }`}
                >
                  {isSupabaseActive ? 'Cloud Live' : 'Demo DB'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      <SupabaseConfigModal isOpen={isDbModalOpen} onClose={() => setIsDbModalOpen(false)} />
    </>
  );
};
