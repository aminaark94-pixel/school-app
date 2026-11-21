import { formatDate } from '../../lib/dates';
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

      {/* 2. Top Control Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-[var(--t-radius-card,1.5rem)] border border-[var(--t-sand)] shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-[var(--t-on-primary,#fff)] font-black shadow-xs bg-[var(--t-primary)] border border-[var(--t-accent)]/40">
            <CalendarDays className="w-5 h-5 text-[var(--t-accent)]" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-[var(--t-ink)] flex flex-wrap items-center gap-2 font-[family-name:var(--t-font-display)]">
              Examination Roster & Schedules
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[var(--t-sand)] text-[var(--t-primary)] border border-[var(--t-accent)]/40">
                Official Decree
              </span>
            </h3>
            <p className="text-xs text-[var(--t-ink)]/70 font-medium mt-0.5">
              Review room allocations, invigilation schedules, and chapter syllabi.
            </p>
          </div>
        </div>

        <div data-tour="datesheet-tools" className="flex items-center gap-2.5">
          {/* Class Grade Selector */}
          <select
            id="select-datesheet-class"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-[var(--t-bg)] border border-[var(--t-sand)] text-[var(--t-ink)] font-bold text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-[var(--t-primary)] focus:outline-hidden cursor-pointer"
          >
            <option value="Grade 10">O-Levels Senior (Grade 10)</option>
            <option value="Grade 9">O-Levels Junior (Grade 9)</option>
          </select>

          <button
            id="btn-print-datesheet"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--t-primary)] bg-[var(--t-sand)] border border-[var(--t-accent)]/50 hover:bg-[var(--t-sand)]/80 shadow-xs transition active:scale-95 font-[family-name:var(--t-font-sans)]"
          >
            <Printer className="w-4 h-4 text-[var(--t-primary)]" />
            <span>Print Datesheet</span>
          </button>
        </div>
      </div>

      {activeDatesheet ? (
        <div className="space-y-6 print:m-0 print:p-0">
          {/* Official Document Card */}
          <div className="bg-white rounded-[var(--t-radius-card,1.5rem)] border border-[var(--t-sand)] shadow-sm overflow-hidden print:border-none print:shadow-none">
            {/* School Header Banner on Datesheet */}
            <div className="p-5 sm:p-6 text-[var(--t-on-primary,#fff)] bg-[var(--t-primary)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-2 border-[var(--t-accent)]">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[var(--t-primary-deep)] text-[var(--t-accent)] border border-[var(--t-accent)]/50 shadow-xs">
                  <Building2 className="w-6 h-6 text-[var(--t-accent)]" />
                </div>
                <div>
                  <h4 className="text-xl font-bold font-[family-name:var(--t-font-display)] text-[var(--t-on-primary,#fff)]">
                    {skin.name}
                  </h4>
                  <p className="text-xs text-[var(--t-on-primary,#fff)]/80 font-medium">
                    {activeDatesheet.title} • {activeDatesheet.class_id} (Academic Year {activeDatesheet.academic_year})
                  </p>
                </div>
              </div>

              <div className="text-right text-xs bg-[var(--t-primary-deep)]/80 px-4 py-2 rounded-xl border border-[var(--t-accent)]/40">
                <span className="block font-bold text-[var(--t-sand)] text-xs">Cambridge Board Certified</span>
                <span className="text-xs text-[var(--t-on-primary,#fff)]/70">Controller of Examinations</span>
              </div>
            </div>

            {/* Schedule Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[var(--t-bg)] border-b border-[var(--t-sand)] text-[var(--t-ink)] uppercase font-bold tracking-wider text-xs">
                    <th className="py-3.5 px-5">Date & Day</th>
                    <th className="py-3.5 px-4">Exam Time</th>
                    <th className="py-3.5 px-4">Discipline</th>
                    <th className="py-3.5 px-4">Curriculum Scope</th>
                    <th className="py-3.5 px-5 text-right">Examination Hall</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--t-sand)] font-medium text-[var(--t-ink)]">
                  {activeDatesheet.schedule.map((item, idx) => (
                    <tr key={item.id} className={idx % 2 === 0 ? 'bg-white hover:bg-[var(--t-bg)]/60 transition' : 'bg-[var(--t-bg)]/30 hover:bg-[var(--t-bg)]/80 transition'}>
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="font-bold text-[var(--t-ink)] block text-xs">
                          {formatDate(item.date)}
                        </span>
                        <span className="text-xs text-[var(--t-primary)] font-bold">{item.day}</span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[var(--t-sand)]/70 font-bold text-[var(--t-primary)] border border-[var(--t-accent)]/30">
                          <Clock className="w-3 h-3 text-[var(--t-primary)]" />
                          {item.time}
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-bold text-[var(--t-ink)] text-sm">{item.subject}</span>
                      </td>

                      <td className="py-4 px-4 text-[var(--t-ink)]/80 leading-relaxed max-w-md">
                        {item.syllabus}
                      </td>

                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-[var(--t-primary)] font-bold bg-[var(--t-bg)] px-3 py-1 rounded-xl border border-[var(--t-sand)]">
                          <MapPin className="w-3.5 h-3.5 text-[var(--t-accent)]" />
                          {item.room_no || 'Sir Syed Hall'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Examination Instructions / Rules */}
            <div className="p-6 bg-[var(--t-bg)] border-t border-[var(--t-sand)] space-y-2.5">
              <h5 className="font-bold text-[var(--t-ink)] text-xs uppercase tracking-wider flex items-center gap-2">
                <Info className="w-4 h-4 text-[var(--t-primary)]" />
                Mandatory Examination Instructions for Scholars & Parents
              </h5>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-[var(--t-ink)]/80 font-medium">
                {activeDatesheet.instructions.map((ins, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--t-primary)] mt-0.5 flex-shrink-0" />
                    <span>{ins}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-3xl border border-[var(--t-sand)] text-center text-[var(--t-ink)]/70">
          No datesheet found for this class.
        </div>
      )}
    </div>
  );
};
