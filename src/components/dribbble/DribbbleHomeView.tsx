import React, { useState } from 'react';
import {
  Menu,
  Search,
  ChevronRight,
  Sparkles,
  Camera,
  BookOpen,
  CalendarCheck2,
  FileText,
  Clock,
  ArrowRight,
  Building2,
  Award,
  CheckCircle2,
  MapPin,
  GraduationCap,
  Microscope,
} from 'lucide-react';
import {
  PhysicsIllustration,
  ScheduledIllustration,
  CalendarIllustration,
  AttendanceIllustration,
  ReportIllustration,
} from './IllustrationAssets';
import { DribbbleScreen } from './DribbbleBottomNav';
import { useSchoolData } from '../../hooks/useSchoolData';
import { HomeworkHero } from '../home/HomeworkHero';

interface DribbbleHomeViewProps {
  onNavigate: (screen: DribbbleScreen) => void;
  onOpenQuickCamera?: () => void;
  /** Opens the diary and straight away opens the "send homework / classwork" form. */
  onSendHomework?: () => void;
}

export const DribbbleHomeView: React.FC<DribbbleHomeViewProps> = ({
  onNavigate,
  onOpenQuickCamera,
  onSendHomework,
}) => {
  const { currentSchool, currentUser, students } = useSchoolData();
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  // Student display localized for Pakistan's premier grammar academy
  const student = students.find((s) => s.id === 'student-1') || {
    name: 'Muhammad Hamza',
    class_id: 'Class 10 (O-Levels)',
    section: 'A',
    roll_number: 'AIC-101',
  };

  return (
    <div className="min-h-[85vh] pb-28 bg-[#FAF8F2] text-[#200E01]">
      {/* 1. Curved Golden Luxe Imperial Header */}
      <div className="bg-gradient-to-br from-[#8B0000] via-[#700000] to-[#5B0202] text-[#EDE7C7] rounded-b-[44px] px-5 sm:px-10 pt-6 pb-10 shadow-[0_12px_40px_color-mix(in_srgb,var(--t-primary)_30%,transparent)] border-b-2 border-[#D4AF37]/50 relative overflow-hidden">
        {/* Subtle background luxury pattern */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* Top App Bar with Navigation, Search, and Student Profile */}
        <div className="relative z-10 flex items-center justify-between">
          <button
            onClick={() => onNavigate('classes')}
            className="p-2 -ml-2 rounded-xl bg-black/20 hover:bg-black/30 border border-[#D4AF37]/30 transition active:scale-95 text-[#EDE7C7]"
            title="Class Roster"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* School Badge in Header */}
          <div className="flex items-center gap-2">
            <span className="font-['Cinzel',serif] text-xs uppercase tracking-widest text-[#D4AF37] font-bold hidden sm:inline">
              Royal Crescent Grammar
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('chat')}
              className="p-2 rounded-xl bg-black/20 hover:bg-black/30 border border-[#D4AF37]/30 transition active:scale-95 text-[#EDE7C7]"
              title="Search Faculty"
            >
              <Search className="w-5 h-5" />
            </button>

            <div
              onClick={() => onNavigate('report')}
              className="w-10 h-10 rounded-full ring-2 ring-[#D4AF37] overflow-hidden shadow-md cursor-pointer hover:scale-105 transition bg-[#EDE7C7]"
              title="Student Report Card"
            >
              <img
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=160&auto=format&fit=crop&q=80"
                alt={student.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Student Profile Info */}
        <div className="relative z-10 mt-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#D4AF37] font-['Cinzel',serif]">
                Scholar Profile • {student.roll_number}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
              <span className="text-[11px] font-semibold text-[#EDE7C7]/80">Fee Status: Cleared</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#EDE7C7] font-['Cormorant_Garamond',serif] italic mt-0.5">
              {student.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#EDE7C7]/90 font-medium tracking-wide">
              {student.class_id} • Section {student.section} (Cambridge Academic Stream)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#200E01]/60 border border-[#D4AF37]/40 text-[#EDE7C7] text-xs font-semibold shadow-inner">
              <Award className="w-4 h-4 text-[#D4AF37]" />
              <span className="font-['Cinzel',serif]">Honor Roll: 94.0%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container: Full Width Responsive Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-5 space-y-6">

        {/* 1b. PRIORITY: Daily Homework / Diary / Classwork */}
        <HomeworkHero
          onSend={() => (onSendHomework ? onSendHomework() : onNavigate('diary'))}
          onOpenDiary={() => onNavigate('diary')}
        />

        {/* 2. Prestigious School Campus Showcase Banner */}
        <div className="relative rounded-[32px] overflow-hidden shadow-lg border border-[#EDE7C7] bg-[#200E01] text-white">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80"
              alt="Imperial College Campus"
              className="w-full h-full object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#200E01] via-[#200E01]/85 to-transparent" />
          </div>

          <div className="relative p-6 sm:p-8 z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B0000]/80 border border-[#D4AF37]/60 text-[11px] font-black uppercase tracking-wider text-[#EDE7C7] font-['Cinzel',serif]">
                <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Historic Canal Campus • Est. 1928</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#EDE7C7] font-['Cormorant_Garamond',serif] italic leading-tight">
                {currentSchool?.name || 'Aitchisonian Imperial College & Grammar School'}
              </h2>
              <p className="text-xs sm:text-sm text-[#EDE7C7]/80 leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
                Welcome to the unified student and parent academic portal. Track syllabus milestones, daily chalkboard assignments, laboratory practicals, and certified Cambridge terminal exam cards.
              </p>
            </div>

            {/* Quick Campus Facilities Photo Thumbnails */}
            <div className="flex items-center gap-3">
              <div className="group relative rounded-2xl overflow-hidden border border-[#D4AF37]/40 w-24 sm:w-28 h-20 shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=300&auto=format&fit=crop&q=80"
                  alt="Science Lab"
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                />
                <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                  <span className="text-[10px] font-bold text-[#EDE7C7] leading-tight">Science Lab</span>
                </div>
              </div>

              <div className="group relative rounded-2xl overflow-hidden border border-[#D4AF37]/40 w-24 sm:w-28 h-20 shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=300&auto=format&fit=crop&q=80"
                  alt="Central Library"
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                />
                <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                  <span className="text-[10px] font-bold text-[#EDE7C7] leading-tight">Library Hall</span>
                </div>
              </div>

              <div className="group relative rounded-2xl overflow-hidden border border-[#D4AF37]/40 w-24 sm:w-28 h-20 shadow-md hidden sm:block">
                <img
                  src="https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=300&auto=format&fit=crop&q=80"
                  alt="Athletics"
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                />
                <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                  <span className="text-[10px] font-bold text-[#EDE7C7] leading-tight">Athletic Oval</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Featured Academic Subject Card ("Advanced Physics & Practical Lab") */}
        <div className="bg-white rounded-[32px] p-5 sm:p-7 border border-[#EDE7C7] shadow-[0_8px_30px_rgba(32,14,1,0.06)] hover:shadow-xl transition flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group">
          {/* Subtle gold accent border on top */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#8B0000] via-[#D4AF37] to-[#5B0202]" />

          {/* Left Illustration */}
          <div className="flex-shrink-0 bg-[#FAF8F2] p-3 rounded-2xl border border-[#EDE7C7]">
            <PhysicsIllustration className="w-24 h-24 sm:w-28 sm:h-28 transform group-hover:scale-105 transition duration-300" />
          </div>

          {/* Center Details */}
          <div className="flex-1 text-center md:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#8B0000]/10 text-[#8B0000] border border-[#8B0000]/20 text-[10px] font-bold uppercase tracking-wider font-['Cinzel',serif]">
                Core Cambridge Sciences
              </span>
              <span className="text-xs text-[#5B0202]/70 font-semibold">Prof. Asim Munir</span>
            </div>

            <h3 className="font-bold text-xl sm:text-2xl text-[#200E01] font-['Cormorant_Garamond',serif] italic mt-1.5">
              Electromagnetic Induction & Practical Lab
            </h3>
            <p className="text-xs sm:text-sm text-[#200E01]/75 mt-1 leading-relaxed">
              Demonstration of Faraday's Law, magnetic flux variation, and galvanometer deflections. Physics journal practical experiment observation table submission is due tomorrow.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button
                onClick={() => onNavigate('scheduled')}
                className="inline-flex items-center gap-1.5 text-xs font-black text-[#EDE7C7] bg-[#8B0000] hover:bg-[#700000] px-4 py-2 rounded-xl transition active:scale-95 shadow-sm border border-[#D4AF37]/50"
              >
                <span>View Full Timetable</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onNavigate('diary')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8B0000] bg-[#FAF8F2] hover:bg-[#EDE7C7] px-3.5 py-2 rounded-xl transition border border-[#EDE7C7]"
              >
                <Camera className="w-3.5 h-3.5 text-[#8B0000]" />
                <span>Lab Blackboard Notes</span>
              </button>
            </div>
          </div>

          {/* Right: Quick Stats pill */}
          <div className="flex md:flex-col items-center justify-around md:justify-center gap-3 bg-[#FAF8F2] p-4 rounded-2xl border border-[#EDE7C7] w-full md:w-auto">
            <div className="text-center">
              <span className="text-xs text-[#5B0202]/70 font-medium">Room</span>
              <p className="font-bold text-sm text-[#8B0000]">Physics Lab 3</p>
            </div>
            <div className="hidden md:block w-8 h-px bg-[#EDE7C7]" />
            <div className="text-center">
              <span className="text-xs text-[#5B0202]/70 font-medium">Timing</span>
              <p className="font-bold text-sm text-[#200E01]">10:00 - 10:50 AM</p>
            </div>
          </div>
        </div>

        {/* 4. The 2x2 Bento Action Cards Grid with Golden Luxe Styling */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Bento 1: My Scheduled */}
          <div
            onClick={() => onNavigate('scheduled')}
            className="bg-[#EDE7C7]/60 hover:bg-[#EDE7C7] rounded-[28px] p-5 flex flex-col items-center text-center cursor-pointer transition transform hover:-translate-y-1 active:scale-95 border-2 border-[#D4AF37]/50 shadow-sm group"
          >
            <div className="p-2 rounded-2xl bg-white/70 shadow-xs mb-2">
              <ScheduledIllustration className="w-20 h-20 group-hover:scale-105 transition" />
            </div>
            <span className="font-bold text-base text-[#5B0202] font-['Cormorant_Garamond',serif] italic text-lg">
              Daily Timetable
            </span>
            <p className="text-[11px] text-[#200E01]/70 mt-0.5">8 Periods • Mon to Fri</p>
          </div>

          {/* Bento 2: My Calender */}
          <div
            onClick={() => onNavigate('calendar')}
            className="bg-[#F8EBEB] hover:bg-[#F3DDDD] rounded-[28px] p-5 flex flex-col items-center text-center cursor-pointer transition transform hover:-translate-y-1 active:scale-95 border-2 border-[#8B0000]/20 shadow-sm group"
          >
            <div className="p-2 rounded-2xl bg-white/70 shadow-xs mb-2">
              <CalendarIllustration className="w-20 h-20 group-hover:scale-105 transition" />
            </div>
            <span className="font-bold text-base text-[#8B0000] font-['Cormorant_Garamond',serif] italic text-lg">
              Academic Calender
            </span>
            <p className="text-[11px] text-[#200E01]/70 mt-0.5">National Holidays & Exams</p>
          </div>

          {/* Bento 3: My Attendance */}
          <div
            onClick={() => onNavigate('attendance')}
            className="bg-[#EBF5F0] hover:bg-[#DDF0E6] rounded-[28px] p-5 flex flex-col items-center text-center cursor-pointer transition transform hover:-translate-y-1 active:scale-95 border-2 border-[#01411C]/25 shadow-sm group"
          >
            <div className="p-2 rounded-2xl bg-white/70 shadow-xs mb-2">
              <AttendanceIllustration className="w-20 h-20 group-hover:scale-105 transition" />
            </div>
            <span className="font-bold text-base text-[#01411C] font-['Cormorant_Garamond',serif] italic text-lg">
              Attendance Record
            </span>
            <p className="text-[11px] text-[#01411C] font-semibold mt-0.5">98.2% (Present Today)</p>
          </div>

          {/* Bento 4: Progress Report */}
          <div
            onClick={() => onNavigate('report')}
            className="bg-[#FDF9EE] hover:bg-[#F9F0D9] rounded-[28px] p-5 flex flex-col items-center text-center cursor-pointer transition transform hover:-translate-y-1 active:scale-95 border-2 border-[#D4AF37]/50 shadow-sm group"
          >
            <div className="p-2 rounded-2xl bg-white/70 shadow-xs mb-2">
              <ReportIllustration className="w-20 h-20 group-hover:scale-105 transition" />
            </div>
            <span className="font-bold text-base text-[#8B0000] font-['Cormorant_Garamond',serif] italic text-lg">
              Certified Report Card
            </span>
            <p className="text-[11px] text-[#5B0202] font-semibold mt-0.5">Grade A+ (Rank 1st)</p>
          </div>
        </div>

        {/* 5. Blackboard Photo Diary Banner */}
        <div className="bg-gradient-to-r from-[#5B0202] via-[#8B0000] to-[#200E01] text-[#EDE7C7] rounded-[30px] p-5 sm:p-7 shadow-lg border-2 border-[#D4AF37]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] font-['Cinzel',serif]">
                Digital Blackboard Diary Feed
              </span>
            </div>
            <h4 className="text-xl sm:text-2xl font-bold text-[#EDE7C7] font-['Cormorant_Garamond',serif] italic">
              Daily Classwork & Blackboard Homework Snapshots
            </h4>
            <p className="text-xs text-[#EDE7C7]/80 max-w-xl">
              Teachers snap daily chalkboards after each period. Parents can view derivations, verified exercise numbers, and sign read receipts.
            </p>
          </div>

          <button
            onClick={() => onNavigate('diary')}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#EDE7C7] text-[#8B0000] font-black text-xs hover:bg-white shadow-md transition active:scale-95 border border-[#D4AF37] whitespace-nowrap"
          >
            <Camera className="w-4 h-4 text-[#8B0000]" />
            <span>Open Chalkboard Diary</span>
          </button>
        </div>
      </div>
    </div>
  );
};
