/**
 * Enhanced Ecosystem Domain Theming with Worldbuilding Narrative
 * Extends existing domain theming with ecosystem storytelling elements
 */

import type { DomainCategory } from '../directory/types';
import { ECOSYSTEM_DOMAINS, type EcosystemDomain } from './ecosystemNarrative';

export interface EcosystemTheme {
  // Visual theme
  key: EcosystemLayer | 'neutral';
  label: string;
  emoji: string;
  bg: string;
  surface: string;
  surfaceMuted: string;
  accent: string;
  accentSoft: string;
  text: string;
  muted: string;
  border: string;
  
  // Ecosystem narrative
  archetype: string;
  essence: string;
  energySource: string;
  seasonalEnergy: string;
  atmosphericElements: {
    primaryGradient: string;
    secondaryGradient: string;
    particleColor: string;
    ambientSound?: string;
  };
  
  // Domain-specific UI language
  uiLanguage: {
    loadingVerbs: string[];
    navigationTerms: {
      explore: string;
      discover: string;
      connect: string;
      journey: string;
    };
    progressDescriptors: string[];
    placeholderTexts: {
      search: string;
      loading: string;
      empty: string;
    };
  };
}

export type EcosystemLayer = 'sky' | 'canopy' | 'water' | 'soil';

// Map biological domains to ecosystem layers
export const DOMAIN_TO_ECOSYSTEM: Record<DomainCategory, EcosystemLayer> = {
  plants: 'canopy',     // Trees, artistic expression, cultural growth
  algae: 'water',       // Flow, wellness, circulation
  fungi: 'soil',        // Root networks, community, foundation
  microbes: 'soil',     // Essential community processes
  animals: 'canopy',    // Dynamic interactions, performances
  earth: 'soil',        // Grounding, stability, local business
};

