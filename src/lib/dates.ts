export const SCHOOL_TIME_ZONE = 'Asia/Karachi';
export type DateLanguage = 'en' | 'ur-roman' | 'ur';

const pkParts = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric', month: '2-digit', day: '2-digit', timeZone: SCHOOL_TIME_ZONE,
});

export function todayPK(now = new Date(), daysAhead = 0): string {
  const parts = pkParts.formatToParts(now);
  const get = (name: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === name)?.value);
  return new Date(Date.UTC(get('year'), get('month') - 1, get('day') + daysAhead)).toISOString().slice(0, 10);
}

export function formatDate(
  value: string | Date | null | undefined,
  language: DateLanguage = 'en',
  { relative = false, now = new Date() } = {},
): string {
  if (!value) return '—';
  const calendarDate = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = value instanceof Date ? value : new Date(calendarDate ? `${value}T00:00:00+05:00` : value);
  if (!Number.isFinite(date.getTime())) return '—';
  const key = todayPK(date);
  if (calendarDate && key !== value) return '—';
  if (relative) {
    if (key === todayPK(now)) return language === 'ur-roman' ? 'Aaj' : language === 'ur' ? 'آج' : 'Today';
    if (key === todayPK(now, 1)) return language === 'ur-roman' ? 'Kal' : language === 'ur' ? 'کل' : 'Tomorrow';
  }
  return new Intl.DateTimeFormat(language === 'ur' ? 'ur-PK' : 'en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: SCHOOL_TIME_ZONE,
  }).format(date);
}
