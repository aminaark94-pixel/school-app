import React, { useState } from 'react';
import { RoleSwitcherBar } from './components/RoleSwitcherBar';
import { Navbar, AppModule } from './components/Navbar';
import { DribbbleAppShell } from './components/dribbble/DribbbleAppShell';
import { DiaryModule } from './components/diary/DiaryModule';
import { AttendanceModule } from './components/attendance/AttendanceModule';
import { ResultCardModule } from './components/results/ResultCardModule';
import { CommunicationModule } from './components/communication/CommunicationModule';
import { ExamsDatesheetModule } from './components/datesheets/ExamsDatesheetModule';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { OfflineIndicator } from './components/OfflineIndicator';
import { useSchoolData } from './hooks/useSchoolData';
import { useSkin } from './hooks/useSkin';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function App() {
  const { currentSchool, currentUser } = useSchoolData();
  const skin = useSkin();
  const [activeModule, setActiveModule] = useState<AppModule>('portal');

  // Each skin can supply its own header/nav and portal/home screen (lib/skins.ts);
  // falls back to the shared components when a skin doesn't provide one.
  const SkinHeader = skin.Header ?? Navbar;
  const SkinPortal = skin.Portal ?? DribbbleAppShell;

  // School administration is exclusively for the school's admin account.
  React.useEffect(() => {
    if (currentUser?.role !== 'admin' && activeModule === 'admin') {
      setActiveModule('portal');
    }
  }, [currentUser, activeModule]);

  return (
    <div
      className="min-h-dvh bg-[var(--t-bg)] text-[var(--t-ink)] flex flex-col app-bottom-clear"
      style={{ fontFamily: 'var(--t-font-sans, "Plus Jakarta Sans", sans-serif)' }}
    >
      {/* 1. Account / persona bar */}
      <RoleSwitcherBar />

      {/* 2. Header + navigation — each skin can supply its own; falls back to the shared Navbar */}
      <SkinHeader activeModule={activeModule} setActiveModule={setActiveModule} />

      {/* 3. Main workspace */}
      <main className={`skin-content skin-content-${skin.id} flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6`}>
        {/* Module title (sub-modules only). Compact on phones: no long blurb, no duplicate school pill. */}
        {activeModule !== 'portal' && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 pb-1 sm:pb-2">
            <div className="min-w-0">
              <button
                onClick={() => setActiveModule('portal')}
                className="inline-flex items-center gap-1 min-h-[44px] sm:min-h-0 -ml-1 pl-1 pr-3 text-xs font-bold text-[var(--t-primary)] hover:underline"
                style={{ fontFamily: 'var(--t-font-display, "Cinzel", serif)' }}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Campus Portal</span>
              </button>
              <h2
                className="text-lg sm:text-2xl font-bold tracking-tight text-[var(--t-ink)] italic leading-snug"
                style={{ fontFamily: 'var(--t-font-display, "Cormorant Garamond", serif)' }}
              >
                {activeModule === 'diary' && 'Digital Student Diary & Homework Feed'}
                {activeModule === 'attendance' && 'Attendance Register'}
                {activeModule === 'results' && 'Student Result Cards & Fee-Locked Transcript'}
                {activeModule === 'communication' && 'Digital Circulars & Parent-Teacher Chat'}
                {activeModule === 'datesheets' && 'Examinations Schedule & Syllabus'}
                {activeModule === 'admin' && 'School Administration & Data Import'}
              </h2>
              <p className="hidden sm:block text-sm text-[var(--t-ink)]/70 mt-1 font-medium">
                {activeModule === 'diary' &&
                  'Daily classwork & homework log with chalkboard photos, absent student catch-up, and verified parent read receipts.'}
                {activeModule === 'attendance' &&
                  'Record, review, and maintain daily class attendance for your school.'}
                {activeModule === 'results' &&
                  'Conditional exam card unlock with fee status verification. Download branded official PDFs with school seal.'}
                {activeModule === 'communication' &&
                  'Zero-paper digital circulars, holiday notices, and timed query desk to eliminate unregulated WhatsApp messaging.'}
                {activeModule === 'datesheets' &&
                  'Printable examination timetables, room assignments, and chapter-wise syllabus for grades.'}
                {activeModule === 'admin' &&
                  'Batch import student records from CSV, manage student lifecycles with soft-delete, and customize theme branding.'}
              </p>
            </div>

            {/* School pill: desktop only (the school name is already in the phone header) */}
            <div className="hidden sm:flex self-auto items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white border border-[var(--t-sand)] text-xs text-[var(--t-ink)] shadow-2xs">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: currentSchool?.primary_color || '#8B0000' }}
              />
              <span
                className="font-bold text-[var(--t-ink)]"
                style={{ fontFamily: 'var(--t-font-display, "Cinzel", serif)' }}
              >
                {skin.name}
              </span>
            </div>
          </div>
        )}

        {/* Parent role restricted warning */}
        {currentUser?.role !== 'admin' && activeModule === 'admin' && (
          <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-3 shadow-2xs">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-extrabold">Access Restricted by Role Level Security (RLS)</p>
              <p className="font-normal text-amber-800 mt-0.5">
                Administrative tools are available to teachers and school admins only. Parents can view their linked children's diary, attendance, fees, circulars, and report cards.
              </p>
            </div>
          </div>
        )}

        {/* Dynamic module rendering */}
        {activeModule === 'portal' && <SkinPortal setActiveModule={setActiveModule} />}
        {activeModule === 'diary' && <DiaryModule />}
        {activeModule === 'attendance' && <AttendanceModule />}
        {activeModule === 'results' && <ResultCardModule />}
        {activeModule === 'communication' && <CommunicationModule />}
        {activeModule === 'datesheets' && <ExamsDatesheetModule />}
        {/* Admin area intentionally keeps its own fixed Imperial look regardless of the
            published app skin — the owner asked for this to stay as-is. */}
        {activeModule === 'admin' && currentUser?.role === 'admin' && <AdminDashboard />}
      </main>

      {/* 4. Footer (short on phones) */}
      <footer className="mt-auto border-t border-[var(--t-sand)] bg-[var(--t-bg)] py-3 sm:py-4 px-4 sm:px-6 text-center text-xs text-[var(--t-ink)]/70">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span
            className="font-bold text-[var(--t-ink)]"
            style={{ fontFamily: 'var(--t-font-display, "Cinzel", serif)' }}
          >
            {skin.name} • School Management PWA
          </span>
          <span className="hidden sm:inline text-[11px] text-[var(--t-primary)] font-semibold">
            Digital Diary • Blackboard Photo Capture • Zero Paper Circulars • Fee-Locked Reports
          </span>
        </div>
      </footer>

      {/* 5. Offline connectivity indicator */}
      <OfflineIndicator />
    </div>
  );
}
