import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import qrcode from 'qrcode-generator';
import { directoryRoutes } from '~/lib/directory/routes';
import { ARENA_FORMATS } from '~/lib/city/arena';
import { ARENA, KINGDOMS_BY_KEY } from '~/lib/city/kingdoms';
import { barcelonaDaypart, formatBarcelonaClock, screenPartnersFor } from '~/lib/city/symbiosis';

const SLIDE_MS = 6500;

const DAYPART_LINES = {
  morning: 'Good morning',
  midday: 'Midday in the city',
  afternoon: 'Slow afternoon',
  evening: 'The evening is starting',
  night: 'Still awake?',
};

function weatherLine(weather) {
  if (!weather) return 'Whatever the weather, the city is open.';
  if (weather.wet) return `${weather.summary} outside — stay a while.`;
  if (weather.temperature >= 26) return `${weather.temperature}° out there — something cold?`;
  if (weather.temperature <= 12) return `${weather.temperature}° out — warm up inside.`;
  return `${weather.temperature}° and ${weather.summary}.`;
}

function truncate(text, max = 120) {
  if (!text || text.length <= max) return text;
  return `${text.slice(0, max).replace(/\s+\S*$/, '')}…`;
}

function formatEventDate(iso) {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Madrid',
  }).format(new Date(iso));
}

const SITE_ORIGIN = 'https://sotabosc.world';

/** Absolute link for a slide's QR code, tagged with the screen and slide that sent the visit. */
function screenLink(path, hostSlug, kind) {
  const url = new URL(path, SITE_ORIGIN);
  url.searchParams.set('utm_source', 'sotabosc-screen');
  url.searchParams.set('utm_medium', hostSlug);
  url.searchParams.set('utm_content', kind);
  return url.toString();
}

/** Scannable QR code for the slide's link. */
function QrCode({ value }) {
  const { size, path } = useMemo(() => {
    const qr = qrcode(0, 'M');
    qr.addData(value);
    qr.make();
    const n = qr.getModuleCount();
    let d = '';
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) if (qr.isDark(y, x)) d += `M${x} ${y}h1v1h-1z`;
    }
    return { size: n, path: d };
  }, [value]);
  return (
    <svg viewBox={`-1 -1 ${size + 2} ${size + 2}`} className="city-screen__qr" role="img" aria-label={`QR code: ${value}`}>
      <path d={path} />
    </svg>
  );
}

export function buildSlides({ host, citizens, artists, events, weather, daypart }) {
  const kingdom = KINGDOMS_BY_KEY[host.kingdom];
  const { neighbours, downstream } = screenPartnersFor(host, citizens);
  const artist = artists.find((a) => a.kingdom === host.kingdom) ?? artists[0];
  const event = events.find((e) => e.kingdom === host.kingdom) ?? events[0];
  const slides = [
    {
      kind: 'host',
      kicker: host.name,
      title: `${DAYPART_LINES[daypart]}, ${host.neighborhood}.`,
      body: weatherLine(weather),
      rule: `Host content · daypart = ${daypart}${weather ? ` · weather = ${weather.temperature}° ${weather.summary}` : ''}`,
      path: directoryRoutes.place(host.slug),
    },
  ];
  for (const n of neighbours.slice(0, 1)) {
    slides.push({
      kind: 'neighbour',
      kicker: `Neighbour in ${kingdom.name}`,
      title: n.name,
      body: truncate(n.summary),
      rule: `Cross-promotion · same kingdom (${kingdom.name})`,
      path: directoryRoutes.place(n.slug),
    });
  }
  if (artist) {
    slides.push({
      kind: 'art',
      kicker: 'Art interlude',
      title: artist.displayName,
      body: truncate(artist.bio, 100),
      rule: `Artist screensaver · ${KINGDOMS_BY_KEY[artist.kingdom]?.name ?? 'city'} artist · purchasable on the store`,
      artColor: KINGDOMS_BY_KEY[artist.kingdom]?.color ?? kingdom.color,
      path: artist.slug ? directoryRoutes.creator(artist.slug) : '/store',
    });
  }
  if (downstream) {
    const next = KINGDOMS_BY_KEY[downstream.kingdom];
    slides.push({
      kind: 'downstream',
      kicker: `${daypart === 'evening' || daypart === 'night' ? 'Tomorrow' : 'Later'} in ${next.name}`,
      title: downstream.name,
      body: truncate(downstream.summary),
      rule: `Symbiosis · ${kingdom.name} feeds ${next.name}`,
      path: directoryRoutes.place(downstream.slug),
    });
  }
  const arenaShow = ARENA_FORMATS.find((f) => f.kingdom === host.kingdom) ?? ARENA_FORMATS[0];
  slides.push({
    kind: 'arena',
    kicker: `${ARENA.name} · ${arenaShow.rhythm}`,
    title: arenaShow.title,
    body: truncate(arenaShow.body),
    rule: 'Arena broadcast · online events play on every citizen screen',
    path: '/how-it-works#city-arena',
  });
  if (event) {
    slides.push({
      kind: 'event',
      kicker: `Happening · ${formatEventDate(event.startsAt)}`,
      title: event.title,
      body: event.placeName ? `at ${event.placeName}` : 'in the city',
      rule: `Event feed · ${KINGDOMS_BY_KEY[event.kingdom]?.name ?? 'city'} kingdom`,
      path: directoryRoutes.event(event.slug),
    });
  }
  return slides.map((s) => ({ ...s, href: screenLink(s.path, host.slug, s.kind) }));
}

