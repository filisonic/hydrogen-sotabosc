import { useLoaderData, Link } from 'react-router';
import { PlaceCard } from '~/components/directory/PlaceCard';
import { CategoryPills } from '~/components/directory/CategoryPills';
import { DirectorySurface } from '~/components/directory/DirectorySurface';
import { ContributionActions } from '~/components/directory/ContributionActions';
import { JsonLd } from '~/components/seo/JsonLd';
import { getListingCategory, LISTING_CATEGORIES } from '~/lib/directory/domains';
import { directoryRoutes } from '~/lib/directory/routes';
import { openGraphImageMeta } from '~/lib/seo/siteImagery';
import { getCategoryLandingSeo } from '~/lib/seo/categoryLanding';
import { canonicalLinkMeta } from '~/lib/seo/metaHelpers';
import {
  buildBreadcrumbListJsonLd,
  buildFaqPageJsonLd,
  buildItemListJsonLd,
} from '~/lib/seo/jsonLd';

export const meta = ({ data, params }) => {
  const cat = LISTING_CATEGORIES[params.category];
  const label = cat?.label || params.category;
  if (!data?.landing) {
    return [
      { title: `${label} — Sotabosc City` },
      { name: 'description', content: `Discover ${label.toLowerCase()} in Barcelona.` },
      ...openGraphImageMeta(data?.origin),
    ];
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
  const { getPlacesByCategory } = await import('~/lib/directory/seed.server');
  const category = params.category;
  const catMeta = getListingCategory(category);
  if (!catMeta) {
    throw new Response('Category not found', { status: 404 });
  }
  const places = getPlacesByCategory(category);
  const landing = getCategoryLandingSeo(category);
  const origin = new URL(request.url).origin;
  const canonicalPath = directoryRoutes.category(category);

  const featuredSlugs = landing.featuredSlugs ?? [];
  const featuredPlaces = featuredSlugs
    .map((slug) => places.find((p) => p.slug === slug))
    .filter(Boolean);
  const editorPicks =
    featuredPlaces.length > 0 ? featuredPlaces : places.slice(0, Math.min(3, places.length));

  const restSlugs = new Set(editorPicks.map((p) => p.slug));
  const remainingPlaces = places.filter((p) => !restSlugs.has(p.slug));

  return {
    places,
    category,
    catMeta,
    landing,
    origin,
    canonicalPath,
    editorPicks,
    remainingPlaces,
  };
}

export default function CategoryPage() {
  const { places, category, catMeta, landing, origin, editorPicks, remainingPlaces } =
    useLoaderData();
  const pageUrl = `${origin}${directoryRoutes.category(category)}`;

  const itemListLd =
    places.length > 0
      ? buildItemListJsonLd({
          name: landing.h1,
          description: landing.metaDescription,
          pageUrl,
          items: places.map((p, i) => ({
            position: i + 1,
            name: p.name,
            url: `${origin}${directoryRoutes.place(p.slug)}`,
            description: p.summary,
          })),
        })
      : null;

  const faqLd =
    landing.faq.length > 0
      ? buildFaqPageJsonLd({ pageUrl, faq: landing.faq })
      : null;

  const breadcrumbLd = buildBreadcrumbListJsonLd([
    { name: 'Home', url: `${origin}/` },
    { name: 'Barcelona', url: `${origin}${directoryRoutes.city()}` },
    { name: catMeta.label, url: pageUrl },
  ]);

  return (
    <DirectorySurface>
      {itemListLd ? <JsonLd data={itemListLd} /> : null}
      {faqLd ? <JsonLd data={faqLd} /> : null}
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
            {landing.h1}
          </h1>
          {catMeta.blurb ? (
            <p className="text-sm max-w-2xl mb-3" style={{ color: 'var(--sotabosc-muted)' }}>
              {catMeta.blurb}
            </p>
          ) : null}
          <p className="text-base max-w-3xl mb-6" style={{ color: 'var(--sotabosc-text)' }}>
            {landing.intro}
          </p>

          {landing.criteria.length > 0 ? (
            <div
              className="rounded-2xl border p-5 mb-6 max-w-3xl"
              style={{
                backgroundColor: 'var(--sotabosc-surface-muted)',
                borderColor: 'var(--sotabosc-border)',
              }}
            >
              <p className="text-xs font-bold uppercase mb-2" style={{ color: 'var(--sotabosc-muted)' }}>
                What we include
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1" style={{ color: 'var(--sotabosc-text)' }}>
                {landing.criteria.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="text-sm" style={{ color: 'var(--sotabosc-muted)' }}>
            {places.length} place{places.length !== 1 ? 's' : ''} in Barcelona
          </p>
        </div>
      </section>

      <section className="px-4 pb-6">
        <div className="max-w-6xl mx-auto">
          <CategoryPills activeCategory={category} />
        </div>
      </section>

      {editorPicks.length > 0 && (
        <section className="px-4 pb-10">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-bold mb-4 font-[family-name:var(--font-display)]">
              Editor&apos;s picks
            </h2>
            <p className="text-sm mb-5 max-w-2xl" style={{ color: 'var(--sotabosc-muted)' }}>
              Starting points for planning a route — each links to a full profile with address,
              neighbourhood, and website.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {editorPicks.map((place) => (
                <PlaceCard key={place.id} place={place} showMythology={true} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          {places.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg" style={{ color: 'var(--sotabosc-muted)', opacity: 0.85 }}>
                No places in this category yet.
              </p>
            </div>
          ) : remainingPlaces.length > 0 ? (
            <>
              <h2 className="text-xl font-bold mb-4 font-[family-name:var(--font-display)]">
                All listings
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {remainingPlaces.map((place) => (
                  <PlaceCard key={place.id} place={place} showMythology={true} />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </section>

      {landing.faq.length > 0 && (
        <section
          className="px-4 pb-12"
          style={{ backgroundColor: 'var(--sotabosc-surface-muted)' }}
        >
          <div className="max-w-3xl mx-auto pt-12 pb-4">
            <h2 className="text-xl font-bold mb-6 font-[family-name:var(--font-display)]">FAQ</h2>
            <dl className="space-y-6">
              {landing.faq.map((item) => (
                <div key={item.question}>
                  <dt className="font-bold text-sm mb-1">{item.question}</dt>
                  <dd className="text-sm" style={{ color: 'var(--sotabosc-muted)' }}>
                    {item.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      <section className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <ContributionActions />
        </div>
      </section>
    </DirectorySurface>
  );
}
