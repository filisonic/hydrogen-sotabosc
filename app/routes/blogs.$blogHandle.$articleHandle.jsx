import {Link, useLoaderData} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {JsonLd} from '~/components/seo/JsonLd';
import {formatJournalDate, readingTimeFromHtml} from '~/components/journal/formatDate';
import {pageTitle} from '~/lib/seo/siteMeta';
import {openGraphImageMeta} from '~/lib/seo/siteImagery';
import {canonicalLinkMeta} from '~/lib/seo/metaHelpers';

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

  return {
    article: blog.articleByHandle,
    blogHandle: blog.handle,
    origin: new URL(request.url).origin,
  };
}

export default function Article() {
  /** @type {LoaderReturnData} */
  const {article, blogHandle} = useLoaderData();
  const {title, image, contentHtml, author} = article;
  const publishedDate = formatJournalDate(article.publishedAt);
  const readingTime = readingTimeFromHtml(contentHtml);
  const authorName = author?.name || 'Sotabosc Editorial';
  const sectionName = blogHandle.replace(/-/g, ' ');

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

      <header className="journal-masthead">
        <div className="journal-masthead-inner">
          <Link to={`/blogs/${blogHandle}`} className="journal-back">
            ← {blogHandle.replace(/-/g, ' ')}
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
            <span>By <address>{authorName}</address></span>
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
        ) : null}

        <div
          className="journal-article-body"
          dangerouslySetInnerHTML={{__html: contentHtml}}
        />
      </article>
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
    }
  }
`;

/** @typedef {import('./+types/blogs.$blogHandle.$articleHandle').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
