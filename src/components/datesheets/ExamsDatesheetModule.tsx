import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  Download,
  FileSpreadsheet,
  AlertCircle,
  BookOpen,
  MapPin,
  Printer,
  Sparkles,
  Info,
  CheckCircle2,
  Building2,
  Award,
} from 'lucide-react';
import { useSchoolData } from '../../hooks/useSchoolData';
import { useSkin } from '../../hooks/useSkin';

export const ExamsDatesheetModule: React.FC = () => {
  const { currentSchool, currentUser, datesheets, students } = useSchoolData();
  const skin = useSkin();

  const isParent = currentUser?.role === 'parent';
  const parentStudents = students.filter((s) => s.parent_id === currentUser?.id);
  const defaultClass = isParent && parentStudents[0] ? parentStudents[0].class_id : 'Grade 10';

  const [selectedClass, setSelectedClass] = useState<string>(defaultClass);
  const activeDatesheet = datesheets.find((d) => d.class_id === selectedClass) || datesheets[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 1. Examination Hall & Campus Library Hero Banner */}
      <div className="relative rounded-[32px] overflow-hidden shadow-lg border border-[#EDE7C7] bg-[#200E01] text-[#EDE7C7]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=1200&auto=format&fit=crop&q=80"
            alt="School Library & Examination Hall"
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#200E01] via-[#200E01]/85 to-transparent" />
        </div>

        <div className="relative p-6 sm:p-8 z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B0000]/80 border border-[#D4AF37]/60 text-[11px] font-black uppercase tracking-wider text-[#EDE7C7] font-['Cinzel',serif]">
              <CalendarDays className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{skin.name} Examination Board • Cambridge &amp; Matriculation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#EDE7C7] font-['Cormorant_Garamond',serif] italic leading-tight">
              Terminal Examination Datesheet & Syllabus
            </h2>
            <p className="text-xs sm:text-sm text-[#EDE7C7]/80 leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
              Official hall seating allocations, chapter breakdowns, invigilation protocol, and roll number slip verification for terminal assessments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="group relative rounded-2xl overflow-hidden border border-[#D4AF37]/40 w-28 h-20 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&auto=format&fit=crop&q=80"
                alt="Exam Hall Seating"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                <span className="text-[10px] font-bold text-[#EDE7C7] leading-tight">Great Hall</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Control Bar */}
      <div className="bg-white p-6 rounded-[28px] border border-[#EDE7C7] shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-[#EDE7C7] font-black shadow-xs bg-[#8B0000] border border-[#D4AF37]/40">
            <CalendarDays className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#200E01] flex items-center gap-2 font-['Cormorant_Garamond',serif] italic text-xl">
              Examination Roster & Schedules
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EDE7C7] text-[#8B0000] border border-[#D4AF37]/40 font-['Cinzel',serif]">
                Official Decree
              </span>
            </h3>
            <p className="text-xs text-[#5B0202]/70 font-medium mt-0.5">
              Review room allocations, invigilation schedules, and chapter syllabi.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Class Grade Selector */}
          <select
            id="select-datesheet-class"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-[#FAF8F2] border border-[#EDE7C7] text-[#200E01] font-bold text-xs rounded-2xl px-3.5 py-2.5 focus:ring-2 focus:ring-[#8B0000] focus:outline-hidden cursor-pointer"
          >
            <option value="Grade 10">O-Levels Senior (Grade 10)</option>
            <option value="Grade 9">O-Levels Junior (Grade 9)</option>
          </select>

          <button
            id="btn-print-datesheet"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-[#8B0000] bg-[#EDE7C7] border border-[#D4AF37]/50 hover:bg-[#EDE7C7]/80 shadow-xs transition active:scale-95 font-['Cinzel',serif]"
          >
            <Printer className="w-4 h-4 text-[#8B0000]" />
            <span>Print Datesheet</span>
          </button>
        </div>
      </div>

      {activeDatesheet ? (
        <div className="space-y-6 print:m-0 print:p-0">
          {/* Official Document Card */}
          <div className="bg-white rounded-[32px] border border-[#EDE7C7] shadow-sm overflow-hidden print:border-none print:shadow-none">
            {/* School Header Banner on Datesheet */}
            <div className="p-6 text-[#EDE7C7] bg-[#8B0000] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-2 border-[#D4AF37]">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#5B0202] text-[#EDE7C7] border border-[#D4AF37]/50 shadow-sm">
                  <Building2 className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <div>
                  <h4 className="text-xl font-bold font-['Cormorant_Garamond',serif] italic text-[#EDE7C7]">
                    {skin.name}
                  </h4>
                  <p className="text-xs text-[#EDE7C7]/80 font-medium">
                    {activeDatesheet.title} • {activeDatesheet.class_id} (Academic Year {activeDatesheet.academic_year})
                  </p>
                </div>
              </div>

              <div className="text-right text-xs bg-[#5B0202]/80 px-4 py-2 rounded-2xl border border-[#D4AF37]/40">
                <span className="block font-bold text-[#EDE7C7] font-['Cinzel',serif] text-[10px]">Cambridge Board Certified</span>
                <span className="text-[10px] text-[#EDE7C7]/70">Controller of Examinations</span>
              </div>
            </div>

            {/* Schedule Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F2] border-b border-[#EDE7C7] text-[#200E01] uppercase font-bold tracking-wider text-[11px] font-['Cinzel',serif]">
                    <th className="py-3.5 px-5">Date & Day</th>
                    <th className="py-3.5 px-4">Exam Time</th>
                    <th className="py-3.5 px-4">Discipline</th>
                    <th className="py-3.5 px-4">Curriculum Scope</th>
                    <th className="py-3.5 px-5 text-right">Examination Hall</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDE7C7] font-medium text-[#200E01]">
                  {activeDatesheet.schedule.map((item, idx) => (
                    <tr key={item.id} className={idx % 2 === 0 ? 'bg-white hover:bg-[#FAF8F2]/60 transition' : 'bg-[#FAF8F2]/30 hover:bg-[#FAF8F2]/80 transition'}>
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="font-bold text-[#200E01] block text-xs">
                          {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-[11px] text-[#8B0000] font-bold">{item.day}</span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#EDE7C7]/70 font-bold text-[#8B0000] border border-[#D4AF37]/30">
                          <Clock className="w-3 h-3 text-[#8B0000]" />
                          {item.time}
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-bold text-[#200E01] text-sm">{item.subject}</span>
                      </td>

                      <td className="py-4 px-4 text-[#5B0202]/80 leading-relaxed max-w-md">
                        {item.syllabus}
                      </td>

                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-[#8B0000] font-bold bg-[#FAF8F2] px-3 py-1 rounded-xl border border-[#EDE7C7]">
                          <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                          {item.room_no || 'Sir Syed Hall'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Examination Instructions / Rules */}
            <div className="p-6 bg-[#FAF8F2] border-t border-[#EDE7C7] space-y-2.5">
              <h5 className="font-bold text-[#200E01] text-xs uppercase tracking-wider flex items-center gap-2 font-['Cinzel',serif]">
                <Info className="w-4 h-4 text-[#8B0000]" />
                Mandatory Examination Instructions for Scholars & Parents
              </h5>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-[#5B0202]/80 font-medium">
                {activeDatesheet.instructions.map((ins, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#8B0000] mt-0.5 flex-shrink-0" />
                    <span>{ins}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-3xl border border-[#EDE7C7] text-center text-[#5B0202]/70">
          No datesheet found for this class.
        </div>
      )}
    </div>
  );
};
