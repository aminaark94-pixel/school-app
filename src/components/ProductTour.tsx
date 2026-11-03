import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Compass, GraduationCap, Sparkles, X } from 'lucide-react';
import type { AppModule } from './Navbar';

type Role = 'admin' | 'teacher' | 'parent' | 'owner' | undefined;

interface TourStep {
  module: AppModule;
  eyebrow: string;
  title: string;
  description: string;
  action: string;
}

interface ProductTourProps {
  role: Role;
  setActiveModule: (module: AppModule) => void;
}

const sharedSteps: TourStep[] = [
  {
    module: 'portal',
    eyebrow: 'Start here',
    title: 'Your Campus Portal',
    description: 'This is your home screen. Use the cards here, or the navigation bar, to move between school services.',
    action: 'Open a card to get to a service quickly.',
  },
  {
    module: 'diary',
    eyebrow: 'Daily learning',
    title: 'Check the Digital Diary',
    description: 'Find classwork, homework, notices and shared attachments. Choose the relevant class and section before adding or reviewing an entry.',
    action: 'Start with today’s diary entry and use the class filter.',
  },
  {
    module: 'attendance',
    eyebrow: 'Every school day',
    title: 'Record attendance',
    description: 'Select the class, date and student status. Save once you have reviewed the register so attendance stays accurate.',
    action: 'Mark each learner Present, Absent or Late, then save.',
  },
  {
    module: 'results',
    eyebrow: 'Assessments',
    title: 'Review result cards',
    description: 'Use this area to review student results and fee status before sharing an official result card.',
    action: 'Choose the student first, then review marks and fee status.',
  },
  {
    module: 'communication',
    eyebrow: 'Stay connected',
    title: 'Keep communication in one place',
    description: 'Use tickets, notices and replies for parent-teacher communication. Keep messages clear so the whole team can follow up.',
    action: 'Open an existing ticket or create a notice when action is needed.',
  },
  {
    module: 'datesheets',
    eyebrow: 'Plan ahead',
    title: 'Publish exams and schedules',
    description: 'Datesheets keep students and families aware of examination dates, rooms and syllabus information.',
    action: 'Review the upcoming schedule before sharing it.',
  },
];

const roleSteps: Record<Exclude<Role, undefined>, TourStep[]> = {
  admin: [
    {
      module: 'admin',
      eyebrow: 'Administration',
      title: 'Set up your school safely',
      description: 'Use Admin for student roster management, imports, branding and demonstration data. Work with the correct school records before making bulk changes.',
      action: 'Check the roster first; import or seed demo data only for a new, empty school.',
    },
    {
      module: 'teacher-progress',
      eyebrow: 'Leadership',
      title: 'Record teacher performance',
      description: 'Add the faculty member’s name and complete the confidential assessment with your own observations.',
      action: 'Enter the teacher name manually and write an independent verdict.',
    },
  ],
  teacher: [
    {
      module: 'progress',
      eyebrow: 'Student development',
      title: 'Update kids’ progress',
      description: 'Record each student’s monthly learning and character progress so families receive useful, timely feedback.',
      action: 'Select a student and complete the monthly assessment.',
    },
    {
      module: 'parents-report',
      eyebrow: 'Follow-up',
      title: 'Use parent engagement insights',
      description: 'Review parent activity and flag students who may need additional classroom attention.',
      action: 'Review the report before planning a parent follow-up.',
    },
  ],
  parent: [
    {
      module: 'progress',
      eyebrow: 'Your child',
      title: 'Follow monthly progress',
      description: 'See the school’s monthly learning and character feedback for your linked child.',
      action: 'Review the newest assessment and discuss it with your child.',
    },
  ],
  owner: [],
};

