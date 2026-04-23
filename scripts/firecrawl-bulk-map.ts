import { writeFile } from 'node:fs/promises';
import { loadDotEnvFromRoot, firecrawlApiKeyFromEnv, PROJECT_ROOT } from './lib/project-env';
import path from 'node:path';

async function main() {
  await loadDotEnvFromRoot();
  const apiKey = firecrawlApiKeyFromEnv();
  if (!apiKey) {
    console.error('Missing FIRECRAWL_API_KEY in .env');
    process.exit(1);
  }

  const argv = process.argv.slice(2);
  const targetUrl = argv.find((a) => a.startsWith('--url='))?.slice(6);
  const limit = Number(argv.find((a) => a.startsWith('--limit='))?.slice(8)) || 500;
  const search = argv.find((a) => a.startsWith('--search='))?.slice(9);

  if (!targetUrl) {
    console.error('Usage: npx tsx scripts/firecrawl-bulk-map.ts --url=<target-url> [--limit=500] [--search=<keyword>]');
    process.exit(1);
  }

  console.log(`Mapping ${targetUrl} (limit: ${limit})...`);

  const body: any = { url: targetUrl, limit };
  if (search) body.search = search;

  const res = await fetch('https://api.firecrawl.dev/v1/map', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!data.success) {
    console.error('Map failed:', data);
    process.exit(1);
  }

  const links: string[] = data.links || [];
  console.log(`Found ${links.length} links.`);

  if (links.length === 0) return;

  const outPath = path.join(PROJECT_ROOT, 'reports', 'bulk-urls.txt');
  await writeFile(outPath, links.join('\n'), 'utf8');
  console.log(`Saved URLs to ${outPath}`);
  console.log(`Next, run: npm run ingest:listing -- --file=reports/bulk-urls.txt`);
}

main().catch(console.error);
