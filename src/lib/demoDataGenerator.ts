import {
  Student,
  Fee,
  Attendance,
  Result,
  DiaryEntry,
  Notice,
  CommunicationQuery,
  AbsenceAlert,
  Datesheet,
  User,
  School,
  MonthlyKidsProgress,
  TeacherProgressEvaluation,
  ParentReportCard,
} from '../types';

export interface GeneratedSchoolDemo {
  school: School;
  users: User[];
  students: Student[];
  fees: Fee[];
  attendance: Attendance[];
  results: Result[];
  diary: DiaryEntry[];
  notices: Notice[];
  queries: CommunicationQuery[];
  alerts: AbsenceAlert[];
  datesheets: Datesheet[];
  kidsProgress: MonthlyKidsProgress[];
  teacherProgress: TeacherProgressEvaluation[];
  parentsReports: ParentReportCard[];
}

const PAKISTANI_NAMES = [
  { student: 'Muhammad Bilal', parent: 'Tariq Mehmood', phone: '+92 300 4819283' },
  { student: 'Fatima Zahra', parent: 'Farooq Siddiqui', phone: '+92 321 9845120' },
  { student: 'Hamza Ali Khan', parent: 'Shahid Nadeem Khan', phone: '+92 333 4129845' },
  { student: 'Ayesha Siddiqua', parent: 'Dr. Munir Ahmed', phone: '+92 345 6128471' },
  { student: 'Zaid Ahmed', parent: 'Khurram Shehzad', phone: '+92 301 7892341' },
  { student: 'Zainab Noor', parent: 'Naveed Akhtar', phone: '+92 312 8763451' },
  { student: 'Mustafa Hassan', parent: 'Hassan Raza', phone: '+92 334 5671234' },
  { student: 'Dua Fatima', parent: 'Waqas Bashir', phone: '+92 322 3456789' },
  { student: 'Abdullah Qureshi', parent: 'Salman Qureshi', phone: '+92 302 4567890' },
  { student: 'Maryam Nawazish', parent: 'Nawazish Ali', phone: '+92 313 5678901' },
  { student: 'Ibrahim Khalil', parent: 'Khalil-ur-Rehman', phone: '+92 335 6789012' },
  { student: 'Eshal Imran', parent: 'Imran Ashraf', phone: '+92 346 7890123' },
  { student: 'Rayyan Shah', parent: 'Syed Asif Shah', phone: '+92 323 8901234' },
  { student: 'Anaya Tariq', parent: 'Tariq Jamil', phone: '+92 303 9012345' },
  { student: 'Ayaan Malik', parent: 'Malik Sohail', phone: '+92 314 0123456' },
  { student: 'Hoorain Fatima', parent: 'Kamran Akram', phone: '+92 336 1234567' },
  { student: 'Saad Rizwan', parent: 'Muhammad Rizwan', phone: '+92 347 2345678' },
  { student: 'Manha Babar', parent: 'Babar Azam', phone: '+92 324 3456789' },
  { student: 'Umar Farooq', parent: 'Farooq Abdullah', phone: '+92 304 4567890' },
  { student: 'Syeda Hania Bokhari', parent: 'Syed Tanveer Bokhari', phone: '+92 315 5678901' },
  { student: 'Rohaan Dar', parent: 'Khurram Dar', phone: '+92 337 6789012' },
  { student: 'Areeba Kashif', parent: 'Kashif Mehmood', phone: '+92 348 7890123' },
  { student: 'Ali Asghar', parent: 'Asghar Ali', phone: '+92 325 8901234' },
  { student: 'Khadija Tul Kubra', parent: 'Haider Zaman', phone: '+92 305 9012345' },
  { student: 'Danyal Mir', parent: 'Mirza Jahangir', phone: '+92 316 0123456' },
  { student: 'Zunaira Faisal', parent: 'Faisal Latif', phone: '+92 338 1234567' },
];

function getPrefix(schoolName: string): string {
  const words = schoolName.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return words.slice(0, 3).map((w) => w[0].toUpperCase()).join('');
  }
  return 'SCH';
}

