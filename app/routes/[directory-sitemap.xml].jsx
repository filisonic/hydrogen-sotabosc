import { buildDirectorySitemapXml } from '~/lib/seo/directorySitemap.server';
import { getCityDirectory } from '~/lib/directory/source.server';

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({ request, context }) {
  const origin = new URL(request.url).origin;
  const body = buildDirectorySitemapXml(origin, await getCityDirectory(context));

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': `max-age=${60 * 60 * 24}`,
    },
  });
}

/** @typedef {import('./+types/[directory-sitemap.xml]').Route} Route */
