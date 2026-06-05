import { LISTING_CATEGORY_KEYS } from '../directory/domains';
import { getNeighborhoodSitemapSlugs } from '../directory/neighborhoods.server';
import { directoryRoutes } from '../directory/routes';
import { SEED_CREATORS, SEED_PLACES, getActiveEvents } from '../directory/seed.server';
import type { ListingCategory } from '../directory/types';
import { CATALUNYA_HIKES } from '../hiking/catalunya.seed';
import { getGuideSitemapSlugs } from './guidesContent';

/** Stable pathnames for the Barcelona directory (no origin). */
export function getDirectorySitemapPathnames(): string[] {
  const paths: string[] = [directoryRoutes.city()];

  paths.push(directoryRoutes.guides());
  for (const slug of getGuideSitemapSlugs()) {
    paths.push(directoryRoutes.guide(slug));
  }

  for (const slug of getNeighborhoodSitemapSlugs()) {
    paths.push(directoryRoutes.neighborhood(slug));
  }

  for (const cat of LISTING_CATEGORY_KEYS) {
    paths.push(directoryRoutes.category(cat as ListingCategory));
  }

  for (const p of SEED_PLACES) {
    paths.push(directoryRoutes.place(p.slug));
  }

  paths.push(directoryRoutes.events());
  for (const e of getActiveEvents()) {
    paths.push(directoryRoutes.event(e.slug));
  }

  paths.push(directoryRoutes.creators());
  for (const c of SEED_CREATORS) {
    paths.push(directoryRoutes.creator(c.slug));
  }

  paths.push(directoryRoutes.hikes());
  for (const h of CATALUNYA_HIKES) {
    paths.push(directoryRoutes.hike(h.slug));
  }

  return paths;
}

export function buildDirectorySitemapXml(origin: string): string {
  const base = origin.replace(/\/$/, '');
  const paths = getDirectorySitemapPathnames();
  const city = directoryRoutes.city();

  const urls = paths
    .map((path) => {
      const loc = `${base}${path}`;
      const isHikesIndex = path === directoryRoutes.hikes();
      const isHikeDetail =
        path.startsWith(`${city}/hikes/`) && path !== directoryRoutes.hikes();
      const isGuidesIndex = path === directoryRoutes.guides();
      const isGuideDetail = path.startsWith(`${city}/guides/`) && !isGuidesIndex;
      const isNeighborhood = path.startsWith(`${city}/neighbourhoods/`);

      const priority =
        path === city
          ? '0.95'
          : path.startsWith(`${city}/categories/`)
            ? '0.85'
          : path.startsWith(`${city}/places/`)
            ? '0.8'
          : isHikesIndex
            ? '0.82'
          : isNeighborhood
            ? '0.79'
          : isGuidesIndex
            ? '0.78'
          : isGuideDetail
            ? '0.77'
          : isHikeDetail
            ? '0.76'
          : '0.7';

      const changefreq =
        path === directoryRoutes.events() || path.startsWith(`${city}/events/`)
          ? 'daily'
          : 'weekly';

      return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
