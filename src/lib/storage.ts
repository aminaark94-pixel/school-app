import {
  MonthlyKidsProgress,
  TeacherProgressEvaluation,
  ParentReportCard,
  ParentAppUsageMetrics,
  ParentVigilanceLevel,
  RegularityStatus,
  Attendance,
  Fee,
  Result,
  School,
  Student,
  User,
  DiaryEntry,
  Notice,
  CommunicationQuery,
  AbsenceAlert,
  Datesheet,
} from '../types';
import { generateDemoDataForSchool } from './demoDataGenerator';

export interface SchoolSupabaseConfig {
  school_id: string;
  url: string;
  anon_key: string;
  enabled: boolean;
  updated_at: string;
}

const STORAGE_KEYS = {
  SCHOOLS: 'sms_schools_v1',
  USERS: 'sms_users_v1',
  STUDENTS: 'sms_students_v1',
  ATTENDANCE: 'sms_attendance_v1',
  FEES: 'sms_fees_v1',
  RESULTS: 'sms_results_v1',
  DIARY: 'sms_diary_v1',
  NOTICES: 'sms_notices_v1',
  QUERIES: 'sms_queries_v1',
  ALERTS: 'sms_alerts_v1',
  DATESHEETS: 'sms_datesheets_v1',
  PROGRESS: 'sms_kids_progress_v1',
  TEACHER_PROGRESS: 'sms_teacher_progress_v1',
  PARENTS_REPORT: 'sms_parents_report_v1',
  CURRENT_USER: 'sms_current_user_id_v1',
  CURRENT_SCHOOL: 'sms_current_school_id_v1',
  SUPABASE_CONFIGS: 'sms_school_supabase_configs_v1',
};

export const INITIAL_SCHOOLS: School[] = [
  {
    id: 'school-apex',
    name: 'Aitchisonian Imperial College & Grammar School',
    motto: 'Perseverantia et Virtus • Knowledge is Light',
    logo_url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=160&auto=format&fit=crop&q=80',
    primary_color: '#8B0000', // Golden Luxe Crimson
    secondary_color: '#5B0202', // Deep Burgundy Oxblood
    address: 'Mall Road & Canal Campus, Lahore, Pakistan',
    phone: '+92 (42) 3578-9100',
    skin: 'imperial',
    created_at: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'school-horizon',
    name: 'High Star Public Secondary School',
    motto: 'Learn & Serve with Pride • Excellence in Character',
    logo_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=160&auto=format&fit=crop&q=80',
    primary_color: '#0A2540',
    secondary_color: '#041226',
    address: 'Shadman Campus, Lahore, Pakistan',
    phone: '+92 (42) 3742-1200',
    skin: 'highstar',
    created_at: new Date('2024-02-01').toISOString(),
  },
  {
    id: 'school-ideas',
    name: 'Ideas Schooling System',
    motto: 'Learning Today, Leading Tomorrow • Future Ready Education',
    logo_url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=160&auto=format&fit=crop&q=80',
    primary_color: '#0C1F38',
    secondary_color: '#F02434',
    address: 'Gulberg III, Main Boulevard, Lahore, Pakistan',
    phone: '+92 (42) 3587-4321',
    skin: 'ideas',
    created_at: new Date('2024-03-01').toISOString(),
  },
  {
    id: 'school-leading',
    name: 'The Leading Schooling System',
    motto: 'Empowering Young Minds for a Brighter Future',
    logo_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=160&auto=format&fit=crop&q=80',
    primary_color: '#312E81',
    secondary_color: '#F59E0B',
    address: 'DHA Phase 5 Academic Block, Lahore, Pakistan',
    phone: '+92 (42) 3718-9900',
    skin: 'leading',
    created_at: new Date('2024-04-01').toISOString(),
  },
];

export const INITIAL_USERS: User[] = [
  // Pari Khan (Mother of 4 Kids)
  {
    id: 'user-parent-pari',
    school_id: 'school-apex',
    full_name: 'Pari Khan (Mother of 4)',
    role: 'parent',
    email: 'pari@example.com',
    created_at: new Date('2024-02-01').toISOString(),
  },
  {
    id: 'user-teacher-general',
    school_id: 'school-apex',
    full_name: 'Prof. Asim Munir (Teacher)',
    role: 'teacher',
    email: 'teacher@imperialgrammar.edu.pk',
    created_at: new Date('2024-01-10').toISOString(),
  },

  // Platform Owner (SaaS Seller)
  {
    id: 'user-owner-platform',
    school_id: null,
    full_name: 'Platform SaaS Owner',
    role: 'owner',
    email: 'owner@schoolpwa.com',
    created_at: new Date('2024-01-01').toISOString(),
  },
  // Apex Academy Users
  {
    id: 'user-admin-apex',
    school_id: 'school-apex',
    full_name: 'Principal Syed Ali Raza',
    role: 'admin',
    email: 'principal@imperialgrammar.edu.pk',
    created_at: new Date('2024-01-05').toISOString(),
  },
  {
    id: 'user-teacher-english',
    school_id: 'school-apex',
    full_name: 'Ms. Hina Bukhari (English Incharge)',
    role: 'teacher',
    email: 'hina.bukhari@imperialgrammar.edu.pk',
    created_at: new Date('2024-01-15').toISOString(),
  },
  {
    id: 'user-teacher-science',
    school_id: 'school-apex',
    full_name: 'Mr. Shahbaz Gill (Physics Faculty)',
    role: 'teacher',
    email: 'shahbaz.gill@imperialgrammar.edu.pk',
    created_at: new Date('2024-01-20').toISOString(),
  },
  {
    id: 'user-teacher-apex',
    school_id: 'school-apex',
    full_name: 'Prof. Asim Munir',
    role: 'teacher',
    email: 'asim.munir@imperialgrammar.edu.pk',
    created_at: new Date('2024-01-10').toISOString(),
  },
  {
    id: 'user-parent-1',
    school_id: 'school-apex',
    full_name: 'Tariq Mehmood',
    role: 'parent',
    email: 'tariq.mehmood@example.com',
    created_at: new Date('2024-02-01').toISOString(),
  },
  {
    id: 'user-parent-2',
    school_id: 'school-apex',
    full_name: 'Farooq Siddiqui',
    role: 'parent',
    email: 'farooq.siddiqui@example.com',
    created_at: new Date('2024-02-05').toISOString(),
  },
  // High Star Users
  {
    id: 'user-admin-horizon',
    school_id: 'school-horizon',
    full_name: 'Principal Dr. Qasim Khan',
    role: 'admin',
    email: 'admin@highstar.edu.pk',
    created_at: new Date('2024-02-01').toISOString(),
  },
  {
    id: 'user-teacher-horizon',
    school_id: 'school-horizon',
    full_name: 'Prof. Zafar Iqbal (Urdu)',
    role: 'teacher',
    email: 'zafar.iqbal@highstar.edu.pk',
    created_at: new Date('2024-02-15').toISOString(),
  },
  {
    id: 'user-teacher-hs-math',
    school_id: 'school-horizon',
    full_name: 'Sir Tariq Jamil (Mathematics)',
    role: 'teacher',
    email: 'tariq.jamil@highstar.edu.pk',
    created_at: new Date('2024-02-16').toISOString(),
  },
  {
    id: 'user-teacher-hs-eng',
    school_id: 'school-horizon',
    full_name: 'Ms. Sadia Parveen (English)',
    role: 'teacher',
    email: 'sadia.parveen@highstar.edu.pk',
    created_at: new Date('2024-02-18').toISOString(),
  },
  // Ideas Schooling Users
  {
    id: 'user-admin-ideas',
    school_id: 'school-ideas',
    full_name: 'Principal Mrs. Naila Batool',
    role: 'admin',
    email: 'admin@ideasschooling.edu.pk',
    created_at: new Date('2024-03-01').toISOString(),
  },
  {
    id: 'user-teacher-ideas',
    school_id: 'school-ideas',
    full_name: 'Sir Adnan Haider (Mathematics)',
    role: 'teacher',
    email: 'adnan.haider@ideasschooling.edu.pk',
    created_at: new Date('2024-03-05').toISOString(),
  },
  {
    id: 'user-teacher-ideas-sci',
    school_id: 'school-ideas',
    full_name: 'Ms. Rabia Basri (Sciences)',
    role: 'teacher',
    email: 'rabia.basri@ideasschooling.edu.pk',
    created_at: new Date('2024-03-08').toISOString(),
  },
  {
    id: 'user-teacher-ideas-eng',
    school_id: 'school-ideas',
    full_name: 'Sir Usman Ghani (English)',
    role: 'teacher',
    email: 'usman.ghani@ideasschooling.edu.pk',
    created_at: new Date('2024-03-10').toISOString(),
  },
  // The Leading School Users
  {
    id: 'user-admin-leading',
    school_id: 'school-leading',
    full_name: 'Director Salman Farooqui',
    role: 'admin',
    email: 'director@leadingschool.edu.pk',
    created_at: new Date('2024-04-01').toISOString(),
  },
  {
    id: 'user-teacher-leading',
    school_id: 'school-leading',
    full_name: 'Prof. Tahir Mahmood (Mathematics Head)',
    role: 'teacher',
    email: 'tahir.mahmood@leadingschool.edu.pk',
    created_at: new Date('2024-04-05').toISOString(),
  },
  {
    id: 'user-teacher-leading-eng',
    school_id: 'school-leading',
    full_name: 'Ms. Bushra Rehman (English Literature)',
    role: 'teacher',
    email: 'bushra.rehman@leadingschool.edu.pk',
    created_at: new Date('2024-04-08').toISOString(),
  },
  {
    id: 'user-teacher-leading-sci',
    school_id: 'school-leading',
    full_name: 'Sir Farhan Qureshi (Physics & Chemistry)',
    role: 'teacher',
    email: 'farhan.qureshi@leadingschool.edu.pk',
    created_at: new Date('2024-04-10').toISOString(),
  },
];

