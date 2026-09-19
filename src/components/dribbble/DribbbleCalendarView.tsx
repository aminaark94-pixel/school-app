import React, { useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Edit2,
  CheckCircle2,
  X,
} from 'lucide-react';
import { IndependenceDayIllustration, YogaIllustration } from './IllustrationAssets';
import { useSchoolData } from '../../hooks/useSchoolData';

interface DribbbleCalendarViewProps {
  onBack: () => void;
}

interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  dayNum: number;
  type: 'national' | 'health' | 'academic';
  illustrationType: 'independence' | 'yoga';
}

export const DribbbleCalendarView: React.FC<DribbbleCalendarViewProps> = ({ onBack }) => {
  const { currentSchool } = useSchoolData();
  const [selectedDay, setSelectedDay] = useState<number>(14);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [events, setEvents] = useState<EventItem[]>([
    {
      id: 'event-1',
      title: '79th Pakistan Independence Day (14th August)',
      description: 'Grand flag hoisting ceremony, national anthem choir, and cadet guard of honour on the imperial college parade ground.',
      date: '14. 08. 2026',
      dayNum: 14,
      type: 'national',
      illustrationType: 'independence',
    },
    {
      id: 'event-2',
      title: 'All-Pakistan Inter-School Science & Robotics Olympiad',
      description: 'Annual STEM exhibition showcasing student engineering prototypes, chemical reactions, and AI algorithmic models in Jinnah Auditorium.',
      date: '25. 08. 2026',
      dayNum: 25,
      type: 'academic',
      illustrationType: 'yoga',
    },
  ]);

  // Calendar dates layout for August (Starts on Sunday)
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const eventDays = [7, 14, 21, 25];

  const handleSelectDay = (day: number) => {
    setSelectedDay(day);
  };

  return (
    <div className="min-h-[85vh] pb-28 bg-[#FAF8F2] text-[#200E01]">
      {/* 1. Curved Golden Luxe Header with Calendar */}
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
              Official Calendar
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#EDE7C7] font-['Cormorant_Garamond',serif] italic">
              Academic Year & Events
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

        {/* Month Selector */}
        <div className="mt-5 flex items-center justify-between px-2 max-w-md mx-auto">
          <button className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-[#EDE7C7] transition border border-[#D4AF37]/30">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-base font-bold tracking-wide text-[#EDE7C7] font-['Cinzel',serif]">
            August 2026
          </span>
          <button className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-[#EDE7C7] transition border border-[#D4AF37]/30">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Days of Week Header */}
        <div className="mt-4 grid grid-cols-7 text-center text-[10px] font-extrabold text-[#D4AF37] tracking-wider max-w-lg mx-auto">
          {daysOfWeek.map((dow) => (
            <div key={dow}>{dow}</div>
          ))}
        </div>

        {/* Monthly Calendar Grid */}
        <div className="mt-2 grid grid-cols-7 text-center gap-y-1.5 text-xs font-bold text-[#EDE7C7] max-w-lg mx-auto">
          {calendarDays.map((day) => {
            const isSelected = selectedDay === day;
            const hasEvent = eventDays.includes(day);

            return (
              <div key={day} className="flex flex-col items-center justify-center py-1">
                <button
                  onClick={() => handleSelectDay(day)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full transition-all duration-150 relative ${
                    isSelected
                      ? 'bg-[#D4AF37] text-[#200E01] font-black shadow-md scale-105 ring-2 ring-[#EDE7C7]'
                      : 'hover:bg-white/15 text-[#EDE7C7]/90'
                  }`}
                >
                  <span>{day}</span>
                </button>
                {/* Event indicator dot */}
                {hasEvent && !isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-0.5" />
                )}
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-transparent mt-0.5" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Container with Upcoming Events */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-6">
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#200E01] font-['Cormorant_Garamond',serif] italic">
              Upcoming Campus Events
            </h3>
            <p className="text-xs text-[#200E01]/70">National holidays, ceremonies & exams</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#8B0000] text-[#EDE7C7] hover:bg-[#700000] border border-[#D4AF37] transition text-xs font-bold shadow-xs"
            title="Add Event"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event</span>
          </button>
        </div>

        {/* Event Cards List */}
        <div className="space-y-4">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-[26px] p-4 sm:p-6 border border-[#EDE7C7] shadow-[0_4px_20px_rgba(32,14,1,0.04)] hover:shadow-md transition flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              {/* Illustration Thumbnail */}
              <div className="flex-shrink-0 bg-[#FAF8F2] p-2 rounded-2xl border border-[#EDE7C7]">
                {ev.illustrationType === 'independence' ? (
                  <IndependenceDayIllustration className="w-16 h-16 sm:w-20 sm:h-20" />
                ) : (
                  <YogaIllustration className="w-16 h-16 sm:w-20 sm:h-20" />
                )}
              </div>

              {/* Event Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="font-bold text-base sm:text-lg text-[#200E01] font-['Cormorant_Garamond',serif] italic">
                    {ev.title}
                  </h4>
                  <button className="text-[#8B0000] hover:text-[#5B0202] p-1">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-[#200E01]/75 mt-1 leading-relaxed">
                  {ev.description}
                </p>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#8B0000] font-['Cinzel',serif]">
                    Date: {ev.date}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EBF5F0] text-[#01411C] border border-[#01411C]/30">
                    Official Holiday / Event
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Add Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F2] w-full max-w-sm rounded-[32px] p-6 shadow-2xl border-2 border-[#D4AF37] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EDE7C7]">
              <h4 className="font-bold text-lg text-[#200E01] font-['Cormorant_Garamond',serif] italic">
                Add Upcoming Event
              </h4>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X className="w-5 h-5 text-[#5B0202]" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const title = (form.elements.namedItem('title') as HTMLInputElement).value;
                const date = (form.elements.namedItem('date') as HTMLInputElement).value;
                const desc = (form.elements.namedItem('desc') as HTMLTextAreaElement).value;

                if (!title) return;

                setEvents([
                  ...events,
                  {
                    id: `event-${Date.now()}`,
                    title,
                    description: desc || 'Official school event scheduled on campus.',
                    date: date || '30. 08. 2026',
                    dayNum: 30,
                    type: 'academic',
                    illustrationType: 'independence',
                  },
                ]);
                setIsAddModalOpen(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-[11px] font-bold text-[#5B0202] uppercase tracking-wider mb-1">
                  Event Title
                </label>
                <input
                  name="title"
                  placeholder="e.g. Science Exhibition"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EDE7C7] bg-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#8B0000]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#5B0202] uppercase tracking-wider mb-1">
                  Date
                </label>
                <input
                  name="date"
                  type="date"
                  defaultValue="2026-08-30"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EDE7C7] bg-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#8B0000]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#5B0202] uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  name="desc"
                  rows={2}
                  placeholder="Event details, guidelines, or venue..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EDE7C7] bg-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#8B0000]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-2xl bg-[#8B0000] text-[#EDE7C7] font-bold text-xs hover:bg-[#700000] transition shadow-md border border-[#D4AF37]"
              >
                Save Event
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
