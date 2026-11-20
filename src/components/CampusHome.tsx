import { BookOpen, CalendarCheck, CalendarDays, ClipboardList, GraduationCap, MessageCircle, Settings, Users } from 'lucide-react';
import type { AppModule } from './Navbar';
import type { UserRole } from '../types';

export const diarySubjects = [
  'Mathematics', 'English Literature', 'Urdu', 'Physics', 'Chemistry',
  'Biology', 'Computer Science', 'Islamiat', 'Social Studies',
];

export const pageNames: Record<AppModule, string> = {
  portal: 'Home', diary: 'Homework', attendance: 'Attendance', results: 'Report cards',
  progress: 'Student progress', 'teacher-progress': 'Teacher reviews',
  'parents-report': 'Parent follow-up', communication: 'Messages',
  datesheets: 'Exam schedule', updates: 'App updates', admin: 'School settings',
};

const primary = ['portal', 'diary', 'attendance', 'results'] as const;
const services: { id: AppModule; icon: typeof BookOpen; description: string; roles?: UserRole[] }[] = [
  { id: 'attendance', icon: CalendarCheck, description: 'Check daily attendance' },
  { id: 'results', icon: GraduationCap, description: 'View exam marks and report cards' },
  { id: 'communication', icon: MessageCircle, description: 'Read notices or contact the school' },
  { id: 'datesheets', icon: CalendarDays, description: 'Find exam dates and times' },
  { id: 'progress', icon: ClipboardList, description: 'Review monthly student progress' },
  { id: 'parents-report', icon: Users, description: 'Review parent follow-ups', roles: ['teacher', 'admin'] },
  { id: 'teacher-progress', icon: ClipboardList, description: 'Record teacher reviews', roles: ['admin'] },
  { id: 'admin', icon: Settings, description: 'Manage students and school details', roles: ['admin'] },
];

interface NavigationProps {
  role?: UserRole;
  onNavigate: (module: AppModule) => void;
}

export function CampusNavigation({ role, activeModule, onNavigate }: NavigationProps & { activeModule: AppModule }) {
  const otherPages = services.filter(({ id, roles }) => id !== 'attendance' && id !== 'results' && (!roles || (role && roles.includes(role))));
  return (
    <nav data-tour="primary-navigation" aria-label="School pages" className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 pb-3 sm:px-6">
      {primary.map((id) => (
        <button key={id} type="button" aria-current={id === activeModule ? 'page' : undefined}
          onClick={() => onNavigate(id)}
          className={`min-h-11 rounded-lg px-2.5 text-sm font-semibold sm:px-4 ${id === activeModule ? 'bg-[var(--t-primary)] text-white' : 'text-slate-700 hover:bg-slate-100'}`}>
          {pageNames[id]}
        </button>
      ))}
      <label className="sr-only" htmlFor="other-school-pages">More pages</label>
      <select id="other-school-pages" className="min-h-11 max-w-full rounded-lg border border-slate-200 bg-white px-2 text-sm font-semibold"
        value={primary.some((id) => id === activeModule) ? '' : activeModule}
        onChange={(e) => { if (e.target.value) onNavigate(e.target.value as AppModule); }}>
        <option value="">More pages</option>
        {otherPages.map(({ id }) => <option key={id} value={id}>{pageNames[id]}</option>)}
        <option value="updates">{pageNames.updates}</option>
      </select>
    </nav>
  );
}

export function CampusHome({ role, onNavigate, onSubject }: NavigationProps & { onSubject: (subject: string) => void }) {
  return (
    <>
      <section aria-labelledby="subjects" className="rounded-2xl border border-slate-300 bg-white p-4 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 id="subjects" data-tour="page-heading" className="text-3xl font-bold">Subjects</h1>
            <p className="mt-1 text-base text-slate-600">Choose a subject to see classwork and homework.</p>
          </div>
          <button type="button" onClick={() => onNavigate('diary')} className="min-h-11 rounded-lg border border-slate-200 px-4 text-sm font-semibold hover:bg-slate-50">All homework</button>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {diarySubjects.map((subject, index) => (
            <button key={subject} type="button" data-tour={index === 0 ? 'subject-card' : undefined}
              onClick={() => onSubject(subject)}
              className="flex min-h-14 items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-left text-base font-semibold hover:border-[var(--t-primary)] hover:bg-white">
              <BookOpen aria-hidden="true" className="size-4 shrink-0 text-[var(--t-primary)]" />
              {subject}
            </button>
          ))}
        </div>
      </section>
      <section aria-labelledby="school-services">
        <h2 id="school-services" className="mb-3 text-2xl font-bold">School tools</h2>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {services.filter(({ roles }) => !roles || (role && roles.includes(role))).map(({ id, icon: Icon, description }) => (
            <button key={id} type="button" onClick={() => onNavigate(id)}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-[var(--t-primary)]">
              <Icon aria-hidden="true" className="size-5 shrink-0 text-[var(--t-primary)]" />
              <span><span className="block font-semibold">{pageNames[id]}</span><span className="block text-sm text-slate-600">{description}</span></span>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
