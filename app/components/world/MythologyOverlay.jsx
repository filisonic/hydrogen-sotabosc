/**
 * Mythology Overlay Component
 * Integrates the Barcelona ecosystem mythology deeply into the user journey
 */

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ECOSYSTEM_MYTHOLOGY, SEASONAL_RHYTHMS } from '~/lib/worldbuilding/ecosystemNarrative';
import { normalizeDomain } from '~/lib/directory/domains';
import { getVenueEcosystemStory } from '~/lib/worldbuilding/placeNarratives';
import { getCurrentSeason } from '~/lib/worldbuilding/ecosystemTheme';

function LocalSeasonalIndicator({ domain, className = '' }) {
  const season = getCurrentSeason();
  const seasonEmojis = {
    spring: '🌱',
    summer: '☀️',
    autumn: '🍂',
    winter: '❄️',
  };

  return (
    <div className={`inline-flex items-center gap-2 text-xs text-stone-600 ${className}`}>
      <span className="text-sm">{seasonEmojis[season]}</span>
      <span className="font-medium capitalize">{season}</span>
    </div>
  );
}

function MythologyModal({ isOpen, onClose, content, title }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, handleClose]);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            type="button"
            className="absolute inset-0 bg-stone-900/55 backdrop-blur-[2px] cursor-default"
            aria-label="Close dialog"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mythology-modal-title"
            className="relative z-[1] w-full sm:max-w-2xl max-h-[min(88dvh,720px)] flex flex-col overflow-hidden bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-stone-200"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-stone-200 bg-white px-4 py-3 sm:px-6 sm:py-4 shrink-0">
              <h2 id="mythology-modal-title" className="text-lg sm:text-xl font-bold text-stone-900 pr-2">
                {title}
              </h2>
              <button
                type="button"
                onClick={handleClose}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-full border-2 border-stone-900 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 hover:bg-stone-800 transition-colors"
              >
                <span aria-hidden>×</span>
                Close
              </button>
            </div>

            <div className="overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 sm:py-6 flex-1">
              <div className="prose prose-stone max-w-none text-stone-700 leading-relaxed text-sm sm:text-base">
                {content}
              </div>
            </div>

            <div className="shrink-0 border-t border-stone-200 bg-stone-50 px-4 py-3 sm:px-6 flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full border-2 border-stone-300 text-stone-800 hover:bg-white transition-colors"
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

function MythologyTrigger({ label, onClick, className = '', icon = '📖' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border border-stone-300/90 bg-white/95 text-stone-800 hover:bg-white hover:border-stone-500 transition-colors ${className}`}
    >
      <span className="text-sm">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export function EcosystemOriginTrigger({ domain, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!domain || domain === 'neutral') return null;

  const domainToMythology = {
    plants: 'canopy',
    animals: 'canopy',
    algae: 'water',
    fungi: 'soil',
    earth: 'soil',
  };

  const normalized = normalizeDomain(domain);
  const mythologyKey = normalized ? domainToMythology[normalized] : null;
  if (!mythologyKey) return null;

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
      <MythologyTrigger label="Origin story" onClick={() => setIsOpen(true)} className={className} icon="🌱" />
      <MythologyModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="The Barcelona Ecosystem Awakening"
        content={formatMythologyContent()}
      />
    </>
  );
}

export function VenueStoryTrigger({ placeSlug, placeName, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const venueStory = getVenueEcosystemStory(placeSlug);

  if (!venueStory) return null;

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
        onClick={() => setIsOpen(true)}
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

export function SeasonalRhythmTrigger({ domain, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const season = getCurrentSeason();
  const currentRhythm = SEASONAL_RHYTHMS[season];

  if (!domain || domain === 'neutral' || !currentRhythm) return null;

  const formatSeasonalContent = () => (
    <div className="space-y-6">
      <div className="text-center p-4 bg-stone-50 rounded-lg">
        <LocalSeasonalIndicator domain={domain} className="justify-center text-base" />
      </div>

      <div>
        <h3 className="text-lg font-bold text-stone-900 mb-3">{currentRhythm.name}</h3>
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
        onClick={() => setIsOpen(true)}
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

export function MythologyNavigation({ domain, className = '' }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <EcosystemOriginTrigger domain={domain} />
      <SeasonalRhythmTrigger domain={domain} />
    </div>
  );
}
