import { DOMAINS, DOMAIN_ROLES } from '~/lib/directory/domains';

/**
 * Sotabosc city plan — five kingdoms (the five public domains) arranged around
 * Plaça del Sotabosc. Coordinates live in a 1000×640 plan space; `planToWorld` puts them on the 3D ground.
 *
 * `feeds` closes the symbiosis loop: each kingdom's screens cross-promote the next.
 */
const PLAN = [
  {
    key: 'earth',
    name: 'The Hearth',
    epithet: 'Daily ritual',
    promise: 'Coffee, food and craft — the places the city starts its day in.',
    feeds: 'plants',
    path: 'M60 300 L360 300 L424 318 L420 346 L330 600 L60 560 Z',
    label: { x: 92, y: 336 },
    plots: [
      [150, 410], [262, 398], [352, 418], [140, 500], [255, 490], [205, 562],
    ],
  },
  {
    key: 'plants',
    name: 'The Grove',
    epithet: 'Where people return',
    promise: 'Studios, galleries and gardens that root a community week after week.',
    feeds: 'fungi',
    path: 'M60 70 L430 40 L462 256 L424 280 L360 300 L60 300 Z',
    label: { x: 92, y: 92 },
    plots: [
      [170, 165], [282, 150], [382, 165], [180, 258], [298, 248], [400, 262],
    ],
  },
  {
    key: 'fungi',
    name: 'The Undernet',
    epithet: 'Hidden networks',
    promise: 'Labs, makers and rooms that quietly wire everyone else together.',
    feeds: 'animals',
    path: 'M430 40 L900 60 L930 250 L560 280 L516 280 L462 256 Z',
    label: { x: 475, y: 80 },
    plots: [
      [560, 165], [670, 140], [790, 150], [600, 240], [715, 228], [835, 212],
    ],
  },
  {
    key: 'animals',
    name: 'The Commons',
    epithet: 'Motion & energy',
    promise: 'Stages and venues where the city gathers, dances and makes noise.',
    feeds: 'algae',
    path: 'M516 300 L560 280 L930 250 L960 370 L700 480 L520 350 Z',
    label: { x: 560, y: 304 },
    plots: [
      [700, 338], [810, 322], [905, 330], [620, 395], [740, 410], [850, 385],
    ],
  },
  {
    key: 'algae',
    name: 'The Tidewater',
    epithet: 'Flow & recovery',
    promise: 'Wellness, retreat and slow rituals by the water.',
    feeds: 'earth',
    path: 'M420 346 L520 350 L700 480 L560 600 L330 600 Z',
    label: { x: 440, y: 374 },
    plots: [
      [500, 448], [590, 462], [640, 505], [440, 530], [540, 540], [470, 584],
    ],
  },
];

export const PLAZA = { x: 470, y: 300, r: 46, name: 'Plaça del Sotabosc' };

/** Online-events stadium, on the water off The Commons. */
export const ARENA = { x: 860, y: 530, r: 58, name: 'Sotabosc Arena', kingdom: 'animals' };

export const SEA_PATH = 'M520 640 L560 600 L700 480 L960 370 L1000 360 L1000 640 Z';

export const KINGDOMS = PLAN.map((k) => ({
  ...k,
  role: DOMAIN_ROLES[k.key],
  color: DOMAINS[k.key].color,
  emoji: DOMAINS[k.key].emoji,
  domainLabel: DOMAINS[k.key].label,
}));

export const KINGDOMS_BY_KEY = Object.fromEntries(KINGDOMS.map((k) => [k.key, k]));

export const PLOTS_PER_KINGDOM = PLAN[0].plots.length;

/** Plan space (1000×640) → 3D world units on the ground plane, as [x, z]. */
export const PLAN_SCALE = 1 / 20;
export const planToWorld = (x, y) => [(x - 500) * PLAN_SCALE, (y - 320) * PLAN_SCALE];

/** Rough visual centre of a kingdom — used for symbiosis arcs. */
export function kingdomCentre(key) {
  const plots = KINGDOMS_BY_KEY[key]?.plots ?? [];
  if (!plots.length) return { x: PLAZA.x, y: PLAZA.y };
  const sum = plots.reduce((acc, [x, y]) => ({ x: acc.x + x, y: acc.y + y }), { x: 0, y: 0 });
  return { x: sum.x / plots.length, y: sum.y / plots.length };
}
