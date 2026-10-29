export type UserRole = 'owner' | 'admin' | 'teacher' | 'parent';

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
  /** Which full UI look this school uses. Owner-only — schools never change this themselves. */
  skin?: string;
}

export interface User {
  id: string;
  /** null for the platform Owner, who is not scoped to any single school. */
  school_id: string | null;
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
  parent_phone?: string;
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
    fileSize?: string;
    fileName?: string;
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

export type TicketPriority = 'normal' | 'urgent' | 'critical';
export type TicketCategory =
  | 'academic'
  | 'homework'
  | 'behavior'
  | 'discipline'
  | 'attendance'
  | 'fee'
  | 'transport'
  | 'safety_bullying'
  | 'general';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

// Structured Parent-Teacher Complaints & Support Tickets Desk
export interface CommunicationQuery {
  id: string;
  ticket_number?: string; // e.g. "TKT-2026-101"
  school_id: string;
  student_id: string;
  student_name: string;
  student_class: string;
  parent_id: string;
  parent_name: string;
  parent_phone?: string;
  teacher_id?: string;
  teacher_name?: string;
  raised_by_role?: UserRole;
  raised_by_name?: string;
  target_audience?: 'teacher' | 'admin' | 'parent';
  subject: string;
  status: TicketStatus;
  category: TicketCategory;
  priority?: TicketPriority;
  admin_notified?: boolean;
  teacher_notified?: boolean;
  parent_notified?: boolean;
  resolved_at?: string;
  resolved_by?: string;
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

// 5. Direct WhatsApp & Android SMS Broadcast Gateway
export type NotificationChannel = 'whatsapp' | 'sms' | 'both';
export type NotificationDeliveryStatus = 'queued' | 'sending' | 'sent' | 'failed';

export interface NotificationLog {
  id: string;
  school_id: string;
  recipient_name: string;
  student_name: string;
  phone_number: string;
  channel: NotificationChannel;
  message: string;
  status: NotificationDeliveryStatus;
  sent_at?: string;
  error?: string;
  retry_count: number;
}

// 6. Kids Monthly Development & Character Progress
export type SkillLevel = 1 | 2 | 3 | 4 | 5; // 1: Developing, 2: Satisfactory, 3: Good, 4: Very Good, 5: Outstanding

export interface SkillEvaluation {
  score: SkillLevel; // 1-5
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  status: string; // e.g. "Outstanding", "Proficient", "Good", "Needs Support"
  notes?: string;
}

export interface MonthlyKidsProgress {
  id: string;
  school_id: string;
  student_id: string;
  student_name: string;
  class_id: string;
  section: string;
  month: string; // e.g. "October 2026"
  year: number;
  language: SkillEvaluation;
  discipline: SkillEvaluation;
  writing: SkillEvaluation;
  reading: SkillEvaluation;
  cleaning: SkillEvaluation; // Hygiene, personal cleanliness, desk & uniform
  teacher_id: string;
  teacher_name: string;
  teacher_remarks: string;
  badges: string[]; // e.g. ["Star of the Month", "Neat Desk Champion", "Fluent Reader"]
  overall_score: number; // e.g. 94%
  overall_grade: string; // e.g. "A+"
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Parents Report Card & App Usage Analytics (Admin & Teachers Only)
// ---------------------------------------------------------------------------
export type ParentVigilanceLevel = 'proactive' | 'cooperative' | 'passive' | 'neglectful';

export interface ParentAppUsageMetrics {
  last_active_at: string; // ISO date string e.g. "2026-10-29T10:15:00Z"
  days_since_last_active: number; // e.g. 0 (today) or 38 (dormant)
  logins_last_30_days: number; // e.g. 28 times
  usage_frequency: 'daily' | 'every_few_days' | 'weekly' | 'monthly' | 'dormant';
  diary_read_rate: number; // percentage 0 - 100 e.g. 96%
  queries_asked_count: number; // academic questions sent to teachers e.g. 6
  alerts_acknowledged_count: number; // absence notices acknowledged e.g. 2
  fee_payment_punctuality: 'prompt' | 'requires_reminders' | 'chronic_defaulter';
}

export interface ParentLinkedChild {
  student_id: string;
  student_name: string;
  class_id: string;
  section: string;
  roll_number: string;
}

export interface ParentReportCard {
  id: string; // e.g. "prc-pari"
  parent_id: string; // Unique Single Parent ID e.g. "user-parent-pari"
  school_id: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  
  // All kids belonging to this parent across classes
  children_count: number;
  children: ParentLinkedChild[];

  // App Usage & Vigilance Metrics
  metrics: ParentAppUsageMetrics;

  // Engagement Score & Classification
  engagement_score: number; // 0 - 100
  vigilance_level: ParentVigilanceLevel; // 'proactive' | 'cooperative' | 'passive' | 'neglectful'
  
  // Teacher Directive: Flag whether child needs extense/intense attention
  extense_attention_needed: boolean;
  attention_reason?: string; // Reason why extra teacher attention is needed

  teacher_notes: string;
  last_contacted_date?: string;
  updated_at: string;
}


// ---------------------------------------------------------------------------
// Teacher / Faculty Progress & Management Appraisal (Incharge & Admin only)
// ---------------------------------------------------------------------------
export type RegularityStatus = 'regular' | 'occasional_late' | 'irregular';

export interface TeacherPillarEvaluation {
  score: SkillLevel; // 1-5
  rating: string; // e.g. "Outstanding", "Professional & Clear", "Needs Attention"
  notes: string;
}

export interface TeacherProgressEvaluation {
  id: string;
  school_id: string;
  teacher_id: string;
  teacher_name: string;
  teacher_email?: string;
  subject_specialty: string; // e.g. "Mathematics & Sciences"
  assigned_grades: string[]; // e.g. ["Class 9", "Class 10"]
  month: string; // e.g. "October"
  year: number; // e.g. 2026

  // The 4 Core Evaluation Pillars requested by user
  language: TeacherPillarEvaluation; // Communication, professional tone, language proficiency in Urdu/English
  dressing: TeacherPillarEvaluation; // Formal attire, neat grooming, tie/coat/lab coat, ID badge
  working: TeacherPillarEvaluation;  // Pedagogy, lesson planning, diary updating, student notebook checking
  
  // Regularity & Attendance
  regularity: {
    status: RegularityStatus; // 'regular' | 'occasional_late' | 'irregular'
    score: SkillLevel; // 1-5
    days_present: number; // e.g. 22
    days_absent: number;  // e.g. 0
    late_arrivals: number; // e.g. 0
    notes: string;
  };

  overall_score: number; // 0 - 100 percentage
  overall_grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  incharge_remarks: string;
  incharge_recommendation: 'increment' | 'satisfactory' | 'guidance_required' | 'warning_issued';
  evaluated_by_id: string;
  evaluated_by_name: string; // School Incharge / Principal
  created_at: string;
  updated_at: string;
}





