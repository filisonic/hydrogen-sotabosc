/**
 * @param {string} origin
 * @param {string} pathname e.g. `/city` or `/city/categories/art-gallery`
 */
export function canonicalLinkMeta(origin, pathname) {
  if (!origin || !pathname) return [];
  const base = origin.replace(/\/$/, '');
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const href = `${base}${path}`;
  return [
    { rel: 'canonical', href },
    { property: 'og:url', content: href },
  ];
}