export const INITIAL_STUDENTS: Student[] = [
  // Pari Khan's 4 Kids (Across KG 1, Class 2, Class 5, Class 9)
  {
    id: 'student-pari-kg1',
    school_id: 'school-apex',
    roll_number: 'AI-KG-01',
    name: 'Zaviyar Ahmed Khan',
    class_id: 'KG 1',
    section: 'Rose',
    parent_id: 'user-parent-pari',
    parent_name: 'Pari Khan',
    parent_email: 'pari@example.com',
    is_deleted: false,
    created_at: new Date('2024-02-01').toISOString(),
  },
  {
    id: 'student-pari-c2',
    school_id: 'school-apex',
    roll_number: 'AI-C2-01',
    name: 'Mirha Fatima Khan',
    class_id: 'Class 2',
    section: 'Tulip',
    parent_id: 'user-parent-pari',
    parent_name: 'Pari Khan',
    parent_email: 'pari@example.com',
    is_deleted: false,
    created_at: new Date('2024-02-01').toISOString(),
  },
  {
    id: 'student-pari-c5',
    school_id: 'school-apex',
    roll_number: 'AI-C5-01',
    name: 'Muhammad Rayyan Khan',
    class_id: 'Class 5',
    section: 'Green',
    parent_id: 'user-parent-pari',
    parent_name: 'Pari Khan',
    parent_email: 'pari@example.com',
    is_deleted: false,
    created_at: new Date('2024-02-01').toISOString(),
  },
  {
    id: 'student-pari-c9',
    school_id: 'school-apex',
    roll_number: 'AI-C9-01',
    name: 'Shahmeer Ali Khan',
    class_id: 'Class 9',
    section: 'Matric A',
    parent_id: 'user-parent-pari',
    parent_name: 'Pari Khan',
    parent_email: 'pari@example.com',
    is_deleted: false,
    created_at: new Date('2024-02-01').toISOString(),
  },
  // High Star Seed Scholars
  {
    id: 'student-hs-pari-kg1',
    school_id: 'school-horizon',
    roll_number: 'HS-KG-01',
    name: 'Zaviyar Ahmed Khan',
    class_id: 'KG 1',
    section: 'Rose',
    parent_id: 'user-parent-pari',
    parent_name: 'Pari Khan',
    parent_email: 'pari@example.com',
    is_deleted: false,
    created_at: new Date('2024-02-01').toISOString(),
  },
  {
    id: 'student-hs-pari-c2',
    school_id: 'school-horizon',
    roll_number: 'HS-C2-01',
    name: 'Mirha Fatima Khan',
    class_id: 'Class 2',
    section: 'Tulip',
    parent_id: 'user-parent-pari',
    parent_name: 'Pari Khan',
    parent_email: 'pari@example.com',
    is_deleted: false,
    created_at: new Date('2024-02-01').toISOString(),
  },
  {
    id: 'student-hs-pari-c5',
    school_id: 'school-horizon',
    roll_number: 'HS-C5-01',
    name: 'Muhammad Rayyan Khan',
    class_id: 'Class 5',
    section: 'Green',
    parent_id: 'user-parent-pari',
    parent_name: 'Pari Khan',
    parent_email: 'pari@example.com',
    is_deleted: false,
    created_at: new Date('2024-02-01').toISOString(),
  },
  {
    id: 'student-hs-pari-c9',
    school_id: 'school-horizon',
    roll_number: 'HS-C9-01',
    name: 'Shahmeer Ali Khan',
    class_id: 'Class 9',
    section: 'Matric A',
    parent_id: 'user-parent-pari',
    parent_name: 'Pari Khan',
    parent_email: 'pari@example.com',
    is_deleted: false,
    created_at: new Date('2024-02-01').toISOString(),
  },
  {
    id: 'student-hs-1',
    school_id: 'school-horizon',
    roll_number: 'HS-101',
    name: 'Hamza Farooq',
    class_id: 'Class 10 (Matric)',
    section: 'A',
    parent_id: 'user-parent-1',
    parent_name: 'Tariq Mehmood',
    parent_email: 'tariq.mehmood@example.com',
    is_deleted: false,
    created_at: new Date('2024-02-01').toISOString(),
  },

  // Grade 10 / Matric / O-Level Section A
  {
    id: 'student-1',
    school_id: 'school-apex',
    roll_number: 'AIC-101',
    name: 'Muhammad Hamza',
    class_id: 'Class 10 (O-Levels)',
    section: 'A',
    parent_id: 'user-parent-1',
    parent_name: 'Tariq Mehmood',
    parent_email: 'tariq.mehmood@example.com',
    is_deleted: false,
    created_at: new Date('2024-02-10').toISOString(),
  },
  {
    id: 'student-2',
    school_id: 'school-apex',
    roll_number: 'AIC-102',
    name: 'Ayesha Siddiqui',
    class_id: 'Class 10 (O-Levels)',
    section: 'A',
    parent_id: 'user-parent-2',
    parent_name: 'Farooq Siddiqui',
    parent_email: 'farooq.siddiqui@example.com',
    is_deleted: false,
    created_at: new Date('2024-02-12').toISOString(),
  },
  {
    id: 'student-3',
    school_id: 'school-apex',
    roll_number: 'AIC-103',
    name: 'Danial Qureshi',
    class_id: 'Class 10 (O-Levels)',
    section: 'A',
    parent_id: 'user-parent-1',
    parent_name: 'Tariq Mehmood',
    parent_email: 'tariq.mehmood@example.com',
    is_deleted: false,
    created_at: new Date('2024-02-14').toISOString(),
  },
  {
    id: 'student-4',
    school_id: 'school-apex',
    roll_number: 'AIC-104',
    name: 'Fatima Zahra',
    class_id: 'Class 10 (O-Levels)',
    section: 'A',
    parent_id: 'user-parent-2',
    is_deleted: false,
    created_at: new Date('2024-02-15').toISOString(),
  },
  {
    id: 'student-5',
    school_id: 'school-apex',
    roll_number: 'AIC-105',
    name: 'Bilal Ahmed',
    class_id: 'Class 10 (O-Levels)',
    section: 'B',
    parent_id: 'user-parent-1',
    is_deleted: false,
    created_at: new Date('2024-02-16').toISOString(),
  },
  {
    id: 'student-6',
    school_id: 'school-apex',
    roll_number: 'AIC-106',
    name: 'Zainab Malik',
    class_id: 'Class 9 (Pre-O-Levels)',
    section: 'A',
    parent_id: 'user-parent-2',
    is_deleted: false,
    created_at: new Date('2024-02-18').toISOString(),
  },
  {
    id: 'student-7',
    school_id: 'school-apex',
    roll_number: 'AIC-107',
    name: 'Saad Farooq',
    class_id: 'Class 9 (Pre-O-Levels)',
    section: 'A',
    parent_id: 'user-parent-1',
    is_deleted: true, // Soft-deleted for demonstration
    created_at: new Date('2024-02-20').toISOString(),
  },
  // High Star Public Secondary School Students
  {
    id: 'student-h1',
    school_id: 'school-horizon',
    roll_number: 'HSS-101',
    name: 'Muhammad Hamza Tariq',
    class_id: 'Class 10 (O-Levels)',
    section: 'A',
    parent_id: 'user-parent-1',
    parent_name: 'Tariq Mehmood',
    is_deleted: false,
    created_at: new Date('2024-02-22').toISOString(),
  },
  {
    id: 'student-h2',
    school_id: 'school-horizon',
    roll_number: 'HSS-102',
    name: 'Fatima Zahra Farooq',
    class_id: 'Class 10 (O-Levels)',
    section: 'A',
    parent_id: 'user-parent-2',
    parent_name: 'Farooq Siddiqui',
    is_deleted: false,
    created_at: new Date('2024-02-22').toISOString(),
  },
  {
    id: 'student-h3',
    school_id: 'school-horizon',
    roll_number: 'HSS-103',
    name: 'Syed Daniyal Mustafa',
    class_id: 'Class 10 (O-Levels)',
    section: 'A',
    parent_id: 'user-parent-3',
    parent_name: 'Dr. Naeem Akhtar',
    is_deleted: false,
    created_at: new Date('2024-02-22').toISOString(),
  },
  {
    id: 'student-h4',
    school_id: 'school-horizon',
    roll_number: 'HSS-201',
    name: 'Bilal Ahmed Qureshi',
    class_id: 'Class 9 (Matric)',
    section: 'Science-A',
    parent_id: 'user-parent-1',
    parent_name: 'Waseem Qureshi',
    is_deleted: false,
    created_at: new Date('2024-02-22').toISOString(),
  },
  {
    id: 'student-h5',
    school_id: 'school-horizon',
    roll_number: 'HSS-202',
    name: 'Dua Tariq Bhatti',
    class_id: 'Class 9 (Matric)',
    section: 'Science-A',
    parent_id: 'user-parent-2',
    parent_name: 'Tariq Bhatti',
    is_deleted: false,
    created_at: new Date('2024-02-22').toISOString(),
  },
  {
    id: 'student-h6',
    school_id: 'school-horizon',
    roll_number: 'HSS-301',
    name: 'Ibrahim Malik',
    class_id: 'Grade 8',
    section: 'A',
    parent_id: 'user-parent-3',
    parent_name: 'Malik Sohail',
    is_deleted: false,
    created_at: new Date('2024-02-22').toISOString(),
  },
  {
    id: 'student-h7',
    school_id: 'school-horizon',
    roll_number: 'HSS-401',
    name: 'Zarrar Haider Naqvi',
    class_id: 'Grade 5',
    section: 'Rose',
    parent_id: 'user-parent-1',
    parent_name: 'Haider Naqvi',
    is_deleted: false,
    created_at: new Date('2024-02-22').toISOString(),
  },
];

export const INITIAL_FEES: Fee[] = [
  // Liam Jenkins (Paid)
  {
    id: 'fee-1',
    student_id: 'student-1',
    amount: 450.00,
    status: 'paid',
    due_date: '2025-08-30',
    updated_at: new Date().toISOString(),
    term: 'Fall Term 2025',
    receipt_number: 'REC-2025-8821',
  },
  // Sophia Chen (PENDING - fee lock trigger)
  {
    id: 'fee-2',
    student_id: 'student-2',
    amount: 520.00,
    status: 'pending',
    due_date: '2025-09-15',
    updated_at: new Date().toISOString(),
    term: 'Fall Term 2025',
    receipt_number: '',
  },
  // Ethan Miller (Paid)
  {
    id: 'fee-3',
    student_id: 'student-3',
    amount: 450.00,
    status: 'paid',
    due_date: '2025-08-30',
    updated_at: new Date().toISOString(),
    term: 'Fall Term 2025',
    receipt_number: 'REC-2025-8835',
  },
  // Ava Patel (Pending)
  {
    id: 'fee-4',
    student_id: 'student-4',
    amount: 450.00,
    status: 'pending',
    due_date: '2025-09-10',
    updated_at: new Date().toISOString(),
    term: 'Fall Term 2025',
  },
  // Noah Garcia (Pending)
  {
    id: 'fee-5',
    student_id: 'student-5',
    amount: 450.00,
    status: 'pending',
    due_date: '2025-09-10',
    updated_at: new Date().toISOString(),
    term: 'Fall Term 2025',
  },
  // Emma Watson (Paid)
  {
    id: 'fee-6',
    student_id: 'student-6',
    amount: 400.00,
    status: 'paid',
    due_date: '2025-08-30',
    updated_at: new Date().toISOString(),
    term: 'Fall Term 2025',
    receipt_number: 'REC-2025-9012',
  },
  // Horizon student
  {
    id: 'fee-h1',
    student_id: 'student-h1',
    amount: 600.00,
    status: 'paid',
    due_date: '2025-09-01',
    updated_at: new Date().toISOString(),
    term: 'Term 1 Tuition',
    receipt_number: 'HRZ-FEE-1002',
  },
];

