import { buildDirectorySitemapXml } from '~/lib/seo/directorySitemap.server';

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({ request }) {
  const origin = new URL(request.url).origin;
  const body = buildDirectorySitemapXml(origin);

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': `max-age=${60 * 60 * 24}`,
    },
  });
}

/** @typedef {import('./+types/[directory-sitemap.xml]').Route} Route */
