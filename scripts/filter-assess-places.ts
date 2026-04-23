/**
 * Run Sotabosc alignment scoring on place rows (curated + auto-import) and optionally prune JSON.
 *
 * Usage:
 *   npx tsx scripts/filter-assess-places.ts
 *   npx tsx scripts/filter-assess-places.ts --source=auto-import
 *   npx tsx scripts/filter-assess-places.ts --source=all --min-score=70
 *   npx tsx scripts/filter-assess-places.ts --source=auto-import --write-pruned
 *   npx tsx scripts/filter-assess-places.ts --json-summary
 *
 * --source=auto-import   app/lib/directory/auto-import.places.json only
 * --source=curated       Hand-picked rows from seed.server (via static import)
 * --source=all           curated + auto-import (merged like runtime SEED_PLACES)
 *
 * Note: short hand-written summaries often score lower than long template/OSM+boost text — tune
 * --min-score / --min-review-score or treat low scores on curated slugs as a false negative.
 */

import { readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { Place } from '../app/lib/directory/types';
import { SEED_PLACES } from '../app/lib/directory/seed.server';
import { passesIngestGate, placeTextForAlignment } from './lib/place-alignment';
import { PROJECT_ROOT } from './lib/project-env';
import { scoreAlignment } from './lib/sotabosc-alignment';

const AUTO_PLACES = path.join(PROJECT_ROOT, 'app', 'lib', 'directory', 'auto-import.places.json');

type SourceMode = 'auto-import' | 'curated' | 'all';

function parseArgs(argv: string[]) {
  let source: SourceMode = 'all';
  let minScore = 70;
  let minReviewScore = 70;
  let allowReview = false;
  let writePruned = false;
  let jsonSummary = false;

  for (const a of argv) {
    if (a.startsWith('--source=')) source = a.slice(9) as SourceMode;
    else if (a.startsWith('--min-score=')) minScore = Number(a.slice(12)) || 0;
    else if (a.startsWith('--min-review-score=')) minReviewScore = Number(a.slice(19)) || 0;
    else if (a === '--allow-review') allowReview = true;
    else if (a === '--write-pruned') writePruned = true;
    else if (a === '--json-summary') jsonSummary = true;
  }
  if (!argv.some((x) => x.startsWith('--min-review-score='))) {
    minReviewScore = minScore;
  }
  return { source, minScore, minReviewScore, allowReview, writePruned, jsonSummary };
}

async function readAutoImport(): Promise<Place[]> {
  const raw = await readFile(AUTO_PLACES, 'utf8');
  const parsed = JSON.parse(raw) as unknown;
  return Array.isArray(parsed) ? (parsed as Place[]) : [];
}

async function main() {
  const { source, minScore, minReviewScore, allowReview, writePruned, jsonSummary } = parseArgs(
    process.argv.slice(2),
  );

  const auto = await readAutoImport();
  const autoSlugs = new Set(auto.map((p) => p.slug));
  const hand = SEED_PLACES.filter((p) => !autoSlugs.has(p.slug));
  let places: Place[];
  if (source === 'auto-import') places = auto;
  else if (source === 'curated') places = hand;
  else places = [...hand, ...auto];

  const gateOpts = { minScore, allowReview, minReviewScore };
  const rows: {
    slug: string;
    name: string;
    score: number;
    verdict: string;
    cautions: string;
    passGate: boolean;
  }[] = [];

  let pass = 0;
  let fail = 0;
  const verdictCounts: Record<string, number> = {};

  for (const p of places) {
    const text = placeTextForAlignment(p);
    const a = scoreAlignment(text);
    const ok = passesIngestGate(a, gateOpts);
    if (ok) pass++;
    else fail++;
    verdictCounts[a.verdict] = (verdictCounts[a.verdict] ?? 0) + 1;
    rows.push({
      slug: p.slug,
      name: p.name.slice(0, 48),
      score: a.score,
      verdict: a.verdict,
      cautions: a.cautionFlags.join(',') || '-',
      passGate: ok,
    });
  }

  rows.sort((a, b) => b.score - a.score);

  if (jsonSummary) {
    console.log(
      JSON.stringify(
        {
          source,
          count: places.length,
          passGate: pass,
          failGate: fail,
          minScore,
          allowReview,
          verdictCounts,
          bottom: rows.slice(-15),
          top: rows.slice(0, 15),
        },
        null,
        2,
      ),
    );
  } else {
    console.log(`Source: ${source}  |  places: ${places.length}`);
    console.log(
      `Gate: minScore=${minScore} minReviewScore=${minReviewScore} allowReview=${allowReview}  →  pass=${pass} fail=${fail}`,
    );
    console.log('Verdict counts:', verdictCounts);
    console.log('\nLowest 20 scores (review these first):');
    for (const r of [...rows].sort((a, b) => a.score - b.score).slice(0, 20)) {
      console.log(
        `  ${r.score.toString().padStart(3)} ${r.verdict.padEnd(16)} ${r.passGate ? 'KEEP' : 'DROP'}  ${r.slug}`,
      );
    }
  }

  if (writePruned) {
    if (source !== 'auto-import') {
      console.error('--write-pruned only supports --source=auto-import (safety).');
      process.exit(1);
    }
    const kept = auto.filter((p) => passesIngestGate(scoreAlignment(placeTextForAlignment(p)), gateOpts));
    const tmp = `${AUTO_PLACES}.${process.pid}.tmp`;
    await writeFile(tmp, `${JSON.stringify(kept, null, 2)}\n`, 'utf8');
    await rename(tmp, AUTO_PLACES);
    console.log(`\nWrote pruned auto-import: ${kept.length} rows (was ${auto.length}).`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
