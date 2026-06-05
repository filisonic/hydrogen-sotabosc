/**
 * Full pipeline: refresh event URL queue → sync events → prune expired.
 *
 * Usage:
 *   npx tsx scripts/run-auto-events-pipeline.ts
 *   npx tsx scripts/run-auto-events-pipeline.ts --dry-run
 *   npx tsx scripts/run-auto-events-pipeline.ts --skip-refresh
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';

import { PROJECT_ROOT } from './lib/project-env';

const QUEUE_FILE = 'reports/event-urls-queue.txt';

function parseArgs(argv: string[]) {
  let dryRun = false;
  let skipRefresh = false;
  let allowReview = true;
  let minScore = 68;
  for (const a of argv) {
    if (a === '--dry-run') dryRun = true;
    else if (a === '--skip-refresh') skipRefresh = true;
    else if (a === '--strict') allowReview = false;
    else if (a.startsWith('--min-score=')) minScore = Number(a.slice(12)) || 68;
  }
  return { dryRun, skipRefresh, allowReview, minScore };
}

function runStep(label: string, args: string[]): number {
  console.log(`\n=== ${label} ===\n`);
  const res = spawnSync('npx', ['tsx', ...args], {
    cwd: PROJECT_ROOT,
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });
  if (res.status !== 0) {
    console.error(`[pipeline] ${label} failed (exit ${res.status ?? 1})`);
  }
  return res.status ?? 1;
}

async function main() {
  const { dryRun, skipRefresh, allowReview, minScore } = parseArgs(process.argv.slice(2));
  const started = new Date().toISOString();
  console.log(`[pipeline] started ${started}`);

  if (!skipRefresh) {
    const refreshArgs = ['scripts/refresh-event-urls.ts'];
    if (dryRun) refreshArgs.push('--dry-run');
    const code = runStep('Refresh event URLs', refreshArgs);
    if (code !== 0 && !dryRun) process.exit(code);
  }

  const syncArgs = [
    'scripts/sync-auto-events.ts',
    `--file=${QUEUE_FILE}`,
    `--min-score=${minScore}`,
  ];
  if (allowReview) syncArgs.push('--allow-review');
  if (dryRun) syncArgs.push('--dry-run');

  const syncCode = runStep('Sync events', syncArgs);
  if (syncCode !== 0) process.exit(syncCode);

  console.log(`\n[pipeline] finished ${new Date().toISOString()}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
