/** Strip tracking junk so the same event page is only scraped once. */
export function canonicalizeEventUrl(raw: string): string | null {
  const trimmed = raw.split('#')[0]?.trim() ?? '';
  if (!trimmed || trimmed.startsWith('#')) return null;
  try {
    const u = new URL(trimmed);
    u.hash = '';
    for (const key of [...u.searchParams.keys()]) {
      if (
        /^(utm_|srsltid$|fbclid$|gclid$|mc_eid$)/i.test(key) ||
        key === 'aff' ||
        key === 'ref'
      ) {
        u.searchParams.delete(key);
      }
    }
    if ([...u.searchParams.keys()].length === 0) u.search = '';
    return u.href.replace(/\/$/, '');
  } catch {
    return trimmed || null;
  }
}

export function urlsFromQueueText(text: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const url = canonicalizeEventUrl(t);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    out.push(url);
  }
  return out;
}
