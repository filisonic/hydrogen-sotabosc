import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { gatheringPresence } from '~/lib/city/presence';
import { directoryRoutes } from '~/lib/directory/routes';
import { pulseLabel } from '~/lib/directory/eventWhen';

const REACTIONS = [
  { id: 'smile', glyph: '🙂', label: 'Smile' },
  { id: 'heart', glyph: '♥', label: 'Heart' },
  { id: 'clap', glyph: '👏', label: 'Clap' },
  { id: 'spark', glyph: '✦', label: 'Spark' },
  { id: 'leaf', glyph: '❀', label: 'Bloom' },
];

const AVATAR_KEY = 'sotabosc:city:avatar-hue';

function formatWhen(iso) {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Madrid',
  }).format(new Date(iso));
}

function crowdOf(seed, count) {
  const out = [];
  let n = seed;
  for (let i = 0; i < count; i++) {
    n = (n * 16807 + i * 13) % 2147483647;
    out.push({
      id: i,
      left: 8 + (n % 84),
      bottom: 6 + (n % 38),
      hue: n % 360,
      delay: (n % 20) / 10,
    });
  }
  return out;
}

/**
 * Step into a gathering in the virtual city: see a crowd, appear as a silhouette,
 * pass a reaction. No chat, no tickets — booking stays on the venue's own site.
 */
export function CityGathering({ event, onLeave, layout = 'overlay' }) {
  const [joined, setJoined] = useState(false);
  const [hue, setHue] = useState(42);
  const [floats, setFloats] = useState([]);
  const crowd = useMemo(() => crowdOf(event.slug.length * 97, 22), [event.slug]);

  useEffect(() => {
    try {
      const stored = Number(window.localStorage.getItem(AVATAR_KEY));
      if (Number.isFinite(stored)) setHue(stored);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onLeave();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onLeave]);

  const appear = () => {
    setJoined(true);
    try {
      window.localStorage.setItem(AVATAR_KEY, String(hue));
    } catch {
      /* ignore */
    }
  };

  const react = (reaction) => {
    const id = `${Date.now()}-${reaction.id}`;
    setFloats((prev) => [...prev.slice(-8), { id, glyph: reaction.glyph, x: 20 + Math.random() * 60 }]);
    window.setTimeout(() => {
      setFloats((prev) => prev.filter((f) => f.id !== id));
    }, 2200);
  };

  return (
    <div
      className={`city-gathering${layout === 'page' ? ' city-gathering--page' : ''}`}
      role={layout === 'page' ? 'region' : 'dialog'}
      aria-modal={layout === 'page' ? undefined : true}
      aria-labelledby="city-gathering-title"
    >
      <div className="city-gathering__stage">
        <p className="city-gathering__kicker">{pulseLabel(event.pulse)} · in the city</p>
        <h2 id="city-gathering-title" className="city-gathering__title">
          {event.title}
        </h2>
        <p className="city-gathering__where">
          {event.placeName ? `${event.placeName} · ` : ''}
          {formatWhen(event.startsAt)}
        </p>

        <div className="city-gathering__crowd" aria-hidden>
          {crowd.map((p) => (
            <span
              key={p.id}
              className="city-gathering__body"
              style={{
                left: `${p.left}%`,
                bottom: `${p.bottom}%`,
                background: `hsl(${p.hue} 28% 42%)`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
          {joined ? (
            <span
              className="city-gathering__body is-you"
              style={{ left: '48%', bottom: '18%', background: `hsl(${hue} 55% 46%)` }}
            />
          ) : null}
          {floats.map((f) => (
            <span key={f.id} className="city-gathering__float" style={{ left: `${f.x}%` }}>
              {f.glyph}
            </span>
          ))}
        </div>

        <p className="city-gathering__hint">
          {joined
            ? 'You are in the room as a silhouette. Pass a reaction — no chat, not yet.'
            : `About ${gatheringPresence(event.slug)} already here. Step in as a silhouette. Tickets, if any, stay on the venue site.`}
        </p>

        <div className="city-gathering__actions">
          {joined ? (
            <div className="city-gathering__react" role="group" aria-label="Pass a reaction">
              {REACTIONS.map((r) => (
                <button key={r.id} type="button" onClick={() => react(r)} aria-label={r.label}>
                  {r.glyph}
                </button>
              ))}
            </div>
          ) : (
            <label className="city-gathering__hue">
              Your colour
              <input
                type="range"
                min="0"
                max="359"
                value={hue}
                onChange={(e) => setHue(Number(e.target.value))}
              />
            </label>
          )}
          {joined ? null : (
            <button type="button" className="mag-btn" onClick={appear}>
              Appear in the crowd
            </button>
          )}
          {event.url ? (
            <a href={event.url} className="mag-btn-o" target="_blank" rel="noopener noreferrer">
              Venue page
            </a>
          ) : null}
          <Link to={directoryRoutes.event(event.slug)} className="mag-btn-o">
            Event listing
          </Link>
          <button type="button" className="mag-btn-o" onClick={onLeave}>
            Back to the map
          </button>
        </div>
      </div>
    </div>
  );
}
