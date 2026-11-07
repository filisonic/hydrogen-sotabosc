import {useLoaderData} from 'react-router';
import {EditionHome} from '~/components/edition/EditionHome';
import {
  JOURNAL_CULTURE_QUERY,
  pickCultureJournalArticles,
} from '~/lib/journal/cultureArticles';
import editionStyles from '~/styles/edition.css?url';

/**
 * Sotabosc homepage — cultural magazine / channel edition.
 * Living map moved to `/map`.
 */
export const links = () => [{rel: 'stylesheet', href: editionStyles}];

export const meta = () => [
  {title: 'Sotabosc — Culture, art and creative life'},
  {
    name: 'description',
    content:
      'Barcelona cultural channel with magazine sensibility. Art, design, exhibitions, creators and what’s happening — on screens, digitally, and later in print.',
  },
  {property: 'og:title', content: 'Sotabosc — Culture, art and creative life'},
  {
    property: 'og:description',
    content:
      'An intelligent local cultural channel. Barcelona Edition: happenings, exhibitions, artists, and the local edit.',
  },
  {property: 'og:type', content: 'website'},
  {property: 'og:url', content: 'https://sotabosc.world/'},
  {property: 'og:site_name', content: 'Sotabosc'},
  {name: 'twitter:card', content: 'summary_large_image'},
];

/**
 * @param {import('react-router').LoaderFunctionArgs} args
 */
export async function loader({context}) {
  /** @type {import('~/lib/journal/cultureArticles').JournalArticleTeaser[]} */
  let journalArticles = [];

  try {
    const journalResult = await context.storefront.query(JOURNAL_CULTURE_QUERY);
    const flat =
      journalResult?.blogs?.nodes?.flatMap((blog) => blog.articles?.nodes || []) ||
      [];
    journalArticles = pickCultureJournalArticles(flat, 4);
  } catch {
    journalArticles = [];
  }

  try {
    const {getCityDirectory} = await import('~/lib/directory/source.server');
    const {buildEditionWindow} = await import('~/lib/directory/editionWindow');
    const {places, events, creators} = await getCityDirectory(context);
    const edition = buildEditionWindow(places, events, creators);
    return {edition, journalArticles};
  } catch {
    const {buildEditionWindow} = await import('~/lib/directory/editionWindow');
    return {
      edition: buildEditionWindow([], [], []),
      journalArticles,
    };
  }
}

export default function EditionIndexPage() {
  const {edition, journalArticles} = useLoaderData();
  return <EditionHome edition={edition} journalArticles={journalArticles} />;
}
