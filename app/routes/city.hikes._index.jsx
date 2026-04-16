import { useLoaderData, Link } from 'react-router';
import { DirectorySurface } from '~/components/directory/DirectorySurface';
import { HikeCard } from '~/components/directory/HikeCard';
import { ContributionActions } from '~/components/directory/ContributionActions';
import { directoryRoutes } from '~/lib/directory/routes';
import { HIKE_REGIONS } from '~/lib/hiking/types';
import { openGraphImageMeta } from '~/lib/seo/siteImagery';

export const meta = ({ data }) => [
  { title: 'Catalunya hikes — Sotabosc' },
  {
    name: 'description',
    content:
      'Curated hiking and trekking ideas across Catalunya — from Collserola and Montserrat to the Pyrenees and Costa Brava.',
  },
  ...openGraphImageMeta(data?.origin),
];

export async function loader({ request }) {
  const { getHikesByRegion, normalizeHikeRegionQuery } = await import('~/lib/hiking/hiking.server');
  const url = new URL(request.url);
  const region = normalizeHikeRegionQuery(url.searchParams.get('region'));

  const hikes = getHikesByRegion(region);

  return {
    hikes,
    region,
    origin: new URL(request.url).origin,
  };
}

export default function HikesIndex() {
  const { hikes, region } = useLoaderData();

  const regionKeys = /** @type {const} */ (['all', ...Object.keys(HIKE_REGIONS)]);

  return (
    <DirectorySurface>
      <section className="pt-12 pb-6 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            to={directoryRoutes.city()}
            className="text-xs mb-4 inline-block transition-opacity hover:opacity-80"
            style={{ color: 'var(--sotabosc-muted)' }}
          >
            ← Back to directory
          </Link>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 font-[family-name:var(--font-display)]">
            Hiking in Catalunya
          </h1>
          <p className="text-sm mb-2 max-w-2xl leading-relaxed" style={{ color: 'var(--sotabosc-muted)' }}>
            Starter list for trekking enthusiasts — collserola day loops to Pyrenean hut circuits. Figures are typical;
            check park rules, weather, and your own fitness before heading out.
          </p>
          <p className="text-xs mb-6" style={{ color: 'var(--sotabosc-muted)' }}>
            {hikes.length} route{hikes.length !== 1 ? 's' : ''}
            {region !== 'all' ? ` · ${HIKE_REGIONS[region]?.label ?? region}` : ''}
          </p>

          <div className="flex flex-wrap gap-2">
            {regionKeys.map((key) => {
              const label =
                key === 'all' ? 'All' : HIKE_REGIONS[/** @type {keyof typeof HIKE_REGIONS} */ (key)]?.label ?? key;
              const to = key === 'all' ? directoryRoutes.hikes() : `${directoryRoutes.hikes()}?region=${encodeURIComponent(key)}`;
              const active = region === key || (key === 'all' && (!region || region === 'all'));
              return (
                <Link
                  key={key}
                  to={to}
                  className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border transition-colors"
                  style={{
                    borderColor: active ? 'var(--sotabosc-accent)' : 'var(--sotabosc-border)',
                    backgroundColor: active ? 'color-mix(in srgb, var(--sotabosc-accent) 14%, transparent)' : 'var(--sotabosc-surface)',
                    color: 'var(--sotabosc-text)',
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 pb-12">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-4">
          {hikes.map((hike) => (
            <HikeCard key={hike.id} hike={hike} />
          ))}
        </div>
      </section>

      <section className="px-4 pb-6">
        <div className="max-w-4xl mx-auto rounded-xl border px-4 py-3 text-xs leading-relaxed" style={{ borderColor: 'var(--sotabosc-border)', color: 'var(--sotabosc-muted)' }}>
          Map links use{' '}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
            className="underline font-semibold"
            style={{ color: 'var(--sotabosc-accent)' }}
          >
            OpenStreetMap
          </a>{' '}
          for browsing only. Route data here is curated editorial content, not a live GPS track.
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <ContributionActions />
        </div>
      </section>
    </DirectorySurface>
  );
}
