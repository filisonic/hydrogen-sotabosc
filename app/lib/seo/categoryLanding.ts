import { LISTING_CATEGORIES } from '../directory/domains';
import type { ListingCategory } from '../directory/types';
import { DIRECTORY_CITY } from './directoryQueries';

export type CategoryFaqItem = { question: string; answer: string };

export type CategoryLandingSeo = {
  /** Visible main heading — intent-aligned, not keyword-stuffed */
  h1: string;
  titleTag: string;
  metaDescription: string;
  intro: string;
  criteria: string[];
  faq: CategoryFaqItem[];
  /** Curated slugs for “Editor’s picks”; must exist in seed. Fallback: first N places. */
  featuredSlugs?: string[];
};

const city = DIRECTORY_CITY.name;

function label(cat: ListingCategory): string {
  return LISTING_CATEGORIES[cat].label;
}

const LANDING: Record<ListingCategory, CategoryLandingSeo> = {
  'art-gallery': {
    h1: `Best art galleries in ${city}`,
    titleTag: `Best art galleries in ${city} — curated contemporary picks | Sotabosc City`,
    metaDescription: `Discover standout contemporary art galleries in ${city}: Gràcia, Raval, Gòtic, El Born, and Poblenou. Curated directory with addresses, neighbourhoods, and links — updated for visitors and locals.`,
    intro: `We highlight independent and mid-size ${city} galleries worth a visit — spaces with serious programmes, not only big museums. Each listing is hand-picked for quality of exhibitions, neighbourhood character, and how it fits a day moving through the city.`,
    criteria: [
      'Active exhibition programme (painting, sculpture, digital, or installation)',
      'Public-facing gallery or art centre (not private-only)',
      'Clear sense of place — walkable clusters in Gràcia, Raval, Gòtic, Born, Eixample, Poblenou',
    ],
    featuredSlugs: [
      'tres-punts-gallery',
      'house-of-chappaz',
      'load-gallery',
      'angels-barcelona',
      'nogueras-blanchard',
      'blueproject-foundation',
    ],
    faq: [
      {
        question: `Are these the only art galleries in ${city}?`,
        answer: `No — ${city} has dozens more. This is a curated subset focused on contemporary programmes and neighbourhoods visitors actually explore on foot.`,
      },
      {
        question: 'How is “best” defined?',
        answer: 'Editorial choice: strength of programme, diversity of practice, and how each venue contributes to a coherent day out — not paid placement.',
      },
      {
        question: `Can I suggest a gallery?`,
        answer: 'Yes — use the feedback link on this page; we review additions regularly.',
      },
    ],
  },
  coworking: {
    h1: `Best coworking spaces in ${city}`,
    titleTag: `Coworking spaces in ${city} — Poblenou, Eixample & more | Sotabosc City`,
    metaDescription: `Compare coworking in ${city}: rooftop spaces, innovation district hubs, and maker-friendly desks. Addresses, neighbourhoods, and links in one solarpunk-styled directory.`,
    intro: `From Plaça Catalunya to Poblenou’s 22@, ${city} coworking runs the gamut — corporate-grade offices, huge innovation campuses, and maker labs. We list spaces that are easy to understand at a glance: location, vibe, and what makes them different.`,
    criteria: [
      'Dedicated coworking or shared workspace (not cafés only)',
      'Clear address and neighbourhood',
      'Distinct offer: desks, studios, fabrication, or community',
    ],
    featuredSlugs: ['onecowork-placa-catalunya', 'aticco-glories', 'transfolab-bcn'],
    faq: [
      {
        question: `How do I choose a coworking space in ${city}?`,
        answer: 'Start with neighbourhood (Eixample vs Poblenou vs Gràcia), then check 24/7 access, meeting rooms, and whether you need fabrication or quiet desk work.',
      },
      {
        question: 'Do you list day passes?',
        answer: 'We focus on venues with stable addresses; contact each space for day-pass or trial policies.',
      },
    ],
  },
  'music-venue': {
    h1: `Live music & culture venues in ${city}`,
    titleTag: `Live music venues in ${city} — jazz, electronic & independent | Sotabosc City`,
    metaDescription: `Independent venues in ${city}: jazz theatres, experimental clubs, and Gràcia institutions. Find addresses, neighbourhoods, and official links.`,
    intro: `${city}’s small and mid-size venues carry most of the city’s musical identity — from historic stages on Paral·lel to underground electronic rooms. We prioritise spaces with a regular programme and a clear public presence.`,
    criteria: [
      'Regular live music or performance programme',
      'Physical venue with public access',
      'Independent or culturally distinct identity',
    ],
    featuredSlugs: ['heliogabal', 'les-enfants-brillants', 'el-molino'],
    faq: [
      {
        question: 'Where is indie music in Barcelona?',
        answer: 'Gràcia, Poble-sec, El Born, and the Raval corridor host many independent rooms; check each listing for genres and typical nights.',
      },
      {
        question: 'Are listings updated for events?',
        answer: 'We link to official sites; use our events section for dated listings tied to venues.',
      },
    ],
  },
  conference: {
    h1: `Conference & festival venues in ${city}`,
    titleTag: `Conferences and design festivals in ${city} | Sotabosc City`,
    metaDescription: `Major hubs for conferences, design festivals, and large-scale cultural events in ${city} — with addresses and neighbourhoods.`,
    intro: `From Glòries design hubs to innovation campuses, these are ${city} venues that regularly host conferences, festivals, and sector events — useful if you’re planning attendance or satellite meetups.`,
    criteria: [
      'Capacity and infrastructure for talks, fairs, or exhibitions',
      'Recognised programme or institutional role',
    ],
    featuredSlugs: ['disseny-hub', 'fab-lab-barcelona'],
    faq: [
      {
        question: 'Is this a calendar of events?',
        answer: 'This page lists venues; see the city events index for dated happenings.',
      },
    ],
  },
  workshop: {
    h1: `Workshops & classes in ${city}`,
    titleTag: `Workshops, yoga, dance & classes in ${city} | Sotabosc City`,
    metaDescription: `Hands-on workshops in ${city}: yoga studios, language schools, music, dance, ceramics, and maker sessions. Filter by neighbourhood and theme.`,
    intro: `Classes here mean scheduled learning — yoga, dance, music, languages, ceramics, and fabrication — not one-off parties. We group them so you can plan a week of movement, making, or study.`,
    criteria: [
      'Recurring classes or bookable workshops',
      'Physical venue in the metro area',
    ],
    featuredSlugs: ['moonlight-studio', 'sangha-studio', 'make-it-barcelona', 'oxford-house-barcelona'],
    faq: [
      {
        question: 'Do you list drop-in yoga?',
        answer: 'Yes, when the studio has a stable address and regular schedule; confirm times on their website.',
      },
    ],
  },
  retreat: {
    h1: `Retreats & immersive stays near ${city}`,
    titleTag: `Retreats and meditation intensives — ${city} | Sotabosc City`,
    metaDescription: `Multi-day retreats and intensive practice in and around ${city}: meditation, zen, and immersive wellness programmes.`,
    intro: `Retreats listed here include structured multi-day or intensive formats — not single drop-in classes. We focus on programmes with clear public information.`,
    criteria: [
      'Retreat or intensive format (not only weekly classes)',
      'Transparent public-facing information',
    ],
    featuredSlugs: ['zen-kannon'],
    faq: [
      {
        question: 'Are retreats inside the city?',
        answer: 'Some are urban intensives; others use nearby natural areas — check each listing’s address and format.',
      },
    ],
  },
  'specialty-coffee': {
    h1: `Best specialty coffee in ${city}`,
    titleTag: `Specialty coffee in ${city} — roasters & cafés | Sotabosc City`,
    metaDescription: `Specialty coffee shops and roasteries in ${city}: single-origin espresso, brunch, cuppings, and rotating guest roasters. Neighbourhoods and links included.`,
    intro: `We favour ${city} spots where coffee is the point — roaster-owned bars, serious espresso, and places running cuppings or featured roasters. Chains are out unless they have a distinct local roast programme.`,
    criteria: [
      'Specialty coffee focus (roastery, featured roasters, or known quality bar)',
      'Sit-in or takeaway with clear address',
    ],
    featuredSlugs: ['roast-club-cafe', 'la-papa-coffee', 'onis-coffee', 'syra-coffee', 'orval-cafe'],
    faq: [
      {
        question: 'What counts as specialty coffee?',
        answer: 'Higher-grade beans, careful brewing, and usually transparent sourcing — often with a named roaster or in-house roast programme.',
      },
    ],
  },
  restaurant: {
    h1: `Restaurants & dining in ${city}`,
    titleTag: `Restaurants in ${city} — sustainable & memorable dining | Sotabosc City`,
    metaDescription: `Notable restaurants in ${city}: farm-to-table, vegetarian, Mediterranean, and neighbourhood dining — with areas and official links.`,
    intro: `These are ${city} restaurants chosen for a clear point of view: regenerative sourcing, plant-forward cooking, landmark fine dining, or strong neighbourhood identity — not exhaustive, but editorially meaningful.`,
    criteria: [
      'Sit-down restaurant or defined dining experience',
      'Distinct culinary or sustainability story',
    ],
    featuredSlugs: ['ona-restaurant', 'faire-barcelona', 'nectari', 'greenleka-can-valldaura'],
    faq: [
      {
        question: 'Do you cover reservations?',
        answer: 'We link to official sites; booking policies change seasonally.',
      },
    ],
  },
  shop: {
    h1: `Shops & markets in ${city}`,
    titleTag: `Independent shops & markets in ${city} | Sotabosc City`,
    metaDescription: `Markets, design shops, and maker storefronts in ${city} — weekend markets, eco design, and workshop-retail hybrids.`,
    intro: `Retail listings mix weekend markets, independent design, and workshop-shops where you can watch makers work — ideal for gifts and local supply chains.`,
    criteria: [
      'Physical retail or recurring market',
      'Independent or local-maker focus where possible',
    ],
    featuredSlugs: ['raval-market', 'nothrow-design', 'terra-i-pell', 'les-topettes'],
    faq: [
      {
        question: 'Are market hours always current?',
        answer: 'Verify weekend hours on official pages; seasonal schedules vary.',
      },
    ],
  },
  other: {
    h1: `${label('other')} in ${city}`,
    titleTag: `More places in ${city} — Sotabosc City directory`,
    metaDescription: `Other curated listings in ${city} on Sotabosc City — spaces that don’t fit a single category yet belong in the ecosystem.`,
    intro: `Everything here is still part of the ${city} directory but doesn’t map cleanly to a single category — worth browsing if you’re exploring the full map.`,
    criteria: ['Hand-listed', 'Verified address in the metro area'],
    faq: [
      {
        question: 'Why is a place in “Other”?',
        answer: 'We may recategorise as the directory grows; suggest a category via feedback if something fits better elsewhere.',
      },
    ],
  },
};

export function getCategoryLandingSeo(category: ListingCategory): CategoryLandingSeo {
  return LANDING[category];
}