export const ProductTour: React.FC<ProductTourProps> = ({ role, setActiveModule }) => {
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const steps = useMemo(() => (role === 'owner' ? [] : [...sharedSteps, ...(roleSteps[role || 'parent'] || [])]), [role]);

  const close = () => {
    setOpen(false);
    setStepIndex(0);
  };

  const start = () => {
    setStepIndex(0);
    setOpen(true);
    setActiveModule('portal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!open || steps.length === 0) return;
    const step = steps[stepIndex];
    setActiveModule(step.module);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [open, stepIndex, steps, setActiveModule]);

  // Owner Studio uses a separate workspace, so it gets a useful short message
  // instead of routes that are unavailable to the platform owner.
  if (role === 'owner') {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-4 z-50 inline-flex items-center gap-2 rounded-full bg-[var(--t-primary,#8B0000)] px-4 py-3 text-xs font-black text-white shadow-xl ring-2 ring-white/70 transition hover:-translate-y-0.5 bottom-[calc(var(--bottom-nav-h)+1rem)] md:bottom-6"
      >
        <Compass className="h-4 w-4" /> Guided tour
        {open && (
          <span className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/70 p-4" role="dialog" aria-modal="true" aria-label="Platform owner guide">
            <span className="w-full max-w-md rounded-3xl bg-white p-6 text-left text-slate-900 shadow-2xl" onClick={(event) => event.stopPropagation()}>
              <span className="flex items-start justify-between gap-4"><span><span className="text-xs font-black uppercase tracking-[.16em] text-[var(--t-primary,#8B0000)]">Owner guide</span><span className="mt-2 block text-xl font-black">Manage each school from Owner Studio</span></span><button onClick={close} aria-label="Close guided tour" className="rounded-xl p-2 hover:bg-slate-100"><X className="h-5 w-5" /></button></span>
              <span className="mt-4 block text-sm leading-relaxed text-slate-600">Create or open a school, configure its branding and skin, then verify its Supabase connection before inviting the school team. Each school’s records must remain scoped to that school.</span>
              <button onClick={close} className="mt-6 rounded-xl bg-[var(--t-primary,#8B0000)] px-4 py-2.5 text-sm font-bold text-white">Got it</button>
            </span>
          </span>
        )}
      </button>
    );
  }

  const step = steps[stepIndex];
  return (
    <>
      <button
        type="button"
        onClick={start}
        title="Start guided tour"
        className="fixed right-4 z-50 inline-flex items-center gap-2 rounded-full bg-[var(--t-primary)] px-4 py-3 text-xs font-black text-white shadow-xl ring-2 ring-white/70 transition hover:-translate-y-0.5 bottom-[calc(var(--bottom-nav-h)+1rem)] md:bottom-6"
      >
        <Compass className="h-4 w-4" /> Guided tour
      </button>

      {open && step && (
        <div className="fixed inset-0 z-[70] bg-slate-950/70 p-4 sm:p-6" role="dialog" aria-modal="true" aria-label={`Guided tour, step ${stepIndex + 1} of ${steps.length}`}>
          <div className="mx-auto flex min-h-full max-w-2xl items-center justify-center">
            <section className="w-full overflow-hidden rounded-[2rem] bg-white text-slate-900 shadow-2xl ring-1 ring-white/30">
              <div className="h-2 bg-[var(--t-primary)]" />
              <div className="p-5 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--t-primary)] text-white"><GraduationCap className="h-5 w-5" /></span><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-[var(--t-primary)]">{step.eyebrow}</p><p className="text-xs font-bold text-slate-400">Step {stepIndex + 1} of {steps.length}</p></div></div>
                  <button type="button" onClick={close} aria-label="Close guided tour" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
                </div>
                <h2 className="mt-6 text-2xl font-black tracking-tight sm:text-3xl">{step.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{step.description}</p>
                <div className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-950"><Sparkles className="h-5 w-5 shrink-0 text-amber-600" /><span><strong>Try this now:</strong> {step.action}</span></div>
                <div className="mt-7 flex items-center justify-between gap-3"><button type="button" onClick={() => setStepIndex((index) => Math.max(0, index - 1))} disabled={stepIndex === 0} className="inline-flex items-center gap-1 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"><ArrowLeft className="h-4 w-4" /> Back</button>{stepIndex === steps.length - 1 ? <button type="button" onClick={close} className="rounded-xl bg-[var(--t-primary)] px-5 py-2.5 text-sm font-black text-white">Finish tour</button> : <button type="button" onClick={() => setStepIndex((index) => index + 1)} className="inline-flex items-center gap-1 rounded-xl bg-[var(--t-primary)] px-5 py-2.5 text-sm font-black text-white">Next <ArrowRight className="h-4 w-4" /></button>}</div>
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
};
