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
} from '../types';

interface GeneratedSchoolDemo {
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
    email: `faculty@${schoolId.replace(/[^a-z0-9]/gi, '').toLowerCase()}.edu.pk`,
    created_at: new Date(now.getTime() - 80 * 86400000).toISOString(),
  };

  const parentUsers: User[] = [];
  const students: Student[] = [];
  const fees: Fee[] = [];
  const attendance: Attendance[] = [];
  const results: Result[] = [];

  const classes = [
    { classId: 'Grade 10', section: 'A', count: 8 },
    { classId: 'Grade 9', section: 'A', count: 7 },
    { classId: 'Grade 8', section: 'B', count: 6 },
    { classId: 'Grade 5', section: 'Green', count: 5 },
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
      teacher_id: teacherId,
      teacher_name: 'Senior Master Riaz-ul-Hassan',
      created_at: new Date(now.getTime() - 4 * 3600000).toISOString(),
      read_by_parents: [],
    },
    {
      id: `diary-${schoolId}-3`,
      school_id: schoolId,
      class_id: 'Grade 9',
      section: 'A',
      subject: 'English Language',
      date: todayStr,
      classwork: 'Formal Letter Writing and Essay Composition on "Clean Green Pakistan".',
      homework: 'Draft a 250-word editorial letter to the newspaper editor regarding traffic control.',
      teacher_id: teacherId,
      teacher_name: 'Senior Master Riaz-ul-Hassan',
      created_at: new Date(now.getTime() - 5 * 3600000).toISOString(),
      read_by_parents: [],
    },
    {
      id: `diary-${schoolId}-4`,
      school_id: schoolId,
      class_id: 'Grade 9',
      section: 'A',
      subject: 'Chemistry',
      date: todayStr,
      classwork: 'Periodic Table Trends: Electronegativity and Electron Affinity explanations.',
      homework: 'Draw atomic radii trend diagram and memorize group 1 & 2 elements.',
      teacher_id: teacherId,
      teacher_name: 'Senior Master Riaz-ul-Hassan',
      created_at: new Date(now.getTime() - 6 * 3600000).toISOString(),
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
      teacher_id: teacherId,
      teacher_name: 'Senior Master Riaz-ul-Hassan',
      created_at: new Date(now.getTime() - 7 * 3600000).toISOString(),
      read_by_parents: [],
    },
    {
      id: `diary-${schoolId}-6`,
      school_id: schoolId,
      class_id: 'Grade 8',
      section: 'B',
      subject: 'Pakistan Studies',
      date: todayStr,
      classwork: 'Chapter 2: Ideology of Pakistan and Two-Nation Theory historical perspective.',
      homework: 'Read Lahore Resolution 1940 notes and answer short questions 1-5.',
      teacher_id: teacherId,
      teacher_name: 'Senior Master Riaz-ul-Hassan',
      created_at: new Date(now.getTime() - 8 * 3600000).toISOString(),
      read_by_parents: [],
    },
    {
      id: `diary-${schoolId}-7`,
      school_id: schoolId,
      class_id: 'Grade 5',
      section: 'Green',
      subject: 'Mathematics',
      date: todayStr,
      classwork: 'Long division with 2-digit divisors and remainder calculations.',
      homework: 'Page 58 Exercise 3.4 sums 1 to 10.',
      teacher_id: teacherId,
      teacher_name: 'Senior Master Riaz-ul-Hassan',
      created_at: new Date(now.getTime() - 9 * 3600000).toISOString(),
      read_by_parents: [],
    },
    {
      id: `diary-${schoolId}-8`,
      school_id: schoolId,
      class_id: 'Grade 5',
      section: 'Green',
      subject: 'General Science',
      date: todayStr,
      classwork: 'The Solar System: Planetary orbits and rotation vs revolution.',
      homework: 'Color and label the diagram of the solar system on project sheet.',
      teacher_id: teacherId,
      teacher_name: 'Senior Master Riaz-ul-Hassan',
      created_at: new Date(now.getTime() - 10 * 3600000).toISOString(),
      read_by_parents: [],
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

  // Queries
  const queries: CommunicationQuery[] = [
    {
      id: `query-${schoolId}-1`,
      school_id: schoolId,
      student_id: students[0]?.id || 'std-1',
      student_name: students[0]?.name || 'Student',
      student_class: students[0]?.class_id || 'Grade 10',
      parent_id: parentUsers[0]?.id || 'prnt-1',
      parent_name: parentUsers[0]?.full_name || 'Parent',
      teacher_id: teacherId,
      teacher_name: teacherUser.full_name,
      subject: 'Inquiry regarding Physics Practical and Lab Apparatus',
      category: 'academic',
      status: 'resolved',
      created_at: new Date(now.getTime() - 36 * 3600000).toISOString(),
      updated_at: new Date(now.getTime() - 12 * 3600000).toISOString(),
      messages: [
        {
          id: `msg-${schoolId}-1`,
          sender_id: parentUsers[0]?.id || 'prnt-1',
          sender_name: parentUsers[0]?.full_name || 'Parent',
          sender_role: 'parent',
          text: 'Sir, what specific experiments should my child prepare for the upcoming practical examination?',
          sent_at: new Date(now.getTime() - 36 * 3600000).toISOString(),
        },
        {
          id: `msg-${schoolId}-2`,
          sender_id: teacherId,
          sender_name: teacherUser.full_name,
          sender_role: 'teacher',
          text: 'Dear Parent, focus on Vernier Caliper, Simple Pendulum, and Prism Refraction. Lab manuals have been verified.',
          sent_at: new Date(now.getTime() - 12 * 3600000).toISOString(),
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
    users: [adminUser, teacherUser, ...parentUsers],
    students,
    fees,
    attendance,
    results,
    diary,
    notices,
    queries,
    alerts,
    datesheets,
  };
}
