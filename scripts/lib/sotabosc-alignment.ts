/**
 * Editorial checklist + lightweight scoring for Sotabosc-aligned listings.
 * Geography: Catalunya / Spain preferred as a soft signal, not a gate — expand cities freely.
 */

export type AlignmentVerdict = 'recommend_seed' | 'review' | 'likely_skip';

export type DomainCategory =
  | 'plants'
  | 'algae'
  | 'fungi'
  | 'animals'
  | 'earth';

export type ListingCategory =
  | 'coworking'
  | 'art-gallery'
  | 'music-venue'
  | 'conference'
  | 'workshop'
  | 'retreat'
  | 'specialty-coffee'
  | 'restaurant'
  | 'shop'
  | 'other';

export type ChecklistItem = {
  id: string;
  label: string;
  /** 0–1 strength from keyword match */
  strength: number;
  passed: boolean;
  note: string;
};

export type AlignmentResult = {
  score: number;
  verdict: AlignmentVerdict;
  checklist: ChecklistItem[];
  suggestedPrimaryDomain: DomainCategory;
  suggestedCategories: ListingCategory[];
  /** Soft signals only — never blocks inclusion */
  geographyNote: string;
  cautionFlags: string[];
};

const norm = (s: string) => s.toLowerCase();

/** Positive axes: match any token → contributes to that axis */
const AXES: { id: string; label: string; weight: number; tokens: string[] }[] = [
  {
    id: 'culture_craft',
    label: 'Culture & craft (art, making, exhibitions, performance)',
    weight: 1,
    tokens: [
      'gallery',
      'galeria',
      'exhibition',
      'exposici',
      'taller',
      'workshop',
      'ceramic',
      'ceràmica',
      'residency',
      'residència',
      'open studio',
      'artist',
      'artista',
      'design',
      'disseny',
      'museum',
      'museu',
      'festival',
      'concert',
      'jazz',
      'poetry',
      'poesia',
      'theatre',
      'teatre',
      'dance',
      'dansa',
      'counterculture',
      'underground',
      'activism',
      'activisme',
    ],
  },
  {
    id: 'nature_wellness',
    label: 'Nature & wellness (movement, retreat, outdoors, calm)',
    weight: 1,
    tokens: [
      'yoga',
      'meditation',
      'meditaci',
      'retreat',
      'retir',
      'wellness',
      'bienestar',
      'nature',
      'naturaleza',
      'natura',
      'forest',
      'bosc',
      'mountain',
      'muntanya',
      'hiking',
      'senderisme',
      'eco',
      'sostenible',
      'sustainability',
      'organic',
      'ecològic',
      'slow',
      'solarpunk',
      'permaculture',
      'permacultura',
      'zero waste',
    ],
  },
  {
    id: 'community_third_place',
    label: 'Community & third places (coworking, markets, civic culture)',
    weight: 0.85,
    tokens: [
      'coworking',
      'community',
      'comunitat',
      'market',
      'mercat',
      'cultural center',
      'centre civic',
      'centro cívico',
      'association',
      'associació',
      'volunteer',
      'voluntariat',
      'meetup',
      'tertulia',
      'circular economy',
      'economia circular',
      'cooperative',
      'cooperativa',
    ],
  },
  {
    id: 'food_slow',
    label: 'Slow food & drink (seasonal, natural wine, plant-forward)',
    weight: 0.9,
    tokens: [
      'natural wine',
      'vi natural',
      'fermentation',
      'fermentació',
      'seasonal',
      'de temporada',
      'farm',
      'masia',
      'vegetarian',
      'vegetarià',
      'plant-based',
      'coffee',
      'cafe',
      'cafè',
      'roastery',
      'tasting',
      'maridatge',
    ],
  },
  {
    id: 'maker_bio',
    label: 'Makers, biotech & materials (labs, science-adjacent craft)',
    weight: 0.95,
    tokens: [
      'fab lab',
      'makerspace',
      'biotech',
      'biomaterial',
      'bioart',
      'mycelium',
      'miceli',
      '3d print',
      'fabricació digital',
      'open science',
    ],
  },
];

const CAUTION: { id: string; label: string; tokens: string[] }[] = [
  {
    id: 'mass_party_tourism',
    label: 'Reads as mass party / booze tourism',
    tokens: ['pub crawl', 'bar crawl', 'stag party', 'hen party', 'botellón', 'bottle service'],
  },
  {
    id: 'pure_corporate_pitch',
    label: 'Generic B2B / sales funnel only',
    tokens: ['get rich', 'mlm', 'forex signals', 'crypto airdrop'],
  },
  {
    id: 'gambling_adult',
    label: 'Gambling or adult-only commercial',
    tokens: ['casino online', 'poker room', 'strip club', 'escort service'],
  },
];

const GEO_BONUS: { token: string; note: string }[] = [
  { token: 'barcelona', note: 'Mentions Barcelona' },
  { token: 'catalunya', note: 'Mentions Catalunya' },
  { token: 'catalonia', note: 'Mentions Catalonia' },
  { token: 'girona', note: 'Mentions Girona' },
  { token: 'lleida', note: 'Mentions Lleida' },
  { token: 'tarragona', note: 'Mentions Tarragona' },
  { token: 'montserrat', note: 'Mentions Montserrat' },
  { token: 'pirine', note: 'Mentions Pyrenees / Pirineus' },
  { token: 'spain', note: 'Mentions Spain' },
  { token: 'españa', note: 'Mentions España' },
  { token: 'espanya', note: 'Mentions Espanya' },
];

