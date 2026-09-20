import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  Users,
  CheckCheck,
  BellRing,
  Building2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useSchoolData } from '../../hooks/useSchoolData';
import { AttendanceStatus } from '../../types';

// Local calendar date (YYYY-MM-DD). toISOString() would give the UTC date, which is "yesterday" for
// the first hours of a local day in time zones ahead of UTC.
const localDateString = (d: Date = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const STATUS_BUTTONS: Array<{
  status: AttendanceStatus;
  label: string;
  Icon: LucideIcon;
  active: string;
}> = [
  {
    status: 'present',
    label: 'Present',
    Icon: CheckCircle2,
    active: 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-300',
  },
  {
    status: 'absent',
    label: 'Absent',
    Icon: XCircle,
    active: 'bg-[#8B0000] text-white shadow-xs ring-2 ring-rose-300',
  },
  {
    status: 'late',
    label: 'Late',
    Icon: Clock,
    active: 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-300',
  },
];

export const AttendanceModule: React.FC = () => {
  const { students, attendance, markAttendance, currentUser, alerts, acknowledgeAlert } = useSchoolData();

  const todayStr = useMemo(() => localDateString(), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const activeStudents = useMemo(() => students.filter((s) => !s.is_deleted), [students]);

  const classes = useMemo(() => {
    const set = new Set(activeStudents.map((s) => s.class_id));
    return Array.from(set).sort();
  }, [activeStudents]);

  const [selectedClass, setSelectedClass] = useState<string>(classes[0] || 'Grade 10');
  const [selectedSection, setSelectedSection] = useState<string>('All');

  // Student data can arrive after this screen has mounted (live database). Keep the selection valid,
  // otherwise the dropdown shows one class while the roster below is filtered by another.
  useEffect(() => {
    if (classes.length > 0 && !classes.includes(selectedClass)) {
      setSelectedClass(classes[0]);
      setSelectedSection('All');
    }
  }, [classes, selectedClass]);

  const sections = useMemo(() => {
    const set = new Set(
      activeStudents.filter((s) => s.class_id === selectedClass).map((s) => s.section)
    );
    return Array.from(set).sort();
  }, [activeStudents, selectedClass]);

  useEffect(() => {
    if (selectedSection !== 'All' && !sections.includes(selectedSection)) {
      setSelectedSection('All');
    }
  }, [sections, selectedSection]);

  const roster = useMemo(() => {
    return activeStudents.filter((s) => {
      const matchClass = s.class_id === selectedClass;
      const matchSection = selectedSection === 'All' || s.section === selectedSection;
      return matchClass && matchSection;
    });
  }, [activeStudents, selectedClass, selectedSection]);

  const [attendanceState, setAttendanceState] = useState<Record<string, AttendanceStatus>>({});
  const [isSaved, setIsSaved] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Rebuild the working state from stored attendance whenever the roster, date or stored data changes.
  useEffect(() => {
    const initial: Record<string, AttendanceStatus> = {};
    roster.forEach((student) => {
      const existing = attendance.find(
        (a) => a.student_id === student.id && a.date === selectedDate
      );
      initial[student.id] = existing ? existing.status : 'present';
    });
    setAttendanceState(initial);
  }, [roster, selectedDate, attendance]);

  // The "saved" confirmation only resets when the teacher moves to a different class / section / date.
  // (It must NOT reset when stored data reloads, because saving itself reloads the data.)
  useEffect(() => {
    setIsSaved(false);
  }, [selectedDate, selectedClass, selectedSection]);

  const totalCount = roster.length;
  const presentCount = Object.values(attendanceState).filter((s) => s === 'present').length;
  const absentCount = Object.values(attendanceState).filter((s) => s === 'absent').length;
  const lateCount = Object.values(attendanceState).filter((s) => s === 'late').length;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 100;

  const toggleStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceState((prev) => ({ ...prev, [studentId]: status }));
    setIsSaved(false);
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, AttendanceStatus> = {};
    roster.forEach((s) => {
      updated[s.id] = 'present';
    });
    setAttendanceState(updated);
    setIsSaved(false);
  };

  // markAttendance takes ONE array of records. (This screen used to call it once per student with three
  // separate arguments, which threw and saved nothing.)
  const handleSaveAttendance = () => {
    if (roster.length === 0) return;
    markAttendance(
      roster.map((student) => ({
        student_id: student.id,
        date: selectedDate,
        status: attendanceState[student.id] || 'present',
      }))
    );
    setIsSaved(true);
    setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  const selectClass =
    'w-full md:w-auto min-h-[44px] bg-[#FAF8F2] border border-[#EDE7C7] text-[#200E01] text-sm font-bold rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-[#8B0000] focus:outline-hidden cursor-pointer';
  const labelClass =
    "block text-[11px] font-bold uppercase tracking-wider text-[#5B0202] mb-1 font-['Cinzel',serif]";

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Banner (photo only from md up, keeps phones light and fast) */}
      <div className="relative rounded-3xl sm:rounded-[32px] overflow-hidden shadow-lg border border-[#EDE7C7] bg-[#200E01] text-[#EDE7C7]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80"
            alt="School Morning Assembly"
            loading="lazy"
            className="hidden md:block w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#200E01] via-[#200E01]/85 to-transparent" />
        </div>

        <div className="relative p-5 sm:p-8 z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B0000]/80 border border-[#D4AF37]/60 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#EDE7C7] font-['Cinzel',serif]">
              <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Morning Roll Call</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-bold text-[#EDE7C7] font-['Cormorant_Garamond',serif] italic leading-tight">
              Daily Scholar Attendance Registry
            </h2>
            <p className="hidden sm:block text-sm text-[#EDE7C7]/80 leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
              Record official daily classroom attendance. Automated absence alerts keep parents and academic housemasters instantly notified.
            </p>
          </div>

          <div className="flex items-center justify-around md:justify-start gap-4 bg-[#FAF8F2]/10 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-[#D4AF37]/30">
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] font-['Cinzel',serif] block">
                Roster
              </span>
              <p className="text-xl sm:text-2xl font-bold text-[#EDE7C7] font-['Cormorant_Garamond',serif] italic">
                {totalCount} Scholars
              </p>
            </div>
            <div className="h-8 w-px bg-[#D4AF37]/40" />
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] font-['Cinzel',serif] block">
                Presence Rate
              </span>
              <p className="text-xl sm:text-2xl font-bold text-[#EDE7C7] font-['Cormorant_Garamond',serif] italic">
                {attendanceRate}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filters (2-column grid on phones) + actions */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl sm:rounded-[28px] shadow-sm border border-[#EDE7C7]">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="grid grid-cols-2 gap-3 md:flex md:flex-wrap md:items-end">
            <div>
              <label className={labelClass} htmlFor="select-attendance-class">
                Class Grade
              </label>
              <select
                id="select-attendance-class"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className={selectClass}
              >
                {classes.length === 0 && <option value={selectedClass}>{selectedClass}</option>}
                {classes.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass} htmlFor="select-attendance-section">
                Section
              </label>
              <select
                id="select-attendance-section"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className={selectClass}
              >
                <option value="All">All Sections</option>
                {sections.map((sec) => (
                  <option key={sec} value={sec}>
                    Section {sec}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className={labelClass} htmlFor="select-attendance-date">
                Attendance Date
              </label>
              <input
                id="select-attendance-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={selectClass}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="mark-all-present-btn"
              onClick={handleMarkAllPresent}
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2.5 text-xs font-bold rounded-2xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition active:scale-95"
            >
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span>Mark All Present</span>
            </button>

            {/* On phones the Save button lives in the sticky bar under the roster */}
            <button
              id="save-attendance-btn"
              onClick={handleSaveAttendance}
              className="hidden md:flex items-center gap-2 min-h-[44px] px-5 py-2.5 text-xs font-bold rounded-2xl bg-[#8B0000] hover:bg-[#700000] text-[#EDE7C7] shadow-md border border-[#D4AF37]/50 transition active:scale-95"
            >
              <Save className="w-4 h-4 text-[#D4AF37]" />
              <span>Save Attendance</span>
            </button>
          </div>
        </div>

        {isSaved && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Attendance saved for {roster.length} scholars at {lastSavedTime}.
              </span>
            </div>
            <span className="text-[11px] text-emerald-700 font-bold">
              Authorized by {currentUser?.full_name}
            </span>
          </div>
        )}
      </div>

      {/* 3. Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#EDE7C7] shadow-sm">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#5B0202] font-['Cinzel',serif]">
            Total Enrolled
          </span>
          <div className="text-2xl font-black text-[#200E01] mt-1 font-['Cormorant_Garamond',serif] italic">
            {totalCount}
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50 border border-emerald-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-800 font-['Cinzel',serif]">
              Present
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900 mt-1 font-['Cormorant_Garamond',serif] italic">
            {presentCount}
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-rose-50 border border-rose-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-rose-800 font-['Cinzel',serif]">
              Absent
            </span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-900 mt-1 font-['Cormorant_Garamond',serif] italic">
            {absentCount}
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-[#FAF8F2] border border-[#D4AF37]/50 shadow-sm">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#8B0000] font-['Cinzel',serif]">
            Attendance Rate
          </span>
          <div className="text-2xl font-black text-[#8B0000] mt-1 font-['Cormorant_Garamond',serif] italic">
            {attendanceRate}%
          </div>
        </div>
      </div>

      {/* 4. Absence alerts */}
      {alerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-rose-600 animate-pulse" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-rose-900 font-['Cinzel',serif]">
                Absence Alerts Dispatched
              </h4>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200/80 text-rose-900">
              {alerts.length} Parent Alerts Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {alerts.slice(0, 4).map((alert) => (
              <div
                key={alert.id}
                className="bg-white p-3 rounded-xl border border-rose-200 flex items-center justify-between gap-2 shadow-2xs"
              >
                <div className="min-w-0">
                  <p className="font-bold text-[#200E01] truncate">{alert.student_name}</p>
                  <p className="text-[11px] text-[#5B0202]/70">
                    {alert.class_id} • Sent:{' '}
                    {new Date(alert.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="shrink-0">
                  {alert.status === 'acknowledged' ? (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCheck className="w-3 h-3 text-emerald-600" />
                      Acknowledged
                    </span>
                  ) : (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="min-h-[36px] text-[11px] font-bold px-3 py-1 rounded-lg bg-[#8B0000] hover:bg-[#700000] text-white shadow-xs transition"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Roster */}
      <div className="bg-white rounded-3xl sm:rounded-[28px] shadow-sm border border-[#EDE7C7] overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-[#EDE7C7] bg-[#FAF8F2] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Users className="w-4 h-4 text-[#8B0000] shrink-0" />
            <span className="text-xs font-bold text-[#5B0202] uppercase tracking-wider font-['Cinzel',serif] truncate">
              {selectedClass} ({selectedSection === 'All' ? 'All Sections' : `Section ${selectedSection}`})
            </span>
          </div>
          <span className="hidden sm:inline text-xs text-[#5B0202]/70 font-medium">
            Single-tap switch to mark absent or late
          </span>
        </div>

        {roster.length === 0 ? (
          <div className="p-8 text-center text-[#5B0202]/60 text-sm">
            No scholars found in {selectedClass}
            {selectedSection !== 'All' ? ` Section ${selectedSection}` : ''}.
          </div>
        ) : (
          <div className="divide-y divide-[#EDE7C7]/60">
            {roster.map((student, idx) => {
              const currentStatus = attendanceState[student.id] || 'present';
              return (
                <div
                  key={student.id}
                  className={`p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    currentStatus === 'absent'
                      ? 'bg-rose-50/50 hover:bg-rose-50'
                      : currentStatus === 'late'
                      ? 'bg-amber-50/50 hover:bg-amber-50'
                      : 'hover:bg-[#FAF8F2]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 shrink-0 rounded-xl bg-[#EDE7C7] border border-[#D4AF37]/50 flex items-center justify-center font-mono font-bold text-xs text-[#5B0202]">
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[#200E01] text-sm">{student.name}</span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#FAF8F2] text-[#5B0202] border border-[#EDE7C7]">
                          {student.roll_number}
                        </span>
                      </div>
                      <div className="text-xs text-[#5B0202]/70">
                        {student.class_id} – Sec {student.section}
                      </div>
                    </div>
                  </div>

                  {/* One-tap status: three equal, 44px-tall targets on phones */}
                  <div className="grid grid-cols-3 gap-2 w-full sm:w-auto sm:flex sm:items-center sm:gap-1.5">
                    {STATUS_BUTTONS.map(({ status, label, Icon, active }) => (
                      <button
                        key={status}
                        id={`att-${status}-${student.id}`}
                        onClick={() => toggleStatus(student.id, status)}
                        aria-pressed={currentStatus === status}
                        className={`flex items-center justify-center gap-1 min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
                          currentStatus === status
                            ? active
                            : 'bg-[#FAF8F2] text-[#200E01] hover:bg-[#EDE7C7] border border-[#EDE7C7]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Phone-only sticky save bar: always reachable while scrolling a long roster */}
      {roster.length > 0 && (
        <div className="md:hidden sticky above-bottom-nav z-30">
          <div className="rounded-2xl bg-[#200E01] text-[#EDE7C7] p-3 shadow-xl border border-[#D4AF37]/40 flex items-center justify-between gap-3">
            <div className="text-[11px] font-bold leading-tight min-w-0">
              <div>
                P {presentCount} · A {absentCount} · L {lateCount}
              </div>
              <div className="text-[10px] font-medium text-[#EDE7C7]/70 truncate">
                {isSaved ? `Saved at ${lastSavedTime}` : `${totalCount} scholars`}
              </div>
            </div>
            <button
              id="save-attendance-btn-mobile"
              onClick={handleSaveAttendance}
              className="shrink-0 flex items-center gap-2 min-h-[44px] px-5 rounded-2xl bg-[#8B0000] border border-[#D4AF37]/60 text-xs font-bold text-[#EDE7C7] active:scale-95 transition"
            >
              {isSaved ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              ) : (
                <Save className="w-4 h-4 text-[#D4AF37]" />
              )}
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
