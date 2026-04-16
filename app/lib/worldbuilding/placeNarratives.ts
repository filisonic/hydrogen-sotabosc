/**
 * Place-Specific Worldbuilding Narratives
 * Connects individual Barcelona venues to the larger ecosystem mythology
 * Inspired by Enter Maya's deep lore approach with specific venue storytelling
 */

import type { PlaceNarrative, EcosystemRole } from './ecosystemNarrative';
import { ECOSYSTEM_ROLES, NARRATIVE_TEMPLATES, ECOSYSTEM_DOMAINS } from './ecosystemNarrative';

export interface VenueEcosystemData {
  ecosystemRole: EcosystemRole;
  originStory: string;
  currentFunction: string;
  symbioticConnections: string[];
  seasonalRhythms: Record<string, string>;
  atmosphericMoment: string;
  visitorsExperience: string;
}

// Specific venue narratives based on their actual characteristics and domain assignments
export const VENUE_NARRATIVES: Record<string, VenueEcosystemData> = {
  // Sky Domain (Visionaries) - Innovation & Future-thinking Spaces
  'aticco-glories': {
    ecosystemRole: ECOSYSTEM_ROLES.pollinator,
    originStory: `During the Great Symbiosis, this former industrial site in 22@ transformed into Barcelona's largest innovation mycelium. When the old warehouses were reimagined, the visionaries who gathered here discovered they could amplify each other's frequencies - their combined creative energy reaching skyward like a massive solar collector.`,
    currentFunction: `A 20,000m² network node where Barcelona's future crystallizes daily. The rooftop pool reflects sky patterns while minds below sync with the city's innovation currents.`,
    symbioticConnections: [
      'Feeds startup energy into Poblenou\'s creative network',
      'Provides co-pollination space for cross-industry fertilization',
      'Channels innovation frequency to smaller coworking spaces throughout the city'
    ],
    seasonalRhythms: {
      spring: 'New startup cohorts emerge like fresh shoots reaching for light',
      summer: 'Peak solar energy drives accelerated innovation cycles',
      autumn: 'Mature projects prepare for winter incubation periods',
      winter: 'Deep planning sessions and strategic partnerships form'
    },
    atmosphericMoment: `At sunset, the building hums with synchronized keyboards and quiet collaboration - the sound of tomorrow being built one connection at a time.`,
    visitorsExperience: `You enter feeling the buzz of potential energy. Every corner pulses with the quiet intensity of people building the next iteration of Barcelona.`
  },

  // Canopy Domain (Resonance Weavers) - Cultural & Artistic Spaces  
  'tres-punts-gallery': {
    ecosystemRole: ECOSYSTEM_ROLES.canopy_guardian,
    originStory: `Since 1994, this Gràcia gallery has served as a cultural pollination station. During the Cultural Convergence of the Great Symbiosis, it became a resonance amplifier - every exhibition creating ripples that strengthen Barcelona's artistic nervous system.`,
    currentFunction: `A frequency beacon in Gràcia's creative canopy, broadcasting artistic signals that harmonize with the neighborhood's cultural DNA.`,
    symbioticConnections: [
      'Amplifies emerging artist voices throughout the Gràcia cultural network',
      'Provides visual pollination for nearby cafés and creative spaces', 
      'Preserves and evolves Gràcia\'s artistic heritage through contemporary lens'
    ],
    seasonalRhythms: {
      spring: 'New artist discoveries bloom alongside Gràcia\'s flowering trees',
      summer: 'Festival collaborations create massive artistic pollination events',
      autumn: 'Deep contemplative works mature as the neighborhood settles',
      winter: 'Intimate gatherings foster intensive creative evolution'
    },
    atmosphericMoment: `Opening nights feel like the neighborhood exhaling creativity - conversations spill onto Carrer de Sèneca as art becomes living dialogue.`,
    visitorsExperience: `You step into curated beauty that feels both international and deeply rooted in Gràcia's creative soil.`
  },

  'heliogabal': {
    ecosystemRole: ECOSYSTEM_ROLES.canopy_guardian,
    originStory: `For nearly three decades, this legendary space has been a cultural mycelium node. When the Resonance Network awakened, Heliogàbal revealed its true function: a sound gardener's laboratory where acoustic photosynthesis transforms intimate gatherings into neighborhood-wide cultural nourishment.`,
    currentFunction: `An acoustic greenhouse where small-format concerts, poetry, and experimental culture synthesize into the living soundtrack of Gràcia.`,
    symbioticConnections: [
      'Provides acoustic nutrients to Gràcia\'s creative ecosystem',
      'Hosts cross-pollination between music, poetry, and visual arts',
      'Maintains cultural continuity as a stable mycelial anchor'
    ],
    seasonalRhythms: {
      spring: 'Experimental sounds bloom as new artistic collaborations form',
      summer: 'Intimate outdoor performances create neighborhood listening gardens',
      autumn: 'Deep, contemplative performances prepare the community for winter reflection',
      winter: 'Cozy gatherings strengthen cultural bonds during the contemplative season'
    },
    atmosphericMoment: `During performances, the small room becomes a resonance chamber - every person part of the living instrument creating Barcelona's cultural frequencies.`,
    visitorsExperience: `You enter feeling like you're joining a decades-long conversation about what it means to create community through art.`
  },

  // Water Domain (Flow Keepers) - Wellness & Restoration Spaces
  'frizzant': {
    ecosystemRole: ECOSYSTEM_ROLES.flow_keeper,
    originStory: `When Barcelona's hidden wellness currents were rediscovered, this Gran Via space became a confluence point. The Current Keepers recognized it as a natural circulation hub where yoga, gastronomy, and creativity could merge into healing streams.`,
    currentFunction: `A multi-experiential wellness confluence where Barcelona's different healing currents merge into integrated flow experiences.`,
    symbioticConnections: [
      'Circulates wellness energy throughout the Eixample district',
      'Provides nutritional and movement healing in integrated sessions',
      'Connects individual healing with community wellness practices'
    ],
    seasonalRhythms: {
      spring: 'Detox flows align with nature\'s renewal energy',
      summer: 'Cooling practices and hydrating gastronomy become community rituals',
      autumn: 'Grounding yoga and immune-strengthening nutrition prepare for winter',
      winter: 'Deep warming practices and contemplative movement support inner cultivation'
    },
    atmosphericMoment: `Weekend brunches after yoga feel like community rituals - nourishment flowing between bodies that have moved together in shared intention.`,
    visitorsExperience: `You discover that wellness here isn't individual optimization but collective restoration - healing that strengthens the whole ecosystem.`
  },

  'sangha-studio': {
    ecosystemRole: ECOSYSTEM_ROLES.flow_keeper,
    originStory: `Nestled in Sarrià's green heart, this studio emerged as a natural water domain sanctuary. During the Great Symbiosis, practitioners discovered their outdoor classes among vegetation could channel the neighborhood's natural healing frequencies directly into human restoration.`,
    currentFunction: `An outdoor healing sanctuary where Jivamukti flows merge with Sarrià's natural rhythms, creating a bridge between urban practice and organic restoration.`,
    symbioticConnections: [
      'Channels Sarrià\'s natural healing energy into structured practice',
      'Provides outdoor movement that harmonizes with seasonal plant cycles',
      'Connects individual contemplative practice with neighborhood green spaces'
    ],
    seasonalRhythms: {
      spring: 'Morning flows align with awakening vegetation and bird songs',
      summer: 'Sunset classes harness the cooling energy of tree shade',
      autumn: 'Grounding practices mirror the settling energy of falling leaves',
      winter: 'Indoor warming flows maintain connection to dormant garden energy'
    },
    atmosphericMoment: `Outdoor classes feel like moving meditation within a living mandala - the surrounding vegetation breathing with the yoga flow.`,
    visitorsExperience: `You practice feeling held by both community and nature, restoration that connects rather than separates.`
  },

  // Soil Domain (Root Network) - Community & Foundation Spaces
  'roast-club-cafe': {
    ecosystemRole: ECOSYSTEM_ROLES.root_network,
    originStory: `This Eixample corner became a mycorrhizal café during the Great Rooting. The roasters discovered that carefully tending coffee beans mirrors the community care needed for neighborhood flourishing - each cup becomes a small act of mutual nourishment.`,
    currentFunction: `A daily nourishment node where specialty coffee and brunch create the foundational community care that supports Eixample's creative ecosystem.`,
    symbioticConnections: [
      'Provides daily fuel for local creative workers and neighbors',
      'Hosts cupping sessions that build coffee education community',
      'Supports local suppliers through transparent sourcing practices'
    ],
    seasonalRhythms: {
      spring: 'New coffee origins arrive as seasonal menu items bloom',
      summer: 'Iced preparations and outdoor terrace foster neighborhood gathering',
      autumn: 'Warm spice blends and hearty brunch prepare community for winter',
      winter: 'Hot coffee rituals provide warming social anchors during contemplative season'
    },
    atmosphericMoment: `Morning rush feels like a gentle neighborhood awakening - regulars exchanging quiet greetings over the hiss of the espresso machine.`,
    visitorsExperience: `You taste coffee that carries stories of origin and care, feeling connected to both distant farms and immediate neighborhood.`
  },

  'nomad-coffee-poblenou': {
    ecosystemRole: ECOSYSTEM_ROLES.root_network,
    originStory: `In Poblenou's industrial transformation, this roastery became a grounding anchor. When the creative district's innovation energy threatened to disconnect from community roots, Nomad emerged as a daily ritual space where local foundation and global connection could coexist.`,
    currentFunction: `A roastery sanctuary in the heart of 22@'s innovation district, providing the grounding coffee rituals that anchor Poblenou's creative transformation in community care.`,
    symbioticConnections: [
      'Grounds the high-energy innovation district in daily community rituals',
      'Connects Poblenou to global coffee origins while maintaining local identity',
      'Provides workspace fuel for the creative and tech professionals transforming the neighborhood'
    ],
    seasonalRhythms: {
      spring: 'New roast profiles align with the neighborhood\'s project launches',
      summer: 'Cold brew and iced options support the district\'s peak creative energy',
      autumn: 'Warming blends prepare the community for winter planning cycles',
      winter: 'Deep roast profiles provide comfort during the neighborhood\'s contemplative season'
    },
    atmosphericMoment: `The industrial space hums with roasting machines and laptop keyboards - creation happening at multiple scales simultaneously.`,
    visitorsExperience: `You drink coffee while watching the neighborhood transform, feeling part of both continuity and evolution.`
  },

  // Cross-Domain Pollinators - Spaces that bridge multiple domains
  'espronceda-institute': {
    ecosystemRole: ECOSYSTEM_ROLES.pollinator,
    originStory: `This Poblenou art centre emerged as a natural cross-domain pollination station. During the Great Symbiosis, artists and scientists discovered their shared frequency, creating a space where canopy creativity, sky innovation, and soil community care could synthesize into entirely new forms.`,
    currentFunction: `A bioart laboratory where the boundaries between domains dissolve - exhibitions, residencies, and workshops that pollinate between art, science, technology, and community.`,
    symbioticConnections: [
      'Bridges artistic canopy domain with technological sky domain innovation',
      'Connects experimental bioart with soil domain community workshops',
      'Provides residency space for inter-domain creative cross-pollination'
    ],
    seasonalRhythms: {
      spring: 'New residency cohorts arrive, bringing fresh inter-disciplinary pollination',
      summer: 'Public workshops create massive community engagement with bioart practices',
      autumn: 'Exhibitions showcase the mature results of cross-domain collaboration',
      winter: 'Planning and deep research prepare for next year\'s experimental programs'
    },
    atmosphericMoment: `Opening events feel like controlled explosions of interdisciplinary curiosity - conversations jumping between art techniques and scientific methods.`,
    visitorsExperience: `You encounter art that makes you think about science, science that feels like poetry, community building that looks like ecosystem cultivation.`
  },

  'fab-lab-barcelona': {
    ecosystemRole: ECOSYSTEM_ROLES.pollinator,
    originStory: `This world-renowned lab became the biotechnology bridge during the Great Symbiosis. When makers and researchers needed to cross-pollinate between digital fabrication and organic systems, Fab Lab emerged as the natural translation space between domains.`,
    currentFunction: `A fabrication mycelium where sky domain innovation meets soil domain community making, creating new possibilities for how Barcelona builds its future.`,
    symbioticConnections: [
      'Translates high-level technological innovation into community-accessible making',
      'Connects international maker networks with local Barcelona creative ecosystems',
      'Provides education that bridges digital fabrication with biotechnology principles'
    ],
    seasonalRhythms: {
      spring: 'New making cohorts explore emerging technologies with fresh perspectives',
      summer: 'Community workshops bring fabrication tools to neighborhood level',
      autumn: 'Research projects mature into demonstrable prototypes',
      winter: 'Deep collaboration with international network develops next year\'s innovations'
    },
    atmosphericMoment: `The lab hums with 3D printers and laser cutters, but conversations circle around how technology can serve community flourishing.`,
    visitorsExperience: `You engage with cutting-edge making tools while discussing how fabrication can support ecological and social regeneration.`
  }
};

