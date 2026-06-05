import { firecrawlApiKeyFromEnv } from './project-env';

const FIRECRAWL_SEARCH = 'https://api.firecrawl.dev/v1/search';

export type FirecrawlSearchHit = {
  url: string;
  title?: string;
  description?: string;
};

function pickUrl(item: Record<string, unknown>): string | undefined {
  const u = item.url ?? item.link ?? item.sourceURL;
  return typeof u === 'string' && u.trim() ? u.trim() : undefined;
}

function normalizeHits(data: unknown): FirecrawlSearchHit[] {
  if (!data) return [];
  const rawList = Array.isArray(data)
    ? data
    : typeof data === 'object' && data !== null && Array.isArray((data as { web?: unknown }).web)
      ? (data as { web: unknown[] }).web
      : [];
  const out: FirecrawlSearchHit[] = [];
  for (const item of rawList) {
    if (!item || typeof item !== 'object') continue;
    const rec = item as Record<string, unknown>;
    const url = pickUrl(rec);
    if (!url) continue;
    out.push({
      url,
      title: typeof rec.title === 'string' ? rec.title : undefined,
      description: typeof rec.description === 'string' ? rec.description : undefined,
    });
  }
  return out;
}

export async function firecrawlSearch(
  query: string,
  opts?: { limit?: number; apiKey?: string },
): Promise<FirecrawlSearchHit[]> {
  const apiKey = opts?.apiKey ?? firecrawlApiKeyFromEnv();
  if (!apiKey) throw new Error('Missing FIRECRAWL_API_KEY');

  const res = await fetch(FIRECRAWL_SEARCH, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query,
      limit: opts?.limit ?? 8,
      lang: 'es',
      country: 'es',
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Firecrawl search HTTP ${res.status}: ${text.slice(0, 400)}`);
  }

  const json = JSON.parse(text) as { success?: boolean; data?: unknown };
  if (json.success === false) {
    throw new Error(`Firecrawl search failed: ${text.slice(0, 400)}`);
  }
  return normalizeHits(json.data);
}
