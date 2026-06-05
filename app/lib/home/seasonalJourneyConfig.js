/**
 * Seasonal Journey Configuration
 * Adapts journey narratives based on current season and ecosystem rhythms
 * Extends the base journey config with seasonal depth
 */

import { getCurrentSeason } from '~/lib/worldbuilding/ecosystemTheme';
import { SEASONAL_RHYTHMS } from '~/lib/worldbuilding/ecosystemNarrative';

/** @typedef {'plants'|'algae'|'fungi'|'animals'|'earth'|'neutral'} JourneyDomainKey */

/**
 * Seasonal narrative overlays that modify the base journey copy
 * Based on Barcelona's ecosystem seasonal rhythms
 */
const SEASONAL_COPY_OVERLAYS = {
  spring: {
    plants: {
      ch1Title: 'New growth — first light',
      ch1Story: 'Barcelona awakens with you. Follow the sprouting energy where coffee roasters and yoga studios pulse with the same renewal frequency as the city\'s emerging leaves.',
      ch2Story: 'The cultural canopy burgeons with collaborative energy. New artistic partnerships bloom like spring blossoms — venues booking fresh collaborations.',
      ch3Story: 'Spring menus mirror the city\'s regeneration. Plant-forward kitchens celebrate what\'s just emerged from winter contemplation.',
      ch4Story: 'Creators emerge from winter projects like perennials. This season\'s maker network shows the fruits of contemplative planning.',
      ch5Story: 'The trail continues. Spring in Barcelona means every path leads to new growth — follow tomorrow\'s different route for fresh discoveries.',
    },
    neutral: {
      ch1Title: 'Renewal currents — coffee & breath',
      ch1Story: 'Spring energy flows through Barcelona\'s gathering spaces. Cafés and movement studios hum with the city\'s collective awakening.',
      ch2Story: 'Cultural calendars bloom with new collaborations. This season brings fresh creative partnerships to venues throughout the city.',
      ch3Story: 'Restaurant menus shift toward renewal — seasonal ingredients and lighter preparations mirror the city\'s emerging energy.',
      ch4Story: 'The maker community surfaces from winter projects. Spring reveals the creative fruits of contemplative planning periods.',
    }
  },
  
  summer: {
    plants: {
      ch1Title: 'Peak sun — morning rituals',
      ch1Story: 'Solar energy drives Barcelona\'s creative acceleration. Start where morning light hits coffee and yoga — the city\'s daily photosynthesis begins here.',
      ch2Story: 'Festival season creates massive artistic pollination. Summer venues become cross-fertilization hubs where genres and communities merge.',
      ch3Story: 'Long days support extended dining rituals. Plant-forward restaurants offer cooling respite and sustained nourishment for summer\'s intensity.',
      ch4Story: 'Peak collaboration season. Summer heat brings creators together in shared spaces, generating the year\'s most ambitious cross-pollinations.',
      ch5Story: 'Maximum daylight, maximum possibilities. Tomorrow\'s summer path could lead anywhere — Barcelona\'s energy is at its highest flow.',
    },
    neutral: {
      ch1Title: 'Peak energy — rituals & coolness',
      ch1Story: 'Summer Barcelona pulses with maximum creative energy. Morning coffee and cooling practices provide essential rhythm in the season of abundance.',
      ch2Story: 'Festival season transforms the city into a massive collaboration space. Venues host cross-genre events that define summer\'s cultural harvest.',
      ch3Story: 'Cooling cuisine and extended terraces. Summer dining becomes ritual — long meals that match the season\'s expanded daylight.',
      ch4Story: 'High-energy collaboration season. Summer brings creators together for the year\'s most ambitious shared projects.',
    }
  },
  
  autumn: {
    plants: {
      ch1Title: 'Harvest light — grounding',
      ch1Story: 'Barcelona settles into autumn\'s golden productivity. Coffee becomes deeper, movement practices more grounding — matching the season\'s shift toward contemplation.',
      ch2Story: 'Exhibition season. Autumn brings mature artistic works to full presentation — galleries and venues showcase the year\'s deepest explorations.',
      ch3Story: 'Warming spices and preservation techniques. Plant-forward kitchens honor autumn\'s wisdom — nourishment that prepares for winter\'s contemplative season.',
      ch4Story: 'Makers present their year\'s mature work. Autumn is Barcelona\'s exhibition season — when deep projects reach public completion.',
      ch5Story: 'The season of completion and preparation. Tomorrow\'s autumn path reveals what Barcelona has been cultivating all year.',
    },
    neutral: {
      ch1Title: 'Settling energy — warmth & grounding',
      ch1Story: 'Autumn Barcelona shifts toward contemplative productivity. Warming coffee rituals and grounding practices match the season\'s deeper energies.',
      ch2Story: 'Season of mature presentations. Autumn venues showcase the year\'s deepest cultural work — exhibitions and performances reach full complexity.',
      ch3Story: 'Comfort and warming cuisine. Restaurants shift toward nourishment that prepares the community for winter\'s reflective season.',
      ch4Story: 'Exhibition and completion season. Autumn reveals the mature results of the year\'s creative collaborations.',
    }
  },
  
  winter: {
    plants: {
      ch1Title: 'Deep roots — contemplation',
      ch1Story: 'Winter Barcelona draws energy inward. Coffee becomes ceremony, movement becomes meditation — the city\'s contemplative season begins.',
      ch2Story: 'Intimate gatherings replace summer\'s festivals. Winter venues host the deep, small events that strengthen cultural roots through quiet seasons.',
      ch3Story: 'Warming rituals and preserved abundance. Plant-forward winter dining becomes community care — nourishment that sustains through contemplative months.',
      ch4Story: 'Makers retreat into planning and deep work. Winter\'s creator community focuses on the foundational projects that will emerge next spring.',
      ch5Story: 'The season of planning and renewal preparation. Tomorrow\'s winter path leads to the quiet spaces where next year\'s growth begins.',
    },
    neutral: {
      ch1Title: 'Contemplative energy — warmth & planning',
      ch1Story: 'Winter Barcelona focuses inward. Warming coffee rituals and contemplative movement create the rhythms for the city\'s planning season.',
      ch2Story: 'Intimate cultural gatherings. Winter venues host the small, deep events that strengthen community bonds during reflective months.',
      ch3Story: 'Warming cuisine and preserved seasonality. Winter dining becomes community care — meals that sustain through contemplative periods.',
      ch4Story: 'Planning and deep work season. Winter creators focus on foundational projects that will bloom when energy returns.',
    }
  }
};

