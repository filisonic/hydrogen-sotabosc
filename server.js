// Virtual entry point for the app
import { storefrontRedirect } from '@shopify/hydrogen';
import { createRequestHandler } from '@shopify/hydrogen/oxygen';
import { createHydrogenRouterContext } from '~/lib/context';

/**
 * Export a fetch handler in module format.
 */
export default {
  /**
   * @param {Request} request
   * @param {Env} env
   * @param {ExecutionContext} executionContext
   * @return {Promise<Response>}
   */
  async fetch(request, env, executionContext) {
    try {
      // ─── Subdomain routing ───────────────────────────────────
      // Rewrite URLs based on subdomain so a single Oxygen deployment
      // serves city.sotabosc.world, directory.sotabosc.world, etc.
      const url = new URL(request.url);
      const hostname = url.hostname;

      if (hostname.startsWith('directory.')) {
        if (url.pathname === '/' || url.pathname === '') {
          const target = new URL('/city' + url.search, url);
          return Response.redirect(target.toString(), 302);
        }
        if (!url.pathname.startsWith('/city')) {
          const target = new URL('/city' + url.pathname + url.search, url);
          return Response.redirect(target.toString(), 301);
        }
      } else if (hostname.startsWith('tools.')) {
        if (!url.pathname.startsWith('/tools')) {
          const target = new URL(
            '/tools' + (url.pathname === '/' ? '' : url.pathname) + url.search,
            url,
          );
          return Response.redirect(target.toString(), 301);
        }
      } else if (hostname.startsWith('labs.')) {
        if (!url.pathname.startsWith('/labs')) {
          const target = new URL(
            '/labs' + (url.pathname === '/' ? '' : url.pathname) + url.search,
            url,
          );
          return Response.redirect(target.toString(), 301);
        }
      }
      // ─────────────────────────────────────────────────────────

      const hydrogenContext = await createHydrogenRouterContext(
        request,
        env,
        executionContext,
      );

      /**
       * Create a Remix request handler and pass
       * Hydrogen's Storefront client to the loader context.
       */
      const handleRequest = createRequestHandler({
        // eslint-disable-next-line import/no-unresolved
        build: await import('virtual:react-router/server-build'),
        mode: process.env.NODE_ENV,
        getLoadContext: () => hydrogenContext,
      });

      const response = await handleRequest(request);

      if (hydrogenContext.session.isPending) {
        response.headers.set(
          'Set-Cookie',
          await hydrogenContext.session.commit(),
        );
      }

      if (response.status === 404) {
        /**
         * Check for redirects only when there's a 404 from the app.
         * If the redirect doesn't exist, then `storefrontRedirect`
         * will pass through the 404 response.
         */
        return storefrontRedirect({
          request,
          response,
          storefront: hydrogenContext.storefront,
        });
      }

      return response;
    } catch (error) {
      console.error(error);
      return new Response(error.stack || error.message || 'An unexpected error occurred', { status: 500 });
    }
  },
};
