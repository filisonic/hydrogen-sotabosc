import { useLoaderData, Link } from 'react-router';
import { PlaceCard } from '~/components/directory/PlaceCard';
import { CategoryPills } from '~/components/directory/CategoryPills';
import { ContributionActions } from '~/components/directory/ContributionActions';
import { getListingCategory, LISTING_CATEGORIES } from '~/lib/directory/domains';
import { directoryRoutes } from '~/lib/directory/routes';

export const meta = ({ params }) => {
  const cat = LISTING_CATEGORIES[params.category];
  const label = cat?.label || params.category;
  return [
    { title: `${label} — Sotabosc City` },
    { name: 'description', content: `Discover the best ${label.toLowerCase()} in Barcelona.` },
  ];
};

export async function loader({ params }) {
  const { getPlacesByCategory } = await import('~/lib/directory/seed.server');
  const category = params.category;
  const catMeta = getListingCategory(category);
  if (!catMeta) {
    throw new Response('Category not found', { status: 404 });
  }
  const places = getPlacesByCategory(category);
  return { places, category, catMeta };
}

export default function CategoryPage() {
  const { places, category, catMeta } = useLoaderData();

  return (
    <div className="min-h-screen bg-[var(--color-primary)]">
      <section className="pt-12 pb-6 px-4">
        <div className="max-w-6xl mx-auto">
          <Link to={directoryRoutes.city()} className="text-xs text-black/40 hover:text-black/60 transition-colors mb-4 inline-block">
            ← Back to directory
          </Link>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
            {catMeta.label}
          </h1>
          <p className="text-sm text-black/40">
            {places.length} place{places.length !== 1 ? 's' : ''} in Barcelona
          </p>
        </div>
      </section>

      <section className="px-4 pb-6">
        <div className="max-w-6xl mx-auto">
          <CategoryPills activeCategory={category} />
        </div>
      </section>

      <section className="px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          {places.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-black/30">No places in this category yet.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {places.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <ContributionActions />
        </div>
      </section>
    </div>
  );
}
