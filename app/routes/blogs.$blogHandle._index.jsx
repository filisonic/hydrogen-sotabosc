import {Link, useLoaderData} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ArticleCard} from '~/components/journal/ArticleCard';
import {JournalPagination} from '~/components/journal/JournalPagination';
import {pageTitle} from '~/lib/seo/siteMeta';
import {openGraphImageMeta} from '~/lib/seo/siteImagery';
import {canonicalLinkMeta} from '~/lib/seo/metaHelpers';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  const title = data?.blog?.seo?.title || data?.blog?.title || 'News';
  const description =
    data?.blog?.seo?.description ||
    `Latest articles from ${data?.blog?.title || 'Sotabosc Journal'}.`;
  const leadImage = data?.blog?.articles?.nodes?.[0]?.image;

  return [
    {title: pageTitle(title)},
    {name: 'description', content: description},
    {property: 'og:type', content: 'website'},
    {property: 'og:title', content: title},
    {property: 'og:description', content: description},
    ...canonicalLinkMeta(data?.origin, `/blogs/${data?.blog?.handle || ''}`),
    ...(leadImage
      ? [
          {property: 'og:image', content: leadImage.url},
          {name: 'twitter:card', content: 'summary_large_image'},
          {name: 'twitter:image', content: leadImage.url},
        ]
      : openGraphImageMeta(data?.origin)),
  ];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  const criticalData = await loadCriticalData(args);
  return {...criticalData};
}

/**
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context, request, params}) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 9,
  });

  if (!params.blogHandle) {
    throw new Response(`blog not found`, {status: 404});
  }

  const [{blog}] = await Promise.all([
    context.storefront.query(BLOGS_QUERY, {
      variables: {
        blogHandle: params.blogHandle,
        ...paginationVariables,
      },
    }),
  ]);

  if (!blog?.articles) {
    throw new Response('Not found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle: params.blogHandle, data: blog});

  return {blog, origin: new URL(request.url).origin};
}

export default function Blog() {
  /** @type {LoaderReturnData} */
  const {blog} = useLoaderData();
  const {articles} = blog;

  return (
    <div className="journal mag">
      <header className="journal-masthead">
        <div className="journal-masthead-inner">
          <Link to="/blogs" className="journal-back">
            ← All sections
          </Link>
          <span className="journal-kicker">Sotabosc Journal</span>
          <h1 className="journal-title">{blog.title}</h1>
        </div>
      </header>

      <main className="journal-main">
        <p className="journal-section-label">Latest articles</p>
        {articles.nodes.length === 0 ? (
          <p className="journal-empty">
            No articles published in this section yet — check back soon.
          </p>
        ) : (
          <JournalPagination connection={articles}>
            {({node: article, index}) => (
              <ArticleCard
                article={article}
                key={article.id}
                featured={index === 0}
                loading={index < 2 ? 'eager' : 'lazy'}
              />
            )}
          </JournalPagination>
        )}
      </main>
    </div>
  );
}

const BLOGS_QUERY = `#graphql
  query Blog(
    $language: LanguageCode
    $blogHandle: String!
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(language: $language) {
    blog(handle: $blogHandle) {
      title
      handle
      seo {
        title
        description
      }
      articles(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ArticleItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
  fragment ArticleItem on Article {
    author: authorV2 {
      name
    }
    contentHtml
    handle
    id
    image {
      id
      altText
      url
      width
      height
    }
    publishedAt
    title
    blog {
      handle
    }
  }
`;

/** @typedef {import('./+types/blogs.$blogHandle._index').Route} Route */
/** @typedef {import('storefrontapi.generated').ArticleItemFragment} ArticleItemFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
