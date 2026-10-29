export interface SystemUpdate {
  version: string;
  title: string;
  khiTime: string; // Karachi Time PKT (UTC+5)
  date: string;
  badge: 'Latest' | 'Major Feature' | 'Enhancement' | 'Fix';
  summary: string;
  features: string[];
  status: 'Live & Deployed on Vercel';
  verifiedSha?: string;
}

export const SYSTEM_UPDATES: SystemUpdate[] = [
  {
    version: 'v2.7.3',
    title: 'Single Parent ID Multi-Kid Aggregation, Real-Time Backend Telemetry & Universal All-Grade Demo Snaps',
    date: '29 October 2026',
    khiTime: '10:15 PM PKT (Karachi Time)',
    badge: 'Latest',
    status: 'Live & Deployed on Vercel',
    summary:
      'Unified Single Parent ID system aggregating all enrolled siblings under 1 family code (Pari Khan with 4 kids & Aisha Bibi with 5 kids across grades), live backend app usage telemetry that updates in real time and reflects on the Parents Report Card for Teachers and Admin, and comprehensive all-grade dummy datasets with rich diary snaps & CamScanner work planner PDFs for every class (KG 1 to Class 10).',
    features: [
      'Single Parent Family ID Architecture: Issues 1 unified Parent ID (e.g. PAR-2026-001 for Pari Khan with 4 kids; PAR-2026-002 for Aisha Bibi with 5 kids) that groups all children across different grades and classes into a single aggregated report card.',
      'Live Backend App Usage Telemetry: Real-time event listener automatically records parent app sessions upon login, diary read receipt submission, and ticket inquiries. Updates last active date, visit interval (daily, every few days, dormant), 30-day login volume, and diary sign-off rates immediately visible to Admin and Teachers.',
      'Universal All-Grade Dataset (KG 1 to Class 10): Enrolls students across all 11 Pakistani class levels with complete fee vouchers, daily attendance registers, and academic result cards.',
      'Rich Dummy Diary Snaps & CamScanner PDFs: Every single class contains active diary entries with high-resolution blackboard notes, science lab photos, Urdu handwriting worksheets, and printable CamScanner work planner PDFs.',
      '1-Click Quick Parent Persona Switcher: Added direct top-bar switcher buttons for both Pari Khan (4 Kids) and Aisha Bibi (5 Kids) to verify multi-grade sibling aggregation in 1 click.',
    ],
  },
  {
    version: 'v2.7.2',
    title: 'Collaborative Complaint & Ticket Desk: Parents ⇄ Teachers with School Administration Dual Oversight',
    date: '29 October 2026',
    khiTime: '09:25 PM PKT (Karachi Time)',
    badge: 'Enhancement',
    status: 'Live & Deployed on Vercel',
    summary:
      'Full-fledged ticket system for complaints, inquiries, and behavioral notices. Parents can lodge complaints directly to teachers (with auto-selection of their kids like Pari Khan\'s 4 children), teachers can issue student conduct & incomplete homework notices, and both Teachers and School Administration receive instant notifications and can participate in official dual-reply collaborative threads.',
    features: [
      'Dual Directional Ticket Raising: Parents can raise complaints directly to assigned faculty teachers, and Teachers can raise disciplinary/homework notices regarding students directly to parents.',
      'Dual Notification & Oversight: Every ticket instantly alerts both the assigned Faculty Teacher AND School Administration with live notification tags and oversight badges.',
      'Collaborative Multi-Role Response Thread: Both School Administration (with Principal seal) and Faculty Teachers (with Faculty badge) can reply collaboratively to parents in real-time.',
      'Pari Khan Multi-Kid Integration: Multi-child parents can select which child (KG 1, Class 2, Class 5, Class 9) the inquiry or grievance pertains to.',
      'Student Roster Selector for Teachers: Faculty members can select any student from the institutional roster to issue diary or academic alerts with parent details pre-populated.',
      'Ticket Lifecycle & Urgency Tiers: Status tracker (Open, In Progress, Resolved, Closed) and priority badges (Normal, Urgent, Critical Intervention) with 1-click WhatsApp outreach.',
    ],
  },
  {
    version: 'v2.7.1',
    title: 'Universal Multi-School Data Auto-Seeder, Teacher Name Input Bar & Incharge Verdict Hint',
    date: '29 October 2026',
    khiTime: '08:35 PM PKT (Karachi Time)',
    badge: 'Enhancement',
    status: 'Live & Deployed on Vercel',
    summary:
      'Universal demo dataset auto-seeder guaranteeing complete data for all schools (no more blank screens when switching institutions), faculty member free text input bar replacing dropdown, and unfilled incharge verdict with light placeholder hint.',
    features: [
      'Universal Multi-School Dataset Auto-Seeder: All 4 institutions (Aitchisonian Imperial, High Star, Ideas Schooling, The Leading School) and any new school automatically receive complete demo datasets (Students with Pari\'s 4 kids, Fees, Results, Attendance, Diary with PDFs, Circulars, Datesheets, Kids Progress, Teacher Progress, Parents Reports). Eliminates the issue of empty or disappearing data when switching schools.',
      'Teacher Performance Name Input Bar: Replaced restrictive dropdown with a free text input bar with datalist suggestions and 1-click faculty pills. Management can now enter any faculty member name directly.',
      'Unfilled Confidential Incharge Verdict: Removed all autofilled default text so the incharge verdict starts completely blank, accompanied by a subtle low-opacity suggestion placeholder.',
      'Self-Healing Storage Seeder: Automatic check upon school switch or app load instantly backfills missing records into localStorage so the user never encounters an empty screen.',
    ],
  },
  {
    version: 'v2.7.0',
    title: 'Parents Report Card & Parental App Usage Analytics (Extense Attention Index)',
    date: '29 October 2026',
    khiTime: '07:05 PM PKT (Karachi Time)',
    badge: 'Major Feature',
    status: 'Live & Deployed on Vercel',
    summary:
      'Confidential appraisal and analytics module exclusively for School Admin and Teachers. Measures parental vigilance, backend app usage frequency, diary read receipts, and flags students requiring extense attention in the classroom.',
    features: [
      'Strict Admin & Teacher Access: Role Level Security ensures parents cannot access or view their vigilance report or teacher directives.',
      'Single Parent ID Multi-Kid Aggregation: 1 parent ID links all enrolled siblings (e.g. Pari Khan with 4 kids in KG 1, Class 2, Class 5, Class 9; Farooq with 2 kids in Class 10).',
      'Backend App Usage Metrics: Tracks 30-day logins, last active recency, diary read receipt percentage, teacher inquiries asked, and fee payment punctuality.',
      '4 Parental Vigilance Tiers: Proactive (Green), Cooperative (Blue), Passive (Amber), Neglectful (Red) with automated 0-100 vigilance scores.',
      'Extense Attention Classroom Directive: Flags students whose parents are dormant or inactive with clear instructions for teachers (e.g. daily 1st period diary checks, buddy assignments).',
      'Direct WhatsApp Outreach & Printable Slips: 1-click WhatsApp outreach to parents and formal double-bordered confidential appraisal slips with school seal.',
    ],
  },
  {
    version: 'v2.6.0',
    title: "Teacher's Progress & Regularity Section for School Incharge & Management",
    date: '29 October 2026',
    khiTime: '06:35 PM PKT (Karachi Time)',
    badge: 'Major Feature',
    status: 'Live & Deployed on Vercel',
    summary:
      'Confidential faculty appraisal desk strictly restricted to School Incharge and Top Management. Evaluates teachers across Language, Dressing, Working, and Regularity / Absenteeism with printable appraisal slips.',
    features: [
      "Strict Incharge & Admin Access: Role Level Security ensures teachers and parents cannot access other teachers' evaluations.",
      '4 Core Performance Pillars: Language (Bilingual communication & tone), Dressing (Formal attire & grooming), Working (Pedagogy & diary), Regularity (Regular vs Irregular attendance).',
      'Regularity & Biometric Punch Tracker: Tally of days present, days absent, late arrivals, and regularity status (Regular, Occasional Late, Irregular).',
      'Management Decision & Verdict: Increment recommendations, satisfactory ratings, and formal warning tracking.',
      'Printable Appraisal Slip: Formal double-bordered confidential PDF/print slip with school seal and incharge sign-off.',
      'Embedded in Admin Dashboard: Directly accessible under the "Teacher KPI" tab or top navigation for admin accounts.',
    ],
  },
  {
    version: 'v2.5.0',
    title: 'Kids Monthly Progress Module, Parent Pari (4 Kids), & Karachi Live Updates Page',
    date: '29 October 2026',
    khiTime: '12:05 PM PKT (Karachi Time)',
    badge: 'Major Feature',
    status: 'Live & Deployed on Vercel',
    summary:
      'Added full Teacher-Parent Kids Monthly Progress tracker covering Language, Discipline, Writing, Reading, and Cleaning. Seeded Parent Pari with 4 kids (KG 1, Class 2, Class 5, Class 9) and dedicated Karachi Time verification page.',
    features: [
      'Kids Progress Section: Teachers can evaluate monthly progress across 5 core pillars: Language, Discipline, Writing, Reading, Cleaning.',
      'Parent Progress Card: Visual skill progress bars, star ratings, teacher commendations, and achievement badges.',
      'Multi-Child Parent Profile (Pari): Mother Pari (login: pari@example.com) with 4 enrolled children across KG 1, Class 2, Class 5, and Class 9.',
      'Test Logins Quick Switcher: 1-click test personas for Owner, Principal, Teacher, Parent Pari, and Parent Tariq.',
      'Karachi Time Live Updates Hub: Dedicated verification page displaying every update with Karachi Time (PKT).',
    ],
  },
  {
    version: 'v2.4.0',
    title: 'Automated Circulars Engine for Pakistani Holidays & Monthly Fee Cycles',
    date: '29 October 2026',
    khiTime: '10:55 AM PKT (Karachi Time)',
    badge: 'Major Feature',
    status: 'Live & Deployed on Vercel',
    summary:
      'Automated gazette holiday circulars (Kashmir Day, Pakistan Day, Eid, Independence Day, Smog emergencies) and 4-stage monthly fee reminder schedule (1st, 7th, 10th, 15th).',
    features: [
      'Annual Gazette Holidays: Pre-formatted formal school circulars with official reference numbers.',
      'Monthly Tuition Fee Cycle: Automated 1st (Issuance), 7th (3-day reminder), 10th (Due date), and 15th (Defaulter lock) circulars.',
      'Upcoming Milestone Hero Banner: Live countdown ticker to next holiday/fee deadline with 1-click publish.',
      'Direct WhatsApp Alert trigger from any automated circular.',
    ],
  },
  {
    version: 'v2.3.0',
    title: 'Free WhatsApp (whatsapp-web.js) & Android SMS Gateway Microservice',
    date: '29 October 2026',
    khiTime: '08:50 AM PKT (Karachi Time)',
    badge: 'Major Feature',
    status: 'Live & Deployed on Vercel',
    summary:
      'Standalone Node.js gateway with LocalAuth QR scan for WhatsApp Web and Android SMS relay (TextBee/SMSGate), anti-ban 5-10s delay queue, and delivery logs.',
    features: [
      'Permanent WhatsApp Session: Scan QR code once, session auto-persists in .wwebjs_auth.',
      'Android Phone SMS Gateway: Relays SMS through your own Android phone SIM.',
      'Anti-Ban Queue: Randomized 5-10 second delay between bulk messages with live progress bar and pause/stop controls.',
      'Fee Defaulter 1-Click Filter: Instant filter of unpaid fee parents with dynamic message template variables.',
      'Retry Failed Messages: 1-click re-queue of failed transmissions.',
    ],
  },
  {
    version: 'v2.2.0',
    title: 'SaaS Platform Owner Hub & Dynamic Demo Data for ALL Schools',
    date: '28 October 2026',
    khiTime: '11:15 PM PKT (Karachi Time)',
    badge: 'Enhancement',
    status: 'Live & Deployed on Vercel',
    summary:
      'Dynamic demo data generator for any school ID without static file dependencies. Multi-tenant Owner Dashboard with per-school Supabase DB setup and 4 core skins.',
    features: [
      'Dynamic Demo Generator: Generates 26 Pakistani scholars, 26 fee vouchers, 8 diary lessons, and results for ANY school.',
      'Owner Dashboard Hub: Multi-school overview with dedicated Supabase URL and Anon Key configuration per school.',
      'Fixed skin preview blink issue when switching institutions.',
      'Included all 4 school reference skins (Imperial, High Star, Ideas, Leading) with admin accounts.',
    ],
  },
  {
    version: 'v2.1.0',
    title: 'CSS Button Color Corruption Fix & CamScanner Diary Planners',
    date: '28 October 2026',
    khiTime: '06:30 PM PKT (Karachi Time)',
    badge: 'Fix',
    status: 'Live & Deployed on Vercel',
    summary:
      'Resolved Vite CSS hex color replacement regex issue that blanked button backgrounds, enhanced CamScanner diary uploads, and fixed TypeScript lint CI errors.',
    features: [
      'Vite Theme Color Regex Fix: Restricted color replacement to CSS property declarations.',
      'Digital Diary PDF & Snap Work: Upload Class Work & Planner PDF scans with verified parent read receipts.',
      'Role Switcher Bar: Added Owner persona with golden Crown icon.',
    ],
  },
];
