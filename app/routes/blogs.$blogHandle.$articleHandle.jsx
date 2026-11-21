import {Link, useLoaderData} from 'react-router';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {JsonLd} from '~/components/seo/JsonLd';
import {
  formatJournalDate,
  readingTimeFromHtml,
  excerptFromHtml,
} from '~/components/journal/formatDate';
import {
  firstImageSrcFromHtml,
  shopifyImageSrcSet,
  shopifyImageUrl,
} from '~/components/journal/shopifyImageUrl';
import {resolveJournalImageUrl} from '~/lib/media/fallbackImagery';
import {pageTitle} from '~/lib/seo/siteMeta';
import {openGraphImageMeta} from '~/lib/seo/siteImagery';
import {canonicalLinkMeta} from '~/lib/seo/metaHelpers';
import {isCultureJournalArticle} from '~/lib/journal/cultureArticles';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  const article = data?.article;
  const title = article?.seo?.title || article?.title || 'Article';
  const description =
    article?.seo?.description ||
    (article?.contentHtml
      ? article.contentHtml.replace(/<[^>]*>?/gm, '').slice(0, 155)
      : '');
  const imageUrl = data?.heroUrl || article?.image?.url;
  const path =
    data?.blogHandle && article?.handle
      ? `/blogs/${data.blogHandle}/${article.handle}`
      : '';

  return [
    {title: pageTitle(title)},
    {name: 'description', content: description},
    {property: 'og:type', content: 'article'},
    {property: 'og:title', content: title},
    {property: 'og:description', content: description},
    {property: 'article:published_time', content: article?.publishedAt || ''},
    ...canonicalLinkMeta(data?.origin, path),
    ...(imageUrl
      ? [
          {property: 'og:image', content: imageUrl},
          {name: 'twitter:card', content: 'summary_large_image'},
          {name: 'twitter:title', content: title},
          {name: 'twitter:description', content: description},
          {name: 'twitter:image', content: imageUrl},
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
  const {blogHandle, articleHandle} = params;

  if (!articleHandle || !blogHandle) {
    throw new Response('Not found', {status: 404});
  }

  const [{blog}] = await Promise.all([
    context.storefront.query(ARTICLE_QUERY, {
      variables: {blogHandle, articleHandle},
    }),
  ]);

  if (!blog?.articleByHandle) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(
    request,
    {
      handle: articleHandle,
      data: blog.articleByHandle,
    },
    {
      handle: blogHandle,
      data: blog,
    },
  );

  const article = blog.articleByHandle;
  const heroUrl = resolveJournalImageUrl({
    imageUrl: article.image?.url || firstImageSrcFromHtml(article.contentHtml),
    handle: article.handle,
    title: article.title,
  });

  const related = (blog.articles?.nodes || [])
    .filter((node) => node.handle !== articleHandle)
    .filter((node) =>
      isCultureJournalArticle({
        title: node.title,
        excerpt: excerptFromHtml(node.contentHtml, 120),
        tags: node.tags,
      }),
    )
    .slice(0, 3)
    .map((node) => ({
      id: node.id,
      title: node.title,
      handle: node.handle,
      publishedAt: node.publishedAt,
      excerpt: excerptFromHtml(node.contentHtml, 140),
      imageUrl: resolveJournalImageUrl({
        imageUrl: node.image?.url || firstImageSrcFromHtml(node.contentHtml),
        handle: node.handle,
        title: node.title,
        width: 800,
      }),
    }));

  return {
    article,
    blogHandle: blog.handle,
    blogTitle: blog.title,
    heroUrl,
    related,
    origin: new URL(request.url).origin,
  };
}

export default function Article() {
  /** @type {LoaderReturnData} */
  const {article, blogHandle, blogTitle, heroUrl, related} = useLoaderData();
  const {title, contentHtml, author} = article;
  const publishedDate = formatJournalDate(article.publishedAt);
  const readingTime = readingTimeFromHtml(contentHtml);
  const authorName = author?.name || 'Sotabosc Editorial';
  const sectionName = blogTitle || blogHandle.replace(/-/g, ' ');
  const dek = excerptFromHtml(contentHtml, 160);

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    image: heroUrl ? [heroUrl] : [],
    datePublished: article.publishedAt,
    author: [
      {
        '@type': 'Person',
        name: authorName,
      },
    ],
  };

  return (
    <div className="journal mag">
      <JsonLd data={articleLd} />

      <article className="journal-feature">
        <figure className="journal-feature-hero">
          <img
            src={shopifyImageUrl(heroUrl, 1600)}
            srcSet={shopifyImageSrcSet(heroUrl)}
            sizes="100vw"
            alt={article.image?.altText || title}
            loading="eager"
            decoding="async"
            referrerPolicy="no-referrer"
          />
        </figure>

        <div className="journal-feature-inner">
          <Link to={`/blogs/${blogHandle}`} className="journal-back">
            ← {sectionName}
          </Link>

          <header className="journal-feature-header">
            <span className="journal-kicker">{sectionName} · Barcelona</span>
            <h1 className="journal-feature-headline">{title}</h1>
            {dek ? <p className="journal-feature-dek">{dek}</p> : null}
            <div className="journal-article-byline">
              <time dateTime={article.publishedAt}>{publishedDate}</time>
              <span aria-hidden="true">·</span>
              <span>
                By <address>{authorName}</address>
              </span>
              {readingTime ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{readingTime}</span>
                </>
              ) : null}
            </div>
          </header>

          <div
            className="journal-article-body"
            dangerouslySetInnerHTML={{__html: contentHtml}}
          />

          <p className="journal-article-endmark" aria-hidden="true">
            ◆
          </p>

          <footer className="journal-article-foot">
            <p className="journal-article-foot-note">
              Part of the Sotabosc Journal — culture from Barcelona and the
              creative city.
            </p>
            <nav className="journal-article-foot-links" aria-label="Continue reading">
              <Link to={`/blogs/${blogHandle}`}>More in {sectionName}</Link>
              <Link to="/blogs">All journal sections</Link>
              <Link to="/">Edition</Link>
              <Link to="/city/events">Happening</Link>
            </nav>
          </footer>
        </div>
      </article>

      {related?.length > 0 ? (
        <aside className="journal-related" aria-label="More from the Journal">
          <div className="journal-related-head">
            <p className="journal-section-label">Keep reading</p>
            <Link to={`/blogs/${blogHandle}`} className="journal-related-more">
              More in {sectionName} →
            </Link>
          </div>
          <div className="journal-related-grid">
            {related.map((item) => (
              <Link
                key={item.id}
                to={`/blogs/${blogHandle}/${item.handle}`}
                className="journal-related-card"
                prefetch="intent"
              >
                <div className="journal-related-fig">
                  <img
                    src={shopifyImageUrl(item.imageUrl, 800)}
                    srcSet={shopifyImageSrcSet(item.imageUrl, [400, 800, 1200])}
                    sizes="(min-width: 900px) 33vw, 100vw"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h2 className="journal-related-title">{item.title}</h2>
                {item.excerpt ? (
                  <p className="journal-related-excerpt">{item.excerpt}</p>
                ) : null}
                <time dateTime={item.publishedAt}>
                  {formatJournalDate(item.publishedAt)}
                </time>
              </Link>
            ))}
          </div>
        </aside>
      ) : null}
    </div>
  );
}

const ARTICLE_QUERY = `#graphql
  query Article(
    $articleHandle: String!
    $blogHandle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    blog(handle: $blogHandle) {
      handle
      title
      articleByHandle(handle: $articleHandle) {
        handle
        title
        contentHtml
        publishedAt
        author: authorV2 {
          name
        }
        image {
          id
          altText
          url
          width
          height
        }
        seo {
          description
          title
        }
      }
      articles(first: 12, sortKey: PUBLISHED_AT, reverse: true) {
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
        }
      }
    }
  }
`;

/** @typedef {import('./+types/blogs.$blogHandle.$articleHandle').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
