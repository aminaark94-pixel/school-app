import React, { useState } from 'react';
import {
  GraduationCap,
  CalendarCheck2,
  FileText,
  Settings,
  Database,
  ShieldCheck,
  Menu,
  X,
  Smartphone,
  BookOpen,
  Megaphone,
  CalendarDays,
} from 'lucide-react';
import { useSchoolData } from '../hooks/useSchoolData';
import { PWAInstallButton } from './PWAInstallButton';
import { SupabaseConfigModal } from './supabase/SupabaseConfigModal';

export type AppModule = 'portal' | 'diary' | 'attendance' | 'results' | 'communication' | 'datesheets' | 'admin';

interface NavbarProps {
  activeModule: AppModule;
  setActiveModule: (m: AppModule) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeModule, setActiveModule }) => {
  const { currentSchool, currentUser, isSupabaseActive } = useSchoolData();
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Header colours now follow the app palette (Owner Studio / theme.config.json).
  // School name, logo and motto still come from the school's own branding settings.
  const primaryColor = 'var(--t-primary)';
  const secondaryColor = 'var(--t-primary-deep)';

  const navItems = [
    {
      id: 'portal' as const,
      label: 'Campus Portal',
      icon: <Smartphone className="w-4 h-4" />,
      allowedRoles: ['admin', 'teacher', 'parent'],
    },
    {
      id: 'diary' as const,
      label: 'Digital Diary',
      icon: <BookOpen className="w-4 h-4" />,
      allowedRoles: ['admin', 'teacher', 'parent'],
    },
    {
      id: 'attendance' as const,
      label: 'Attendance',
      icon: <CalendarCheck2 className="w-4 h-4" />,
      allowedRoles: ['admin', 'teacher', 'parent'],
    },
    {
      id: 'results' as const,
      label: 'Result Cards',
      icon: <FileText className="w-4 h-4" />,
      allowedRoles: ['admin', 'teacher', 'parent'],
    },
    {
      id: 'communication' as const,
      label: 'Notices & Chat',
      icon: <Megaphone className="w-4 h-4" />,
      allowedRoles: ['admin', 'teacher', 'parent'],
    },
    {
      id: 'datesheets' as const,
      label: 'Datesheets',
      icon: <CalendarDays className="w-4 h-4" />,
      allowedRoles: ['admin', 'teacher', 'parent'],
    },
    {
      id: 'admin' as const,
      label: 'Admin',
      icon: <Settings className="w-4 h-4" />,
      allowedRoles: ['admin', 'teacher'],
    },
  ];

  // Filter visible items based on user role
  const visibleNavItems = navItems.filter((item) =>
    item.allowedRoles.includes(currentUser?.role || 'admin')
  );

  return (
    <>
      <header
        className="sticky top-0 z-40 text-[#EDE7C7] shadow-lg border-b border-[#D4AF37]/30 transition-colors"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-18">
            {/* School Brand & Logo */}
            <div className="flex items-center gap-3">
              {currentSchool?.logo_url ? (
                <img
                  src={currentSchool.logo_url}
                  alt={currentSchool.name}
                  className="w-11 h-11 rounded-2xl object-cover border-2 border-[#D4AF37]/70 shadow-md ring-1 ring-black/20"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-11 h-11 rounded-2xl bg-[#5B0202] border border-[#D4AF37]/60 flex items-center justify-center font-bold text-[#EDE7C7] shadow-sm">
                  <GraduationCap className="w-6 h-6 text-[#D4AF37]" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg sm:text-xl tracking-tight text-[#EDE7C7] line-clamp-1 font-['Cormorant_Garamond',serif] italic">
                    {currentSchool?.name || 'School Management PWA'}
                  </span>
                  <span
                    className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest text-[#EDE7C7] border border-[#D4AF37]/60 shadow-xs font-['Cinzel',serif]"
                    style={{ backgroundColor: secondaryColor }}
                  >
                    Est. 1928
                  </span>
                </div>
                <p className="text-[11px] text-[#EDE7C7]/80 line-clamp-1 font-medium hidden sm:block tracking-wide">
                  {currentSchool?.motto || 'Perseverantia et Virtus • Knowledge is Light'}
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
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
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Controls: PWA Install & Supabase Status */}
            <div className="flex items-center gap-2">
              <PWAInstallButton />

              {/* Supabase Status Pill */}
              <button
                id="supabase-status-pill"
                onClick={() => setIsDbModalOpen(true)}
                title="Supabase Database & Authentication Configuration"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold border transition ${
                  isSupabaseActive
                    ? 'bg-emerald-900/60 text-emerald-200 border-emerald-500/50 hover:bg-emerald-800/60'
                    : 'bg-[#5B0202]/80 text-[#EDE7C7] border-[#D4AF37]/30 hover:bg-[#5B0202]'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="hidden sm:inline text-[11px]">
                  {isSupabaseActive ? 'Cloud Live' : 'Demo DB'}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSupabaseActive ? 'bg-emerald-400 animate-pulse' : 'bg-[#D4AF37]'
                  }`}
                />
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-[#EDE7C7] hover:bg-white/10 transition"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#200E01] border-t border-[#5B0202] p-3 space-y-1.5 shadow-xl">
            {visibleNavItems.map((item) => {
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveModule(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition text-left ${
                    isActive
                      ? 'bg-[#EDE7C7] text-[#8B0000] font-black border border-[#D4AF37]'
                      : 'text-[#EDE7C7]/80 hover:bg-[#2D1605]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar (Standard PWA pattern) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-2 flex items-center justify-around shadow-lg">
        {visibleNavItems.map((item) => {
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition ${
                isActive
                  ? 'text-[#8B0000] font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-[#F8EBEB]' : ''}`}>
                {item.icon}
              </div>
              <span className="mt-0.5 line-clamp-1">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>


      <SupabaseConfigModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
      />
    </>
  );
};
