/**
 * Upcoming culture from Barcelona's official agenda (Open Data BCN, CC BY 4.0, updated daily)
 * → app/lib/directory/bcn-agenda.events.json, which the city directory and every screen read.
 *
 * Keeps culture only (concerts, theatre, dance, cinema, exhibitions, festivals, literature,
 * guided visits), with a picture, starting in the next two weeks (exhibitions: open now).
 * Leaves out civic-centre courses, children-only activities, sport, traffic and anything
 * political. The city's own highlights come first, then El Born / Ciutat Vella, then the soonest.
 *
 * Usage:
 *   npx tsx scripts/import-bcn-agenda.ts
 *   npx tsx scripts/import-bcn-agenda.ts --dry-run
 */
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PROJECT_ROOT } from './lib/project-env';

const SOURCE =
  'https://opendata-ajuntament.barcelona.cat/data/dataset/a25e60cd-3083-4252-9fce-81f733871cb1/resource/da9e71de-0f8e-417d-928a-56380bfd0231/download';
const OUT = path.join(PROJECT_ROOT, 'app', 'lib', 'directory', 'bcn-agenda.events.json');
const DAYS_AHEAD = 14;
const MAX = 80;

const CULTURE = new Set([
  'Concerts', 'Espectacles', 'Música', 'Teatre', 'Literatura', 'Projeccions', 'Cinema', 'Música clàssica',
  'Exposicions', 'Destacats Agenda (Ús Intern BI)', 'Humor', 'Teatre i dansa', 'Rock', 'Jazz, Blues', 'Pop',
  'Festivals', 'Presentacions', 'Arquitectura', 'Cultura i arts', 'Dansa', 'Flamenc', 'Visites guiades ',
  'Artesania i manualitats', 'Barcelona Districte Cultural', 'Activitats dels museus i arxius de Barcelona',
  'Lectures', 'Monòlegs', 'Fires i mercats', 'Òpera', 'Art', 'Fotografia', 'Disseny',
]);
const SKIP = [
  'Centres Cívics', 'Casals de Barri', 'Casals de Gent Gran', 'per a infants', 'anys)', ' anys',
  'Competicions esportives', 'Curses', 'Alteracions de trànsit', 'Cooperació', 'Participació ciutadana',
  'Sanitat', 'Violència', 'Campanyes', 'Dia Internacional',
];
const BLOCKED = /\b(palestin|israel|gaza|ucraïna|ucrania|guerra|polític|politic|eleccions|violènci|violenci|homenatge a les víctimes)/i;

type Raw = {
  register_id: number;
  name: string;
  body?: string;
  start_date?: string;
  end_date?: string;
  status_name?: string;
  event_status_name?: string;
  addresses?: Array<{ place?: string | null; district_name?: string | null; address_name?: string | null; start_street_number?: number | null }>;
  classifications_data?: Array<{ name: string }>;
  image_data?: { image?: string | null; author?: string | null } | null;
};

const plain = (s: string) =>
  s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** The agenda writes date-only events as 03:00 or 12:00 (real times live in its timetable text); keep those as a plain date */
function when(iso?: string): string | undefined {
  if (!iso) return undefined;
  const [date, time = ''] = iso.split('T');
  return ['00:00', '03:00', '12:00'].some((t) => time.startsWith(t)) ? date : `${date}T${time.slice(0, 5)}`;
}

const slugify = (s: string) =>
  s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);

function domainOf(kinds: string[]) {
  const k = kinds.join(' ');
  if (/Concerts|Música|Rock|Jazz|Pop|Flamenc|Òpera/.test(k)) return 'animals';
  if (/Exposicions|Art|Fotografia|Arquitectura|Disseny/.test(k)) return 'plants';
  if (/Cinema|Projeccions|Literatura|Lectures|Presentacions/.test(k)) return 'fungi';
  if (/Artesania|Fires i mercats/.test(k)) return 'earth';
  return 'algae';
}

