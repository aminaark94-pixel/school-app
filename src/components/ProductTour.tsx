import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CircleHelp, Compass } from 'lucide-react';
import { createPortal } from 'react-dom';
import type { AppModule } from './Navbar';
import { stepsFor, type TourLanguage, type TourRole, type TourStep } from '../lib/tourContent';

interface Props {
  role?: TourRole;
  activeModule?: AppModule;
  setActiveModule: (module: AppModule) => void;
}

export function PageTourButton({ onClick }: { onClick: () => void }) {
  return <button type="button" onClick={onClick} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold"><CircleHelp size={16} /> Page help</button>;
}

function visibleTarget(name: string) {
  return [...document.querySelectorAll<HTMLElement>(`[data-tour="${name}"]`)].find((element) => {
    const { width, height } = element.getBoundingClientRect();
    return width > 0 && height > 0 && element.checkVisibility?.({ visibilityProperty: true }) !== false;
  });
}

function panelPosition(rect: DOMRect, width: number, height: number) {
  const gap = 14;
  const clamp = (value: number, limit: number) => Math.max(gap, Math.min(value, limit - gap));
  const x = clamp(rect.left, window.innerWidth - width);
  if (rect.bottom + gap + height <= window.innerHeight - gap) return { left: x, top: rect.bottom + gap };
  if (rect.top - height - gap >= gap) return { left: x, top: rect.top - height - gap };
  const y = clamp(rect.top, window.innerHeight - height);
  if (rect.right + gap + width <= window.innerWidth - gap) return { left: rect.right + gap, top: y };
  if (rect.left - gap - width >= gap) return { left: rect.left - gap - width, top: y };
  const visibleTop = Math.max(gap, rect.top);
  const visibleBottom = Math.min(window.innerHeight - gap, rect.bottom);
  return {
    left: x,
    top: visibleTop > window.innerHeight - visibleBottom ? gap : window.innerHeight - height - gap,
  };
}

