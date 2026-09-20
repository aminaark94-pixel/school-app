import React, { useEffect, useState } from 'react';
import { Wifi, Battery, Signal, Smartphone, Monitor, ArrowLeft, Layers } from 'lucide-react';
import { DribbbleScreen, DribbbleBottomNav } from './DribbbleBottomNav';
import { DribbbleHomeView } from './DribbbleHomeView';
import { DribbbleScheduledView } from './DribbbleScheduledView';
import { DribbbleCalendarView } from './DribbbleCalendarView';
import { DribbbleStudentReportView } from './DribbbleStudentReportView';
import { DribbbleClassesView } from './DribbbleClassesView';
import { DribbbleChatView } from './DribbbleChatView';

// Existing functional modules
import { DiaryModule } from '../diary/DiaryModule';
import { AttendanceModule } from '../attendance/AttendanceModule';

export const DribbbleAppShell: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<DribbbleScreen>('home');
  // Desktop-only preview switch. On real phones the app is always full width.
  const [viewMode, setViewMode] = useState<'mobile' | 'responsive'>('responsive');

  // "Send Homework" on the home screen: open the diary and pop the compose form open straight away.
  const [pendingCompose, setPendingCompose] = useState(false);

  const handleSendHomework = () => {
    setPendingCompose(true);
    setCurrentScreen('diary');
  };

  useEffect(() => {
    if (currentScreen !== 'diary' || !pendingCompose) return;
    const timer = window.setTimeout(() => {
      // The diary's own "Post Diary" button (only present for teachers / admins).
      (document.getElementById('btn-new-diary-entry') as HTMLButtonElement | null)?.click();
      setPendingCompose(false);
    }, 120);
    return () => window.clearTimeout(timer);
  }, [currentScreen, pendingCompose]);

  const chips = [
    { id: 'home', label: '🏛️ Campus Home' },
    { id: 'scheduled', label: '⏰ Timetable' },
    { id: 'calendar', label: '📅 Calender & Events' },
    { id: 'report', label: '📊 Student Report' },
    { id: 'classes', label: '👥 Class Roster' },
    { id: 'chat', label: '💬 Faculty Messages' },
    { id: 'diary', label: '📸 Blackboard Diary' },
    { id: 'attendance', label: '✅ Attendance' },
  ] as const;

  return (
    <div className="flex flex-col items-center w-full min-h-[calc(100dvh-110px)] pb-20 px-0 sm:px-4">
      {/* Top controls: scrollable screen chips (+ desktop-only frame toggle) */}
      <div className="w-full max-w-7xl px-3 sm:px-4 py-2 sm:py-2.5 mb-3 sm:mb-4 flex items-center justify-between gap-3 bg-[#200E01] text-[#EDE7C7] rounded-2xl border border-[#5B0202] shadow-md">
        <div className="flex flex-1 min-w-0 items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <span className="hidden lg:flex shrink-0 text-[11px] font-black uppercase tracking-wider text-[#D4AF37] mr-1 items-center gap-1 font-['Cinzel',serif]">
            <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Campus Views:</span>
          </span>

          {chips.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentScreen(item.id as DribbbleScreen)}
              className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-bold transition whitespace-nowrap active:scale-95 ${
                currentScreen === item.id
                  ? 'bg-[#8B0000] text-[#EDE7C7] border border-[#D4AF37] shadow-sm font-black ring-1 ring-[#D4AF37]/50'
                  : 'bg-[#2D1605] text-[#EDE7C7]/80 hover:text-[#EDE7C7] hover:bg-[#3D1E07] border border-[#5B0202]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Device frame toggle: desktop preview only */}
        <div className="hidden md:flex shrink-0 items-center gap-1 bg-[#2D1605] p-1 rounded-2xl border border-[#5B0202]">
          <button
            onClick={() => setViewMode('responsive')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              viewMode === 'responsive'
                ? 'bg-[#8B0000] text-[#EDE7C7] border border-[#D4AF37]/60 shadow-sm font-extrabold'
                : 'text-[#EDE7C7]/70 hover:text-[#EDE7C7]'
            }`}
            title="Full-Screen Premium School View"
          >
            <Monitor className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Full-Width UI</span>
          </button>

          <button
            onClick={() => setViewMode('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              viewMode === 'mobile'
                ? 'bg-[#8B0000] text-[#EDE7C7] border border-[#D4AF37]/60 shadow-sm font-extrabold'
                : 'text-[#EDE7C7]/70 hover:text-[#EDE7C7]'
            }`}
            title="View in mobile smartphone frame"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Phone Frame</span>
          </button>
        </div>
      </div>

      {/* App container. The phone-frame look only applies from md up; real phones always get full width. */}
      <div
        className={`w-full transition-all duration-300 bg-[#FAF8F2] overflow-hidden relative ${
          viewMode === 'mobile'
            ? 'max-w-7xl rounded-2xl border border-[#EDE7C7] shadow-xl md:max-w-[430px] md:rounded-[48px] md:border-[8px] md:border-[#200E01] md:shadow-[0_25px_70px_rgba(32,14,1,0.35)] md:ring-2 md:ring-[#D4AF37]/40'
            : 'max-w-7xl rounded-2xl md:rounded-3xl shadow-xl border border-[#EDE7C7]'
        }`}
      >
        {/* Fake status bar (9:30, WiFi, Battery): desktop preview only. A real phone has its own. */}
        <div className="hidden md:flex bg-[#8B0000] text-[#EDE7C7] pt-2.5 px-7 pb-1 items-center justify-between text-xs font-bold select-none border-b border-[#5B0202]">
          <span className="tracking-tight text-[11px] font-black font-['Outfit',sans-serif]">9:30 AM</span>

          {viewMode === 'mobile' && (
            <div className="w-16 h-3.5 bg-black/40 rounded-full flex items-center justify-center">
              <div className="w-8 h-1 bg-[#D4AF37]/40 rounded-full" />
            </div>
          )}

          <div className="flex items-center gap-1.5 text-[#EDE7C7]">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>
        </div>

        {/* Dynamic screen view */}
        <div className="relative">
          {currentScreen === 'home' && (
            <DribbbleHomeView
              onNavigate={(screen) => setCurrentScreen(screen)}
              onOpenQuickCamera={() => setCurrentScreen('diary')}
              onSendHomework={handleSendHomework}
            />
          )}

          {currentScreen === 'scheduled' && (
            <DribbbleScheduledView onBack={() => setCurrentScreen('home')} />
          )}

          {currentScreen === 'calendar' && (
            <DribbbleCalendarView onBack={() => setCurrentScreen('home')} />
          )}

          {currentScreen === 'report' && (
            <DribbbleStudentReportView onBack={() => setCurrentScreen('home')} />
          )}

          {currentScreen === 'classes' && (
            <DribbbleClassesView
              onBack={() => setCurrentScreen('home')}
              onSelectStudent={() => setCurrentScreen('report')}
            />
          )}

          {currentScreen === 'chat' && (
            <DribbbleChatView onBack={() => setCurrentScreen('home')} />
          )}

          {/* Full functional modules with a back bar */}
          {currentScreen === 'diary' && (
            <div className="p-3 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <button
                  onClick={() => setCurrentScreen('home')}
                  className="flex items-center gap-1.5 min-h-[44px] pr-3 text-xs font-extrabold text-[#8B0000] hover:text-[#700000]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Home</span>
                </button>
                <h3 className="text-base font-black text-slate-900 font-['Outfit',sans-serif]">
                  Digital Blackboard Diary
                </h3>
              </div>
              <DiaryModule />
            </div>
          )}

          {currentScreen === 'attendance' && (
            <div className="p-3 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <button
                  onClick={() => setCurrentScreen('home')}
                  className="flex items-center gap-1.5 min-h-[44px] pr-3 text-xs font-extrabold text-[#8B0000] hover:text-[#700000]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Home</span>
                </button>
                <h3 className="text-base font-black text-slate-900 font-['Outfit',sans-serif]">
                  One-Click Attendance
                </h3>
              </div>
              <AttendanceModule />
            </div>
          )}
        </div>

        {/* Floating bottom dock (sits above the phone tab bar) */}
        <DribbbleBottomNav
          currentScreen={currentScreen}
          onSelect={(screen) => setCurrentScreen(screen)}
        />
      </div>
    </div>
  );
};
