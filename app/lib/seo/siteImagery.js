/**
 * Optional absolute URLs for OG/Twitter cards. Add a PNG/WebP at this path (e.g. from Google image tools).
 */
export const DEFAULT_OG_IMAGE_PATH = '/images/og/sotabosc-share.png';

/** @param {string | undefined} origin Request URL origin, e.g. from `new URL(request.url).origin` */
export function openGraphImageMeta(origin) {
  if (!origin) return [];
  const url = `${origin.replace(/\/$/, '')}${DEFAULT_OG_IMAGE_PATH}`;
  return [
    { property: 'og:image', content: url },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:image', content: url },
  ];
}