// Enhanced ecosystem themes with narrative elements
export const ECOSYSTEM_THEMES: Record<EcosystemLayer, EcosystemTheme> = {
  sky: {
    // Visual theme
    key: 'sky',
    label: 'Sky Domain',
    emoji: '☀️',
    bg: 'linear-gradient(135deg, #dbeafe 0%, #e0f2fe 35%, #f0f9ff 100%)',
    surface: 'rgba(255, 255, 255, 0.92)',
    surfaceMuted: 'rgba(219, 234, 254, 0.6)',
    accent: '#0369a1',
    accentSoft: '#0ea5e9',
    text: '#0c4a6e',
    muted: '#075985',
    border: 'rgba(3, 105, 161, 0.15)',
    
    // Ecosystem narrative
    archetype: 'The Visionaries',
    essence: 'Where Barcelona\'s tomorrow crystallizes into possibility',
    energySource: 'Solar collection and wind synthesis',
    seasonalEnergy: 'Peak innovation energy during long summer days',
    
    atmosphericElements: {
      primaryGradient: 'linear-gradient(to bottom, #dbeafe, #bfdbfe, #93c5fd)',
      secondaryGradient: 'radial-gradient(circle, rgba(59, 130, 246, 0.1), transparent)',
      particleColor: '#60a5fa',
      ambientSound: 'wind-synthesis'
    },
    
    uiLanguage: {
      loadingVerbs: ['Accessing satellite networks...', 'Tuning solar frequencies...', 'Connecting to cloud infrastructure...', 'Calibrating vision sensors...'],
      navigationTerms: {
        explore: 'ascend to',
        discover: 'observe from above',
        connect: 'sync frequencies with',
        journey: 'follow the light path'
      },
      progressDescriptors: ['Vision clarifying...', 'Future patterns emerging...', 'Innovation pathways opening...'],
      placeholderTexts: {
        search: 'Search the horizon for innovation...',
        loading: 'Reading the solar patterns...',
        empty: 'The sky awaits new visionaries...'
      }
    }
  },
  
  canopy: {
    key: 'canopy',
    label: 'Canopy Domain',
    emoji: '🎨',
    bg: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 35%, #f7fee7 100%)',
    surface: 'rgba(255, 255, 255, 0.95)',
    surfaceMuted: 'rgba(240, 253, 244, 0.7)',
    accent: '#15803d',
    accentSoft: '#22c55e',
    text: '#14532d',
    muted: '#166534',
    border: 'rgba(21, 128, 61, 0.18)',
    
    archetype: 'The Resonance Weavers',
    essence: 'Where cultural DNA replicates and evolves through artistic cross-pollination',
    energySource: 'Bio-luminescent creativity and acoustic photosynthesis',
    seasonalEnergy: 'Festival seasons create massive pollination events',
    
    atmosphericElements: {
      primaryGradient: 'linear-gradient(to bottom, #f0fdf4, #dcfce7, #bbf7d0)',
      secondaryGradient: 'radial-gradient(circle, rgba(34, 197, 94, 0.1), transparent)',
      particleColor: '#4ade80',
      ambientSound: 'artistic-resonance'
    },
    
    uiLanguage: {
      loadingVerbs: ['Tuning resonance frequencies...', 'Mixing color palettes...', 'Harmonizing creative energies...', 'Weaving story threads...'],
      navigationTerms: {
        explore: 'wander through',
        discover: 'uncover artistic treasures in',
        connect: 'harmonize with',
        journey: 'follow the creative current'
      },
      progressDescriptors: ['Art forms multiplying...', 'Cultural patterns emerging...', 'Creative synthesis flowing...'],
      placeholderTexts: {
        search: 'Seek artistic pollination...',
        loading: 'Composing the cultural symphony...',
        empty: 'The canopy awaits new art forms...'
      }
    }
  },
  
  water: {
    key: 'water',
    label: 'Water Domain',
    emoji: '💧',
    bg: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 35%, #a5f3fc 100%)',
    surface: 'rgba(255, 255, 255, 0.94)',
    surfaceMuted: 'rgba(236, 254, 255, 0.75)',
    accent: '#0891b2',
    accentSoft: '#06b6d4',
    text: '#164e63',
    muted: '#0e7490',
    border: 'rgba(8, 145, 178, 0.16)',
    
    archetype: 'The Flow Keepers',
    essence: 'The circulatory system maintaining collective health and emotional flow',
    energySource: 'Hydro-circulation and bio-thermal wellness systems',
    seasonalEnergy: 'Cooling currents in summer, warming flows in winter',
    
    atmosphericElements: {
      primaryGradient: 'linear-gradient(to bottom, #ecfeff, #cffafe, #a5f3fc)',
      secondaryGradient: 'radial-gradient(circle, rgba(6, 182, 212, 0.08), transparent)',
      particleColor: '#22d3ee',
      ambientSound: 'flowing-water'
    },
    
    uiLanguage: {
      loadingVerbs: ['Checking flow currents...', 'Balancing energy streams...', 'Circulating wellness...', 'Purifying pathways...'],
      navigationTerms: {
        explore: 'flow through',
        discover: 'wade into',
        connect: 'merge currents with',
        journey: 'follow the healing stream'
      },
      progressDescriptors: ['Wellness currents activating...', 'Healing energies flowing...', 'Balance restoring...'],
      placeholderTexts: {
        search: 'Find your flow state...',
        loading: 'Circulating vital energy...',
        empty: 'The waters await healing practitioners...'
      }
    }
  },
  
  soil: {
    key: 'soil',
    label: 'Soil Domain', 
    emoji: '🌱',
    bg: 'linear-gradient(135deg, #fef7ed 0%, #fed7aa 25%, #fdba74 100%)',
    surface: 'rgba(255, 255, 255, 0.96)',
    surfaceMuted: 'rgba(254, 247, 237, 0.8)',
    accent: '#c2410c',
    accentSoft: '#f97316',
    text: '#7c2d12',
    muted: '#9a3412',
    border: 'rgba(194, 65, 12, 0.12)',
    
    archetype: 'The Root Network',
    essence: 'The foundational mycorrhizal network connecting and nourishing all domains',
    energySource: 'Geothermal community warmth and regeneration cycles',
    seasonalEnergy: 'Deep winter community care, spring abundance sharing',
    
    atmosphericElements: {
      primaryGradient: 'linear-gradient(to bottom, #fef7ed, #fed7aa, #fdba74)',
      secondaryGradient: 'radial-gradient(circle, rgba(249, 115, 22, 0.1), transparent)',
      particleColor: '#fb923c',
      ambientSound: 'earth-resonance'
    },
    
    uiLanguage: {
      loadingVerbs: ['Growing root connections...', 'Nourishing community networks...', 'Strengthening foundations...', 'Sharing local resources...'],
      navigationTerms: {
        explore: 'dig into',
        discover: 'unearth',
        connect: 'establish roots with',
        journey: 'follow the mycorrhizal path'
      },
      progressDescriptors: ['Community bonds strengthening...', 'Local networks expanding...', 'Foundations deepening...'],
      placeholderTexts: {
        search: 'Discover community roots...',
        loading: 'Connecting to local networks...',
        empty: 'The soil awaits community builders...'
      }
    }
  }
};

