import {Link, useLoaderData} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {pageTitle} from '~/lib/seo/siteMeta';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [
    {title: pageTitle('Journal')},
    {
      name: 'description',
      content:
        'News, culture, and creative life in Barcelona — reports and essays from the Sotabosc editorial desk.',
    },
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
async function loadCriticalData({context, request}) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 10,
  });

  const [{blogs}] = await Promise.all([
    context.storefront.query(BLOGS_QUERY, {
      variables: {
        ...paginationVariables,
      },
    }),
  ]);

  return {blogs};
}

export default function Blogs() {
  /** @type {LoaderReturnData} */
  const {blogs} = useLoaderData();

  return (
    <div className="journal mag">
      <header className="journal-masthead">
        <div className="journal-masthead-inner">
          <span className="journal-kicker">Sotabosc · Barcelona</span>
          <h1 className="journal-title">The Journal</h1>
          <p className="journal-dek">
            Reports on culture, ecology, and the creative city — curated for
            readers who care where ideas and places meet.
          </p>
        </div>
      </header>

      <main className="journal-main">
        <p className="journal-section-label">Sections</p>
        <div className="journal-issue-list">
          <PaginatedResourceSection
            connection={blogs}
            paginationClassName="journal-pagination"
          >
            {({node: blog}) => (
              <Link
                key={blog.handle}
                prefetch="intent"
                to={`/blogs/${blog.handle}`}
                className="journal-issue-row"
              >
                <h2>{blog.title}</h2>
                <span className="journal-issue-count">View articles →</span>
              </Link>
            )}
          </PaginatedResourceSection>
        </div>
      </main>
    </div>
  );
}

const BLOGS_QUERY = `#graphql
  query Blogs(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    blogs(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        title
        handle
        seo {
          title
          description
        }
      }
    }
  }
`;

/** @typedef {import('./+types/blogs._index').Route} Route */
/** @typedef {import('storefrontapi.generated').BlogsQuery} BlogsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
