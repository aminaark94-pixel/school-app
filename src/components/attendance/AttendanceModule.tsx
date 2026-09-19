import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  Users,
  CheckCheck,
  AlertCircle,
  Filter,
  Sparkles,
  BellRing,
  ShieldAlert,
  Building2,
  GraduationCap,
  Award,
} from 'lucide-react';
import { useSchoolData } from '../../hooks/useSchoolData';
import { AttendanceStatus } from '../../types';

export const AttendanceModule: React.FC = () => {
  const { students, attendance, markAttendance, currentUser, currentSchool, alerts, acknowledgeAlert } = useSchoolData();

  // Active date (defaults to YYYY-MM-DD today)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Available classes and sections in current school
  const activeStudents = useMemo(() => students.filter((s) => !s.is_deleted), [students]);

  const classes = useMemo(() => {
    const set = new Set(activeStudents.map((s) => s.class_id));
    return Array.from(set).sort();
  }, [activeStudents]);

  const [selectedClass, setSelectedClass] = useState<string>(classes[0] || 'Grade 10');
  const [selectedSection, setSelectedSection] = useState<string>('All');

  // Filter students for chosen class & section
  const roster = useMemo(() => {
    return activeStudents.filter((s) => {
      const matchClass = s.class_id === selectedClass;
      const matchSection = selectedSection === 'All' || s.section === selectedSection;
      return matchClass && matchSection;
    });
  }, [activeStudents, selectedClass, selectedSection]);

  // Local state holding the status for each student on the active date
  const [attendanceState, setAttendanceState] = useState<Record<string, AttendanceStatus>>({});
  const [isSaved, setIsSaved] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Synchronize initial state when date or roster changes
  useEffect(() => {
    const initial: Record<string, AttendanceStatus> = {};
    roster.forEach((student) => {
      const existing = attendance.find(
        (a) => a.student_id === student.id && a.date === selectedDate
      );
      initial[student.id] = existing ? existing.status : 'present';
    });
    setAttendanceState(initial);
    setIsSaved(false);
  }, [roster, selectedDate, attendance]);

  // Calculate live statistics
  const totalCount = roster.length;
  const presentCount = Object.values(attendanceState).filter((s) => s === 'present').length;
  const absentCount = Object.values(attendanceState).filter((s) => s === 'absent').length;
  const lateCount = Object.values(attendanceState).filter((s) => s === 'late').length;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 100;

  // Toggle single student status
  const toggleStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: status,
    }));
    setIsSaved(false);
  };

  // Bulk mark all present
  const handleMarkAllPresent = () => {
    const updated: Record<string, AttendanceStatus> = {};
    roster.forEach((s) => {
      updated[s.id] = 'present';
    });
    setAttendanceState(updated);
    setIsSaved(false);
  };

  // Save all modified attendance records to school data store
  const handleSaveAttendance = () => {
    roster.forEach((student) => {
      const status = attendanceState[student.id] || 'present';
      markAttendance(student.id, selectedDate, status);
    });
    setIsSaved(true);
    setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  return (
    <div className="space-y-6">
      {/* 1. School Assembly & Morning Roll Call Banner */}
      <div className="relative rounded-[32px] overflow-hidden shadow-lg border border-[#EDE7C7] bg-[#200E01] text-[#EDE7C7]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80"
            alt="School Morning Assembly"
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#200E01] via-[#200E01]/85 to-transparent" />
        </div>

        <div className="relative p-6 sm:p-8 z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B0000]/80 border border-[#D4AF37]/60 text-[11px] font-black uppercase tracking-wider text-[#EDE7C7] font-['Cinzel',serif]">
              <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Campus Morning Roll Call • House System</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#EDE7C7] font-['Cormorant_Garamond',serif] italic leading-tight">
              Daily Scholar Attendance Registry
            </h2>
            <p className="text-xs sm:text-sm text-[#EDE7C7]/80 leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
              Record official daily biometric and classroom attendance. Automated SMS/portal absence dispatch keeps parents and academic housemasters instantly notified.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#FAF8F2]/10 backdrop-blur-md p-4 rounded-2xl border border-[#D4AF37]/30">
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] font-['Cinzel',serif] block">
                Today's Roster
              </span>
              <p className="text-2xl font-bold text-[#EDE7C7] font-['Cormorant_Garamond',serif] italic">{totalCount} Scholars</p>
            </div>
            <div className="h-8 w-px bg-[#D4AF37]/40" />
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] font-['Cinzel',serif] block">
                Presence Rate
              </span>
              <p className="text-2xl font-bold text-[#EDE7C7] font-['Cormorant_Garamond',serif] italic">{attendanceRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Filter & Action Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-[28px] shadow-sm border border-[#EDE7C7]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Class, Section & Date Selectors */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5B0202] mb-1 font-['Cinzel',serif]">
                Class Grade
              </label>
              <select
                id="select-attendance-class"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-[#FAF8F2] border border-[#EDE7C7] text-[#200E01] text-sm font-bold rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-[#8B0000] focus:outline-hidden cursor-pointer"
              >
                {classes.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5B0202] mb-1 font-['Cinzel',serif]">
                Section
              </label>
              <select
                id="select-attendance-section"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="bg-[#FAF8F2] border border-[#EDE7C7] text-[#200E01] text-sm font-bold rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-[#8B0000] focus:outline-hidden cursor-pointer"
              >
                <option value="All">All Sections</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5B0202] mb-1 font-['Cinzel',serif]">
                Attendance Date
              </label>
              <div className="relative flex items-center">
                <input
                  id="select-attendance-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-[#FAF8F2] border border-[#EDE7C7] text-[#200E01] text-sm font-bold rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-[#8B0000] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              id="mark-all-present-btn"
              onClick={handleMarkAllPresent}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-2xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition active:scale-95"
            >
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span>Mark All Present</span>
            </button>

            <button
              id="save-attendance-btn"
              onClick={handleSaveAttendance}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-2xl bg-[#8B0000] hover:bg-[#700000] text-[#EDE7C7] shadow-md border border-[#D4AF37]/50 transition active:scale-95"
            >
              <Save className="w-4 h-4 text-[#D4AF37]" />
              <span>Save Attendance</span>
            </button>
          </div>
        </div>

        {/* Saved Success Notification */}
        {isSaved && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                Attendance successfully synchronized for {roster.length} scholars at {lastSavedTime}!
              </span>
            </div>
            <span className="text-[11px] text-emerald-700 font-bold">Authorized by {currentUser?.full_name}</span>
          </div>
        )}
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-5 rounded-3xl bg-white border border-[#EDE7C7] shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5B0202] font-['Cinzel',serif]">Total Enrolled</span>
          <div className="text-2xl font-black text-[#200E01] mt-1 font-['Cormorant_Garamond',serif] italic">{totalCount}</div>
        </div>

        <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 font-['Cinzel',serif]">Present</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900 mt-1 font-['Cormorant_Garamond',serif] italic">{presentCount}</div>
        </div>

        <div className="p-5 rounded-3xl bg-rose-50 border border-rose-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800 font-['Cinzel',serif]">Absent</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-900 mt-1 font-['Cormorant_Garamond',serif] italic">{absentCount}</div>
        </div>

        <div className="p-5 rounded-3xl bg-[#FAF8F2] border border-[#D4AF37]/50 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8B0000] font-['Cinzel',serif]">Attendance Rate</span>
          <div className="text-2xl font-black text-[#8B0000] mt-1 font-['Cormorant_Garamond',serif] italic">{attendanceRate}%</div>
        </div>
      </div>

      {/* Automated Instant Absence Alerts Audit Log */}
      {alerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-rose-600 animate-pulse" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-rose-900 font-['Cinzel',serif]">
                Automated Absence Alerts Dispatched (Safety & Accountability)
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
                className="bg-white p-3 rounded-xl border border-rose-200 flex items-center justify-between shadow-2xs"
              >
                <div>
                  <p className="font-bold text-[#200E01]">{alert.student_name}</p>
                  <p className="text-[11px] text-[#5B0202]/70">
                    {alert.class_id} • Sent: {new Date(alert.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div>
                  {alert.status === 'acknowledged' ? (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCheck className="w-3 h-3 text-emerald-600" />
                      Acknowledged by Parent
                    </span>
                  ) : (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#8B0000] hover:bg-[#700000] text-white shadow-xs transition"
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

      {/* Roster List Table / Cards */}
      <div className="bg-white rounded-[28px] shadow-sm border border-[#EDE7C7] overflow-hidden">
        <div className="p-4 border-b border-[#EDE7C7] bg-[#FAF8F2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#8B0000]" />
            <span className="text-xs font-bold text-[#5B0202] uppercase tracking-wider font-['Cinzel',serif]">
              {selectedClass} ({selectedSection === 'All' ? 'All Sections' : `Section ${selectedSection}`}) Roster
            </span>
          </div>
          <span className="text-xs text-[#5B0202]/70 font-medium">
            Single-tap switch to mark absent or late
          </span>
        </div>

        {roster.length === 0 ? (
          <div className="p-8 text-center text-[#5B0202]/60 text-sm">
            No scholars found in {selectedClass} {selectedSection !== 'All' ? `Section ${selectedSection}` : ''}.
          </div>
        ) : (
          <div className="divide-y divide-[#EDE7C7]/60">
            {roster.map((student, idx) => {
              const currentStatus = attendanceState[student.id] || 'present';
              return (
                <div
                  key={student.id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    currentStatus === 'absent'
                      ? 'bg-rose-50/50 hover:bg-rose-50'
                      : currentStatus === 'late'
                      ? 'bg-amber-50/50 hover:bg-amber-50'
                      : 'hover:bg-[#FAF8F2]'
                  }`}
                >
                  {/* Student Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#EDE7C7] border border-[#D4AF37]/50 flex items-center justify-center font-mono font-bold text-xs text-[#5B0202]">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#200E01] text-sm">{student.name}</span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#FAF8F2] text-[#5B0202] border border-[#EDE7C7]">
                          {student.roll_number}
                        </span>
                      </div>
                      <div className="text-xs text-[#5B0202]/70">
                        Class: {student.class_id} – Sec {student.section}
                      </div>
                    </div>
                  </div>

                  {/* 1-Tap Attendance Status Switch Buttons */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    <button
                      id={`att-present-${student.id}`}
                      onClick={() => toggleStatus(student.id, 'present')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        currentStatus === 'present'
                          ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-300'
                          : 'bg-[#FAF8F2] text-[#200E01] hover:bg-[#EDE7C7]'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Present</span>
                    </button>

                    <button
                      id={`att-absent-${student.id}`}
                      onClick={() => toggleStatus(student.id, 'absent')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        currentStatus === 'absent'
                          ? 'bg-[#8B0000] text-white shadow-xs ring-2 ring-rose-300'
                          : 'bg-[#FAF8F2] text-[#200E01] hover:bg-[#EDE7C7]'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Absent</span>
                    </button>

                    <button
                      id={`att-late-${student.id}`}
                      onClick={() => toggleStatus(student.id, 'late')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        currentStatus === 'late'
                          ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-300'
                          : 'bg-[#FAF8F2] text-[#200E01] hover:bg-[#EDE7C7]'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Late</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