export function ProductTour({ role = 'parent', activeModule, setActiveModule }: Props) {
  const [language, setLanguage] = useState<TourLanguage>('ur');
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [index, setIndex] = useState(0);
  const [anchor, setAnchor] = useState<{ step: TourStep; rect: DOMRect; exact: boolean }>();
  const [position, setPosition] = useState({ left: 14, top: 14 });
  const panel = useRef<HTMLElement>(null);
  const launcher = useRef<HTMLElement | null>(null);
  const step = steps[index];
  const copy = step?.copy[language];
  const currentAnchor = anchor?.step === step ? anchor : undefined;

  const start = (pageOnly: boolean) => {
    const selected = stepsFor(role, pageOnly ? activeModule : undefined);
    if (!selected.length) return;
    launcher.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setAnchor(undefined);
    setIndex(0);
    setSteps(selected);
  };

  useEffect(() => {
    const handler = () => start(true);
    window.addEventListener('sms:start-page-tour', handler);
    return () => window.removeEventListener('sms:start-page-tour', handler);
  }, [activeModule, role]);

  const close = () => {
    setSteps([]);
    setAnchor(undefined);
    requestAnimationFrame(() => (launcher.current?.isConnected ? launcher.current : document.getElementById('guided-tour-launcher'))?.focus({ preventScroll: true }));
  };

  useEffect(() => {
    if (!step) return;
    if (step.module && step.module !== activeModule) {
      setActiveModule(step.module);
      return;
    }
    const began = performance.now();
    let previous: HTMLElement | undefined;
    const sync = () => {
      const exact = visibleTarget(step.target);
      const target = exact || (performance.now() - began >= 1000 ? visibleTarget('page-heading') : undefined);
      if (!target) {
        setAnchor(undefined);
        previous = undefined;
        return;
      }
      if (previous !== target) {
        previous = target;
        target.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
      }
      const rect = target.getBoundingClientRect();
      setAnchor((last) => last?.step === step && last.exact === Boolean(exact)
        && last.rect.x === rect.x && last.rect.y === rect.y && last.rect.width === rect.width && last.rect.height === rect.height
        ? last : { step, rect, exact: Boolean(exact) });
    };
    const timer = window.setInterval(sync, 100);
    window.addEventListener('scroll', sync, true);
    window.addEventListener('resize', sync);
    sync();
    return () => {
      clearInterval(timer);
      window.removeEventListener('scroll', sync, true);
      window.removeEventListener('resize', sync);
    };
  }, [step, activeModule, setActiveModule]);

  useLayoutEffect(() => {
    const element = panel.current;
    if (!element || !currentAnchor) return;
    const place = () => setPosition(panelPosition(currentAnchor.rect, element.offsetWidth, element.offsetHeight));
    const observer = new ResizeObserver(place);
    observer.observe(element);
    place();
    return () => observer.disconnect();
  }, [currentAnchor, language]);

  useEffect(() => { if (step) panel.current?.focus({ preventScroll: true }); }, [step]);

  return <>
    <button id="guided-tour-launcher" type="button" onClick={() => start(false)} className="fixed bottom-4 right-4 z-50 inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--t-primary)] px-4 py-2 text-sm font-bold text-white shadow-lg">
      <Compass size={17} /> Guided tour
    </button>
    {step && copy && createPortal(
      <div className="pointer-events-none fixed inset-0 z-[90]">
        {currentAnchor?.exact && <div aria-hidden="true" className="absolute rounded-lg ring-2 ring-white outline-2 outline-[var(--t-primary)]"
          style={{ left: currentAnchor.rect.left, top: currentAnchor.rect.top, width: currentAnchor.rect.width, height: currentAnchor.rect.height, boxShadow: '0 0 0 9999px rgb(15 23 42 / 38%)' }} />}
        <section ref={panel} tabIndex={-1} role="dialog" aria-labelledby="tour-step-title"
          onKeyDown={(event) => { if (event.key === 'Escape') close(); }}
          className="pointer-events-auto absolute max-h-[min(45dvh,26rem)] w-[min(calc(100%-28px),350px)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 text-slate-900 shadow-xl"
          style={currentAnchor ? position : { right: 14, bottom: 14 }}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-600">Step {index + 1} of {steps.length}</span>
            <button type="button" onClick={() => setLanguage(language === 'ur' ? 'en' : 'ur')} className="min-h-9 text-sm font-semibold underline">{language === 'ur' ? 'English' : 'Roman Urdu'}</button>
          </div>
          <div aria-live="polite">
            <h2 id="tour-step-title" className="text-lg font-bold">{copy.title}</h2>
            {currentAnchor?.exact ? <>
              <p className="mt-1 text-sm leading-relaxed">{copy.what}</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-700">{copy.how.map((line) => <li key={line}>{line}</li>)}</ol>
              {copy.tip && <p className="mt-2 text-sm text-slate-600">{copy.tip}</p>}
            </> : <p className="mt-1 text-sm text-slate-600">{currentAnchor ? 'This option is unavailable on this screen.' : 'Finding this option…'}</p>}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <button type="button" onClick={close} className="min-h-10 text-sm font-semibold underline">Skip tour</button>
            <div className="flex gap-2">
              <button type="button" onClick={() => setIndex(index - 1)} disabled={index === 0} className="min-h-10 rounded-lg border border-slate-200 px-3 text-sm font-semibold disabled:opacity-40">Back</button>
              <button type="button" onClick={() => index === steps.length - 1 ? close() : setIndex(index + 1)} className="min-h-10 rounded-lg bg-[var(--t-primary)] px-3 text-sm font-semibold text-white">{index === steps.length - 1 ? 'Finish' : 'Next'}</button>
            </div>
          </div>
        </section>
      </div>, document.body)}
  </>;
}

export const triggerPageTour = () => window.dispatchEvent(new Event('sms:start-page-tour'));
