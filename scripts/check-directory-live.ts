/**
 * Read-only check that the live city (anon key) matches the seed counts.
 * Does not print keys. Usage: npm run directory:check-live
 */
import { loadDotEnvFromRoot } from './lib/project-env';
import { fetchSupabaseSnapshot } from '../app/lib/directory/source.server';
import { SEED_SNAPSHOT } from '../app/lib/directory/seed.server';

async function main() {
  await loadDotEnvFromRoot();
  const url = process.env.PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error('Need PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY in .env');
    process.exit(1);
  }

  const live = await fetchSupabaseSnapshot(url, key);
  const lines = [
    `source: ${live.source}`,
    `places   live ${live.places.length}  seed ${SEED_SNAPSHOT.places.length}`,
    `events   live ${live.events.length}  seed ${SEED_SNAPSHOT.events.length}`,
    `creators live ${live.creators.length}  seed ${SEED_SNAPSHOT.creators.length}`,
  ];
  console.log(lines.join('\n'));

  const missing = (['places', 'events', 'creators'] as const).flatMap((kind) => {
    const have = new Set(live[kind].map((row) => row.slug));
    return SEED_SNAPSHOT[kind]
      .filter((row) => !have.has(row.slug))
      .map((row) => `${kind}:${row.slug}`);
  });
  if (missing.length) {
    console.error(`Missing from live (${missing.length}): ${missing.slice(0, 10).join(', ')}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
