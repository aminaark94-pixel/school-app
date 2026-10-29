import { Notice, NoticeCategory } from '../types';

export interface AutomatedCircularRule {
  id: string;
  type: 'holiday' | 'fee_reminder' | 'weather_emergency';
  title: string;
  category: NoticeCategory;
  priority: 'normal' | 'urgent';
  refNumber: string;
  month?: number; // 1-12
  day?: number; // 1-31
  monthOffsetDay?: number; // e.g. 1st, 7th, 10th, 15th of every month
  description: string;
  contentTemplate: (schoolName: string, year: number, monthName?: string) => string;
  whatsappTemplate: (schoolName: string, year: number, monthName?: string) => string;
}

export const AUTOMATED_HOLIDAY_RULES: AutomatedCircularRule[] = [
  {
    id: 'kashmir_day',
    type: 'holiday',
    title: 'Official Notification: Kashmir Solidarity Day Public Holiday',
    category: 'holiday',
    priority: 'normal',
    refNumber: 'CIR/KAS/05',
    month: 2,
    day: 5,
    description: 'Annual National Public Holiday observed nationwide on 5th February.',
    contentTemplate: (schoolName, year) =>
      `This is to officially inform all students, faculty members, and respected parents that ${schoolName} will remain closed on Wednesday, 5th February ${year} on account of Kashmir Solidarity Day in compliance with Federal and Provincial Government notifications.\n\nRegular academic classes and administrative office operations will resume as per regular timetable on the following working day.\n\nHomework and digital revision planners have been updated in the Student Diary module.`,
    whatsappTemplate: (schoolName, year) =>
      `📢 Official Circular — ${schoolName}\n\nRespected Parents, campus will remain closed on 5th February ${year} for Kashmir Solidarity Day as per government gazette. Classes resume next working day. Please check student diary online.`,
  },
  {
    id: 'pakistan_day',
    type: 'holiday',
    title: 'Official Circular: Pakistan Day (23rd March) Holiday',
    category: 'holiday',
    priority: 'normal',
    refNumber: 'CIR/PAK/23',
    month: 3,
    day: 23,
    description: 'National Day commemorating the Lahore Resolution of 1940.',
    contentTemplate: (schoolName, year) =>
      `Respected Parents & Students,\n\nIn commemoration of the historic Lahore Resolution passed on 23rd March 1940, ${schoolName} will observe a general public holiday on 23rd March ${year}.\n\nLet us remember the dedication and sacrifices of our founding fathers and renew our commitment to academic excellence and national prosperity. School operations will resume on the next official working day.`,
    whatsappTemplate: (schoolName, year) =>
      `🇵🇰 Pakistan Day Notice — ${schoolName}\n\nDear Parents, campus will be closed on 23rd March ${year} in honor of Pakistan Day. Regular classes resume as scheduled. Happy Pakistan Day!`,
  },
  {
    id: 'eid_ul_fitr',
    type: 'holiday',
    title: 'Official Notification: Eid-ul-Fitr Holidays & Break Schedule',
    category: 'holiday',
    priority: 'urgent',
    refNumber: 'CIR/EID/FITR',
    month: 4,
    day: 10,
    description: 'Religious festive break marking the end of the Holy Month of Ramadan.',
    contentTemplate: (schoolName, year) =>
      `Assalam-o-Alaikum Respected Parents & Students,\n\nThe administration of ${schoolName} extends its warmest greetings and felicitations on the auspicious occasion of Eid-ul-Fitr ${year}.\n\nThe school campus will observe Eid holidays as notified by the Department of Education. All academic departments, faculty offices, and transport services will remain closed during the break.\n\nWe pray this festive season brings peace, happiness, and prosperity to your families. Formal academic timetable resumes promptly after the notified break.`,
    whatsappTemplate: (schoolName, year) =>
      `🌙 Eid-ul-Fitr Mubarak — ${schoolName}\n\nWarmest Eid wishes to all families! School will remain closed for Eid-ul-Fitr holidays. Classes resume after the break. Eid Mubarak!`,
  },
  {
    id: 'labour_day',
    type: 'holiday',
    title: 'Public Holiday Notification: International Workers Day (1st May)',
    category: 'holiday',
    priority: 'normal',
    refNumber: 'CIR/LAB/01',
    month: 5,
    day: 1,
    description: 'International Labour Day observed nationwide.',
    contentTemplate: (schoolName, year) =>
      `Dear Parents & Guardians,\n\n${schoolName} will remain closed on Thursday, 1st May ${year} in observance of International Labour Day as declared by the Federal Ministry of Interior.\n\nAcademic sessions and daily lessons will resume smoothly on the subsequent working morning.`,
    whatsappTemplate: (schoolName, year) =>
      `📢 Holiday Notice — ${schoolName}\n\nCampus remains closed on 1st May ${year} for International Workers Day. Regular timetable resumes the following day.`,
  },
  {
    id: 'summer_vacation',
    type: 'holiday',
    title: 'Annual Summer Vacations & Vacation Homework Tasks Circular',
    category: 'holiday',
    priority: 'urgent',
    refNumber: 'CIR/VAC/SUMMER',
    month: 6,
    day: 1,
    description: 'Annual summer recess and vacation assignment distribution.',
    contentTemplate: (schoolName, year) =>
      `Respected Parents,\n\nAnnual Summer Vacations ${year} will commence from 1st June ${year} as per directives of the School Education Department.\n\n• Summer Vacation Homework Tasks (SVT) and Classwork Planners have been uploaded to the Digital Diary module.\n• Accounts & Administrative Secretariat will remain operational from 09:00 AM to 01:00 PM for admissions and fee clearances.\n• School will re-open for the Autumn Academic Term on 15th August ${year}.`,
    whatsappTemplate: (schoolName, year) =>
      `☀️ Summer Vacations Notice — ${schoolName}\n\nSummer recess commences 1st June ${year}. Summer task assignments are available on the portal. Accounts office remains open 9am-1pm on weekdays.`,
  },
  {
    id: 'eid_ul_adha',
    type: 'holiday',
    title: 'Official Notification: Eid-ul-Adha Holidays Advisory',
    category: 'holiday',
    priority: 'urgent',
    refNumber: 'CIR/EID/ADHA',
    month: 6,
    day: 17,
    description: 'Feast of the Sacrifice Islamic holiday break.',
    contentTemplate: (schoolName, year) =>
      `Assalam-o-Alaikum Respected Guardians,\n\nOn the blessed occasion of Eid-ul-Adha ${year}, ${schoolName} campus will remain closed for Eid holidays in accordance with government schedule.\n\nMay the spirit of sacrifice, charity, and obedience illuminate our community. Formal academic duties resume as per official notification.`,
    whatsappTemplate: (schoolName, year) =>
      `🐑 Eid-ul-Adha Mubarak — ${schoolName}\n\nHeartiest Eid-ul-Adha greetings to our students and guardians. School campus will remain closed for official Eid holidays.`,
  },
  {
    id: 'ashura_holidays',
    type: 'holiday',
    title: 'Official Notification: Ashura Holidays (9th & 10th Muharram)',
    category: 'holiday',
    priority: 'urgent',
    refNumber: 'CIR/MUH/0910',
    month: 7,
    day: 16,
    description: 'Solemn observance of 9th and 10th Muharram-ul-Haram.',
    contentTemplate: (schoolName, year) =>
      `Respected Parents & Faculty,\n\nIn solemn remembrance of the supreme sacrifice of Hazrat Imam Hussain (R.A.) and the martyrs of Karbala, ${schoolName} will observe two days of public holiday on the 9th and 10th of Muharram ${year}.\n\nSchool transport and campus facilities will resume on the next working morning.`,
    whatsappTemplate: (schoolName, year) =>
      `🏴 Ashura Holidays Notice — ${schoolName}\n\nCampus closed on 9th & 10th Muharram. Academic classes will resume immediately after the break.`,
  },
  {
    id: 'independence_day',
    type: 'holiday',
    title: 'Independence Day (14th August) Celebrations & Flag Hoisting Ceremony',
    category: 'event',
    priority: 'normal',
    refNumber: 'CIR/IND/14',
    month: 8,
    day: 14,
    description: 'National 14th August celebrations and flag hoisting schedule.',
    contentTemplate: (schoolName, year) =>
      `Respected Parents, Teachers & Students,\n\n${schoolName} will celebrate the 79th Independence Day of the Islamic Republic of Pakistan on 14th August ${year}.\n\n• Flag Hoisting Ceremony: 08:30 AM in the Main Campus Courtyard.\n• National Anthem, Milli Naghmat, and Inter-House Speech Competitions.\n• Students are encouraged to attend in formal school uniform or traditional green and white attire.\n\nFormal classes resume on 15th August.`,
    whatsappTemplate: (schoolName, year) =>
      `🇵🇰 14th August Flag Hoisting — ${schoolName}\n\nJoin us for Pakistan Independence Day Celebrations on 14th August at 8:30 AM. Flag hoisting & speech competition. Happy Independence Day!`,
  },
  {
    id: 'defence_day',
    type: 'holiday',
    title: 'Defence Day of Pakistan (6th September) Special Commemoration',
    category: 'event',
    priority: 'normal',
    refNumber: 'CIR/DEF/06',
    month: 9,
    day: 6,
    description: 'National Defence Day tribute to the armed forces.',
    contentTemplate: (schoolName, year) =>
      `Respected Parents & Guardians,\n\nOn 6th September ${year}, ${schoolName} pays heartfelt tribute to the brave soldiers and martyrs of Pakistan Armed Forces who defended our beloved homeland during the 1965 war.\n\nA special morning assembly and documentary screening on national martyrs will be conducted. School timings remain regular.`,
    whatsappTemplate: (schoolName, year) =>
      `🎖️ Defence Day Tribute — ${schoolName}\n\nSpecial assembly and national commemoration on 6th September honoring our armed forces. Regular campus timings apply.`,
  },
  {
    id: 'eid_milad',
    type: 'holiday',
    title: 'Official Notification: Eid Milad-un-Nabi (12th Rabi-ul-Awwal) Holiday',
    category: 'holiday',
    priority: 'urgent',
    refNumber: 'CIR/RAB/12',
    month: 9,
    day: 15,
    description: 'Sacred birth commemoration of the Holy Prophet Muhammad (P.B.U.H).',
    contentTemplate: (schoolName, year) =>
      `Assalam-o-Alaikum Respected Guardians,\n\nIn reverence of the birth anniversary of the Holy Prophet Muhammad (Peace Be Upon Him) — Rehmat-ul-lil-Alameen, ${schoolName} will observe an official holiday on 12th Rabi-ul-Awwal ${year}.\n\nMay the teachings of compassion, knowledge, and integrity guide our students and families. Regular academic sessions resume the next working day.`,
    whatsappTemplate: (schoolName, year) =>
      `🌹 12th Rabi-ul-Awwal Mubarak — ${schoolName}\n\nSchool will remain closed on 12th Rabi-ul-Awwal in honor of Eid Milad-un-Nabi (PBUH). Regular classes resume on following working day.`,
  },
  {
    id: 'iqbal_day',
    type: 'holiday',
    title: 'Official Circular: Iqbal Day (9th November) Public Holiday',
    category: 'holiday',
    priority: 'normal',
    refNumber: 'CIR/IQB/09',
    month: 11,
    day: 9,
    description: 'National holiday honoring Dr. Allama Muhammad Iqbal.',
    contentTemplate: (schoolName, year) =>
      `Respected Parents & Students,\n\nIn accordance with the gazette notification by the Government of Pakistan, ${schoolName} will observe a public holiday on 9th November ${year} to honor our national poet and philosopher Dr. Allama Muhammad Iqbal.\n\nStudents are encouraged to reflect on Iqbal’s philosophy of "Khudi" (self-reliance) and commitment to knowledge. Classes resume on the next working morning.`,
    whatsappTemplate: (schoolName, year) =>
      `🦅 Iqbal Day Notice — ${schoolName}\n\nCampus will remain closed on 9th November ${year} on account of Iqbal Day. Classes resume on the next working day.`,
  },
  {
    id: 'quaid_day_winter',
    type: 'holiday',
    title: 'Official Notification: Quaid-e-Azam Day & Annual Winter Break',
    category: 'holiday',
    priority: 'urgent',
    refNumber: 'CIR/WIN/25',
    month: 12,
    day: 25,
    description: 'Quaid-e-Azam Day (25th Dec) and annual winter vacation closure.',
    contentTemplate: (schoolName, year) =>
      `Respected Parents,\n\n${schoolName} announces the commencement of Winter Vacations ${year} starting from 24th December ${year} through 5th January ${year + 1}.\n\n• 25th December will be observed with deep reverence as the birthday of Quaid-e-Azam Muhammad Ali Jinnah and Christmas festivities for our Christian community.\n• Winter holiday revision assignments are available in the Digital Diary.\n• Campus will reopen for regular classes on 6th January ${year + 1} at 08:30 AM sharp.`,
    whatsappTemplate: (schoolName, year) =>
      `❄️ Winter Vacation & Quaid Day Notice — ${schoolName}\n\nWinter vacation commences 24th Dec through 5th Jan. School re-opens 6th January. Happy Quaid Day & Happy New Year!`,
  },
  {
    id: 'smog_rain_emergency',
    type: 'weather_emergency',
    title: 'Urgent Weather & Air Quality Advisory: Online Learning Protocol',
    category: 'emergency',
    priority: 'urgent',
    refNumber: 'CIR/SMOG/EMG',
    description: 'Government directive regarding severe smog, rain, or heatwave conditions.',
    contentTemplate: (schoolName, year) =>
      `URGENT NOTIFICATION FOR PARENTS\n\nIn strict compliance with executive directives issued by the Provincial Disaster Management Authority (PDMA) regarding severe smog/hazardous Air Quality Index (AQI) levels, on-campus physical classes at ${schoolName} are temporarily suspended.\n\n• All faculty members will conduct daily lessons and homework assignments through the Digital Diary & LMS portal.\n• Parents are advised to keep children indoors with protective masks if outdoors.\n• Campus reopening is contingent on government clearance.`,
    whatsappTemplate: (schoolName, year) =>
      `⚠️ URGENT Advisory — ${schoolName}\n\nPhysical classes suspended due to hazardous weather/smog conditions as per PDMA directive. Daily homework and video lectures are posted on the digital portal.`,
  },
];

