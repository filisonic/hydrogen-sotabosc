import type { CityEvent, ListingCategory, Place } from '../directory/types';

export type BreadcrumbJsonLdItem = {
  name: string;
  url: string;
};

export function buildBreadcrumbListJsonLd(items: BreadcrumbJsonLdItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export type FaqJsonLdPair = { question: string; answer: string };

export function buildFaqPageJsonLd(input: { pageUrl: string; faq: FaqJsonLdPair[] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: input.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
    url: input.pageUrl,
  };
}

type ItemListEntry = {
  position: number;
  name: string;
  url: string;
  description?: string;
};

export function buildItemListJsonLd(input: {
  name: string;
  description: string;
  pageUrl: string;
  items: ItemListEntry[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: input.name,
    description: input.description,
    numberOfItems: input.items.length,
    itemListElement: input.items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      item: {
        '@type': 'Thing',
        name: item.name,
        url: item.url,
        ...(item.description ? { description: item.description } : {}),
      },
    })),
    url: input.pageUrl,
  };
}

/** Prefer the most specific Schema.org type for the venue. */
const CATEGORY_SCHEMA_TYPE: Partial<Record<ListingCategory, string>> = {
  'art-gallery': 'ArtGallery',
  'music-venue': 'MusicVenue',
  restaurant: 'Restaurant',
  'specialty-coffee': 'CafeOrCoffeeShop',
  coworking: 'CoworkingSpace',
  shop: 'Store',
  conference: 'LocalBusiness',
  retreat: 'LocalBusiness',
  workshop: 'LocalBusiness',
  other: 'LocalBusiness',
};

const SCHEMA_TYPE_PRIORITY: ListingCategory[] = [
  'art-gallery',
  'restaurant',
  'specialty-coffee',
  'music-venue',
  'coworking',
  'conference',
  'shop',
  'retreat',
  'workshop',
  'other',
];

export function getPlaceSchemaOrgType(categories: ListingCategory[]): string {
  for (const cat of SCHEMA_TYPE_PRIORITY) {
    if (categories.includes(cat)) {
      return CATEGORY_SCHEMA_TYPE[cat] ?? 'LocalBusiness';
    }
  }
  return 'LocalBusiness';
}

/** First matching category for breadcrumbs and primary intent (same priority as schema subtype). */
export function getPrimaryListingCategory(categories: ListingCategory[]): ListingCategory | undefined {
  for (const cat of SCHEMA_TYPE_PRIORITY) {
    if (categories.includes(cat)) return cat;
  }
  return categories[0];
}

function postalAddressForPlace(place: Place) {
  return {
    '@type': 'PostalAddress' as const,
    streetAddress: place.address,
    addressLocality: place.city,
    addressRegion: 'Catalonia',
    addressCountry: 'ES',
  };
}

/**
 * Seed datetimes are Europe/Madrid wall time without an offset. Attach +02:00 so ISO is unambiguous
 * (most listings are spring/summer; adjust if you add winter-only events).
 */
function eventDateTimeForSchema(iso: string): string {
  const trimmed = iso.trim();
  if (/[zZ]$|[+-]\d{2}:\d{2}$/.test(trimmed)) return trimmed;
  let core = trimmed;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(core)) core = `${core}:00`;
  return `${core}+02:00`;
}

export function buildEventJsonLd(event: CityEvent, eventPageUrl: string, place: Place | null) {
  const location =
    place != null
      ? {
          '@type': 'Place' as const,
          name: place.name,
          address: postalAddressForPlace(place),
        }
      : event.placeName
        ? ({ '@type': 'Place' as const, name: event.placeName } as const)
        : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.summary,
    startDate: eventDateTimeForSchema(event.startsAt),
    ...(event.endsAt ? { endDate: eventDateTimeForSchema(event.endsAt) } : {}),
    url: eventPageUrl,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    ...(location ? { location } : {}),
    ...(event.imageUrl ? { image: event.imageUrl } : {}),
  };
}

const DAY_OF_WEEK_SCHEMA: Record<string, string> = {
  Monday: 'https://schema.org/Monday',
  Tuesday: 'https://schema.org/Tuesday',
  Wednesday: 'https://schema.org/Wednesday',
  Thursday: 'https://schema.org/Thursday',
  Friday: 'https://schema.org/Friday',
  Saturday: 'https://schema.org/Saturday',
  Sunday: 'https://schema.org/Sunday',
};

function dayOfWeekSchemaValues(dayOfWeek: string | string[]) {
  const days = Array.isArray(dayOfWeek) ? dayOfWeek : [dayOfWeek];
  return days.map((d) => DAY_OF_WEEK_SCHEMA[d] ?? d);
}

function openingHoursForSchema(place: Place) {
  if (!place.openingHours?.length) return undefined;
  return place.openingHours.map((spec) => ({
    '@type': 'OpeningHoursSpecification' as const,
    dayOfWeek: dayOfWeekSchemaValues(spec.dayOfWeek),
    opens: spec.opens,
    closes: spec.closes,
  }));
}

export function buildPlaceLocalBusinessJsonLd(place: Place, pageUrl: string) {
  const sameAs = place.website ? [place.website] : undefined;
  const schemaType = getPlaceSchemaOrgType(place.categories);
  const geo =
    place.latitude != null && place.longitude != null
      ? {
          '@type': 'GeoCoordinates' as const,
          latitude: place.latitude,
          longitude: place.longitude,
        }
      : undefined;
  const hours = openingHoursForSchema(place);

  return {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: place.name,
    description: place.summary,
    url: pageUrl,
    address: postalAddressForPlace(place),
    ...(place.neighborhood
      ? {
          areaServed: {
            '@type': 'Place',
            name: `${place.neighborhood}, ${place.city}`,
          },
        }
      : {}),
    ...(sameAs ? { sameAs } : {}),
    ...(place.imageUrl ? { image: place.imageUrl } : {}),
    ...(place.telephone ? { telephone: place.telephone } : {}),
    ...(geo ? { geo } : {}),
    ...(hours?.length ? { openingHoursSpecification: hours } : {}),
  };
}
