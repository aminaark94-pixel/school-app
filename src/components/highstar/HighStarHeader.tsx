import React from 'react';
import { Bell, Star } from 'lucide-react';
import { useSchoolData } from '../../hooks/useSchoolData';
import { getActiveSkin } from '../../lib/skins';
import { AppModule } from '../Navbar';

/**
 * High Star skin header — navy gradient band, gold crest, corporate wordmark.
 * Structurally mirrors the "Imperial" Navbar (same props, same module list),
 * so either skin can be swapped in without touching the modules themselves.
 */

const MODULES: Array<{ id: AppModule; label: string }> = [
  { id: 'portal', label: 'Campus' },
  { id: 'diary', label: 'Diary' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'results', label: 'Results' },
  { id: 'communication', label: 'Notices' },
  { id: 'datesheets', label: 'Exams' },
  { id: 'admin', label: 'Admin' },
];

const Crest: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 140 140" className={className} aria-hidden>
    <defs>
      <linearGradient id="hsGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFE066" />
        <stop offset="50%" stopColor="#F5B800" />
        <stop offset="100%" stopColor="#B88200" />
      </linearGradient>
      <linearGradient id="hsBlue" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#004D9F" />
        <stop offset="100%" stopColor="#0A2540" />
      </linearGradient>
    </defs>
    <path
      d="M 70,5 L 75,22 L 92,10 L 88,28 L 108,24 L 98,39 L 118,48 L 103,59 L 122,70 L 103,81 L 118,92 L 98,101 L 108,116 L 88,112 L 92,130 L 75,118 L 70,135 L 65,118 L 48,130 L 52,112 L 32,116 L 42,101 L 22,92 L 37,81 L 18,70 L 37,59 L 22,48 L 42,39 L 32,24 L 52,28 L 48,10 L 65,22 Z"
      fill="url(#hsGold)"
    />
    <circle cx="70" cy="70" r="50" fill="url(#hsBlue)" stroke="url(#hsGold)" strokeWidth="4" />
    <circle cx="70" cy="70" r="44" fill="none" stroke="#F5B800" strokeWidth="1.5" strokeDasharray="4,2" />
    <path
      d="M 70 30 L 96 42 L 96 72 C 96 90 70 102 70 102 C 70 102 44 90 44 72 L 44 42 Z"
      fill="#0A2540"
      stroke="url(#hsGold)"
      strokeWidth="3"
    />
    <path d="M 70 42 L 73 51 L 82 51 L 75 57 L 78 66 L 70 60 L 62 66 L 65 57 L 58 51 L 67 51 Z" fill="url(#hsGold)" />
    <path d="M 52 74 Q 70 68 70 78 Q 70 68 88 74 L 88 84 Q 70 78 70 87 Q 70 78 52 84 Z" fill="#FFFFFF" />
  </svg>
);

interface Props {
  activeModule: AppModule;
  setActiveModule: (m: AppModule) => void;
}

export const HighStarHeader: React.FC<Props> = ({ activeModule, setActiveModule }) => {
  const { currentSchool, currentUser } = useSchoolData();
  const isParent = currentUser?.role === 'parent';
  const visibleModules = MODULES.filter((m) => currentUser?.role === 'admin' || m.id !== 'admin');

  const initials = (currentUser?.full_name || 'User')
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  return (
    <>
      <header
        className="text-white shadow-xl relative z-40 border-b-2"
        style={{
          background:
            'linear-gradient(135deg, var(--t-primary) 0%, color-mix(in srgb, var(--t-primary) 80%, #0B4C93) 60%, var(--t-ink) 100%)',
          borderBottomColor: 'var(--t-accent)',
        }}
      >
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => setActiveModule('portal')}
            className="flex items-center gap-3 min-w-0 text-left"
          >
            <span
              className="relative flex items-center justify-center shrink-0 p-1.5 sm:p-2 rounded-2xl border-2"
              style={{ backgroundColor: 'rgba(4,18,38,0.6)', borderColor: 'var(--t-accent)' }}
            >
              <Crest className="w-11 h-11 sm:w-16 sm:h-16" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm sm:text-xl font-black leading-tight tracking-wide text-white truncate">
                {getActiveSkin().name}
              </span>
              <span
                className="mt-0.5 text-[10px] sm:text-xs font-bold tracking-wide flex items-center gap-1.5"
                style={{ color: 'var(--t-accent)' }}
              >
                <Star className="w-2.5 h-2.5 fill-current" />
                <span className="truncate">Learn &amp; Serve with Pride</span>
              </span>
            </span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3 ml-auto shrink-0">
            <button
              className="relative p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 border transition"
              style={{ borderColor: 'color-mix(in srgb, var(--t-accent) 30%, transparent)' }}
              title="Notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-slate-100" />
              <span
                className="absolute top-1 right-1 w-2 h-2 rounded-full"
                style={{ backgroundColor: 'var(--t-accent)' }}
              />
            </button>

            <div
              className="flex items-center gap-2 bg-white/10 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-full border"
              style={{ borderColor: 'color-mix(in srgb, var(--t-accent) 50%, transparent)' }}
            >
              <span
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full font-black text-[10px] sm:text-xs flex items-center justify-center border-2 border-white shrink-0"
                style={{ backgroundColor: 'var(--t-accent)', color: 'var(--t-primary)' }}
              >
                {initials}
              </span>
              <span className="hidden md:block text-left text-xs min-w-0">
                <span className="block font-bold text-white leading-none truncate">
                  {currentUser?.full_name || 'Guest'}
                </span>
                <span className="block text-[10px] leading-tight mt-0.5 capitalize" style={{ color: 'var(--t-accent)' }}>
                  {currentUser?.role || 'visitor'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Desktop module tabs */}
        <nav className="hidden sm:block border-t border-white/10">
          <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto">
            {visibleModules.map((m) => {
              const active = activeModule === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveModule(m.id)}
                  className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition ${
                    active ? 'text-white' : 'text-slate-300 border-transparent hover:text-white'
                  }`}
                  style={active ? { borderBottomColor: 'var(--t-accent)' } : undefined}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Phone bottom tab bar */}
      <nav
        aria-label="Primary navigation"
        className="sm:hidden fixed bottom-0 inset-x-0 z-50 border-t flex overflow-x-auto no-scrollbar"
        style={{ backgroundColor: 'var(--t-ink)', borderTopColor: 'color-mix(in srgb, var(--t-accent) 35%, transparent)' }}
      >
        {visibleModules.map((m) => {
          const active = activeModule === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setActiveModule(m.id)}
              className="min-w-[76px] flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wide"
              style={{ color: active ? 'var(--t-accent)' : 'rgba(255,255,255,0.6)' }}
            >
              {m.label}
            </button>
          );
        })}
      </nav>
    </>
  );
};