// Helper functions for integrating narratives into the app

export function getVenueEcosystemStory(placeSlug: string): VenueEcosystemData | null {
  return VENUE_NARRATIVES[placeSlug] || null;
}

export function getVenueOriginStory(placeSlug: string): string | null {
  const narrative = VENUE_NARRATIVES[placeSlug];
  return narrative?.originStory || null;
}

export function getVenueSeasonalMoment(placeSlug: string, season: 'spring' | 'summer' | 'autumn' | 'winter'): string | null {
  const narrative = VENUE_NARRATIVES[placeSlug];
  return narrative?.seasonalRhythms[season] || null;
}

export function getVenueAtmosphericMoment(placeSlug: string): string | null {
  const narrative = VENUE_NARRATIVES[placeSlug];
  return narrative?.atmosphericMoment || null;
}

// Generate narrative for venues that don't have specific stories yet
export function generateGenericVenueNarrative(
  placeSlug: string, 
  domain: string, 
  categories: string[]
): VenueEcosystemData | null {
  if (!domain || !categories.length) return null;
  
  const ecosystemDomain = ECOSYSTEM_DOMAINS[domain];
  if (!ecosystemDomain) return null;

  // Determine ecosystem role based on categories
  let ecosystemRole = ECOSYSTEM_ROLES.root_network; // default
  
  if (categories.includes('art-gallery') || categories.includes('music-venue')) {
    ecosystemRole = ECOSYSTEM_ROLES.canopy_guardian;
  } else if (categories.includes('workshop') && categories.includes('coworking')) {
    ecosystemRole = ECOSYSTEM_ROLES.pollinator;
  } else if (categories.includes('workshop')) {
    ecosystemRole = ECOSYSTEM_ROLES.flow_keeper;
  }
  
  return {
    ecosystemRole,
    originStory: NARRATIVE_TEMPLATES.placeOrigin(ecosystemDomain.name, ecosystemRole.title),
    currentFunction: `A ${ecosystemRole.title.toLowerCase()} in Barcelona's ${ecosystemDomain.name} domain.`,
    symbioticConnections: ecosystemRole.symbioticActions,
    seasonalRhythms: ecosystemDomain.seasonalAspects,
    atmosphericMoment: `This space embodies the essence of the ${ecosystemDomain.archetype}.`,
    visitorsExperience: `You experience the unique energy of Barcelona's ${ecosystemDomain.name} domain.`
  };
}