export const AUTOMATED_FEE_RULES: AutomatedCircularRule[] = [
  {
    id: 'fee_issuance_1st',
    type: 'fee_reminder',
    title: 'Monthly Tuition Fee Challans Issued (New Academic Month)',
    category: 'fee_reminder',
    priority: 'normal',
    refNumber: 'CIR/FEE/01',
    monthOffsetDay: 1,
    description: 'Issued on 1st of every calendar month announcing new fee challans.',
    contentTemplate: (schoolName, year, monthName = 'the Current Month') =>
      `Respected Parents & Guardians,\n\nMonthly Tuition Fee vouchers for ${monthName} ${year} have been issued and distributed to scholars. Digital vouchers are also available on the parent portal.\n\n• Mode of Payment: Designated bank branches (HBL, Meezan, Bank Alfalah) or Mobile Banking / 1Bill.\n• Standard Due Date: 10th of ${monthName} ${year}.\n• Please present the paid voucher counterfoil to the Accounts Secretariat or verify clearance online.\n\nAccounts & Bursar Secretariat, ${schoolName}`,
    whatsappTemplate: (schoolName, year, monthName = 'this month') =>
      `💳 Fee Challan Notice — ${schoolName}\n\nMonthly tuition vouchers for ${monthName} ${year} have been generated. Standard due date is 10th of the month. Please clear dues timely via 1Bill or designated bank branches.`,
  },
  {
    id: 'fee_mid_reminder_7th',
    type: 'fee_reminder',
    title: 'Mid-Month Fee Clearance Reminder (3 Days Remaining)',
    category: 'fee_reminder',
    priority: 'normal',
    refNumber: 'CIR/FEE/07',
    monthOffsetDay: 7,
    description: 'Dispatched on 7th of the month to give parents a courteous 3-day reminder.',
    contentTemplate: (schoolName, year, monthName = 'the Current Month') =>
      `Respected Parents,\n\nThis is a courteous reminder that only 3 days remain to deposit the monthly tuition fee for ${monthName} ${year} before the due date (10th of ${monthName}).\n\nTimely clearance ensures unhindered access to academic digital planners, examination results, and school transport facilities.\n\nFor any fee ledger discrepancies, please contact the Accounts Office between 08:30 AM and 02:00 PM.`,
    whatsappTemplate: (schoolName, year, monthName = 'the month') =>
      `⏰ Reminder: 3 Days Left — ${schoolName}\n\nDear Parent, only 3 days remain before the 10th due date for ${monthName} tuition clearance. Kindly settle dues to avoid late surcharges.`,
  },
  {
    id: 'fee_due_date_10th',
    type: 'fee_reminder',
    title: 'FINAL NOTICE: Tuition Fee Due Date Today (Late Surcharge Warning)',
    category: 'fee_reminder',
    priority: 'urgent',
    refNumber: 'CIR/FEE/10',
    monthOffsetDay: 10,
    description: 'Urgent notice dispatched on 10th of month regarding due date deadline.',
    contentTemplate: (schoolName, year, monthName = 'the Month') =>
      `IMPORTANT NOTICE: LAST DATE FOR FEE SUBMISSION\n\nRespected Parents, today is the FINAL due date for the clearance of tuition dues for ${monthName} ${year}.\n\n• As per school governing board policy, a late payment fine of PKR 500 will automatically apply to unpaid challans starting tomorrow.\n• Please clear the pending voucher today at any bank branch or online banking channel to avoid penalty.\n\nBursar Secretariat, ${schoolName}`,
    whatsappTemplate: (schoolName, year) =>
      `🚨 TODAY is Last Date — ${schoolName}\n\nToday is the final day to pay tuition fee without late surcharge. A late fee penalty applies starting tomorrow. Please deposit your voucher today.`,
  },
  {
    id: 'fee_defaulter_lock_15th',
    type: 'fee_reminder',
    title: 'CRITICAL ADVISORY: Defaulter Notice & Portal Transcript Suspension Warning',
    category: 'fee_reminder',
    priority: 'urgent',
    refNumber: 'CIR/FEE/15',
    monthOffsetDay: 15,
    description: 'Final defaulter warning dispatched on 15th before digital portal restriction.',
    contentTemplate: (schoolName, year, monthName = 'the Current Month') =>
      `CRITICAL ADMINISTRATIVE NOTICE: FEE DEFAULTER ROSTER\n\nRespected Guardians,\n\nDespite repeated reminders, our accounts ledger reflects outstanding tuition fee arrears for ${monthName} ${year}.\n\n• In accordance with institutional bylaws, examination result cards and student portal transcripts will remain locked for fee-defaulter students.\n• To restore active academic clearance, please submit pending arrears immediately.\n• Contact the Bursar Office immediately if dues have already been deposited.`,
    whatsappTemplate: (schoolName, year) =>
      `⚠️ URGENT Defaulter Notice — ${schoolName}\n\nTuition arrears remain pending. Digital report cards and exam transcripts will remain locked until clearance. Please settle outstanding dues immediately.`,
  },
];

