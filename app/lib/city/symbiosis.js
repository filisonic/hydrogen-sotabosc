import { KINGDOMS_BY_KEY } from './kingdoms';

/**
 * Who a citizen's screen promotes: neighbours in its own kingdom first,
 * then one citizen from the kingdom it feeds.
 *
 * @param {{ slug: string; kingdom: string }} citizen
 * @param {Array<{ slug: string; kingdom: string }>} citizens
 */
export function screenPartnersFor(citizen, citizens) {
  const kingdom = KINGDOMS_BY_KEY[citizen.kingdom];
  const neighbours = citizens.filter((c) => c.kingdom === citizen.kingdom && c.slug !== citizen.slug);
  const downstream = citizens.filter((c) => c.kingdom === kingdom?.feeds);
  return {
    neighbours: neighbours.slice(0, 2),
    downstream: downstream[0] ?? null,
  };
}

/** Morning / midday / afternoon / evening / night in Barcelona time. */
export function barcelonaDaypart(date) {
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Europe/Madrid' }).format(
      date,
    ),
  );
  if (hour < 6) return 'night';
  if (hour < 12) return 'morning';
  if (hour < 15) return 'midday';
  if (hour < 20) return 'afternoon';
  return 'evening';
}

/** How the 3D city is lit right now: it keeps Barcelona's hours. */
export function cityLightMode(date) {
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Europe/Madrid' }).format(
      date,
    ),
  );
  if (hour < 6 || hour >= 21) return 'night';
  if (hour < 8 || hour >= 19) return 'dusk';
  return 'day';
}

export function formatBarcelonaTime(date) {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Madrid',
  }).format(date);
}

export function formatBarcelonaClock(date) {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Madrid',
  }).format(date);
}
