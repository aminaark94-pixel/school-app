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
import { GraduationCap, ShieldAlert, Sparkles, Smartphone, ArrowLeft } from 'lucide-react';

export default function App() {
  const { currentSchool, currentUser } = useSchoolData();
  const [activeModule, setActiveModule] = useState<AppModule>('portal');

  // If user switches to Parent role, ensure they are directed away from admin
  React.useEffect(() => {
    if (currentUser?.role === 'parent' && activeModule === 'admin') {
      setActiveModule('portal');
    }
  }, [currentUser, activeModule]);

  return (
    <div className="min-h-screen bg-[#FAF8F2] text-[#200E01] flex flex-col pb-16 md:pb-8 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. Quick Persona & Multi-Tenant Switcher Bar */}
      <RoleSwitcherBar />

      {/* 2. Main Navigation Header with Dynamic School Branding & PWA Install Button */}
      <Navbar activeModule={activeModule} setActiveModule={setActiveModule} />

      {/* 3. Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 space-y-6">
        {/* Module Header Title & Context Banner (Only for sub-modules) */}
        {activeModule !== 'portal' && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <button
                  onClick={() => setActiveModule('portal')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#8B0000] hover:underline font-['Cinzel',serif]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Student App UI</span>
                </button>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#200E01] flex items-center gap-2.5 font-['Cormorant_Garamond',serif] italic">
                {activeModule === 'diary' && 'Digital Student Diary & Homework Feed'}
                {activeModule === 'attendance' && 'One-Click Attendance System'}
                {activeModule === 'results' && 'Student Result Cards & Fee-Locked Transcript'}
                {activeModule === 'communication' && 'Digital Circulars & Parent-Teacher Chat'}
                {activeModule === 'datesheets' && 'Examinations Schedule & Syllabus'}
                {activeModule === 'admin' && 'School Administration & Data Import'}
              </h2>
              <p className="text-xs sm:text-sm text-[#5B0202]/80 mt-1 font-medium">
                {activeModule === 'diary' &&
                  'Daily classwork & homework log with chalkboard photos, absent student catch-up, and verified parent read receipts.'}
                {activeModule === 'attendance' &&
                  'Take daily attendance with single-tap toggle switches. Automated alerts dispatched to parents upon absence.'}
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

            {/* Quick Info Pill */}
            <div className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white border border-[#EDE7C7] text-xs text-[#200E01] shadow-2xs">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: currentSchool?.primary_color || '#8B0000' }}
              />
              <span className="font-bold text-[#200E01] font-['Cinzel',serif]">{currentSchool?.name}</span>
            </div>
          </div>
        )}

        {/* Parent Role Restricted Warning if attempting Admin */}
        {currentUser?.role === 'parent' && activeModule === 'admin' && (
          <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-3 shadow-2xs">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-extrabold">Access Restricted by Role Level Security (RLS)</p>
              <p className="font-normal text-amber-800 mt-0.5">
                Parents are only authorized to view their linked children's diary, attendance, fees, circulars, and report cards. Switch to Teacher or Admin in the top bar to inspect administrative tools.
              </p>
            </div>
          </div>
        )}

        {/* Dynamic Module Rendering */}
        {activeModule === 'portal' && <DribbbleAppShell />}
        {activeModule === 'diary' && <DiaryModule />}
        {activeModule === 'attendance' && <AttendanceModule />}
        {activeModule === 'results' && <ResultCardModule />}
        {activeModule === 'communication' && <CommunicationModule />}
        {activeModule === 'datesheets' && <ExamsDatesheetModule />}
        {activeModule === 'admin' && currentUser?.role !== 'parent' && <AdminDashboard />}
      </main>

      {/* 4. Footer */}
      <footer className="mt-auto border-t border-[#EDE7C7] bg-[#FAF8F2] py-4 px-4 sm:px-6 text-center text-xs text-[#5B0202]/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-bold text-[#200E01] font-['Cinzel',serif]">
            {currentSchool?.name} • Multi-Tenant School Management PWA
          </span>
          <span className="text-[11px] text-[#8B0000] font-semibold">
            Digital Diary • Blackboard Photo Capture • Zero Paper Circulars • Fee-Locked Reports
          </span>
        </div>
      </footer>


      {/* 5. Offline Connectivity Indicator */}
      <OfflineIndicator />
    </div>
  );
}

