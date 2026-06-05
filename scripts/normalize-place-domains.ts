/**
 * Fix primaryDomain + categories on auto-import rows (alignment scorer often mis-tags galleries as animals).
 *
 * Usage: npm run directory:normalize-domains
 *        npm run directory:normalize-domains -- --dry-run
 */

import { readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { Place } from '../app/lib/directory/types';
import { migrateLegacyDomains } from './lib/place-domain';
import { PROJECT_ROOT } from './lib/project-env';

const AUTO_FILE = path.join(PROJECT_ROOT, 'app', 'lib', 'directory', 'auto-import.places.json');
const DOMAINS = ['plants', 'algae', 'fungi', 'animals', 'earth'] as const;

function parseArgs(argv: string[]) {
  return { dryRun: argv.includes('--dry-run') };
}

function countByDomain(places: Place[]) {
  const counts: Record<string, number> = {};
  for (const d of DOMAINS) counts[d] = 0;
  for (const p of places) {
    counts[p.primaryDomain] = (counts[p.primaryDomain] ?? 0) + 1;
    for (const s of p.secondaryDomains ?? []) {
      counts[s] = (counts[s] ?? 0) + 1;
    }
  }
  return counts;
}

function layerCoverage(places: Place[], domain: string) {
  const inDomain = places.filter(
    (p) => p.primaryDomain === domain || p.secondaryDomains?.includes(domain as Place['primaryDomain']),
  );
  const canopy = inDomain.filter((p) =>
    p.categories.some((c) => ['specialty-coffee', 'workshop', 'coworking'].includes(c)),
  ).length;
  const soil = inDomain.filter((p) => p.categories.includes('restaurant')).length;
  return { total: inDomain.length, canopy, soil };
}

async function main() {
  const { dryRun } = parseArgs(process.argv.slice(2));
  const raw = await readFile(AUTO_FILE, 'utf8');
  const before = JSON.parse(raw) as Place[];

  const after = before.map(migrateLegacyDomains);

  console.log('Domain counts (primary + secondary mentions):');
  console.log('  before', countByDomain(before));
  console.log('  after ', countByDomain(after));

  console.log('\nJourney layer coverage (fungi example):');
  console.log('  before', layerCoverage(before, 'fungi'));
  console.log('  after ', layerCoverage(after, 'fungi'));

  for (const d of DOMAINS) {
    const cov = layerCoverage(after, d);
    if (cov.canopy < 3 || cov.soil < 1) {
      console.log(`  [thin] ${d}: total=${cov.total} canopy=${cov.canopy} soil=${cov.soil}`);
    }
  }

  if (dryRun) {
    const changed = after.filter((p, i) => p.primaryDomain !== before[i].primaryDomain).length;
    console.log(`\n[dry-run] Would update ${changed} primaryDomain assignments`);
    return;
  }

  const tmp = `${AUTO_FILE}.${process.pid}.tmp`;
  await writeFile(tmp, `${JSON.stringify(after, null, 2)}\n`, 'utf8');
  await rename(tmp, AUTO_FILE);
  console.log(`\nWrote ${after.length} rows to auto-import.places.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
