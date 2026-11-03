import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CircleHelp, Compass, Languages, X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { AppModule } from './Navbar';
import { stepsFor, type TourLanguage, type TourRole, type TourStep } from '../lib/tourContent';

const VERSION = 'coach-marks-v2';
const storageKey = (role: TourRole) => `sms_tour_${VERSION}_${role}`;
type Rect = { top: number; left: number; width: number; height: number };
interface Props { role: TourRole | undefined; activeModule?: AppModule; setActiveModule: (module: AppModule) => void }

export const PageTourButton: React.FC<{ onClick: () => void }> = ({ onClick }) => <button type="button" onClick={onClick} title="Is page ki madad" className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--t-sand)] bg-white px-3 py-2 text-xs font-bold text-[var(--t-primary)] shadow-sm hover:bg-[var(--t-bg)]"><CircleHelp className="h-4 w-4" /> Page help</button>;

export const ProductTour: React.FC<Props> = ({ role, activeModule, setActiveModule }) => {
  const safeRole: TourRole = role || 'parent';
  const [language, setLanguage] = useState<TourLanguage>('ur');
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [welcome, setWelcome] = useState(false);
  const [rect, setRect] = useState<Rect | null>(null);
  const missing = useRef<number | null>(null);
  const current = steps[index];
  const close = useCallback((never = false) => { localStorage.setItem(storageKey(safeRole), never ? 'dismissed' : String(index)); setOpen(false); setWelcome(false); }, [index, safeRole]);
  const start = useCallback((pageOnly = false) => {
    const available = stepsFor(safeRole, pageOnly ? activeModule : undefined); if (!available.length) return;
    const saved = Number(localStorage.getItem(storageKey(safeRole))); const at = pageOnly ? 0 : (Number.isFinite(saved) && saved >= 0 && saved < available.length ? saved : 0);
    setSteps(available); setIndex(at); setOpen(true); setWelcome(false);
  }, [activeModule, safeRole]);
  useEffect(() => { if (localStorage.getItem(storageKey(safeRole)) === null) setWelcome(true); }, [safeRole]);
  useEffect(() => { const handler = () => start(true); window.addEventListener('sms:start-page-tour', handler); return () => window.removeEventListener('sms:start-page-tour', handler); }, [start]);
  useEffect(() => { if (open && current?.module && current.module !== activeModule) setActiveModule(current.module); }, [activeModule, current, open, setActiveModule]);
  const position = useCallback(() => {
    if (!open || !current) return;
    const element = document.querySelector(`[data-tour="${current.target}"]`) as HTMLElement | null;
    if (!element) { if (missing.current !== index && index < steps.length - 1) { missing.current = index; setIndex((v) => v + 1); } return; }
    missing.current = null; element.scrollIntoView({ behavior: 'smooth', block: 'center' }); const box = element.getBoundingClientRect(); setRect({ top: box.top, left: box.left, width: box.width, height: box.height });
  }, [current, index, open, steps.length]);
  useEffect(() => { const timer = window.setTimeout(position, 250); window.addEventListener('resize', position); window.addEventListener('scroll', position, true); const keys = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); if (event.key === 'ArrowRight') setIndex((v) => Math.min(v + 1, steps.length - 1)); if (event.key === 'ArrowLeft') setIndex((v) => Math.max(v - 1, 0)); }; window.addEventListener('keydown', keys); return () => { clearTimeout(timer); window.removeEventListener('resize', position); window.removeEventListener('scroll', position, true); window.removeEventListener('keydown', keys); }; }, [close, position, steps.length]);
  const copy = current?.copy[language];
  const popover = rect && window.innerWidth >= 640 ? { top: Math.min(window.innerHeight - 325, Math.max(16, rect.top + rect.height + 14)), left: Math.min(window.innerWidth - 390, Math.max(16, rect.left)) } : undefined;
  const next = () => { if (index === steps.length - 1) { localStorage.setItem(storageKey(safeRole), 'done'); setOpen(false); } else setIndex((v) => v + 1); };
  return <>
    <button type="button" data-tour="guided-tour" onClick={() => start(false)} className="fixed right-4 z-50 inline-flex items-center gap-2 rounded-full bg-[var(--t-primary)] px-4 py-3 text-xs font-black text-white shadow-xl ring-2 ring-white/70 bottom-[calc(var(--bottom-nav-h)+1rem)] md:bottom-6"><Compass className="h-4 w-4" /> Guided tour</button>
    {welcome && <aside className="fixed bottom-[calc(var(--bottom-nav-h)+5rem)] right-4 z-[60] w-[calc(100%-2rem)] max-w-sm rounded-3xl border border-[var(--t-sand)] bg-white p-5 text-[var(--t-ink)] shadow-2xl md:bottom-20" role="dialog"><button onClick={() => close()} aria-label="Close" className="absolute right-3 top-3 p-1.5"><X className="h-4 w-4" /></button><p className="text-xs font-black uppercase tracking-wider text-[var(--t-primary)]">Khush aamdeed</p><h2 className="mt-1 text-xl font-black">App ka 1 minute ka tour?</h2><p className="mt-2 text-sm text-slate-600">Diary, attendance aur school updates use karna simple steps mein dekhein.</p><div className="mt-4 flex gap-2"><button onClick={() => start(false)} className="rounded-xl bg-[var(--t-primary)] px-4 py-2.5 text-sm font-bold text-white">Start</button><button onClick={() => close()} className="rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600">Baad mein</button></div><button onClick={() => close(true)} className="mt-3 text-xs font-semibold text-slate-500 underline">Dobara na dikhayein</button></aside>}
    {open && current && copy && <div className="pointer-events-none fixed inset-0 z-[70]" aria-live="polite">{rect && <div className="absolute rounded-2xl ring-4 ring-[var(--t-primary)] ring-offset-4 ring-offset-black/20" style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height, boxShadow: '0 0 0 9999px rgba(2,6,23,.58)' }} />}<section className="pointer-events-auto fixed inset-x-3 bottom-3 rounded-3xl bg-white p-5 text-slate-900 shadow-2xl sm:absolute sm:inset-x-auto sm:bottom-auto sm:w-[370px]" style={popover} role="dialog" aria-label={`Tour step ${index + 1}`}><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[var(--t-primary)]">Step {index + 1} / {steps.length}</p><h2 className="mt-1 text-lg font-black">{copy.title}</h2></div><div className="flex"><button onClick={() => setLanguage((v) => v === 'ur' ? 'en' : 'ur')} aria-label="Change language" className="p-2"><Languages className="h-4 w-4" /></button><button onClick={() => close()} aria-label="Close tour" className="p-2"><X className="h-4 w-4" /></button></div></div><p className="mt-3 text-sm leading-6 text-slate-600"><strong>Ye kya hai:</strong> {copy.what}</p><p className="mt-3 text-xs font-black">Kaise use karein:</p><ol className="mt-1 list-decimal space-y-1 pl-5 text-sm leading-5 text-slate-600">{copy.how.map((line) => <li key={line}>{line}</li>)}</ol>{copy.tip && <p className="mt-3 rounded-xl bg-amber-50 p-2.5 text-xs text-amber-950"><strong>Dhyan rakhein:</strong> {copy.tip}</p>}<div className="mt-4 flex items-center justify-between"><button onClick={() => close(true)} className="text-xs font-bold text-slate-500 underline">Skip</button><div className="flex gap-2"><button onClick={() => setIndex((v) => Math.max(0, v - 1))} disabled={index === 0} className="inline-flex items-center gap-1 px-2 py-2 text-sm font-bold disabled:opacity-40"><ChevronLeft className="h-4 w-4" /> Back</button><button onClick={next} className="inline-flex items-center gap-1 rounded-xl bg-[var(--t-primary)] px-3 py-2 text-sm font-bold text-white">{index === steps.length - 1 ? 'Finish' : 'Next'} <ChevronRight className="h-4 w-4" /></button></div></div></section></div>}
  </>;
};

export const triggerPageTour = () => window.dispatchEvent(new Event('sms:start-page-tour'));
