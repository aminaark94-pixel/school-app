import { useEffect, useMemo, useState } from 'react';
import { useSchoolData } from '../../hooks/useSchoolData';
import type { AttendanceStatus } from '../../types';

// Local calendar date (YYYY-MM-DD). toISOString() would give the UTC date, which is "yesterday" for
// the first hours of a local day in time zones ahead of UTC.
const localDateString = (d: Date = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const statuses: { value: AttendanceStatus; label: string; active: string }[] = [
  { value: 'present', label: 'Present', active: 'border-emerald-800 bg-emerald-100 text-emerald-950' },
  { value: 'absent', label: 'Absent', active: 'border-rose-800 bg-rose-100 text-rose-950' },
  { value: 'late', label: 'Late', active: 'border-amber-800 bg-amber-100 text-amber-950' },
];

const field = 'mt-1 block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900';

export function AttendanceModule() {
  const { students, attendance, markAttendance, currentUser, dataState } = useSchoolData();
  const canEditAttendance = currentUser?.role === 'admin' || currentUser?.role === 'teacher';

  const todayStr = useMemo(() => localDateString(), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const activeStudents = useMemo(
    () =>
      students.filter(
        (s) =>
          !s.is_deleted &&
          (currentUser?.role !== 'parent' ||
            s.parent_id === currentUser.id ||
            s.parent_email === currentUser.email)
      ),
    [students, currentUser]
  );

  const classes = useMemo(() => {
    const set = new Set(activeStudents.map((s) => s.class_id));
    return Array.from(set).sort();
  }, [activeStudents]);

  const [selectedClass, setSelectedClass] = useState<string>(classes[0] || '');
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

  const [draft, setDraft] = useState<Record<string, AttendanceStatus>>({});
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  useEffect(() => {
    setDraft({});
    setSaveState('idle');
  }, [selectedClass, selectedSection, selectedDate, currentUser?.id]);

  const recorded = useMemo(() => new Map(
    attendance.filter((entry) => entry.date === selectedDate).map((entry) => [entry.student_id, entry.status])
  ), [attendance, selectedDate]);
  const rows = roster.map((student) => ({ student, status: draft[student.id] ?? recorded.get(student.id) }));
  const changes = rows.filter(({ student, status }) => draft[student.id] && status !== recorded.get(student.id));
  const unmarked = rows.filter(({ status }) => !status).length;
  const saving = saveState === 'saving';
  const changeFilter = (apply: () => void) => {
    if (saveState === 'saved' || !changes.length || window.confirm('Leave without saving these attendance changes?')) apply();
  };

  const chooseStatus = (studentId: string, status: AttendanceStatus) => {
    setDraft((current) => ({ ...current, [studentId]: status }));
    setSaveState('idle');
  };

  const save = async () => {
    if (!canEditAttendance || !selectedDate || saving || !changes.length) return;
    setSaveState('saving');
    try {
      await markAttendance(changes.map(({ student }) => ({
        student_id: student.id, status: draft[student.id], date: selectedDate,
      })));
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  };

  const saveMessage = saveState === 'saved' ? 'Attendance saved.'
    : saveState === 'error' ? 'Attendance could not be saved. Your changes are still here.'
    : changes.length ? `${changes.length} unsaved ${changes.length === 1 ? 'change' : 'changes'}` : '';

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5" aria-labelledby="attendance-filters-title">
        <h2 id="attendance-filters-title" className="text-xl font-bold">Choose a date and class</h2>
        <fieldset disabled={saving} data-tour="attendance-filters" className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <label className="col-span-2 text-sm font-semibold sm:col-span-1">Date
            <input type="date" className={field} value={selectedDate} onChange={(event) => {
              const date = event.target.value;
              changeFilter(() => setSelectedDate(date));
            }} />
          </label>
          <label className="text-sm font-semibold">Class
            <select className={field} value={selectedClass} disabled={!classes.length}
              onChange={(event) => {
                const name = event.target.value;
                changeFilter(() => { setSelectedClass(name); setSelectedSection('All'); });
              }}>
              {!classes.length && <option value="">No classes</option>}
              {classes.map((name) => <option key={name}>{name}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold">Section
            <select className={field} value={selectedSection} onChange={(event) => {
              const section = event.target.value;
              changeFilter(() => setSelectedSection(section));
            }}>
              <option value="All">All sections</option>
              {sections.map((section) => <option key={section} value={section}>Section {section}</option>)}
            </select>
          </label>
        </fieldset>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white" aria-labelledby="attendance-students-title">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
          <div>
            <h2 id="attendance-students-title" className="text-xl font-bold">Students</h2>
            <p className="mt-1 text-sm text-slate-600">{rows.length} students · {unmarked} {canEditAttendance ? 'unmarked' : 'awaiting attendance'}</p>
          </div>
          {canEditAttendance && Boolean(unmarked) && <button type="button" disabled={saving || !selectedDate}
            onClick={() => {
              const unmarkedStudents = rows.filter(({ status }) => !status);
              setDraft((current) => ({ ...current, ...Object.fromEntries(unmarkedStudents.map(({ student }) => [student.id, 'present' as const])) }));
              setSaveState('idle');
            }}
            className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm font-semibold hover:bg-slate-50">
            Mark remaining present
          </button>}
        </div>
        {!selectedDate || dataState === 'loading' || dataState === 'remote_error' || !rows.length ? (
          <p className="p-4 text-slate-700" role="status">{!selectedDate ? 'Choose a date to see attendance.'
            : dataState === 'loading' ? 'Loading students…'
            : dataState === 'remote_error' ? 'Could not load attendance. Refresh the page to try again.'
            : currentUser?.role === 'parent' ? 'No linked students in this class. Contact the school if you expected to see your child.'
            : 'No students in this class and section.'}</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {rows.map(({ student, status }, index) => (
              <li key={student.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">{student.name}</p>
                  <p className="text-sm text-slate-600">{student.roll_number} · Section {student.section}</p>
                </div>
                {canEditAttendance ? (
                  <div role="group" aria-label={`Attendance for ${student.name}`} data-tour={index === 0 ? 'attendance-roster' : undefined}
                    className="grid grid-cols-3 gap-2">
                    {statuses.map(({ value, label, active }) => <button key={value} type="button" disabled={saving}
                      aria-pressed={status === value} onClick={() => chooseStatus(student.id, value)}
                      className={`min-h-11 rounded-lg border px-2 text-sm font-semibold ${status === value ? active : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
                      {label}
                    </button>)}
                  </div>
                ) : (
                  <span data-tour={index === 0 ? 'attendance-roster' : undefined}
                    className={`self-start rounded-lg border px-3 py-2 text-sm font-semibold ${statuses.find(({ value }) => value === status)?.active ?? 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                    {statuses.find(({ value }) => value === status)?.label ?? 'Not recorded'}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
      {canEditAttendance && selectedDate && rows.length > 0 && dataState !== 'loading' && dataState !== 'remote_error' && (
        <div className="sticky bottom-16 z-30 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:bottom-4">
          <p role="status" className={saveState === 'error' ? 'text-sm text-rose-800' : 'text-sm text-slate-700'}>{saveMessage || 'Choose a status for each student.'}</p>
          <button type="button" data-tour="attendance-save" disabled={saving || changes.length === 0 || saveState === 'saved'} onClick={save}
            className="min-h-11 rounded-lg bg-[var(--t-primary)] px-4 text-sm font-semibold text-white disabled:bg-slate-200 disabled:text-slate-700">
            {saving ? 'Saving…' : 'Save attendance'}
          </button>
        </div>
      )}
    </div>
  );
}
