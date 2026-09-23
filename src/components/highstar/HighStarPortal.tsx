import React from 'react';
import { BookOpen, CalendarCheck2, FileText, Megaphone, CalendarDays, Settings, ArrowRight, Star } from 'lucide-react';
import { useSchoolData } from '../../hooks/useSchoolData';
import { AppModule } from '../Navbar';

/**
 * High Star skin's own portal/home screen — flat navy & gold quick-action
 * tiles, corporate in tone (based on the owner's uploaded High Star design).
 * Registered as this skin's `Portal` in lib/skins.ts. A new skin can supply
 * its own the same way — nothing else in the app needs to change.
 */

interface Tile {
  id: AppModule;
  title: string;
  sub: string;
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

const TILES: Tile[] = [
  { id: 'diary', title: 'Daily Diary', sub: 'Homework & classwork feed', Icon: BookOpen },
  { id: 'attendance', title: 'Attendance', sub: 'Daily attendance log', Icon: CalendarCheck2 },
  { id: 'results', title: 'Result Cards', sub: 'Exam results & transcripts', Icon: FileText },
  { id: 'communication', title: 'Notice Board', sub: 'Circulars & parent chat', Icon: Megaphone },
  { id: 'datesheets', title: 'Datesheets', sub: 'Exam schedule & syllabus', Icon: CalendarDays },
  { id: 'admin', title: 'Admin', sub: 'Roster & school data', Icon: Settings },
];

interface Props {
  setActiveModule: (m: AppModule) => void;
}

export const HighStarPortal: React.FC<Props> = ({ setActiveModule }) => {
  const { currentSchool, currentUser } = useSchoolData();
  const isParent = currentUser?.role === 'parent';
  const tiles = TILES.filter((t) => !(isParent && t.id === 'admin'));

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Welcome banner */}
      <div
        className="rounded-lg p-5 sm:p-7 text-white shadow-lg"
        style={{
          background:
            'linear-gradient(135deg, var(--t-primary) 0%, color-mix(in srgb, var(--t-primary) 80%, #0B4C93) 60%, var(--t-ink) 100%)',
        }}
      >
        <p
          className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded w-fit"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--t-accent) 25%, transparent)',
            color: 'var(--t-accent)',
          }}
        >
          <Star className="w-3 h-3 fill-current" />
          Learn &amp; Serve with Pride
        </p>
        <h2 className="mt-2.5 text-xl sm:text-2xl font-black tracking-tight">
          Welcome, {currentUser?.full_name || 'Guest'}
        </h2>
        <p className="mt-1 text-sm text-white/75">
          {currentSchool?.name || 'School Portal'} — {currentSchool?.motto || 'digital campus portal'}
        </p>
      </div>

      {/* Quick actions grid */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: 'var(--t-ink)' }}>
          Quick Academics &amp; Services
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {tiles.map(({ id, title, sub, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveModule(id)}
              className="group text-left p-4 sm:p-5 rounded-lg bg-white border transition hover:shadow-md"
              style={{ borderColor: 'var(--t-sand)' }}
            >
              <span
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3"
                style={{ backgroundColor: 'var(--t-primary)' }}
              >
                <Icon className="w-5 h-5" style={{ color: 'var(--t-accent)' }} />
              </span>
              <span className="block text-sm font-bold" style={{ color: 'var(--t-ink)' }}>
                {title}
              </span>
              <span className="block text-xs text-slate-500 mt-0.5">{sub}</span>
              <span
                className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold opacity-0 group-hover:opacity-100 transition"
                style={{ color: 'var(--t-primary)' }}
              >
                Open <ArrowRight className="w-3 h-3" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
