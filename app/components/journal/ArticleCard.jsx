import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {formatJournalDate, excerptFromHtml} from './formatDate';

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

  return (
    <article className={`journal-card${featured ? ' journal-card-featured' : ''}`}>
      <Link
        to={`/blogs/${blogHandle}/${article.handle}`}
        prefetch="intent"
        className="journal-card-link"
      >
        {article.image ? (
          <div className="journal-card-image">
            <Image
              alt={article.image.altText || article.title}
              data={article.image}
              loading={loading}
              sizes={featured ? '(min-width: 900px) 50vw, 100vw' : '(min-width: 900px) 33vw, 100vw'}
            />
          </div>
        ) : null}
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
