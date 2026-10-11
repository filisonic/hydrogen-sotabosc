import {ServerRouter} from 'react-router';
import {isbot} from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {createContentSecurityPolicy} from '@shopify/hydrogen';

/**
 * Extra allowances for the `/city/window` prototype only: the splat sorts in a blob
 * worker and loads from a blob the page assembles, face detection runs as WebAssembly,
 * and the detector model is hotlinked. The policy belongs to the document, so link to that page with
 * `reloadDocument`; arriving by client-side navigation keeps the previous page's policy.
 */
const WINDOW_PROTOTYPE_CSP = {
  scriptSrc: ["'self'", 'https://cdn.shopify.com', 'https://shopify.com', "'wasm-unsafe-eval'"],
  workerSrc: ["'self'", 'blob:'],
  connectSrc: ['https://storage.googleapis.com', 'blob:'],
};

/**
 * @param {Request} request
 * @param {number} responseStatusCode
 * @param {Headers} responseHeaders
 * @param {EntryContext} reactRouterContext
 * @param {HydrogenRouterContextProvider} context
 */
export default async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  reactRouterContext,
  context,
) {
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain:
        context.env.PUBLIC_CHECKOUT_DOMAIN || context.env.PUBLIC_STORE_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    // default-src does not cover hotlinked directory heroes; without img-src browsers still
    // evaluate images against default-src, which blocks images.unsplash.com.
    imgSrc: [
      "'self'",
      'https://cdn.shopify.com',
      'https://shopify.com',
      'https://images.unsplash.com',
      'https://i.vimeocdn.com',
      'https://i.ytimg.com',
    ],
    // Labs lightbox embeds (Vimeo + YouTube) + existing lead form iframe.
    frameSrc: [
      "'self'",
      'https://api.leadconnectorhq.com',
      'https://player.vimeo.com',
      'https://www.youtube.com',
      'https://www.youtube-nocookie.com',
    ],
    // Plotter / CDN mp4 playback in Labs lightbox.
    mediaSrc: ["'self'", 'https://philipcp.netlify.app', 'blob:'],
    ...(new URL(request.url).pathname === '/city/window' ? WINDOW_PROTOTYPE_CSP : {}),
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <ServerRouter
        context={reactRouterContext}
        url={request.url}
        nonce={nonce}
      />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}

/** @typedef {import('@shopify/hydrogen').HydrogenRouterContextProvider} HydrogenRouterContextProvider */
/** @typedef {import('react-router').EntryContext} EntryContext */
