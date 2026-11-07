/**
 * Pull culture-aligned stories via TinyFish Search into
 * `app/lib/directory/auto-import.edition-stories.json` for the magazine desk.
 *
 * Usage:
 *   npx tsx scripts/refresh-edition-stories.ts
 *   npx tsx scripts/refresh-edition-stories.ts --dry-run
 *   npx tsx scripts/refresh-edition-stories.ts --min-score=75
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

function parseArgs(argv: string[]) {
  let dryRun = false;
  let minScore = 70;
  for (const a of argv) {
    if (a === '--dry-run') dryRun = true;
    else if (a.startsWith('--min-score=')) minScore = Number(a.slice(12)) || 70;
  }
  return {dryRun, minScore};
}

function storyId(url: string): string {
  return `tf_${createHash('sha256').update(url).digest('hex').slice(0, 12)}`;
}

function toIso(dateStr?: string): string | null {
  if (!dateStr) return null;
  const t = Date.parse(dateStr);
  return Number.isFinite(t) ? new Date(t).toISOString() : null;
}

async function main() {
  await loadDotEnvFromRoot();
  const {dryRun, minScore} = parseArgs(process.argv.slice(2));
  if (!tinyfishApiKeyFromEnv()) {
    console.error(
      'Missing TINYFISH_API_KEY. Add to .env or: echo KEY | npx @tiny-fish/cli auth set',
    );
    process.exit(1);
  }

  const collected: EditionStory[] = [];
  const seen = new Set<string>();

  for (const q of EDITION_STORY_QUERIES) {
    console.log(`[tinyfish] search: ${q.query}`);
    const hits = await tinyfishSearch(q.query, {
      purpose:
        'Barcelona / Spain cultural magazine desk — art, music, film, design, fashion, luxury. Exclude tech and off-city noise.',
      domainType: 'news',
      location: 'ES',
      language: 'en',
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
      if (alignment.score < minScore || !alignment.rubrique) {
        console.log(`  skip (${alignment.reasons.join(', ')}): ${title.slice(0, 72)}`);
        continue;
      }

      seen.add(key);
      collected.push({
        id: storyId(url),
        title,
        summary: (hit.snippet || title).slice(0, 220),
        url,
        publisher: hit.publisher || hit.site_name || 'Web',
        publishedAt: toIso(hit.date),
        imageUrl: hit.thumbnail_url || null,
        rubrique: alignment.rubrique,
        score: alignment.score,
        source: 'tinyfish',
      });
      console.log(`  +${alignment.score} [${alignment.rubrique}] ${title.slice(0, 72)}`);
    }
  }

  collected.sort((a, b) => b.score - a.score);
  const pack = {
    updatedAt: new Date().toISOString(),
    stories: collected.slice(0, 24),
  };

  console.log(`\nKept ${pack.stories.length} stories (min-score ${minScore}).`);
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
