/**
 * Build text for scoreAlignment() from a Place row (curated, OSM, or Firecrawl-ingested).
 */
import type { Place } from '../../app/lib/directory/types';
import type { AlignmentResult } from './sotabosc-alignment';

export function placeTextForAlignment(place: Place, extraContext?: string): string {
  const parts = [
    place.name,
    place.summary,
    place.city,
    place.neighborhood,
    place.address,
    ...(place.categories ?? []),
    ...(place.tags ?? []),
    place.website ?? '',
    extraContext ?? '',
  ];
  return parts.filter(Boolean).join('\n');
}

export type IngestGateOptions = {
  minScore: number;
  allowReview: boolean;
};

/**
 * Same rules as `ingest-auto-listings.ts` — single source of truth for “good enough” rows.
 * When `allowReview` is true, `review` verdicts pass at `minReviewScore` (defaults to `minScore`).
 */
export function passesIngestGate(
  alignment: AlignmentResult,
  opts: IngestGateOptions & { minReviewScore?: number },
): boolean {
  const { minScore, allowReview } = opts;
  const minReviewScore = opts.minReviewScore ?? minScore;
  if (alignment.cautionFlags.length > 0) return false;
  if (alignment.verdict === 'likely_skip') return false;
  if (alignment.verdict === 'recommend_seed' && alignment.score >= minScore) return true;
  if (allowReview && alignment.verdict === 'review' && alignment.score >= minReviewScore) return true;
  return false;
}
