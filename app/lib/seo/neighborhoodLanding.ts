import { DIRECTORY_CITY } from './directoryQueries';

export type NeighborhoodLandingSeo = {
  titleTag: string;
  metaDescription: string;
  intro: string;
};

const city = DIRECTORY_CITY.name;

/** Short editorial blurbs keyed by neighbourhood URL slug (ASCII). */
const BY_SLUG: Record<string, Omit<NeighborhoodLandingSeo, 'titleTag' | 'metaDescription'> & { titleSuffix?: string }> = {
  eixample: {
    intro: `The Eixample grid is where many visitors first feel ${city}: wide avenues, modernist facades, and a high density of specialty coffee, coworking, yoga studios, and design-minded restaurants. These listings skew toward everyday creative infrastructure — places you can work, eat, and recharge between gallery nights elsewhere.`,
  },
  poblenou: {
    intro: `Poblenou mixes 22@ innovation blocks with older industrial bones. Expect fabrication labs, experimental art centres, major coworking campuses, and some of the city’s most ambitious food studios — a useful cluster if you’re building or exploring in tech and culture.`,
  },
  gracia: {
    intro: `Gràcia keeps a village rhythm above the diagonal: independent music rooms, small galleries, and shops that favour local makers. The picks here are strong for an evening on foot — start with a gallery or concert and let the barrios’ plazas carry the rest of the night.`,
  },
  gotic: {
    intro: `The Gòtic compresses centuries of stone corridors with contemporary galleries and foundations. These venues sit minutes apart — ideal for a tight morning of exhibitions before you spill into the Born or the waterfront.`,
  },
  raval: {
    intro: `The Raval’s density rewards wandering: artist-run spaces, weekend markets, and cafés that double as community hubs. Use this list as anchors while you cross the neighbourhood’s main arteries and side streets.`,
  },
  'el-born': {
    intro: `El Born balances medieval lanes with polished cultural spaces — music venues, hybrid shop-studios, and galleries with international programmes. It pairs well with a half-day that starts at the park and ends near the sea.`,
  },
};

export function getNeighborhoodLandingSeo(slug: string, label: string, placeCount: number): NeighborhoodLandingSeo {
  const specific = BY_SLUG[slug];
  const titleTag = `${label} — creative & culture directory | Sotabosc City`;
  const metaDescription = `Curated ${placeCount} listings in ${label}, ${city}: galleries, coworking, music, coffee, workshops, and food — with addresses and links for planning a route.`;
  const intro =
    specific?.intro ??
    `Explore ${placeCount} curated listings in ${label}, ${city} — galleries, coworking, venues, cafés, and workshops — with addresses and neighbourhoods to plan visits on foot or by metro.`;

  return { titleTag, metaDescription, intro };
}
