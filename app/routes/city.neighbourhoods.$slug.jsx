import { useLoaderData, Link } from 'react-router';
import { PlaceCard } from '~/components/directory/PlaceCard';
import { CategoryPills } from '~/components/directory/CategoryPills';
import { DirectorySurface } from '~/components/directory/DirectorySurface';
import { ContributionActions } from '~/components/directory/ContributionActions';
import { JsonLd } from '~/components/seo/JsonLd';
import { directoryRoutes } from '~/lib/directory/routes';
import { getPlacesByNeighborhoodSlug } from '~/lib/directory/neighborhoods.server';
import { getNeighborhoodLandingSeo } from '~/lib/seo/neighborhoodLanding';
import { buildBreadcrumbListJsonLd, buildItemListJsonLd } from '~/lib/seo/jsonLd';
import { openGraphImageMeta } from '~/lib/seo/siteImagery';
import { canonicalLinkMeta } from '~/lib/seo/metaHelpers';

export const meta = ({ data }) => {
  if (!data?.hood) {
    return [{ title: 'Neighbourhood — Sotabosc City' }, ...openGraphImageMeta(data?.origin)];
  }
  const { landing, origin, canonicalPath } = data;
  return [
    { title: landing.titleTag },
    { name: 'description', content: landing.metaDescription },
    ...canonicalLinkMeta(origin, canonicalPath),
    ...openGraphImageMeta(origin),
  ];
};

export async function loader({ params, request }) {
  const hood = getPlacesByNeighborhoodSlug(params.slug);
  if (!hood) throw new Response('Neighbourhood not found', { status: 404 });
  const origin = new URL(request.url).origin;
  const canonicalPath = directoryRoutes.neighborhood(params.slug);
  const landing = getNeighborhoodLandingSeo(params.slug, hood.label, hood.places.length);
  return { hood, landing, origin, canonicalPath, slug: params.slug };
}

export default function NeighborhoodPage() {
  const { hood, landing, origin, slug } = useLoaderData();
  const pageUrl = `${origin}${directoryRoutes.neighborhood(slug)}`;
  const itemListLd = buildItemListJsonLd({
    name: `${hood.label} — Barcelona listings`,
    description: landing.metaDescription,
    pageUrl,
    items: hood.places.map((p, i) => ({
      position: i + 1,
      name: p.name,
      url: `${origin}${directoryRoutes.place(p.slug)}`,
      description: p.summary,
    })),
  });
  const breadcrumbLd = buildBreadcrumbListJsonLd([
    { name: 'Home', url: `${origin}/` },
    { name: 'Barcelona', url: `${origin}${directoryRoutes.city()}` },
    { name: hood.label, url: pageUrl },
  ]);

  return (
    <DirectorySurface>
      <JsonLd data={itemListLd} />
      <JsonLd data={breadcrumbLd} />

      <section className="pt-12 pb-6 px-4">
        <div className="max-w-6xl mx-auto">
          <Link
            to={directoryRoutes.city()}
            className="text-xs mb-4 inline-block transition-opacity hover:opacity-80"
            style={{ color: 'var(--sotabosc-muted)' }}
          >
            ← Back to directory
          </Link>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3 font-[family-name:var(--font-display)]">
            {hood.label}
          </h1>
          <p className="text-base max-w-3xl mb-4" style={{ color: 'var(--sotabosc-text)' }}>
            {landing.intro}
          </p>
          <p className="text-sm" style={{ color: 'var(--sotabosc-muted)' }}>
            {hood.places.length} curated listing{hood.places.length !== 1 ? 's' : ''} in this area
          </p>
        </div>
      </section>

      <section className="px-4 pb-6">
        <div className="max-w-6xl mx-auto">
          <CategoryPills activeCategory={null} />
        </div>
      </section>

      <section className="px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hood.places.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <ContributionActions />
        </div>
      </section>
    </DirectorySurface>
  );
}
