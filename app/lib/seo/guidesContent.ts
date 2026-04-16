export type CityGuide = {
  slug: string;
  title: string;
  dek: string;
  /** Short body in paragraphs (plain text, rendered with whitespace). */
  body: string[];
  /** Internal place slugs to feature as cards/links. */
  relatedPlaceSlugs: string[];
};

export const CITY_GUIDES: CityGuide[] = [
  {
    slug: 'barcelona-art-gallery-walking-route',
    title: 'A walkable art gallery route through the old city',
    dek: 'Link Gòtic, Raval, and El Born without doubling back — built from our directory picks.',
    body: [
      'Start in the Gòtic for palazzo-scale foundations and intimate contemporary rooms, then cut into the Raval for experimental programmes and weekend market energy. Finish in El Born for music or a shop-studio before the sea.',
      'Each stop below opens a full profile with address, neighbourhood, and website so you can time openings and avoid backtracking.',
    ],
    relatedPlaceSlugs: [
      'blueproject-foundation',
      'house-of-chappaz',
      'load-gallery',
      'escat-gallery',
      'angels-barcelona',
      'nogueras-blanchard',
      'les-enfants-brillants',
      'terra-i-pell',
    ],
  },
  {
    slug: 'poblenou-creative-district',
    title: 'Poblenou for makers, design, and deep-work days',
    dek: 'Coworking at scale, fabrication, residencies, and destination dining in 22@.',
    body: [
      'Poblenou is the clearest “single metro stop” cluster in our data for innovation culture: large coworking campuses, Fab Lab–style production, art residencies, and fine dining that treats the territory as an ingredient.',
      'Use these listings to stack a fabrication tour, a long work block, and an evening event without leaving the grid.',
    ],
    relatedPlaceSlugs: [
      'aticco-glories',
      'transfolab-bcn',
      'fab-lab-barcelona',
      'espronceda-institute',
      'disseny-hub',
      'hangar-poblenou',
      'ona-restaurant',
    ],
  },
  {
    slug: 'specialty-coffee-eixample',
    title: 'Specialty coffee across the Eixample grid',
    dek: 'Roaster-led bars, brunch, and cuppings you can string into one afternoon.',
    body: [
      'The Eixample holds some of Barcelona’s busiest specialty coffee counters — from rotating guest roasters to roastery cafés with terrace seating.',
      'Pair a morning espresso flight with a short walk to a nearby workshop or gallery category page if you want to turn caffeine into a full creative day.',
    ],
    relatedPlaceSlugs: [
      'roast-club-cafe',
      'la-papa-coffee',
      'nomad-petit-bergara',
      'morrow-coffee',
      'slowmov-coffee',
      'syra-coffee',
    ],
  },
];

export function getGuideBySlug(slug: string): CityGuide | undefined {
  return CITY_GUIDES.find((g) => g.slug === slug);
}

export function getGuideSitemapSlugs(): string[] {
  return CITY_GUIDES.map((g) => g.slug);
}
