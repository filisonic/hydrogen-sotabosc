import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

export async function loadDotEnvFromRoot() {
  const p = path.join(PROJECT_ROOT, '.env');
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
    /* no .env */
  }
}

export function firecrawlApiKeyFromEnv(): string | undefined {
  const k =
    process.env.FIRECRAWL_API_KEY?.trim() ||
    process.env.FIRECRAWL_KEY?.trim() ||
    process.env.FIRECRAWL_SECRET?.trim();
  return k || undefined;
}
