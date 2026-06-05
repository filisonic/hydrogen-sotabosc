/**
 * Upsert all directory places (name, slug, URLs, etc.) into Supabase for OpenClaw / GHL workflows.
 *
 * Prereqs:
 *   - Migration applied: supabase/migrations/20260603120000_directory_places.sql
 *   - .env: PUBLIC_SUPABASE_URL (or SUPABASE_URL) + SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   npm run directory:sync-supabase
 *   npm run directory:sync-supabase -- --dry-run
 */

import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';

import {
  buildDirectoryPlaceRows,
  rowsToUpsertSql,
} from './lib/directory-place-rows';
import { loadDotEnvFromRoot, PROJECT_ROOT } from './lib/project-env';

const BATCH = 100;
const SQL_SEED = path.join(PROJECT_ROOT, 'reports', 'directory-places-supabase-seed.sql');

function parseArgs(argv: string[]) {
  return {
    dryRun: argv.includes('--dry-run'),
    sqlOnly: argv.includes('--sql-only'),
    useCli: argv.includes('--use-cli'),
  };
}

function supabaseConfig() {
  const url =
    process.env.PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return { url, key };
}

async function syncViaCli(sqlPath: string) {
  const file = sqlPath.replace(/\\/g, '/');
  console.log(`Running: npx supabase db query --linked -f ${file}`);
  execSync(`npx supabase db query --linked -f "${file}"`, {
    cwd: PROJECT_ROOT,
    stdio: 'inherit',
  });
}

async function main() {
  await loadDotEnvFromRoot();
  const { dryRun, sqlOnly, useCli } = parseArgs(process.argv.slice(2));
  const { url, key } = supabaseConfig();

  const rows = await buildDirectoryPlaceRows();
  const curated = rows.filter((r) => r.source === 'curated').length;
  const auto = rows.length - curated;

  console.log(`Places to sync: ${rows.length} (${curated} curated, ${auto} auto-import)`);

  if (dryRun) {
    console.log('Sample rows:');
    for (const r of rows.slice(0, 5)) {
      console.log(`  ${r.slug} | ${r.name} | ${r.source}`);
    }
    console.log('…');
    for (const r of rows.slice(-3)) {
      console.log(`  ${r.slug} | ${r.name} | ${r.source}`);
    }
    return;
  }

  const sql = rowsToUpsertSql(rows);
  await writeFile(SQL_SEED, sql, 'utf8');
  console.log(`Wrote ${SQL_SEED}`);

  if (sqlOnly) {
    console.log('SQL only — run: npx supabase db query --linked -f reports/directory-places-supabase-seed.sql');
    return;
  }

  if (useCli || !url || !key) {
    if (!url || !key) {
      console.log(
        'No SUPABASE_SERVICE_ROLE_KEY — using linked Supabase CLI (db execute).',
      );
    }
    await syncViaCli(SQL_SEED);
    console.log(
      '\nOpenClaw can query: directory_places, directory_places_with_booking, place_booking_calendars',
    );
    return;
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let upserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const { error } = await supabase.from('directory_places').upsert(chunk, {
      onConflict: 'slug',
    });
    if (error) {
      console.error(`Upsert failed at batch ${i / BATCH + 1}:`, error.message);
      if (error.message.includes('directory_places')) {
        console.error(
          '\nApply migration first: supabase db push  (or run SQL in Supabase dashboard)',
        );
      }
      process.exit(1);
    }
    upserted += chunk.length;
    console.log(`Upserted ${upserted}/${rows.length}`);
  }

  const { count, error: countErr } = await supabase
    .from('directory_places')
    .select('*', { count: 'exact', head: true });

  if (countErr) {
    console.warn('Could not verify row count:', countErr.message);
  } else {
    console.log(`Supabase directory_places row count: ${count ?? 'unknown'}`);
  }

  console.log(
    '\nOpenClaw can query: directory_places, directory_places_with_booking, place_booking_calendars',
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
