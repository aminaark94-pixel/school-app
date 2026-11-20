import assert from 'node:assert/strict';
import test from 'node:test';
import { LocalStore } from '../src/lib/storage';
import { formatDate, todayPK } from '../src/lib/dates';

function useEmptyStorage() {
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    },
  });
  return values;
}

test('datesheets do not overwrite stored progress or parent reports', () => {
  const values = useEmptyStorage();
  const keys = ['sms_kids_progress_v1', 'sms_teacher_progress_v1', 'sms_parents_report_v1'];
  for (const key of keys) values.set(key, '[{"id":"saved-by-user"}]');
  LocalStore.getDatesheets();
  for (const key of keys) assert.equal(values.get(key), '[{"id":"saved-by-user"}]');
});

test('a demo seed preserves existing records and repeated seeds are no-ops', () => {
  useEmptyStorage();
  const schoolId = 'school-safety-test';
  const first = LocalStore.importSchoolDemoData(schoolId, 'Safety test');
  assert.ok(first.studentsCount > 0);
  assert.ok(first.diaryCount > 0);
  const students = LocalStore.getStudents().map((row) => row.school_id === schoolId ? { ...row, name: 'Edited name' } : row);
  const diary = LocalStore.getDiary().map((row) => row.school_id === schoolId ? { ...row, homework: 'Edited homework' } : row);
  LocalStore.saveStudents(students);
  LocalStore.saveDiary(diary);
  const second = LocalStore.importSchoolDemoData(schoolId, 'Safety test');
  assert.deepEqual(second, { studentsCount: 0, feesCount: 0, diaryCount: 0, resultsCount: 0, attendanceCount: 0 });
  assert.deepEqual(LocalStore.getStudents(), students);
  assert.deepEqual(LocalStore.getDiary(), diary);
  const ids = new Set(students.map((row) => row.id));
  for (const row of [...LocalStore.getFees(), ...LocalStore.getResults(), ...LocalStore.getAttendance()]) {
    if (row.student_id.includes(schoolId)) assert.ok(ids.has(row.student_id));
  }
});

test('Karachi calendar date changes at local midnight and formats dates consistently', () => {
  assert.equal(todayPK(new Date('2026-11-05T18:59:59Z')), '2026-11-05');
  const midnight = new Date('2026-11-05T19:00:00Z');
  assert.equal(todayPK(midnight), '2026-11-06');
  assert.equal(todayPK(midnight, 1), '2026-11-07');
  assert.equal(formatDate('2026-11-06'), '6 Nov 2026');
  assert.equal(formatDate('2026-11-06', 'ur-roman', { now: midnight, relative: true }), 'Aaj');
  assert.equal(formatDate('2026-11-07', 'ur-roman', { now: midnight, relative: true }), 'Kal');
  assert.equal(formatDate('2026-02-31'), '—');
});
