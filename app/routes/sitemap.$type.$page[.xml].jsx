import {getSitemap} from '@shopify/hydrogen';

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({request, params, context: {storefront}}) {
  const response = await getSitemap({
    storefront,
    request,
    params,
  });

  response.headers.set('Cache-Control', `max-age=${60 * 60 * 24}`);

  return response;
}

/** @typedef {import('./+types/sitemap.$type.$page[.xml]').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
