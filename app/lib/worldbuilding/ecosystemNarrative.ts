/**
 * Ecosystem Narrative System - Core worldbuilding data and storytelling elements
 * Inspired by Enter Maya's deep lore approach with Barcelona solarpunk themes
 */

export interface EcosystemDomain {
  id: string;
  name: string;
  element: 'sky' | 'canopy' | 'water' | 'soil';
  archetype: string;
  energySource: string;
  inhabitants: string[];
  essence: string;
  storyThread: {
    title: string;
    description: string;
    mythology: string;
  };
  seasonalAspects: {
    spring: string;
    summer: string;
    autumn: string;
    winter: string;
  };
  symbioticRelations: string[];
}

export interface EcosystemRole {
  id: string;
  title: string;
  description: string;
  domain: string;
  contributionType: 'pollinator' | 'root_network' | 'canopy_guardian' | 'flow_keeper' | 'mycelial_bridge';
  symbioticActions: string[];
}

export interface PlaceNarrative {
  ecosystemRole: EcosystemRole;
  originStory: string;
  currentFunction: string;
  symbioticConnections: string[];
  seasonalRhythms: Record<string, string>;
}

// Core Barcelona Ecosystem Domains
export const ECOSYSTEM_DOMAINS: Record<string, EcosystemDomain> = {
  sky: {
    id: 'sky',
    name: 'Sky Domain',
    element: 'sky',
    archetype: 'The Visionaries',
    energySource: 'Solar collection and wind synthesis',
    inhabitants: ['Future-shapers', 'Tech symbionts', 'Cloud readers', 'Solar architects'],
    essence: 'The realm where Barcelona\'s tomorrow crystallizes into today\'s possibility',
    storyThread: {
      title: 'The Canopy Watchers',
      description: 'Those who observe patterns from above and weave tomorrow\'s possibilities',
      mythology: 'Legend speaks of the Great Elevation, when Barcelona\'s visionaries ascended to rooftops and towers, forming a network of sky-gardens that channel the city\'s collective dreams downward through photosynthetic inspiration.',
    },
    seasonalAspects: {
      spring: 'New projects germinate in the warming light',
      summer: 'Peak solar energy drives innovation acceleration',
      autumn: 'Harvesting mature ideas, preparing for contemplative months',
      winter: 'Deep reflection and planning cycles, aurora-like inspiration'
    },
    symbioticRelations: ['Feeds inspiration to canopy artists', 'Powers soil-level community spaces', 'Provides clarity for water-domain healing']
  },
  
  canopy: {
    id: 'canopy',
    name: 'Canopy Domain',
    element: 'canopy',
    archetype: 'The Resonance Weavers',
    energySource: 'Bio-luminescent creativity and acoustic photosynthesis',
    inhabitants: ['Sound gardeners', 'Color alchemists', 'Rhythm keepers', 'Story pollinators'],
    essence: 'Where Barcelona\'s cultural DNA replicates and evolves through artistic cross-pollination',
    storyThread: {
      title: 'The Resonance Network',
      description: 'Art and culture as the nervous system of the city ecosystem',
      mythology: 'During the Cultural Convergence, Barcelona\'s artists discovered they could synchronize their creative frequencies, creating resonance cascades that amplify beauty throughout the urban forest. Each gallery, venue, and studio became a node in this living network.',
    },
    seasonalAspects: {
      spring: 'New artistic collaborations bloom across mediums',
      summer: 'Festival seasons create massive pollination events',
      autumn: 'Deep works mature, exhibitions reach full complexity',
      winter: 'Intimate gatherings foster intensive creative evolution'
    },
    symbioticRelations: ['Transforms sky visions into tangible beauty', 'Enriches soil community with cultural nutrients', 'Harmonizes water flow with rhythmic patterns']
  },
  
  water: {
    id: 'water',
    name: 'Water Domain',
    element: 'water',
    archetype: 'The Flow Keepers',
    energySource: 'Hydro-circulation and bio-thermal wellness systems',
    inhabitants: ['Wellness gardeners', 'Breath architects', 'Energy healers', 'Flow guides'],
    essence: 'The circulatory system that maintains Barcelona\'s collective health and emotional flow',
    storyThread: {
      title: 'The Current Keepers',
      description: 'Guardians of the city\'s emotional and physical wellness currents',
      mythology: 'When Barcelona\'s ancient waterways were rediscovered beneath the modern city, healers and wellness practitioners became the keepers of these hidden currents, channeling their energy into spaces of restoration and renewal.',
    },
    seasonalAspects: {
      spring: 'Detox and renewal practices align with nature\'s awakening',
      summer: 'Cooling and hydration become community rituals',
      autumn: 'Grounding and immune-strengthening preparations',
      winter: 'Deep warming practices and contemplative healing'
    },
    symbioticRelations: ['Cleanses and energizes sky-level thinking', 'Nourishes canopy creativity with emotional depth', 'Provides essential flow for soil-community growth']
  },
  
  soil: {
    id: 'soil',
    name: 'Soil Domain',
    element: 'soil',
    archetype: 'The Root Network',
    energySource: 'Geothermal community warmth and decomposition-regeneration cycles',
    inhabitants: ['Community cultivators', 'Nourishment keepers', 'Tradition carriers', 'Local symbionts'],
    essence: 'The foundational mycorrhizal network that connects and nourishes all other domains',
    storyThread: {
      title: 'The Root Network',
      description: 'The foundational community that nourishes all other ecosystem levels',
      mythology: 'In the time of the Great Rooting, Barcelona\'s local businesses, cafes, and community spaces discovered they formed an underground network of mutual support, sharing resources and care like the mycorrhizal networks of old forests.',
    },
    seasonalAspects: {
      spring: 'New local connections form, community projects sprout',
      summer: 'Abundant sharing and outdoor community gatherings',
      autumn: 'Preservation of local traditions and seasonal harvests',
      winter: 'Deep community care and resource conservation'
    },
    symbioticRelations: ['Grounds sky visions in practical community action', 'Provides stable foundation for canopy artistic expression', 'Offers grounding anchor points for water-domain healing work']
  }
};

