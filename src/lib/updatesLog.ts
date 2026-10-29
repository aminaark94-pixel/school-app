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
    version: 'v2.6.0',
    title: "Teacher's Progress & Regularity Section for School Incharge & Management",
    date: '29 October 2026',
    khiTime: '06:35 PM PKT (Karachi Time)',
    badge: 'Latest',
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
