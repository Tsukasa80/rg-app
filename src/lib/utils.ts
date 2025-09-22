import { differenceInCalendarDays, formatISO, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

export function formatDateTime(value: string | Date) {
  const date = typeof value === 'string' ? parseISO(value) : value;
  return new Intl.DateTimeFormat('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function startOfIsoWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay() || 7;
  if (day !== 1) {
    d.setHours(-24 * (day - 1));
  }
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isoWeekIdentifier(date: Date) {
  const start = startOfIsoWeek(date);
  const year = start.getFullYear();
  const week = Number(new Intl.DateTimeFormat('en-GB-u-ca-iso8601', {
    weekNumber: 'numeric'
  }).format(date));
  return { year, isoWeek: week, identifier: year * 100 + week };
}

export function isoWeekRange(identifier: number) {
  const year = Math.floor(identifier / 100);
  const week = identifier % 100;
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = dow <= 4 ? new Date(simple.setDate(simple.getDate() - simple.getDay() + 1)) : new Date(simple.setDate(simple.getDate() + 8 - simple.getDay()));
  const ISOweekEnd = new Date(ISOweekStart);
  ISOweekEnd.setDate(ISOweekStart.getDate() + 6);
  return { start: ISOweekStart, end: ISOweekEnd };
}

export function calcMedian(values: number[]) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function formatDuration(minutes = 0) {
  if (minutes < 60) return `${minutes}分`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}時間${rest}分` : `${hours}時間`;
}

export function relativeDaysFromNow(date: string) {
  const diff = differenceInCalendarDays(new Date(), parseISO(date));
  if (diff === 0) return '今日';
  if (diff === 1) return '昨日';
  if (diff === -1) return '明日';
  return `${Math.abs(diff)}日${diff > 0 ? '前' : '後'}`;
}

export function formatIsoDate(value: Date) {
  return formatISO(value, { representation: 'date' });
}

export function formatIsoDateTime(value: Date) {
  return formatISO(value);
}

export const dateLocale = ja;
