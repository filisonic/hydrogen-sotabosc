/**
 * Category → domain mapping (single source for imports + normalize script).
 */
import type { DomainCategory, ListingCategory, Place } from '../../app/lib/directory/types';
import { LISTING_CATEGORIES, normalizeDomain, normalizeDomainList } from '../../app/lib/directory/domains';

/** First matching category wins for primaryDomain. */
export const CATEGORY_PRIORITY: ListingCategory[] = [
  'coworking',
  'retreat',
  'conference',
  'art-gallery',
  'music-venue',
  'specialty-coffee',
  'restaurant',
  'workshop',
  'shop',
  'other',
];

export function inferCategoriesFromPlace(place: Place): ListingCategory[] {
  const text = [
    place.name,
    place.summary,
    place.address,
    ...(place.categories ?? []),
    ...(place.tags ?? []),
  ]
    .join(' ')
    .toLowerCase();

  const cats = new Set<ListingCategory>();

  for (const c of place.categories ?? []) {
    if (c in LISTING_CATEGORIES) cats.add(c);
  }

  if (/coworking|cowork|hot desk|oficina compartida|business center/i.test(text)) {
    cats.add('coworking');
  }
  if (/art gallery|art_gallery|galeria|galería|museum|museu|exhibition|exposici/i.test(text)) {
    cats.add('art-gallery');
  }
  if (
    /jazz club|live music|music venue|night_club|concert hall|sala apolo|sala razz|discoteca|karaoke/i.test(
      text,
    )
  ) {
    cats.add('music-venue');
  }
  if (/coffee|cafè|cafe|café|roastery|roaster|espresso|specialty coffee/i.test(text)) {
    cats.add('specialty-coffee');
  }
  if (
    /restaurant|vegetarian|vegan|bistro|brunch|tapas|pizzeria|dining|food hall|gastrobar|menú|menu\b/i.test(
      text,
    )
  ) {
    cats.add('restaurant');
  }
  if (/retreat|vipassana|meditation center|zen |zazen|thermal bath|spa\b/i.test(text)) {
    cats.add('retreat');
  }
  if (/conference|convention|auditori|festival|design hub|cccb/i.test(text)) {
    cats.add('conference');
  }
  if (
    /yoga|dance studio|language school|workshop|taller|ceramic|pottery|makerspace|fab lab|escola|school/i.test(
      text,
    )
  ) {
    cats.add('workshop');
  }
  if (/market|bookstore|libreria|librería|record shop|vinyl|shop|botanica|esoteric|perfumery/i.test(text)) {
    cats.add('shop');
  }

  if (!cats.size) cats.add('other');
  return [...cats].slice(0, 3);
}

export function primaryDomainForCategories(categories: ListingCategory[]): DomainCategory {
  for (const cat of CATEGORY_PRIORITY) {
    if (categories.includes(cat)) {
      return LISTING_CATEGORIES[cat].defaultDomain;
    }
  }
  return LISTING_CATEGORIES.other.defaultDomain;
}

export function secondaryDomainsForCategories(
  categories: ListingCategory[],
  primary: DomainCategory,
): DomainCategory[] | undefined {
  const secs: DomainCategory[] = [];
  for (const cat of categories) {
    const d = LISTING_CATEGORIES[cat].defaultDomain;
    if (d !== primary && !secs.includes(d)) secs.push(d);
  }
  return secs.length ? secs.slice(0, 2) : undefined;
}

/** Legacy microbes → fungi; refresh categories without overwriting curated primaryDomain. */
export function migrateLegacyDomains(place: Place): Place {
  const categories = inferCategoriesFromPlace(place);
  const primaryDomain =
    normalizeDomain(place.primaryDomain) ??
    normalizeDomain(primaryDomainForCategories(categories)) ??
    'earth';
  const secondaryDomains = normalizeDomainList(place.secondaryDomains);
  return {
    ...place,
    categories,
    primaryDomain,
    ...(secondaryDomains ? { secondaryDomains } : {}),
  };
}

export function normalizePlaceDomains(place: Place): Place {
  const categories = inferCategoriesFromPlace(place);
  const primaryDomain = normalizeDomain(primaryDomainForCategories(categories)) ?? 'earth';
  const secondaryDomains = normalizeDomainList(
    secondaryDomainsForCategories(categories, primaryDomain),
  );
  return {
    ...place,
    categories,
    primaryDomain,
    ...(secondaryDomains ? { secondaryDomains } : {}),
  };
}
