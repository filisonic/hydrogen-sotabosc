import { useLoaderData, Link } from 'react-router';
import { DirectorySurface } from '~/components/directory/DirectorySurface';
import { JsonLd } from '~/components/seo/JsonLd';
import { directoryRoutes } from '~/lib/directory/routes';
import { CITY_GUIDES } from '~/lib/seo/guidesContent';
import { buildBreadcrumbListJsonLd } from '~/lib/seo/jsonLd';
import { openGraphImageMeta } from '~/lib/seo/siteImagery';
import { canonicalLinkMeta } from '~/lib/seo/metaHelpers';

export const meta = ({ data }) => {
  const origin = data?.origin;
  const path = directoryRoutes.guides();
  return [
    {
      title: 'Barcelona guides — walking routes & creative clusters | Sotabosc City',
    },
    {
      name: 'description',
      content:
        'Evergreen routes and neighbourhood clusters: art galleries, Poblenou makers, and specialty coffee — each guide links into our curated directory.',
    },
    ...canonicalLinkMeta(origin, path),
    ...openGraphImageMeta(origin),
  ];
};

export async function loader({ request }) {
  return {
    origin: new URL(request.url).origin,
    guides: CITY_GUIDES,
  };
}

export default function CityGuidesIndex() {
  const { origin, guides } = useLoaderData();
  const pageUrl = `${origin}${directoryRoutes.guides()}`;
  const breadcrumbLd = buildBreadcrumbListJsonLd([
    { name: 'Home', url: `${origin}/` },
    { name: 'Barcelona', url: `${origin}${directoryRoutes.city()}` },
    { name: 'Guides', url: pageUrl },
  ]);

  return (
    <DirectorySurface>
      <JsonLd data={breadcrumbLd} />

      <section className="pt-12 pb-10 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            to={directoryRoutes.city()}
            className="text-xs mb-4 inline-block transition-opacity hover:opacity-80"
            style={{ color: 'var(--sotabosc-muted)' }}
          >
            ← Back to directory
          </Link>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3 font-[family-name:var(--font-display)]">
            Barcelona guides
          </h1>
          <p className="text-base" style={{ color: 'var(--sotabosc-muted)' }}>
            Longer reads that string our listings into walks and day plans. Each guide deep-links to full venue
            profiles.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="max-w-3xl mx-auto space-y-6">
          {guides.map((g) => (
            <Link
              key={g.slug}
              to={directoryRoutes.guide(g.slug)}
              className="block rounded-2xl border p-6 transition-all hover:shadow-[0_20px_40px_rgba(27,67,50,0.06)]"
              style={{
                backgroundColor: 'var(--sotabosc-surface)',
                borderColor: 'var(--sotabosc-border)',
                color: 'var(--sotabosc-text)',
              }}
            >
              <h2 className="text-xl font-bold font-[family-name:var(--font-display)] mb-2 group-hover:underline">
                {g.title}
              </h2>
              <p className="text-sm" style={{ color: 'var(--sotabosc-muted)' }}>
                {g.dek}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </DirectorySurface>
  );
}
