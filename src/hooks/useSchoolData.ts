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

  // These five have no tables in the schema yet, so they stay local for now.
  const allDiary = useMemo(() => LocalStore.getDiary(), [tick]);
  const allNotices = useMemo(() => LocalStore.getNotices(), [tick]);
  const allQueries = useMemo(() => LocalStore.getQueries(), [tick]);
  const allAlerts = useMemo(() => LocalStore.getAlerts(), [tick]);
  const allDatesheets = useMemo(() => LocalStore.getDatesheets(), [tick]);

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
      // Absence alerts have no table yet, so they are generated locally in both modes.
      const allStudentsList = usingRemote ? remote!.students : LocalStore.getStudents();
      const currentAlerts = LocalStore.getAlerts();
      const newAlerts = [...currentAlerts];

      records.forEach((rec) => {
        if (rec.status !== 'absent') return;
        const studentObj = allStudentsList.find((s) => s.id === rec.student_id);
        const alreadyAlerted = newAlerts.some(
          (al) => al.student_id === rec.student_id && al.date === rec.date
        );
        if (studentObj && !alreadyAlerted) {
          newAlerts.unshift({
            id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            school_id: studentObj.school_id,
            student_id: studentObj.id,
            student_name: studentObj.name,
            roll_number: studentObj.roll_number,
            class_id: studentObj.class_id,
            section: studentObj.section,
            date: rec.date,
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
    [usingRemote, remote, currentUser, refreshRemote]
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
    async (
      newItems: Array<{
        roll_number: string;
        name: string;
        class_id: string;
        section: string;
        parent_email?: string;
        parent_name?: string;
      }>
    ): Promise<{ count: number; unmatchedParentEmails: string[] }> => {
      if (!currentSchool) return { count: 0, unmatchedParentEmails: [] };

      if (usingRemote) {
        const supabase = getSupabase();
        if (!supabase) return { count: 0, unmatchedParentEmails: [] };

        // The `students` table only stores parent_id (a real users.id FK) -
        // there is no parent_email column on it. So before inserting we have
        // to resolve each row's parent_email to an existing parent account
        // in this school. A parent has to have signed up first; if nobody
        // with that email exists yet, the student is still created but with
        // no parent_id, and we report the email back as unmatched so the
        // admin knows to invite that parent (or use "Link Parent" later).
        const { data: parentRows, error: parentErr } = await supabase
          .from('users')
          .select('id, email')
          .eq('school_id', currentSchool.id)
          .eq('role', 'parent');

        if (parentErr) {
          setRemoteError(parentErr.message);
          return { count: 0, unmatchedParentEmails: [] };
        }

        const parentIdByEmail = new Map<string, string>();
        (parentRows ?? []).forEach((u) => {
          if (u.email) parentIdByEmail.set(u.email.trim().toLowerCase(), u.id);
        });

        const unmatchedParentEmails: string[] = [];
        const rowsToInsert = newItems.map((item) => {
          const email = (item.parent_email || '').trim().toLowerCase();
          const parentId = email ? parentIdByEmail.get(email) : undefined;
          if (email && !parentId) unmatchedParentEmails.push(item.parent_email!.trim());
          return {
            school_id: currentSchool.id,
            roll_number: item.roll_number.trim(),
            name: item.name.trim(),
            class_id: item.class_id.trim() || 'Grade 10',
            section: (item.section || 'A').toUpperCase().trim(),
            parent_id: parentId ?? null,
          };
        });

        const { error } = await supabase.from('students').insert(rowsToInsert);
        if (error) {
          setRemoteError(error.message);
          return { count: 0, unmatchedParentEmails: [] };
        }

        await refreshRemote();
        return { count: newItems.length, unmatchedParentEmails };
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

      return { count: createdStudents.length, unmatchedParentEmails: [] };
    },
    [usingRemote, currentSchool, currentUser, refreshRemote]
  );

  // Link (or re-link) a student to an existing parent account by email.
  // Fixes rows that were imported before a parent had signed up, or that
  // were imported with an unmatched parent_email.
  const linkParentToStudent = useCallback(
    async (studentId: string, parentEmail: string): Promise<{ success: boolean; error?: string }> => {
      const email = parentEmail.trim().toLowerCase();
      if (!email) return { success: false, error: 'Enter a parent email.' };
      if (!currentSchool) return { success: false, error: 'No active school.' };

      if (usingRemote) {
        const supabase = getSupabase();
        if (!supabase) return { success: false, error: 'Not connected to Supabase.' };

        const { data: parentRows, error: findErr } = await supabase
          .from('users')
          .select('id, email')
          .eq('school_id', currentSchool.id)
          .eq('role', 'parent');

        if (findErr) return { success: false, error: findErr.message };

        const match = (parentRows ?? []).find((u) => (u.email || '').trim().toLowerCase() === email);
        if (!match) {
          return {
            success: false,
            error: 'No parent account with that email yet in this school. Ask them to sign up first.',
          };
        }

        const { error: updateErr } = await supabase
          .from('students')
          .update({ parent_id: match.id })
          .eq('id', studentId);

        if (updateErr) return { success: false, error: updateErr.message };
        await refreshRemote();
        return { success: true };
      }

      const localParent = LocalStore.getUsers().find(
        (u) => u.role === 'parent' && u.email.trim().toLowerCase() === email
      );
      if (!localParent) {
        return { success: false, error: 'No parent account with that email yet.' };
      }
      const students = LocalStore.getStudents();
      LocalStore.saveStudents(
        students.map((s) =>
          s.id === studentId
            ? { ...s, parent_id: localParent.id, parent_email: localParent.email, parent_name: localParent.full_name }
            : s
        )
      );
      return { success: true };
    },
    [usingRemote, currentSchool, refreshRemote]
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
  // Diary / notices / queries / alerts / datesheets - local only for now
  // ---------------------------------------------------------------------------
  const addDiaryEntry = useCallback(
    (
      entry: Omit<
        DiaryEntry,
        'id' | 'school_id' | 'teacher_id' | 'teacher_name' | 'created_at' | 'read_by_parents'
      >
    ) => {
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
    [currentSchool, currentUser]
  );

  const markDiaryAsRead = useCallback(
    (diaryId: string, studentId: string, studentName: string) => {
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
    [currentUser]
  );

  const deleteDiaryEntry = useCallback((diaryId: string) => {
    const all = LocalStore.getDiary();
    LocalStore.saveDiary(all.filter((d) => d.id !== diaryId));
  }, []);

  const addNotice = useCallback(
    (notice: Omit<Notice, 'id' | 'school_id' | 'author_name' | 'author_role' | 'created_at'>) => {
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
    [currentSchool, currentUser]
  );

  const deleteNotice = useCallback((noticeId: string) => {
    const all = LocalStore.getNotices();
    LocalStore.saveNotices(all.filter((n) => n.id !== noticeId));
  }, []);

  const createQuery = useCallback(
    (data: {
      student_id: string;
      student_name: string;
      student_class: string;
      subject: string;
      category: CommunicationQuery['category'];
      initial_message: string;
    }) => {
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
    [currentSchool, currentUser]
  );

  const replyToQuery = useCallback(
    (queryId: string, text: string) => {
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
    [currentUser]
  );

  const updateQueryStatus = useCallback(
    (queryId: string, status: 'open' | 'in_progress' | 'resolved') => {
      const all = LocalStore.getQueries();
      LocalStore.saveQueries(
        all.map((q) =>
          q.id === queryId ? { ...q, status, updated_at: new Date().toISOString() } : q
        )
      );
    },
    []
  );

  const acknowledgeAlert = useCallback((alertId: string) => {
    const all = LocalStore.getAlerts();
    LocalStore.saveAlerts(
      all.map((a) =>
        a.id === alertId
          ? { ...a, status: 'acknowledged' as const, acknowledged_at: new Date().toISOString() }
          : a
      )
    );
  }, []);

  const saveDatesheet = useCallback((datesheet: Datesheet) => {
    const all = LocalStore.getDatesheets();
    const index = all.findIndex((d) => d.id === datesheet.id);
    const updated: Datesheet[] =
      index >= 0 ? all.map((d) => (d.id === datesheet.id ? datesheet : d)) : [datesheet, ...all];
    LocalStore.saveDatesheets(updated);
  }, []);

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
    linkParentToStudent,
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
  };
}