export function generateDemoDataForSchool(schoolId: string, schoolName?: string): GeneratedSchoolDemo {
  const name = schoolName || 'Demo Campus Academy';
  const prefix = getPrefix(name);
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // 1. Users (Admin, Teacher, Parents)
  const adminId = `user-admin-${schoolId}`;
  const teacherId = `user-teacher-${schoolId}`;
  const teacher2Id = `user-teacher-eng-${schoolId}`;
  const teacher3Id = `user-teacher-sci-${schoolId}`;

  const adminUser: User = {
    id: adminId,
    school_id: schoolId,
    full_name: `Principal (${name})`,
    role: 'admin',
    email: `admin@${schoolId.replace(/[^a-z0-9]/gi, '').toLowerCase()}.edu.pk`,
    created_at: new Date(now.getTime() - 90 * 86400000).toISOString(),
  };

  const teacherUser: User = {
    id: teacherId,
    school_id: schoolId,
    full_name: 'Senior Master Riaz-ul-Hassan',
    role: 'teacher',
    email: `riaz.hassan@${schoolId.replace(/[^a-z0-9]/gi, '').toLowerCase()}.edu.pk`,
    created_at: new Date(now.getTime() - 80 * 86400000).toISOString(),
  };

  const teacher2User: User = {
    id: teacher2Id,
    school_id: schoolId,
    full_name: 'Ms. Sadia Parveen (English Head)',
    role: 'teacher',
    email: `sadia.parveen@${schoolId.replace(/[^a-z0-9]/gi, '').toLowerCase()}.edu.pk`,
    created_at: new Date(now.getTime() - 75 * 86400000).toISOString(),
  };

  const teacher3User: User = {
    id: teacher3Id,
    school_id: schoolId,
    full_name: 'Prof. Shahbaz Ahmed (Sciences)',
    role: 'teacher',
    email: `shahbaz.ahmed@${schoolId.replace(/[^a-z0-9]/gi, '').toLowerCase()}.edu.pk`,
    created_at: new Date(now.getTime() - 70 * 86400000).toISOString(),
  };

  const parentUsers: User[] = [];
  const students: Student[] = [];
  const fees: Fee[] = [];
  const attendance: Attendance[] = [];
  const results: Result[] = [];

  const classes = [
    { classId: 'Grade 10', section: 'A', count: 4 },
    { classId: 'Grade 9', section: 'Matric A', count: 4 },
    { classId: 'Grade 8', section: 'B', count: 4 },
    { classId: 'Grade 7', section: 'A', count: 3 },
    { classId: 'Grade 6', section: 'B', count: 3 },
    { classId: 'Grade 5', section: 'Green', count: 3 },
    { classId: 'Grade 4', section: 'A', count: 3 },
    { classId: 'Grade 3', section: 'B', count: 3 },
    { classId: 'Grade 2', section: 'Tulip', count: 3 },
    { classId: 'Grade 1', section: 'A', count: 3 },
    { classId: 'KG 1', section: 'Rose', count: 3 },
  ];

  let nameIndex = 0;

  classes.forEach(({ classId, section, count }) => {
    for (let i = 1; i <= count; i++) {
      const person = PAKISTANI_NAMES[nameIndex % PAKISTANI_NAMES.length];
      nameIndex++;

      const studentId = `std-${schoolId}-${nameIndex}`;
      const parentId = `prnt-${schoolId}-${nameIndex}`;
      const rollNo = `${prefix}-${classId.replace(/\D/g, '') || '00'}-${String(i).padStart(2, '0')}`;

      // Parent user
      const parentUser: User = {
        id: parentId,
        school_id: schoolId,
        full_name: person.parent,
        role: 'parent',
        email: `${person.parent.toLowerCase().replace(/[^a-z0-9]/g, '.')}@example.com`,
        created_at: new Date(now.getTime() - 60 * 86400000).toISOString(),
      };
      parentUsers.push(parentUser);

      // Student record
      const student: Student = {
        id: studentId,
        school_id: schoolId,
        roll_number: rollNo,
        name: person.student,
        class_id: classId,
        section,
        parent_id: parentId,
        parent_name: person.parent,
        parent_email: parentUser.email,
        parent_phone: person.phone,
        created_at: new Date(now.getTime() - 50 * 86400000).toISOString(),
      };
      students.push(student);

      // Fee voucher
      const isPaid = nameIndex % 4 !== 0; // 75% paid, 25% pending
      const feeAmount = 12500 + (nameIndex % 5) * 1500;
      fees.push({
        id: `fee-${schoolId}-${nameIndex}`,
        student_id: studentId,
        amount: feeAmount,
        status: isPaid ? 'paid' : 'pending',
        due_date: new Date(now.getTime() + 10 * 86400000).toISOString().split('T')[0],
        updated_at: new Date(now.getTime() - (nameIndex % 15) * 86400000).toISOString(),
        term: 'Monthly Academic Tuition',
        receipt_number: `REC-${prefix}-${1000 + nameIndex}`,
      });

      // Attendance
      const attStatus = nameIndex % 11 === 0 ? 'absent' : nameIndex % 7 === 0 ? 'late' : 'present';
      attendance.push({
        id: `att-${schoolId}-${nameIndex}`,
        student_id: studentId,
        date: todayStr,
        status: attStatus,
        marked_by: teacherId,
        created_at: new Date().toISOString(),
      });

      // Academic Result Card
      const mathMarks = 75 + ((nameIndex * 3) % 24);
      const engMarks = 70 + ((nameIndex * 5) % 28);
      const sciMarks = 78 + ((nameIndex * 7) % 22);
      const totalMarks = mathMarks + engMarks + sciMarks + 85 + 90; // out of 500
      const pct = Math.round((totalMarks / 500) * 100);
      const grade = pct >= 80 ? 'A+' : pct >= 70 ? 'A' : pct >= 60 ? 'B' : 'C';

      results.push({
        id: `res-${schoolId}-${nameIndex}`,
        student_id: studentId,
        term: 'mid_term',
        total_marks: totalMarks,
        grade,
        percentage: pct,
        class_rank: (nameIndex % count) + 1,
        attendance_percentage: 92 - (nameIndex % 10),
        conduct: 'Disciplined, respectful and actively participates in classroom discussions.',
        created_at: new Date(now.getTime() - 20 * 86400000).toISOString(),
        marks_json: [
          { subject: 'Mathematics', max_marks: 100, obtained_marks: mathMarks, grade: mathMarks >= 80 ? 'A+' : 'A' },
          { subject: 'English Literature', max_marks: 100, obtained_marks: engMarks, grade: engMarks >= 80 ? 'A+' : 'A' },
          { subject: classId.includes('10') ? 'Physics & Lab' : 'General Science', max_marks: 100, obtained_marks: sciMarks, grade: sciMarks >= 80 ? 'A+' : 'A' },
          { subject: 'Urdu Language', max_marks: 100, obtained_marks: 85, grade: 'A+' },
          { subject: 'Islamiyat & Ethics', max_marks: 100, obtained_marks: 90, grade: 'A+' },
        ],
      });
    }
  });

  // Guaranteed Parent Pari & 4 Children for testing (KG 1, Class 2, Class 5, Class 9)
  const pariId = `user-pari-${schoolId}`;
  parentUsers.push({
    id: pariId,
    school_id: schoolId,
    full_name: 'Pari Khan (Mother of 4)',
    role: 'parent',
    email: 'pari@example.com',
    created_at: new Date(now.getTime() - 60 * 86400000).toISOString(),
  });

  const pariKidsData = [
    { name: 'Zaviyar Ahmed Khan', classId: 'KG 1', section: 'Rose', roll: `${prefix}-KG-01` },
    { name: 'Mirha Fatima Khan', classId: 'Class 2', section: 'Tulip', roll: `${prefix}-C2-01` },
    { name: 'Muhammad Rayyan Khan', classId: 'Class 5', section: 'Green', roll: `${prefix}-C5-01` },
    { name: 'Shahmeer Ali Khan', classId: 'Class 9', section: 'Matric A', roll: `${prefix}-C9-01` },
  ];

  pariKidsData.forEach((k, idx) => {
    const sId = `std-pari-${schoolId}-${idx + 1}`;
    students.push({
      id: sId,
      school_id: schoolId,
      roll_number: k.roll,
      name: k.name,
      class_id: k.classId,
      section: k.section,
      parent_id: pariId,
      parent_name: 'Pari Khan',
      parent_email: 'pari@example.com',
      parent_phone: '+92 300 1234567',
      created_at: new Date(now.getTime() - 40 * 86400000).toISOString(),
    });
    fees.push({
      id: `fee-pari-${schoolId}-${idx + 1}`,
      student_id: sId,
      amount: 9500 + idx * 1000,
      status: 'paid',
      due_date: new Date(now.getTime() + 10 * 86400000).toISOString().split('T')[0],
      updated_at: new Date(now.getTime() - 2 * 86400000).toISOString(),
      term: 'Tuition Fee',
      receipt_number: `REC-PARI-${prefix}-${idx + 1}`,
    });
    attendance.push({
      id: `att-pari-${schoolId}-${idx + 1}`,
      student_id: sId,
      date: todayStr,
      status: 'present',
      marked_by: teacherId,
      created_at: new Date().toISOString(),
    });
    results.push({
      id: `res-pari-${schoolId}-${idx + 1}`,
      student_id: sId,
      term: 'mid_term',
      total_marks: 460 + idx * 5,
      grade: 'A+',
      percentage: Math.round(((460 + idx * 5) / 500) * 100),
      class_rank: 1,
      attendance_percentage: 98,
      conduct: 'Exemplary character, punctual and well-behaved.',
      created_at: new Date(now.getTime() - 10 * 86400000).toISOString(),
      marks_json: [
        { subject: 'English', max_marks: 100, obtained_marks: 95, grade: 'A+' },
        { subject: 'Urdu', max_marks: 100, obtained_marks: 92, grade: 'A+' },
        { subject: 'Mathematics / Numeracy', max_marks: 100, obtained_marks: 96, grade: 'A+' },
        { subject: 'General Knowledge', max_marks: 100, obtained_marks: 90, grade: 'A+' },
        { subject: 'Arts & Crafts', max_marks: 100, obtained_marks: 92, grade: 'A+' },
      ],
    });
  });

  // Guaranteed Parent Aisha & 5 Children for testing (Grade 1, Grade 3, Grade 4, Grade 6, Grade 7)
  const aishaId = `user-aisha-${schoolId}`;
  parentUsers.push({
    id: aishaId,
    school_id: schoolId,
    full_name: 'Aisha Bibi (Mother of 5)',
    role: 'parent',
    email: 'aisha.bibi@example.com',
    created_at: new Date(now.getTime() - 65 * 86400000).toISOString(),
  });

  const aishaKidsData = [
    { name: 'Hamza Tariq', classId: 'Grade 1', section: 'A', roll: `${prefix}-C1-01` },
    { name: 'Fatima Tariq', classId: 'Grade 3', section: 'B', roll: `${prefix}-C3-01` },
    { name: 'Umar Tariq', classId: 'Grade 4', section: 'A', roll: `${prefix}-C4-01` },
    { name: 'Zainab Tariq', classId: 'Grade 6', section: 'B', roll: `${prefix}-C6-01` },
    { name: 'Usman Tariq', classId: 'Grade 7', section: 'A', roll: `${prefix}-C7-01` },
  ];

  aishaKidsData.forEach((k, idx) => {
    const sId = `std-aisha-${schoolId}-${idx + 1}`;
    students.push({
      id: sId,
      school_id: schoolId,
      roll_number: k.roll,
      name: k.name,
      class_id: k.classId,
      section: k.section,
      parent_id: aishaId,
      parent_name: 'Aisha Bibi',
      parent_email: 'aisha.bibi@example.com',
      parent_phone: '+92 302 5551234',
      created_at: new Date(now.getTime() - 45 * 86400000).toISOString(),
    });
    fees.push({
      id: `fee-aisha-${schoolId}-${idx + 1}`,
      student_id: sId,
      amount: 11000 + idx * 800,
      status: 'paid',
      due_date: new Date(now.getTime() + 10 * 86400000).toISOString().split('T')[0],
      updated_at: new Date(now.getTime() - 2 * 86400000).toISOString(),
      term: 'Tuition Fee',
      receipt_number: `REC-AISHA-${prefix}-${idx + 1}`,
    });
    attendance.push({
      id: `att-aisha-${schoolId}-${idx + 1}`,
      student_id: sId,
      date: todayStr,
      status: 'present',
      marked_by: teacherId,
      created_at: new Date().toISOString(),
    });
    results.push({
      id: `res-aisha-${schoolId}-${idx + 1}`,
      student_id: sId,
      term: 'mid_term',
      total_marks: 440 + idx * 7,
      grade: 'A',
      percentage: Math.round(((440 + idx * 7) / 500) * 100),
      class_rank: idx + 1,
      attendance_percentage: 96,
      conduct: 'Polite, diligent with homework and very cooperative.',
      created_at: new Date(now.getTime() - 10 * 86400000).toISOString(),
      marks_json: [
        { subject: 'English', max_marks: 100, obtained_marks: 88, grade: 'A' },
        { subject: 'Urdu', max_marks: 100, obtained_marks: 90, grade: 'A+' },
        { subject: 'Mathematics', max_marks: 100, obtained_marks: 92, grade: 'A+' },
        { subject: 'General Science', max_marks: 100, obtained_marks: 86, grade: 'A' },
        { subject: 'Islamiyat', max_marks: 100, obtained_marks: 91, grade: 'A+' },
      ],
    });
  });

  // Diary Entries (8 realistic lessons)
  const diary: DiaryEntry[] = [
    {
      id: `diary-${schoolId}-1`,
      school_id: schoolId,
      class_id: 'Grade 10',
      section: 'A',
      subject: 'Mathematics',
      date: todayStr,
      classwork: 'Chapter 4: Quadratic Equations. Solved exercise 4.2 questions 1 through 8 on blackboard.',
      homework: 'Complete Exercise 4.2 remaining questions 9 to 15 in homework notebook.',
      due_date: new Date(now.getTime() + 86400000).toISOString().split('T')[0],
      teacher_id: teacherId,
      teacher_name: 'Senior Master Riaz-ul-Hassan',
      created_at: new Date(now.getTime() - 2 * 3600000).toISOString(),
      attachments: [
        {
          id: `att-img-${schoolId}-1`,
          type: 'image',
          url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
          caption: 'Class Work & Board Notes - Quadratic Formulas',
          fileName: 'BoardWork-Ch4.jpg',
        },
      ],
      read_by_parents: [
        {
          parent_id: parentUsers[0]?.id || 'p-1',
          parent_name: parentUsers[0]?.full_name || 'Guardian',
          student_id: students[0]?.id || 's-1',
          student_name: students[0]?.name || 'Student',
          read_at: new Date().toISOString(),
        },
      ],
    },
    {
      id: `diary-${schoolId}-2`,
      school_id: schoolId,
      class_id: 'Grade 10',
      section: 'A',
      subject: 'Physics',
      date: todayStr,
      classwork: "Electromagnetism - Faraday's Law of Induction demonstration in Physics laboratory.",
      homework: 'Revise textbook pages 142-147 and prepare conceptual questions for viva.',
      due_date: new Date(now.getTime() + 86400000).toISOString().split('T')[0],
      teacher_id: teacherId,
      teacher_name: 'Senior Master Riaz-ul-Hassan',
      created_at: new Date(now.getTime() - 4 * 3600000).toISOString(),
      attachments: [
        {
          id: `att-img-${schoolId}-2`,
          type: 'image',
          url: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&auto=format&fit=crop&q=80',
          caption: 'Lab Worksheet Diagram - Magnetic flux and induced current setup',
          fileName: 'Physics-Lab-Exp4.jpg',
        },
      ],
      read_by_parents: [],
    },
    {
      id: `diary-${schoolId}-3`,
      school_id: schoolId,
      class_id: 'Grade 9',
      section: 'Matric A',
      subject: 'English Language',
      date: todayStr,
      classwork: 'Formal Letter Writing and Essay Composition on "Clean Green Pakistan".',
      homework: 'Draft a 250-word editorial letter to the newspaper editor regarding traffic control.',
      due_date: new Date(now.getTime() + 86400000).toISOString().split('T')[0],
      teacher_id: teacher2Id,
      teacher_name: 'Ms. Sadia Parveen (English Head)',
      created_at: new Date(now.getTime() - 5 * 3600000).toISOString(),
      attachments: [
        {
          id: `att-doc-${schoolId}-3`,
          type: 'document',
          url: '/sample-daily-work-planner.pdf',
          caption: 'Class 9 CamScanner Daily Work Planner & Essay Rubric',
          fileName: 'sample-daily-work-planner.pdf',
        },
      ],
      read_by_parents: [
        {
          parent_id: pariId,
          parent_name: 'Pari Khan',
          student_id: `std-pari-${schoolId}-4`,
          student_name: 'Shahmeer Ali Khan',
          read_at: new Date(now.getTime() - 2 * 3600000).toISOString(),
        },
      ],
    },
    {
      id: `diary-${schoolId}-4`,
      school_id: schoolId,
      class_id: 'Grade 9',
      section: 'Matric A',
      subject: 'Chemistry',
      date: todayStr,
      classwork: 'Periodic Table Trends: Electronegativity and Electron Affinity explanations.',
      homework: 'Draw atomic radii trend diagram and memorize group 1 & 2 elements.',
      due_date: new Date(now.getTime() + 86400000).toISOString().split('T')[0],
      teacher_id: teacher3Id,
      teacher_name: 'Prof. Shahbaz Ahmed (Sciences)',
      created_at: new Date(now.getTime() - 6 * 3600000).toISOString(),
      attachments: [
        {
          id: `att-img-${schoolId}-4`,
          type: 'image',
          url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80',
          caption: 'Periodic Table Trend Chart & Electron Affinity Diagram',
          fileName: 'Chemistry-Trends-Ch3.jpg',
        },
      ],
      read_by_parents: [],
    },
    {
      id: `diary-${schoolId}-5`,
      school_id: schoolId,
      class_id: 'Grade 8',
      section: 'B',
      subject: 'Computer Science',
      date: todayStr,
      classwork: 'Python Programming: While loops and conditional if-else statements with hands-on practice.',
      homework: 'Write a program to generate multiplication table for user input number.',
      due_date: new Date(now.getTime() + 86400000).toISOString().split('T')[0],
      teacher_id: teacherId,
      teacher_name: 'Senior Master Riaz-ul-Hassan',
      created_at: new Date(now.getTime() - 7 * 3600000).toISOString(),
      attachments: [
        {
          id: `att-img-${schoolId}-5`,
          type: 'image',
          url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop&q=80',
          caption: 'Python Coding Output Screenshot & Loop Structure',
          fileName: 'Python-Loops.png',
        },
      ],
      read_by_parents: [],
    },
    {
      id: `diary-${schoolId}-6`,
      school_id: schoolId,
      class_id: 'Grade 7',
      section: 'A',
      subject: 'General Science',
      date: todayStr,
      classwork: 'Plant and animal cells under microscope: Cell membrane, cytoplasm, and chloroplast.',
      homework: 'Complete neat diagrams of onion cell and cheek cell on practical sheet.',
      due_date: new Date(now.getTime() + 86400000).toISOString().split('T')[0],
      teacher_id: teacher3Id,
      teacher_name: 'Prof. Shahbaz Ahmed (Sciences)',
      created_at: new Date(now.getTime() - 8 * 3600000).toISOString(),
      attachments: [
        {
          id: `att-img-${schoolId}-6`,
          type: 'image',
          url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop&q=80',
          caption: 'Microscope Cell Observation & Specimen Diagram',
          fileName: 'Microscope-Cell-Notes.jpg',
        },
      ],
      read_by_parents: [
        {
          parent_id: aishaId,
          parent_name: 'Aisha Bibi',
          student_id: `std-aisha-${schoolId}-5`,
          student_name: 'Usman Tariq',
          read_at: new Date(now.getTime() - 3 * 3600000).toISOString(),
        },
      ],
    },
    {
      id: `diary-${schoolId}-7`,
      school_id: schoolId,
      class_id: 'Grade 6',
      section: 'B',
      subject: 'Mathematics',
      date: todayStr,
      classwork: 'Fractions, Decimals and Percentages conversion formulas with blackboard exercises.',
      homework: 'Exercise 2.4 questions 1 to 10 in homework register.',
      due_date: new Date(now.getTime() + 86400000).toISOString().split('T')[0],
      teacher_id: teacherId,
      teacher_name: 'Senior Master Riaz-ul-Hassan',
      created_at: new Date(now.getTime() - 8.5 * 3600000).toISOString(),
      attachments: [
        {
          id: `att-img-${schoolId}-7`,
          type: 'image',
          url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
          caption: 'Board Work: Step-by-step Fraction Conversion Formulas',
        },
      ],
      read_by_parents: [
        {
          parent_id: aishaId,
          parent_name: 'Aisha Bibi',
          student_id: `std-aisha-${schoolId}-4`,
          student_name: 'Zainab Tariq',
          read_at: new Date(now.getTime() - 4 * 3600000).toISOString(),
        },
      ],
    },
    {
      id: `diary-${schoolId}-8`,
      school_id: schoolId,
      class_id: 'Grade 5',
      section: 'Green',
      subject: 'Mathematics',
      date: todayStr,
      classwork: 'Long division with 2-digit divisors and remainder calculations.',
      homework: 'Page 58 Exercise 3.4 sums 1 to 10.',
      due_date: new Date(now.getTime() + 86400000).toISOString().split('T')[0],
      teacher_id: teacherId,
      teacher_name: 'Senior Master Riaz-ul-Hassan',
      created_at: new Date(now.getTime() - 9 * 3600000).toISOString(),
      attachments: [
        {
          id: `att-img-${schoolId}-8`,
          type: 'image',
          url: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&auto=format&fit=crop&q=80',
          caption: 'Whiteboard Long Division Steps & Remainder Proof',
          fileName: 'Long-Division-Steps.jpg',
        },
      ],
      read_by_parents: [
        {
          parent_id: pariId,
          parent_name: 'Pari Khan',
          student_id: `std-pari-${schoolId}-3`,
          student_name: 'Muhammad Rayyan Khan',
          read_at: new Date(now.getTime() - 2.5 * 3600000).toISOString(),
        },
      ],
    },
    {
      id: `diary-${schoolId}-9`,
      school_id: schoolId,
      class_id: 'Grade 4',
      section: 'A',
      subject: 'Urdu Adab',
      date: todayStr,
      classwork: 'Sabaq "Quid-e-Azam ki Zindagi": Reading and vocabulary sentence creation.',
      homework: 'Write 5 sentences using new vocabulary words in homework register.',
      due_date: new Date(now.getTime() + 86400000).toISOString().split('T')[0],
      teacher_id: teacher2Id,
      teacher_name: 'Ms. Sadia Parveen (English Head)',
      created_at: new Date(now.getTime() - 9.5 * 3600000).toISOString(),
      attachments: [
        {
          id: `att-img-${schoolId}-9`,
          type: 'image',
          url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
          caption: 'Urdu Khushkhati & Vocabulary Worksheet',
        },
      ],
      read_by_parents: [
        {
          parent_id: aishaId,
          parent_name: 'Aisha Bibi',
          student_id: `std-aisha-${schoolId}-3`,
          student_name: 'Umar Tariq',
          read_at: new Date(now.getTime() - 4.5 * 3600000).toISOString(),
        },
      ],
    },
    {
      id: `diary-${schoolId}-10`,
      school_id: schoolId,
      class_id: 'Grade 3',
      section: 'B',
      subject: 'General Knowledge',
      date: todayStr,
      classwork: 'Living things and habitats: Desert vs rainforest animals adaptations.',
      homework: 'Color the animal habitat chart on project page 22.',
      due_date: new Date(now.getTime() + 86400000).toISOString().split('T')[0],
      teacher_id: teacher2Id,
      teacher_name: 'Ms. Sadia Parveen (English Head)',
      created_at: new Date(now.getTime() - 10 * 3600000).toISOString(),
      attachments: [
        {
          id: `att-doc-${schoolId}-10`,
          type: 'document',
          url: '/sample-daily-work-planner.pdf',
          caption: 'Class 3 Work Planner & Habitat Chart PDF',
          fileName: 'sample-daily-work-planner.pdf',
        },
      ],
      read_by_parents: [
        {
          parent_id: aishaId,
          parent_name: 'Aisha Bibi',
          student_id: `std-aisha-${schoolId}-2`,
          student_name: 'Fatima Tariq',
          read_at: new Date(now.getTime() - 5 * 3600000).toISOString(),
        },
      ],
    },
    {
      id: `diary-${schoolId}-11`,
      school_id: schoolId,
      class_id: 'Grade 2',
      section: 'Tulip',
      subject: 'Urdu & English Phonics',
      date: todayStr,
      classwork: 'Oxford Reading Tree Book 4: Group reading. Urdu Haroof-e-Tahajji joint handwriting practice.',
      homework: 'Read pages 12 to 16 with parents. Practice joined letters on 4-line notebook.',
      due_date: new Date(now.getTime() + 86400000).toISOString().split('T')[0],
      teacher_id: teacher2Id,
      teacher_name: 'Ms. Sadia Parveen (English Head)',
      created_at: new Date(now.getTime() - 10.5 * 3600000).toISOString(),
      attachments: [
        {
          id: `att-img-${schoolId}-11`,
          type: 'image',
          url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80',
          caption: 'Class 2 Phonics & Hand-drawn Work Planner Snap',
          fileName: 'Phonics-Class2.jpg',
        },
      ],
      read_by_parents: [
        {
          parent_id: pariId,
          parent_name: 'Pari Khan',
          student_id: `std-pari-${schoolId}-2`,
          student_name: 'Mirha Fatima Khan',
          read_at: new Date(now.getTime() - 1.5 * 3600000).toISOString(),
        },
      ],
    },
    {
      id: `diary-${schoolId}-12`,
      school_id: schoolId,
      class_id: 'Grade 1',
      section: 'A',
      subject: 'English & Numeracy',
      date: todayStr,
      classwork: 'Phonics sound blends "sh", "ch", "th". Counting numbers in tens up to 100 on abacus.',
      homework: 'Complete worksheet 1.3: Match words with pictures and color the shapes.',
      due_date: new Date(now.getTime() + 86400000).toISOString().split('T')[0],
      teacher_id: teacher2Id,
      teacher_name: 'Ms. Sadia Parveen (English Head)',
      created_at: new Date(now.getTime() - 11 * 3600000).toISOString(),
      attachments: [
        {
          id: `att-img-${schoolId}-12`,
          type: 'image',
          url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80',
          caption: 'Phonics Picture Cards & Number Abacus Worksheet',
          fileName: 'Grade1-Phonics.jpg',
        },
      ],
      read_by_parents: [
        {
          parent_id: aishaId,
          parent_name: 'Aisha Bibi',
          student_id: `std-aisha-${schoolId}-1`,
          student_name: 'Hamza Tariq',
          read_at: new Date(now.getTime() - 5.5 * 3600000).toISOString(),
        },
      ],
    },
    {
      id: `diary-${schoolId}-13`,
      school_id: schoolId,
      class_id: 'KG 1',
      section: 'Rose',
      subject: 'Phonics, Rhymes & Creative Arts',
      date: todayStr,
      classwork: 'Letter sounds "s, a, t, p". Tracing vertical and horizontal lines in sand tray. Rhyme time: Twinkle Twinkle.',
      homework: 'Trace the letter "A" on Page 14 of Oxford Reading Tree Activity Book with crayon.',
      due_date: new Date(now.getTime() + 86400000).toISOString().split('T')[0],
      teacher_id: teacher2Id,
      teacher_name: 'Ms. Sadia Parveen (English Head)',
      created_at: new Date(now.getTime() - 11.5 * 3600000).toISOString(),
      attachments: [
        {
          id: `att-doc-${schoolId}-13`,
          type: 'document',
          url: '/sample-daily-work-planner.pdf',
          caption: 'Kindergarten CamScanner Daily Activity Planner & Coloring Sheet',
          fileName: 'sample-daily-work-planner.pdf',
        },
        {
          id: `att-img-${schoolId}-13`,
          type: 'image',
          url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80',
          caption: 'Class Work Snap: Crayon Letter Tracing & Storybook Page',
          fileName: 'KG1-Tracing-Snap.jpg',
        },
      ],
      read_by_parents: [
        {
          parent_id: pariId,
          parent_name: 'Pari Khan',
          student_id: `std-pari-${schoolId}-1`,
          student_name: 'Zaviyar Ahmed Khan',
          read_at: new Date(now.getTime() - 1 * 3600000).toISOString(),
        },
      ],
    },
  ];

  // Notices
  const notices: Notice[] = [
    {
      id: `notice-${schoolId}-1`,
      school_id: schoolId,
      title: 'Official Notification: Mid-Term Examination Schedule Announced',
      content:
        'Respected Parents & Guardians, Mid-Term Examination 2026 will commence from next Monday. Please review the attached datesheet and ensure all tuition dues are cleared to unlock the digital report card.',
      category: 'general',
      target_audience: 'all',
      priority: 'urgent',
      publish_date: todayStr,
      author_name: adminUser.full_name,
      author_role: 'Principal',
      created_at: new Date().toISOString(),
    },
    {
      id: `notice-${schoolId}-2`,
      school_id: schoolId,
      title: 'Fee Voucher Notice: Last Date for Challan Clearance',
      content:
        'This is a gentle reminder that monthly tuition challans are payable by the 10th of each calendar month. Bank challans are accessible via the Bursar tab.',
      category: 'fee_reminder',
      target_audience: 'all',
      priority: 'normal',
      publish_date: todayStr,
      author_name: 'Bursar & Accounts Office',
      author_role: 'Administration',
      created_at: new Date(now.getTime() - 24 * 3600000).toISOString(),
    },
    {
      id: `notice-${schoolId}-3`,
      school_id: schoolId,
      title: 'Annual Sports Gala & Inter-House Athletics Championship',
      content:
        'Registrations for 100m sprint, relay race, cricket, and badminton are now open with the sports department. House shirts will be provided by campus.',
      category: 'event',
      target_audience: 'all',
      priority: 'normal',
      publish_date: todayStr,
      author_name: 'Director of Physical Education',
      author_role: 'Sports Secretariat',
      created_at: new Date(now.getTime() - 48 * 3600000).toISOString(),
    },
  ];

  // Complaints & Support Tickets Desk (Parents ⇄ Teachers ⇄ Admin)
  const queries: CommunicationQuery[] = [
    {
      id: `tkt-${schoolId}-101`,
      ticket_number: `TKT-${prefix}-101`,
      school_id: schoolId,
      student_id: `std-pari-${schoolId}-1`,
      student_name: 'Zaviyar Ahmed Khan',
      student_class: 'KG 1 - Section Rose',
      parent_id: pariId,
      parent_name: 'Pari Khan (Mother of 4)',
      parent_phone: '+92 300 1234567',
      teacher_id: teacherId,
      teacher_name: teacherUser.full_name,
      raised_by_role: 'parent',
      raised_by_name: 'Pari Khan',
      target_audience: 'teacher',
      subject: 'Clarification on Oxford Reading Tree Phonics Exercise (Page 14)',
      category: 'homework',
      priority: 'normal',
      status: 'in_progress',
      admin_notified: true,
      teacher_notified: true,
      created_at: new Date(now.getTime() - 8 * 3600000).toISOString(),
      updated_at: new Date(now.getTime() - 2 * 3600000).toISOString(),
      messages: [
        {
          id: `msg-${schoolId}-101-1`,
          sender_id: pariId,
          sender_name: 'Pari Khan (Mother of 4)',
          sender_role: 'parent',
          text: 'Assalam-o-Alaikum Sir, Zaviyar completed his sound tracing on page 14 of Oxford Reading Tree. Should he also practice the 3-letter sight words on page 15 for circle time tomorrow?',
          sent_at: new Date(now.getTime() - 8 * 3600000).toISOString(),
        },
        {
          id: `msg-${schoolId}-101-2`,
          sender_id: teacherId,
          sender_name: teacherUser.full_name,
          sender_role: 'teacher',
          text: 'Walaikum Assalam Mrs. Pari Khan, only page 14 tracing is required for tomorrow. Page 15 will be conducted orally in the classroom during 2nd period. His phonics grip is coming along wonderfully!',
          sent_at: new Date(now.getTime() - 4 * 3600000).toISOString(),
        },
        {
          id: `msg-${schoolId}-101-3`,
          sender_id: adminId,
          sender_name: `Principal (${name})`,
          sender_role: 'admin',
          text: 'Official Incharge Note: Noted by Academic Coordination Office. Thank you Mrs. Pari Khan for active daily home supervision.',
          sent_at: new Date(now.getTime() - 2 * 3600000).toISOString(),
        },
      ],
    },
    {
      id: `tkt-${schoolId}-102`,
      ticket_number: `TKT-${prefix}-102`,
      school_id: schoolId,
      student_id: students[0]?.id || `std-${schoolId}-1`,
      student_name: students[0]?.name || 'Student 1',
      student_class: students[0]?.class_id || 'Grade 10',
      parent_id: parentUsers[0]?.id || `prnt-${schoolId}-1`,
      parent_name: parentUsers[0]?.full_name || 'Tariq Mehmood',
      parent_phone: '+92 321 4567890',
      teacher_id: teacherId,
      teacher_name: teacherUser.full_name,
      raised_by_role: 'teacher',
      raised_by_name: `${teacherUser.full_name} (Class Incharge)`,
      target_audience: 'parent',
      subject: 'Disciplinary Notice: Consecutive Incomplete Math Homework & Unsigned Diary',
      category: 'discipline',
      priority: 'urgent',
      status: 'open',
      admin_notified: true,
      teacher_notified: true,
      created_at: new Date(now.getTime() - 14 * 3600000).toISOString(),
      updated_at: new Date(now.getTime() - 6 * 3600000).toISOString(),
      messages: [
        {
          id: `msg-${schoolId}-102-1`,
          sender_id: teacherId,
          sender_name: teacherUser.full_name,
          sender_role: 'teacher',
          text: 'Respected Parent, your child has not submitted Exercise 4.3 homework for three consecutive days and the diary is unverified. As examinations approach, kindly check notebooks tonight and sign the diary.',
          sent_at: new Date(now.getTime() - 14 * 3600000).toISOString(),
        },
        {
          id: `msg-${schoolId}-102-2`,
          sender_id: adminId,
          sender_name: `Principal (${name})`,
          sender_role: 'admin',
          text: 'Official Administration Endorsement: The Principal Office has flagged this ticket for priority parent counseling. Please contact the class coordinator by 1:00 PM tomorrow.',
          sent_at: new Date(now.getTime() - 6 * 3600000).toISOString(),
        },
      ],
    },
    {
      id: `tkt-${schoolId}-103`,
      ticket_number: `TKT-${prefix}-103`,
      school_id: schoolId,
      student_id: students[1]?.id || `std-${schoolId}-2`,
      student_name: students[1]?.name || 'Student 2',
      student_class: students[1]?.class_id || 'Grade 9',
      parent_id: parentUsers[1]?.id || `prnt-${schoolId}-2`,
      parent_name: parentUsers[1]?.full_name || 'Farooq Siddiqui',
      parent_phone: '+92 333 7890123',
      teacher_id: teacherId,
      teacher_name: teacherUser.full_name,
      raised_by_role: 'parent',
      raised_by_name: parentUsers[1]?.full_name || 'Farooq Siddiqui',
      target_audience: 'admin',
      subject: 'School Van #04 Arrived 35 Minutes Late at Morning Stop',
      category: 'transport',
      priority: 'urgent',
      status: 'resolved',
      admin_notified: true,
      teacher_notified: true,
      resolved_at: new Date(now.getTime() - 1 * 3600000).toISOString(),
      resolved_by: `Principal (${name})`,
      created_at: new Date(now.getTime() - 20 * 3600000).toISOString(),
      updated_at: new Date(now.getTime() - 1 * 3600000).toISOString(),
      messages: [
        {
          id: `msg-${schoolId}-103-1`,
          sender_id: parentUsers[1]?.id || `prnt-${schoolId}-2`,
          sender_name: parentUsers[1]?.full_name || 'Farooq Siddiqui',
          sender_role: 'parent',
          text: 'Respected Management, Van #04 arrived at 07:55 AM instead of 07:20 AM today, causing students to miss morning assembly. Please instruct transport desk to maintain punctuality.',
          sent_at: new Date(now.getTime() - 20 * 3600000).toISOString(),
        },
        {
          id: `msg-${schoolId}-103-2`,
          sender_id: adminId,
          sender_name: `Principal (${name})`,
          sender_role: 'admin',
          text: 'Investigation Completed: Van #04 experienced an engine radiator leak. The transport supervisor dispatched a relief van immediately. We have cautioned the contractor and route will run strictly on time tomorrow.',
          sent_at: new Date(now.getTime() - 5 * 3600000).toISOString(),
        },
        {
          id: `msg-${schoolId}-103-3`,
          sender_id: teacherId,
          sender_name: teacherUser.full_name,
          sender_role: 'teacher',
          text: 'Confirmed from classroom register: The student was excused for the late arrival and marked Present without penalty marks.',
          sent_at: new Date(now.getTime() - 1 * 3600000).toISOString(),
        },
      ],
    },
    {
      id: `tkt-${schoolId}-104`,
      ticket_number: `TKT-${prefix}-104`,
      school_id: schoolId,
      student_id: students[4]?.id || `std-${schoolId}-5`,
      student_name: students[4]?.name || 'Bilal Ahmed',
      student_class: students[4]?.class_id || 'Grade 10',
      parent_id: `user-parent-dormant-${schoolId}`,
      parent_name: 'Kamran Malik',
      parent_phone: '+92 301 9876543',
      teacher_id: teacherId,
      teacher_name: teacherUser.full_name,
      raised_by_role: 'teacher',
      raised_by_name: `${teacherUser.full_name} (Prefect Incharge)`,
      target_audience: 'parent',
      subject: 'Critical Conduct Warning: Misbehavior during recess near sports quadrangle',
      category: 'safety_bullying',
      priority: 'critical',
      status: 'in_progress',
      admin_notified: true,
      teacher_notified: true,
      created_at: new Date(now.getTime() - 28 * 3600000).toISOString(),
      updated_at: new Date(now.getTime() - 10 * 3600000).toISOString(),
      messages: [
        {
          id: `msg-${schoolId}-104-1`,
          sender_id: teacherId,
          sender_name: teacherUser.full_name,
          sender_role: 'teacher',
          text: 'CRITICAL ALERT for Parent & Incharge: Student was involved in a physical altercation during recess today. Disciplinary committee has recorded witness statements. Immediate parent meeting is required.',
          sent_at: new Date(now.getTime() - 28 * 3600000).toISOString(),
        },
        {
          id: `msg-${schoolId}-104-2`,
          sender_id: adminId,
          sender_name: `Principal (${name})`,
          sender_role: 'admin',
          text: 'Executive Summons: Formal hearing scheduled for tomorrow at 10:00 AM in Principal Office. Student placed on disciplinary probation.',
          sent_at: new Date(now.getTime() - 10 * 3600000).toISOString(),
        },
      ],
    },
  ];

  // Absence Alert
  const alerts: AbsenceAlert[] = [
    {
      id: `alert-${schoolId}-1`,
      school_id: schoolId,
      student_id: students[10]?.id || 'std-10',
      student_name: students[10]?.name || 'Student',
      roll_number: students[10]?.roll_number || `${prefix}-09-01`,
      class_id: students[10]?.class_id || 'Grade 9',
      section: students[10]?.section || 'A',
      date: todayStr,
      parent_id: parentUsers[10]?.id || 'prnt-10',
      parent_name: parentUsers[10]?.full_name || 'Guardian',
      parent_email: parentUsers[10]?.email || 'parent@example.com',
      sent_at: new Date(now.getTime() - 3 * 3600000).toISOString(),
      status: 'delivered',
    },
  ];

  // Datesheet
  const datesheets: Datesheet[] = [
    {
      id: `ds-${schoolId}-1`,
      school_id: schoolId,
      title: 'Mid-Term Examinations Timetable 2026',
      class_id: 'Grade 10',
      term: 'mid_term',
      academic_year: '2025-2026',
      instructions: [
        'Students must be in complete formal school uniform with school ID card.',
        'Entry into examination halls will close precisely at 08:15 AM.',
        'Use of scientific calculators is allowed only for Physics and Chemistry papers.',
        'Mobile phones and smartwatches are strictly prohibited.',
      ],
      schedule: [
        {
          id: `item-${schoolId}-1`,
          date: new Date(now.getTime() + 5 * 86400000).toISOString().split('T')[0],
          day: 'Monday',
          time: '08:30 AM - 11:30 AM',
          subject: 'Mathematics',
          syllabus: 'Unit 1 (Sets), Unit 2 (Matrices), Unit 4 (Quadratic Equations)',
          room_no: 'Hall A - Central Wing',
        },
        {
          id: `item-${schoolId}-2`,
          date: new Date(now.getTime() + 7 * 86400000).toISOString().split('T')[0],
          day: 'Wednesday',
          time: '08:30 AM - 11:30 AM',
          subject: 'Physics',
          syllabus: 'Kinematics, Dynamics, Gravitation & Work-Energy complete chapters',
          room_no: 'Hall A - Central Wing',
        },
        {
          id: `item-${schoolId}-3`,
          date: new Date(now.getTime() + 9 * 86400000).toISOString().split('T')[0],
          day: 'Friday',
          time: '08:30 AM - 11:30 AM',
          subject: 'English Literature & Language',
          syllabus: 'Unseen comprehension, Formal composition, Poetry selections 1 to 4',
          room_no: 'Hall B - West Wing',
        },
      ],
      created_at: new Date().toISOString(),
    },
  ];

  // Kids Monthly Progress Evaluation (October 2026)
  const kidsProgress: MonthlyKidsProgress[] = [
    {
      id: `prog-${schoolId}-pari-kg1-oct2026`,
      school_id: schoolId,
      student_id: `std-pari-${schoolId}-1`,
      student_name: 'Zaviyar Ahmed Khan',
      class_id: 'KG 1',
      section: 'Rose',
      month: 'October',
      year: 2026,
      teacher_id: teacherId,
      teacher_name: 'Senior Master Riaz-ul-Hassan',
      language: { score: 5, grade: 'A+', status: 'Outstanding', notes: 'Speaks clearly, active phonics participant.' },
      discipline: { score: 4, grade: 'A', status: 'Proficient', notes: 'Attentive during group storytelling, shares toys.' },
      writing: { score: 4, grade: 'A', status: 'Proficient', notes: 'Stable pencil grip, clear alphabet tracing.' },
      reading: { score: 5, grade: 'A+', status: 'Outstanding', notes: 'Quick sight-word recognition.' },
      cleaning: { score: 5, grade: 'A+', status: 'Outstanding', notes: 'Spotless uniform and washes hands promptly.' },
      teacher_remarks: 'Zaviyar is an enthusiastic and bright kindergarten scholar!',
      badges: ['Star Speaker', 'Cleanliness Champion'],
      overall_score: 94,
      overall_grade: 'A+',
      created_at: new Date(now.getTime() - 4 * 86400000).toISOString(),
      updated_at: new Date(now.getTime() - 4 * 86400000).toISOString(),
    },
    {
      id: `prog-${schoolId}-pari-c2-oct2026`,
      school_id: schoolId,
      student_id: `std-pari-${schoolId}-2`,
      student_name: 'Mirha Fatima Khan',
      class_id: 'Class 2',
      section: 'Tulip',
      month: 'October',
      year: 2026,
      teacher_id: teacher2Id,
      teacher_name: 'Ms. Sadia Parveen (English Head)',
      language: { score: 5, grade: 'A+', status: 'Outstanding', notes: 'Fluent bilingual speaker, rich vocabulary.' },
      discipline: { score: 5, grade: 'A+', status: 'Outstanding', notes: 'Model student with polite classroom manners.' },
      writing: { score: 4, grade: 'A', status: 'Proficient', notes: 'Neat four-line notebook work.' },
      reading: { score: 5, grade: 'A+', status: 'Outstanding', notes: 'Reads ORT Level 4 stories with expression.' },
      cleaning: { score: 5, grade: 'A+', status: 'Outstanding', notes: 'Immaculate desk and tidy school bag.' },
      teacher_remarks: 'Mirha is an exceptional role model in Class 2.',
      badges: ['Book Worm', 'Perfect Conduct'],
      overall_score: 96,
      overall_grade: 'A+',
      created_at: new Date(now.getTime() - 4 * 86400000).toISOString(),
      updated_at: new Date(now.getTime() - 4 * 86400000).toISOString(),
    },
    {
      id: `prog-${schoolId}-pari-c5-oct2026`,
      school_id: schoolId,
      student_id: `std-pari-${schoolId}-3`,
      student_name: 'Muhammad Rayyan Khan',
      class_id: 'Class 5',
      section: 'Green',
      month: 'October',
      year: 2026,
      teacher_id: teacherId,
      teacher_name: 'Senior Master Riaz-ul-Hassan',
      language: { score: 4, grade: 'A', status: 'Proficient', notes: 'Speaks well in school debates.' },
      discipline: { score: 4, grade: 'A', status: 'Proficient', notes: 'Acts as Junior Prefect.' },
      writing: { score: 4, grade: 'A', status: 'Proficient', notes: 'Good creative essay structures.' },
      reading: { score: 4, grade: 'A', status: 'Proficient', notes: 'Reads ahead in Science.' },
      cleaning: { score: 4, grade: 'A', status: 'Proficient', notes: 'Well turned out uniform.' },
      teacher_remarks: 'Rayyan shows admirable leadership qualities.',
      badges: ['Class Leader', 'Creative Thinker'],
      overall_score: 88,
      overall_grade: 'A',
      created_at: new Date(now.getTime() - 4 * 86400000).toISOString(),
      updated_at: new Date(now.getTime() - 4 * 86400000).toISOString(),
    },
    {
      id: `prog-${schoolId}-pari-c9-oct2026`,
      school_id: schoolId,
      student_id: `std-pari-${schoolId}-4`,
      student_name: 'Shahmeer Ali Khan',
      class_id: 'Class 9',
      section: 'Matric A',
      month: 'October',
      year: 2026,
      teacher_id: teacher3Id,
      teacher_name: 'Prof. Shahbaz Ahmed (Sciences)',
      language: { score: 5, grade: 'A+', status: 'Outstanding', notes: 'Command of board technical terminology.' },
      discipline: { score: 5, grade: 'A+', status: 'Outstanding', notes: 'Punctual with lab work.' },
      writing: { score: 4, grade: 'A', status: 'Proficient', notes: 'Step-by-step mathematical derivations.' },
      reading: { score: 5, grade: 'A+', status: 'Outstanding', notes: 'Solves past paper numerical questions.' },
      cleaning: { score: 5, grade: 'A+', status: 'Outstanding', notes: 'Full senior blazer and formal tie.' },
      teacher_remarks: 'Shahmeer is on track for straight A-One grades in Board exams.',
      badges: ['Academic Ace', 'Board Exam Contender'],
      overall_score: 95,
      overall_grade: 'A+',
      created_at: new Date(now.getTime() - 4 * 86400000).toISOString(),
      updated_at: new Date(now.getTime() - 4 * 86400000).toISOString(),
    },
  ];

  // Faculty Teacher Progress Evaluations
  const teacherProgress: TeacherProgressEvaluation[] = [
    {
      id: `eval-${schoolId}-riaz-oct2026`,
      school_id: schoolId,
      teacher_id: teacherId,
      teacher_name: 'Senior Master Riaz-ul-Hassan',
      teacher_email: teacherUser.email,
      subject_specialty: 'Mathematics & Mechanics Faculty Head',
      assigned_grades: ['Grade 9', 'Grade 10'],
      month: 'October',
      year: 2026,
      language: {
        score: 5,
        rating: 'Outstanding & Articulate',
        notes: 'Clear bilingual lectures with polite and respectful student engagement.',
      },
      dressing: {
        score: 5,
        rating: 'Immaculate & Formal',
        notes: 'Executive formal suit with tie and polished shoes. Exemplary grooming.',
      },
      working: {
        score: 5,
        rating: 'Exemplary Pedagogy & Timely',
        notes: 'Lesson plans submitted 5 days in advance. Digital diary updated daily by 2 PM.',
      },
      regularity: {
        status: 'regular',
        score: 5,
        days_present: 22,
        days_absent: 0,
        late_arrivals: 0,
        notes: '100% biometric attendance, always early for morning assembly.',
      },
      overall_score: 96,
      overall_grade: 'A+',
      incharge_remarks: 'An anchor pillar of our senior faculty. Recommended for annual appreciation increment.',
      incharge_recommendation: 'increment',
      evaluated_by_id: adminId,
      evaluated_by_name: `Principal (${name})`,
      created_at: new Date(now.getTime() - 3 * 86400000).toISOString(),
      updated_at: new Date(now.getTime() - 3 * 86400000).toISOString(),
    },
    {
      id: `eval-${schoolId}-sadia-oct2026`,
      school_id: schoolId,
      teacher_id: teacher2Id,
      teacher_name: 'Ms. Sadia Parveen (English Head)',
      teacher_email: teacher2User.email,
      subject_specialty: 'English Literature & Language',
      assigned_grades: ['Grade 8', 'Grade 9', 'Grade 10'],
      month: 'October',
      year: 2026,
      language: {
        score: 5,
        rating: 'Eloquent & Native Tone',
        notes: 'Flawless English diction and supportive tone in debates.',
      },
      dressing: {
        score: 5,
        rating: 'Elegant & Professional',
        notes: 'Strict formal dress code with school security badge.',
      },
      working: {
        score: 4,
        rating: 'Thorough Checking & Creative Work',
        notes: 'Essay marking is detailed with encouraging corrections.',
      },
      regularity: {
        status: 'regular',
        score: 5,
        days_present: 22,
        days_absent: 0,
        late_arrivals: 1,
        notes: 'Very dependable faculty member with 99% punctuality.',
      },
      overall_score: 94,
      overall_grade: 'A+',
      incharge_remarks: 'Commendable leadership of English department and creative clubs.',
      incharge_recommendation: 'increment',
      evaluated_by_id: adminId,
      evaluated_by_name: `Principal (${name})`,
      created_at: new Date(now.getTime() - 3 * 86400000).toISOString(),
      updated_at: new Date(now.getTime() - 3 * 86400000).toISOString(),
    },
    {
      id: `eval-${schoolId}-shahbaz-oct2026`,
      school_id: schoolId,
      teacher_id: teacher3Id,
      teacher_name: 'Prof. Shahbaz Ahmed (Sciences)',
      teacher_email: teacher3User.email,
      subject_specialty: 'Physics & Chemistry Laboratory',
      assigned_grades: ['Grade 9', 'Grade 10'],
      month: 'October',
      year: 2026,
      language: {
        score: 3,
        rating: 'Satisfactory / Colloquial',
        notes: 'Good technical grasp but tends to speak colloquially.',
      },
      dressing: {
        score: 3,
        rating: 'Casual / Boundary',
        notes: 'Must wear mandatory lab coat and formal attire during practical classes.',
      },
      working: {
        score: 3,
        rating: 'Moderate / Delayed Correction',
        notes: 'Science experiments are good, but notebook checking backlog needs clearing.',
      },
      regularity: {
        status: 'occasional_late',
        score: 3,
        days_present: 19,
        days_absent: 2,
        late_arrivals: 4,
        notes: 'Flagged for 4 late arrivals past 8:15 AM. Guidance counseling recommended.',
      },
      overall_score: 68,
      overall_grade: 'C',
      incharge_remarks: 'Competent subject expert. Needs improvement in punctuality and dress code compliance.',
      incharge_recommendation: 'guidance_required',
      evaluated_by_id: adminId,
      evaluated_by_name: `Principal (${name})`,
      created_at: new Date(now.getTime() - 3 * 86400000).toISOString(),
      updated_at: new Date(now.getTime() - 3 * 86400000).toISOString(),
    },
  ];

  // Parents Report Cards & Vigilance Analytics
  const parentsReports: ParentReportCard[] = [
    {
      id: `prc-${schoolId}-pari`,
      parent_id: pariId,
      parent_code: 'PAR-2026-001',
      school_id: schoolId,
      parent_name: 'Pari Khan (Mother of 4)',
      parent_email: 'pari@example.com',
      parent_phone: '+92 300 1234567',
      children_count: 4,
      children: [
        { student_id: `std-pari-${schoolId}-1`, student_name: 'Zaviyar Ahmed Khan', class_id: 'KG 1', section: 'Rose', roll_number: `${prefix}-KG-01` },
        { student_id: `std-pari-${schoolId}-2`, student_name: 'Mirha Fatima Khan', class_id: 'Class 2', section: 'Tulip', roll_number: `${prefix}-C2-01` },
        { student_id: `std-pari-${schoolId}-3`, student_name: 'Muhammad Rayyan Khan', class_id: 'Class 5', section: 'Green', roll_number: `${prefix}-C5-01` },
        { student_id: `std-pari-${schoolId}-4`, student_name: 'Shahmeer Ali Khan', class_id: 'Class 9', section: 'Matric A', roll_number: `${prefix}-C9-01` },
      ],
      metrics: {
        last_active_at: new Date(now.getTime() - 2 * 3600000).toISOString(),
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
      teacher_notes: 'Highly vigilant mother. Actively tracks homework feeds across all 4 children and signs planners immediately.',
      last_contacted_date: new Date(now.getTime() - 3 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: `prc-${schoolId}-aisha`,
      parent_id: aishaId,
      parent_code: 'PAR-2026-002',
      school_id: schoolId,
      parent_name: 'Aisha Bibi (Mother of 5)',
      parent_email: 'aisha.bibi@example.com',
      parent_phone: '+92 302 5551234',
      children_count: 5,
      children: [
        { student_id: `std-aisha-${schoolId}-1`, student_name: 'Hamza Tariq', class_id: 'Grade 1', section: 'A', roll_number: `${prefix}-C1-01` },
        { student_id: `std-aisha-${schoolId}-2`, student_name: 'Fatima Tariq', class_id: 'Grade 3', section: 'B', roll_number: `${prefix}-C3-01` },
        { student_id: `std-aisha-${schoolId}-3`, student_name: 'Umar Tariq', class_id: 'Grade 4', section: 'A', roll_number: `${prefix}-C4-01` },
        { student_id: `std-aisha-${schoolId}-4`, student_name: 'Zainab Tariq', class_id: 'Grade 6', section: 'B', roll_number: `${prefix}-C6-01` },
        { student_id: `std-aisha-${schoolId}-5`, student_name: 'Usman Tariq', class_id: 'Grade 7', section: 'A', roll_number: `${prefix}-C7-01` },
      ],
      metrics: {
        last_active_at: new Date(now.getTime() - 24 * 3600000).toISOString(),
        days_since_last_active: 1,
        logins_last_30_days: 24,
        usage_frequency: 'every_few_days',
        diary_read_rate: 92,
        queries_asked_count: 4,
        alerts_acknowledged_count: 2,
        fee_payment_punctuality: 'prompt',
      },
      engagement_score: 92,
      vigilance_level: 'proactive',
      extense_attention_needed: false,
      teacher_notes: 'Exemplary mother managing 5 children across primary & middle grades with 1 single parent ID. Diligently reads and signs homework feeds.',
      last_contacted_date: new Date(now.getTime() - 4 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: `prc-${schoolId}-tariq`,
      parent_id: parentUsers[0]?.id || `prnt-${schoolId}-1`,
      parent_code: 'PAR-2026-003',
      school_id: schoolId,
      parent_name: parentUsers[0]?.full_name || 'Tariq Mehmood',
      parent_email: parentUsers[0]?.email || 'tariq.mehmood@example.com',
      parent_phone: '+92 321 4567890',
      children_count: 1,
      children: [
        { student_id: students[0]?.id || 's-1', student_name: students[0]?.name || 'Student 1', class_id: 'Grade 10', section: 'A', roll_number: `${prefix}-10-01` },
      ],
      metrics: {
        last_active_at: new Date(now.getTime() - 28 * 3600000).toISOString(),
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
      teacher_notes: 'Cooperative father. Regularly checks mid-term schedules and clears tuition on time.',
      last_contacted_date: new Date(now.getTime() - 10 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: `prc-${schoolId}-farooq`,
      parent_id: parentUsers[1]?.id || `prnt-${schoolId}-2`,
      parent_code: 'PAR-2026-004',
      school_id: schoolId,
      parent_name: parentUsers[1]?.full_name || 'Farooq Siddiqui',
      parent_email: parentUsers[1]?.email || 'farooq.siddiqui@example.com',
      parent_phone: '+92 333 7890123',
      children_count: 1,
      children: [
        { student_id: students[1]?.id || 's-2', student_name: students[1]?.name || 'Student 2', class_id: 'Grade 10', section: 'A', roll_number: `${prefix}-10-02` },
      ],
      metrics: {
        last_active_at: new Date(now.getTime() - 17 * 86400000).toISOString(),
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
      attention_reason: 'Parent rarely opens school app (3 logins in 30 days). Student needs teacher follow-up during 1st period for homework verification.',
      teacher_notes: 'Father travels frequently; recommended family member be linked to PWA for daily homework check.',
      last_contacted_date: new Date(now.getTime() - 15 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: `prc-${schoolId}-kamran`,
      parent_id: `user-parent-dormant-${schoolId}`,
      parent_code: 'PAR-2026-005',
      school_id: schoolId,
      parent_name: 'Kamran Malik',
      parent_email: 'kamran.malik@example.com',
      parent_phone: '+92 301 9876543',
      children_count: 1,
      children: [
        { student_id: students[4]?.id || 's-5', student_name: students[4]?.name || 'Bilal Ahmed', class_id: 'Grade 10', section: 'A', roll_number: `${prefix}-10-05` },
      ],
      metrics: {
        last_active_at: new Date(now.getTime() - 48 * 86400000).toISOString(),
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
      attention_reason: 'CRITICAL ALERT: Parent has zero app logins in 48 days. Child lacks home study support. Assign classroom study buddy immediately.',
      teacher_notes: 'Unresponsive to automated SMS alerts. In-person meeting requested.',
      last_contacted_date: new Date(now.getTime() - 5 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const schoolObj: School = {
    id: schoolId,
    name,
    motto: 'Excellence in Character & Academics • Knowledge is Light',
    logo_url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=160&auto=format&fit=crop&q=80',
    primary_color: '#0A2540',
    secondary_color: '#041226',
    created_at: new Date().toISOString(),
    skin: 'highstar',
  };

  return {
    school: schoolObj,
    users: [adminUser, teacherUser, teacher2User, teacher3User, ...parentUsers],
    students,
    fees,
    attendance,
    results,
    diary,
    notices,
    queries,
    alerts,
    datesheets,
    kidsProgress,
    teacherProgress,
    parentsReports,
  };
}

