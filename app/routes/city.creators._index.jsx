import { useLoaderData, Link } from 'react-router';
import { getDomain } from '~/lib/directory/domains';
import { DirectorySurface } from '~/components/directory/DirectorySurface';
import { openGraphImageMeta } from '~/lib/seo/siteImagery';
import { directoryRoutes } from '~/lib/directory/routes';
import { canonicalLinkMeta } from '~/lib/seo/metaHelpers';

export const meta = ({ data }) => [
  { title: 'Creators — Sotabosc City' },
  {
    name: 'description',
    content: "Independent creators, artists, and makers in Barcelona's Sotabosc ecosystem.",
  },
  ...canonicalLinkMeta(data?.origin, directoryRoutes.creators()),
  ...openGraphImageMeta(data?.origin),
];

export async function loader({ request }) {
  const { SEED_CREATORS } = await import('~/lib/directory/seed.server');
  return { creators: SEED_CREATORS, origin: new URL(request.url).origin };
}

function CreatorCard({ creator }) {
  const domain = getDomain(creator.primaryDomain);
  return (
    <Link
      to={`/city/creators/${creator.slug}`}
      className="group block rounded-2xl border p-5 transition-all hover:shadow-[0_20px_40px_rgba(27,67,50,0.06)]"
      style={{
        backgroundColor: 'var(--sotabosc-surface)',
        borderColor: 'var(--sotabosc-border)',
        color: 'var(--sotabosc-text)',
      }}
    >
      <div className="flex items-start gap-4">
        {creator.imageUrl ? (
          <img
            src={creator.imageUrl}
            alt={creator.displayName}
            className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
          />
        ) : (
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ backgroundColor: `${domain.color}18` }}
          >
            {domain.emoji}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${domain.color}18`, color: domain.color }}
            >
              {domain.label}
            </span>
            {creator.productCollectionHandle && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: 'var(--sotabosc-surface-muted)',
                  color: 'var(--sotabosc-muted)',
                }}
              >
                Store
              </span>
            )}
          </div>
          <h3 className="font-bold text-base group-hover:underline">{creator.displayName}</h3>
          <p className="text-sm leading-snug mt-0.5 line-clamp-2" style={{ color: 'var(--sotabosc-muted)' }}>
            {creator.bio}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function CreatorsIndex() {
  const { creators } = useLoaderData();

  return (
    <DirectorySurface>
      <section className="pt-10 pb-6 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/city"
            className="text-xs mb-5 inline-block transition-opacity hover:opacity-80"
            style={{ color: 'var(--sotabosc-muted)' }}
          >
            ← Back to directory
          </Link>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 font-[family-name:var(--font-display)]">
            Creators
          </h1>
          <p className="text-sm max-w-xl mb-8" style={{ color: 'var(--sotabosc-muted)' }}>
            Independent artists, makers, and designers rooted in Barcelona&apos;s nature-led creative scene.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {creators.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>
        </div>
      </section>
    </DirectorySurface>
  );
}
