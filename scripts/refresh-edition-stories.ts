/**
 * Pull culture-aligned stories via TinyFish Search into
 * `app/lib/directory/auto-import.edition-stories.json` for the magazine desk.
 *
 * Prefers recent Barcelona / Spain culture coverage (default: last ~45 days).
 *
 * Usage:
 *   npx tsx scripts/refresh-edition-stories.ts
 *   npx tsx scripts/refresh-edition-stories.ts --dry-run
 *   npx tsx scripts/refresh-edition-stories.ts --min-score=75 --after=2026-10-20
 */

import {createHash} from 'node:crypto';
import {writeFile} from 'node:fs/promises';
import path from 'node:path';

import type {EditionStory} from '../app/lib/directory/editionStories';
import {
  EDITION_STORY_QUERIES,
  scoreEditionStoryAlignment,
} from '../app/lib/directory/editionStoryAlignment';
import {loadDotEnvFromRoot, PROJECT_ROOT, tinyfishApiKeyFromEnv} from './lib/project-env';
import {tinyfishSearch} from './lib/tinyfish';

const OUT_FILE = path.join(
  PROJECT_ROOT,
  'app',
  'lib',
  'directory',
  'auto-import.edition-stories.json',
);

const DAY_MS = 24 * 60 * 60 * 1000;

function parseArgs(argv: string[]) {
  let dryRun = false;
  let minScore = 70;
  let after: string | undefined;
  for (const a of argv) {
    if (a === '--dry-run') dryRun = true;
    else if (a.startsWith('--min-score=')) minScore = Number(a.slice(12)) || 70;
    else if (a.startsWith('--after=')) after = a.slice(8).trim();
  }
  if (!after) {
    const d = new Date(Date.now() - 45 * DAY_MS);
    after = d.toISOString().slice(0, 10);
  }
  return {dryRun, minScore, after};
}

function storyId(url: string): string {
  return `tf_${createHash('sha256').update(url).digest('hex').slice(0, 12)}`;
}

function toIso(dateStr?: string): string | null {
  if (!dateStr) return null;
  const relative = dateStr.match(/^(\d+)\s+(hour|day|week|month)s?\s+ago$/i);
  if (relative) {
    const n = Number(relative[1]);
    const unit = relative[2].toLowerCase();
    const mult =
      unit === 'hour'
        ? 60 * 60 * 1000
        : unit === 'day'
          ? DAY_MS
          : unit === 'week'
            ? 7 * DAY_MS
            : 30 * DAY_MS;
    return new Date(Date.now() - n * mult).toISOString();
  }
  const t = Date.parse(dateStr);
  return Number.isFinite(t) ? new Date(t).toISOString() : null;
}

function recencyBoost(iso: string | null, afterIso: string): number {
  if (!iso) return 0;
  const t = Date.parse(iso);
  const after = Date.parse(afterIso);
  if (!Number.isFinite(t)) return 0;
  if (Number.isFinite(after) && t < after) return -40;
  const ageDays = (Date.now() - t) / DAY_MS;
  if (ageDays <= 7) return 25;
  if (ageDays <= 21) return 15;
  if (ageDays <= 45) return 8;
  return -10;
}

function barcelonaBoost(title: string, url: string): number {
  return /\bbarcelona\b/i.test(`${title} ${url}`) ? 10 : 0;
}

async function main() {
  await loadDotEnvFromRoot();
  const {dryRun, minScore, after} = parseArgs(process.argv.slice(2));
  if (!tinyfishApiKeyFromEnv()) {
    console.error(
      'Missing TINYFISH_API_KEY. Add to .env or: echo KEY | npx @tiny-fish/cli auth set',
    );
    process.exit(1);
  }

  console.log(`[tinyfish] preferring stories after ${after}`);

  const collected: EditionStory[] = [];
  const seen = new Set<string>();

  for (const q of EDITION_STORY_QUERIES) {
    console.log(`[tinyfish] search: ${q.query}`);
    const hits = await tinyfishSearch(q.query, {
      purpose:
        'Fresh Barcelona / Spain cultural magazine desk — art, music, film, design, fashion. Prefer last 45 days. Exclude tech and hotel listicles when possible.',
      domainType: 'news',
      location: 'ES',
      language: 'en',
      afterDate: after,
    });

    for (const hit of hits) {
      const url = hit.url?.trim();
      const title = hit.title?.trim();
      if (!url || !title) continue;
      const key = url.replace(/#.*$/, '').toLowerCase();
      if (seen.has(key)) continue;

      const alignment = scoreEditionStoryAlignment({
        title,
        summary: hit.snippet,
        sourceUrl: url,
        publisher: hit.publisher || hit.site_name,
      });
      const publishedAt = toIso(hit.date);
      const score =
        alignment.score +
        recencyBoost(publishedAt, `${after}T00:00:00.000Z`) +
        barcelonaBoost(title, url);

      if (score < minScore || !alignment.rubrique) {
        console.log(
          `  skip (${alignment.reasons.join(', ') || 'low score'}): ${title.slice(0, 72)}`,
        );
        continue;
      }

      // Soft-demote pure hotel roundups so art/music/film can lead
      const hotelList =
        /\bhotels?\b/i.test(title) &&
        /\b(best|top|luxury|boutique)\b/i.test(title);
      const finalScore = hotelList ? score - 15 : score;
      if (finalScore < minScore) {
        console.log(`  skip (hotel listicle): ${title.slice(0, 72)}`);
        continue;
      }

      seen.add(key);
      collected.push({
        id: storyId(url),
        title,
        summary: (hit.snippet || title).slice(0, 220),
        url,
        publisher: hit.publisher || hit.site_name || 'Web',
        publishedAt,
        imageUrl: hit.thumbnail_url || null,
        rubrique: alignment.rubrique,
        score: Math.min(100, finalScore),
        source: 'tinyfish',
      });
      console.log(
        `  +${Math.min(100, finalScore)} [${alignment.rubrique}] ${title.slice(0, 72)}`,
      );
    }
  }

  collected.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return tb - ta;
  });

  const pack = {
    updatedAt: new Date().toISOString(),
    stories: collected.slice(0, 24),
  };

  console.log(`\nKept ${pack.stories.length} stories (min-score ${minScore}, after ${after}).`);
  if (dryRun) {
    console.log(JSON.stringify(pack, null, 2));
    return;
  }

  await writeFile(OUT_FILE, `${JSON.stringify(pack, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${OUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
