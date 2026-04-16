import { useLoaderData, Link } from 'react-router';
import { DirectorySurface } from '~/components/directory/DirectorySurface';
import { directoryRoutes } from '~/lib/directory/routes';
import { HIKE_DIFFICULTY_LABEL, HIKE_REGIONS } from '~/lib/hiking/types';
import { openStreetMapBrowseUrl } from '~/lib/hiking/osm';
import { canonicalLinkMeta } from '~/lib/seo/metaHelpers';
import { openGraphImageMeta } from '~/lib/seo/siteImagery';
import { JsonLd } from '~/components/seo/JsonLd';
import { buildBreadcrumbListJsonLd } from '~/lib/seo/jsonLd';

export const meta = ({ data: loaderData }) => {
  const hike = loaderData?.hike;
  const path = hike ? directoryRoutes.hike(hike.slug) : undefined;
  return [
    { title: hike ? `${hike.name} — Catalunya hikes` : 'Hike — Sotabosc' },
    hike
      ? {
          name: 'description',
          content: hike.summary,
        }
      : null,
    ...(path && loaderData?.origin ? canonicalLinkMeta(loaderData.origin, path) : []),
    ...openGraphImageMeta(loaderData?.origin),
  ].filter(Boolean);
};

export async function loader({ params, request }) {
  const { getHikeBySlug } = await import('~/lib/hiking/hiking.server');
  const slug = params.slug;
  if (!slug) throw new Response('Not found', { status: 404 });

  const hike = getHikeBySlug(slug);
  if (!hike) throw new Response('Hike not found', { status: 404 });

  return {
    hike,
    origin: new URL(request.url).origin,
    osmUrl: openStreetMapBrowseUrl(hike.center.lat, hike.center.lon, 13),
  };
}

export default function HikeDetail() {
  const { hike, osmUrl, origin } = useLoaderData();
  const regionMeta = HIKE_REGIONS[hike.region];
  const diff = HIKE_DIFFICULTY_LABEL[hike.difficulty];
  const pageUrl = `${origin}${directoryRoutes.hike(hike.slug)}`;
  const breadcrumbLd = buildBreadcrumbListJsonLd([
    { name: 'Home', url: `${origin}/` },
    { name: 'Barcelona', url: `${origin}${directoryRoutes.city()}` },
    { name: 'Catalunya hikes', url: `${origin}${directoryRoutes.hikes()}` },
    { name: hike.name, url: pageUrl },
  ]);

  return (
    <DirectorySurface>
      <JsonLd data={breadcrumbLd} />
      <article className="pt-12 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <Link
            to={directoryRoutes.hikes()}
            className="text-xs mb-6 inline-block transition-opacity hover:opacity-80"
            style={{ color: 'var(--sotabosc-muted)' }}
          >
            ← All Catalunya hikes
          </Link>

          <p className="text-[10px] font-bold uppercase tracking-[0.22em] mb-2" style={{ color: 'var(--sotabosc-accent)' }}>
            {regionMeta.label} · {hike.comarca}
          </p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight font-[family-name:var(--font-display)] leading-tight">
            {hike.name}
          </h1>

          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <span
              className="rounded-full px-3 py-1 font-semibold text-xs"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--sotabosc-accent) 14%, transparent)',
              }}
            >
              {diff}
            </span>
            {hike.tags.map((t) => (
              <span key={t} className="rounded-full px-3 py-1 text-xs border" style={{ borderColor: 'var(--sotabosc-border)' }}>
                {t.replace(/-/g, ' ')}
              </span>
            ))}
          </div>

          <dl className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            {hike.distanceKm != null ? (
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--sotabosc-muted)' }}>
                  Distance
                </dt>
                <dd className="mt-1 font-semibold">{hike.distanceKm} km</dd>
              </div>
            ) : null}
            {hike.elevationGainM != null ? (
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--sotabosc-muted)' }}>
                  Ascent (typ.)
                </dt>
                <dd className="mt-1 font-semibold">~{hike.elevationGainM} m</dd>
              </div>
            ) : null}
            {hike.durationHours != null ? (
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--sotabosc-muted)' }}>
                  Moving time
                </dt>
                <dd className="mt-1 font-semibold">~{hike.durationHours} h</dd>
              </div>
            ) : null}
          </dl>

          <p className="mt-8 text-base leading-relaxed" style={{ color: 'var(--sotabosc-text)' }}>
            {hike.summary}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <a
              href={osmUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center text-xs font-bold px-5 py-2.5 rounded-full transition-opacity hover:opacity-90"
              style={{
                backgroundColor: 'var(--sotabosc-accent)',
                color: 'var(--sotabosc-surface)',
              }}
            >
              Open area in OpenStreetMap
            </a>
            {hike.infoUrl ? (
              <a
                href={hike.infoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center text-xs font-bold px-5 py-2.5 rounded-full border transition-colors hover:opacity-90"
                style={{ borderColor: 'var(--sotabosc-border)', color: 'var(--sotabosc-text)' }}
              >
                Official / park info →
              </a>
            ) : null}
          </div>

          <p className="mt-10 text-xs leading-relaxed border-t pt-6" style={{ borderColor: 'var(--sotabosc-border)', color: 'var(--sotabosc-muted)' }}>
            Conditions change. This page is not a guide service — verify closures, forecasts, and your experience level
            before committing. © OpenStreetMap contributors when using map links (
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline">
              ODbL
            </a>
            ).
          </p>
        </div>
      </article>
    </DirectorySurface>
  );
}