function axisStrength(text: string, tokens: string[]): number {
  const t = norm(text);
  let hits = 0;
  for (const tok of tokens) {
    if (t.includes(norm(tok))) hits++;
  }
  // Diminishing returns: first hits matter most
  if (hits === 0) return 0;
  return Math.min(1, 0.35 + hits * 0.18);
}

function cautionHits(text: string): string[] {
  const t = norm(text);
  const out: string[] = [];
  for (const c of CAUTION) {
    if (c.tokens.some((tok) => t.includes(norm(tok)))) out.push(c.id);
  }
  return out;
}

function geographyNotes(text: string): string {
  const t = norm(text);
  const notes = GEO_BONUS.filter((g) => t.includes(norm(g.token))).map((g) => g.note);
  if (notes.length === 0) {
    return 'No strong Catalunya/Spain keywords in page text — fill city/region manually; not required for inclusion.';
  }
  return notes.join('; ');
}

function pickDomain(axisScores: Record<string, number>): DomainCategory {
  const { culture_craft, nature_wellness, community_third_place, food_slow, maker_bio } =
    axisScores;
  const scores: [DomainCategory, number][] = [
    ['plants', nature_wellness * 0.9 + culture_craft * 0.4 + food_slow * 0.5],
    ['algae', nature_wellness * 1.05 + culture_craft * 0.15],
    ['fungi', community_third_place * 0.95 + food_slow * 0.55 + maker_bio * 1.1 + culture_craft * 0.35],
    ['animals', culture_craft * 0.85 + community_third_place * 0.35],
    ['earth', food_slow * 1 + culture_craft * 0.5],
  ];
  scores.sort((a, b) => b[1] - a[1]);
  return scores[0][0];
}

function pickCategories(axisScores: Record<string, number>, text: string): ListingCategory[] {
  const t = norm(text);
  const cats = new Set<ListingCategory>();

  if (axisScores.nature_wellness > 0.45 && /retreat|retir|wellness|yoga|meditaci/i.test(text)) {
    cats.add('retreat');
  }
  if (axisScores.community_third_place > 0.4 && /coworking|cowork/i.test(t)) {
    cats.add('coworking');
  }
  if (axisScores.culture_craft > 0.35) {
    if (/concert|jazz|club nocturn|night|dj\b/i.test(t)) cats.add('music-venue');
    else if (/galer|gallery|exposici|exhibition|museum|museu/i.test(t)) cats.add('art-gallery');
    else if (/festival|conference|congress/i.test(t)) cats.add('conference');
    else cats.add('workshop');
  }
  if (axisScores.food_slow > 0.45) {
    if (/coffee|cafè|cafe|roast/i.test(t)) cats.add('specialty-coffee');
    else if (/restaurant|menú|menu|dinner|dinar/i.test(t)) cats.add('restaurant');
  }
  if (axisScores.culture_craft > 0.25 && cats.size === 0) cats.add('workshop');
  if (cats.size === 0) cats.add('other');

  return [...cats];
}

function verdictFrom(score: number, cautions: string[]): AlignmentVerdict {
  if (cautions.length >= 2) return 'likely_skip';
  if (score >= 72 && cautions.length === 0) return 'recommend_seed';
  if (score >= 55 && cautions.length <= 1) return 'review';
  if (score < 48 || cautions.length >= 2) return 'likely_skip';
  return 'review';
}

/**
 * Score page text (markdown/plain) against Sotabosc editorial fit.
 */
export function scoreAlignment(pageText: string): AlignmentResult {
  const text = pageText.slice(0, 80_000);
  const axisScores: Record<string, number> = {};
  const checklist: ChecklistItem[] = [];

  for (const axis of AXES) {
    const strength = axisStrength(text, axis.tokens);
    axisScores[axis.id] = strength;
    checklist.push({
      id: axis.id,
      label: axis.label,
      strength,
      passed: strength >= 0.35,
      note:
        strength >= 0.35
          ? 'Enough related language on page'
          : 'Little or no signal — may still fit if page is thin',
    });
  }

  const cautionFlags = cautionHits(text);
  for (const c of CAUTION) {
    if (cautionFlags.includes(c.id)) {
      checklist.push({
        id: `caution_${c.id}`,
        label: c.label,
        strength: 1,
        passed: false,
        note: 'Negative signal — review manually',
      });
    }
  }

  // Sort axes by score to reward specialized venues (e.g. an amazing art gallery shouldn't fail just because it doesn't have a farm)
  const sortedAxes = AXES.map((a) => ({ weight: a.weight, score: axisScores[a.id] })).sort((a, b) => b.score - a.score);
  
  // Take the top 2 axes to determine the main score, allowing specialized places to pass
  const top2 = sortedAxes.slice(0, 2);
  const weighted = top2.reduce((sum, a) => sum + (a.score * a.weight), 0) / top2.reduce((s, a) => s + a.weight, 0);

  let score = Math.round(weighted * 100);
  // Soft geography: small nudge, never the main driver
  const geoHit = GEO_BONUS.some((g) => norm(text).includes(norm(g.token)));
  if (geoHit) score = Math.min(100, score + 4);
  if (cautionFlags.length) score = Math.max(0, score - cautionFlags.length * 18);

  const verdict = verdictFrom(score, cautionFlags);
  const suggestedPrimaryDomain = pickDomain(axisScores);
  const suggestedCategories = pickCategories(axisScores, text);

  return {
    score,
    verdict,
    checklist,
    suggestedPrimaryDomain,
    suggestedCategories,
    geographyNote: geographyNotes(text),
    cautionFlags,
  };
}

export function slugifyHint(title: string): string {
  return norm(title)
    .replace(/[''`´]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}
