import { useLoaderData, Link } from 'react-router';
import { getDomain } from '~/lib/directory/domains';

export const meta = () => [
  { title: 'Creators — Sotabosc City' },
  { name: 'description', content: "Independent creators, artists, and makers in Barcelona's Sotabosc ecosystem." },
];

export async function loader() {
  const { SEED_CREATORS } = await import('~/lib/directory/seed.server');
  return { creators: SEED_CREATORS };
}

function CreatorCard({ creator }) {
  const domain = getDomain(creator.primaryDomain);
  return (
    <Link
      to={`/city/creators/${creator.slug}`}
      className="group block bg-white rounded-2xl border border-black/5 hover:border-black/15 p-5 transition-all hover:shadow-md"
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
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/5 text-black/40">
                Store
              </span>
            )}
          </div>
          <h3 className="font-bold text-base group-hover:underline">{creator.displayName}</h3>
          <p className="text-sm text-black/50 leading-snug mt-0.5 line-clamp-2">{creator.bio}</p>
        </div>
      </div>
    </Link>
  );
}

export default function CreatorsIndex() {
  const { creators } = useLoaderData();

  return (
    <div className="min-h-screen bg-[var(--color-primary)]">
      <section className="pt-10 pb-6 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/city"
            className="text-xs text-black/40 hover:text-black/60 transition-colors mb-5 inline-block"
          >
            ← Back to directory
          </Link>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Creators</h1>
          <p className="text-sm text-black/50 max-w-xl mb-8">
            Independent artists, makers, and designers rooted in Barcelona's nature-led creative scene.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {creators.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
