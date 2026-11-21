/**
 * Build a Shopify CDN URL at a target width (and optional srcset).
 * Non-Shopify URLs (Unsplash stock, agenda CDNs) are returned unchanged.
 * @param {string | null | undefined} url
 * @param {number} width
 */
export function shopifyImageUrl(url, width) {
  if (!url) return '';
  if (!/cdn\.shopify\.com/i.test(url)) return url;
  try {
    const u = new URL(url);
    u.searchParams.set('width', String(width));
    return u.toString();
  } catch {
    const join = url.includes('?') ? '&' : '?';
    return `${url}${join}width=${width}`;
  }
}

/**
 * @param {string | null | undefined} url
 * @param {number[]} widths
 */
export function shopifyImageSrcSet(url, widths = [640, 960, 1280, 1600, 2000]) {
  if (!url) return undefined;
  if (!/cdn\.shopify\.com/i.test(url)) return undefined;
  return widths.map((w) => `${shopifyImageUrl(url, w)} ${w}w`).join(', ');
}

/**
 * Pull the first <img src> from article HTML when Shopify has no featured image.
 * @param {string | null | undefined} html
 */
export function firstImageSrcFromHtml(html) {
  if (!html) return null;
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] || null;
}
