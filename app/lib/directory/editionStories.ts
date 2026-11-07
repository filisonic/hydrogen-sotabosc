import storiesJson from './auto-import.edition-stories.json';
import type { EditionStoryRubrique } from './editionStoryAlignment';

export type EditionStory = {
  id: string;
  title: string;
  summary: string;
  url: string;
  publisher: string;
  publishedAt: string | null;
  imageUrl: string | null;
  rubrique: EditionStoryRubrique;
  score: number;
  source: 'tinyfish';
};

type StoriesFile = {
  updatedAt: string | null;
  stories: EditionStory[];
};

export function loadEditionStories(): EditionStory[] {
  const pack = storiesJson as StoriesFile;
  const list = Array.isArray(pack?.stories) ? pack.stories : [];
  return list
    .filter((s) => s && typeof s.title === 'string' && typeof s.url === 'string')
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

export function pickEditionStories(
  stories: EditionStory[],
  limit = 8,
): EditionStory[] {
  const ranked = [...stories].sort((a, b) => {
    if ((b.score ?? 0) !== (a.score ?? 0)) return (b.score ?? 0) - (a.score ?? 0);
    const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return tb - ta;
  });
  const seen = new Set<string>();
  const out: EditionStory[] = [];
  for (const s of ranked) {
    const key = s.url.replace(/#.*$/, '').toLowerCase();
    if (seen.has(key)) continue;
    if ((s.score ?? 0) < 70) continue;
    seen.add(key);
    out.push(s);
    if (out.length >= limit) break;
  }
  return out;
}
