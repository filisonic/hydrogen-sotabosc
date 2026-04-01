import { useLoaderData, Link } from 'react-router';
import { useEffect } from 'react';
import { getDomain } from '~/lib/directory/domains';
import { trackCreatorView } from '~/lib/analytics';

export const meta = ({ data }) => {
  if (!data?.creator) return [{ title: 'Creator Not Found — Sotabosc City' }];
  return [
    { title: `${data.creator.displayName} — Sotabosc Creators` },
    { name: 'description', content: data.creator.bio },
  ];
};

export async function loader({ params }) {
  const { getCreatorBySlug } = await import('~/lib/directory/seed.server');
  const creator = getCreatorBySlug(params.slug);
  if (!creator) throw new Response('Creator not found', { status: 404 });
  return { creator };
}

export default function CreatorDetail() {
  const { creator } = useLoaderData();
  const domain = getDomain(creator.primaryDomain);

  useEffect(() => {
    trackCreatorView(creator.slug, creator.primaryDomain);
  }, [creator.slug, creator.primaryDomain]);

  const storeUrl = creator.productCollectionHandle
    ? `/collections/${creator.productCollectionHandle}`
    : null;

  return (
    <div className="min-h-screen bg-[var(--color-primary)]">
      <section className="pt-8 pb-6 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/city/creators"
            className="text-xs text-black/40 hover:text-black/60 transition-colors mb-5 inline-block"
          >
            ← All creators
          </Link>

          {/* Hero */}
          <div className="flex items-start gap-6 mb-8">
            {creator.imageUrl ? (
              <img
                src={creator.imageUrl}
                alt={creator.displayName}
                className="w-24 h-24 rounded-2xl object-cover flex-shrink-0"
              />
            ) : (
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
                style={{ backgroundColor: `${domain.color}18` }}
              >
                {domain.emoji}
              </div>
            )}
            <div>
              <span
                className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full mb-2"
                style={{ backgroundColor: `${domain.color}20`, color: domain.color }}
              >
                {domain.emoji} {domain.label}
              </span>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-1">{creator.displayName}</h1>
              <p className="text-sm text-black/50">{creator.city}</p>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-white rounded-2xl border border-black/5 p-6 mb-6">
            <p className="text-base text-black/70 leading-relaxed">{creator.bio}</p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-3 mb-12">
            {storeUrl && (
              <a
                href={storeUrl}
                className="inline-flex items-center gap-2 bg-black text-white font-bold text-sm px-6 py-3 rounded-full hover:bg-black/80 transition-colors shadow"
              >
                Visit Store
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            )}
            {creator.websiteUrl && (
              <a
                href={creator.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-black/5 hover:bg-black/10 text-black font-bold text-sm px-6 py-3 rounded-full transition-colors"
              >
                Website ↗
              </a>
            )}
          </div>

          {/* Other creators */}
          <div className="pt-8 border-t border-black/5">
            <Link
              to="/city/creators"
              className="text-sm font-semibold text-black/40 hover:text-black/60 transition-colors"
            >
              View all creators →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