/**
 * One frame of a citizen's screen. Shared by the homepage demo and the `/screen/:slug` player.
 *
 * @param {{ host: any; slide: any; slideKey: string; now: Date; weather: any }} props
 */
export function ScreenDisplay({ host, slide, slideKey, now, weather }) {
  const kingdom = KINGDOMS_BY_KEY[host.kingdom];
  return (
    <div className={`city-screen__display city-screen__display--${slide.kind}`} key={slideKey}>
      {slide.kind === 'art' ? (
        <div className="city-screen__art" style={{ '--art': slide.artColor }} aria-hidden>
          <span />
          <span />
          <span />
        </div>
      ) : null}
      <div className="city-screen__status">
        <span suppressHydrationWarning>{formatBarcelonaClock(now)}</span>
        <span>
          {weather ? `${weather.temperature}° · ` : ''}Barcelona
        </span>
      </div>
      <div className="city-screen__content">
        <span className="city-screen__kicker">{slide.kicker}</span>
        <h3 className="city-screen__title">{slide.title}</h3>
        <p className="city-screen__body">{slide.body}</p>
      </div>
      <div className="city-screen__footer">
        <span>
          {kingdom.emoji} Sotabosc · {kingdom.name}
        </span>
        <QrCode value={slide.href} />
      </div>
    </div>
  );
}

/**
 * @param {{
 *   citizens: any[];
 *   artists: any[];
 *   events: any[];
 *   context: { nowISO: string; weather: null | { temperature: number; summary: string; wet: boolean } };
 * }} props
 */
export function CityScreen({ citizens, artists, events, context }) {
  const [hostSlug, setHostSlug] = useState(citizens[0]?.slug);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [now, setNow] = useState(() => new Date(context.nowISO));

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const host = citizens.find((c) => c.slug === hostSlug) ?? citizens[0];
  const daypart = barcelonaDaypart(now);
  const slides = useMemo(
    () => (host ? buildSlides({ host, citizens, artists, events, weather: context.weather, daypart }) : []),
    [host, citizens, artists, events, context.weather, daypart],
  );

  useEffect(() => {
    setIndex(0);
  }, [hostSlug]);

  useEffect(() => {
    if (paused || slides.length < 2) return undefined;
    const id = setTimeout(() => setIndex((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => clearTimeout(id);
  }, [index, paused, slides.length]);

  if (!host) return null;
  const slide = slides[index % slides.length];
  const kingdom = KINGDOMS_BY_KEY[host.kingdom];

  return (
    <div className="city-screen" style={{ '--k': kingdom.color }}>
      <div className="city-screen__controls">
        <label htmlFor="city-screen-host" className="city-screen__label">
          Pick a host business
        </label>
        <select
          id="city-screen-host"
          value={host.slug}
          onChange={(e) => setHostSlug(e.target.value)}
          className="city-screen__select"
        >
          {citizens.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name} — {KINGDOMS_BY_KEY[c.kingdom].name}
            </option>
          ))}
        </select>
      </div>

      <div
        className="city-screen__bezel"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <ScreenDisplay
          host={host}
          slide={slide}
          slideKey={`${host.slug}-${index}`}
          now={now}
          weather={context.weather}
        />
      </div>

      <div className="city-screen__dots" role="tablist" aria-label="Screen slides">
        {slides.map((s, i) => (
          <button
            key={s.kind}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={s.kind}
            className={i === index ? 'is-active' : ''}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
      <p className="city-screen__rule">
        <strong>Why this is on screen:</strong> {slide.rule}
      </p>
      {slide.kind === 'art' ? (
        <Link to="/store" className="city-screen__buy">
          Art on the screens is for sale on the Sotabosc store →
        </Link>
      ) : null}    </div>
  );
}