// Ecosystem Roles for Places and Creators
export const ECOSYSTEM_ROLES: Record<string, EcosystemRole> = {
  pollinator: {
    id: 'pollinator',
    title: 'Cross-Domain Pollinator',
    description: 'Facilitates exchange and collaboration between different ecosystem domains',
    domain: 'multi',
    contributionType: 'pollinator',
    symbioticActions: ['Connects communities across domains', 'Facilitates knowledge transfer', 'Hosts interdisciplinary gatherings']
  },
  
  canopy_guardian: {
    id: 'canopy_guardian',
    title: 'Canopy Guardian',
    description: 'Protects and nurtures the city\'s cultural creative expression',
    domain: 'canopy',
    contributionType: 'canopy_guardian',
    symbioticActions: ['Amplifies artistic voices', 'Creates safe creative spaces', 'Preserves cultural heritage']
  },
  
  flow_keeper: {
    id: 'flow_keeper',
    title: 'Flow Keeper',
    description: 'Maintains the wellness currents that keep the ecosystem healthy',
    domain: 'water',
    contributionType: 'flow_keeper',
    symbioticActions: ['Provides healing and restoration', 'Facilitates emotional processing', 'Teaches wellness practices']
  },
  
  root_network: {
    id: 'root_network',
    title: 'Root Network Node',
    description: 'Essential foundation providing stability and nourishment to the community',
    domain: 'soil',
    contributionType: 'root_network',
    symbioticActions: ['Supports daily community needs', 'Preserves local culture', 'Provides gathering spaces']
  },
  
  mycelial_bridge: {
    id: 'mycelial_bridge',
    title: 'Mycelial Bridge',
    description: 'Creates invisible connections that strengthen the entire ecosystem',
    domain: 'multi',
    contributionType: 'mycelial_bridge',
    symbioticActions: ['Facilitates resource sharing', 'Builds community resilience', 'Enables mutual support networks']
  }
};

