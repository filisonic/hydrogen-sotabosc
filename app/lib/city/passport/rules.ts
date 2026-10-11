/**
 * City passport — the rules that turn visits into collectibles.
 *
 * Pure functions, no storage and no React, so the same rules can run in the
 * browser today and on the server once visits are synced (see docs/city-passport.md).
 *
 * A kingdom's collectible surfaces when a visitor either
 *   · walks into `distinctPlaces` different places in that kingdom (explorer), or
 *   · returns to one place in that kingdom on `repeatVisits` different days (regular).
 */

export type VisitSource = 'map' | 'listing' | 'screen' | 'room';

export interface Visit {
  /** Place slug. */
  place: string;
  /** Kingdom key: earth | plants | fungi | animals | algae. */
  kingdom: string;
  /** Barcelona calendar day, YYYY-MM-DD. A place counts once per day. */
  day: string;
  /** Epoch ms. */
  at: number;
  source: VisitSource;
}

export interface PassportRules {
  repeatVisits: number;
  distinctPlaces: number;
}

export const PASSPORT_RULES: PassportRules = {
  repeatVisits: 4,
  distinctPlaces: 3,
};

export type UnlockPath = 'explorer' | 'regular';

export interface KingdomProgress {
  kingdom: string;
  /** Different places visited in this kingdom. */
  places: number;
  /** The most-returned-to place, counted in days. */
  favourite: { place: string; days: number } | null;
  unlocked: boolean;
  via: UnlockPath | null;
  /** 0..1 along whichever path is closer. */
  ratio: number;
}

export type CollectibleState = 'hidden' | 'stirring' | 'surfaced' | 'collected';

export function barcelonaDay(date: Date): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** Adds a visit unless that place was already counted that day. Returns the same array when nothing changes. */
export function addVisit(visits: Visit[], visit: Visit): Visit[] {
  if (visits.some((v) => v.place === visit.place && v.day === visit.day)) return visits;
  return [...visits, visit];
}

/** Days this place has been visited on. */
export function placeVisits(visits: Visit[], place: string): number {
  return visits.filter((v) => v.place === place).length;
}

export function kingdomProgress(
  visits: Visit[],
  kingdom: string,
  rules: PassportRules = PASSPORT_RULES,
): KingdomProgress {
  const days = new Map<string, number>();
  for (const v of visits) {
    if (v.kingdom === kingdom) days.set(v.place, (days.get(v.place) ?? 0) + 1);
  }
  let favourite: KingdomProgress['favourite'] = null;
  for (const [place, count] of days) {
    if (!favourite || count > favourite.days) favourite = { place, days: count };
  }
  const explorer = days.size >= rules.distinctPlaces;
  const regular = (favourite?.days ?? 0) >= rules.repeatVisits;
  return {
    kingdom,
    places: days.size,
    favourite,
    unlocked: explorer || regular,
    via: explorer ? 'explorer' : regular ? 'regular' : null,
    ratio: Math.min(
      1,
      Math.max(days.size / rules.distinctPlaces, (favourite?.days ?? 0) / rules.repeatVisits),
    ),
  };
}

export function collectibleState(progress: KingdomProgress, collected: boolean): CollectibleState {
  if (collected) return 'collected';
  if (progress.unlocked) return 'surfaced';
  return progress.ratio > 0 ? 'stirring' : 'hidden';
}

/** One line telling the visitor what is left to do in a kingdom. */
export function nextStep(progress: KingdomProgress, rules: PassportRules = PASSPORT_RULES): string {
  if (progress.unlocked) return 'Its collectible has surfaced on the map.';
  const morePlaces = rules.distinctPlaces - progress.places;
  const moreDays = rules.repeatVisits - (progress.favourite?.days ?? 0);
  const places = `${morePlaces} more place${morePlaces === 1 ? '' : 's'} here`;
  if (!progress.favourite) return `Walk into ${rules.distinctPlaces} places here, or return to one on ${rules.repeatVisits} days.`;
  return `Walk into ${places}, or come back to one on ${moreDays} more day${moreDays === 1 ? '' : 's'}.`;
}
