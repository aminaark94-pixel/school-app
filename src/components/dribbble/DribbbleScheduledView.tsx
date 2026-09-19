import React, { useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  BookOpen,
  MapPin,
  User,
  ChevronRight as ArrowRightIcon,
  CheckCircle2,
} from 'lucide-react';
import { useSchoolData } from '../../hooks/useSchoolData';

interface DribbbleScheduledViewProps {
  onBack: () => void;
}

interface PeriodItem {
  time: string;
  dotColor: string;
  title: string;
  sectionBadge: string;
  badgeBg: string;
  badgeText: string;
  chapter: string;
  teacher: string;
  room: string;
  isFreeOrBreak?: boolean;
}

export const DribbbleScheduledView: React.FC<DribbbleScheduledViewProps> = ({ onBack }) => {
  const { currentSchool, currentUser } = useSchoolData();
  const [selectedDay, setSelectedDay] = useState<'12 Mon' | '13 Tue' | '14 Wed' | '15 Thu' | '16 Fri' | '17 Sat'>('13 Tue');
  const [activeItem, setActiveItem] = useState<PeriodItem | null>(null);

  const days: Array<'12 Mon' | '13 Tue' | '14 Wed' | '15 Thu' | '16 Fri' | '17 Sat'> = [
    '12 Mon',
    '13 Tue',
    '14 Wed',
    '15 Thu',
    '16 Fri',
    '17 Sat',
  ];

  const schedule: PeriodItem[] = [
    {
      time: '08 am',
      dotColor: '#D4AF37', // Gold
      title: 'English Language & Composition',
      sectionBadge: 'O-2 A',
      badgeBg: 'bg-[#EDE7C7] border-[#D4AF37]/50',
      badgeText: 'text-[#5B0202]',
      chapter: 'Comprehension & Essay Drafting',
      teacher: 'Mrs. Rebecca Sterling',
      room: 'North Wing Hall 204',
    },
    {
      time: '09 am',
      dotColor: '#8B0000', // Crimson
      title: 'Mathematics (Calculus & Vectors)',
      sectionBadge: 'O-2 A',
      badgeBg: 'bg-[#F8EBEB] border-[#8B0000]/30',
      badgeText: 'text-[#8B0000]',
      chapter: 'Integration & Vector Spaces - Ex 4.2',
      teacher: 'Sir Tariq Jamil',
      room: 'Senior Math Lab 102',
    },
    {
      time: '10 am',
      dotColor: '#01411C', // Pakistan Green
      title: 'Pakistan Studies & History',
      sectionBadge: 'O-2 A',
      badgeBg: 'bg-[#EBF5F0] border-[#01411C]/30',
      badgeText: 'text-[#01411C]',
      chapter: 'Constitutional History (1947–1973)',
      teacher: 'Prof. Zahid Chaudhry',
      room: 'Quaid-e-Azam Hall',
    },
    {
      time: '11 am',
      dotColor: '#D4AF37', // Gold
      title: 'Physics & Laboratory Practicals',
      sectionBadge: 'O-2 A',
      badgeBg: 'bg-[#EDE7C7] border-[#D4AF37]/50',
      badgeText: 'text-[#5B0202]',
      chapter: 'Faraday’s Law & Galvanometer Deflection',
      teacher: 'Dr. Asim Munir',
      room: 'Physics Lab 3',
    },
    {
      time: '12 am',
      dotColor: '#700000', // Oxblood
      title: 'Recess & Midday Prayer Break',
      sectionBadge: 'Break',
      badgeBg: 'bg-[#FAF8F2] border-[#EDE7C7]',
      badgeText: 'text-[#5B0202]',
      chapter: 'Central Courtyard & Campus Mosque',
      teacher: 'Prefect Council',
      room: 'Memorial Lawn & Cafeteria',
      isFreeOrBreak: true,
    },
    {
      time: '01 pm',
      dotColor: '#01411C', // Pakistan Green
      title: 'Urdu Literature & Adab',
      sectionBadge: 'O-2 A',
      badgeBg: 'bg-[#EBF5F0] border-[#01411C]/30',
      badgeText: 'text-[#01411C]',
      chapter: 'Allama Iqbal - Bang-e-Dra Poetry Analysis',
      teacher: 'Madam Fatima Surayya',
      room: 'Iqbal Seminar Room',
    },
    {
      time: '02 pm',
      dotColor: '#8B0000', // Crimson
      title: 'Computer Science & AI Programming',
      sectionBadge: 'O-2 A',
      badgeBg: 'bg-[#F8EBEB] border-[#8B0000]/30',
      badgeText: 'text-[#8B0000]',
      chapter: 'Python Data Structures & Relational SQL',
      teacher: 'Engr. Bilal Khan',
      room: 'Turing Computing Center',
    },
  ];

  return (
    <div className="min-h-[85vh] pb-28 bg-[#FAF8F2] text-[#200E01]">
      {/* 1. Curved Golden Luxe Header */}
      <div className="bg-gradient-to-br from-[#8B0000] via-[#700000] to-[#5B0202] text-[#EDE7C7] rounded-b-[44px] px-5 sm:px-10 pt-6 pb-8 shadow-[0_12px_40px_rgba(139,0,0,0.3)] border-b-2 border-[#D4AF37]/50">
        {/* Top App Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl bg-black/20 hover:bg-black/30 border border-[#D4AF37]/30 transition active:scale-95 text-[#EDE7C7]"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] font-['Cinzel',serif] block">
              Academic Timetable
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#EDE7C7] font-['Cormorant_Garamond',serif] italic">
              Daily Class Schedule
            </h2>
          </div>

          <div className="w-10 h-10 rounded-full ring-2 ring-[#D4AF37] overflow-hidden shadow-md bg-[#EDE7C7]">
            <img
              src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Month & Week Indicator */}
        <div className="mt-5 flex items-center justify-between px-2 max-w-md mx-auto">
          <button className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-[#EDE7C7] transition border border-[#D4AF37]/30">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-center">
            <span className="text-sm font-bold tracking-wide text-[#EDE7C7] font-['Cinzel',serif]">
              Autumn Term • August 2026
            </span>
          </div>
          <button className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-[#EDE7C7] transition border border-[#D4AF37]/30">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Horizontal Day Selector Strip */}
        <div className="mt-4 flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-1 max-w-xl mx-auto">
          {days.map((d) => {
            const [num, dayName] = d.split(' ');
            const isSelected = selectedDay === d;
            return (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`flex flex-col items-center justify-center min-w-[56px] py-2.5 px-2 rounded-2xl transition-all duration-200 border ${
                  isSelected
                    ? 'bg-[#D4AF37] text-[#200E01] border-[#EDE7C7] shadow-lg shadow-[#D4AF37]/30 scale-105 font-black'
                    : 'bg-[#200E01]/40 text-[#EDE7C7]/80 hover:bg-[#200E01]/70 border-[#D4AF37]/20 font-bold'
                }`}
              >
                <span className="text-sm font-black">{num}</span>
                <span className="text-[10px] uppercase tracking-wider mt-0.5">{dayName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Container with Time Table */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-6">
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#200E01] font-['Cormorant_Garamond',serif] italic">
              Period Timeline ({selectedDay})
            </h3>
            <p className="text-xs text-[#200E01]/70">Cambridge Senior Wing • Bell Schedule</p>
          </div>
          <span className="text-xs font-bold text-[#EDE7C7] bg-[#8B0000] border border-[#D4AF37] px-3.5 py-1.5 rounded-full shadow-xs">
            Class 10 (O-Levels) • Sec A
          </span>
        </div>

        {/* Vertical Timeline */}
        <div className="relative pl-14 sm:pl-16 space-y-4">
          {/* Vertical Dotted Guide Line */}
          <div className="absolute left-[44px] sm:left-[52px] top-4 bottom-4 w-0.5 border-l-2 border-dashed border-slate-200" />

          {schedule.map((item, idx) => (
            <div key={idx} className="relative group">
              {/* Time Label on left */}
              <div className="absolute -left-14 sm:-left-16 top-3 text-[11px] font-extrabold text-slate-400 w-10 text-right font-['Outfit',sans-serif]">
                {item.time}
              </div>

              {/* Connecting Colored Dot */}
              <div
                className="absolute -left-[14px] sm:-left-[16px] top-3.5 w-3 h-3 rounded-full ring-4 ring-white shadow-xs z-10"
                style={{ backgroundColor: item.dotColor }}
              />

              {/* Time Table Item Card */}
              <div
                onClick={() => setActiveItem(item)}
                className={`rounded-[22px] p-3.5 sm:p-4 border transition cursor-pointer active:scale-[0.99] shadow-2xs hover:shadow-md ${
                  item.isFreeOrBreak
                    ? 'bg-[#FAF8F2] border-[#EDE7C7] text-[#5B0202]'
                    : 'bg-white border-[#EDE7C7] text-[#200E01] hover:border-[#8B0000]/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#200E01] font-['Cormorant_Garamond',serif] italic text-base">
                      {item.title}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${item.badgeBg} ${item.badgeText}`}
                    >
                      {item.sectionBadge}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[#8B0000] text-xs transition">
                    <span className="font-bold text-xs text-[#5B0202]/70">{item.chapter}</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </div>
                </div>

                {!item.isFreeOrBreak && (
                  <div className="mt-2 flex items-center gap-4 text-[11px] text-[#200E01]/60 font-medium">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-[#D4AF37]" />
                      {item.teacher}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#D4AF37]" />
                      {item.room}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-fade-in">
          <div className="bg-[#FAF8F2] w-full max-w-sm rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl border-2 border-[#D4AF37] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EDE7C7]">
              <div className="flex items-center gap-2">
                <div
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: activeItem.dotColor }}
                />
                <h4 className="font-bold text-lg text-[#200E01] font-['Cormorant_Garamond',serif] italic">
                  {activeItem.title}
                </h4>
              </div>
              <span className="text-xs font-bold text-[#5B0202]">{activeItem.time}</span>
            </div>

            <div className="space-y-2 text-xs text-[#200E01]/80">
              <p>
                <strong className="text-[#200E01]">Syllabus Topic:</strong> {activeItem.chapter}
              </p>
              <p>
                <strong className="text-[#200E01]">Faculty Member:</strong> {activeItem.teacher}
              </p>
              <p>
                <strong className="text-[#200E01]">Campus Location:</strong> {activeItem.room}
              </p>
              <p>
                <strong className="text-[#200E01]">Status:</strong> Certified Cambridge Lecture
              </p>
            </div>

            <button
              onClick={() => setActiveItem(null)}
              className="w-full py-2.5 rounded-2xl bg-[#8B0000] text-[#EDE7C7] font-bold text-xs hover:bg-[#700000] transition shadow-md border border-[#D4AF37]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