/**
 * Returns all rules combined
 */
export function getAllAutomationRules(): AutomatedCircularRule[] {
  return [...AUTOMATED_HOLIDAY_RULES, ...AUTOMATED_FEE_RULES];
}

/**
 * Finds upcoming holiday or fee milestone relative to a reference date
 */
export function getUpcomingMilestones(
  now: Date = new Date()
): Array<{ rule: AutomatedCircularRule; targetDate: Date; daysRemaining: number }> {
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentDay = now.getDate();

  const results: Array<{ rule: AutomatedCircularRule; targetDate: Date; daysRemaining: number }> = [];

  // 1. Holiday rules
  for (const rule of AUTOMATED_HOLIDAY_RULES) {
    if (rule.month && rule.day) {
      let targetYear = currentYear;
      if (rule.month < currentMonth || (rule.month === currentMonth && rule.day < currentDay)) {
        targetYear = currentYear + 1;
      }
      const targetDate = new Date(targetYear, rule.month - 1, rule.day);
      const diffMs = targetDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      results.push({ rule, targetDate, daysRemaining });
    }
  }

  // 2. Fee rules (based on monthly cycle)
  for (const rule of AUTOMATED_FEE_RULES) {
    if (rule.monthOffsetDay) {
      let targetMonth = currentMonth;
      let targetYear = currentYear;
      if (currentDay > rule.monthOffsetDay) {
        targetMonth = currentMonth + 1;
        if (targetMonth > 12) {
          targetMonth = 1;
          targetYear += 1;
        }
      }
      const targetDate = new Date(targetYear, targetMonth - 1, rule.monthOffsetDay);
      const diffMs = targetDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      results.push({ rule, targetDate, daysRemaining });
    }
  }

  // Sort by days remaining ascending
  return results.sort((a, b) => a.daysRemaining - b.daysRemaining);
}
