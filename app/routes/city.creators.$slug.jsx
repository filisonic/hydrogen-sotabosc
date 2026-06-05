import { useLoaderData, Link } from 'react-router';
import { useEffect } from 'react';
import { DirectorySurface } from '~/components/directory/DirectorySurface';
import { getDomain } from '~/lib/directory/domains';
import { trackCreatorView } from '~/lib/analytics';
import { openGraphImageMeta } from '~/lib/seo/siteImagery';
import { directoryRoutes } from '~/lib/directory/routes';
import { JsonLd } from '~/components/seo/JsonLd';
import { buildBreadcrumbListJsonLd } from '~/lib/seo/jsonLd';
import { canonicalLinkMeta } from '~/lib/seo/metaHelpers';

export const meta = ({ data }) => {
  if (!data?.creator) return [{ title: 'Creator Not Found — Sotabosc City' }];
  const path = directoryRoutes.creator(data.creator.slug);
  return [
    { title: `${data.creator.displayName} — Sotabosc Creators` },
    { name: 'description', content: data.creator.bio },
    ...canonicalLinkMeta(data?.origin, path),
    ...openGraphImageMeta(data?.origin),
  ];
};

export async function loader({ params, request }) {
  const { getCreatorBySlug } = await import('~/lib/directory/seed.server');
  const creator = getCreatorBySlug(params.slug);
  if (!creator) throw new Response('Creator not found', { status: 404 });
  return { creator, origin: new URL(request.url).origin };
}

export default function CreatorDetail() {
  const { creator, origin } = useLoaderData();
  const pageUrl = `${origin}${directoryRoutes.creator(creator.slug)}`;
  const breadcrumbLd = buildBreadcrumbListJsonLd([
    { name: 'Home', url: `${origin}/` },
    { name: 'Barcelona', url: `${origin}${directoryRoutes.city()}` },
    { name: 'Creators', url: `${origin}${directoryRoutes.creators()}` },
    { name: creator.displayName, url: pageUrl },
  ]);
  const domain = getDomain(creator.primaryDomain);

  useEffect(() => {
    trackCreatorView(creator.slug, creator.primaryDomain);
  }, [creator.slug, creator.primaryDomain]);

  const storeUrl = creator.productCollectionHandle
    ? `/collections/${creator.productCollectionHandle}`
    : null;

  return (
    <DirectorySurface>
      <JsonLd data={breadcrumbLd} />
      <section className="pt-8 pb-6 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/city/creators"
            className="text-xs mb-5 inline-block transition-opacity hover:opacity-80"
            style={{ color: 'var(--sotabosc-muted)' }}
          >
            ← All creators
          </Link>

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
                {domain.emoji}{' '}
                {domain.role ? `${domain.role} · ${domain.label}` : domain.label}
              </span>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-1 font-[family-name:var(--font-display)]">
                {creator.displayName}
              </h1>
              <p className="text-sm" style={{ color: 'var(--sotabosc-muted)' }}>
                {creator.city}
              </p>
            </div>
          </div>

          <div
            className="rounded-2xl border p-6 mb-6"
            style={{
              backgroundColor: 'var(--sotabosc-surface)',
              borderColor: 'var(--sotabosc-border)',
            }}
          >
            <p className="text-base leading-relaxed" style={{ color: 'var(--sotabosc-text)', opacity: 0.9 }}>
              {creator.bio}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 mb-12">
            {storeUrl && (
              <Link
                to={storeUrl}
                className="inline-flex items-center gap-2 font-bold text-sm px-6 py-3 rounded-full transition-opacity hover:opacity-90 shadow-sm"
                style={{
                  backgroundColor: 'var(--sotabosc-accent)',
                  color: 'var(--sotabosc-surface)',
                }}
              >
                Visit Store
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            )}
            {creator.websiteUrl && (
              <a
                href={creator.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-bold text-sm px-6 py-3 rounded-full border transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: 'var(--sotabosc-surface-muted)',
                  borderColor: 'var(--sotabosc-border)',
                  color: 'var(--sotabosc-text)',
                }}
              >
                Website ↗
              </a>
            )}
          </div>

          <div className="pt-8 border-t" style={{ borderColor: 'var(--sotabosc-border)' }}>
            <Link
              to="/city/creators"
              className="text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ color: 'var(--sotabosc-muted)' }}
            >
              View all creators →
            </Link>
          </div>
        </div>
      </section>
    </DirectorySurface>
  );
}
