import React, { useState } from 'react';
import {
  BookOpen, CalendarCheck2, CalendarDays, ChevronRight, FileText,
  GraduationCap, Megaphone, Menu, Settings, Sparkles, X,
} from 'lucide-react';
import { useSchoolData } from '../../hooks/useSchoolData';
import { getActiveSkin } from '../../lib/skins';
import type { AppModule } from '../Navbar';

type SkinStyle = 'ideas' | 'leading';

const BRANDS: Record<SkinStyle, { tagline: string }> = {
  ideas: {
    tagline: 'Learning today, leading tomorrow',
  },
  leading: {
    tagline: 'Empowering young minds for a brighter future',
  },
};

interface Props {
  activeModule?: AppModule;
  setActiveModule: (module: AppModule) => void;
  style: SkinStyle;
}

const items: Array<{ id: AppModule; label: string; short: string; Icon: React.ElementType }> = [
  { id: 'portal', label: 'Home', short: 'Home', Icon: GraduationCap },
  { id: 'diary', label: 'Diary', short: 'Diary', Icon: BookOpen },
  { id: 'attendance', label: 'Attendance', short: 'Attendance', Icon: CalendarCheck2 },
  { id: 'results', label: 'Results', short: 'Results', Icon: FileText },
  { id: 'communication', label: 'Notices', short: 'Notices', Icon: Megaphone },
  { id: 'datesheets', label: 'Exams', short: 'Exams', Icon: CalendarDays },
  { id: 'admin', label: 'Admin', short: 'Admin', Icon: Settings },
];

function allowedItems(role?: string) {
  return items.filter((item) => role === 'admin' || item.id !== 'admin');
}

/**
 * Reusable whole-app shell for reference skins. Adding a future visual skin is
 * intentionally small: add its palette in lib/skins.ts and a config/wrapper
 * here (or point Header/Portal at entirely new components).
 */
