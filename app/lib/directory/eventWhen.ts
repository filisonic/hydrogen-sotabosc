const CITY_TZ = 'Europe/Madrid';

function madridDay(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: CITY_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** Seed times are Barcelona wall-clock (`YYYY-MM-DDTHH:mm`). */
export function parseCityInstant(value: string): Date {
  if (/(?:Z|[+-]\d{2}:?\d{2})$/.test(value)) return new Date(value);
  const local = value.length === 16 ? `${value}:00` : value;
  return new Date(local);
}

export type EventPulse = 'now' | 'today' | 'week' | 'later';

export function eventPulse(
  event: { startsAt: string; endsAt?: string },
  now: Date = new Date(),
): EventPulse {
  const start = parseCityInstant(event.startsAt);
  const end = event.endsAt
    ? parseCityInstant(event.endsAt)
    : new Date(start.getTime() + 2 * 60 * 60 * 1000);
  if (Number.isNaN(start.getTime())) return 'later';
  if (now >= start && now <= end) return 'now';
  if (madridDay(now) === madridDay(start)) return 'today';
  const inAWeek = now.getTime() + 7 * 24 * 60 * 60 * 1000;
  if (start.getTime() > now.getTime() && start.getTime() <= inAWeek) return 'week';
  return 'later';
}

export function pulseLabel(pulse: EventPulse): string {
  if (pulse === 'now') return 'Happening now';
  if (pulse === 'today') return 'Today';
  if (pulse === 'week') return 'This week';
  return 'Upcoming';
}

/** Doors to the virtual room only open while the gathering is actually on. */
export function isEventLive(
  event: { startsAt: string; endsAt?: string; pulse?: EventPulse },
  now: Date = new Date(),
): boolean {
  if (event.pulse === 'now') return true;
  if (event.pulse && event.pulse !== 'now') return false;
  return eventPulse(event, now) === 'now';
}
