import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { SpecimenOverlay } from '~/components/world/SpecimenOverlay';
import { CITY_FINDS, specimenForFind } from '~/lib/city/finds';
import { ARENA, KINGDOMS_BY_KEY, PLAZA, kingdomCentre, planToWorld } from '~/lib/city/kingdoms';
import {
  PASSPORT_RULES,
  collectibleState,
  kingdomProgress,
  placeVisits,
} from '~/lib/city/passport/rules';
import { usePassportStore } from '~/lib/city/passport/usePassportStore';
import { cityLightMode, formatBarcelonaTime } from '~/lib/city/symbiosis';
import { useLiveCityContext } from '~/lib/city/useLiveCityContext';
import { eventPulse, pulseLabel } from '~/lib/directory/eventWhen';
import { useOrganismStore } from '~/lib/store/useOrganismStore';
import {
  ArenaPanel,
  CitizenPanel,
  EventPanel,
  FindPanel,
  PlazaPanel,
  StirringPanel,
  VacantPanel,
} from './CityPanels';
import { CityRoom } from './CityRoom';

const CityScene3D = lazy(() => import('./CityScene3D'));

/** Kingdoms in feed order: the route the tour flies and the order of the places list. */
const KINGDOM_ORDER = (() => {
  const order = [];
  let key = 'earth';
  while (!order.includes(key)) {
    order.push(key);
    key = KINGDOMS_BY_KEY[key].feeds;
  }
  return order;
})();

/** The guided flight: every kingdom in the order it feeds the next, by way of the plaza, out to the Arena. */
const TOUR = [
  ...KINGDOM_ORDER.slice(0, 3).map((key) => ({ kind: 'kingdom', key })),
  { kind: 'plaza' },
  ...KINGDOM_ORDER.slice(3).map((key) => ({ kind: 'kingdom', key })),
  { kind: 'arena' },
];
const TOUR_SECONDS = 9;

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function tourShot(stop, index, lift) {
  if (stop.kind === 'plaza') {
    return { key: 'tour-plaza', target: planToWorld(PLAZA.x, PLAZA.y), radius: 21, phi: 0.95, theta: 0.4, lift };
  }
  if (stop.kind === 'arena') {
    return { key: 'tour-arena', target: planToWorld(ARENA.x, ARENA.y), radius: 25, phi: 1.05, theta: 0.75, lift };
  }
  const c = kingdomCentre(stop.key);
  // Swing round a little at every stop so the flight reads as travel, not a slideshow.
  return { key: `tour-${stop.key}`, target: planToWorld(c.x, c.y), radius: 27, phi: 1.02, theta: index * 0.8 - 0.9, lift };
}

function tourCaption(stop) {
  if (stop.kind === 'plaza') {
    return {
      color: '#1a1a1a',
      tag: 'The centre',
      title: PLAZA.name,
      body: 'Where the five kingdoms meet. The city’s shared screen stands here, and the store that sells what plays on it.',
    };
  }
  if (stop.kind === 'arena') {
    return {
      color: KINGDOMS_BY_KEY[ARENA.kingdom].color,
      tag: 'On the water',
      title: ARENA.name,
      body: 'The city’s stadium for online events. Whatever is live here plays on every citizen’s screen.',
    };
  }
  const k = KINGDOMS_BY_KEY[stop.key];
  return {
    color: k.color,
    tag: `${k.emoji} ${k.role}`,
    title: k.name,
    body: `${k.promise} It feeds ${KINGDOMS_BY_KEY[k.feeds].name}.`,
  };
}

/**
 * The homepage: the 3D city, full screen, with nothing below it. Tap a building to
 * meet the business and step inside; take the tour to be flown through the kingdoms.
 * Everything explanatory lives on /how-it-works and /screens.
 *
 * @param {{
 *   citizens: any[];
 *   events?: any[];
 *   totalPlots: number;
 *   context?: { nowISO: string; weather: null | { temperature: number; summary: string; wet: boolean } };
 * }} props
 */
