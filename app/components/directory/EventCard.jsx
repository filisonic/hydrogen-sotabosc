import { Link } from 'react-router';
import { getDomain } from '~/lib/directory/domains';
import { directoryRoutes } from '~/lib/directory/routes';

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

export function EventCard({ event }) {
  const domain = getDomain(event.primaryDomain);

  return (
    <Link
      to={directoryRoutes.event(event.slug)}
      className="group flex gap-4 bg-white rounded-2xl border border-black/5 hover:border-black/15 transition-all hover:shadow-lg p-4"
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
        <h3 className="font-bold text-sm leading-tight mb-1 group-hover:text-black/80 transition-colors truncate">
          {event.title}
        </h3>
        <p className="text-xs text-black/40 mb-1 truncate">{event.placeName}</p>
        <p className="text-xs text-black/30">
          {formatDate(event.startsAt)} · {formatTime(event.startsAt)}
          {event.endsAt && ` — ${formatDate(event.endsAt)}`}
        </p>
      </div>
    </Link>
  );
}
