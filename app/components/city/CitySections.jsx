import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ARENA_FORMATS } from '~/lib/city/arena';
import { ARENA, KINGDOMS, KINGDOMS_BY_KEY } from '~/lib/city/kingdoms';
import { PASSPORT_RULES, kingdomProgress } from '~/lib/city/passport/rules';
import { usePassportStore } from '~/lib/city/passport/usePassportStore';
import { barcelonaDaypart, cityLightMode, formatBarcelonaTime } from '~/lib/city/symbiosis';
import { useLiveCityContext } from '~/lib/city/useLiveCityContext';

/** The explanatory sections that used to sit under the homepage map (now /how-it-works and /screens). */

const LAST_VISIT_KEY = 'sotabosc:city:last-visit';

const PILLARS = [
  {
    title: 'Always on',
    body: "Runs on Barcelona's clock and weather. When the lamps come on in Poblenou, they come on here.",
  },
  {
    title: 'Your plot stays yours',
    body: 'Claim a plot and it keeps your building, your screen and your place on the map.',
  },
  {
    title: 'It remembers',
    body: 'Every show, drop and collaboration leaves a trace, so the city grows richer with each visit.',
  },
];

const LIGHTS = {
  day: 'Streets in daylight',
  dusk: 'Lamps coming on',
  night: 'City lit up · the Arena glows over the water',
};

const SIDES = [
  {
    tag: 'For businesses',
    title: 'A screen that works for the whole street',
    body: 'Your own messages by daypart and weather, plus your neighbours. They promote you back. Every slide carries a code, so each kingdom can see the visits it sends to the others.',
  },
  {
    tag: 'For artists',
    title: 'Your work, between the menus',
    body: 'City artists play as screensavers across every citizen. Each piece links to the Sotabosc store: prints, originals and phygital editions that pair a physical object with its screen version.',
  },
  {
    tag: 'For events',
    title: 'Festivals become part of a kingdom',
    body: 'Events and festivals rent the same screens for their run. Each one belongs to a kingdom, so its audience flows back into the city after it ends.',
  },
];

const CHRONICLES = [
  {
    tag: 'Film series',
    title: 'Kingdom portraits',
    body: 'Short films shot inside each citizen. They premiere on the city screens first, then everywhere else.',
  },
  {
    tag: 'On screen',
    title: 'Street editions',
    body: 'Weekly edits of what is happening in each kingdom, cut for vertical, horizontal and in-store screens.',
  },
  {
    tag: 'Journal',
    title: 'City chronicles',
    body: 'The written record of the city: new citizens, residencies, collaborations between kingdoms.',
    to: '/blogs/journal',
  },
];

