import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Attendance,
  AttendanceStatus,
  Fee,
  Result,
  School,
  Student,
  User,
  UserRole,
  DiaryEntry,
  Notice,
  CommunicationQuery,
  Datesheet,
} from '../types';
import { LocalStore } from '../lib/storage';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../lib/authContext';
import { useDiaryStore, diaryActions } from '../lib/diaryStore';
import { useNoticeStore, noticeActions } from '../lib/noticeStore';
import { useChatStore, chatActions } from '../lib/chatStore';
import { useAlertStore, alertActions } from '../lib/alertStore';
import { useDatesheetStore, datesheetActions } from '../lib/datesheetStore';

interface RemoteData {
  schools: School[];
  users: User[];
  students: Student[];
  attendance: Attendance[];
  fees: Fee[];
  results: Result[];
}

export function useSchoolData() {
  const [tick, setTick] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { profile, school: authSchool } = useAuth();

  // Supabase drives the core tables only when credentials exist AND the user is signed in
  // with a linked profile row. Otherwise everything falls back to the local demo store.
  const isSupabaseActive = isSupabaseConfigured() && Boolean(profile);
  const [remote, setRemote] = useState<RemoteData | null>(null);
  const [remoteError, setRemoteError] = useState<string | null>(null);

  // Cloud collections: one shared realtime store per table when signed in, the
  // local demo store otherwise. All four follow the same attach/detach pattern.
  const diaryState = useDiaryStore();
  const noticeState = useNoticeStore();
  const chatState = useChatStore();
  const alertState = useAlertStore();
  const datesheetState = useDatesheetStore();

  const cloudSchoolId = isSupabaseActive ? profile?.school_id ?? null : null;

  useEffect(() => {
    if (!cloudSchoolId) return;
    const detachDiary = diaryActions.attach(cloudSchoolId);
    const detachNotices = noticeActions.attach(cloudSchoolId);
    const detachChat = chatActions.attach(cloudSchoolId);
    const detachAlerts = alertActions.attach(cloudSchoolId);
    const detachDatesheets = datesheetActions.attach(cloudSchoolId);
    return () => {
      detachDiary();
      detachNotices();
      detachChat();
      detachAlerts();
      detachDatesheets();
    };
  }, [cloudSchoolId]);

  useEffect(() => {
    const unsubscribe = LocalStore.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  // ---------------------------------------------------------------------------
  // Remote loading
  // ---------------------------------------------------------------------------
  const refreshRemote = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase || !profile) return;

    const [schoolsRes, usersRes, studentsRes, attendanceRes, feesRes, resultsRes] =
      await Promise.all([
        supabase.from('schools').select('*'),
        supabase.from('users').select('*'),
        supabase.from('students').select('*'),
        supabase.from('attendance').select('*'),
        supabase.from('fees').select('*'),
        supabase.from('results').select('*'),
      ]);

    const firstError =
      schoolsRes.error ||
      usersRes.error ||
      studentsRes.error ||
      attendanceRes.error ||
      feesRes.error ||
      resultsRes.error;

    if (firstError) {
      setRemoteError(firstError.message);
      return;
    }

    setRemoteError(null);
    setRemote({
      schools: (schoolsRes.data ?? []) as School[],
      users: (usersRes.data ?? []) as User[],
      students: (studentsRes.data ?? []) as Student[],
      attendance: (attendanceRes.data ?? []) as Attendance[],
      fees: (feesRes.data ?? []) as Fee[],
      results: (resultsRes.data ?? []) as Result[],
    });
  }, [profile]);

  useEffect(() => {
    if (!isSupabaseActive) {
      setRemote(null);
      setRemoteError(null);
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    refreshRemote().finally(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [isSupabaseActive, refreshRemote]);

  const usingRemote = isSupabaseActive && remote !== null;

  // ---------------------------------------------------------------------------
  // Core collections (remote when signed in, local demo data otherwise)
  // ---------------------------------------------------------------------------
  const localSchools = useMemo(() => LocalStore.getSchools(), [tick]);
  const schools = usingRemote ? remote!.schools : localSchools;

  const localCurrentSchoolId = LocalStore.getCurrentSchoolId();
  const currentSchool = useMemo(() => {
    if (usingRemote) {
      return (
        authSchool ??
        remote!.schools.find((s) => s.id === profile?.school_id) ??
        remote!.schools[0] ??
        null
      );
    }
    return localSchools.find((s) => s.id === localCurrentSchoolId) || localSchools[0] || null;
  }, [usingRemote, remote, authSchool, profile, localSchools, localCurrentSchoolId]);

  const localUsers = useMemo(() => LocalStore.getUsers(), [tick]);
  const allUsers = usingRemote ? remote!.users : localUsers;
  const usersInSchool = useMemo(
    () => allUsers.filter((u) => u.school_id === currentSchool?.id),
    [allUsers, currentSchool]
  );

  const localCurrentUserId = LocalStore.getCurrentUserId();
  const currentUser = useMemo(() => {
    if (usingRemote) return profile;
    const found = localUsers.find((u) => u.id === localCurrentUserId);
    if (found && found.school_id === currentSchool?.id) return found;
    return usersInSchool[0] || localUsers[0] || null;
  }, [usingRemote, profile, localUsers, localCurrentUserId, currentSchool, usersInSchool]);

  const localStudents = useMemo(() => LocalStore.getStudents(), [tick]);
  const allStudents = usingRemote ? remote!.students : localStudents;
  const studentsInSchool = useMemo(
    () => allStudents.filter((s) => s.school_id === currentSchool?.id),
    [allStudents, currentSchool]
  );

  const localAttendance = useMemo(() => LocalStore.getAttendance(), [tick]);
  const localFees = useMemo(() => LocalStore.getFees(), [tick]);
  const localResults = useMemo(() => LocalStore.getResults(), [tick]);

  const allAttendance = usingRemote ? remote!.attendance : localAttendance;
  const allFees = usingRemote ? remote!.fees : localFees;
  const allResults = usingRemote ? remote!.results : localResults;

  // Diary, notices, chat, absence alerts and datesheets all live in Supabase (realtime)
  // once signed in; local demo store otherwise. See lib/*Store.ts.
  const allDiary = useMemo(
    () => (cloudSchoolId ? diaryState.entries : LocalStore.getDiary()),
    [tick, cloudSchoolId, diaryState.entries]
  );
  const allNotices = useMemo(
    () => (cloudSchoolId ? noticeState.items : LocalStore.getNotices()),
    [tick, cloudSchoolId, noticeState.items]
  );
  const allQueries = useMemo(
    () => (cloudSchoolId ? chatState.queries : LocalStore.getQueries()),
    [tick, cloudSchoolId, chatState.queries]
  );
  const allAlerts = useMemo(
    () => (cloudSchoolId ? alertState.items : LocalStore.getAlerts()),
    [tick, cloudSchoolId, alertState.items]
  );
  const allDatesheets = useMemo(
    () => (cloudSchoolId ? datesheetState.items : LocalStore.getDatesheets()),
    [tick, cloudSchoolId, datesheetState.items]
  );

  const diaryInSchool = useMemo(
    () => allDiary.filter((d) => d.school_id === currentSchool?.id),
    [allDiary, currentSchool]
  );

  const noticesInSchool = useMemo(
    () => allNotices.filter((n) => n.school_id === currentSchool?.id),
    [allNotices, currentSchool]
  );

  const queriesInSchool = useMemo(
    () => allQueries.filter((q) => q.school_id === currentSchool?.id),
    [allQueries, currentSchool]
  );

  const alertsInSchool = useMemo(
    () => allAlerts.filter((a) => a.school_id === currentSchool?.id),
    [allAlerts, currentSchool]
  );

  const datesheetsInSchool = useMemo(
    () => allDatesheets.filter((ds) => ds.school_id === currentSchool?.id),
    [allDatesheets, currentSchool]
  );

  // Set Current School (local demo mode only - signed-in users get their own school)
  const setCurrentSchoolId = useCallback(
    (id: string) => {
      if (usingRemote) return;
      LocalStore.setCurrentSchoolId(id);
    },
    [usingRemote]
  );

  // Set Current User (local demo mode only)
  const setCurrentUserId = useCallback(
    (id: string) => {
      if (usingRemote) return;
      LocalStore.setCurrentUserId(id);
    },
    [usingRemote]
  );

  // Switch role helper - disabled once real accounts are in play, because the
  // role comes from the signed-in account and is enforced by RLS.
  const switchRole = useCallback(
    (role: UserRole) => {
      if (usingRemote) return;
      const match = usersInSchool.find((u) => u.role === role);
      if (match) {
        LocalStore.setCurrentUserId(match.id);
      } else {
        const newUser: User = {
          id: `user-${role}-${Date.now()}`,
          school_id: currentSchool?.id || 'school-apex',
          full_name: `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
          role,
          email: `${role}@${currentSchool?.name.toLowerCase().replace(/\s+/g, '')}.edu`,
          created_at: new Date().toISOString(),
        };
        const updatedUsers = [...allUsers, newUser];
        localStorage.setItem('sms_users_v1', JSON.stringify(updatedUsers));
        LocalStore.setCurrentUserId(newUser.id);
      }
    },
    [usingRemote, usersInSchool, currentSchool, allUsers]
  );

  // Mark attendance for a batch of students & automatically trigger absence alerts
  const markAttendance = useCallback(
    (records: Array<{ student_id: string; status: AttendanceStatus; date: string }>) => {
      const allStudentsList = usingRemote ? remote!.students : LocalStore.getStudents();
      const absentees = records
        .filter((r) => r.status === 'absent')
        .map((r) => {
          const s = allStudentsList.find((st) => st.id === r.student_id);
          return s ? { ...s, date: r.date } : null;
        })
        .filter((s): s is Student & { date: string } => Boolean(s));

      if (cloudSchoolId) {
        // Group by date (normally all the same date, but keep it correct either way).
        const byDate = new Map<string, typeof absentees>();
        absentees.forEach((s) => {
          const list = byDate.get(s.date) ?? [];
          list.push(s);
          byDate.set(s.date, list);
        });
        byDate.forEach((list, date) => {
          void alertActions.sendForAbsentees(cloudSchoolId, list, date);
        });
      } else {
        const currentAlerts = LocalStore.getAlerts();
        const newAlerts = [...currentAlerts];
        absentees.forEach((studentObj) => {
          const alreadyAlerted = newAlerts.some(
            (al) => al.student_id === studentObj.id && al.date === studentObj.date
          );
          if (!alreadyAlerted) {
            newAlerts.unshift({
              id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              school_id: studentObj.school_id,
              student_id: studentObj.id,
              student_name: studentObj.name,
              roll_number: studentObj.roll_number,
              class_id: studentObj.class_id,
              section: studentObj.section,
              date: studentObj.date,
              parent_id: studentObj.parent_id || '',
              parent_name: studentObj.parent_name || 'Guardian',
              parent_email:
                studentObj.parent_email || `${studentObj.roll_number.toLowerCase()}@parent.edu`,
              sent_at: new Date().toISOString(),
              status: 'sent',
            });
          }
        });
        LocalStore.saveAlerts(newAlerts);
      }

      if (usingRemote) {
        const supabase = getSupabase();
        if (!supabase) return;
        supabase
          .from('attendance')
          .upsert(
            records.map((r) => ({
              student_id: r.student_id,
              date: r.date,
              status: r.status,
              marked_by: currentUser?.id,
            })),
            { onConflict: 'student_id,date' }
          )
          .then(({ error }) => {
            if (error) {
              setRemoteError(error.message);
              return;
            }
            refreshRemote();
          });
        return;
      }

      const currentList = LocalStore.getAttendance();
      const updated = [...currentList];
      records.forEach((rec) => {
        const index = updated.findIndex(
          (a) => a.student_id === rec.student_id && a.date === rec.date
        );
        if (index >= 0) {
          updated[index] = {
            ...updated[index],
            status: rec.status,
            marked_by: currentUser?.id || 'teacher',
          };
        } else {
          updated.push({
            id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            student_id: rec.student_id,
            date: rec.date,
            status: rec.status,
            marked_by: currentUser?.id || 'teacher',
            created_at: new Date().toISOString(),
          });
        }
      });
      LocalStore.saveAttendance(updated);
    },
    [usingRemote, remote, currentUser, refreshRemote, cloudSchoolId]
  );

  // Pay or update Fee
  const updateFeeStatus = useCallback(
    (feeId: string, status: 'paid' | 'pending') => {
      if (usingRemote) {
        const supabase = getSupabase();
        if (!supabase) return;
        supabase
          .from('fees')
          .update({
            status,
            receipt_number: status === 'paid' ? `REC-${Date.now().toString().slice(-6)}` : '',
          })
          .eq('id', feeId)
          .then(({ error }) => {
            if (error) {
              setRemoteError(error.message);
              return;
            }
            refreshRemote();
          });
        return;
      }

      const fees = LocalStore.getFees();
      const updated = fees.map((f) => {
        if (f.id === feeId) {
          return {
            ...f,
            status,
            updated_at: new Date().toISOString(),
            receipt_number:
              status === 'paid'
                ? f.receipt_number || `REC-${Date.now().toString().slice(-6)}`
                : '',
          };
        }
        return f;
      });
      LocalStore.saveFees(updated);
    },
    [usingRemote, refreshRemote]
  );

  const payFeeForStudent = useCallback(
    (studentId: string) => {
      if (usingRemote) {
        const supabase = getSupabase();
        if (!supabase) return;
        const receipt = `REC-${Date.now().toString().slice(-6)}`;
        const existing = remote!.fees.find((f) => f.student_id === studentId);
        const request = existing
          ? supabase
              .from('fees')
              .update({ status: 'paid', receipt_number: receipt })
              .eq('id', existing.id)
          : supabase.from('fees').insert({
              student_id: studentId,
              amount: 450,
              status: 'paid',
              due_date: new Date().toISOString().split('T')[0],
              term: 'Fall Term 2025',
              receipt_number: receipt,
            });
        request.then(({ error }) => {
          if (error) {
            setRemoteError(error.message);
            return;
          }
          refreshRemote();
        });
        return;
      }

      const fees = LocalStore.getFees();
      const existingIndex = fees.findIndex((f) => f.student_id === studentId);
      const updated = [...fees];

      if (existingIndex >= 0) {
        updated[existingIndex] = {
          ...updated[existingIndex],
          status: 'paid',
          updated_at: new Date().toISOString(),
          receipt_number: `REC-${Date.now().toString().slice(-6)}`,
        };
      } else {
        updated.push({
          id: `fee-${Date.now()}`,
          student_id: studentId,
          amount: 450,
          status: 'paid',
          due_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString(),
          term: 'Fall Term 2025',
          receipt_number: `REC-${Date.now().toString().slice(-6)}`,
        });
      }
      LocalStore.saveFees(updated);
    },
    [usingRemote, remote, refreshRemote]
  );

  const setStudentDeleted = useCallback(
    (studentId: string, isDeleted: boolean) => {
      if (usingRemote) {
        const supabase = getSupabase();
        if (!supabase) return;
        supabase
          .from('students')
          .update({ is_deleted: isDeleted })
          .eq('id', studentId)
          .then(({ error }) => {
            if (error) {
              setRemoteError(error.message);
              return;
            }
            refreshRemote();
          });
        return;
      }
      const students = LocalStore.getStudents();
      LocalStore.saveStudents(
        students.map((s) => (s.id === studentId ? { ...s, is_deleted: isDeleted } : s))
      );
    },
    [usingRemote, refreshRemote]
  );

  const softDeleteStudent = useCallback(
    (studentId: string) => setStudentDeleted(studentId, true),
    [setStudentDeleted]
  );

  const restoreStudent = useCallback(
    (studentId: string) => setStudentDeleted(studentId, false),
    [setStudentDeleted]
  );

  const permanentDeleteStudent = useCallback(
    (studentId: string) => {
      if (usingRemote) {
        const supabase = getSupabase();
        if (!supabase) return;
        supabase
          .from('students')
          .delete()
          .eq('id', studentId)
          .then(({ error }) => {
            if (error) {
              setRemoteError(error.message);
              return;
            }
            refreshRemote();
          });
        return;
      }
      const students = LocalStore.getStudents();
      LocalStore.saveStudents(students.filter((s) => s.id !== studentId));
    },
    [usingRemote, refreshRemote]
  );

  // Bulk Import Students from CSV
  const bulkImportStudents = useCallback(
    (
      newItems: Array<{
        roll_number: string;
        name: string;
        class_id: string;
        section: string;
        parent_email?: string;
        parent_name?: string;
      }>
    ) => {
      if (!currentSchool) return { count: 0 };

      if (usingRemote) {
        const supabase = getSupabase();
        if (!supabase) return { count: 0 };
        supabase
          .from('students')
          .insert(
            newItems.map((item) => ({
              school_id: currentSchool.id,
              roll_number: item.roll_number.trim(),
              name: item.name.trim(),
              class_id: item.class_id.trim() || 'Grade 10',
              section: (item.section || 'A').toUpperCase().trim(),
              // The parent's email is what links a parent account to their child
              // (done by a database trigger once that parent has confirmed their email).
              parent_email: item.parent_email?.trim() || null,
              parent_name: item.parent_name?.trim() || null,
            }))
          )
          .then(({ error }) => {
            if (error) {
              setRemoteError(error.message);
              return;
            }
            refreshRemote();
          });
        return { count: newItems.length };
      }

      const existing = LocalStore.getStudents();
      const currentFees = LocalStore.getFees();
      const currentResults = LocalStore.getResults();

      const createdStudents: Student[] = [];
      const newFees: Fee[] = [];
      const newResults: Result[] = [];

      newItems.forEach((item, idx) => {
        const studentId = `student-imp-${Date.now()}-${idx}`;
        createdStudents.push({
          id: studentId,
          school_id: currentSchool.id,
          roll_number: item.roll_number.trim(),
          name: item.name.trim(),
          class_id: item.class_id.trim() || 'Grade 10',
          section: (item.section || 'A').toUpperCase().trim(),
          parent_id: currentUser?.id || 'user-parent-1',
          parent_name: item.parent_name || 'Guardian',
          parent_email: item.parent_email || 'parent@example.com',
          is_deleted: false,
          created_at: new Date().toISOString(),
        });

        newFees.push({
          id: `fee-imp-${Date.now()}-${idx}`,
          student_id: studentId,
          amount: 450,
          status: idx % 2 === 0 ? 'paid' : 'pending',
          due_date: '2025-10-01',
          updated_at: new Date().toISOString(),
          term: 'Fall Term 2025',
          receipt_number: idx % 2 === 0 ? `REC-${Date.now().toString().slice(-6)}` : '',
        });

        newResults.push({
          id: `res-imp-${Date.now()}-${idx}`,
          student_id: studentId,
          term: 'mid_term',
          marks_json: [
            { subject: 'Mathematics', max_marks: 100, obtained_marks: 85 + (idx % 12), grade: 'A', remarks: 'Good work' },
            { subject: 'Physics', max_marks: 100, obtained_marks: 80 + (idx % 15), grade: 'A', remarks: 'Sound concept' },
            { subject: 'English', max_marks: 100, obtained_marks: 88 + (idx % 10), grade: 'A', remarks: 'Good essays' },
            { subject: 'Chemistry', max_marks: 100, obtained_marks: 82 + (idx % 12), grade: 'A', remarks: 'Attentive in labs' },
          ],
          total_marks: 340,
          grade: 'A',
          percentage: 85,
          class_rank: idx + 1,
          attendance_percentage: 95,
          conduct: 'Good',
          created_at: new Date().toISOString(),
        });
      });

      LocalStore.saveStudents([...existing, ...createdStudents]);
      LocalStore.saveFees([...currentFees, ...newFees]);
      LocalStore.saveResults([...currentResults, ...newResults]);

      return { count: createdStudents.length };
    },
    [usingRemote, currentSchool, currentUser, refreshRemote]
  );

  // Update School Branding
  const updateSchoolBranding = useCallback(
    (schoolId: string, updates: Partial<School>) => {
      if (usingRemote) {
        const supabase = getSupabase();
        if (!supabase) return;
        supabase
          .from('schools')
          .update(updates)
          .eq('id', schoolId)
          .then(({ error }) => {
            if (error) {
              setRemoteError(error.message);
              return;
            }
            refreshRemote();
          });
        return;
      }
      const all = LocalStore.getSchools();
      LocalStore.saveSchools(all.map((s) => (s.id === schoolId ? { ...s, ...updates } : s)));
    },
    [usingRemote, refreshRemote]
  );

  const resetToDefaults = useCallback(() => {
    LocalStore.resetDefaults();
  }, []);

  // ---------------------------------------------------------------------------
  // Diary (cloud + realtime when signed in, local demo otherwise)
  // ---------------------------------------------------------------------------
  const addDiaryEntry = useCallback(
    (
      entry: Omit<
        DiaryEntry,
        'id' | 'school_id' | 'teacher_id' | 'teacher_name' | 'created_at' | 'read_by_parents'
      >
    ) => {
      if (cloudSchoolId) {
        return diaryActions.addEntry(entry, {
          school_id: cloudSchoolId,
          teacher_id: currentUser?.id ?? '',
          teacher_name: currentUser?.full_name || 'Class Teacher',
        });
      }

      const all = LocalStore.getDiary();
      const newEntry: DiaryEntry = {
        ...entry,
        id: `diary-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        school_id: currentSchool?.id || 'school-apex',
        teacher_id: currentUser?.id || 'user-teacher-apex',
        teacher_name: currentUser?.full_name || 'Class Teacher',
        read_by_parents: [],
        created_at: new Date().toISOString(),
      };
      LocalStore.saveDiary([newEntry, ...all]);
      return newEntry;
    },
    [currentSchool, currentUser, cloudSchoolId]
  );

  const markDiaryAsRead = useCallback(
    (diaryId: string, studentId: string, studentName: string) => {
      if (cloudSchoolId) {
        if (!currentUser) return;
        diaryActions.markRead(diaryId, {
          school_id: cloudSchoolId,
          parent_id: currentUser.id,
          parent_name: currentUser.full_name,
          student_id: studentId,
          student_name: studentName,
        });
        return;
      }

      const all = LocalStore.getDiary();
      const updated = all.map((d) => {
        if (d.id === diaryId) {
          const alreadyRead = d.read_by_parents.some(
            (r) => r.parent_id === currentUser?.id && r.student_id === studentId
          );
          if (!alreadyRead && currentUser) {
            return {
              ...d,
              read_by_parents: [
                ...d.read_by_parents,
                {
                  parent_id: currentUser.id,
                  parent_name: currentUser.full_name,
                  student_id: studentId,
                  student_name: studentName,
                  read_at: new Date().toISOString(),
                },
              ],
            };
          }
        }
        return d;
      });
      LocalStore.saveDiary(updated);
    },
    [currentUser, cloudSchoolId]
  );

  const deleteDiaryEntry = useCallback(
    (diaryId: string) => {
      if (cloudSchoolId) {
        diaryActions.deleteEntry(diaryId);
        return;
      }
      const all = LocalStore.getDiary();
      LocalStore.saveDiary(all.filter((d) => d.id !== diaryId));
    },
    [cloudSchoolId]
  );

  // ---------------------------------------------------------------------------
  // Notices (cloud + realtime when signed in, local demo otherwise)
  // ---------------------------------------------------------------------------
  const addNotice = useCallback(
    (notice: Omit<Notice, 'id' | 'school_id' | 'author_name' | 'author_role' | 'created_at'>) => {
      if (cloudSchoolId) {
        void noticeActions.add(notice, {
          school_id: cloudSchoolId,
          author_id: currentUser?.id ?? '',
          author_name: currentUser?.full_name || 'Administration',
          author_role: currentUser?.role === 'admin' ? 'Principal / Admin' : 'Faculty Member',
        });
        return;
      }

      const all = LocalStore.getNotices();
      const newNotice: Notice = {
        ...notice,
        id: `notice-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        school_id: currentSchool?.id || 'school-apex',
        author_name: currentUser?.full_name || 'Administration',
        author_role: currentUser?.role === 'admin' ? 'Principal / Admin' : 'Faculty Member',
        created_at: new Date().toISOString(),
      };
      LocalStore.saveNotices([newNotice, ...all]);
      return newNotice;
    },
    [currentSchool, currentUser, cloudSchoolId]
  );

  const deleteNotice = useCallback(
    (noticeId: string) => {
      if (cloudSchoolId) {
        void noticeActions.remove(noticeId);
        return;
      }
      const all = LocalStore.getNotices();
      LocalStore.saveNotices(all.filter((n) => n.id !== noticeId));
    },
    [cloudSchoolId]
  );

  // ---------------------------------------------------------------------------
  // Parent-teacher chat (cloud + realtime when signed in, local demo otherwise)
  // ---------------------------------------------------------------------------
  const createQuery = useCallback(
    (data: {
      student_id: string;
      student_name: string;
      student_class: string;
      subject: string;
      category: CommunicationQuery['category'];
      initial_message: string;
    }) => {
      if (cloudSchoolId && currentUser) {
        void chatActions.createQuery(data, {
          school_id: cloudSchoolId,
          parent_id: currentUser.id,
          parent_name: currentUser.full_name,
        });
        return;
      }

      const all = LocalStore.getQueries();
      const newQuery: CommunicationQuery = {
        id: `query-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        school_id: currentSchool?.id || 'school-apex',
        student_id: data.student_id,
        student_name: data.student_name,
        student_class: data.student_class,
        parent_id: currentUser?.id || 'user-parent-1',
        parent_name: currentUser?.full_name || 'Parent',
        teacher_name: 'Class Coordinator',
        subject: data.subject,
        status: 'open',
        category: data.category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        messages: [
          {
            id: `msg-${Date.now()}`,
            sender_id: currentUser?.id || 'user-parent-1',
            sender_name: currentUser?.full_name || 'Parent',
            sender_role: currentUser?.role || 'parent',
            text: data.initial_message,
            sent_at: new Date().toISOString(),
          },
        ],
      };
      LocalStore.saveQueries([newQuery, ...all]);
      return newQuery;
    },
    [currentSchool, currentUser, cloudSchoolId]
  );

  const replyToQuery = useCallback(
    (queryId: string, text: string) => {
      if (cloudSchoolId && currentUser) {
        void chatActions.reply(queryId, text, {
          school_id: cloudSchoolId,
          sender_id: currentUser.id,
          sender_name: currentUser.full_name,
          sender_role: currentUser.role,
        });
        return;
      }

      const all = LocalStore.getQueries();
      const updated = all.map((q) => {
        if (q.id === queryId) {
          return {
            ...q,
            updated_at: new Date().toISOString(),
            messages: [
              ...q.messages,
              {
                id: `msg-${Date.now()}`,
                sender_id: currentUser?.id || 'user',
                sender_name: currentUser?.full_name || 'User',
                sender_role: currentUser?.role || 'teacher',
                text,
                sent_at: new Date().toISOString(),
              },
            ],
          };
        }
        return q;
      });
      LocalStore.saveQueries(updated);
    },
    [currentUser, cloudSchoolId]
  );

  const updateQueryStatus = useCallback(
    (queryId: string, status: 'open' | 'in_progress' | 'resolved') => {
      if (cloudSchoolId) {
        void chatActions.updateStatus(queryId, status);
        return;
      }
      const all = LocalStore.getQueries();
      LocalStore.saveQueries(
        all.map((q) =>
          q.id === queryId ? { ...q, status, updated_at: new Date().toISOString() } : q
        )
      );
    },
    [cloudSchoolId]
  );

  // ---------------------------------------------------------------------------
  // Absence alerts (created by markAttendance above; this is just acknowledging one)
  // ---------------------------------------------------------------------------
  const acknowledgeAlert = useCallback(
    (alertId: string) => {
      if (cloudSchoolId) {
        void alertActions.acknowledge(alertId);
        return;
      }
      const all = LocalStore.getAlerts();
      LocalStore.saveAlerts(
        all.map((a) =>
          a.id === alertId
            ? { ...a, status: 'acknowledged' as const, acknowledged_at: new Date().toISOString() }
            : a
        )
      );
    },
    [cloudSchoolId]
  );

  // ---------------------------------------------------------------------------
  // Datesheets (cloud + realtime when signed in, local demo otherwise)
  // ---------------------------------------------------------------------------
  const saveDatesheet = useCallback(
    (datesheet: Datesheet) => {
      if (cloudSchoolId) {
        void datesheetActions.save(cloudSchoolId, datesheet);
        return;
      }
      const all = LocalStore.getDatesheets();
      const index = all.findIndex((d) => d.id === datesheet.id);
      const updated: Datesheet[] =
        index >= 0 ? all.map((d) => (d.id === datesheet.id ? datesheet : d)) : [datesheet, ...all];
      LocalStore.saveDatesheets(updated);
    },
    [cloudSchoolId]
  );

  return {
    schools,
    currentSchool,
    currentUser,
    usersInSchool,
    students: studentsInSchool,
    allStudents,
    attendance: allAttendance,
    fees: allFees,
    results: allResults,
    diary: diaryInSchool,
    allDiary,
    notices: noticesInSchool,
    allNotices,
    queries: queriesInSchool,
    allQueries,
    alerts: alertsInSchool,
    datesheets: datesheetsInSchool,
    setCurrentSchoolId,
    setCurrentUserId,
    switchRole,
    markAttendance,
    updateFeeStatus,
    payFeeForStudent,
    softDeleteStudent,
    restoreStudent,
    permanentDeleteStudent,
    bulkImportStudents,
    updateSchoolBranding,
    resetToDefaults,
    addDiaryEntry,
    markDiaryAsRead,
    deleteDiaryEntry,
    addNotice,
    deleteNotice,
    createQuery,
    replyToQuery,
    updateQueryStatus,
    acknowledgeAlert,
    saveDatesheet,
    isSupabaseActive,
    isLiveData: usingRemote,
    remoteError,
    refreshRemote,
    isLoading,
    // Realtime connection status, in case a screen wants to show it.
    diaryLive: diaryState.live,
    diaryError: diaryState.error,
    noticesLive: noticeState.live,
    chatLive: chatState.live,
    alertsLive: alertState.live,
    datesheetsLive: datesheetState.live,
  };
}
