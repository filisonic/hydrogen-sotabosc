/**
 * Editorial alignment for TinyFish / external culture stories.
 * Keeps the magazine desk on culture, luxury, Barcelona/Spain — not tech noise.
 */

export type EditionStoryRubrique =
  | 'art'
  | 'music'
  | 'film'
  | 'design'
  | 'fashion'
  | 'luxury'
  | 'architecture'
  | 'culture';

const GEO =
  /\b(barcelona|barcelon[ae]|catalunya|cataluñ[ao]|catalonia|catalan|spain|españa|spanish|madrid|valencia|bilbao|seville|sevilla|iberian)\b/i;

const CULTURE =
  /\b(art|arts|artist|exhibition|exhibitions|gallery|museum|museums|museos|macba|cccb|mnac|palau|concert|concerts|conciertos|festival|jazz|opera|music|musician|cinema|film|movie|documentary|fashion|designer|design|architecture|architect|luxury|hotel|hotels|boutique|culture|cultural|cultura|theatre|theater|teatros|dance|flamenco|guitar|vogue|timeout|ocula|goya|oscar)\b/i;

const REJECT =
  /\b(hacker news|crypto|bitcoin|saas|devops|kubernetes|cybertruck|floppy disk|llm judge|ai research accelerating|instagram\.com\/reel)\b/i;

const FAR_AWAY =
  /\b(buenos aires|argentina|canarias|alicante|el puerto de santa mar[ií]a)\b/i;

export function scoreEditionStoryAlignment(input: {
  title: string;
  summary?: string;
  sourceUrl?: string;
  publisher?: string;
}): { score: number; rubrique: EditionStoryRubrique | null; reasons: string[] } {
  const blob = `${input.title} ${input.summary ?? ''} ${input.publisher ?? ''} ${input.sourceUrl ?? ''}`;
  const reasons: string[] = [];

  if (REJECT.test(blob)) {
    return {score: 0, rubrique: null, reasons: ['rejected: off-brief noise']};
  }
  if (FAR_AWAY.test(blob) && !/\bbarcelona\b/i.test(blob)) {
    return {score: 0, rubrique: null, reasons: ['rejected: off-geography']};
  }

  let score = 0;
  if (GEO.test(blob)) {
    score += 40;
    reasons.push('geo');
  } else {
    return {score: 0, rubrique: null, reasons: ['rejected: no Spain/Barcelona geo']};
  }
  if (CULTURE.test(blob)) {
    score += 40;
    reasons.push('culture');
  } else {
    return {score: 0, rubrique: null, reasons: ['rejected: no culture lens']};
  }

  if (/\bbarcelona\b/i.test(blob)) {
    score += 15;
    reasons.push('barcelona');
  } else if (/\bmadrid\b/i.test(blob)) {
    // Desk is Barcelona-first; Madrid-only roundups stay out of the edition.
    return {score: 0, rubrique: null, reasons: ['rejected: madrid-only']};
  }
  if (/\b(luxury|vogue|hotel|boutique)\b/i.test(blob)) {
    score += 5;
    reasons.push('luxury');
  }

  const rubrique = inferRubrique(blob);
  return {score: Math.min(100, score), rubrique, reasons};
}

function inferRubrique(blob: string): EditionStoryRubrique {
  const hotelHeavy =
    /\b(hotel|hotels|boutique hotel)\b/i.test(blob) &&
    !/\b(exhibition|gallery|museum|concert|film|cinema|jazz)\b/i.test(blob);

  if (hotelHeavy) {
    if (/\b(fashion|vogue|designer)\b/i.test(blob)) return 'fashion';
    return 'luxury';
  }
  if (/\b(film|cinema|movie|documentary|cannes|in-edit|oscar|goya)\b/i.test(blob)) {
    return 'film';
  }
  if (/\b(exhibition|gallery|museum|painting|sculpture|ocula|artist showcase|balloon museum)\b/i.test(blob)) {
    return 'art';
  }
  if (
    /\b(concert|concerts|jazz|opera|music|musician|guitar|palau|motis|bachcelona|bgko)\b/i.test(
      blob,
    )
  ) {
    return 'music';
  }
  if (/\b(fashion|vogue|designer)\b/i.test(blob)) {
    return 'fashion';
  }
  if (/\b(architecture|gaud[ií]|architect)\b/i.test(blob)) {
    return 'architecture';
  }
  if (/\b(design|disseny)\b/i.test(blob)) {
    return 'design';
  }
  if (/\b(luxury|hotel|boutique)\b/i.test(blob)) {
    return 'luxury';
  }
  return 'culture';
}

export const EDITION_STORY_QUERIES = [
  {
    query: 'Barcelona art exhibition gallery opening this week',
    rubriqueHint: 'art' as const,
  },
  {
    query: 'Barcelona jazz concert festival Palau music agenda',
    rubriqueHint: 'music' as const,
  },
  {
    query: 'Barcelona film festival cinema In-Edit Goya culture',
    rubriqueHint: 'film' as const,
  },
  {
    query: 'Barcelona design fashion boutique culture editorial',
    rubriqueHint: 'fashion' as const,
  },
  {
    query: 'Barcelona MACBA CCCB MNAC museum exhibition architecture',
    rubriqueHint: 'architecture' as const,
  },
  {
    query: 'The New Barcelona Post art music cinema design exhibition',
    rubriqueHint: 'culture' as const,
  },
] as const;
