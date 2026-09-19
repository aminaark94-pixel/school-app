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
  AbsenceAlert,
  Datesheet,
} from '../types';
import { LocalStore } from '../lib/storage';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

export function useSchoolData() {
  const [, setTick] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const isSupabaseActive = isSupabaseConfigured();

  useEffect(() => {
    const unsubscribe = LocalStore.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  const schools = useMemo(() => LocalStore.getSchools(), [setTick]);
  const currentSchoolId = LocalStore.getCurrentSchoolId();
  const currentSchool = useMemo(
    () => schools.find((s) => s.id === currentSchoolId) || schools[0] || null,
    [schools, currentSchoolId]
  );

  const allUsers = useMemo(() => LocalStore.getUsers(), [setTick]);
  const usersInSchool = useMemo(
    () => allUsers.filter((u) => u.school_id === currentSchool?.id),
    [allUsers, currentSchool]
  );

  const currentUserId = LocalStore.getCurrentUserId();
  const currentUser = useMemo(() => {
    const found = allUsers.find((u) => u.id === currentUserId);
    if (found && found.school_id === currentSchool?.id) return found;
    return usersInSchool[0] || allUsers[0] || null;
  }, [allUsers, currentUserId, currentSchool, usersInSchool]);

  const allStudents = useMemo(() => LocalStore.getStudents(), [setTick]);
  const studentsInSchool = useMemo(
    () => allStudents.filter((s) => s.school_id === currentSchool?.id),
    [allStudents, currentSchool]
  );

  const allAttendance = useMemo(() => LocalStore.getAttendance(), [setTick]);
  const allFees = useMemo(() => LocalStore.getFees(), [setTick]);
  const allResults = useMemo(() => LocalStore.getResults(), [setTick]);
  const allDiary = useMemo(() => LocalStore.getDiary(), [setTick]);
  const allNotices = useMemo(() => LocalStore.getNotices(), [setTick]);
  const allQueries = useMemo(() => LocalStore.getQueries(), [setTick]);
  const allAlerts = useMemo(() => LocalStore.getAlerts(), [setTick]);
  const allDatesheets = useMemo(() => LocalStore.getDatesheets(), [setTick]);

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

  // Set Current School
  const setCurrentSchoolId = useCallback((id: string) => {
    LocalStore.setCurrentSchoolId(id);
  }, []);

  // Set Current User
  const setCurrentUserId = useCallback((id: string) => {
    LocalStore.setCurrentUserId(id);
  }, []);

  // Switch role helper
  const switchRole = useCallback(
    (role: UserRole) => {
      const match = usersInSchool.find((u) => u.role === role);
      if (match) {
        LocalStore.setCurrentUserId(match.id);
      } else {
        // Create user for current school with that role if none exists
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
    [usersInSchool, currentSchool, allUsers]
  );

  // Mark attendance for batch of students & automatically trigger absence alerts
  const markAttendance = useCallback(
    (records: Array<{ student_id: string; status: AttendanceStatus; date: string }>) => {
      const currentList = LocalStore.getAttendance();
      const updated = [...currentList];
      const allStudentsList = LocalStore.getStudents();
      const currentAlerts = LocalStore.getAlerts();
      const newAlerts = [...currentAlerts];

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

        // Automatic Absence Alert Generation
        if (rec.status === 'absent') {
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
              parent_email: studentObj.parent_email || `${studentObj.roll_number.toLowerCase()}@parent.edu`,
              sent_at: new Date().toISOString(),
              status: 'sent',
            });
          }
        }
      });

      LocalStore.saveAttendance(updated);
      LocalStore.saveAlerts(newAlerts);

      // Also persist to Supabase if configured
      const supabase = getSupabase();
      if (supabase) {
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
            if (error) console.error('Supabase attendance sync error:', error);
          });
      }
    },
    [currentUser]
  );

  // Pay or update Fee
  const updateFeeStatus = useCallback((feeId: string, status: 'paid' | 'pending') => {
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

    const supabase = getSupabase();
    if (supabase) {
      supabase.from('fees').update({ status }).eq('id', feeId).then();
    }
  }, []);

  const payFeeForStudent = useCallback((studentId: string) => {
    const fees = LocalStore.getFees();
    const existingIndex = fees.findIndex((f) => f.student_id === studentId);
    let updated = [...fees];

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

    const supabase = getSupabase();
    if (supabase) {
      supabase.from('fees').update({ status: 'paid' }).eq('student_id', studentId).then();
    }
  }, []);

  // Soft Delete Student
  const softDeleteStudent = useCallback((studentId: string) => {
    const students = LocalStore.getStudents();
    const updated = students.map((s) =>
      s.id === studentId ? { ...s, is_deleted: true } : s
    );
    LocalStore.saveStudents(updated);

    const supabase = getSupabase();
    if (supabase) {
      supabase.from('students').update({ is_deleted: true }).eq('id', studentId).then();
    }
  }, []);

  // Restore Student
  const restoreStudent = useCallback((studentId: string) => {
    const students = LocalStore.getStudents();
    const updated = students.map((s) =>
      s.id === studentId ? { ...s, is_deleted: false } : s
    );
    LocalStore.saveStudents(updated);

    const supabase = getSupabase();
    if (supabase) {
      supabase.from('students').update({ is_deleted: false }).eq('id', studentId).then();
    }
  }, []);

  // Permanent Delete Student
  const permanentDeleteStudent = useCallback((studentId: string) => {
    const students = LocalStore.getStudents();
    const updated = students.filter((s) => s.id !== studentId);
    LocalStore.saveStudents(updated);

    const supabase = getSupabase();
    if (supabase) {
      supabase.from('students').delete().eq('id', studentId).then();
    }
  }, []);

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
      const existing = LocalStore.getStudents();
      const currentFees = LocalStore.getFees();
      const currentResults = LocalStore.getResults();

      const createdStudents: Student[] = [];
      const newFees: Fee[] = [];
      const newResults: Result[] = [];

      newItems.forEach((item, idx) => {
        const studentId = `student-imp-${Date.now()}-${idx}`;
        const student: Student = {
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
        };
        createdStudents.push(student);

        // Assign sample fee
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

        // Assign sample academic result
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

      // Attempt Supabase insert if active
      const supabase = getSupabase();
      if (supabase) {
        supabase
          .from('students')
          .insert(
            createdStudents.map((s) => ({
              school_id: s.school_id,
              roll_number: s.roll_number,
              name: s.name,
              class_id: s.class_id,
              section: s.section,
            }))
          )
          .then(({ error }) => {
            if (error) console.warn('Supabase bulk insert warning:', error);
          });
      }

      return { count: createdStudents.length };
    },
    [currentSchool, currentUser]
  );

  // Update School Branding
  const updateSchoolBranding = useCallback(
    (schoolId: string, updates: Partial<School>) => {
      const all = LocalStore.getSchools();
      const updated = all.map((s) => (s.id === schoolId ? { ...s, ...updates } : s));
      LocalStore.saveSchools(updated);

      const supabase = getSupabase();
      if (supabase) {
        supabase.from('schools').update(updates).eq('id', schoolId).then();
      }
    },
    []
  );

  const resetToDefaults = useCallback(() => {
    LocalStore.resetDefaults();
  }, []);

  // DIARY METHODS
  const addDiaryEntry = useCallback(
    (entry: Omit<DiaryEntry, 'id' | 'school_id' | 'teacher_id' | 'teacher_name' | 'created_at' | 'read_by_parents'>) => {
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

  // NOTICE METHODS
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

  // QUERY / COMMUNICATION METHODS
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

  const updateQueryStatus = useCallback((queryId: string, status: 'open' | 'in_progress' | 'resolved') => {
    const all = LocalStore.getQueries();
    const updated = all.map((q) => (q.id === queryId ? { ...q, status, updated_at: new Date().toISOString() } : q));
    LocalStore.saveQueries(updated);
  }, []);

  // ABSENCE ALERT METHODS
  const acknowledgeAlert = useCallback((alertId: string) => {
    const all = LocalStore.getAlerts();
    const updated = all.map((a) =>
      a.id === alertId ? { ...a, status: 'acknowledged' as const, acknowledged_at: new Date().toISOString() } : a
    );
    LocalStore.saveAlerts(updated);
  }, []);

  // DATESHEET METHODS
  const saveDatesheet = useCallback((datesheet: Datesheet) => {
    const all = LocalStore.getDatesheets();
    const index = all.findIndex((d) => d.id === datesheet.id);
    let updated: Datesheet[];
    if (index >= 0) {
      updated = all.map((d) => (d.id === datesheet.id ? datesheet : d));
    } else {
      updated = [datesheet, ...all];
    }
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
    isLoading,
  };
}
