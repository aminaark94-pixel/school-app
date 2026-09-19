export type UserRole = 'admin' | 'teacher' | 'parent';

export interface School {
  id: string;
  name: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  created_at: string;
  motto?: string;
  address?: string;
  phone?: string;
}

export interface User {
  id: string;
  school_id: string;
  full_name: string;
  role: UserRole;
  email: string;
  created_at: string;
  avatar_url?: string;
}

export interface Student {
  id: string;
  school_id: string;
  roll_number: string;
  name: string;
  class_id: string; // e.g. "Grade 10", "Grade 9"
  section: string;  // e.g. "A", "B"
  parent_id: string; // references User.id (parent)
  is_deleted?: boolean;
  created_at: string;
  parent_name?: string;
  parent_email?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface Attendance {
  id: string;
  student_id: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  marked_by: string; // User.id (teacher/admin)
  created_at?: string;
}

export type FeeStatus = 'paid' | 'pending';

export interface Fee {
  id: string;
  student_id: string;
  amount: number;
  status: FeeStatus;
  due_date: string;
  updated_at: string;
  term?: string;
  receipt_number?: string;
}

export interface SubjectMarks {
  subject: string;
  max_marks: number;
  obtained_marks: number;
  grade: string;
  remarks?: string;
}

export type ExamTerm = 'mid_term' | 'final';

export interface Result {
  id: string;
  student_id: string;
  term: ExamTerm;
  marks_json: SubjectMarks[];
  total_marks: number;
  grade: string;
  percentage?: number;
  class_rank?: number;
  attendance_percentage?: number;
  conduct?: string;
  created_at: string;
}

export interface AttendanceRosterItem {
  student: Student;
  status: AttendanceStatus;
}

export interface StudentFullProfile {
  student: Student;
  fee?: Fee;
  results: Result[];
  attendanceSummary: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    percentage: number;
  };
}

// 1. Digital Student Diary & Homework Feed
export interface DiaryEntry {
  id: string;
  school_id: string;
  class_id: string;
  section: string; // 'All' or specific like 'A', 'B'
  subject: string;
  date: string; // YYYY-MM-DD
  classwork: string;
  homework: string;
  due_date?: string;
  teacher_id: string;
  teacher_name: string;
  attachments?: {
    id: string;
    type: 'image' | 'document';
    url: string;
    caption: string;
  }[];
  read_by_parents: {
    parent_id: string;
    parent_name: string;
    student_id: string;
    student_name: string;
    read_at: string;
  }[];
  created_at: string;
}

// 2. Direct Parent-Teacher Communication & Digital Notices
export type NoticeCategory = 'general' | 'event' | 'holiday' | 'fee_reminder' | 'emergency';

export interface Notice {
  id: string;
  school_id: string;
  title: string;
  content: string;
  category: NoticeCategory;
  target_audience: 'all' | 'class';
  target_class?: string;
  priority: 'normal' | 'urgent';
  publish_date: string;
  expiry_date?: string;
  author_name: string;
  author_role: string;
  attachments?: string[];
  created_at: string;
}

// Structured Parent-Teacher Queries (with specific office hour window)
export interface CommunicationQuery {
  id: string;
  school_id: string;
  student_id: string;
  student_name: string;
  student_class: string;
  parent_id: string;
  parent_name: string;
  teacher_id?: string;
  teacher_name?: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved';
  category: 'academic' | 'homework' | 'behavior' | 'attendance' | 'general';
  created_at: string;
  updated_at: string;
  messages: {
    id: string;
    sender_id: string;
    sender_name: string;
    sender_role: UserRole;
    text: string;
    sent_at: string;
  }[];
}

// 3. Automated Absence Alerts
export interface AbsenceAlert {
  id: string;
  school_id: string;
  student_id: string;
  student_name: string;
  roll_number: string;
  class_id: string;
  section: string;
  date: string;
  parent_id: string;
  parent_name: string;
  parent_email: string;
  sent_at: string;
  status: 'sent' | 'delivered' | 'acknowledged';
  acknowledged_at?: string;
}

// 4. Exams, Datesheets & Syllabus
export interface ExamScheduleItem {
  id: string;
  date: string;
  day: string;
  time: string; // e.g., '08:30 AM - 11:30 AM'
  subject: string;
  syllabus: string;
  room_no?: string;
}

export interface Datesheet {
  id: string;
  school_id: string;
  title: string; // e.g., "Mid-Term Examinations 2026"
  class_id: string;
  term: ExamTerm;
  academic_year: string;
  instructions: string[];
  schedule: ExamScheduleItem[];
  created_at: string;
}