export const NEUTRAL_ECOSYSTEM_THEME: EcosystemTheme = {
  key: 'neutral',
  label: 'Sotabosc Ecosystem',
  emoji: '🌿',
  bg: '#f4f1ea',
  surface: '#ffffff',
  surfaceMuted: '#ebe6dc',
  accent: '#1b4332',
  accentSoft: '#2d6a4f',
  text: '#1a1a1a',
  muted: '#5c5c5c',
  border: 'rgba(27, 67, 50, 0.12)',
  
  archetype: 'The Living System',
  essence: 'Barcelona as a conscious ecosystem of interconnected domains',
  energySource: 'Symbiotic collaboration and mutual flourishing',
  seasonalEnergy: 'Balanced flow between all domains',
  
  atmosphericElements: {
    primaryGradient: 'linear-gradient(to bottom, #f4f1ea, #ebe6dc, #d6cfc1)',
    secondaryGradient: 'radial-gradient(circle, rgba(27, 67, 50, 0.05), transparent)',
    particleColor: '#2d6a4f'
  },
  
  uiLanguage: {
    loadingVerbs: ['Connecting to ecosystem...', 'Sensing domain patterns...', 'Activating symbiotic networks...'],
    navigationTerms: {
      explore: 'discover',
      discover: 'explore',
      connect: 'link with',
      journey: 'follow the trail'
    },
    progressDescriptors: ['Ecosystem awakening...', 'Connections forming...', 'Patterns emerging...'],
    placeholderTexts: {
      search: 'Search the living ecosystem...',
      loading: 'The ecosystem is responding...',
      empty: 'The ecosystem awaits new growth...'
    }
  }
};

// Get ecosystem theme based on domain
export function getEcosystemTheme(domain: DomainCategory | null | undefined): EcosystemTheme {
  if (!domain) return NEUTRAL_ECOSYSTEM_THEME;
  
  const ecosystemLayer = DOMAIN_TO_ECOSYSTEM[domain];
  if (!ecosystemLayer) return NEUTRAL_ECOSYSTEM_THEME;
  
  return ECOSYSTEM_THEMES[ecosystemLayer];
}

// Get current season for seasonal adaptations
export function getCurrentSeason(): 'spring' | 'summer' | 'autumn' | 'winter' {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

// Get seasonal UI adaptations
export function getSeasonalAdaptations(ecosystemLayer: EcosystemLayer) {
  const season = getCurrentSeason();
  const domain = ECOSYSTEM_DOMAINS[ecosystemLayer];
  
  return {
    seasonalAspect: domain.seasonalAspects[season],
    dominantEnergy: season === 'spring' || season === 'summer' ? 'growth' : 'contemplation',
    atmosphericIntensity: season === 'summer' ? 'peak' : season === 'winter' ? 'gentle' : 'moderate'
  };
}