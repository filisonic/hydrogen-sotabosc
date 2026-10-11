/**
 * Upsert the city directory (places, events, creators) into Supabase for Living Wall screens,
 * OpenClaw / GHL workflows and anything else that reads the persistent city.
 *
 * Prereqs:
 *   - Migrations applied (npx supabase db push): directory_places, directory_events, directory_creators
 *   - Either the linked Supabase CLI (default when no key), or
 *     .env: PUBLIC_SUPABASE_URL (or SUPABASE_URL) + SUPABASE_SERVICE_ROLE_KEY
 *
 * Consent (wall_opt_in*, creator works/rightsGranted) is never written here; set it by hand
 * once the signed agreement is filed. See docs/supabase-city-directory.md.
 *
 * Usage:
 *   npm run directory:sync-supabase
 *   npm run directory:sync-supabase -- --dry-run
 *   npm run directory:sync-supabase -- --sql-only
 *   npm run directory:sync-supabase -- --use-cli
 */

import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';

import {
  buildDirectoryCreatorRows,
  buildDirectoryEventRows,
  buildDirectoryPlaceRows,
  creatorRowsToUpsertSql,
  eventRowsToUpsertSql,
  rowsToUpsertSql,
} from './lib/directory-place-rows';
import { loadDotEnvFromRoot, PROJECT_ROOT } from './lib/project-env';

const BATCH = 100;
const REPORTS = path.join(PROJECT_ROOT, 'reports');

type Table = {
  table: 'directory_places' | 'directory_events' | 'directory_creators';
  conflict: 'slug' | 'id';
  rows: Record<string, unknown>[];
  sql: string;
  sqlPath: string;
};

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

function syncViaCli(sqlPath: string) {
  const file = path.relative(PROJECT_ROOT, sqlPath).replace(/\\/g, '/');
  console.log(`Running: npx supabase db query --linked -f ${file}`);
  execSync(`npx supabase db query --linked -f "${file}"`, {
    cwd: PROJECT_ROOT,
    stdio: 'inherit',
  });
}

async function buildTables(): Promise<Table[]> {
  const places = await buildDirectoryPlaceRows();
  const events = await buildDirectoryEventRows();
  const creators = buildDirectoryCreatorRows();

  const curated = places.filter((r) => r.source === 'curated').length;
  console.log(
    `Places: ${places.length} (${curated} curated, ${places.length - curated} auto-import) · events: ${events.length} · creators: ${creators.length}`,
  );

  return [
    {
      table: 'directory_places',
      conflict: 'slug',
      // Claim status is owned by the database once a row exists; the SQL path only sets it on insert.
      rows: places.map(({ is_claimed: _claimed, ...row }) => row),
      sql: rowsToUpsertSql(places),
      sqlPath: path.join(REPORTS, 'directory-places-supabase-seed.sql'),
    },
    {
      table: 'directory_events',
      conflict: 'id',
      rows: events,
      sql: eventRowsToUpsertSql(events),
      sqlPath: path.join(REPORTS, 'directory-events-supabase-seed.sql'),
    },
    {
      table: 'directory_creators',
      conflict: 'id',
      rows: creators,
      sql: creatorRowsToUpsertSql(creators),
      sqlPath: path.join(REPORTS, 'directory-creators-supabase-seed.sql'),
    },
  ];
}

async function main() {
  await loadDotEnvFromRoot();
  const { dryRun, sqlOnly, useCli } = parseArgs(process.argv.slice(2));
  const { url, key } = supabaseConfig();

  const tables = await buildTables();

  if (dryRun) {
    for (const t of tables) {
      console.log(`\n${t.table} sample:`);
      for (const r of t.rows.slice(0, 3)) {
        console.log(`  ${String(r.slug)} | ${String(r.name ?? r.title ?? r.display_name)}`);
      }
    }
    return;
  }

  // Places first: events reference directory_places.slug.
  for (const t of tables) {
    await writeFile(t.sqlPath, t.sql, 'utf8');
    console.log(`Wrote ${path.relative(PROJECT_ROOT, t.sqlPath)}`);
  }

  if (sqlOnly) {
    console.log('SQL only — run each file with: npx supabase db query --linked -f <file>');
    return;
  }

  if (useCli || !url || !key) {
    if (!url || !key) {
      console.log('No SUPABASE_SERVICE_ROLE_KEY — using linked Supabase CLI.');
    }
    for (const t of tables) {
      if (t.rows.length) syncViaCli(t.sqlPath);
    }
    console.log('\nSynced: directory_places, directory_events, directory_creators');
    return;
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  for (const t of tables) {
    let upserted = 0;
    for (let i = 0; i < t.rows.length; i += BATCH) {
      const chunk = t.rows.slice(i, i + BATCH);
      const { error } = await supabase.from(t.table).upsert(chunk, {
        onConflict: t.conflict,
      });
      if (error) {
        console.error(`${t.table} upsert failed at batch ${i / BATCH + 1}:`, error.message);
        console.error('\nApply migrations first: npx supabase db push');
        process.exit(1);
      }
      upserted += chunk.length;
    }

    const { count, error: countErr } = await supabase
      .from(t.table)
      .select('*', { count: 'exact', head: true });
    console.log(
      `${t.table}: upserted ${upserted}, row count ${countErr ? `unknown (${countErr.message})` : count}`,
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
