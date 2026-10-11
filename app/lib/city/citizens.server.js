import { KINGDOMS, PLOTS_PER_KINGDOM, kingdomCentre } from './kingdoms';
import { normalizeDomain } from '~/lib/directory/domains';
import { eventPulse } from '~/lib/directory/eventWhen';

/**
 * Founding shortlist — the only businesses shown on the city map.
 * Everything else stays in the full directory at /city.
 */
const FOUNDING_SLUGS = {
  earth: ['nomad-coffee-poblenou', 'make-it-barcelona', 'ona-restaurant', 'terra-i-pell'],
  plants: ['tres-punts-gallery', 'faire-barcelona', 'nothrow-design', 'sangha-studio'],
  fungi: ['fab-lab-barcelona', 'hangar-poblenou', 'load-gallery', 'syra-coffee'],
  animals: ['heliogabal', 'sala-apolo', 'soda-acustic', 'jamboree-jazz'],
  algae: ['frizzant', 'moonlight-studio', 'les-topettes', 'shambhala-barcelona'],
};

function toCitizen(place, kingdomKey, plotIndex) {
  return {
    id: place.id,
    slug: place.slug,
    name: place.name,
    summary: place.summary,
    neighborhood: place.neighborhood,
    categories: place.categories,
    imageUrl: place.imageUrl ?? null,
    isClaimed: Boolean(place.isClaimed),
    kingdom: kingdomKey,
    plot: plotIndex,
  };
}

/**
 * @param {{ places: any[]; events: any[]; creators: any[] }} directory
 */
export function buildCity(directory) {
  const bySlug = new Map(directory.places.map((p) => [p.slug, p]));

  const citizens = KINGDOMS.flatMap((k) =>
    (FOUNDING_SLUGS[k.key] ?? [])
      .map((slug) => bySlug.get(slug))
      .filter(Boolean)
      .slice(0, PLOTS_PER_KINGDOM)
      .map((place, i) => toCitizen(place, k.key, i)),
  );

  const citizenByPlaceId = new Map(citizens.map((c) => [c.id, c]));

  const artists = directory.creators.map((c) => ({
    slug: c.slug,
    displayName: c.displayName,
    bio: c.bio,
    kingdom: normalizeDomain(c.primaryDomain) ?? 'fungi',
    productCollectionHandle: c.productCollectionHandle ?? null,
  }));

  const events = [...directory.events]
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    .slice(0, 48)
    .map((e) => {
      const host = citizenByPlaceId.get(e.placeId);
      const place = directory.places.find((p) => p.id === e.placeId);
      const kingdom = normalizeDomain(e.primaryDomain) ?? host?.kingdom ?? 'animals';
      const plot = host ? KINGDOMS.find((k) => k.key === host.kingdom)?.plots[host.plot] : null;
      const centre = kingdomCentre(kingdom);
      const pulse = eventPulse(e);
      return {
        slug: e.slug,
        title: e.title,
        startsAt: e.startsAt,
        endsAt: e.endsAt ?? null,
        placeName: e.placeName ?? host?.name ?? place?.name ?? null,
        placeSlug: host?.slug ?? null,
        url: e.sourceUrl ?? place?.website ?? null,
        kingdom,
        pulse,
        x: plot ? plot[0] : centre.x,
        y: plot ? plot[1] - 28 : centre.y,
        onPlot: Boolean(host),
      };
    });

  const liveSlugs = new Set(
    events.filter((e) => e.placeSlug && e.pulse !== 'later').map((e) => e.placeSlug),
  );
  const mappedCitizens = citizens.map((c) => ({ ...c, happening: liveSlugs.has(c.slug) }));

  return {
    citizens: mappedCitizens,
    artists,
    events,
    totalPlots: KINGDOMS.length * PLOTS_PER_KINGDOM,
    archiveCount: directory.places.length,
  };
}
