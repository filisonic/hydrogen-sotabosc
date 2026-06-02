/**
 * Remove synthetic template rows (id starts with p_tpl_) from auto-import.places.json.
 * Keeps OSM, Firecrawl-ingested (p_ai_), and Google Places (p_gmap_) rows.
 *
 *   npm run directory:prune-templates
 *   npm run directory:prune-templates -- --dry-run
 */

import { readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { Place } from '../app/lib/directory/types';
import { PROJECT_ROOT } from './lib/project-env';

const AUTO_PLACES_FILE = path.join(PROJECT_ROOT, 'app', 'lib', 'directory', 'auto-import.places.json');

function isTemplateRow(p: Place): boolean {
  return p.id.startsWith('p_tpl_') || p.tags?.includes('template-batch');
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const raw = await readFile(AUTO_PLACES_FILE, 'utf8');
  const rows = JSON.parse(raw) as Place[];
  if (!Array.isArray(rows)) {
    console.error('auto-import.places.json is not an array');
    process.exit(1);
  }

  const kept = rows.filter((p) => !isTemplateRow(p));
  const removed = rows.length - kept.length;

  console.log(`[prune] Before: ${rows.length} | templates removed: ${removed} | after: ${kept.length}`);
  if (kept.length > 0) {
    console.log('[prune] Kept ids:', kept.map((p) => p.id).join(', '));
  }

  if (dryRun) return;

  const tmp = `${AUTO_PLACES_FILE}.${process.pid}.tmp`;
  await writeFile(tmp, `${JSON.stringify(kept, null, 2)}\n`, 'utf8');
  await rename(tmp, AUTO_PLACES_FILE);
  console.log(`[prune] Wrote ${kept.length} rows to auto-import.places.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
