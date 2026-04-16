import { Link } from 'react-router';
import { getDomain } from '~/lib/directory/domains';
import { directoryRoutes } from '~/lib/directory/routes';
import { resolveEventImageUrl } from '~/lib/directory/sceneVisuals';
import { DirectoryPreviewImage } from '~/components/directory/DirectoryPreviewImage';

function formatDate(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function formatTime(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function EventCard({ event, place = null, className = '', tone = 'directory' }) {
  const domain = getDomain(event.primaryDomain);
  const sceneInk = tone === 'sceneInk';
  const onScene = tone === 'scene' || sceneInk;
  const muted = sceneInk ? 'rgba(0,0,0,0.5)' : onScene ? 'rgba(255,255,255,0.85)' : 'var(--sotabosc-muted)';
  const imgSrc = onScene ? resolveEventImageUrl(event, place) : null;

  if (!onScene) {
    return (
      <Link
        to={directoryRoutes.event(event.slug)}
        className={`group flex gap-4 rounded-2xl border transition-all p-4 hover:shadow-[0_20px_40px_rgba(27,67,50,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sotabosc-accent-soft)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sotabosc-bg)] ${className}`}
        style={{
          backgroundColor: 'var(--sotabosc-surface)',
          borderColor: 'var(--sotabosc-border)',
          color: 'var(--sotabosc-text)',
        }}
      >
        <div
          className="shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center text-center"
          style={{ backgroundColor: `${domain.color}15` }}
        >
          <span className="text-lg">{domain.emoji}</span>
          <span className="text-[10px] font-bold uppercase" style={{ color: domain.color }}>
            {new Date(event.startsAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm leading-tight mb-1 group-hover:opacity-[0.85] transition-opacity truncate">
            {event.title}
          </h3>
          <p className="text-xs mb-1 truncate" style={{ color: muted }}>
            {event.placeName}
          </p>
          <p className="text-xs" style={{ color: muted, opacity: 0.9 }}>
            {formatDate(event.startsAt)} · {formatTime(event.startsAt)}
            {event.endsAt && ` — ${formatDate(event.endsAt)}`}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={directoryRoutes.event(event.slug)}
      className={`group flex flex-col sm:flex-row sm:items-stretch overflow-hidden rounded-2xl border transition-all backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${sceneInk ? 'shadow-md shadow-stone-900/10 ring-1 ring-stone-900/12 hover:ring-stone-900/20 focus-visible:ring-stone-700 focus-visible:ring-offset-stone-100' : 'shadow-lg shadow-black/40 ring-1 ring-white/10 hover:ring-white/20 focus-visible:ring-white focus-visible:ring-offset-[#030806]'} ${className}`}
      style={{
        backgroundColor: sceneInk ? 'rgba(255,255,255,0.94)' : 'rgba(12,18,15,0.9)',
        borderColor: sceneInk ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.24)',
        color: sceneInk ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.98)',
      }}
    >
      {imgSrc ? (
        <div className="relative h-32 sm:h-auto sm:w-[42%] sm:max-w-[220px] shrink-0 overflow-hidden bg-zinc-900">
          <DirectoryPreviewImage
            src={imgSrc}
            alt={event.title}
            className="h-full w-full min-h-[8rem] object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            fallback={
              <div
                className="flex h-full min-h-[8rem] w-full items-center justify-center text-3xl"
                style={{ backgroundColor: `${domain.color}40` }}
              >
                {domain.emoji}
              </div>
            }
          />
          <div className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-t from-black/35 via-transparent to-black/12 sm:bg-gradient-to-r sm:from-transparent sm:via-black/8 sm:to-black/32" />
        </div>
      ) : null}

      <div className="flex min-h-[6.5rem] flex-1 gap-3 p-3 sm:p-4">
        <div
          className={`flex w-14 shrink-0 flex-col items-center justify-center rounded-xl border py-2 text-center ${sceneInk ? 'border-stone-200 bg-stone-100/90' : 'border-white/20 bg-black/55'}`}
          style={{ boxShadow: `inset 0 0 0 1px ${domain.color}33` }}
        >
          <span className="text-lg leading-none">{domain.emoji}</span>
          <span
            className={`mt-1 text-[11px] font-black tabular-nums ${sceneInk ? 'text-stone-900' : 'text-white'}`}
          >
            {new Date(event.startsAt).getDate()}
          </span>
          <span
            className={`text-[9px] font-bold uppercase tracking-wide ${sceneInk ? 'text-stone-500' : 'text-white/65'}`}
          >
            {new Date(event.startsAt).toLocaleDateString('en-GB', { month: 'short' })}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <p
            className={`text-[10px] font-semibold uppercase tracking-wider ${sceneInk ? 'text-stone-500' : 'text-white/55'}`}
          >
            {formatDate(event.startsAt)} · {formatTime(event.startsAt)}
          </p>
          <h3
            className={`mt-0.5 font-bold text-sm leading-snug line-clamp-2 sm:text-base ${sceneInk ? 'text-stone-900' : 'text-white'}`}
          >
            {event.title}
          </h3>
          <p className={`mt-1 text-xs line-clamp-1 ${sceneInk ? 'text-stone-600' : 'text-white/75'}`}>
            {event.placeName}
          </p>
          {event.summary ? (
            <p
              className={`mt-1.5 line-clamp-2 text-[11px] leading-relaxed ${sceneInk ? 'text-stone-500' : 'text-white/65'}`}
            >
              {event.summary}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
