import {
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
  CURRENT_USER: 'sms_current_user_id_v1',
  CURRENT_SCHOOL: 'sms_current_school_id_v1',
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
    name: 'Crescent Model Higher Secondary School',
    motto: 'Excellence in Character, Intellect & Leadership',
    logo_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=160&auto=format&fit=crop&q=80',
    primary_color: '#5B0202', // Deep Burgundy
    secondary_color: '#8B0000', // Crimson
    address: 'Shadman Campus, Lahore, Pakistan',
    phone: '+92 (42) 3742-1200',
    skin: 'highstar',
    created_at: new Date('2024-02-01').toISOString(),
  },
];

export const INITIAL_USERS: User[] = [
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
  // Horizon STEM Users
  {
    id: 'user-admin-horizon',
    school_id: 'school-horizon',
    full_name: 'Principal Dr. Qasim Khan',
    role: 'admin',
    email: 'admin@crescentmodel.edu.pk',
    created_at: new Date('2024-02-01').toISOString(),
  },
  {
    id: 'user-teacher-horizon',
    school_id: 'school-horizon',
    full_name: 'Prof. Zafar Iqbal',
    role: 'teacher',
    email: 'zafar.iqbal@crescentmodel.edu.pk',
    created_at: new Date('2024-02-15').toISOString(),
  },
];

export const INITIAL_STUDENTS: Student[] = [
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
  // Horizon STEM Students
  {
    id: 'student-h1',
    school_id: 'school-horizon',
    roll_number: 'CMS-201',
    name: 'Syed Ali Hassan',
    class_id: 'FSc Pre-Medical (Part 1)',
    section: 'A',
    parent_id: 'user-parent-1',
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
    class_id: 'Grade 10',
    section: 'A',
    subject: 'Mathematics',
    date: TODAY_STR,
    classwork: 'Completed Exercise 4.3 (Quadratic equations by factorization method). Discussed standard form ax² + bx + c = 0 and solved examples 7 to 11 on chalkboard.',
    homework: 'Solve textbook Questions 5, 8, 12 on neat registers. Prepare Theorem 4.1 for tomorrow morning test.',
    due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    teacher_id: 'user-teacher-apex',
    teacher_name: 'Prof. Marcus Brody',
    attachments: [
      {
        id: 'att-101',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&auto=format&fit=crop&q=80',
        caption: 'Classroom Whiteboard - Formula derivations & step-by-step example',
      },
    ],
    read_by_parents: [
      {
        parent_id: 'user-parent-1',
        parent_name: 'Sarah Jenkins',
        student_id: 'student-1',
        student_name: 'Liam Jenkins',
        read_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 'diary-2',
    school_id: 'school-apex',
    class_id: 'Grade 10',
    section: 'A',
    subject: 'Physics',
    date: TODAY_STR,
    classwork: 'Chapter 14: Electromagnetic Induction. Lab demonstration of Faraday Law with bar magnet, coil, and galvanometer.',
    homework: 'Write practical observations in Physics Lab Journal (Experiment 6). Complete numerical problems 1 to 4 on page 142.',
    due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    teacher_id: 'user-teacher-apex',
    teacher_name: 'Prof. Marcus Brody',
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
    class_id: 'Grade 10',
    section: 'A',
    subject: 'English Literature',
    date: TODAY_STR,
    classwork: 'Analyzed Act III Scene 2 of Julius Caesar (Mark Antony speech). Discussed rhetorical questions and emotional appeal.',
    homework: 'Write a 250-word critique analyzing Antony persuasive techniques. Memorize lines 75-90.',
    due_date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    teacher_id: 'user-teacher-apex',
    teacher_name: 'Prof. Marcus Brody',
    read_by_parents: [
      {
        parent_id: 'user-parent-1',
        parent_name: 'Sarah Jenkins',
        student_id: 'student-1',
        student_name: 'Liam Jenkins',
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
  {
    id: 'query-1',
    school_id: 'school-apex',
    student_id: 'student-1',
    student_name: 'Liam Jenkins',
    student_class: 'Grade 10 - Section A',
    parent_id: 'user-parent-1',
    parent_name: 'Sarah Jenkins',
    teacher_id: 'user-teacher-apex',
    teacher_name: 'Prof. Marcus Brody',
    subject: 'Catch-up help for Physics practical experiment',
    status: 'open',
    category: 'academic',
    created_at: new Date(Date.now() - 14400000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString(),
    messages: [
      {
        id: 'msg-1',
        sender_id: 'user-parent-1',
        sender_name: 'Sarah Jenkins',
        sender_role: 'parent',
        text: 'Respected Sir, Liam was reviewing the Electromagnetic Induction diary notes today. Could you please confirm if he needs to bring the practical journal tomorrow?',
        sent_at: new Date(Date.now() - 14400000).toISOString(),
      },
      {
        id: 'msg-2',
        sender_id: 'user-teacher-apex',
        sender_name: 'Prof. Marcus Brody',
        sender_role: 'teacher',
        text: 'Hello Mrs. Jenkins, yes! We will complete the observation table during 3rd period. He should bring his journal and graph paper.',
        sent_at: new Date(Date.now() - 7200000).toISOString(),
      },
    ],
  },
];

export const INITIAL_ALERTS: AbsenceAlert[] = [
  {
    id: 'alert-1',
    school_id: 'school-apex',
    student_id: 'student-3',
    student_name: 'Ethan Miller',
    roll_number: 'APX-103',
    class_id: 'Grade 10',
    section: 'A',
    date: TODAY_STR,
    parent_id: 'user-parent-3',
    parent_name: 'Robert Miller',
    parent_email: 'robert.miller@example.com',
    sent_at: new Date().toISOString(),
    status: 'sent',
  },
];

export const INITIAL_DATESHEETS: Datesheet[] = [
  {
    id: 'datesheet-apex-10',
    school_id: 'school-apex',
    title: 'Mid-Term Examinations 2026',
    class_id: 'Grade 10',
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

export const LocalStore = {
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
    return JSON.parse(raw);
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
    localStorage.setItem(STORAGE_KEYS.CURRENT_SCHOOL, 'school-apex');
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, 'user-admin-apex');
    emitChange();
  },
};
