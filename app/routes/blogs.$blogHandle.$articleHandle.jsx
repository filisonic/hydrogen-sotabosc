import {Link, useLoaderData} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {JsonLd} from '~/components/seo/JsonLd';
import {
  formatJournalDate,
  readingTimeFromHtml,
  excerptFromHtml,
} from '~/components/journal/formatDate';
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
  const image = article?.image;
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
    ...(image
      ? [
          {property: 'og:image', content: image.url},
          ...(image.width ? [{property: 'og:image:width', content: String(image.width)}] : []),
          ...(image.height ? [{property: 'og:image:height', content: String(image.height)}] : []),
          {property: 'og:image:alt', content: image.altText || title},
          {name: 'twitter:card', content: 'summary_large_image'},
          {name: 'twitter:title', content: title},
          {name: 'twitter:description', content: description},
          {name: 'twitter:image', content: image.url},
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
      imageUrl: node.image?.url || null,
    }));

  return {
    article: blog.articleByHandle,
    blogHandle: blog.handle,
    blogTitle: blog.title,
    related,
    origin: new URL(request.url).origin,
  };
}

export default function Article() {
  /** @type {LoaderReturnData} */
  const {article, blogHandle, blogTitle, related} = useLoaderData();
  const {title, image, contentHtml, author} = article;
  const publishedDate = formatJournalDate(article.publishedAt);
  const readingTime = readingTimeFromHtml(contentHtml);
  const authorName = author?.name || 'Sotabosc Editorial';
  const sectionName = blogTitle || blogHandle.replace(/-/g, ' ');

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    image: image ? [image.url] : [],
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

      <header className="journal-masthead journal-masthead--article">
        <div className="journal-masthead-inner">
          <Link to={`/blogs/${blogHandle}`} className="journal-back">
            ← {sectionName}
          </Link>
        </div>
      </header>

      <article className="journal-article-wrap">
        <header className="journal-article-header">
          <span className="journal-kicker">{sectionName} · Barcelona</span>
          <h1 className="journal-article-headline">{title}</h1>
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

        {image ? (
          <figure className="journal-article-hero">
            <Image
              data={image}
              sizes="(min-width: 900px) 44rem, 100vw"
              loading="eager"
              alt={image.altText || title}
            />
          </figure>
        ) : (
          <div className="journal-article-hero journal-article-hero--mark" aria-hidden="true">
            <span>Sotabosc</span>
          </div>
        )}

        <div
          className="journal-article-body"
          dangerouslySetInnerHTML={{__html: contentHtml}}
        />

        <p className="journal-article-endmark" aria-hidden="true">
          ◆
        </p>

        <footer className="journal-article-foot">
          <p className="journal-article-foot-note">
            Part of the Sotabosc Journal — culture from Barcelona and the creative city.
          </p>
          <nav className="journal-article-foot-links" aria-label="Continue reading">
            <Link to={`/blogs/${blogHandle}`}>More in {sectionName}</Link>
            <Link to="/blogs">All journal sections</Link>
            <Link to="/">Edition</Link>
            <Link to="/city/events">Happening</Link>
          </nav>
        </footer>
      </article>

      {related?.length > 0 ? (
        <aside className="journal-related" aria-label="More from the Journal">
          <p className="journal-section-label">Keep reading</p>
          <div className="journal-related-grid">
            {related.map((item) => (
              <Link
                key={item.id}
                to={`/blogs/${blogHandle}/${item.handle}`}
                className="journal-related-card"
                prefetch="intent"
              >
                <div
                  className={
                    item.imageUrl
                      ? 'journal-related-fig'
                      : 'journal-related-fig journal-related-fig--empty'
                  }
                >
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="" loading="lazy" />
                  ) : (
                    <span aria-hidden="true">S</span>
                  )}
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
