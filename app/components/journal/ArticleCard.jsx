import {Link} from 'react-router';
import {formatJournalDate, excerptFromHtml} from './formatDate';
import {
  firstImageSrcFromHtml,
  shopifyImageSrcSet,
  shopifyImageUrl,
} from './shopifyImageUrl';

/**
 * @param {{
 *   article: import('storefrontapi.generated').ArticleItemFragment;
 *   featured?: boolean;
 *   loading?: 'eager' | 'lazy';
 * }}
 */
export function ArticleCard({article, featured = false, loading = 'lazy'}) {
  const publishedAt = formatJournalDate(article.publishedAt);
  const excerpt = excerptFromHtml(article.contentHtml);
  const blogHandle = article.blog?.handle;
  const imageUrl =
    article.image?.url || firstImageSrcFromHtml(article.contentHtml) || null;

  return (
    <article className={`journal-card${featured ? ' journal-card-featured' : ''}`}>
      <Link
        to={`/blogs/${blogHandle}/${article.handle}`}
        prefetch="intent"
        className="journal-card-link"
      >
        {imageUrl ? (
          <div className="journal-card-image">
            <img
              src={shopifyImageUrl(imageUrl, featured ? 1200 : 800)}
              srcSet={shopifyImageSrcSet(imageUrl)}
              sizes={
                featured
                  ? '(min-width: 900px) 50vw, 100vw'
                  : '(min-width: 900px) 33vw, 100vw'
              }
              alt={article.image?.altText || article.title}
              loading={loading}
              decoding="async"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : (
          <div className="journal-card-image journal-card-image--empty" aria-hidden="true">
            <span>S</span>
          </div>
        )}
        <div>
          <div className="journal-card-meta">
            <time dateTime={article.publishedAt}>{publishedAt}</time>
            {article.author?.name ? (
              <>
                <span aria-hidden="true">·</span>
                <span>{article.author.name}</span>
              </>
            ) : null}
            <span className="journal-card-tag">Report</span>
          </div>
          <h2 className="journal-card-headline">{article.title}</h2>
          {excerpt ? <p className="journal-card-excerpt">{excerpt}</p> : null}
          <span className="journal-card-read">Read article</span>
        </div>
      </Link>
    </article>
  );
}