/**
 * Seasonal activity recommendations based on ecosystem rhythms
 */
const SEASONAL_ACTIVITY_SUGGESTIONS = {
  spring: {
    coffee: ['New origin tastings', 'Outdoor seating returns', 'Collaborative breakfast meetings'],
    events: ['Project launches', 'Networking events', 'Creative partnership formation'],
    food: ['Seasonal menu debuts', 'Detox and renewal cuisine', 'Garden-to-table specials'],
    creators: ['Portfolio launches', 'Collaboration seeks', 'Spring collection releases']
  },
  summer: {
    coffee: ['Cold brew specialties', 'Terrace culture', 'Early morning routines'],
    events: ['Festivals and collaborations', 'Outdoor performances', 'Cross-genre experiments'],
    food: ['Cooling cuisine', 'Extended terrace dining', 'Late-night food culture'],
    creators: ['Peak collaboration projects', 'Public installations', 'Community workshops']
  },
  autumn: {
    coffee: ['Warming spice blends', 'Cozy interior spaces', 'Afternoon contemplation'],
    events: ['Exhibition openings', 'Cultural presentations', 'Artistic maturation showcases'],
    food: ['Comfort and warming dishes', 'Preservation techniques', 'Harvest celebrations'],
    creators: ['Major project completions', 'Gallery submissions', 'Portfolio presentations']
  },
  winter: {
    coffee: ['Deep roast comfort', 'Small gathering spaces', 'Planning session fuel'],
    events: ['Intimate venue experiences', 'Deep workshop series', 'Community care events'],
    food: ['Warming community meals', 'Comfort cuisine', 'Traditional preparation methods'],
    creators: ['Planning and concept development', 'Studio time', 'Foundational skill building']
  }
};

/**
 * Get seasonal overlay for journey copy
 */
export function getSeasonalJourneyCopy(domain) {
  const season = getCurrentSeason();
  const seasonalOverlay = SEASONAL_COPY_OVERLAYS[season];
  
  if (domain === 'plants' && seasonalOverlay.plants) {
    return seasonalOverlay.plants;
  }
  
  return seasonalOverlay.neutral || {};
}

/**
 * Get current seasonal rhythm information
 */
export function getCurrentSeasonalContext() {
  const season = getCurrentSeason();
  const seasonalRhythm = SEASONAL_RHYTHMS[season];
  const activitySuggestions = SEASONAL_ACTIVITY_SUGGESTIONS[season];
  
  return {
    season,
    ...seasonalRhythm,
    activitySuggestions
  };
}

/**
 * Enhanced journey chapters with seasonal adaptations
 */
export function getSeasonalJourneyChapters(domain) {
  const season = getCurrentSeason();
  const seasonalCopy = getSeasonalJourneyCopy(domain);
  const baseConfig = getBaseJourneyConfig(domain);
  
  // Apply seasonal overlays to base configuration
  return baseConfig.map(chapter => ({
    ...chapter,
    // Override with seasonal copy where available
    title: seasonalCopy[`ch${chapter.chapterNumber}Title`] || chapter.title,
    narrative: seasonalCopy[`ch${chapter.chapterNumber}Story`] || chapter.narrative,
    seasonalContext: {
      season,
      energyLevel: SEASONAL_RHYTHMS[season]?.energy,
      dominantDomains: SEASONAL_RHYTHMS[season]?.dominantDomains || []
    }
  }));
}

/**
 * Base journey configuration (extracted from existing journeyConfig.js)
 */
function getBaseJourneyConfig(domain) {
  // This would import from the existing journeyConfig.js
  // For now, return basic structure that matches existing chapters
  return [
    {
      chapterNumber: 1,
      stepId: 'open-air',
      layer: 'canopy',
      kind: 'places',
      categoryFilter: ['specialty-coffee', 'workshop'],
      limit: 6,
    },
    {
      chapterNumber: 2,
      stepId: 'sound',
      layer: 'water', 
      kind: 'events',
      limit: 6,
    },
    {
      chapterNumber: 3,
      stepId: 'table',
      layer: 'soil',
      kind: 'places',
      categoryFilter: ['restaurant'],
      limit: 5,
    },
    {
      chapterNumber: 4,
      stepId: 'makers',
      layer: 'understory',
      kind: 'creators',
      limit: 9,
    },
    {
      chapterNumber: 5,
      stepId: 'map',
      layer: 'bedrock',
      kind: 'hub',
    },
  ];
}