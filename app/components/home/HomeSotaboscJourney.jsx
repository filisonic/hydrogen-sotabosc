import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { JourneySpine } from './JourneySpine';
import {
  LayerCanopy,
  LayerUnderstory,
  LayerWater,
  LayerSoil,
  LayerBedrock,
} from '~/components/world/layers';
import { SpecimenOverlay } from '~/components/world/SpecimenOverlay';
import { PlaceCard } from '~/components/directory/PlaceCard';
import { EventCard } from '~/components/directory/EventCard';
import { useOrganismStore } from '~/lib/store/useOrganismStore';
import { getDomain, LISTING_CATEGORIES } from '~/lib/directory/domains';
import { directoryRoutes } from '~/lib/directory/routes';
import { getJourneyChapters } from '~/lib/home/journeyConfig';
import { resolveCreatorImageUrl } from '~/lib/directory/sceneVisuals';
import { useFilteredDirectory } from './useFilteredDirectory';
import { MOCK_SPECIMENS } from '~/lib/world/specimens';
import { MythologyNavigation } from '~/components/world/MythologyOverlay';

const TRAIL_STORAGE = 'sotabosc-trail-v1';

/** @param {unknown[]} arr @param {string} seed */
function shuffleWithSeed(arr, seed) {
  if (!arr?.length) return [];
  const out = [...arr];
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  for (let i = out.length - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) >>> 0;
    const j = h % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** @param {unknown[]} places @param {string[]|undefined} cats */
function placesInCategories(places, cats) {
  if (!cats?.length) return places;
  return places.filter((p) => p.categories?.some((c) => cats.includes(c)));
}

const LAYER_COMPONENTS = {
  canopy: LayerCanopy,
  understory: LayerUnderstory,
  water: LayerWater,
  soil: LayerSoil,
  bedrock: LayerBedrock,
};

/** Framed, scrollable listing stack inside each ecosystem layer */
function LayerListingPanel({ eyebrow, hint, children }) {
  return (
    <div className="rounded-xl border border-stone-200/85 bg-white/82 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_12px_40px_rgba(0,0,0,0.06)] backdrop-blur-md overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/70 px-3 py-2 md:px-4 md:py-2.5 bg-stone-100/65">
        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-stone-600">{eyebrow}</span>
        <span className="text-[10px] text-stone-500">{hint}</span>
      </div>
      <div className="max-h-[min(58vh,680px)] overflow-y-auto overscroll-contain px-3 py-3 md:px-4 md:py-4 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-stone-400/45">
        {children}
      </div>
    </div>
  );
}

function JourneyTrailBar({
  totalSteps,
  completedCount,
  onShuffle,
  themeLabel,
  storeDomain,
}) {
  return (
    <div
      className="sticky top-0 z-[110] flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b backdrop-blur-md"
      style={{
        borderColor: 'var(--sotabosc-border)',
        backgroundColor: 'color-mix(in srgb, var(--sotabosc-surface) 88%, transparent)',
        color: 'var(--sotabosc-text)',
        boxShadow: '0 10px 30px rgba(27, 67, 50, 0.06)',
      }}
    >
      <p className="text-[11px] md:text-xs font-semibold">
        <span className="opacity-60">Trail</span>{' '}
        <span style={{ color: 'var(--sotabosc-accent)' }}>
          {completedCount}/{totalSteps} nodes
        </span>
        {themeLabel ? <span className="opacity-70 font-normal"> · {themeLabel}</span> : null}
      </p>
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline text-[10px] opacity-50">Points & badges soon</span>
        <div className="flex items-center gap-2">
          <MythologyNavigation domain={themeLabel ? storeDomain : null} className="hidden md:flex" />
          <button
            type="button"
            onClick={onShuffle}
            className="text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-full border transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sotabosc-accent)] focus-visible:ring-offset-2"
            style={{ borderColor: 'var(--sotabosc-border)' }}
          >
            Different day's path
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Flowing scroll journey: listings live inside each layer’s hero (no separate bottom sheets).
 * GSAP-free — pace is yours. Optional daily shuffle + trail progress (local).
 *
 * @param {{
 *   directory: { places: unknown[]; events: unknown[]; creators: unknown[] };
 *   spineProducts?: Array<{ id: string; handle: string; title: string; featuredImage?: { url: string; altText?: string | null } | null }>;
 * }} props
 */
export function HomeSotaboscJourney({ directory, spineProducts = [] }) {
  const storeDomain = useOrganismStore((s) => s.organism?.domain ?? null);
  /** Visual atmosphere matches chosen organism domain (plants → greener canopy, etc.). */
  const visualDomain = storeDomain;
  const {
    filteredPlaces,
    filteredEvents,
    filteredCreators,
    showPersonalized,
    themeLabel,
  } = useFilteredDirectory(directory);

  const [selectedSpecimen, setSelectedSpecimen] = useState(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [shuffleNonce, setShuffleNonce] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(() => new Set());

  const dayKey = typeof Date !== 'undefined' ? new Date().toDateString() : '';
  const shuffleSeed = `${storeDomain ?? 'all'}-${dayKey}-${shuffleNonce}`;

  const shuffledPlaces = useMemo(
    () => shuffleWithSeed(filteredPlaces, `p-${shuffleSeed}`),
    [filteredPlaces, shuffleSeed],
  );
  const shuffledEvents = useMemo(
    () => shuffleWithSeed(filteredEvents, `e-${shuffleSeed}`),
    [filteredEvents, shuffleSeed],
  );
  const shuffledCreators = useMemo(
    () => shuffleWithSeed(filteredCreators, `c-${shuffleSeed}`),
    [filteredCreators, shuffleSeed],
  );

  /** Chronological baseline for events (shuffle picks a window, then re-sorted by date in embed). */
  const orderedEvents = useMemo(
    () =>
      [...filteredEvents].sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt)),
    [filteredEvents],
  );

  const placesById = useMemo(() => {
    const m = new Map();
    for (const p of filteredPlaces ?? []) {
      if (p?.id) m.set(p.id, p);
    }
    return m;
  }, [filteredPlaces]);

  const chapters = useMemo(() => getJourneyChapters(storeDomain), [storeDomain]);

  const spineCollectibles = useMemo(() => {
    const keys = ['electric-fern', 'bioluminescent-mycena', 'sky-spore', 'tide-lantern'];
    return keys
      .map((k) => MOCK_SPECIMENS[k])
      .filter(Boolean)
      .map((s) => ({
        id: s.id,
        href: s.productUrl,
        image: s.image,
        label: s.name,
        color: s.color,
      }));
  }, []);

  const handlers = {
    onSpecimenClick: (specimen) => {
      setSelectedSpecimen(specimen);
      setIsOverlayOpen(true);
    },
    onSpecimenHover: () => {},
  };

  const markStep = useCallback((stepId) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.add(stepId);
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(TRAIL_STORAGE, JSON.stringify([...next]));
        } catch {
          /* ignore */
        }
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(TRAIL_STORAGE);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) setCompletedSteps(new Set(arr));
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const observers = [];
    for (const ch of chapters) {
      const el = document.querySelector(`[data-journey-step="${ch.stepId}"]`);
      if (!el) continue;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
            markStep(ch.stepId);
          }
        },
        { threshold: [0.35, 0.5] },
      );
      io.observe(el);
      observers.push(io);
    }
    return () => observers.forEach((o) => o.disconnect());
  }, [chapters, markStep]);

  const buildHeroEmbed = (chapter) => {
    const lim = chapter.limit ?? 4;

    if (chapter.kind === 'places') {
      const picked = placesInCategories(shuffledPlaces, chapter.categoryFilter).slice(0, lim);
      const items = [...picked].sort((a, b) => a.name.localeCompare(b.name));
      return (
        <div className="text-left space-y-4">
          <p className="text-sm md:text-base text-stone-800 font-[family-name:var(--font-editorial)] leading-relaxed max-w-2xl">
            {chapter.narrative}
          </p>
          {items.length === 0 ? (
            <p className="text-xs text-stone-600">Nothing in this slice for your filter — try another domain.</p>
          ) : (
            <LayerListingPanel
              eyebrow="Places · this layer"
              hint={`${items.length} picks · A→Z`}
            >
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((place) => (
                  <PlaceCard key={place.id} place={place} tone="sceneInk" showMythology={true} />
                ))}
              </div>
            </LayerListingPanel>
          )}
        </div>
      );
    }
    if (chapter.kind === 'events') {
      const picked = shuffleWithSeed(orderedEvents, `ev-win-${shuffleSeed}-${chapter.stepId}`).slice(0, lim);
      const items = [...picked].sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));
      return (
        <div className="text-left space-y-4">
          <p className="text-sm md:text-base text-stone-800 font-[family-name:var(--font-editorial)] leading-relaxed max-w-2xl">
            {chapter.narrative}
          </p>
          {items.length === 0 ? (
            <p className="text-xs text-stone-600">No events in this filter right now.</p>
          ) : (
            <LayerListingPanel
              eyebrow="Events · soonest first"
              hint={`${items.length} in this scroll`}
            >
              <div className="flex flex-col gap-2.5">
                {items.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    place={placesById.get(event.placeId) ?? null}
                    tone="sceneInk"
                  />
                ))}
              </div>
            </LayerListingPanel>
          )}
        </div>
      );
    }
    if (chapter.kind === 'creators') {
      const picked = shuffledCreators.slice(0, lim);
      const items = [...picked].sort((a, b) => a.displayName.localeCompare(b.displayName));
      return (
        <div className="text-left space-y-4">
          <p className="text-sm md:text-base text-stone-800 font-[family-name:var(--font-editorial)] leading-relaxed max-w-2xl">
            {chapter.narrative}
          </p>
          {items.length === 0 ? (
            <p className="text-xs text-stone-600">No creators in this filter yet.</p>
          ) : (
            <LayerListingPanel eyebrow="Creators · this trail" hint={`${items.length} profiles · A→Z`}>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((creator) => {
                  const d = getDomain(creator.primaryDomain);
                  const img = resolveCreatorImageUrl(creator);
                  return (
                    <Link
                      key={creator.id}
                      to={`/city/creators/${creator.slug}`}
                      className="group flex gap-3 overflow-hidden rounded-xl border border-stone-200/90 bg-white/90 p-2.5 shadow-md shadow-stone-900/10 ring-1 ring-stone-900/5 transition-colors hover:border-stone-300 hover:bg-white"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-stone-200/80">
                        {img ? (
                          <img
                            src={img}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div
                            className="flex h-full w-full items-center justify-center text-xl"
                            style={{ backgroundColor: `${d.color}22` }}
                          >
                            {d.emoji}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                          {d.emoji} {d.label}
                        </p>
                        <p className="text-sm font-bold leading-tight text-stone-900 line-clamp-2">{creator.displayName}</p>
                        <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-stone-600">{creator.bio}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </LayerListingPanel>
          )}
        </div>
      );
    }
    if (chapter.kind === 'hub') {
      return (
        <div className="text-left space-y-4">
          <p className="text-sm md:text-base text-stone-800 font-[family-name:var(--font-editorial)] leading-relaxed max-w-2xl">
            {chapter.narrative}
          </p>
          <LayerListingPanel eyebrow="Open the directory" hint="Categories & shortcuts">
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(LISTING_CATEGORIES).map(([key, meta]) => (
                <Link
                  key={key}
                  to={directoryRoutes.category(key)}
                  className="text-[10px] font-semibold px-2.5 py-1.5 rounded-full border border-stone-200/90 bg-stone-50/90 text-stone-800 hover:bg-stone-100 transition-colors"
                >
                  {meta.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 pt-4">
              <Link
                to={directoryRoutes.city()}
                className="text-xs font-bold px-4 py-2.5 rounded-full text-white"
                style={{ backgroundColor: 'var(--sotabosc-accent)' }}
              >
                City hub
              </Link>
              <Link
                to={directoryRoutes.events()}
                className="text-xs font-bold px-4 py-2.5 rounded-full border border-stone-300 text-stone-800 hover:bg-stone-100 transition-colors"
              >
                All events
              </Link>
            </div>
          </LayerListingPanel>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      data-stitch-id="forest-stage"
      className="scroll-world-container relative bg-stone-100"
      data-scroll-domain={storeDomain ?? 'neutral'}
      data-visual-tone="ink"
    >
      <div className="scroll-world-domain-tint pointer-events-none fixed inset-0 z-[1]" aria-hidden />

      <JourneyTrailBar
        totalSteps={chapters.length}
        completedCount={completedSteps.size}
        themeLabel={showPersonalized ? themeLabel : null}
        storeDomain={storeDomain}
        onShuffle={() => {
          setShuffleNonce((n) => n + 1);
          setCompletedSteps(new Set());
          if (typeof localStorage !== 'undefined') {
            try {
              localStorage.removeItem(TRAIL_STORAGE);
            } catch {
              /* ignore */
            }
          }
        }}
      />

      <div className="relative z-10">
        {chapters.map((chapter, index) => {
          const Layer = LAYER_COMPONENTS[chapter.layer];
          if (!Layer) return null;
          const heroEmbed = buildHeroEmbed(chapter);
          const prev = index > 0 ? chapters[index - 1] : null;
          return (
            <Fragment key={chapter.stepId}>
              {prev ? (
                <JourneySpine
                  stepIndex={index}
                  totalSteps={chapters.length}
                  fromLayer={prev.layer}
                  toLayer={chapter.layer}
                  domainKey={storeDomain}
                  tone="ink"
                  shopProducts={spineProducts}
                  collectibles={spineCollectibles}
                />
              ) : null}
              <motion.section
                data-journey-step={chapter.stepId}
                id={chapter.layer}
                className="relative flex min-h-[min(88dvh,820px)] flex-col scroll-mt-2 border-b border-stone-200/70"
                initial={{ opacity: 0.72, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.12, margin: '-32px 0px' }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex flex-1 flex-col min-h-0 pt-2 md:pt-4">
                  <Layer
                    {...handlers}
                    title={chapter.title}
                    description={chapter.description}
                    heroEmbed={heroEmbed}
                    visualDomain={visualDomain}
                    className="flex-1 min-h-0 flex flex-col"
                  />
                </div>
              </motion.section>
            </Fragment>
          );
        })}
      </div>

      <SpecimenOverlay
        specimen={selectedSpecimen}
        isOpen={isOverlayOpen}
        onClose={() => {
          setIsOverlayOpen(false);
        }}
      />
    </div>
  );
}
