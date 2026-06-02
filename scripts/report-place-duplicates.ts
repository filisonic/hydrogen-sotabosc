/**
 * Find likely duplicate places: curated vs auto-import (name, gplace id, proximity).
 * Usage: npx tsx scripts/report-place-duplicates.ts
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { Place } from '../app/lib/directory/types';
import { SEED_PLACES } from '../app/lib/directory/seed.server';
import { PROJECT_ROOT } from './lib/project-env';

const AUTO_FILE = path.join(PROJECT_ROOT, 'app', 'lib', 'directory', 'auto-import.places.json');
const REPORT = path.join(PROJECT_ROOT, 'reports', 'place-duplicates-report.json');
const METERS_NEAR = 80;

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function gplaceId(p: Place): string | undefined {
  return p.tags?.find((t) => t.startsWith('gplace:'))?.slice(7);
}

function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function coords(p: Place): { lat: number; lon: number } | null {
  if (p.latitude == null || p.longitude == null) return null;
  return { lat: p.latitude, lon: p.longitude };
}

async function main() {
  const raw = await readFile(AUTO_FILE, 'utf8');
  const auto = JSON.parse(raw) as Place[];
  const autoSlugs = new Set(auto.map((p) => p.slug));
  const hand = SEED_PLACES.filter((p) => !autoSlugs.has(p.slug));

  type Pair = {
    kind: 'gplace' | 'name' | 'proximity';
    handSlug: string;
    autoSlug: string;
    handName: string;
    autoName: string;
    detail: string;
  };
  const pairs: Pair[] = [];
  const seenPair = new Set<string>();

  const add = (pair: Pair) => {
    const key = [pair.handSlug, pair.autoSlug].sort().join('|');
    if (seenPair.has(key)) return;
    seenPair.add(key);
    pairs.push(pair);
  };

  const autoByGplace = new Map<string, Place>();
  for (const a of auto) {
    const gid = gplaceId(a);
    if (gid) autoByGplace.set(gid, a);
  }

  for (const h of hand) {
    const gid = gplaceId(h);
    if (gid && autoByGplace.has(gid)) {
      const a = autoByGplace.get(gid)!;
      add({
        kind: 'gplace',
        handSlug: h.slug,
        autoSlug: a.slug,
        handName: h.name,
        autoName: a.name,
        detail: `same Google place id ${gid}`,
      });
    }
  }

  const nameToHand = new Map<string, Place[]>();
  const nameToAuto = new Map<string, Place[]>();
  for (const h of hand) {
    const n = normalizeName(h.name);
    if (!n) continue;
    if (!nameToHand.has(n)) nameToHand.set(n, []);
    nameToHand.get(n)!.push(h);
  }
  for (const a of auto) {
    const n = normalizeName(a.name);
    if (!n) continue;
    if (!nameToAuto.has(n)) nameToAuto.set(n, []);
    nameToAuto.get(n)!.push(a);
  }

  for (const [n, hands] of nameToHand) {
    const autos = nameToAuto.get(n);
    if (!autos?.length) continue;
    for (const h of hands) {
      for (const a of autos) {
        if (h.slug === a.slug) continue;
        add({
          kind: 'name',
          handSlug: h.slug,
          autoSlug: a.slug,
          handName: h.name,
          autoName: a.name,
          detail: `normalized name "${n}"`,
        });
      }
    }
  }

  for (const h of hand) {
    const hc = coords(h);
    if (!hc) continue;
    for (const a of auto) {
      if (h.slug === a.slug) continue;
      const ac = coords(a);
      if (!ac) continue;
      const m = haversineM(hc.lat, hc.lon, ac.lat, ac.lon);
      if (m <= METERS_NEAR) {
        const hn = normalizeName(h.name);
        const an = normalizeName(a.name);
        if (hn === an || hn.includes(an) || an.includes(hn)) {
          add({
            kind: 'proximity',
            handSlug: h.slug,
            autoSlug: a.slug,
            handName: h.name,
            autoName: a.name,
            detail: `${Math.round(m)}m apart, similar name`,
          });
        } else if (m <= 30) {
          add({
            kind: 'proximity',
            handSlug: h.slug,
            autoSlug: a.slug,
            handName: h.name,
            autoName: a.name,
            detail: `${Math.round(m)}m apart (different names — verify)`,
          });
        }
      }
    }
  }

  pairs.sort((a, b) => a.kind.localeCompare(b.kind) || a.handSlug.localeCompare(b.handSlug));

  const byKind = {
    gplace: pairs.filter((p) => p.kind === 'gplace'),
    name: pairs.filter((p) => p.kind === 'name'),
    proximity: pairs.filter((p) => p.kind === 'proximity'),
  };

  const handSlugsInDupes = new Set(pairs.map((p) => p.handSlug));
  const autoSlugsInDupes = new Set(pairs.map((p) => p.autoSlug));

  const report = {
    generatedAt: new Date().toISOString(),
    counts: {
      handCurated: hand.length,
      autoImport: auto.length,
      totalRuntime: SEED_PLACES.length,
      duplicatePairs: pairs.length,
      handSlugsWithLikelyDup: handSlugsInDupes.size,
      autoSlugsWithLikelyDup: autoSlugsInDupes.size,
    },
    byKind: {
      gplace: byKind.gplace.length,
      name: byKind.name.length,
      proximity: byKind.proximity.length,
    },
    pairs,
  };

  await writeFile(REPORT, JSON.stringify(report, null, 2), 'utf8');

  console.log(`Hand-curated: ${hand.length} | Auto-import: ${auto.length} | Total: ${SEED_PLACES.length}`);
  console.log(`Likely duplicate pairs: ${pairs.length}`);
  console.log(`  gplace id match: ${byKind.gplace.length}`);
  console.log(`  exact normalized name: ${byKind.name.length}`);
  console.log(`  proximity (≤${METERS_NEAR}m): ${byKind.proximity.length}`);
  console.log(`\nWrote ${REPORT}\n`);

  const show = (label: string, list: Pair[]) => {
    if (!list.length) return;
    console.log(`--- ${label} (${list.length}) ---`);
    for (const p of list.slice(0, 40)) {
      console.log(`  ${p.handSlug}  ↔  ${p.autoSlug}`);
      console.log(`    ${p.handName} / ${p.autoName}`);
      console.log(`    ${p.detail}`);
    }
    if (list.length > 40) console.log(`  … and ${list.length - 40} more in JSON report`);
    console.log('');
  };

  show('Same Google place id', byKind.gplace);
  show('Same normalized name', byKind.name);
  show('Near coordinates', byKind.proximity);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
