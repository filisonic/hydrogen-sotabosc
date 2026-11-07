import {tinyfishApiKeyFromEnv} from './project-env';

const SEARCH_URL = 'https://api.search.tinyfish.ai';

export type TinyFishSearchHit = {
  title?: string;
  url?: string;
  snippet?: string;
  date?: string;
  publisher?: string;
  site_name?: string;
  thumbnail_url?: string;
};

export async function tinyfishSearch(
  query: string,
  opts: {
    purpose?: string;
    domainType?: 'web' | 'news';
    location?: string;
    language?: string;
    afterDate?: string;
    apiKey?: string;
  } = {},
): Promise<TinyFishSearchHit[]> {
  const apiKey = opts.apiKey ?? tinyfishApiKeyFromEnv();
  if (!apiKey) {
    throw new Error(
      'TINYFISH_API_KEY missing. Add it to .env or run: tinyfish auth set',
    );
  }

  const params = new URLSearchParams({
    query,
    domain_type: opts.domainType ?? 'news',
    language: opts.language ?? 'en',
    location: opts.location ?? 'ES',
    include_thumbnail: 'true',
  });
  if (opts.purpose) params.set('purpose', opts.purpose);
  if (opts.afterDate) params.set('after_date', opts.afterDate);

  const res = await fetch(`${SEARCH_URL}?${params}`, {
    headers: {'X-API-Key': apiKey},
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`TinyFish search ${res.status}: ${body.slice(0, 240)}`);
  }
  const data = (await res.json()) as {
    results?: TinyFishSearchHit[];
  };
  return Array.isArray(data.results) ? data.results : [];
}
