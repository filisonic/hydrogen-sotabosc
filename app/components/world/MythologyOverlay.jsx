/**
 * Mythology Overlay Component
 * Integrates the Barcelona ecosystem mythology deeply into the user journey
 * Inspired by Enter Maya's layered storytelling approach
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ECOSYSTEM_MYTHOLOGY, SEASONAL_RHYTHMS } from '~/lib/worldbuilding/ecosystemNarrative';
import { getVenueEcosystemStory, getVenueAtmosphericMoment } from '~/lib/worldbuilding/placeNarratives';
import { getCurrentSeason, getSeasonalAdaptations } from '~/lib/worldbuilding/ecosystemTheme';
// Local SeasonalIndicator to avoid circular imports
function LocalSeasonalIndicator({ domain, className = '' }) {
  const season = getCurrentSeason();
  const seasonEmojis = {
    spring: '🌱',
    summer: '☀️', 
    autumn: '🍂',
    winter: '❄️'
  };

  return (
    <div className={`inline-flex items-center gap-2 text-xs text-stone-600 ${className}`}>
      <span className="text-sm">{seasonEmojis[season]}</span>
      <span className="font-medium capitalize">{season}</span>
    </div>
  );
}

function MythologyModal({ isOpen, onClose, content, title }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          
          {/* Modal content */}
          <motion.div
            className="relative max-w-2xl w-full max-h-[80vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <div className="sticky top-0 z-10 bg-white border-b border-stone-200/80 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-stone-900">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-2 -m-2 text-stone-500 hover:text-stone-700 transition-colors"
                  aria-label="Close mythology"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="px-6 py-6">
              <div 
                className="prose prose-stone max-w-none text-stone-700 leading-relaxed"
                style={{ fontFamily: 'var(--font-editorial)' }}
              >
                {content}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MythologyTrigger({ label, onClick, className = '', icon = "📖" }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border border-stone-300/80 bg-white/90 backdrop-blur-sm text-stone-700 hover:bg-white hover:border-stone-400 transition-colors ${className}`}
    >
      <span className="text-sm">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

/**
 * Ecosystem Origin Story trigger - reveals the mythology behind the current domain
 */
export function EcosystemOriginTrigger({ domain, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!domain || domain === 'neutral') return null;

  const domainToMythology = {
    plants: 'canopy',
    animals: 'canopy', 
    algae: 'water',
    fungi: 'soil',
    microbes: 'soil',
    earth: 'soil'
  };

  const mythologyKey = domainToMythology[domain];
  if (!mythologyKey) return null;

  const handleClick = () => setIsOpen(true);

  const formatMythologyContent = () => {
    const origin = ECOSYSTEM_MYTHOLOGY.origin;
    const awakening = ECOSYSTEM_MYTHOLOGY.awakening;
    const current = ECOSYSTEM_MYTHOLOGY.current;

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold text-stone-900 mb-3">{origin.title}</h3>
          <p className="text-sm text-stone-600 mb-3 italic">{origin.timeframe}</p>
          <div className="whitespace-pre-line">{origin.story}</div>
        </div>
        
        <div>
          <h3 className="text-lg font-bold text-stone-900 mb-3">{awakening.title}</h3>
          <p className="text-sm text-stone-600 mb-3 italic">{awakening.timeframe}</p>
          <div className="whitespace-pre-line">{awakening.story}</div>
        </div>
        
        <div>
          <h3 className="text-lg font-bold text-stone-900 mb-3">{current.title}</h3>
          <p className="text-sm text-stone-600 mb-3 italic">{current.timeframe}</p>
          <div className="whitespace-pre-line">{current.story}</div>
        </div>
      </div>
    );
  };

  return (
    <>
      <MythologyTrigger
        label="Origin story"
        onClick={handleClick}
        className={className}
        icon="🌱"
      />
      
      <MythologyModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="The Barcelona Ecosystem Awakening"
        content={formatMythologyContent()}
      />
    </>
  );
}

/**
 * Venue Story trigger - reveals the specific ecosystem story for a place
 */
export function VenueStoryTrigger({ placeSlug, placeName, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const venueStory = getVenueEcosystemStory(placeSlug);
  
  if (!venueStory) return null;

  const handleClick = () => setIsOpen(true);

  const formatVenueContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-stone-900 mb-3">Origin in the Great Symbiosis</h3>
        <div>{venueStory.originStory}</div>
      </div>
      
      <div>
        <h3 className="text-lg font-bold text-stone-900 mb-3">Current Function</h3>
        <div>{venueStory.currentFunction}</div>
      </div>
      
      <div>
        <h3 className="text-lg font-bold text-stone-900 mb-3">Symbiotic Connections</h3>
        <ul className="list-disc list-inside space-y-2">
          {venueStory.symbioticConnections.map((connection, i) => (
            <li key={i}>{connection}</li>
          ))}
        </ul>
      </div>
      
      <div>
        <h3 className="text-lg font-bold text-stone-900 mb-3">Atmospheric Moment</h3>
        <div className="italic">{venueStory.atmosphericMoment}</div>
      </div>
      
      <div>
        <h3 className="text-lg font-bold text-stone-900 mb-3">Visitor Experience</h3>
        <div className="italic">{venueStory.visitorsExperience}</div>
      </div>
    </div>
  );

  return (
    <>
      <MythologyTrigger
        label="Ecosystem story"
        onClick={handleClick}
        className={className}
        icon="🏛️"
      />
      
      <MythologyModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`${placeName} — Ecosystem Story`}
        content={formatVenueContent()}
      />
    </>
  );
}

/**
 * Seasonal Rhythm trigger - reveals current seasonal energies and activities
 */
export function SeasonalRhythmTrigger({ domain, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const season = getCurrentSeason();
  const currentRhythm = SEASONAL_RHYTHMS[season];
  
  if (!domain || domain === 'neutral' || !currentRhythm) return null;

  const handleClick = () => setIsOpen(true);

  const formatSeasonalContent = () => (
    <div className="space-y-6">
      <div className="text-center p-4 bg-stone-50 rounded-lg">
        <LocalSeasonalIndicator domain={domain} className="justify-center text-base" />
      </div>
      
      <div>
        <h3 className="text-lg font-bold text-stone-900 mb-3">
          {currentRhythm.name}
        </h3>
        <p className="text-stone-700 mb-4">{currentRhythm.energy}</p>
        <p className="italic text-stone-600">{currentRhythm.narrative}</p>
      </div>
      
      <div>
        <h3 className="text-lg font-bold text-stone-900 mb-3">Current Activities</h3>
        <p className="text-stone-700">{currentRhythm.activities}</p>
      </div>
      
      <div>
        <h3 className="text-lg font-bold text-stone-900 mb-3">Dominant Domains</h3>
        <div className="flex flex-wrap gap-2">
          {currentRhythm.dominantDomains.map((domainId) => (
            <span
              key={domainId}
              className="px-3 py-1 text-xs font-medium bg-stone-200 text-stone-700 rounded-full"
            >
              {domainId}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <MythologyTrigger
        label={`${season} rhythms`}
        onClick={handleClick}
        className={className}
        icon="🔄"
      />
      
      <MythologyModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`${currentRhythm.name} — Current Barcelona Ecosystem`}
        content={formatSeasonalContent()}
      />
    </>
  );
}

/**
 * Main mythology navigation component - provides access to all ecosystem stories
 */
export function MythologyNavigation({ domain, className = '' }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <EcosystemOriginTrigger domain={domain} />
      <SeasonalRhythmTrigger domain={domain} />
    </div>
  );
}