const ReferenceHeader: React.FC<Props> = ({ activeModule = 'portal', setActiveModule, style }) => {
  const { currentUser } = useSchoolData();
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = allowedItems(currentUser?.role);
  const ideas = style === 'ideas';
  const brand = BRANDS[style];
  const go = (id: AppModule) => {
    setActiveModule(id);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      className="relative z-40 text-white shadow-xl"
      style={{ backgroundColor: ideas ? '#061121' : '#1e293b' }}
    >
      <div
        className={ideas ? 'border-b border-white/10 bg-[radial-gradient(circle_at_90%_0%,rgba(240,36,52,.28),transparent_42%)]' : 'border-b-4 border-[#f59e0b] bg-[radial-gradient(circle_at_8%_0%,rgba(245,158,11,.25),transparent_35%)]'}
      >
        <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <button onClick={() => go('portal')} className="flex min-w-0 flex-1 items-center gap-3 text-left">
            <span
              className={`grid h-11 w-11 shrink-0 place-items-center shadow-lg ring-2 ring-white/20 ${ideas ? 'rounded-2xl' : '-rotate-2 rounded-xl text-[#1e293b]'}`}
              style={{ backgroundColor: ideas ? '#d91424' : '#f59e0b' }}
            >
              <GraduationCap className="h-6 w-6" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-black tracking-tight sm:text-lg">{getActiveSkin().name}</span>
              <span className={ideas ? 'block truncate text-[10px] font-bold uppercase tracking-[.16em] text-slate-300' : 'block truncate text-[10px] font-black uppercase tracking-[.16em] text-amber-300'}>
                {ideas ? 'Parent & Student System' : 'Learning starts here'}
              </span>
            </span>
          </button>
          <button
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10 md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="hidden shrink-0 text-right md:block">
            <p className="text-xs font-bold">{currentUser?.full_name || 'Welcome'}</p>
            <p className="text-[10px] capitalize text-white/60">{currentUser?.role || 'visitor'} portal</p>
          </div>
        </div>
      </div>

      <nav className="hidden border-t border-white/10 md:block" aria-label="Primary navigation">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6">
          {nav.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => go(id)} className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition ${activeModule === id ? (ideas ? 'border-[#f02434] bg-white/10 text-white' : 'border-[#f59e0b] bg-white/10 text-[#fcd34d]') : 'border-transparent text-white/65 hover:bg-white/10 hover:text-white'}`}>
              <Icon className="h-4 w-4" />{label}
            </button>
          ))}
        </div>
      </nav>

      {menuOpen && (
        <div className="absolute inset-x-0 top-full border-b border-white/10 bg-[#0c1f38] p-3 shadow-2xl md:hidden">
          <div className="grid grid-cols-2 gap-2">
            {nav.map(({ id, label, Icon }) => (
              <button key={id} onClick={() => go(id)} className={`flex min-h-12 items-center gap-2 rounded-xl px-3 text-left text-xs font-bold ${activeModule === id ? 'bg-white text-slate-900' : 'bg-white/10 text-white'}`}>
                <Icon className="h-4 w-4" />{label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

const ReferencePortal: React.FC<Pick<Props, 'setActiveModule' | 'style'>> = ({ setActiveModule, style }) => {
  const { currentUser } = useSchoolData();
  const ideas = style === 'ideas';
  const brand = BRANDS[style];
  const actions = allowedItems(currentUser?.role).filter((item) => item.id !== 'portal');
  const featured = ideas ? 'Everything your family needs, in one simple school space.' : 'A bright, friendly dashboard for your school day.';

  return (
    <div className="space-y-4 sm:space-y-6">
      <section
        className={`overflow-hidden p-5 shadow-xl sm:p-8 ${ideas ? 'rounded-3xl text-white' : 'rounded-[2rem] text-[#1e293b] ring-1 ring-amber-200'}`}
        style={{ backgroundColor: ideas ? '#0c1f38' : '#fef3c7' }}
      >
        <div className="max-w-2xl">
          <span className={ideas ? 'inline-flex items-center gap-1.5 rounded-full bg-[#f02434] px-3 py-1 text-[10px] font-black uppercase tracking-[.16em]' : 'inline-flex -rotate-1 items-center gap-1.5 rounded-md bg-[#b91c1c] px-3 py-1 text-[10px] font-black uppercase tracking-[.16em] text-white'}>
            <Sparkles className="h-3.5 w-3.5" /> Digital school life
          </span>
          <h1 className="mt-4 text-2xl font-black leading-tight sm:text-4xl">Hello, {currentUser?.full_name?.split(' ')[0] || 'there'}!</h1>
          <p className={ideas ? 'mt-2 text-sm leading-relaxed text-slate-300 sm:text-base' : 'mt-2 text-sm leading-relaxed text-slate-700 sm:text-base'}>{featured}</p>
          <p className={ideas ? 'mt-4 text-xs font-bold text-slate-400' : 'mt-4 text-xs font-bold text-slate-600'}>{getActiveSkin().name} · {brand.tagline}</p>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-[var(--t-primary)]">Your dashboard</p><h2 className="text-lg font-black text-[var(--t-ink)]">School services</h2></div>
          <span className="text-xs font-semibold text-slate-500">Tap to open</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {actions.map(({ id, label, short, Icon }, index) => (
            <button key={id} onClick={() => setActiveModule(id)} className={ideas ? 'group min-h-36 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-200 transition active:scale-[.98] sm:hover:-translate-y-1 sm:hover:shadow-lg' : 'group min-h-36 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-amber-100 transition active:scale-[.98] sm:hover:-translate-y-1 sm:hover:shadow-lg'}>
              <span className={ideas ? `grid h-10 w-10 place-items-center rounded-xl text-white ${index % 2 ? 'bg-[#17355c]' : 'bg-[#d91424]'}` : `grid h-10 w-10 place-items-center rounded-xl ${index % 2 ? 'bg-[#fef3c7] text-[#b91c1c]' : 'bg-[#1e293b] text-[#f59e0b]'}`}><Icon className="h-5 w-5" /></span>
              <span className="mt-4 block text-sm font-black text-slate-900">{label}</span>
              <span className="mt-1 block text-xs text-slate-500">Open {short.toLowerCase()}</span>
              <ChevronRight className="mt-2 h-4 w-4 text-[var(--t-primary)] transition group-hover:translate-x-1" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export const IdeasHeader: React.FC<Pick<Props, 'activeModule' | 'setActiveModule'>> = (props) => <ReferenceHeader {...props} style="ideas" />;
export const IdeasPortal: React.FC<Pick<Props, 'setActiveModule'>> = (props) => <ReferencePortal {...props} style="ideas" />;
export const LeadingHeader: React.FC<Pick<Props, 'activeModule' | 'setActiveModule'>> = (props) => <ReferenceHeader {...props} style="leading" />;
export const LeadingPortal: React.FC<Pick<Props, 'setActiveModule'>> = (props) => <ReferencePortal {...props} style="leading" />;
