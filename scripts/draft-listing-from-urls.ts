/**
 * Scrape URLs → run Sotabosc alignment checklist → write draft JSON for seed review.
 *
 * Setup:
 *   - Optional: FIRECRAWL_API_KEY in `.env` (strongly recommended — JS-heavy sites need it)
 *
 * Usage:
 *   npx tsx scripts/draft-listing-from-urls.ts --url=https://example.com/venue
 *   npx tsx scripts/draft-listing-from-urls.ts --file=./urls.txt
 *   type urls.txt | npx tsx scripts/draft-listing-from-urls.ts --stdin
 *
 * Flags:
 *   --stdout     Print one JSON object per URL to stdout instead of writing reports/
 *   --no-firecrawl   Only use plain HTTP fetch (often empty on SPAs)
 *   --kind=auto|place|event
 *
 * Output (default): reports/draft-listings/<slug>-<timestamp>.json
 *
 * To merge without hand-editing seed: high-confidence places → `npm run ingest:listing` (see script header there).
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { fetchPageText } from './lib/fetch-page-text';
import { loadDotEnvFromRoot, firecrawlApiKeyFromEnv, PROJECT_ROOT } from './lib/project-env';
import {
  scoreAlignment,
  slugifyHint,
  type AlignmentResult,
} from './lib/sotabosc-alignment';

const ROOT = PROJECT_ROOT;
const REPORT_DIR = path.join(ROOT, 'reports', 'draft-listings');

type Kind = 'place' | 'event' | 'auto';

function parseArgs(argv: string[]) {
  const urls: string[] = [];
  let file: string | undefined;
  let stdin = false;
  let stdout = false;
  let noFirecrawl = false;
  let kind: Kind = 'auto';

  for (const a of argv) {
    if (a.startsWith('--url=')) urls.push(a.slice(6).trim());
    else if (a.startsWith('--file=')) file = a.slice(7).trim();
    else if (a === '--stdin') stdin = true;
    else if (a === '--stdout') stdout = true;
    else if (a === '--no-firecrawl') noFirecrawl = true;
    else if (a.startsWith('--kind=')) {
      const v = a.slice(7).toLowerCase();
      if (v === 'place' || v === 'event' || v === 'auto') kind = v;
    }
  }
  return { urls, file, stdin, stdout, noFirecrawl, kind };
}

function safeHostname(u: string): string {
  try {
    return new URL(u).hostname.replace(/^www\./, '');
  } catch {
    return 'invalid-url';
  }
}

function inferKind(url: string, kind: Kind): 'place' | 'event' {
  if (kind === 'place' || kind === 'event') return kind;
  const u = url.toLowerCase();
  if (
    u.includes('eventbrite.') ||
    u.includes('/events/') ||
    u.includes('/event/') ||
    u.includes('/e/') ||
    u.includes('ticket') ||
    u.includes('entrades') ||
    u.includes('entradas')
  ) {
    return 'event';
  }
  return 'place';
}

function buildDraftPlace(
  url: string,
  title: string,
  alignment: AlignmentResult,
  excerpt: string,
) {
  const slug = slugifyHint(title) || slugifyHint(safeHostname(url));
  return {
    _comment: 'Fill id, address, neighborhood, city; verify website and categories.',
    id: 'pNEW',
    slug,
    name: title.slice(0, 120),
    summary: excerpt.slice(0, 280).replace(/\s+/g, ' ').trim() + (excerpt.length > 280 ? '…' : ''),
    address: '',
    neighborhood: '',
    city: '',
    categories: alignment.suggestedCategories,
    primaryDomain: alignment.suggestedPrimaryDomain,
    tags: [] as string[],
    website: url,
  };
}

function buildDraftEvent(url: string, title: string, alignment: AlignmentResult, excerpt: string) {
  const slug = slugifyHint(title) || 'event-draft';
  return {
    _comment: 'Set placeId to an existing SEED_PLACES id; set real ISO dates; fill tags (strings) by hand.',
    id: 'eNEW',
    slug,
    title: title.slice(0, 120),
    summary: excerpt.slice(0, 280).replace(/\s+/g, ' ').trim() + (excerpt.length > 280 ? '…' : ''),
    startsAt: '2026-01-01T10:00',
    endsAt: undefined as string | undefined,
    placeId: 'pPLACE_ID',
    placeName: '',
    primaryDomain: alignment.suggestedPrimaryDomain,
    tags: [] as string[],
    listingCategoryHints: alignment.suggestedCategories,
    sourceUrl: url,
  };
}

async function readStdinUrls(): Promise<string[]> {
  const chunks: Buffer[] = [];
  for await (const c of process.stdin) chunks.push(Buffer.from(c));
  const text = Buffer.concat(chunks).toString('utf8');
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !l.startsWith('#'));
}

async function main() {
  await loadDotEnvFromRoot();
  const argv = process.argv.slice(2);
  const { urls: argUrls, file, stdin, stdout, noFirecrawl, kind } = parseArgs(argv);

  let urls = [...argUrls];
  if (file) {
    const text = await readFile(path.resolve(ROOT, file), 'utf8');
    urls.push(
      ...text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .filter((l) => !l.startsWith('#')),
    );
  }
  if (stdin) {
    urls.push(...(await readStdinUrls()));
  }

  urls = [...new Set(urls.map((u) => u.trim()).filter(Boolean))];
  if (urls.length === 0) {
    console.error(
      'No URLs. Use --url=, --file=urls.txt, or pipe lines via --stdin.\nSee script header in scripts/draft-listing-from-urls.ts',
    );
    process.exit(1);
  }

  const apiKey = noFirecrawl ? undefined : firecrawlApiKeyFromEnv();
  if (!apiKey && !noFirecrawl) {
    console.warn(
      '[draft-listing] No FIRECRAWL_API_KEY — falling back to HTTP fetch (often weak on SPAs). Use .env or --no-firecrawl to silence.',
    );
  }

  if (!stdout) await mkdir(REPORT_DIR, { recursive: true });

  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

  for (const url of urls) {
    const fetched = await fetchPageText(url, { apiKey, noFirecrawl });
    const title = fetched.title;
    const text = fetched.text;
    const fetchMethod = fetched.method;
    const error = fetched.error;

    const excerpt = text.slice(0, 1200);
    const alignment = error ? null : scoreAlignment(text);
    const resolvedKind = inferKind(url, kind);

    const payload = {
      sourceUrl: url,
      fetchedAt: new Date().toISOString(),
      fetchMethod,
      fetchError: error,
      title,
      textLength: text.length,
      excerpt,
      alignment,
      inferredKind: resolvedKind,
      draftPlace:
        alignment && resolvedKind === 'place' ? buildDraftPlace(url, title, alignment, excerpt) : null,
      draftEvent:
        alignment && resolvedKind === 'event' ? buildDraftEvent(url, title, alignment, excerpt) : null,
      nextSteps: [
        'Verify name, address, dates, and that the listing matches your editorial bar.',
        'Places: optional `npm run ingest:listing` for high-score auto-merge (see ingest script).',
        'If event: ensure placeId exists in SEED_PLACES (add place first if needed).',
      ],
    };

    const jsonStr = JSON.stringify(payload, null, 2);

    if (stdout) {
      console.log(jsonStr);
    } else {
      const base = slugifyHint(title) || slugifyHint(safeHostname(url));
      const fname = `${base}-${ts}.json`.replace(/[/\\?%*:|"<>]/g, '-');
      const outPath = path.join(REPORT_DIR, fname);
      await writeFile(outPath, jsonStr, 'utf8');
      console.log(`Wrote ${outPath}  verdict=${alignment?.verdict ?? 'n/a'}  score=${alignment?.score ?? 'n/a'}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
