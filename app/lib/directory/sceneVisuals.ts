import type { CityEvent, Creator, DomainCategory, ListingCategory, Place } from './types';

/** Stable hash 0..n-1 from slug */
function bucket(slug: string, n: number) {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % n;
}

function unsplash(src: string) {
  return `https://images.unsplash.com/${src}?auto=format&fit=crop&w=960&h=600&q=80`;
}

/** Curated Unsplash photo paths (category → variety) */
const PLACE_IMAGES: Partial<Record<ListingCategory, string[]>> = {
  'specialty-coffee': [
    'photo-1495474472287-4d71bcdd2085',
    'photo-1501339847302-ac426a4a7cbb',
    'photo-1442512595331-e89e73853f31',
  ],
  restaurant: [
    'photo-1414235072238-9813361365b1',
    'photo-1517248135467-4c7edcad34c4',
    'photo-1555396273-367ea4eb4db5',
  ],
  'art-gallery': [
    'photo-1541961017774-22349e4a1262',
    'photo-1536924940846-227afb31e2a5',
    'photo-1579783902614-a3fb3927b6a5',
  ],
  'music-venue': [
    'photo-1470229722913-7c0e2dbbafd3',
    'photo-1514525253161-7a46d19cd819',
    'photo-1501612780327-45045538702b',
  ],
  workshop: [
    'photo-1544367567-0f2fcb009e0b',
    'photo-1599901860904-17e6ed7083a0',
    'photo-1518611012118-696072aa579a',
  ],
  retreat: [
    'photo-1506126613408-eca07ce68773',
    'photo-1545205597-3d9d02c29597',
    'photo-1511895426328-dc8714191300',
  ],
  coworking: [
    'photo-1522071820081-009f0129c71c',
    'photo-1497366216548-37526070297c',
    'photo-1604328698692-f76ea9498e76',
  ],
  conference: [
    'photo-1540575467063-7a0d95a2b737',
    'photo-1505373877841-8d25f7d46678',
    'photo-1475721027785-f74eccf44e1f',
  ],
  shop: [
    'photo-1441986300917-e6471dadcc5e',
    'photo-1555529669-e69e7aa0ba9a',
    'photo-1556909114-f6e7ad7d3136',
  ],
  other: ['photo-1469474968028-56623f02e42e'],
};

const DEFAULT_PLACE = [
  'photo-1448375240586-882707db888b',
  'photo-1470071459604-3b896ec9b661',
  'photo-1511497584788-876760111969',
];

const DOMAIN_EVENT: Record<DomainCategory, string[]> = {
  plants: ['photo-1464822759023-fed622ff2c3b', 'photo-1441974231531-c6227db76b6e'],
  algae: ['photo-1505118380757-91f5f5632de0', 'photo-1439066615861-d1af74d74000'],
  fungi: ['photo-1518709268805-4e9042af9f23', 'photo-1518837695005-2083093ee35b'],
  microbes: ['photo-1532187863486-abf9dbad1b69', 'photo-1576086213369-97a3063a8e18'],
  animals: ['photo-1474511320723-9a56873867b5', 'photo-1504006833117-8886f35596fa'],
  earth: ['photo-1506905925346-21bda4d32df4', 'photo-1469474968028-56623f02e42e'],
};

const DOMAIN_CREATOR: Record<DomainCategory, string[]> = {
  plants: ['photo-1462275646964-a0e3386b89fa', 'photo-1416879595882-3373a0480ca7'],
  algae: ['photo-1505118380757-91f5f5632de0', 'photo-1439066615861-d1af74d74000'],
  fungi: ['photo-1518709268805-4e9042af9f23', 'photo-1441974231531-c6227db76b6e'],
  microbes: ['photo-1532187863486-abf9dbad1b69', 'photo-1576086213369-97a3063a8e18'],
  animals: ['photo-1474511320723-9a56873867b5', 'photo-1437622368342-7a3d73a34c8f'],
  earth: ['photo-1565193566171-5f9ca494b6f5', 'photo-1578662996442-48f60103fc96'],
};

export function resolvePlaceImageUrl(place: Place): string | undefined {
  if (place.imageUrl) return place.imageUrl;
  const cat = place.categories[0];
  const pool = (cat && PLACE_IMAGES[cat]) ?? DEFAULT_PLACE;
  const path = pool[bucket(place.slug, pool.length)] ?? pool[0];
  return unsplash(path);
}

export function resolveEventImageUrl(event: CityEvent, place?: Place | null): string | undefined {
  if (event.imageUrl) return event.imageUrl;
  if (place) return resolvePlaceImageUrl(place);
  const pool = DOMAIN_EVENT[event.primaryDomain] ?? DOMAIN_EVENT.earth;
  const path = pool[bucket(event.slug, pool.length)] ?? pool[0];
  return unsplash(path);
}

export function resolveCreatorImageUrl(creator: Creator): string | undefined {
  if (creator.imageUrl) return creator.imageUrl;
  const pool = DOMAIN_CREATOR[creator.primaryDomain] ?? DOMAIN_CREATOR.plants;
  const path = pool[bucket(creator.slug, pool.length)] ?? pool[0];
  return unsplash(path);
}
