/**
 * Narrative journey: domain-flavoured copy + chapter structure for the home flow.
 * Barcelona stays the ground truth; Sotabosc is the story wrapper.
 */

/** @typedef {'plants'|'algae'|'fungi'|'animals'|'earth'|'neutral'} JourneyDomainKey */

/** @type {Record<string, Record<string, string>>} */
const COPY = {
  plants: {
    ch1Title: 'Canopy light — first steps',
    ch1Kicker: 'trail · breathe',
    ch1Desc: 'Sun through leaves. Your day starts where the city still feels like a garden.',
    ch1Story:
      'Imagine a slow walk: you follow dappled shade, then pause for coffee somewhere that treats beans like soil — careful, seasonal. These nodes are stops on a living route, not a list.',
    ch2Title: 'Sound carried on humidity',
    ch2Kicker: 'trail · listen',
    ch2Desc: 'Music and gathering rooms — the forest edge where culture gets loud.',
    ch2Story:
      'Undergrowth holds rhythm: small venues, live wires, nights that feel like weather. Pick a show the way you’d pick a clearing — somewhere you can stand still and still feel movement.',
    ch3Title: 'Roots at the table',
    ch3Kicker: 'trail · nourish',
    ch3Desc: 'Evening: soil becomes plate — plant-forward, honest sourcing, slower meals.',
    ch3Story:
      'Dinner as continuation of the walk: kitchens that think in seasons and ethics. Plant-based or not, these tables argue that eating out can still feel like tending something.',
    ch4Title: 'Mycelium of makers',
    ch4Kicker: 'trail · connect',
    ch4Desc: 'Creators branching under the visible city — shops and humans you can follow.',
    ch4Story:
      'Every directory is also a network. These people are nodes you can actually visit — the social layer Sotabosc is trying to make legible.',
    ch5Title: 'Bedrock — choose your next fork',
    ch5Kicker: 'trail · map',
    ch5Desc: 'Solid paths into the full city hub. Complete the trail for bragging rights (coming soon).',
    ch5Story:
      'You’ve walked a slice of Sotabosc. The full Barcelona underneath is one tap away — categories, events, places, or a different daily shuffle tomorrow.',
  },
  neutral: {
    ch1Title: 'Open air — coffee & calm',
    ch1Kicker: 'waypoint 1',
    ch1Desc: 'Start with spaces made for slowing down: cafés, yoga, light.',
    ch1Story:
      'Sotabosc wraps Barcelona in a nature metaphor so browsing feels like a walk. Below are a few stops — specialty coffee and movement — chosen to feel like the first leg of a day out.',
    ch2Title: 'Currents & calendars',
    ch2Kicker: 'waypoint 2',
    ch2Desc: 'What’s happening soon — gigs, workshops, markets.',
    ch2Story:
      'Events are the moving water of the city. Scroll into what’s on; each card links to a full page with time and place.',
    ch3Title: 'Tables at dusk',
    ch3Kicker: 'waypoint 3',
    ch3Desc: 'Where to land for dinner — including veg-forward rooms.',
    ch3Story:
      'Food places anchor the evening chapter: farm tables, vegetarian rooms, or a meal that still feels connected to land.',
    ch4Title: 'People worth knowing',
    ch4Kicker: 'waypoint 4',
    ch4Desc: 'Creators aligned with the directory’s domains.',
    ch4Story:
      'Independent makers and sellers — the human nodes behind the listings.',
    ch5Title: 'Full map',
    ch5Kicker: 'waypoint 5',
    ch5Desc: 'Jump to categories or the city hub.',
    ch5Story:
      'This was one path. Tomorrow’s might shuffle — we’re building toward daily trails, light gamification, and badges for explorers.',
  },
};

/**
 * @param {JourneyDomainKey | null | undefined} domain
 */
export function getJourneyCopy(domain) {
  if (domain === 'plants') return COPY.plants;
  return COPY.neutral;
}

/**
 * Domain-aware category filters so each soil/canopy layer has listings when a visitor picks a domain.
 * Falls back to neutral filters when domain is unset.
 * @type {Record<string, { canopy: string[]; soil: string[] }>}
 */
const DOMAIN_LAYER_FILTERS = {
  plants: {
    canopy: ['specialty-coffee', 'workshop', 'art-gallery'],
    soil: ['restaurant', 'shop', 'art-gallery'],
  },
  algae: {
    canopy: ['workshop', 'retreat', 'specialty-coffee'],
    soil: ['restaurant', 'retreat', 'workshop'],
  },
  fungi: {
    canopy: ['coworking', 'specialty-coffee', 'workshop', 'conference', 'art-gallery'],
    soil: ['restaurant', 'coworking', 'shop', 'workshop', 'conference'],
  },
  animals: {
    canopy: ['music-venue', 'specialty-coffee', 'workshop'],
    soil: ['restaurant', 'music-venue'],
  },
  earth: {
    canopy: ['specialty-coffee', 'restaurant', 'workshop'],
    soil: ['restaurant', 'specialty-coffee', 'shop'],
  },
};

const NEUTRAL_LAYER_FILTERS = {
  canopy: ['specialty-coffee', 'workshop'],
  soil: ['restaurant'],
};

function layerFiltersForDomain(domain) {
  if (domain && DOMAIN_LAYER_FILTERS[domain]) return DOMAIN_LAYER_FILTERS[domain];
  return NEUTRAL_LAYER_FILTERS;
}

/**
 * @param {JourneyDomainKey | null | undefined} domain
 */
export function getJourneyChapters(domain) {
  const c = getJourneyCopy(domain);
  const layers = layerFiltersForDomain(domain);

  return [
    {
      stepId: 'open-air',
      layer: 'canopy',
      title: c.ch1Title,
      kicker: c.ch1Kicker,
      description: c.ch1Desc,
      narrative: c.ch1Story,
      kind: 'places',
      categoryFilter: layers.canopy,
      limit: 6,
    },
    {
      stepId: 'sound',
      layer: 'water',
      title: c.ch2Title,
      kicker: c.ch2Kicker,
      description: c.ch2Desc,
      narrative: c.ch2Story,
      kind: 'events',
      limit: 6,
    },
    {
      stepId: 'table',
      layer: 'soil',
      title: c.ch3Title,
      kicker: c.ch3Kicker,
      description: c.ch3Desc,
      narrative: c.ch3Story,
      kind: 'places',
      categoryFilter: layers.soil,
      limit: 5,
    },
    {
      stepId: 'makers',
      layer: 'understory',
      title: c.ch4Title,
      kicker: c.ch4Kicker,
      description: c.ch4Desc,
      narrative: c.ch4Story,
      kind: 'creators',
      limit: 9,
    },
    {
      stepId: 'map',
      layer: 'bedrock',
      title: c.ch5Title,
      kicker: c.ch5Kicker,
      description: c.ch5Desc,
      narrative: c.ch5Story,
      kind: 'hub',
    },
  ];
}
