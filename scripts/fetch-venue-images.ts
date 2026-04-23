/**
 * Fetch real venue preview images: Firecrawl scrape → OG/Twitter image → download → public/images/venues.
 *
 * Setup:
 *   - Add Firecrawl key to `.env` as FIRECRAWL_API_KEY (or FIRECRAWL_KEY)
 *   - Run: npm run fetch:venue-images
 *
 * Flags: --dry, --force, --slug=, --no-report (skip reports/ JSON)
 *
 * After each run (non-dry): writes reports/venue-images-last-run.json — counts + per-slug status
 * for auditing failures at scale (search status: firecrawl_error | no_og_image | download_failed).
 *
 * Licensing: images are copied from each venue’s own site metadata; verify rights for your use case.
 */

import type { Dirent } from 'node:fs';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Place } from '../app/lib/directory/types';
import { SEED_PLACES } from '../app/lib/directory/seed.server';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'images', 'venues');
const REPORT_FILE = path.join(ROOT, 'reports', 'venue-images-last-run.json');
const GENERATED = path.join(ROOT, 'app', 'lib', 'directory', 'venueImages.generated.ts');
const FIRECRAWL_SCRAPE = 'https://api.firecrawl.dev/v1/scrape';
const MAX_BYTES = 2_800_000;
const DELAY_MS = 2200;

type VenueImageRowStatus =
  | 'ok'
  | 'skip_exists'
  | 'firecrawl_error'
  | 'no_og_image'
  | 'download_failed';

function parseArgs(argv: string[]) {
  const dry = argv.includes('--dry');
  const force = argv.includes('--force');
  const noReport = argv.includes('--no-report');
  const slugArg = argv.find((a) => a.startsWith('--slug='));
  const slug = slugArg ? slugArg.split('=')[1]?.trim() : undefined;
  return { dry, force, noReport, slug };
}

