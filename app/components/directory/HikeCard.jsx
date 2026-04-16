import { Link } from 'react-router';
import { directoryRoutes } from '~/lib/directory/routes';
import { HIKE_DIFFICULTY_LABEL, HIKE_REGIONS } from '~/lib/hiking/types';

/**
 * @param {{ hike: import('~/lib/hiking/types').HikingRoute }} props
 */
export function HikeCard({ hike }) {
  const regionMeta = HIKE_REGIONS[hike.region];
  const diff = HIKE_DIFFICULTY_LABEL[hike.difficulty];

  return (
    <Link
      to={directoryRoutes.hike(hike.slug)}
      className="group block rounded-2xl border p-5 transition-all hover:shadow-[0_20px_40px_rgba(27,67,50,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sotabosc-accent)] focus-visible:ring-offset-2"
      style={{
        backgroundColor: 'var(--sotabosc-surface)',
        borderColor: 'var(--sotabosc-border)',
        color: 'var(--sotabosc-text)',
      }}
    >
      <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider mb-2">
        <span style={{ color: 'var(--sotabosc-accent)' }}>{regionMeta.short}</span>
        <span style={{ color: 'var(--sotabosc-muted)' }}>·</span>
        <span style={{ color: 'var(--sotabosc-muted)' }}>{hike.comarca}</span>
        <span
          className="ml-auto rounded-full px-2 py-0.5 font-semibold"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--sotabosc-accent) 12%, transparent)',
            color: 'var(--sotabosc-text)',
          }}
        >
          {diff}
        </span>
      </div>
      <h2 className="text-lg font-bold font-[family-name:var(--font-display)] leading-snug group-hover:underline">
        {hike.name}
      </h2>
      <p className="text-sm mt-2 line-clamp-2 leading-relaxed" style={{ color: 'var(--sotabosc-muted)' }}>
        {hike.summary}
      </p>
      <dl className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: 'var(--sotabosc-muted)' }}>
        {hike.distanceKm != null ? (
          <div>
            <dt className="inline font-semibold text-[var(--sotabosc-text)]">Distance </dt>
            <dd className="inline">{hike.distanceKm} km</dd>
          </div>
        ) : null}
        {hike.elevationGainM != null ? (
          <div>
            <dt className="inline font-semibold text-[var(--sotabosc-text)]">Gain </dt>
            <dd className="inline">~{hike.elevationGainM} m</dd>
          </div>
        ) : null}
        {hike.durationHours != null ? (
          <div>
            <dt className="inline font-semibold text-[var(--sotabosc-text)]">Time </dt>
            <dd className="inline">~{hike.durationHours} h</dd>
          </div>
        ) : null}
      </dl>
    </Link>
  );
}
