import {Link, useLoaderData} from 'react-router';
import {Image, getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import { motion } from 'framer-motion';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  return [{title: `Hydrogen | ${data?.blog.title ?? ''} blog`}];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context, request, params}) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 4,
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
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!blog?.articles) {
    throw new Response('Not found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle: params.blogHandle, data: blog});

  return {blog};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context}) {
  return {};
}

export default function Blog() {
  /** @type {LoaderReturnData} */
  const {blog} = useLoaderData();
  const {articles} = blog;

  return (
    <div className="mag" style={{ backgroundColor: '#fff', color: '#000' }}>
      <section style={{ padding: '10rem 2rem 4rem', maxWidth: '1400px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Link to="/blogs" style={{ fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', textDecoration: 'none', color: 'var(--sotabosc-accent)', display: 'block', marginBottom: '2rem' }}>← Back to Issues</Link>
          <h1 style={{ fontSize: 'clamp(3rem, 10vw, 8rem)', fontWeight: 900, lineHeight: 0.8, letterSpacing: '-0.05em', margin: 0 }}>
            {blog.title}
          </h1>
        </motion.div>
      </section>

      <main className="max-w-[1400px] mx-auto px-6 pb-32">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '4rem' }}>
          <PaginatedResourceSection connection={articles}>
            {({node: article, index}) => (
              <ArticleItem
                article={article}
                key={article.id}
                index={index}
                loading={index < 2 ? 'eager' : 'lazy'}
              />
            )}
          </PaginatedResourceSection>
        </div>
      </main>
    </div>
  );
}

function ArticleItem({article, loading, index}) {
  const publishedAt = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.publishedAt));

  // Create an asymmetrical layout based on index
  const isLarge = index % 3 === 0;
  const gridColumn = isLarge ? 'span 12' : 'span 6';
  
  return (
    <div style={{ gridColumn }} className="group">
      <Link 
        to={`/blogs/${article.blog.handle}/${article.handle}`} 
        style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      >
        <div style={{ display: 'flex', flexDirection: isLarge ? 'row' : 'column', gap: '3rem', alignItems: 'flex-start' }}>
          {article.image && (
            <div style={{ 
              width: isLarge ? '60%' : '100%', 
              aspectRatio: isLarge ? '16/9' : '4/5',
              overflow: 'hidden',
              backgroundColor: '#f5f5f5'
            }}>
              <Image
                alt={article.image.altText || article.title}
                data={article.image}
                loading={loading}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </div>
          )}
          <div style={{ flex: 1, paddingTop: isLarge ? '2rem' : '0' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{publishedAt}</span>
              <span style={{ width: '20px', height: '1px', background: '#000' }}></span>
              <span style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--sotabosc-accent)' }}>Premium Content</span>
            </div>
            <h3 style={{ 
              fontSize: isLarge ? 'clamp(2rem, 5vw, 4.5rem)' : '2rem', 
              fontWeight: 900, 
              lineHeight: 1, 
              letterSpacing: '-0.02em',
              marginBottom: '1.5rem' 
            }}>
              {article.title}
            </h3>
            <p style={{ fontSize: '1rem', lineHeight: 1.6, opacity: 0.6, marginBottom: '2rem', maxWidth: '500px' }}>
              {article.contentHtml?.replace(/<[^>]*>?/gm, '').slice(0, 150)}...
            </p>
            <span style={{ fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>Read Article</span>
          </div>
        </div>
      </Link>
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog
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