async function loadDotEnv() {
  const p = path.join(ROOT, '.env');
  try {
    const text = await readFile(p, 'utf8');
    for (const line of text.split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const i = t.indexOf('=');
      if (i === -1) continue;
      const key = t.slice(0, i).trim();
      let val = t.slice(i + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    /* no .env at project root */
  }
}

function firecrawlApiKey(): string | undefined {
  const k =
    process.env.FIRECRAWL_API_KEY?.trim() ||
    process.env.FIRECRAWL_KEY?.trim() ||
    process.env.FIRECRAWL_SECRET?.trim();
  return k || undefined;
}

function resolveUrl(base: string, href: string): string {
  try {
    return new URL(href, base).href;
  } catch {
    return href;
  }
}

function pickOgImage(metadata: Record<string, unknown>, pageUrl: string): string | null {
  const raw =
    (metadata.ogImage as string | undefined) ??
    (metadata['og:image'] as string | undefined) ??
    (metadata.twitterImage as string | undefined) ??
    (metadata['twitter:image'] as string | undefined) ??
    (metadata.image as string | undefined) ??
    null;
  if (!raw || typeof raw !== 'string') return null;
  const s = raw.trim();
  if (!s) return null;
  return resolveUrl(pageUrl, s);
}

function extFromContentType(ct: string | null): string {
  if (!ct) return 'jpg';
  const base = ct.split(';')[0]?.trim().toLowerCase() ?? '';
  if (base.includes('png')) return 'png';
  if (base.includes('webp')) return 'webp';
  if (base.includes('gif')) return 'gif';
  if (base.includes('jpeg') || base.includes('jpg')) return 'jpg';
  return 'jpg';
}

async function firecrawlOgImage(pageUrl: string, apiKey: string): Promise<string | null> {
  const res = await fetch(FIRECRAWL_SCRAPE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      url: pageUrl,
      formats: ['markdown'],
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Firecrawl HTTP ${res.status}: ${text.slice(0, 400)}`);
  }
  let json: { data?: { metadata?: Record<string, unknown> } };
  try {
    json = JSON.parse(text) as typeof json;
  } catch {
    throw new Error('Firecrawl: invalid JSON body');
  }
  const meta = json?.data?.metadata ?? {};
  const source = (meta.sourceURL as string) || pageUrl;
  return pickOgImage(meta, source);
}

async function downloadImage(
  imageUrl: string,
): Promise<{ buffer: Buffer; ext: string } | null> {
  const res = await fetch(imageUrl, {
    redirect: 'follow',
    headers: { Accept: 'image/*' },
  });
  if (!res.ok) return null;
  const ct = res.headers.get('content-type');
  if (ct?.includes('svg')) return null;
  if (!ct?.startsWith('image/')) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > MAX_BYTES || buf.length < 800) return null;
  return { buffer: buf, ext: extFromContentType(ct) };
}

async function findExistingFile(slug: string): Promise<string | null> {
  try {
    const entries = await readdir(OUT_DIR, { withFileTypes: true });
    const hit = entries.find((e) => e.isFile() && e.name.startsWith(`${slug}.`));
    return hit ? path.join(OUT_DIR, hit.name) : null;
  } catch {
    return null;
  }
}

async function writeGenerated(map: Record<string, string>) {
  const keys = Object.keys(map).sort();
  const lines = keys.map((k) => `  '${k}': '${map[k]}',`);
  const body = `/**
 * Local first-party hero images for directory places.
 * Auto-generated by scripts/fetch-venue-images.ts — do not edit by hand.
 * Re-run: npm run fetch:venue-images
 */
export const VENUE_LOCAL_IMAGE_BY_SLUG: Partial<Record<string, string>> = {
${lines.join('\n')}
};
`;
  await writeFile(GENERATED, body, 'utf8');
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

type VenueImageRow = {
  slug: string;
  name: string;
  website: string;
  status: VenueImageRowStatus | 'dry_preview';
  detail?: string;
  imageUrl?: string;
};

async function writeRunReport(
  rows: VenueImageRow[],
  skippedNoWebsite: { slug: string; name: string }[],
) {
  const summary: Record<string, number> = {};
  for (const r of rows) {
    summary[r.status] = (summary[r.status] ?? 0) + 1;
  }
  const needsFollowUp = rows.filter((r) =>
    ['firecrawl_error', 'no_og_image', 'download_failed'].includes(r.status),
  );
  const body = {
    generatedAt: new Date().toISOString(),
    pipeline: 'firecrawl',
    summary,
    skippedNoWebsiteCount: skippedNoWebsite.length,
    skippedNoWebsite,
    needsFollowUpSlugs: needsFollowUp.map((r) => r.slug),
    rows,
  };
  await mkdir(path.dirname(REPORT_FILE), { recursive: true });
  await writeFile(REPORT_FILE, `${JSON.stringify(body, null, 2)}\n`, 'utf8');
}

async function main() {
  await loadDotEnv();
  const { dry, force, noReport, slug } = parseArgs(process.argv.slice(2));
  const apiKey = firecrawlApiKey();

  let places: Place[] = SEED_PLACES.filter((p) => Boolean(p.website?.trim()));
  if (slug) {
    places = places.filter((p) => p.slug === slug);
    if (!places.length) {
      console.error(`No place with website found for slug "${slug}".`);
      process.exit(1);
    }
  }

  if (!apiKey && !dry) {
    console.error(
      'Missing Firecrawl key. In .env set FIRECRAWL_API_KEY (or FIRECRAWL_KEY), at the project root next to package.json.',
    );
    process.exit(1);
  }
  if (dry && !apiKey) {
    for (const p of places) console.log(`${p.slug}\t${p.website}`);
    console.log(
      '\nSet FIRECRAWL_API_KEY or FIRECRAWL_KEY in .env, then run with --dry to resolve og:image URLs.',
    );
    process.exit(0);
  }

  await mkdir(OUT_DIR, { recursive: true });

  const urlMap: Record<string, string> = {};
  const rows: VenueImageRow[] = [];
  const skippedNoWebsite = SEED_PLACES.filter((p) => !p.website?.trim()).map((p) => ({
    slug: p.slug,
    name: p.name,
  }));

  for (const existing of await readdir(OUT_DIR, { withFileTypes: true }).catch(
    () => [] as Dirent[],
  )) {
    if (!existing.isFile()) continue;
    const name = existing.name;
    if (!name.includes('.') || name.startsWith('.')) continue;
    const slugPart = name.replace(/\.[^.]+$/, '');
    urlMap[slugPart] = `/images/venues/${name}`;
  }

  console.log(`Venues with website: ${places.length}${slug ? ` (filter: ${slug})` : ''}`);

  for (const p of places) {
    const web = p.website!.trim();

    if (!force) {
      const onDisk = await findExistingFile(p.slug);
      if (onDisk) {
        const base = path.basename(onDisk);
        urlMap[p.slug] = `/images/venues/${base}`;
        console.log(`[skip exists] ${p.slug}`);
        rows.push({ slug: p.slug, name: p.name, website: web, status: 'skip_exists' });
        continue;
      }
    } else {
      const onDisk = await findExistingFile(p.slug);
      if (onDisk) await rm(onDisk, { force: true });
    }

    let imageUrl: string | null = null;
    let firecrawlDetail: string | undefined;
    try {
      if (!dry && apiKey) {
        imageUrl = await firecrawlOgImage(web, apiKey);
        await sleep(DELAY_MS);
      }
    } catch (e) {
      firecrawlDetail = e instanceof Error ? e.message : String(e);
      console.warn(`[firecrawl error] ${p.slug}:`, firecrawlDetail);
    }

    if (dry) {
      console.log(`[dry] ${p.slug} ← ${web}${imageUrl ? ` → ${imageUrl}` : ' (no og image yet)'}`);
      rows.push({
        slug: p.slug,
        name: p.name,
        website: web,
        status: 'dry_preview',
        detail: firecrawlDetail,
        imageUrl: imageUrl ?? undefined,
      });
      continue;
    }

    if (!imageUrl) {
      const status: VenueImageRowStatus = firecrawlDetail ? 'firecrawl_error' : 'no_og_image';
      const label =
        status === 'no_og_image'
          ? 'no og image'
          : status === 'firecrawl_error'
            ? 'firecrawl error'
            : status;
      console.warn(`[${label}] ${p.slug} (${web})`);
      rows.push({
        slug: p.slug,
        name: p.name,
        website: web,
        status,
        detail: firecrawlDetail,
      });
      continue;
    }

    const downloaded = await downloadImage(imageUrl);
    if (!downloaded) {
      console.warn(`[download failed] ${p.slug} ← ${imageUrl}`);
      rows.push({
        slug: p.slug,
        name: p.name,
        website: web,
        status: 'download_failed',
        imageUrl,
      });
      continue;
    }

    const filename = `${p.slug}.${downloaded.ext}`;
    const dest = path.join(OUT_DIR, filename);
    await writeFile(dest, downloaded.buffer);
    urlMap[p.slug] = `/images/venues/${filename}`;
    console.log(`[ok] ${p.slug} → ${filename}`);
    rows.push({
      slug: p.slug,
      name: p.name,
      website: web,
      status: 'ok',
      imageUrl,
    });
  }

  if (!dry) {
    const seedSlugs = new Set(SEED_PLACES.map((p) => p.slug));
    const filtered: Record<string, string> = {};
    for (const [k, v] of Object.entries(urlMap)) {
      if (seedSlugs.has(k)) filtered[k] = v;
    }
    await writeGenerated(filtered);
    console.log(`\nWrote ${GENERATED}`);
    console.log(`Mapped ${Object.keys(filtered).length} seed slugs to local images.`);
    if (!noReport) {
      await writeRunReport(rows, skippedNoWebsite);
      const n = rows.filter((r) =>
        ['firecrawl_error', 'no_og_image', 'download_failed'].includes(r.status),
      ).length;
      console.log(`Report: ${REPORT_FILE} (${n} slug(s) need follow-up for hero image)`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