// Barcelona Ecosystem Mythology
export const ECOSYSTEM_MYTHOLOGY = {
  origin: {
    title: 'The Great Symbiosis',
    timeframe: 'The awakening period (2020-2025)',
    story: `During the years of global pause and reflection, Barcelona underwent what historians now call the Great Symbiosis. The city's creators, entrepreneurs, and community builders began to recognize patterns that had always existed but were previously hidden beneath layers of industrial noise.

Like mycelial networks awakening after rain, connections formed spontaneously between seemingly separate domains. Artists found their creativity amplified when working near wellness spaces. Tech innovators discovered their solutions became more elegant when grounded in community wisdom. Healers noticed their work deepened when surrounded by cultural richness.

This was not planned convergence but organic recognition—Barcelona's urban ecosystem coming into conscious awareness of its own interconnected nature.`
  },
  
  awakening: {
    title: 'The Domain Recognition',
    timeframe: 'The emergence period (2025-2027)',
    story: `As the symbiotic connections strengthened, distinct but complementary domains began to crystallize. The Sky Domain emerged from rooftops and towers where visionaries gathered to read the city's future in solar patterns and wind currents. The Canopy Domain took root in galleries and venues where artists created the resonance networks that carry cultural DNA throughout the urban forest.

The Water Domain flowed into existence through wellness spaces that became the circulatory system of collective health. The Soil Domain deepened in cafes and community centers that formed the mycorrhizal foundation supporting all other growth.

Each domain developed its own character while maintaining essential symbiotic relationships with the others—no domain can thrive without the others, yet each offers unique gifts to the whole.`
  },
  
  current: {
    title: 'The Living Network',
    timeframe: 'Present day',
    story: `Today, Barcelona's ecosystem operates as a living network of conscious collaboration. Newcomers to the city often report sensing something different—a feeling of belonging to something larger, of being welcomed into a web of mutual support that extends beyond individual businesses or communities.

The Trail System has evolved as the natural navigation method for this ecosystem. Rather than rigid categories, people follow trails through domains that align with their current needs and growth edges. A morning in the Water Domain for restoration might flow into afternoon Canopy exploration for inspiration, followed by evening Soil grounding in community spaces.

This is Barcelona as living system—always growing, always adapting, always welcoming new symbionts into its ever-expanding network of mutual flourishing.`
  }
};

// Seasonal Ecosystem Rhythms
export const SEASONAL_RHYTHMS = {
  spring: {
    name: 'Regeneration Season',
    energy: 'Sprouting and new beginnings',
    dominantDomains: ['soil', 'water'],
    activities: 'New project launches, community seed-planting, wellness renewal practices',
    narrative: 'The ecosystem awakens from winter contemplation, new connections form rapidly as energy rises'
  },
  
  summer: {
    name: 'Pollination Season', 
    energy: 'Peak growth and cross-fertilization',
    dominantDomains: ['sky', 'canopy'],
    activities: 'Festival seasons, innovation accelerators, cultural pollination events',
    narrative: 'Maximum energy flow between domains, major collaborative projects come to fruition'
  },
  
  autumn: {
    name: 'Harvest Season',
    energy: 'Maturation and knowledge-gathering',
    dominantDomains: ['canopy', 'soil'],
    activities: 'Exhibition seasons, community celebrations, tradition preservation',
    narrative: 'Deep works reach maturity, wisdom is gathered and preserved for winter contemplation'
  },
  
  winter: {
    name: 'Contemplation Season',
    energy: 'Deep roots and visionary planning',
    dominantDomains: ['water', 'sky'],
    activities: 'Intimate gatherings, healing intensives, future visioning sessions',
    narrative: 'The ecosystem draws energy inward for renewal and deep planning of next year\'s growth'
  }
};

// Narrative Templates
export const NARRATIVE_TEMPLATES = {
  placeOrigin: (domain: string, role: string) => 
    `In the time of the Great Symbiosis, this space emerged as a natural ${role} within Barcelona's ${domain} domain. Its unique position in the ecosystem...`,
    
  creatorJourney: (domain: string, contribution: string) =>
    `Following the mycelial networks that connect Barcelona's creative ecosystem, this creator found their path in the ${domain} domain, where their gift for ${contribution}...`,
    
  eventConvergence: (domains: string[]) =>
    `When ${domains.join(' and ')} domains converge, something magical happens. This gathering creates a pollination point where...`,
    
  seasonalShift: (season: string, domain: string) =>
    `As Barcelona enters ${season}, the ${domain} domain shifts its rhythms, offering...`
};