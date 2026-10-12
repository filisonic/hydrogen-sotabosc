import type { CityEvent } from './types';

const CITY_TZ = 'Europe/Madrid';

/** Barcelona calendar month of an event start, as `YYYY-MM`. */
export function eventMonthKey(startsAt: string): string {
  const d = new Date(startsAt);
  if (Number.isNaN(d.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: CITY_TZ,
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(d);
  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  return year && month ? `${year}-${month}` : '';
}

export function parseMonthParam(yyyyMm: string): { year: number; month: number } | null {
  const m = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(yyyyMm);
  if (!m) return null;
  return { year: Number(m[1]), month: Number(m[2]) };
}

export function monthLabel(yyyyMm: string, locale = 'en-GB'): string {
  const parsed = parseMonthParam(yyyyMm);
  if (!parsed) return yyyyMm;
  return new Date(Date.UTC(parsed.year, parsed.month - 1, 15)).toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function currentMonthKey(now: Date = new Date()): string {
  return eventMonthKey(now.toISOString());
}

export function eventsInMonth(events: readonly CityEvent[], yyyyMm: string): CityEvent[] {
  return events
    .filter((e) => eventMonthKey(e.startsAt) === yyyyMm)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
}

function addCalendarMonths(yyyyMm: string, n: number): string {
  const parsed = parseMonthParam(yyyyMm);
  if (!parsed) return yyyyMm;
  const idx = parsed.year * 12 + (parsed.month - 1) + n;
  const year = Math.floor(idx / 12);
  const month = (idx % 12) + 1;
  return `${year}-${String(month).padStart(2, '0')}`;
}

/** Months with listings, plus the current month and the next three so people can browse ahead. */
export function listEventMonths(events: readonly CityEvent[], now: Date = new Date()): string[] {
  const keys = new Set(events.map((e) => eventMonthKey(e.startsAt)).filter(Boolean));
  const current = currentMonthKey(now);
  keys.add(current);
  keys.add(addCalendarMonths(current, 1));
  keys.add(addCalendarMonths(current, 2));
  keys.add(addCalendarMonths(current, 3));
  return [...keys].sort();
}
