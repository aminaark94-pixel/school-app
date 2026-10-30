// This file runs in Supabase's Deno Edge Runtime, not the Vite/Node typecheck.
// @ts-nocheck
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Authentication is required.' }, 401);

  const admin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const token = authHeader.slice('Bearer '.length);
  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user) return json({ error: 'Your session is invalid. Please sign in again.' }, 401);

  const { data: caller, error: callerError } = await admin
    .from('users')
    .select('id, school_id, full_name, role')
    .eq('id', authData.user.id)
    .maybeSingle();

  if (callerError || !caller?.school_id) return json({ error: 'Your staff profile is not linked to a school.' }, 403);
  if (!['owner', 'admin'].includes(caller.role)) return json({ error: 'Only school owners and admins can load demonstration data.' }, 403);

  const { count, error: countError } = await admin
    .from('students')
    .select('id', { count: 'exact', head: true })
    .eq('school_id', caller.school_id);

  if (countError) return json({ error: countError.message }, 500);
  if ((count ?? 0) > 0) {
    return json({ error: 'This school already has students. Demo data was not added, so real tenant data stays protected.' }, 409);
  }

  const classGroups = [
    ['Class 10 (O-Levels)', 'A', ['Areeba Khan', 'Hamza Raza', 'Mahnoor Ali']],
    ['Class 9', 'A', ['Zain Qureshi', 'Ayesha Noor']],
    ['Class 8', 'B', ['Bilal Ahmed', 'Hania Malik']],
    ['Class 7', 'A', ['Usman Tariq', 'Fatima Iqbal']],
    ['Class 6', 'B', ['Zainab Tariq', 'Saad Hussain']],
    ['Class 5', 'Green', ['Maryam Khan', 'Rayyan Shah']],
    ['Class 4', 'A', ['Alina Rauf', 'Ahmad Farooq']],
    ['Class 3', 'B', ['Ibrahim Ali', 'Laiba Ahmed']],
    ['Class 2', 'Tulip', ['Daniyal Khan', 'Eman Raza']],
    ['Class 1', 'A', ['Hamza Tariq', 'Noor Fatima']],
    ['KG 1', 'Rose', ['Zaviyar Khan', 'Mirha Khan']],
  ] as const;

  const studentRows = classGroups.flatMap(([class_id, section, names]) =>
    names.map((name, index) => ({
      school_id: caller.school_id,
      roll_number: `DEMO-${class_id.replace(/[^A-Z0-9]/gi, '').slice(-4).toUpperCase()}-${String(index + 1).padStart(2, '0')}`,
      name,
      class_id,
      section,
      parent_name: `${name.split(' ')[0]} Guardian`,
      parent_email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@demo.school.pk`,
    }))
  );

  const { data: students, error: studentsError } = await admin
    .from('students')
    .insert(studentRows)
    .select('id, name, class_id, section, roll_number');
  if (studentsError || !students) return json({ error: studentsError?.message ?? 'Could not create the demo roster.' }, 500);

  const today = new Date().toISOString().slice(0, 10);
  const classTen = students.filter((student) => student.class_id === 'Class 10 (O-Levels)');

  const operations = await Promise.all([
    admin.from('attendance').insert(students.map((student, index) => ({
      student_id: student.id,
      date: today,
      status: index % 9 === 0 ? 'late' : index % 13 === 0 ? 'absent' : 'present',
      marked_by: caller.id,
    }))),
    admin.from('fees').insert(students.map((student, index) => ({
      student_id: student.id,
      amount: 12000 + (index % 4) * 1500,
      status: index % 5 === 0 ? 'pending' : 'paid',
      due_date: today,
      term: 'Monthly Academic Tuition',
      receipt_number: `DEMO-${String(index + 1).padStart(4, '0')}`,
    }))),
    admin.from('results').insert(students.map((student, index) => ({
      student_id: student.id,
      term: 'mid_term',
      marks_json: [
        { subject: 'Mathematics', max_marks: 100, obtained_marks: 82 + (index % 14) },
        { subject: 'English', max_marks: 100, obtained_marks: 78 + (index % 16) },
        { subject: 'General Science', max_marks: 100, obtained_marks: 76 + (index % 18) },
      ],
      total_marks: 390 + (index % 8) * 10,
      percentage: 78 + (index % 12),
      grade: index % 5 === 0 ? 'A' : 'A+',
      class_rank: (index % 3) + 1,
      conduct: 'Punctual, respectful, and actively engaged in class activities.',
    }))),
    admin.from('diary_entries').insert([
      {
        school_id: caller.school_id,
        teacher_id: caller.id,
        teacher_name: caller.full_name,
        class_id: 'Class 10 (O-Levels)',
        section: 'A',
        subject: 'Mathematics',
        entry_date: today,
        classwork: 'Quadratic equations: completed factorisation and graphing practice for O-Level preparation.',
        homework: 'Solve Questions 1–12 from the Quadratic Equations practice sheet.',
        due_date: today,
        attachments: [],
      },
      {
        school_id: caller.school_id,
        teacher_id: caller.id,
        teacher_name: caller.full_name,
        class_id: 'Class 6',
        section: 'B',
        subject: 'General Science',
        entry_date: today,
        classwork: 'Plant reproduction and pollination activity.',
        homework: 'Label the flower diagram in your science notebook.',
        due_date: today,
        attachments: [],
      },
    ]),
    admin.from('notices').insert({
      school_id: caller.school_id,
      title: 'Welcome to the Demonstration School Portal',
      content: 'This is realistic demonstration data for testing diary, attendance, results and fee workflows.',
      category: 'general',
      target_audience: 'all',
      priority: 'important',
      publish_date: today,
      author_id: caller.id,
      author_name: caller.full_name,
      author_role: caller.role,
      attachments: [],
    }),
    admin.from('datesheets').insert({
      school_id: caller.school_id,
      title: 'Mid-Term Examination Datesheet',
      class_id: 'Class 10 (O-Levels)',
      term: 'mid_term',
      academic_year: '2026',
      instructions: ['Arrive 20 minutes before the paper.', 'Bring your school ID and stationery.'],
      schedule: [
        { date: today, subject: 'Mathematics', start_time: '09:00', duration: '2 hours' },
        { date: today, subject: 'English', start_time: '12:00', duration: '2 hours' },
      ],
    }),
    admin.from('kids_progress').insert(classTen.map((student) => ({
      id: `demo-progress-${student.id}`,
      school_id: caller.school_id,
      student_id: student.id,
      student_name: student.name,
      class_id: student.class_id,
      section: student.section,
      month: 'October',
      year: 2026,
      language: { score: 5, grade: 'A+', status: 'Outstanding' },
      discipline: { score: 5, grade: 'A+', status: 'Courteous & Attentive' },
      writing: { score: 4, grade: 'A', status: 'Very Good' },
      reading: { score: 5, grade: 'A+', status: 'Fluent' },
      cleaning: { score: 5, grade: 'A+', status: 'Excellent' },
      teacher_id: caller.id,
      teacher_name: caller.full_name,
      teacher_remarks: 'Demonstration monthly progress report.',
      badges: ['Star of the Month'],
      overall_score: 92,
      overall_grade: 'A+',
    }))),
  ]);

  const failed = operations.find(({ error }) => error);
  if (failed?.error) return json({ error: failed.error.message }, 500);

  return json({
    success: true,
    students: students.length,
    classes: classGroups.length,
    message: `Created ${students.length} demo students across ${classGroups.length} classes.`,
  });
});
