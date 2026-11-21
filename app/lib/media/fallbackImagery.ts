/**
 * Stable Unsplash stock photos when a listing or article has no usable image.
 * CSP already allows images.unsplash.com.
 */

/** Stable hash 0..n-1 from a key */
export function mediaBucket(key: string, n: number) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % n;
}

function unsplash(photoId: string, w = 1600, h = 900) {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;
}

/** Culture / gallery / city atmosphere for journal articles */
const JOURNAL_STOCK_SAFE = [
  'photo-1541961017774-22349e4a1262',
  'photo-1536924940846-227afb31e2a5',
  'photo-1579783902614-a3fb3927b6a5',
  'photo-1460661419201-fd4cecdf8a8b',
  'photo-1518998053901-5348d3961a04',
  'photo-1470229722913-7c0e2dbbafd3',
  'photo-1489599849927-2ee91cede3cf',
  'photo-1448375240586-882707db888b',
  'photo-1441974231531-c6227db76b6e',
  'photo-1506905925346-21bda4d32df4',
  'photo-1495474472287-4d71bcdd2085',
  'photo-1514525253161-7a46d19cd819',
];

const RUBRIQUE_STOCK: Record<string, string[]> = {
  art: [
    'photo-1541961017774-22349e4a1262',
    'photo-1536924940846-227afb31e2a5',
    'photo-1579783902614-a3fb3927b6a5',
  ],
  music: [
    'photo-1470229722913-7c0e2dbbafd3',
    'photo-1514525253161-7a46d19cd819',
    'photo-1501612780327-45045538702b',
  ],
  film: ['photo-1489599849927-2ee91cede3cf', 'photo-1478727270310-222cb3cba517'],
  design: ['photo-1518998053901-5348d3961a04', 'photo-1497366216548-37526070297c'],
  fashion: ['photo-1558769132-cb1aea458c5e', 'photo-1469334031218-e382a71b716b'],
  culture: JOURNAL_STOCK_SAFE,
};

/**
 * Stock hero for a journal / blog article when Shopify has no featured image.
 */
export function journalStockImageUrl(key: string, width = 1600): string {
  const pool = JOURNAL_STOCK_SAFE;
  const id = pool[mediaBucket(key || 'journal', pool.length)] ?? pool[0];
  return unsplash(id, width, Math.round(width * 0.5625));
}

/**
 * Stock image for edition “In the News” rubriques when the publisher image is missing.
 */
export function rubriqueStockImageUrl(rubrique: string | null | undefined, key: string): string {
  const pool = RUBRIQUE_STOCK[(rubrique || 'culture').toLowerCase()] ?? JOURNAL_STOCK_SAFE;
  const id = pool[mediaBucket(key || rubrique || 'culture', pool.length)] ?? pool[0];
  return unsplash(id, 800, 800);
}

/**
 * Prefer a real URL; otherwise a stable stock photo for that article key.
 */
export function resolveJournalImageUrl(input: {
  imageUrl?: string | null;
  handle?: string | null;
  title?: string | null;
  width?: number;
}): string {
  if (input.imageUrl) return input.imageUrl;
  return journalStockImageUrl(input.handle || input.title || 'journal', input.width ?? 1600);
}
