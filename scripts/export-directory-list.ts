import { writeFileSync } from 'node:fs';
import { SEED_PLACES } from '../app/lib/directory/seed.server';

const rows = SEED_PLACES.map((p) => ({
  slug: p.slug,
  name: p.name,
  website: p.website ?? '',
  listing_url: `https://directory.sotabosc.world/places/${p.slug}`,
  neighborhood: p.neighborhood,
  categories: p.categories.join(', '),
}));

rows.sort((a, b) => a.name.localeCompare(b.name));

const outPath = 'reports/directory-places-export.json';
writeFileSync(outPath, JSON.stringify({ total: rows.length, places: rows }, null, 2));

const csv = [
  'slug,name,website,listing_url,neighborhood,categories',
  ...rows.map((r) =>
    [r.slug, r.name, r.website, r.listing_url, r.neighborhood, r.categories]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(','),
  ),
].join('\n');
writeFileSync('reports/directory-places-export.csv', csv);

console.log(`Exported ${rows.length} places to reports/directory-places-export.json and .csv`);
