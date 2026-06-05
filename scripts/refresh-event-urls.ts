/**
 * Discover event page URLs via Firecrawl search → reports/event-urls-queue.txt
 *
 * Usage:
 *   npx tsx scripts/refresh-event-urls.ts
 *   npx tsx scripts/refresh-event-urls.ts --dry-run
 *   npx tsx scripts/refresh-event-urls.ts --replace
 *
 * Merges with existing queue unless --replace. Keeps manual URLs (lines not starting with # auto:).
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { firecrawlSearch } from './lib/firecrawl-search';
import { firecrawlApiKeyFromEnv, loadDotEnvFromRoot, PROJECT_ROOT } from './lib/project-env';

const OUT_FILE = path.join(PROJECT_ROOT, 'reports', 'event-urls-queue.txt');

/** Editorial search set — Catalunya / Spain, not Barcelona-only */
const DEFAULT_QUERIES = [
  'site:eventbrite.es Catalunya taller workshop',
  'site:eventbrite.es Barcelona yoga meditation retreat',
  'site:eventbrite.es Girona wellness nature event',
  'site:eventbrite.es Tarragona cultura taller',
  'agenda sostenible Barcelona actividad taller',
  'retiro yoga naturaleza Catalunya',
  'taller cerámica Barcelona evento',
  'festival arte contemporáneo Catalunya',
];

const BLOCKED_HOST_FRAGMENTS = [
  'facebook.com',
  'instagram.com',
  'twitter.com',
  'x.com',
  'linkedin.com',
  'pinterest.',
  'youtube.com',
  'tiktok.com',
  'google.com',
  'amazon.',
  'wikipedia.org',
];

const PREFERRED_PATH_HINTS = [
  '/e/',
  '/events/',
  '/event/',
  '/evento',
  '/taller',
  '/workshop',
  '/retreat',
  '/retir',
  '/agenda',
  '/actividad',
  'eventbrite.',
  'entradas',
  'entrades',
];

function parseArgs(argv: string[]) {
  let dryRun = false;
  let replace = false;
  let limitPerQuery = 8;
  for (const a of argv) {
    if (a === '--dry-run') dryRun = true;
    else if (a === '--replace') replace = true;
    else if (a.startsWith('--limit=')) limitPerQuery = Number(a.slice(8)) || 8;
  }
  return { dryRun, replace, limitPerQuery };
}

function isLikelyEventUrl(url: string): boolean {
  const u = url.toLowerCase();
  if (BLOCKED_HOST_FRAGMENTS.some((h) => u.includes(h))) return false;
  // Eventbrite listing hubs rarely expose JSON-LD Event — keep ticket pages only
  if (u.includes('eventbrite.')) {
    return u.includes('/e/') || u.includes('-tickets-');
  }
  if (PREFERRED_PATH_HINTS.some((h) => u.includes(h))) return true;
  // Venue / municipal pages that often publish JSON-LD Event
  if (u.includes('ajuntament.') && (u.includes('agenda') || u.includes('activitat'))) return true;
  if (u.includes('.cat/') && (u.includes('agenda') || u.includes('activit'))) return true;
  return false;
}

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = '';
    return u.href.replace(/\/$/, '');
  } catch {
    return url.trim();
  }
}

async function readExistingQueue(): Promise<{ manual: string[]; auto: string[] }> {
  try {
    const text = await readFile(OUT_FILE, 'utf8');
    const manual: string[] = [];
    const auto: string[] = [];
    for (const line of text.split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const url = t.split('#')[0]!.trim();
      if (!url) continue;
      if (/# auto:/i.test(line)) auto.push(url);
      else manual.push(url);
    }
    return { manual, auto };
  } catch {
    return { manual: [], auto: [] };
  }
}

async function main() {
  await loadDotEnvFromRoot();
  const { dryRun, replace, limitPerQuery } = parseArgs(process.argv.slice(2));

  const apiKey = firecrawlApiKeyFromEnv();
  if (!apiKey) {
    console.error('Missing FIRECRAWL_API_KEY in .env');
    process.exit(1);
  }

  const discovered = new Set<string>();
  for (const query of DEFAULT_QUERIES) {
    console.log(`[search] ${query}`);
    try {
      const hits = await firecrawlSearch(query, { limit: limitPerQuery, apiKey });
      for (const hit of hits) {
        const url = normalizeUrl(hit.url);
        if (isLikelyEventUrl(url)) discovered.add(url);
      }
      console.log(`  → ${hits.length} hits, ${discovered.size} unique event-like URLs so far`);
    } catch (e) {
      console.warn(`  search failed: ${e instanceof Error ? e.message : String(e)}`);
    }
    await new Promise((r) => setTimeout(r, 1200));
  }

  const { manual, auto: prevAuto } = await readExistingQueue();
  const manualSet = new Set(manual);
  const merged = replace
    ? [...new Set([...manual, ...discovered])]
    : [...new Set([...manual, ...prevAuto, ...discovered])];

  const header = [
    '# Sotabosc event URL queue — used by npm run pipeline:auto-events',
    '# Manual URLs: add plain https:// lines below',
    '# Auto URLs: refreshed by scripts/refresh-event-urls.ts (tagged # auto:)',
    '',
  ];
  const body: string[] = [];
  for (const url of merged) {
    if (manualSet.has(url)) body.push(url);
    else body.push(`${url}  # auto:`);
  }
  const fileText = `${header.join('\n')}${body.join('\n')}\n`;

  console.log(`Queue: ${merged.length} URLs (${discovered.size} newly discovered this run)`);

  if (dryRun) {
    for (const u of [...discovered].slice(0, 20)) console.log(`  ${u}`);
    if (discovered.size > 20) console.log(`  … and ${discovered.size - 20} more`);
    return;
  }

  await writeFile(OUT_FILE, fileText, 'utf8');
  console.log(`Wrote ${OUT_FILE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
