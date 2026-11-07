/**
 * Filters Shopify Journal / News articles for the edition homepage.
 * Keeps Barcelona culture desk pieces; drops hardware, coding, and pure tech.
 */

const TECH_REJECT =
  /\b(chip|assembly|software[- ]defined|muxwright|heap|goose:|git history|phloem|3d printer|micrometre|μreprap|hacking|devops|kubernetes|crypto|bitcoin|saas|llm|aiaiai|artificial intelligence|corner detector|batteryless drone|processing community|open technology|einxs 2026)\b/i;

const FAR_GEO =
  /\b(bangladesh|tehran|toronto|stackt|basel)\b/i;

const CULTURE_HINT =
  /\b(hangar|mira|in-edit|aribau|cinemes|documentary|documentaries|music|concert|exhibition|gallery|artist|artists|festival|listening|sound|workshop|blender|shapes|patterns|alpaca|barcelona|fira|montju[iï]c)\b/i;

export type JournalArticleTeaser = {
  id: string;
  title: string;
  handle: string;
  blogHandle: string;
  excerpt?: string;
  publishedAt?: string;
  imageUrl?: string | null;
};

export function isCultureJournalArticle(input: {
  title: string;
  excerpt?: string;
  tags?: string[] | null;
}): boolean {
  const blob = `${input.title} ${input.excerpt ?? ''} ${(input.tags ?? []).join(' ')}`;
  if (TECH_REJECT.test(blob)) return false;
  if (FAR_GEO.test(blob)) return false;
  return CULTURE_HINT.test(blob);
}

/**
 * @param {Array<{
 *   id: string;
 *   title: string;
 *   handle: string;
 *   publishedAt?: string;
 *   contentHtml?: string | null;
 *   excerpt?: string | null;
 *   image?: {url?: string | null} | null;
 *   blog?: {handle?: string | null} | null;
 *   tags?: string[] | null;
 * }>} articles
 * @param {number} [limit]
 */
function titleKey(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .slice(0, 5)
    .join(' ');
}

export function pickCultureJournalArticles(articles, limit = 4): JournalArticleTeaser[] {
  const picked: JournalArticleTeaser[] = [];
  const seen = new Set<string>();
  for (const article of articles) {
    const excerpt =
      article.excerpt ||
      (article.contentHtml
        ? article.contentHtml.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim().slice(0, 180)
        : '');
    if (
      !isCultureJournalArticle({
        title: article.title,
        excerpt,
        tags: article.tags,
      })
    ) {
      continue;
    }
    const blogHandle = article.blog?.handle;
    if (!blogHandle) continue;
    const key = titleKey(article.title);
    if (seen.has(key)) continue;
    seen.add(key);
    picked.push({
      id: article.id,
      title: article.title,
      handle: article.handle,
      blogHandle,
      excerpt: excerpt || undefined,
      publishedAt: article.publishedAt,
      imageUrl: article.image?.url ?? null,
    });
    if (picked.length >= limit) break;
  }
  return picked;
}

export const JOURNAL_CULTURE_QUERY = `#graphql
  query JournalCultureArticles($language: LanguageCode) @inContext(language: $language) {
    blogs(first: 5) {
      nodes {
        handle
        articles(first: 24, sortKey: PUBLISHED_AT, reverse: true) {
          nodes {
            id
            title
            handle
            publishedAt
            contentHtml
            tags
            image {
              url
              altText
            }
            blog {
              handle
            }
          }
        }
      }
    }
  }
` as const;
