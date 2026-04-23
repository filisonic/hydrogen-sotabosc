import { firecrawlApiKeyFromEnv } from './project-env';

const FIRECRAWL_SCRAPE = 'https://api.firecrawl.dev/v1/scrape';

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleFromHtml(html: string): string | null {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!m?.[1]) return null;
  return stripHtml(m[1]).slice(0, 200) || null;
}

async function fetchPlain(url: string): Promise<{ title: string; text: string }> {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: {
      Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
      'User-Agent': 'SotaboscDraftBot/1.0',
    },
  });
  const raw = await res.text();
  const ct = res.headers.get('content-type') ?? '';
  if (ct.includes('json')) return { title: url, text: raw };
  const docTitle = titleFromHtml(raw);
  return { title: docTitle ?? url, text: stripHtml(raw) };
}

async function firecrawlMarkdown(
  pageUrl: string,
  apiKey: string,
): Promise<{ title: string; text: string }> {
  const res = await fetch(FIRECRAWL_SCRAPE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      url: pageUrl,
      formats: ['markdown'],
      onlyMainContent: true,
    }),
  });
  const bodyText = await res.text();
  if (!res.ok) {
    throw new Error(`Firecrawl HTTP ${res.status}: ${bodyText.slice(0, 400)}`);
  }
  const json = JSON.parse(bodyText) as {
    data?: {
      markdown?: string;
      metadata?: Record<string, unknown>;
    };
  };
  const data = json.data ?? {};
  const meta = data.metadata ?? {};
  const title =
    (meta.title as string) ||
    (meta.ogTitle as string) ||
    (meta['og:title'] as string) ||
    pageUrl;
  const md = (data.markdown as string) || '';
  return { title, text: md || stripHtml(bodyText) };
}

export type FetchPageResult = {
  title: string;
  text: string;
  method: 'firecrawl' | 'http';
  error?: string;
};

/**
 * Fetches readable text for alignment scoring. Prefer Firecrawl when apiKey is set.
 */
export async function fetchPageText(
  url: string,
  opts?: { apiKey?: string; noFirecrawl?: boolean },
): Promise<FetchPageResult> {
  try {
    new URL(url);
  } catch {
    return { title: url, text: '', method: 'http', error: 'invalid URL' };
  }

  const apiKey =
    opts?.noFirecrawl ? undefined : (opts?.apiKey ?? firecrawlApiKeyFromEnv());

  try {
    if (apiKey) {
      const fc = await firecrawlMarkdown(url, apiKey);
      return { title: fc.title, text: fc.text, method: 'firecrawl' };
    }
    const plain = await fetchPlain(url);
    return { title: plain.title, text: plain.text, method: 'http' };
  } catch (e) {
    return {
      title: url,
      text: '',
      method: 'http',
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
