/** @param {string} iso */
export function formatJournalDate(iso) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(iso));
}

/** @param {string | null | undefined} html */
export function excerptFromHtml(html, maxLength = 160) {
  if (!html) return '';
  const text = html.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
}

/** @param {string | null | undefined} html */
export function readingTimeFromHtml(html, wordsPerMinute = 200) {
  if (!html) return '';
  const text = html.replace(/<[^>]*>?/gm, ' ').trim();
  if (!text) return '';
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / wordsPerMinute));
  return `${minutes} min read`;
}
