import { MOCK_SPECIMENS } from '~/lib/world/specimens';

/**
 * Collectibles on the city map. Each id matches an existing specimen so a pick-up
 * lands in the same artifact dock / gallery as trail discoveries.
 *
 * A find with a `kingdom` is earned: it stays hidden until the visitor has walked
 * that kingdom (rules in `passport/rules.ts`). The plaza find has no kingdom and is
 * always out, as the one that teaches the idea. x/y are plan coordinates
 * (see `kingdoms.js`).
 */
export const CITY_FINDS = [
  {
    id: 'find-hearth',
    specimenId: 'root-archive',
    kingdom: 'earth',
    x: 118,
    y: 448,
    hint: 'Tucked beside a café plot in The Hearth.',
  },
  {
    id: 'find-grove',
    specimenId: 'electric-fern',
    kingdom: 'plants',
    x: 118,
    y: 178,
    hint: 'Under the Grove canopy, just off the studios.',
  },
  {
    id: 'find-undernet',
    specimenId: 'bioluminescent-mycena',
    kingdom: 'fungi',
    x: 880,
    y: 118,
    hint: 'Glowing in The Undernet, near the maker plots.',
  },
  {
    id: 'find-commons',
    specimenId: 'tide-lantern',
    kingdom: 'animals',
    x: 918,
    y: 368,
    hint: 'At the edge of The Commons, before the Arena causeway.',
  },
  {
    id: 'find-tide',
    specimenId: 'bedrock-sigil',
    kingdom: 'algae',
    x: 358,
    y: 572,
    hint: 'Washed up on The Tidewater shore.',
  },
  {
    id: 'find-plaza',
    specimenId: 'sky-spore',
    kingdom: null,
    x: 470,
    y: 238,
    hint: 'Drifting above Plaça del Sotabosc.',
  },
];

export function specimenForFind(find) {
  return MOCK_SPECIMENS[find?.specimenId] ?? null;
}
