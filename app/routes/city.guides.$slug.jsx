import { useLoaderData, Link } from 'react-router';
import { PlaceCard } from '~/components/directory/PlaceCard';
import { DirectorySurface } from '~/components/directory/DirectorySurface';
import { JsonLd } from '~/components/seo/JsonLd';
import { directoryRoutes } from '~/lib/directory/routes';
import { getGuideBySlug } from '~/lib/seo/guidesContent';
import { buildBreadcrumbListJsonLd } from '~/lib/seo/jsonLd';
import { openGraphImageMeta } from '~/lib/seo/siteImagery';
import { canonicalLinkMeta } from '~/lib/seo/metaHelpers';

export const meta = ({ data }) => {
  if (!data?.guide) {
    return [{ title: 'Guide — Sotabosc City' }, ...openGraphImageMeta(data?.origin)];
  }
  const { guide, origin, canonicalPath } = data;
  return [
    { title: `${guide.title} | Sotabosc City` },
    { name: 'description', content: guide.dek },
    ...canonicalLinkMeta(origin, canonicalPath),
    ...openGraphImageMeta(origin),
  ];
};

export async function loader({ params, request }) {
  const guide = getGuideBySlug(params.slug);
  if (!guide) throw new Response('Guide not found', { status: 404 });
  const { getPlaceBySlug } = await import('~/lib/directory/seed.server');
  const origin = new URL(request.url).origin;
  const canonicalPath = directoryRoutes.guide(params.slug);
  const relatedPlaces = guide.relatedPlaceSlugs
    .map((slug) => getPlaceBySlug(slug))
    .filter(Boolean);
  return { guide, origin, canonicalPath, relatedPlaces };
}

export default function CityGuideDetail() {
  const { guide, origin, relatedPlaces } = useLoaderData();
  const pageUrl = `${origin}${directoryRoutes.guide(guide.slug)}`;
  const breadcrumbLd = buildBreadcrumbListJsonLd([
    { name: 'Home', url: `${origin}/` },
    { name: 'Barcelona', url: `${origin}${directoryRoutes.city()}` },
    { name: 'Guides', url: `${origin}${directoryRoutes.guides()}` },
    { name: guide.title, url: pageUrl },
  ]);

  return (
    <DirectorySurface>
      <JsonLd data={breadcrumbLd} />

      <article className="pt-12 pb-6 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            to={directoryRoutes.guides()}
            className="text-xs mb-4 inline-block transition-opacity hover:opacity-80"
            style={{ color: 'var(--sotabosc-muted)' }}
          >
            ← All guides
          </Link>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3 font-[family-name:var(--font-display)]">
            {guide.title}
          </h1>
          <p className="text-lg mb-8" style={{ color: 'var(--sotabosc-muted)' }}>
            {guide.dek}
          </p>
          <div className="space-y-4 text-base" style={{ color: 'var(--sotabosc-text)' }}>
            {guide.body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      </article>

      {relatedPlaces.length > 0 && (
        <section className="px-4 pb-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-bold mb-6 font-[family-name:var(--font-display)]">Places in this guide</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPlaces.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          </div>
        </section>
      )}
    </DirectorySurface>
  );
}