export const INITIAL_RESULTS: Result[] = [
  // Liam Jenkins - Mid Term
  {
    id: 'res-1',
    student_id: 'student-1',
    term: 'mid_term',
    marks_json: [
      { subject: 'Advanced Mathematics', max_marks: 100, obtained_marks: 94, grade: 'A+', remarks: 'Outstanding problem solving' },
      { subject: 'Physics', max_marks: 100, obtained_marks: 89, grade: 'A', remarks: 'Strong theoretical grasp' },
      { subject: 'English Literature', max_marks: 100, obtained_marks: 91, grade: 'A+', remarks: 'Eloquent essay articulation' },
      { subject: 'Chemistry', max_marks: 100, obtained_marks: 86, grade: 'A', remarks: 'Excellent lab performance' },
      { subject: 'Computer Science', max_marks: 100, obtained_marks: 98, grade: 'A+', remarks: 'Top scores in algorithms' },
    ],
    total_marks: 458,
    grade: 'A+',
    percentage: 91.6,
    class_rank: 1,
    attendance_percentage: 98.2,
    conduct: 'Exemplary',
    created_at: new Date('2025-06-15').toISOString(),
  },
  // Liam Jenkins - Final Term
  {
    id: 'res-1-final',
    student_id: 'student-1',
    term: 'final',
    marks_json: [
      { subject: 'Advanced Mathematics', max_marks: 100, obtained_marks: 96, grade: 'A+', remarks: 'Near perfect final examination' },
      { subject: 'Physics', max_marks: 100, obtained_marks: 92, grade: 'A+', remarks: 'Commendable lab research work' },
      { subject: 'English Literature', max_marks: 100, obtained_marks: 93, grade: 'A+', remarks: 'Insightful literary critique' },
      { subject: 'Chemistry', max_marks: 100, obtained_marks: 90, grade: 'A+', remarks: 'Mastered organic formulations' },
      { subject: 'Computer Science', max_marks: 100, obtained_marks: 99, grade: 'A+', remarks: 'Distinction in software architecture' },
    ],
    total_marks: 470,
    grade: 'A+',
    percentage: 94.0,
    class_rank: 1,
    attendance_percentage: 98.5,
    conduct: 'Exemplary',
    created_at: new Date('2025-08-20').toISOString(),
  },
  // Sophia Chen - Mid Term (Locked because fee is pending)
  {
    id: 'res-2',
    student_id: 'student-2',
    term: 'mid_term',
    marks_json: [
      { subject: 'Advanced Mathematics', max_marks: 100, obtained_marks: 88, grade: 'A', remarks: 'Strong algebra skills' },
      { subject: 'Physics', max_marks: 100, obtained_marks: 82, grade: 'B+', remarks: 'Good analytical tests' },
      { subject: 'English Literature', max_marks: 100, obtained_marks: 95, grade: 'A+', remarks: 'Superior creative writing' },
      { subject: 'Chemistry', max_marks: 100, obtained_marks: 84, grade: 'A', remarks: 'Good experimental notes' },
      { subject: 'Computer Science', max_marks: 100, obtained_marks: 90, grade: 'A', remarks: 'Clean code submissions' },
    ],
    total_marks: 439,
    grade: 'A',
    percentage: 87.8,
    class_rank: 3,
    attendance_percentage: 94.0,
    conduct: 'Very Good',
    created_at: new Date('2025-06-15').toISOString(),
  },
  // Ethan Miller - Mid Term
  {
    id: 'res-3',
    student_id: 'student-3',
    term: 'mid_term',
    marks_json: [
      { subject: 'Advanced Mathematics', max_marks: 100, obtained_marks: 78, grade: 'B+', remarks: 'Needs revision in calculus' },
      { subject: 'Physics', max_marks: 100, obtained_marks: 80, grade: 'B+', remarks: 'Steady effort shown' },
      { subject: 'English Literature', max_marks: 100, obtained_marks: 85, grade: 'A', remarks: 'Good reading comprehension' },
      { subject: 'Chemistry', max_marks: 100, obtained_marks: 81, grade: 'B+', remarks: 'Consistent quiz marks' },
      { subject: 'Computer Science', max_marks: 100, obtained_marks: 88, grade: 'A', remarks: 'Enthusiastic programmer' },
    ],
    total_marks: 412,
    grade: 'B+',
    percentage: 82.4,
    class_rank: 5,
    attendance_percentage: 92.5,
    conduct: 'Good',
    created_at: new Date('2025-06-15').toISOString(),
  },
];

export const INITIAL_ATTENDANCE: Attendance[] = [
  {
    id: 'att-1',
    student_id: 'student-1',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    marked_by: 'user-teacher-apex',
  },
  {
    id: 'att-2',
    student_id: 'student-2',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    marked_by: 'user-teacher-apex',
  },
  {
    id: 'att-3',
    student_id: 'student-3',
    date: new Date().toISOString().split('T')[0],
    status: 'absent',
    marked_by: 'user-teacher-apex',
  },
];

const TODAY_STR = new Date().toISOString().split('T')[0];