export function pickEvents(rows: Raw[], now = new Date()) {
  const end = new Date(now.getTime() + DAYS_AHEAD * 86_400_000);
  const out: Array<{ score: number; startsAt: string; event: Record<string, unknown> }> = [];
  for (const r of rows) {
    if (r.status_name && r.status_name !== 'Publicat') continue;
    if (r.event_status_name && r.event_status_name !== 'Correcte') continue;
    const image = r.image_data?.image;
    if (!image || !r.start_date || !r.name) continue;
    const kinds = (r.classifications_data ?? []).map((c) => c.name);
    if (!kinds.some((k) => CULTURE.has(k)) || kinds.some((k) => SKIP.some((s) => k.includes(s)))) continue;
    const text = `${r.name} ${plain(r.body ?? '')}`;
    if (BLOCKED.test(text)) continue;
    const s = new Date(r.start_date);
    const e = r.end_date ? new Date(r.end_date) : s;
    const exhibition = kinds.includes('Exposicions');
    const short = e.getTime() - s.getTime() <= 3 * 86_400_000;
    const upcoming = s >= new Date(now.toDateString()) && s <= end && short;
    const openNow = exhibition && s <= now && e >= now;
    if (!upcoming && !openNow) continue;
    const a = r.addresses?.[0];
    const district = a?.district_name ?? '';
    const placeName = a?.place || [a?.address_name, a?.start_street_number].filter(Boolean).join(' ') || 'Barcelona';
    const score = (kinds.includes('Destacats Agenda (Ús Intern BI)') ? 100 : 0) + (district === 'Ciutat Vella' ? 20 : 0) - s.getTime() / 86_400_000_000;
    const summary = plain(r.body ?? '');
    out.push({
      score,
      startsAt: when(r.start_date)!,
      event: {
        id: `e_bcn_${r.register_id}`,
        slug: `${slugify(r.name)}-${r.register_id}`,
        title: plain(r.name).slice(0, 120),
        summary: (summary.length > 300 ? `${summary.slice(0, 297).replace(/\s+\S*$/, '')}…` : summary) || plain(r.name),
        startsAt: when(r.start_date),
        ...(r.end_date && !openNow && when(r.end_date) !== when(r.start_date) ? { endsAt: when(r.end_date) } : {}),
        ...(openNow ? { endsAt: when(r.end_date) } : {}),
        placeId: 'p_auto_unknown',
        placeName: plain(placeName),
        primaryDomain: domainOf(kinds),
        tags: ['bcn-agenda', ...(district ? [slugify(district)] : []), ...kinds.filter((k) => CULTURE.has(k)).map(slugify)].slice(0, 6),
        imageUrl: image,
        imageCredit: r.image_data?.author ? `${plain(r.image_data.author)} · Ajuntament de Barcelona` : 'Agenda: Ajuntament de Barcelona',
      },
    });
  }
  // Exhibitions are open for weeks: a few of them, the rest dated events (concerts, theatre, festivals)
  let exhibitions = 0;
  return out
    .sort((x, y) => y.score - x.score)
    .filter((x) => !(x.event.tags as string[]).includes('exposicions') || ++exhibitions <= 20)
    .slice(0, MAX)
    .sort((x, y) => x.startsAt.localeCompare(y.startsAt))
    .map((x) => x.event);
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const res = await fetch(SOURCE, { signal: AbortSignal.timeout(180_000) });
  if (!res.ok) throw new Error(`Open Data BCN agenda: HTTP ${res.status}`);
  const rows = (await res.json()) as Raw[];
  const events = pickEvents(rows);
  console.log(`Barcelona agenda: ${rows.length} entries, ${events.length} kept`);
  for (const e of events.slice(0, 12)) console.log(`  ${String(e.startsAt).padEnd(16)} ${e.title}`);
  if (dryRun) return;
  // Keep the last good list if the agenda came back empty
  if (!events.length) throw new Error('No events kept: not overwriting the last list');
  await writeFile(OUT, `${JSON.stringify(events, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${OUT}`);
}

if (process.argv[1]?.includes('import-bcn-agenda')) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
