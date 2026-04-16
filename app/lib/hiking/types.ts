export type HikeDifficulty = 'easy' | 'moderate' | 'hard' | 'expert';

/** Broad geography inside Catalunya for filtering. */
export type HikeRegion = 'barcelona-metro' | 'prelitoral' | 'pirineu' | 'costa' | 'interior';

export interface HikingRoute {
  id: string;
  slug: string;
  name: string;
  summary: string;
  region: HikeRegion;
  /** Comarca or cross-border label for display. */
  comarca: string;
  difficulty: HikeDifficulty;
  /** Typical round-trip or loop distance when one number makes sense; null if highly variable. */
  distanceKm: number | null;
  /** Approximate cumulative ascent for a typical itinerary. */
  elevationGainM: number | null;
  /** Typical moving time in hours (rough). */
  durationHours: number | null;
  /** Map framing / trailhead area (WGS84). */
  center: { lat: number; lon: number };
  tags: string[];
  /** Park office, meteorologia, or official topo — check before heading out. */
  infoUrl?: string;
}

export const HIKE_REGIONS: Record<HikeRegion, { label: string; short: string }> = {
  'barcelona-metro': { label: 'Barcelona & metro', short: 'BCN' },
  prelitoral: { label: 'Prelitoral & Montseny', short: 'Prelitoral' },
  pirineu: { label: 'Pirineu & Prepirineu', short: 'Pirineu' },
  costa: { label: 'Costa & GR 92', short: 'Costa' },
  interior: { label: 'Interior & històric', short: 'Interior' },
};

export const HIKE_DIFFICULTY_LABEL: Record<HikeDifficulty, string> = {
  easy: 'Easy',
  moderate: 'Moderate',
  hard: 'Hard',
  expert: 'Expert / multi-day',
};