function describeAbsence(ms) {
  const hours = Math.floor(ms / 3_600_000);
  if (hours < 1) return null;
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'}`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'}`;
}

/** Remembers the visitor's last walk through the city (this browser only). */
function useLastVisit() {
  const [message, setMessage] = useState(null);
  useEffect(() => {
    try {
      const previous = Number(window.localStorage.getItem(LAST_VISIT_KEY));
      window.localStorage.setItem(LAST_VISIT_KEY, String(Date.now()));
      if (!previous) {
        setMessage('First walk here. The city will remember you next time.');
        return;
      }
      const away = describeAbsence(Date.now() - previous);
      setMessage(away ? `Welcome back. The city kept going for ${away} since your last walk.` : 'Welcome back.');
    } catch {
      setMessage(null);
    }
  }, []);
  return message;
}

/**
 * What Sotabosc is, plus the live status card.
 *
 * @param {{ citizenCount: number; totalPlots: number; eventCount: number; context: any }} props
 */
export function CityIntro({ citizenCount, totalPlots, eventCount, context }) {
  const { now, weather } = useLiveCityContext(context);
  const lastVisit = useLastVisit();
  return (
    <section className="city-section city-intro">
      <div>
        <span className="city-section__tag">Sotabosc · a persistent city inside Barcelona</span>
        <h1 className="city-section__title">A city that keeps going when you leave</h1>
        <p className="city-section__lede">
          Sotabosc is built from real Barcelona businesses in five kingdoms. It runs on Barcelona&apos;s own
          clock and weather, keeps going after you leave, and holds on to what happens here: every plot
          claimed, show played and artwork collected.
        </p>
        <p className="city-block city-block--rule">
          <strong>Founding rule</strong> All for one, one for all: every citizen&apos;s screen promotes its
          neighbours.
        </p>
        <div className="city-hero__cta">
          <Link to="/" className="mag-btn">
            ← Back to the city
          </Link>
          <Link to="/screens" className="mag-btn-o">
            The screens
          </Link>
          <Link to="/city/claim" className="mag-btn-o">
            Claim a plot
          </Link>
        </div>
      </div>

      <div className="city-status" role="complementary" aria-label="Right now in Sotabosc">
        <p className="city-status__tag">
          <span className="city-hero__pulse" aria-hidden="true" /> Right now in Sotabosc
        </p>
        <p className="city-status__clock">
          <strong suppressHydrationWarning>{formatBarcelonaTime(now)}</strong>
          <span suppressHydrationWarning>
            Barcelona · {barcelonaDaypart(now)}
            {weather ? ` · ${Math.round(weather.temperature)}° ${weather.summary}` : ''}
          </span>
        </p>
        <dl className="city-status__grid">
          <div>
            <dt>Kingdoms</dt>
            <dd>{KINGDOMS.length}</dd>
          </div>
          <div>
            <dt>Founding citizens</dt>
            <dd>{citizenCount}</dd>
          </div>
          <div>
            <dt>Open plots</dt>
            <dd>{totalPlots - citizenCount}</dd>
          </div>
          <div>
            <dt>Gatherings</dt>
            <dd>{eventCount}</dd>
          </div>
        </dl>
        <p className="city-status__line" suppressHydrationWarning>
          {LIGHTS[cityLightMode(now)]}
        </p>
        <p className="city-status__line city-status__line--muted">
          {lastVisit ?? 'The city is open. Walk in any time.'}
        </p>
      </div>
    </section>
  );
}

export function CityPillars() {
  return (
    <section className="city-section">
      <div className="city-grid city-grid--3">
        {PILLARS.map((p) => (
          <article key={p.title} className="city-block">
            <h3>{p.title}</h3>
            <p>{p.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/** The five kingdoms in feed order, with this visitor's passport progress on each. */
export function CityKingdoms() {
  const visits = usePassportStore((s) => s.visits);
  // The passport lives in localStorage, so it is only known after hydration.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const order = [];
  for (let key = 'earth'; !order.includes(key); key = KINGDOMS_BY_KEY[key].feeds) order.push(key);

  return (
    <section className="city-section">
      <div className="city-section__head">
        <span className="city-section__tag">How the city works</span>
        <h2 className="city-section__title">Each kingdom feeds the next</h2>
        <p className="city-section__lede">
          Businesses don&apos;t compete for the same customers here. They pass people along: morning coffee
          leads to the studio, the studio to the lab, the lab to the stage, the stage to recovery, and back
          to coffee.
        </p>
      </div>
      <ol className="city-grid city-grid--5">
        {order.map((key) => {
          const k = KINGDOMS_BY_KEY[key];
          const progress = ready ? kingdomProgress(visits, key) : null;
          const walked = Math.min(progress?.places ?? 0, PASSPORT_RULES.distinctPlaces);
          return (
            <li key={key} className="city-block city-block--kingdom" style={{ '--k': k.color }}>
              <span className="city-block__tag">
                {k.emoji} {k.role}
              </span>
              <h3>{k.name}</h3>
              <p>{k.promise}</p>
              <span className="city-block__feeds">feeds {KINGDOMS_BY_KEY[k.feeds].name} →</span>
              <span className="city-block__pips">
                {Array.from({ length: PASSPORT_RULES.distinctPlaces }, (_, n) => (
                  <i key={n} className={n < walked || progress?.unlocked ? 'is-on' : ''} />
                ))}
                <em>{progress?.unlocked ? 'collectible surfaced' : `${walked}/${PASSPORT_RULES.distinctPlaces} places walked`}</em>
              </span>
            </li>
          );
        })}
      </ol>
      <p className="city-block city-block--rule city-passport-note">
        <strong>Your passport</strong> Each kingdom keeps one collectible. Walk into{' '}
        {PASSPORT_RULES.distinctPlaces} of its places, or come back to one on {PASSPORT_RULES.repeatVisits}{' '}
        different days, and it surfaces on the map for you to pick up.
      </p>
    </section>
  );
}

export function CityArena() {
  return (
    <section id="city-arena" className="city-arena">
      <div className="city-section">
        <div className="city-section__head">
          <span className="city-section__tag">🏟️ {ARENA.name}</span>
          <h2 className="city-section__title">The city&apos;s stadium for online events</h2>
          <p className="city-section__lede">
            The Arena sits on the water off The Commons. Each kingdom hosts a recurring show there, streamed
            from a real citizen&apos;s room. When the Arena is live, every citizen screen in the city carries the
            broadcast, and festivals can rent it for their run.
          </p>
        </div>
        <ul className="city-grid city-grid--5">
          {ARENA_FORMATS.map((f) => {
            const k = KINGDOMS_BY_KEY[f.kingdom];
            return (
              <li key={f.title} className="city-block city-block--show" style={{ '--k': k.color }}>
                <span className="city-block__tag">
                  {k.emoji} {k.name} · {f.rhythm}
                </span>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </li>
            );
          })}
        </ul>
        <p className="city-arena__note">Formats in development — dates announced with each host.</p>
      </div>
    </section>
  );
}

export function CityChronicles() {
  return (
    <section className="city-section">
      <div className="city-section__head">
        <span className="city-section__tag">Stories from the city</span>
        <h2 className="city-section__title">The city tells its own story</h2>
        <p className="city-section__lede">
          Films and content set inside Sotabosc promote its citizens. Each story is a way into the city.
        </p>
      </div>
      <div className="city-grid city-grid--3">
        {CHRONICLES.map((c) => (
          <article key={c.title} className="city-block">
            <span className="city-block__tag">{c.tag}</span>
            <h3>{c.title}</h3>
            <p>{c.body}</p>
            {c.to ? (
              <Link to={c.to} className="city-block__more">
                Read →
              </Link>
            ) : (
              <span className="city-block__soon">In production</span>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

export function CitySides() {
  return (
    <section className="city-section">
      <div className="city-section__head">
        <span className="city-section__tag">One screen, three winners</span>
        <h2 className="city-section__title">Everyone who joins makes the others stronger</h2>
      </div>
      <div className="city-grid city-grid--3">
        {SIDES.map((s) => (
          <article key={s.tag} className="city-block">
            <span className="city-block__tag">{s.tag}</span>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