export const INITIAL_DIARY: DiaryEntry[] = [
  {
    id: 'diary-1',
    school_id: 'school-apex',
    class_id: 'Class 10 (O-Levels)',
    section: 'A',
    subject: 'Mathematics',
    date: TODAY_STR,
    classwork: 'Completed Exercise 4.3 (Quadratic equations by factorization method). Discussed standard form ax² + bx + c = 0 and solved examples 7 to 11 in class work.',
    homework: 'Solve textbook Questions 5, 8, 12 on neat registers. Prepare Theorem 4.1 for tomorrow morning test.',
    due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    teacher_id: 'user-teacher-apex',
    teacher_name: 'Prof. Asim Munir',
    attachments: [
      {
        id: 'att-101',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&auto=format&fit=crop&q=80',
        caption: 'Class Work Notes - Formula derivations & step-by-step example',
      },
      {
        id: 'att-101-pdf',
        type: 'document',
        url: '/sample-daily-work-planner.pdf',
        caption: 'Daily Work Planner (CamScanner Scanned PDF) - Full Schedule',
        fileSize: '142.5 KB',
        fileName: 'sample-daily-work-planner.pdf',
      },
    ],
    read_by_parents: [
      {
        parent_id: 'user-parent-1',
        parent_name: 'Tariq Mehmood',
        student_id: 'student-1',
        student_name: 'Muhammad Hamza',
        read_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 'diary-2',
    school_id: 'school-apex',
    class_id: 'Class 10 (O-Levels)',
    section: 'A',
    subject: 'Physics',
    date: TODAY_STR,
    classwork: 'Chapter 14: Electromagnetic Induction. Lab demonstration of Faraday Law with bar magnet, coil, and galvanometer.',
    homework: 'Write practical observations in Physics Lab Journal (Experiment 6). Complete numerical problems 1 to 4 on page 142.',
    due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    teacher_id: 'user-teacher-apex',
    teacher_name: 'Prof. Asim Munir',
    attachments: [
      {
        id: 'att-102',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&auto=format&fit=crop&q=80',
        caption: 'Lab Worksheet Diagram - Magnetic flux and induced current setup',
      },
    ],
    read_by_parents: [],
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'diary-3',
    school_id: 'school-apex',
    class_id: 'Class 10 (O-Levels)',
    section: 'A',
    subject: 'English Literature',
    date: TODAY_STR,
    classwork: 'Analyzed Act III Scene 2 of Julius Caesar (Mark Antony speech). Discussed rhetorical questions and emotional appeal.',
    homework: 'Write a 250-word critique analyzing Antony persuasive techniques. Memorize lines 75-90.',
    due_date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    teacher_id: 'user-teacher-apex',
    teacher_name: 'Prof. Asim Munir',
    read_by_parents: [
      {
        parent_id: 'user-parent-1',
        parent_name: 'Tariq Mehmood',
        student_id: 'student-1',
        student_name: 'Muhammad Hamza',
        read_at: new Date(Date.now() - 1800000).toISOString(),
      },
    ],
    created_at: new Date(Date.now() - 10800000).toISOString(),
  },
];

export const INITIAL_NOTICES: Notice[] = [
  {
    id: 'notice-1',
    school_id: 'school-apex',
    title: 'Upcoming Mid-Term Examination Datesheet & Syllabus Release',
    content: 'Dear Parents & Guardians, the comprehensive datesheet for Mid-Term Examinations 2026 has been published in the portal. Please ensure all preparatory notebooks and lab assignments are verified by teachers before Friday.',
    category: 'event',
    target_audience: 'all',
    priority: 'urgent',
    publish_date: TODAY_STR,
    author_name: 'Dr. Evelyn Vance',
    author_role: 'Principal / Admin',
    created_at: new Date().toISOString(),
  },
  {
    id: 'notice-2',
    school_id: 'school-apex',
    title: 'Emergency Rain / Extreme Weather Advisory',
    content: 'In compliance with city district guidelines, morning school assembly will be held indoors today. Dismissal timings remain unchanged at 02:00 PM. Parents using private vans are requested to coordinate with drivers.',
    category: 'emergency',
    target_audience: 'all',
    priority: 'urgent',
    publish_date: TODAY_STR,
    author_name: 'Administration Office',
    author_role: 'School Authority',
    created_at: new Date().toISOString(),
  },
  {
    id: 'notice-3',
    school_id: 'school-apex',
    title: 'Fee Dues Reminder - September Installment',
    content: 'This is a gentle reminder that tuition fees for the current billing cycle are due by the 10th of this month. Academic result cards and quarterly certificates are synced with fee clearance status in the PWA.',
    category: 'fee_reminder',
    target_audience: 'all',
    priority: 'normal',
    publish_date: TODAY_STR,
    author_name: 'Accounts & Finance',
    author_role: 'Accounts Office',
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_QUERIES: CommunicationQuery[] = [
  // 1. Parent to Teacher & Admin: Pari Khan inquiring regarding KG 1 Phonics & Reading
  {
    id: 'tkt-apex-101',
    ticket_number: 'TKT-2026-101',
    school_id: 'school-apex',
    student_id: 'student-pari-kg1',
    student_name: 'Zaviyar Ahmed Khan',
    student_class: 'KG 1 - Section Rose',
    parent_id: 'user-parent-pari',
    parent_name: 'Pari Khan (Mother of 4)',
    parent_phone: '+92 300 1234567',
    teacher_id: 'user-teacher-apex',
    teacher_name: 'Prof. Asim Munir',
    raised_by_role: 'parent',
    raised_by_name: 'Pari Khan',
    target_audience: 'teacher',
    subject: 'Clarification on Oxford Reading Tree Phonics Exercise (Page 14)',
    status: 'in_progress',
    category: 'homework',
    priority: 'normal',
    admin_notified: true,
    teacher_notified: true,
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    messages: [
      {
        id: 'msg-tkt-101-1',
        sender_id: 'user-parent-pari',
        sender_name: 'Pari Khan (Mother of 4)',
        sender_role: 'parent',
        text: 'Assalam-o-Alaikum Sir, Zaviyar completed his sound tracing on page 14 of Oxford Reading Tree. Should he also memorize the 3-letter sight words on page 15 for the circle time tomorrow?',
        sent_at: new Date(Date.now() - 6 * 3600000).toISOString(),
      },
      {
        id: 'msg-tkt-101-2',
        sender_id: 'user-teacher-apex',
        sender_name: 'Prof. Asim Munir',
        sender_role: 'teacher',
        text: 'Walaikum Assalam Mrs. Pari Khan, only page 14 tracing is required for tomorrow. Page 15 will be conducted orally in the classroom during 2nd period. His phonics grip is coming along wonderfully!',
        sent_at: new Date(Date.now() - 4 * 3600000).toISOString(),
      },
      {
        id: 'msg-tkt-101-3',
        sender_id: 'user-admin-apex',
        sender_name: 'Principal Syed Ali Raza',
        sender_role: 'admin',
        text: 'Official Incharge Note: Noted by Academic Coordination Office. Thank you Mrs. Pari Khan for active daily home supervision.',
        sent_at: new Date(Date.now() - 2 * 3600000).toISOString(),
      },
    ],
  },

  // 2. Teacher to Parent & Admin: Formal Homework & Diary Notice by Teacher to Farooq Siddiqui
  {
    id: 'tkt-apex-102',
    ticket_number: 'TKT-2026-102',
    school_id: 'school-apex',
    student_id: 'student-2',
    student_name: 'Ayesha Siddiqui',
    student_class: 'Class 10 (O-Levels) - Section A',
    parent_id: 'user-parent-2',
    parent_name: 'Farooq Siddiqui',
    parent_phone: '+92 333 7890123',
    teacher_id: 'user-teacher-apex',
    teacher_name: 'Prof. Asim Munir',
    raised_by_role: 'teacher',
    raised_by_name: 'Prof. Asim Munir (Math Faculty)',
    target_audience: 'parent',
    subject: 'Disciplinary Notice: Consecutive Incomplete Math Homework & Unsigned Diary',
    status: 'open',
    category: 'discipline',
    priority: 'urgent',
    admin_notified: true,
    teacher_notified: true,
    created_at: new Date(Date.now() - 14 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 3600000).toISOString(),
    messages: [
      {
        id: 'msg-tkt-102-1',
        sender_id: 'user-teacher-apex',
        sender_name: 'Prof. Asim Munir',
        sender_role: 'teacher',
        text: 'Respected Mr. Farooq Siddiqui, Ayesha has not submitted Exercise 4.3 homework for three consecutive days and her diary is unverified. As board exams are approaching, kindly check her notebook tonight and confirm diary sign-off.',
        sent_at: new Date(Date.now() - 14 * 3600000).toISOString(),
      },
      {
        id: 'msg-tkt-102-2',
        sender_id: 'user-admin-apex',
        sender_name: 'Principal Syed Ali Raza',
        sender_role: 'admin',
        text: 'Official Administration Endorsement: The Principal Office has flagged this ticket for priority parent counseling. Please contact the class coordinator by 1:00 PM tomorrow.',
        sent_at: new Date(Date.now() - 8 * 3600000).toISOString(),
      },
    ],
  },

  // 3. Parent to Admin & Teacher: Transport delay complaint by Tariq Mehmood
  {
    id: 'tkt-apex-103',
    ticket_number: 'TKT-2026-103',
    school_id: 'school-apex',
    student_id: 'student-1',
    student_name: 'Muhammad Hamza',
    student_class: 'Class 10 (O-Levels) - Section A',
    parent_id: 'user-parent-1',
    parent_name: 'Tariq Mehmood',
    parent_phone: '+92 321 4567890',
    teacher_id: 'user-teacher-apex',
    teacher_name: 'Prof. Asim Munir',
    raised_by_role: 'parent',
    raised_by_name: 'Tariq Mehmood',
    target_audience: 'admin',
    subject: 'School Van #04 Arrived 35 Minutes Late at Shadman Stop',
    status: 'resolved',
    category: 'transport',
    priority: 'urgent',
    admin_notified: true,
    teacher_notified: true,
    resolved_at: new Date(Date.now() - 1 * 3600000).toISOString(),
    resolved_by: 'Principal Syed Ali Raza',
    created_at: new Date(Date.now() - 20 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 3600000).toISOString(),
    messages: [
      {
        id: 'msg-tkt-103-1',
        sender_id: 'user-parent-1',
        sender_name: 'Tariq Mehmood',
        sender_role: 'parent',
        text: 'Respected Management, Van #04 picked up Hamza at 07:55 AM instead of the scheduled 07:20 AM, causing him to miss morning assembly. Please instruct the transport desk to maintain punctuality.',
        sent_at: new Date(Date.now() - 20 * 3600000).toISOString(),
      },
      {
        id: 'msg-tkt-103-2',
        sender_id: 'user-admin-apex',
        sender_name: 'Principal Syed Ali Raza',
        sender_role: 'admin',
        text: 'Investigation Completed: Van #04 experienced an engine radiator leak. The transport supervisor dispatched a relief van immediately. We have cautioned the contractor and route will run strictly on time tomorrow.',
        sent_at: new Date(Date.now() - 5 * 3600000).toISOString(),
      },
      {
        id: 'msg-tkt-103-3',
        sender_id: 'user-teacher-apex',
        sender_name: 'Prof. Asim Munir',
        sender_role: 'teacher',
        text: 'Confirmed from classroom register: Hamza was excused for the late arrival and his attendance is marked Present.',
        sent_at: new Date(Date.now() - 1 * 3600000).toISOString(),
      },
    ],
  },

  // 4. Teacher to Parent & Admin: Critical playground safety incident
  {
    id: 'tkt-apex-104',
    ticket_number: 'TKT-2026-104',
    school_id: 'school-apex',
    student_id: 'student-5',
    student_name: 'Bilal Ahmed',
    student_class: 'Class 10 (O-Levels) - Section B',
    parent_id: 'user-parent-dormant',
    parent_name: 'Kamran Malik',
    parent_phone: '+92 301 9876543',
    teacher_id: 'user-teacher-apex',
    teacher_name: 'Prof. Asim Munir',
    raised_by_role: 'teacher',
    raised_by_name: 'Prof. Asim Munir (Prefect Incharge)',
    target_audience: 'parent',
    subject: 'Critical Conduct Warning: Misbehavior during recess near basketball court',
    status: 'in_progress',
    category: 'safety_bullying',
    priority: 'critical',
    admin_notified: true,
    teacher_notified: true,
    created_at: new Date(Date.now() - 28 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 3600000).toISOString(),
    messages: [
      {
        id: 'msg-tkt-104-1',
        sender_id: 'user-teacher-apex',
        sender_name: 'Prof. Asim Munir',
        sender_role: 'teacher',
        text: 'CRITICAL ALERT for Parent & Incharge: Bilal was involved in a physical scuffle with Class 9 students today. Disciplinary committee has recorded witness statements. Immediate parent meeting is required.',
        sent_at: new Date(Date.now() - 28 * 3600000).toISOString(),
      },
      {
        id: 'msg-tkt-104-2',
        sender_id: 'user-admin-apex',
        sender_name: 'Principal Syed Ali Raza',
        sender_role: 'admin',
        text: 'Executive Summons: Formal hearing scheduled for tomorrow at 10:00 AM in Principal Office. Student placed on disciplinary probation. An automated SMS dispatch has also been queued.',
        sent_at: new Date(Date.now() - 10 * 3600000).toISOString(),
      },
    ],
  },
];

export const INITIAL_ALERTS: AbsenceAlert[] = [
  {
    id: 'alert-1',
    school_id: 'school-apex',
    student_id: 'student-3',
    student_name: 'Danial Qureshi',
    roll_number: 'AIC-103',
    class_id: 'Class 10 (O-Levels)',
    section: 'A',
    date: TODAY_STR,
    parent_id: 'user-parent-1',
    parent_name: 'Tariq Mehmood',
    parent_email: 'tariq.mehmood@example.com',
    sent_at: new Date().toISOString(),
    status: 'sent',
  },
];

export const INITIAL_DATESHEETS: Datesheet[] = [
  {
    id: 'datesheet-apex-10',
    school_id: 'school-apex',
    title: 'Mid-Term Examinations 2026',
    class_id: 'Class 10 (O-Levels)',
    term: 'mid_term',
    academic_year: '2025-2026',
    instructions: [
      'Students must report to examination halls by 08:15 AM sharp with roll number slips.',
      'Transparent pencil pouches and non-programmable scientific calculators only.',
      'Borrowing stationary or electronic watches inside hall is strictly forbidden.',
      'Students who are absent on health grounds must submit medical certificate within 24 hours.',
    ],
    schedule: [
      {
        id: 'sch-1',
        date: '2026-10-12',
        day: 'Monday',
        time: '08:30 AM - 11:30 AM',
        subject: 'Mathematics',
        syllabus: 'Chapters 1 to 5: Real Numbers, Polynomials, Linear Equations, Quadratic Equations, Arithmetic Progressions.',
        room_no: 'Hall A (Ground Floor)',
      },
      {
        id: 'sch-2',
        date: '2026-10-14',
        day: 'Wednesday',
        time: '08:30 AM - 11:30 AM',
        subject: 'Physics',
        syllabus: 'Chapters 10 to 14: Light Reflection & Refraction, Human Eye, Electricity, Magnetic Effects of Electric Current.',
        room_no: 'Hall A (Ground Floor)',
      },
      {
        id: 'sch-3',
        date: '2026-10-16',
        day: 'Friday',
        time: '08:30 AM - 11:30 AM',
        subject: 'Chemistry',
        syllabus: 'Chapters 1 to 4: Chemical Reactions & Equations, Acids Bases and Salts, Metals & Non-metals, Carbon Compounds.',
        room_no: 'Hall B (First Floor)',
      },
      {
        id: 'sch-4',
        date: '2026-10-19',
        day: 'Monday',
        time: '08:30 AM - 11:30 AM',
        subject: 'English Literature & Language',
        syllabus: 'Prose Lessons 1-6, Poetry 1-4, Drama: Julius Caesar Act I-III, Essay Writing, Formal Letters.',
        room_no: 'Hall A (Ground Floor)',
      },
      {
        id: 'sch-5',
        date: '2026-10-21',
        day: 'Wednesday',
        time: '08:30 AM - 11:30 AM',
        subject: 'Computer Science',
        syllabus: 'Object Oriented Programming in Java/C++, Array Algorithms, HTML/CSS Web Architecture, Cyber Security ethics.',
        room_no: 'Computer Lab 1 & 2',
      },
    ],
    created_at: new Date('2025-09-01').toISOString(),
  },
];

type StorageListener = () => void;
const listeners: Set<StorageListener> = new Set();

function emitChange() {
  listeners.forEach((listener) => listener());
}

export interface FullSchoolDataset {
  version: string;
  exported_at: string;
  description?: string;
  schools?: School[];
  users?: User[];
  students?: Student[];
  attendance?: Attendance[];
  fees?: Fee[];
  results?: Result[];
  diary?: DiaryEntry[];
  notices?: Notice[];
  queries?: CommunicationQuery[];
  alerts?: AbsenceAlert[];
  datesheets?: Datesheet[];
}

export const INITIAL_PROGRESS: MonthlyKidsProgress[] = [
  {
    id: 'prog-pari-kg1-oct2026',
    school_id: 'school-apex',
    student_id: 'student-pari-kg1',
    student_name: 'Zaviyar Ahmed Khan',
    class_id: 'KG 1',
    section: 'Rose',
    month: 'October',
    year: 2026,
    teacher_id: 'user-teacher-apex',
    teacher_name: 'Prof. Asim Munir',
    language: {
      score: 5,
      grade: 'A+',
      status: 'Outstanding',
      notes: 'Exceptional phonetic recognition, recognizes all Urdu haroof and English letters with native confidence.',
    },
    discipline: {
      score: 4,
      grade: 'A',
      status: 'Proficient',
      notes: 'Follows Montessori circle time instructions attentively, shares play blocks nicely with peers.',
    },
    writing: {
      score: 4,
      grade: 'A',
      status: 'Proficient',
      notes: 'Pencil grip is stable. Tracing straight lines and curved vowels is clear and within ruled boxes.',
    },
    reading: {
      score: 5,
      grade: 'A+',
      status: 'Outstanding',
      notes: 'Sight-word vocabulary is fast growing; reads aloud short 3-letter words eagerly in morning circle.',
    },
    cleaning: {
      score: 5,
      grade: 'A+',
      status: 'Outstanding',
      notes: 'Spotless white apron and uniform. Washes hands independently before meal and puts lunchbox away.',
    },
    teacher_remarks: 'Zaviyar is a delight to teach in Kindergarten! Enthusiastic, cheerful, and highly active.',
    badges: ['Star Speaker', 'Cleanliness Champion', 'Friendly Helper'],
    overall_score: 94,
    overall_grade: 'A+',
    created_at: new Date('2026-10-25').toISOString(),
    updated_at: new Date('2026-10-25').toISOString(),
  },
  {
    id: 'prog-pari-c2-oct2026',
    school_id: 'school-apex',
    student_id: 'student-pari-c2',
    student_name: 'Mirha Fatima Khan',
    class_id: 'Class 2',
    section: 'Tulip',
    month: 'October',
    year: 2026,
    teacher_id: 'user-teacher-apex',
    teacher_name: 'Prof. Asim Munir',
    language: {
      score: 5,
      grade: 'A+',
      status: 'Outstanding',
      notes: 'Speaks clearly in English and Urdu, uses complete sentences, and demonstrates strong vocabulary.',
    },
    discipline: {
      score: 5,
      grade: 'A+',
      status: 'Outstanding',
      notes: 'Exemplary classroom decorum. Punctual, raises hand before speaking, and respects school rules.',
    },
    writing: {
      score: 4,
      grade: 'A',
      status: 'Proficient',
      notes: 'Neat cursive letters and organized four-lined notebooks. Margins and headings are neat.',
    },
    reading: {
      score: 5,
      grade: 'A+',
      status: 'Outstanding',
      notes: 'Fluent reader of Oxford Reading Tree Level 4 stories with good expression and tone.',
    },
    cleaning: {
      score: 5,
      grade: 'A+',
      status: 'Outstanding',
      notes: 'Maintains an immaculate school bag, polished black shoes, and tidy school work station.',
    },
    teacher_remarks: 'Mirha consistently shines as a model student in Class 2. A role model for her class fellows.',
    badges: ['Book Worm', 'Neat & Tidy Star', 'Perfect Conduct'],
    overall_score: 96,
    overall_grade: 'A+',
    created_at: new Date('2026-10-25').toISOString(),
    updated_at: new Date('2026-10-25').toISOString(),
  },
  {
    id: 'prog-pari-c5-oct2026',
    school_id: 'school-apex',
    student_id: 'student-pari-c5',
    student_name: 'Muhammad Rayyan Khan',
    class_id: 'Class 5',
    section: 'Green',
    month: 'October',
    year: 2026,
    teacher_id: 'user-teacher-apex',
    teacher_name: 'Prof. Asim Munir',
    language: {
      score: 4,
      grade: 'A',
      status: 'Proficient',
      notes: 'Participates actively in classroom debates. Strong English comprehension with good Urdu grammar.',
    },
    discipline: {
      score: 4,
      grade: 'A',
      status: 'Proficient',
      notes: 'Takes charge as Junior Class Prefect; maintains corridor queue during assembly transitions.',
    },
    writing: {
      score: 4,
      grade: 'A',
      status: 'Proficient',
      notes: 'Creative paragraph composition is strong. Well-structured answers in Social Studies & Science.',
    },
    reading: {
      score: 4,
      grade: 'A',
      status: 'Proficient',
      notes: 'Reads informative articles quickly, summarizes key takeaway points accurately.',
    },
    cleaning: {
      score: 4,
      grade: 'A',
      status: 'Proficient',
      notes: 'Crisp uniform and trimmed hair. Keeps science lab bench clean and orderly after experiments.',
    },
    teacher_remarks: 'Rayyan shows admirable leadership qualities and steady academic progression across all subjects.',
    badges: ['Class Leader', 'Creative Thinker'],
    overall_score: 88,
    overall_grade: 'A',
    created_at: new Date('2026-10-25').toISOString(),
    updated_at: new Date('2026-10-25').toISOString(),
  },
  {
    id: 'prog-pari-c9-oct2026',
    school_id: 'school-apex',
    student_id: 'student-pari-c9',
    student_name: 'Shahmeer Ali Khan',
    class_id: 'Class 9',
    section: 'Matric A',
    month: 'October',
    year: 2026,
    teacher_id: 'user-teacher-apex',
    teacher_name: 'Prof. Asim Munir',
    language: {
      score: 5,
      grade: 'A+',
      status: 'Outstanding',
      notes: 'Excellent command of English technical terminology in Physics, Chemistry, and Computer Science.',
    },
    discipline: {
      score: 5,
      grade: 'A+',
      status: 'Outstanding',
      notes: 'Punctual with lab work submission and regular attendance for early morning board prep lectures.',
    },
    writing: {
      score: 4,
      grade: 'A',
      status: 'Proficient',
      notes: 'Mathematical derivations and long board-type questions are formatted methodically with side headings.',
    },
    reading: {
      score: 5,
      grade: 'A+',
      status: 'Outstanding',
      notes: 'Reads ahead of syllabus in Science subjects, solves past paper numerical problems proactively.',
    },
    cleaning: {
      score: 5,
      grade: 'A+',
      status: 'Outstanding',
      notes: 'Proper blazer, school tie, and exemplary presentation representing Senior Matric boys.',
    },
    teacher_remarks: 'Shahmeer is on track for straight A-One grades in upcoming Federal/Lahore Board Matric exams.',
    badges: ['Academic Ace', 'Board Exam Contender', 'Master Mind'],
    overall_score: 95,
    overall_grade: 'A+',
    created_at: new Date('2026-10-25').toISOString(),
    updated_at: new Date('2026-10-25').toISOString(),
  },
];

export const INITIAL_TEACHER_PROGRESS: TeacherProgressEvaluation[] = [
  {
    id: 'eval-asim-munir-oct2026',
    school_id: 'school-apex',
    teacher_id: 'user-teacher-apex',
    teacher_name: 'Prof. Asim Munir',
    teacher_email: 'asim.munir@imperialgrammar.edu.pk',
    subject_specialty: 'Senior Mathematics & Cambridge Mechanics',
    assigned_grades: ['Class 9 (Matric)', 'Class 10 (O-Levels)'],
    month: 'October',
    year: 2026,
    language: {
      score: 5,
      rating: 'Outstanding & Articulate',
      notes: 'Exceptional bilingual command in English and Urdu. Explains intricate calculus and algebra with clarity and pedagogical patience.',
    },
    dressing: {
      score: 5,
      rating: 'Immaculate & Formal',
      notes: 'Consistently wears crisp formal blazer, necktie, and polished black shoes. Exemplary executive faculty grooming.',
    },
    working: {
      score: 5,
      rating: 'Exemplary Pedagogy & Timely',
      notes: 'Weekly lesson planners submitted 5 days in advance. Digital diary updated daily by 2:00 PM. High student engagement in math quizzes.',
    },
    regularity: {
      status: 'regular',
      score: 5,
      days_present: 22,
      days_absent: 0,
      late_arrivals: 0,
      notes: '100% attendance. Arrives at 7:35 AM for morning assembly gate duty without fail.',
    },
    overall_score: 96,
    overall_grade: 'A+',
    incharge_remarks: 'An anchor pillar of our senior faculty. Parents and students consistently rate Prof. Asim at the top of academic surveys.',
    incharge_recommendation: 'increment',
    evaluated_by_id: 'user-admin-apex',
    evaluated_by_name: 'Principal Syed Ali Raza',
    created_at: new Date('2026-10-26').toISOString(),
    updated_at: new Date('2026-10-26').toISOString(),
  },
  {
    id: 'eval-hina-bukhari-oct2026',
    school_id: 'school-apex',
    teacher_id: 'user-teacher-english',
    teacher_name: 'Ms. Hina Bukhari',
    teacher_email: 'hina.bukhari@imperialgrammar.edu.pk',
    subject_specialty: 'English Literature & Language Head',
    assigned_grades: ['Class 8', 'Class 9', 'Class 10 (O-Levels)'],
    month: 'October',
    year: 2026,
    language: {
      score: 5,
      rating: 'Eloquent & Native Tone',
      notes: 'Flawless English diction and literary pronunciation. Encourages quiet students to speak in morning debate sessions.',
    },
    dressing: {
      score: 5,
      rating: 'Elegant & Professional',
      notes: 'Strict adherence to formal dress code, displays school security badge, maintains immaculate classroom work desk.',
    },
    working: {
      score: 4,
      rating: 'Thorough Checking & Creative Work',
      notes: 'Detailed red-pen feedback on student essays. Oxford syllabus progress is ahead of scheduled milestones.',
    },
    regularity: {
      status: 'regular',
      score: 5,
      days_present: 22,
      days_absent: 0,
      late_arrivals: 1,
      notes: 'Highly dependable. Single 10-minute late arrival due to rainstorm, pre-notified bursar office.',
    },
    overall_score: 94,
    overall_grade: 'A+',
    incharge_remarks: 'Commendable leadership of the English Department and annual dramatics club.',
    incharge_recommendation: 'increment',
    evaluated_by_id: 'user-admin-apex',
    evaluated_by_name: 'Principal Syed Ali Raza',
    created_at: new Date('2026-10-26').toISOString(),
    updated_at: new Date('2026-10-26').toISOString(),
  },
  {
    id: 'eval-shahbaz-gill-oct2026',
    school_id: 'school-apex',
    teacher_id: 'user-teacher-science',
    teacher_name: 'Mr. Shahbaz Gill',
    teacher_email: 'shahbaz.gill@imperialgrammar.edu.pk',
    subject_specialty: 'Physics & Chemistry Laboratory',
    assigned_grades: ['Class 9', 'Class 10'],
    month: 'October',
    year: 2026,
    language: {
      score: 3,
      rating: 'Satisfactory / Colloquial',
      notes: 'Good technical grasp of physics principles but frequently reverts to regional Punjabi/Urdu slang during class explanations.',
    },
    dressing: {
      score: 3,
      rating: 'Casual / Non-Compliant',
      notes: 'Frequently seen wearing informal polo shirts and sports joggers. Must wear formal shirt, trousers and mandatory lab coat during practicals.',
    },
    working: {
      score: 3,
      rating: 'Moderate / Delayed Correction',
      notes: 'Science experiments are conducted well, but student practical journals were left unverified for 12 days.',
    },
    regularity: {
      status: 'irregular',
      score: 2,
      days_present: 17,
      days_absent: 4,
      late_arrivals: 5,
      notes: 'Flagged by biometric punch clock: 4 unscheduled absences and 5 late arrivals past 8:15 AM. Causes disruption in zero-period labs.',
    },
    overall_score: 64,
    overall_grade: 'C',
    incharge_remarks: 'Competent subject knowledge, but severe punctuality and dressing lapses require formal counseling and observation.',
    incharge_recommendation: 'guidance_required',
    evaluated_by_id: 'user-admin-apex',
    evaluated_by_name: 'Principal Syed Ali Raza',
    created_at: new Date('2026-10-26').toISOString(),
    updated_at: new Date('2026-10-26').toISOString(),
  },
  {
    id: 'eval-zafar-iqbal-oct2026',
    school_id: 'school-horizon',
    teacher_id: 'user-teacher-horizon',
    teacher_name: 'Prof. Zafar Iqbal',
    teacher_email: 'zafar.iqbal@highstar.edu.pk',
    subject_specialty: 'Urdu Literature, Grammar & Pakistan Studies',
    assigned_grades: ['Class 8', 'Class 9', 'Class 10'],
    month: 'October',
    year: 2026,
    language: {
      score: 5,
      rating: 'Scholarly Urdu & Eloquence',
      notes: 'Masterful command of classic Urdu literature, poetical verses, and respectful classroom communication.',
    },
    dressing: {
      score: 4,
      rating: 'Formal Traditional Dignity',
      notes: 'Neat traditional formal attire with tailored waistcoat and formal shoes. Very dignified appearance.',
    },
    working: {
      score: 4,
      rating: 'Disciplined & Board Focused',
      notes: 'Board past paper practice sheets prepared diligently. Students show marked improvement in Urdu essay composition.',
    },
    regularity: {
      status: 'regular',
      score: 4,
      days_present: 21,
      days_absent: 1,
      late_arrivals: 0,
      notes: 'Very regular. 1 day leave taken for pre-approved family medical checkup.',
    },
    overall_score: 89,
    overall_grade: 'A',
    incharge_remarks: 'Reliable and respected faculty member of High Star Public Secondary School.',
    incharge_recommendation: 'satisfactory',
    evaluated_by_id: 'user-admin-horizon',
    evaluated_by_name: 'Principal Dr. Qasim Khan',
    created_at: new Date('2026-10-26').toISOString(),
    updated_at: new Date('2026-10-26').toISOString(),
  },
];

export const INITIAL_PARENTS_REPORT: ParentReportCard[] = [
  {
    id: 'prc-pari',
    parent_id: 'user-parent-pari',
    school_id: 'school-apex',
    parent_name: 'Pari Khan (Mother of 4)',
    parent_email: 'pari@example.com',
    parent_phone: '+92 300 1234567',
    children_count: 4,
    children: [
      { student_id: 'student-pari-kg1', student_name: 'Zaviyar Ahmed Khan', class_id: 'KG 1', section: 'Rose', roll_number: 'AI-KG-01' },
      { student_id: 'student-pari-c2', student_name: 'Mirha Fatima Khan', class_id: 'Class 2', section: 'Tulip', roll_number: 'AI-C2-01' },
      { student_id: 'student-pari-c5', student_name: 'Muhammad Rayyan Khan', class_id: 'Class 5', section: 'Green', roll_number: 'AI-C5-01' },
      { student_id: 'student-pari-c9', student_name: 'Shahmeer Ali Khan', class_id: 'Class 9', section: 'Matric A', roll_number: 'AI-C9-01' },
    ],
    metrics: {
      last_active_at: new Date(Date.now() - 2 * 3600000).toISOString(),
      days_since_last_active: 0,
      logins_last_30_days: 29,
      usage_frequency: 'daily',
      diary_read_rate: 98,
      queries_asked_count: 7,
      alerts_acknowledged_count: 1,
      fee_payment_punctuality: 'prompt',
    },
    engagement_score: 98,
    vigilance_level: 'proactive',
    extense_attention_needed: false,
    teacher_notes: 'Exemplary home monitoring. Mother Pari actively checks daily homework feeds, assists kids with reading tree books, and promptly clarifies syllabus questions with teachers.',
    last_contacted_date: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prc-tariq',
    parent_id: 'user-parent-1',
    school_id: 'school-apex',
    parent_name: 'Tariq Mehmood',
    parent_email: 'tariq.mehmood@example.com',
    parent_phone: '+92 321 4567890',
    children_count: 2,
    children: [
      { student_id: 'student-1', student_name: 'Muhammad Hamza', class_id: 'Class 10 (O-Levels)', section: 'A', roll_number: 'AIC-101' },
      { student_id: 'student-3', student_name: 'Danial Qureshi', class_id: 'Class 10 (O-Levels)', section: 'A', roll_number: 'AIC-103' },
    ],
    metrics: {
      last_active_at: new Date(Date.now() - 28 * 3600000).toISOString(),
      days_since_last_active: 1,
      logins_last_30_days: 18,
      usage_frequency: 'every_few_days',
      diary_read_rate: 84,
      queries_asked_count: 3,
      alerts_acknowledged_count: 0,
      fee_payment_punctuality: 'prompt',
    },
    engagement_score: 84,
    vigilance_level: 'cooperative',
    extense_attention_needed: false,
    teacher_notes: 'Cooperative father. Regularly reviews mid-term datesheets and signs tuition vouchers. Children demonstrate good academic regularity.',
    last_contacted_date: new Date(Date.now() - 12 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prc-farooq',
    parent_id: 'user-parent-2',
    school_id: 'school-apex',
    parent_name: 'Farooq Siddiqui',
    parent_email: 'farooq.siddiqui@example.com',
    parent_phone: '+92 333 7890123',
    children_count: 2,
    children: [
      { student_id: 'student-2', student_name: 'Ayesha Siddiqui', class_id: 'Class 10 (O-Levels)', section: 'A', roll_number: 'AIC-102' },
      { student_id: 'student-4', student_name: 'Fatima Zahra', class_id: 'Class 10 (O-Levels)', section: 'A', roll_number: 'AIC-104' },
    ],
    metrics: {
      last_active_at: new Date(Date.now() - 17 * 86400000).toISOString(),
      days_since_last_active: 17,
      logins_last_30_days: 3,
      usage_frequency: 'monthly',
      diary_read_rate: 44,
      queries_asked_count: 0,
      alerts_acknowledged_count: 0,
      fee_payment_punctuality: 'requires_reminders',
    },
    engagement_score: 52,
    vigilance_level: 'passive',
    extense_attention_needed: true,
    attention_reason: 'Parent rarely opens school app (3 logins in 30 days) and seldom acknowledges diary feeds. Ayesha needs teacher follow-up during 1st period for homework verification.',
    teacher_notes: 'Father travels frequently; mentions he cannot check app often. Suggested mother or elder sibling be linked to PWA for daily homework awareness.',
    last_contacted_date: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prc-dormant',
    parent_id: 'user-parent-dormant',
    school_id: 'school-apex',
    parent_name: 'Kamran Malik',
    parent_email: 'kamran.malik@example.com',
    parent_phone: '+92 301 9876543',
    children_count: 1,
    children: [
      { student_id: 'student-5', student_name: 'Bilal Ahmed', class_id: 'Class 10 (O-Levels)', section: 'B', roll_number: 'AIC-105' },
    ],
    metrics: {
      last_active_at: new Date(Date.now() - 48 * 86400000).toISOString(),
      days_since_last_active: 48,
      logins_last_30_days: 0,
      usage_frequency: 'dormant',
      diary_read_rate: 0,
      queries_asked_count: 0,
      alerts_acknowledged_count: 0,
      fee_payment_punctuality: 'chronic_defaulter',
    },
    engagement_score: 18,
    vigilance_level: 'neglectful',
    extense_attention_needed: true,
    attention_reason: 'CRITICAL ALERT: Parent has zero app logins in 48 days. Never signs diary. Student Bilal lacks home study support and is slipping in Mathematics & Physics. Assign classroom study buddy immediately.',
    teacher_notes: 'Unresponsive to automated SMS alerts. Class teacher Prof. Asim Munir conducted a direct phone call. In-person meeting requested.',
    last_contacted_date: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const LocalStore = {
  getParentsReportCards(): ParentReportCard[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PARENTS_REPORT);
      return raw ? JSON.parse(raw) : INITIAL_PARENTS_REPORT;
    } catch {
      return INITIAL_PARENTS_REPORT;
    }
  },

  saveParentsReportCards(cards: ParentReportCard[]) {
    localStorage.setItem(STORAGE_KEYS.PARENTS_REPORT, JSON.stringify(cards));
    emitChange();
  },

  saveParentReportCard(card: ParentReportCard) {
    const list = this.getParentsReportCards();
    const idx = list.findIndex((c) => c.id === card.id || c.parent_id === card.parent_id);
    const updated = idx >= 0 ? list.map((c, i) => (i === idx ? card : c)) : [card, ...list];
    this.saveParentsReportCards(updated);
  },

  getTeacherProgressReports(): TeacherProgressEvaluation[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TEACHER_PROGRESS);
      return raw ? JSON.parse(raw) : INITIAL_TEACHER_PROGRESS;
    } catch {
      return INITIAL_TEACHER_PROGRESS;
    }
  },

  saveTeacherProgressReports(reports: TeacherProgressEvaluation[]) {
    localStorage.setItem(STORAGE_KEYS.TEACHER_PROGRESS, JSON.stringify(reports));
    emitChange();
  },

  saveTeacherProgressReport(report: TeacherProgressEvaluation) {
    const list = this.getTeacherProgressReports();
    const idx = list.findIndex((p) => p.id === report.id);
    const updated = idx >= 0 ? list.map((p, i) => (i === idx ? report : p)) : [report, ...list];
    this.saveTeacherProgressReports(updated);
  },

  getProgressReports(): MonthlyKidsProgress[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      return raw ? JSON.parse(raw) : INITIAL_PROGRESS;
    } catch {
      return INITIAL_PROGRESS;
    }
  },

  saveProgressReports(reports: MonthlyKidsProgress[]) {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(reports));
    emitChange();
  },

  saveKidsProgressReport(report: MonthlyKidsProgress) {
    const list = this.getProgressReports();
    const idx = list.findIndex((p) => p.id === report.id);
    const updated = idx >= 0 ? list.map((p, i) => (i === idx ? report : p)) : [report, ...list];
    this.saveProgressReports(updated);
  },

  subscribe(listener: StorageListener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getSchools(): School[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SCHOOLS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(INITIAL_SCHOOLS));
      return INITIAL_SCHOOLS;
    }
    const schools = JSON.parse(raw) as School[];
    // Existing demo data predates per-school skins. Give only those known
    // records their intended identity; never replace a skin the owner chose.
    const legacySkins: Record<string, NonNullable<School['skin']>> = {
      'school-apex': 'imperial',
      'school-horizon': 'highstar',
    };
    const hydrated = schools.map((school) =>
      school.skin || !legacySkins[school.id] ? school : {...school, skin: legacySkins[school.id]},
    );
    if (hydrated.some((school, index) => school !== schools[index])) {
      localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(hydrated));
    }
    return hydrated;
  },

  saveSchools(schools: School[]) {
    localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(schools));
    emitChange();
  },

  getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(raw);
  },

  saveUsers(users: User[]) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    emitChange();
  },

  getStudents(): Student[] {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
      return INITIAL_STUDENTS;
    }
    return JSON.parse(raw);
  },

  saveStudents(students: Student[]) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    emitChange();
  },

  getAttendance(): Attendance[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
      return INITIAL_ATTENDANCE;
    }
    return JSON.parse(raw);
  },

  saveAttendance(attendanceList: Attendance[]) {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceList));
    emitChange();
  },

  getFees(): Fee[] {
    const raw = localStorage.getItem(STORAGE_KEYS.FEES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.FEES, JSON.stringify(INITIAL_FEES));
      return INITIAL_FEES;
    }
    return JSON.parse(raw);
  },

  saveFees(fees: Fee[]) {
    localStorage.setItem(STORAGE_KEYS.FEES, JSON.stringify(fees));
    emitChange();
  },

  getResults(): Result[] {
    const raw = localStorage.getItem(STORAGE_KEYS.RESULTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(INITIAL_RESULTS));
      return INITIAL_RESULTS;
    }
    return JSON.parse(raw);
  },

  saveResults(results: Result[]) {
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
    emitChange();
  },

  getDiary(): DiaryEntry[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DIARY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify(INITIAL_DIARY));
      return INITIAL_DIARY;
    }
    try {
      const parsed: DiaryEntry[] = JSON.parse(raw);
      // Auto-migrate cached entries if they have legacy class_id 'Grade 10' or old external PDF URL
      let changed = false;
      const migrated = parsed.map((e) => {
        let entryChanged = false;
        let class_id = e.class_id;
        if (class_id === 'Grade 10') {
          class_id = 'Class 10 (O-Levels)';
          entryChanged = true;
        }
        const attachments = (e.attachments || []).map((att) => {
          if (att.url && att.url.includes('dummy.pdf')) {
            entryChanged = true;
            return { ...att, url: '/sample-daily-work-planner.pdf', fileName: 'sample-daily-work-planner.pdf' };
          }
          return att;
        });
        if (entryChanged) {
          changed = true;
          return { ...e, class_id, attachments };
        }
        return e;
      });
      if (changed) {
        localStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify(migrated));
        return migrated;
      }
      return parsed;
    } catch {
      localStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify(INITIAL_DIARY));
      return INITIAL_DIARY;
    }
  },

  saveDiary(entries: DiaryEntry[]) {
    localStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify(entries));
    emitChange();
  },

  getNotices(): Notice[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTICES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(INITIAL_NOTICES));
      return INITIAL_NOTICES;
    }
    return JSON.parse(raw);
  },

  saveNotices(notices: Notice[]) {
    localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(notices));
    emitChange();
  },

  getQueries(): CommunicationQuery[] {
    const raw = localStorage.getItem(STORAGE_KEYS.QUERIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.QUERIES, JSON.stringify(INITIAL_QUERIES));
      return INITIAL_QUERIES;
    }
    return JSON.parse(raw);
  },

  saveQueries(queries: CommunicationQuery[]) {
    localStorage.setItem(STORAGE_KEYS.QUERIES, JSON.stringify(queries));
    emitChange();
  },

  getAlerts(): AbsenceAlert[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ALERTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(INITIAL_ALERTS));
      return INITIAL_ALERTS;
    }
    return JSON.parse(raw);
  },

  saveAlerts(alerts: AbsenceAlert[]) {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    emitChange();
  },

  getDatesheets(): Datesheet[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DATESHEETS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DATESHEETS, JSON.stringify(INITIAL_DATESHEETS));
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(INITIAL_PROGRESS));
    localStorage.setItem(STORAGE_KEYS.TEACHER_PROGRESS, JSON.stringify(INITIAL_TEACHER_PROGRESS));
    localStorage.setItem(STORAGE_KEYS.PARENTS_REPORT, JSON.stringify(INITIAL_PARENTS_REPORT));
      return INITIAL_DATESHEETS;
    }
    return JSON.parse(raw);
  },

  saveDatesheets(datesheets: Datesheet[]) {
    localStorage.setItem(STORAGE_KEYS.DATESHEETS, JSON.stringify(datesheets));
    emitChange();
  },

  getCurrentSchoolId(): string {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_SCHOOL) || 'school-apex';
  },

  setCurrentSchoolId(schoolId: string) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_SCHOOL, schoolId);
    // Remove temporary preview override so school's native skin/branding displays
    localStorage.removeItem('owner_skin_v1');

    // Make sure the chosen school has complete data immediately so UI never goes blank
    const studentsOfSchool = this.getStudents().filter((s) => s.school_id === schoolId);
    if (studentsOfSchool.length === 0) {
      const targetSchool = this.getSchools().find((s) => s.id === schoolId);
      this.importSchoolDemoData(schoolId, targetSchool?.name);
    }

    // Also adjust current user to match school if needed
    const users = this.getUsers().filter((u) => u.school_id === schoolId);
    if (users.length > 0) {
      this.setCurrentUserId(users[0].id);
    }
    emitChange();
  },

  getCurrentUserId(): string {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || 'user-admin-apex';
  },

  setCurrentUserId(userId: string) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId);
    const user = this.getUsers().find((u) => u.id === userId);
    if (user && user.school_id) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_SCHOOL, user.school_id);
    }
    emitChange();
  },

  getSchoolSupabaseConfigs(): Record<string, SchoolSupabaseConfig> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SUPABASE_CONFIGS);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  saveSchoolSupabaseConfig(schoolId: string, config: Omit<SchoolSupabaseConfig, 'school_id' | 'updated_at'>) {
    const all = this.getSchoolSupabaseConfigs();
    all[schoolId] = {
      school_id: schoolId,
      ...config,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.SUPABASE_CONFIGS, JSON.stringify(all));
    emitChange();
  },

  removeSchoolSupabaseConfig(schoolId: string) {
    const all = this.getSchoolSupabaseConfigs();
    delete all[schoolId];
    localStorage.setItem(STORAGE_KEYS.SUPABASE_CONFIGS, JSON.stringify(all));
    emitChange();
  },

  importSchoolDemoData(schoolId: string, schoolName?: string): {
    studentsCount: number;
    feesCount: number;
    diaryCount: number;
    resultsCount: number;
    attendanceCount: number;
  } {
    const targetSchool = this.getSchools().find((s) => s.id === schoolId);
    const name = targetSchool?.name || schoolName || 'Demo Campus Academy';
    const generated = generateDemoDataForSchool(schoolId, name);

    // 1. Ensure school exists in schools list
    const existingSchools = this.getSchools();
    if (!existingSchools.some((s) => s.id === schoolId)) {
      const newSchool: School = {
        ...generated.school,
        id: schoolId,
        name,
      };
      this.saveSchools([...existingSchools, newSchool]);
    }

    // 2. Merge users (keep existing, add missing admin/teacher/parents)
    const existingUsers = this.getUsers();
    const existingUserIds = new Set(existingUsers.map((u) => u.id));
    const newUsers = generated.users.filter((u) => !existingUserIds.has(u.id));
    if (newUsers.length > 0) {
      this.saveUsers([...existingUsers, ...newUsers]);
    }

    // 3. Students: Remove previous students for this school, append 26 new
    const existingStudents = this.getStudents();
    const studentsOtherSchools = existingStudents.filter((s) => s.school_id !== schoolId);
    const oldStudentIdsOfSchool = new Set(existingStudents.filter((s) => s.school_id === schoolId).map((s) => s.id));
    this.saveStudents([...studentsOtherSchools, ...generated.students]);

    // 4. Fees: Remove fees belonging to old students of this school, append new
    const existingFees = this.getFees();
    const feesOtherSchools = existingFees.filter((f) => !oldStudentIdsOfSchool.has(f.student_id));
    this.saveFees([...feesOtherSchools, ...generated.fees]);

    // 5. Attendance: Remove attendance belonging to old students of this school, append new
    const existingAtt = this.getAttendance();
    const attOtherSchools = existingAtt.filter((a) => !oldStudentIdsOfSchool.has(a.student_id));
    this.saveAttendance([...attOtherSchools, ...generated.attendance]);

    // 6. Results: Remove results belonging to old students of this school, append new
    const existingRes = this.getResults();
    const resOtherSchools = existingRes.filter((r) => !oldStudentIdsOfSchool.has(r.student_id));
    this.saveResults([...resOtherSchools, ...generated.results]);

    // 7. Diary: Remove old diary for this school, append new
    const existingDiary = this.getDiary();
    const diaryOtherSchools = existingDiary.filter((d) => d.school_id !== schoolId);
    this.saveDiary([...diaryOtherSchools, ...generated.diary]);

    // 8. Notices: Remove old notices for this school, append new
    const existingNotices = this.getNotices();
    const noticesOtherSchools = existingNotices.filter((n) => n.school_id !== schoolId);
    this.saveNotices([...noticesOtherSchools, ...generated.notices]);

    // 9. Queries
    const existingQueries = this.getQueries();
    const queriesOtherSchools = existingQueries.filter((q) => q.school_id !== schoolId);
    this.saveQueries([...queriesOtherSchools, ...generated.queries]);

    // 10. Alerts
    const existingAlerts = this.getAlerts();
    const alertsOtherSchools = existingAlerts.filter((a) => a.school_id !== schoolId);
    this.saveAlerts([...alertsOtherSchools, ...generated.alerts]);

    // 11. Datesheets
    const existingDatesheets = this.getDatesheets();
    const datesheetsOtherSchools = existingDatesheets.filter((d) => d.school_id !== schoolId);
    this.saveDatesheets([...datesheetsOtherSchools, ...generated.datesheets]);

    // 12. Kids Monthly Progress
    const existingProgress = this.getProgressReports();
    const progressOtherSchools = existingProgress.filter((p) => p.school_id !== schoolId);
    this.saveProgressReports([...progressOtherSchools, ...generated.kidsProgress]);

    // 13. Teacher Appraisals
    const existingTeacherProgress = this.getTeacherProgressReports();
    const teacherProgressOtherSchools = existingTeacherProgress.filter((t) => t.school_id !== schoolId);
    this.saveTeacherProgressReports([...teacherProgressOtherSchools, ...generated.teacherProgress]);

    // 14. Parents Reports
    const existingParentsReports = this.getParentsReportCards();
    const parentsReportsOtherSchools = existingParentsReports.filter((p) => p.school_id !== schoolId);
    this.saveParentsReportCards([...parentsReportsOtherSchools, ...generated.parentsReports]);

    // 15. Set active school & admin user
    localStorage.setItem(STORAGE_KEYS.CURRENT_SCHOOL, schoolId);
    localStorage.removeItem('owner_skin_v1');
    const adminUser =
      this.getUsers().find((u) => u.school_id === schoolId && u.role === 'admin') ||
      generated.users.find((u) => u.role === 'admin');
    if (adminUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, adminUser.id);
    }

    emitChange();

    return {
      studentsCount: generated.students.length,
      feesCount: generated.fees.length,
      diaryCount: generated.diary.length,
      resultsCount: generated.results.length,
      attendanceCount: generated.attendance.length,
    };
  },

  purgeSchoolData(schoolId: string) {
    const existingStudents = this.getStudents();
    const schoolStudentIds = new Set(existingStudents.filter((s) => s.school_id === schoolId).map((s) => s.id));

    this.saveStudents(existingStudents.filter((s) => s.school_id !== schoolId));
    this.saveFees(this.getFees().filter((f) => !schoolStudentIds.has(f.student_id)));
    this.saveAttendance(this.getAttendance().filter((a) => !schoolStudentIds.has(a.student_id)));
    this.saveResults(this.getResults().filter((r) => !schoolStudentIds.has(r.student_id)));
    this.saveDiary(this.getDiary().filter((d) => d.school_id !== schoolId));
    this.saveNotices(this.getNotices().filter((n) => n.school_id !== schoolId));
    this.saveQueries(this.getQueries().filter((q) => q.school_id !== schoolId));
    this.saveAlerts(this.getAlerts().filter((a) => a.school_id !== schoolId));
    this.saveDatesheets(this.getDatesheets().filter((d) => d.school_id !== schoolId));
    emitChange();
  },

  resetDiaryToSample() {
    localStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify(INITIAL_DIARY));
    emitChange();
  },

  exportFullDataset(): FullSchoolDataset {
    return {
      version: '2.0-realistic',
      exported_at: new Date().toISOString(),
      description: 'Exported school application state',
      schools: this.getSchools(),
      users: this.getUsers(),
      students: this.getStudents(),
      attendance: this.getAttendance(),
      fees: this.getFees(),
      results: this.getResults(),
      diary: this.getDiary(),
      notices: this.getNotices(),
      queries: this.getQueries(),
      alerts: this.getAlerts(),
      datesheets: this.getDatesheets(),
    };
  },

  importFullDataset(data: Partial<FullSchoolDataset>) {
    if (data.schools && Array.isArray(data.schools)) {
      localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(data.schools));
    }
    if (data.users && Array.isArray(data.users)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users));
    }
    if (data.students && Array.isArray(data.students)) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(data.students));
    }
    if (data.attendance && Array.isArray(data.attendance)) {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(data.attendance));
    }
    if (data.fees && Array.isArray(data.fees)) {
      localStorage.setItem(STORAGE_KEYS.FEES, JSON.stringify(data.fees));
    }
    if (data.results && Array.isArray(data.results)) {
      localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(data.results));
    }
    if (data.diary && Array.isArray(data.diary)) {
      localStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify(data.diary));
    }
    if (data.notices && Array.isArray(data.notices)) {
      localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(data.notices));
    }
    if (data.queries && Array.isArray(data.queries)) {
      localStorage.setItem(STORAGE_KEYS.QUERIES, JSON.stringify(data.queries));
    }
    if (data.alerts && Array.isArray(data.alerts)) {
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(data.alerts));
    }
    if (data.datesheets && Array.isArray(data.datesheets)) {
      localStorage.setItem(STORAGE_KEYS.DATESHEETS, JSON.stringify(data.datesheets));
    }
    if (data.schools && data.schools.length > 0) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_SCHOOL, data.schools[0].id);
      const admin = data.users?.find(
        (u) => u.school_id === data.schools![0].id && (u.role === 'admin' || u.role === 'owner')
      );
      if (admin) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, admin.id);
      }
    }
    emitChange();
  },

  clearAllDemoData(keepSchoolOnly: boolean = true) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.FEES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.QUERIES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.DATESHEETS, JSON.stringify([]));
    if (!keepSchoolOnly) {
      localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
    }
    emitChange();
  },

  ensureAllSchoolsData() {
    const schools = this.getSchools();
    const students = this.getStudents();
    const diary = this.getDiary();
    const progress = this.getProgressReports();
    const teacherProgress = this.getTeacherProgressReports();
    const parentsReports = this.getParentsReportCards();

    for (const school of schools) {
      const hasStudents = students.some((s) => s.school_id === school.id);
      const hasDiary = diary.some((d) => d.school_id === school.id);
      const hasProg = progress.some((p) => p.school_id === school.id);
      const hasTeacherProg = teacherProgress.some((t) => t.school_id === school.id);
      const hasParents = parentsReports.some((pr) => pr.school_id === school.id);

      if (!hasStudents || !hasDiary || !hasProg || !hasTeacherProg || !hasParents) {
        this.importSchoolDemoData(school.id, school.name);
      }
    }
  },

  resetDefaults() {
    localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(INITIAL_SCHOOLS));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
    localStorage.setItem(STORAGE_KEYS.FEES, JSON.stringify(INITIAL_FEES));
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(INITIAL_RESULTS));
    localStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify(INITIAL_DIARY));
    localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(INITIAL_NOTICES));
    localStorage.setItem(STORAGE_KEYS.QUERIES, JSON.stringify(INITIAL_QUERIES));
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(INITIAL_ALERTS));
    localStorage.setItem(STORAGE_KEYS.DATESHEETS, JSON.stringify(INITIAL_DATESHEETS));
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(INITIAL_PROGRESS));
    localStorage.setItem(STORAGE_KEYS.TEACHER_PROGRESS, JSON.stringify(INITIAL_TEACHER_PROGRESS));
    localStorage.setItem(STORAGE_KEYS.PARENTS_REPORT, JSON.stringify(INITIAL_PARENTS_REPORT));
    localStorage.setItem(STORAGE_KEYS.CURRENT_SCHOOL, 'school-apex');
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, 'user-admin-apex');
    this.ensureAllSchoolsData();
    emitChange();
  },
};