export function CityStage({ citizens, events = [], totalPlots, context }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selection, setSelection] = useState(null);
  const [webgl, setWebgl] = useState(null);
  const [preview, setPreview] = useState(null);
  const [tour, setTour] = useState(null);
  const [listOpen, setListOpen] = useState(false);
  const [intro, setIntro] = useState(true);
  const [inside, setInside] = useState(null);
  const [surfaced, setSurfaced] = useState(null);
  const [tick, setTick] = useState(0);
  const [narrow, setNarrow] = useState(false);
  const [still, setStill] = useState(false);
  const [visible, setVisible] = useState(true);
  const controlsApi = useRef(null);

  const live = useLiveCityContext(context);
  const peekSlug = searchParams.get('event');
  // `/?stats` shows what the 3D scene costs; `/?stats=live-shadows` redraws shadows every frame, for comparison.
  const stats = searchParams.get('stats');
  const discoveredSpecimens = useOrganismStore((s) => s.discoveredSpecimens);
  const addDiscovery = useOrganismStore((s) => s.addDiscovery);
  const visits = usePassportStore((s) => s.visits);
  const recordVisit = usePassportStore((s) => s.recordVisit);
  const recordCollect = usePassportStore((s) => s.recordCollect);

  const weather = live.weather ?? context?.weather ?? null;
  const clock = formatBarcelonaTime(live.now);
  const liveMode = cityLightMode(live.now);
  const mode = preview ?? liveMode;
  const openPlots = totalPlots - citizens.length;

  useEffect(() => {
    setWebgl(hasWebGL());
    const small = window.matchMedia('(max-width: 859px)');
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      setNarrow(small.matches);
      setStill(calm.matches);
    };
    sync();
    small.addEventListener('change', sync);
    calm.addEventListener('change', sync);
    const onVisibility = () => setVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      small.removeEventListener('change', sync);
      calm.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 5000);
    return () => window.clearInterval(id);
  }, []);

  const liveEvents = useMemo(
    () => events.map((event) => ({ ...event, pulse: eventPulse(event, live.now) })),
    [events, live.now],
  );

  const plotMap = useMemo(() => {
    const map = new Map();
    for (const c of citizens) map.set(`${c.kingdom}:${c.plot}`, c);
    return map;
  }, [citizens]);

  // Passport: what this visitor has walked, per kingdom.
  const passport = useMemo(
    () => Object.fromEntries(KINGDOM_ORDER.map((key) => [key, kingdomProgress(visits, key)])),
    [visits],
  );

  const finds = useMemo(
    () =>
      CITY_FINDS.map((find) => {
        const collected = discoveredSpecimens.includes(find.specimenId);
        const state = find.kingdom
          ? collectibleState(passport[find.kingdom], collected)
          : collected
            ? 'collected'
            : 'surfaced';
        return { ...find, state };
      }),
    [passport, discoveredSpecimens],
  );

  const choose = (sel) => {
    setTour(null);
    setIntro(false);
    setListOpen(false);
    setSelection(sel);
  };

  const clearSelection = () => {
    setSelection(null);
    if (searchParams.has('event')) {
      const next = new URLSearchParams(searchParams);
      next.delete('event');
      setSearchParams(next, { replace: true, preventScrollReset: true });
    }
  };

  useEffect(() => {
    if (!peekSlug) return;
    setIntro(false);
    setSelection({ type: 'event', slug: peekSlug });
  }, [peekSlug]);

  const selectedCitizen =
    selection?.type === 'citizen' ? citizens.find((c) => c.slug === selection.slug) : null;
  const selectedEvent =
    selection?.type === 'event' ? liveEvents.find((e) => e.slug === selection.slug) : null;
  const selectedFind = selection?.type === 'find' ? finds.find((f) => f.id === selection.id) : null;
  const findOpen = Boolean(selectedFind) && selectedFind.state !== 'stirring' && selectedFind.state !== 'hidden';
  const selectedSpecimen = findOpen ? specimenForFind(selectedFind) : null;
  const eventHost = selectedEvent?.placeSlug ? citizens.find((c) => c.slug === selectedEvent.placeSlug) : null;

  const focusKingdom =
    tour != null
      ? (TOUR[tour].key ?? null)
      : (selectedCitizen?.kingdom ??
        selectedEvent?.kingdom ??
        selectedFind?.kingdom ??
        (selection?.type === 'vacant' ? selection.kingdom : null));

  // Opening a citizen on the map is a visit: once per place per Barcelona day.
  const visitSlug = selectedCitizen?.slug;
  const visitKingdom = selectedCitizen?.kingdom;
  useEffect(() => {
    if (visitSlug) recordVisit(visitSlug, visitKingdom, 'map');
  }, [visitSlug, visitKingdom, recordVisit]);

  const pickedUp = findOpen ? selectedFind : null;
  useEffect(() => {
    if (!pickedUp?.specimenId) return;
    addDiscovery(pickedUp.specimenId);
    recordCollect(pickedUp.id, pickedUp.kingdom);
  }, [pickedUp?.id, pickedUp?.specimenId, pickedUp?.kingdom, addDiscovery, recordCollect]);

  // Tell the visitor the moment a kingdom's collectible comes up.
  const unlockedKey = KINGDOM_ORDER.filter((key) => passport[key].unlocked).join(',');
  const seenUnlocked = useRef(null);
  useEffect(() => {
    const now = unlockedKey ? unlockedKey.split(',') : [];
    const before = seenUnlocked.current;
    seenUnlocked.current = now;
    if (!before) return;
    const fresh = now.find((key) => !before.includes(key));
    if (fresh) setSurfaced(fresh);
  }, [unlockedKey]);

  // The tour moves on by itself; touching the city hands the camera back.
  useEffect(() => {
    if (tour == null) return undefined;
    const id = window.setTimeout(
      () => setTour((n) => (n == null || n + 1 >= TOUR.length ? null : n + 1)),
      TOUR_SECONDS * 1000,
    );
    return () => window.clearTimeout(id);
  }, [tour]);

  // Where the camera should be looking.
  // A panel opens beside the subject on wide screens and below it on phones.
  const aside = narrow ? { lift: 0.2 } : { shift: 0.17 };
  let shot = null;
  if (tour != null) {
    shot = tourShot(TOUR[tour], tour, narrow ? 0.12 : 0);
  } else if (selection) {
    const key = JSON.stringify(selection);
    const plot = (kingdom, index) => planToWorld(...KINGDOMS_BY_KEY[kingdom].plots[index]);
    if (selectedCitizen) shot = { key, target: plot(selectedCitizen.kingdom, selectedCitizen.plot), radius: 21, phi: 0.84, ...aside };
    else if (selection.type === 'vacant') shot = { key, target: plot(selection.kingdom, selection.plot), radius: 21, phi: 0.84, ...aside };
    else if (selection.type === 'arena') shot = { key, target: planToWorld(ARENA.x, ARENA.y), radius: 25, phi: 0.95, ...aside };
    else if (selection.type === 'plaza') shot = { key, target: planToWorld(PLAZA.x, PLAZA.y), radius: 22, phi: 0.9, ...aside };
    else if (selectedFind) shot = { key, target: planToWorld(selectedFind.x, selectedFind.y), radius: 17, phi: 0.9, ...aside };
    else if (eventHost) shot = { key, target: plot(eventHost.kingdom, eventHost.plot), radius: 21, phi: 0.84, ...aside };
    else if (selectedEvent) {
      const c = kingdomCentre(selectedEvent.kingdom);
      shot = { key, target: planToWorld(c.x, c.y), radius: 28, phi: 0.95, ...aside };
    }
  }

  const soon = liveEvents.filter((e) => e.pulse !== 'later').slice(0, 6);
  const ticking = soon.length ? soon[tick % soon.length] : null;

  let panel = null;
  if (selectedEvent) {
    panel = <EventPanel event={selectedEvent} onSelect={choose} />;
  } else if (selectedFind && selectedSpecimen) {
    panel = (
      <FindPanel
        find={selectedFind}
        specimen={selectedSpecimen}
        already={discoveredSpecimens.includes(selectedFind.specimenId)}
      />
    );
  } else if (selectedFind?.state === 'stirring') {
    panel = <StirringPanel kingdomKey={selectedFind.kingdom} progress={passport[selectedFind.kingdom]} />;
  } else if (selectedCitizen) {
    panel = (
      <CitizenPanel
        citizen={selectedCitizen}
        citizens={citizens}
        events={liveEvents}
        onSelect={choose}
        onEnter={setInside}
        progress={passport[selectedCitizen.kingdom]}
        days={placeVisits(visits, selectedCitizen.slug)}
      />
    );
  } else if (selection?.type === 'vacant') {
    panel = <VacantPanel kingdomKey={selection.kingdom} openCount={selection.openCount} />;
  } else if (selection?.type === 'arena') {
    panel = <ArenaPanel />;
  } else if (selection?.type === 'plaza') {
    panel = <PlazaPanel citizens={citizens} totalPlots={totalPlots} events={liveEvents} onSelect={choose} />;
  }

  const caption = tour != null ? tourCaption(TOUR[tour]) : null;
  const showList = listOpen || webgl === false;

  const places = (
    <div className="city-places" id="city-places">
      <div className="city-places__head">
        <strong>Places in the city</strong>
        {webgl === false ? null : (
          <button type="button" className="city-map__close" onClick={() => setListOpen(false)} aria-label="Close list">
            ×
          </button>
        )}
      </div>
      {KINGDOM_ORDER.map((key) => {
        const k = KINGDOMS_BY_KEY[key];
        const here = citizens.filter((c) => c.kingdom === key);
        const walked = Math.min(passport[key].places, PASSPORT_RULES.distinctPlaces);
        return (
          <section key={key} style={{ '--k': k.color }}>
            <h3>
              {k.emoji} {k.name}
              <span>
                {passport[key].unlocked ? 'collectible surfaced' : `${walked}/${PASSPORT_RULES.distinctPlaces} walked`}
              </span>
            </h3>
            <ul>
              {here.map((c) => (
                <li key={c.slug}>
                  <button
                    type="button"
                    aria-pressed={selectedCitizen?.slug === c.slug}
                    onClick={() => choose({ type: 'citizen', slug: c.slug })}
                  >
                    {c.name}
                    {c.happening ? <em>on this week</em> : null}
                  </button>
                </li>
              ))}
              <li>
                <Link to={`/city/claim?kingdom=${key}`}>
                  {k.plots.length - here.length} open plot{k.plots.length - here.length === 1 ? '' : 's'} →
                </Link>
              </li>
            </ul>
          </section>
        );
      })}
      <section>
        <h3>Landmarks</h3>
        <ul>
          <li>
            <button type="button" onClick={() => choose({ type: 'plaza' })}>
              {PLAZA.name}
            </button>
          </li>
          <li>
            <button type="button" onClick={() => choose({ type: 'arena' })}>
              {ARENA.name}
            </button>
          </li>
        </ul>
      </section>
    </div>
  );

  return (
    <section id="city-map" className={`city-stage city-stage--${mode}`} aria-label="The city of Sotabosc, live">
      {webgl ? (
        <Suspense fallback={<p className="city-stage__loading">Raising the city…</p>}>
          <CityScene3D
            citizens={citizens}
            plotMap={plotMap}
            selection={selection}
            onSelect={(sel) => (sel == null ? clearSelection() : choose(sel))}
            mode={mode}
            raining={Boolean(weather?.wet) && !preview}
            running={visible && !inside}
            controlsApi={controlsApi}
            shot={shot}
            focusKingdom={focusKingdom}
            finds={finds}
            still={still}
            stats={stats}
            onUserMove={() => {
              setTour(null);
              setIntro(false);
            }}
          />
        </Suspense>
      ) : webgl === false ? (
        <p className="city-stage__loading">
          This browser can’t draw the 3D city, so here is the same city as a list.
        </p>
      ) : null}

      <div className={`city-stage__title${intro ? '' : ' is-small'}`}>
        <p className="city-hero__kicker">
          <span className="city-hero__pulse" aria-hidden="true" />
          Live · Barcelona {clock}
          {weather ? ` · ${Math.round(weather.temperature)}° ${weather.summary}` : ''}
        </p>
        <h1 className="city-hero__title">
          A living city <span>that remembers.</span>
        </h1>
        <p className="city-stage__sub">
          Every building is a real Barcelona business. Tap one to meet it and step inside, or let the
          tour fly you through the five kingdoms.
        </p>
        <div className="city-hero__cta">
          {webgl ? (
            <button
              type="button"
              className="mag-btn"
              onClick={() => {
                setSelection(null);
                setIntro(false);
                setTour(0);
              }}
            >
              Take the tour
            </button>
          ) : null}
          <Link to="/how-it-works" className="mag-btn-o">
            How it works
          </Link>
          <Link to="/city/claim" className="mag-btn-o">
            Claim one of {openPlots} plots
          </Link>
        </div>
      </div>

      {webgl ? (
        <div className="city-stage__tools">
          <div className="city-3d__modes" role="group" aria-label="Light">
            {[
              ['day', '☀', 'Day'],
              ['dusk', '◐', 'Dusk'],
              ['night', '☾', 'Night'],
            ].map(([key, glyph, label]) => (
              <button
                key={key}
                type="button"
                aria-pressed={mode === key}
                aria-label={label}
                title={key === liveMode ? `${label} · live in Barcelona now` : label}
                onClick={() => setPreview(key === liveMode ? null : key)}
              >
                {glyph}
              </button>
            ))}
          </div>
          <button type="button" className="city-stage__zoom" onClick={() => controlsApi.current?.zoom(1)} aria-label="Zoom in">
            +
          </button>
          <button type="button" className="city-stage__zoom" onClick={() => controlsApi.current?.zoom(-1)} aria-label="Zoom out">
            −
          </button>
          <button type="button" aria-expanded={listOpen} aria-controls="city-places" onClick={() => setListOpen((v) => !v)}>
            Places
          </button>
        </div>
      ) : null}

      {showList ? places : null}

      {caption ? (
        <div className="city-stage__caption" style={{ '--k': caption.color }} aria-live="polite">
          <span className="city-panel__tag">
            {caption.tag} · {tour + 1}/{TOUR.length}
          </span>
          <h2>{caption.title}</h2>
          <p>{caption.body}</p>
          <div className="city-stage__caption-nav">
            <button type="button" onClick={() => setTour((n) => Math.max(0, n - 1))} disabled={tour === 0}>
              ← Back
            </button>
            <button type="button" onClick={() => setTour((n) => (n + 1 >= TOUR.length ? null : n + 1))}>
              {tour + 1 >= TOUR.length ? 'Finish' : 'Next →'}
            </button>
            <button type="button" onClick={() => setTour(null)}>
              Stop
            </button>
          </div>
          <span key={tour} className="city-stage__caption-timer" style={{ animationDuration: `${TOUR_SECONDS}s` }} />
        </div>
      ) : null}

      {ticking && !caption && !panel ? (
        <button type="button" className="city-stage__ticker" onClick={() => choose({ type: 'event', slug: ticking.slug })}>
          <span className="city-hero__pulse" aria-hidden="true" />
          {pulseLabel(ticking.pulse)} · {ticking.title} →
        </button>
      ) : null}

      {stats != null ? <output id="city-stats" className="city-stage__stats" /> : null}

      {surfaced ? (
        <div className="city-stage__toast" role="status">
          <p>
            <strong>A collectible surfaced in {KINGDOMS_BY_KEY[surfaced].name}.</strong> You walked it, so it is
            on the map now.
          </p>
          <button
            type="button"
            className="mag-btn"
            onClick={() => {
              const find = finds.find((f) => f.kingdom === surfaced);
              setSurfaced(null);
              if (find) choose({ type: 'find', id: find.id });
            }}
          >
            Pick it up
          </button>
          <button type="button" className="city-map__close" onClick={() => setSurfaced(null)} aria-label="Dismiss">
            ×
          </button>
        </div>
      ) : null}

      <div className="city-map__panel" aria-live="polite" hidden={!panel}>
        {panel ? (
          <button type="button" className="city-map__close" onClick={clearSelection} aria-label="Close">
            ×
          </button>
        ) : null}
        {panel}
      </div>

      {inside ? <CityRoom citizen={inside} events={liveEvents} onLeave={() => setInside(null)} /> : null}

      <SpecimenOverlay
        specimen={selectedSpecimen}
        isOpen={Boolean(selectedFind && selectedSpecimen)}
        onClose={clearSelection}
      />
    </section>
  );
}
