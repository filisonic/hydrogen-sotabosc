import {Link, useLoaderData} from 'react-router';

import {pageTitle} from '~/lib/seo/siteMeta';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  return [{title: pageTitle(data?.policy.title ?? 'Policy')}];
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({params, context}) {
  if (!params.handle) {
    throw new Response('No handle was passed in', {status: 404});
  }

  const policyName = params.handle.replace(/-([a-z])/g, (_, m1) =>
    m1.toUpperCase(),
  );

  const data = await context.storefront.query(POLICY_CONTENT_QUERY, {
    variables: {
      privacyPolicy: false,
      shippingPolicy: false,
      termsOfService: false,
      refundPolicy: false,
      [policyName]: true,
      language: context.storefront.i18n?.language,
    },
  });

  const policy = data.shop?.[policyName];

  // Fallback: Provide a storefront shipping policy if none is set in Admin
  if (!policy) {
    if (policyName === 'shippingPolicy') {
      /** @type {{title: string, body: string, handle: string}} */
      const fallback = {
        title: 'Shipping policy',
        handle: 'shipping-policy',
        body: `
          <div class="prose prose-neutral">
            <p>Original plotter drawings ship from Barcelona, unframed, flat in a rigid mailer. Rates in EUR, calculated at checkout.</p>
            <ul class="space-y-2">
              <li><strong>Spain — Estándar:</strong> €6.99 per order. Free on orders of €55+.</li>
              <li><strong>EU — Estándar Internacional:</strong> €8.99 flat. No free threshold. Rest of the EU (26, not Spain): AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI SE.</li>
              <li><strong>International — Estándar:</strong> €12.99 flat. No free threshold. Destinations enabled at checkout (US, UK, AU, CA, JP, and others). Final rate at checkout.</li>
            </ul>
            <p>No framed shipping. Questions: <a href="mailto:hola@sotabosc.world">hola@sotabosc.world</a>.</p>
          </div>
        `,
      };
      return {policy: fallback};
    }
    throw new Response('Could not find the policy', {status: 404});
  }

  return {policy};
}

export default function Policy() {
  /** @type {LoaderReturnData} */
  const {policy} = useLoaderData();

  return (
    <div className="policy">
      <br />
      <br />
      <div>
        <Link to="/policies">← Back to Policies</Link>
      </div>
      <br />
      <h1>{policy.title}</h1>
      <div dangerouslySetInnerHTML={{__html: policy.body}} />
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/Shop
const POLICY_CONTENT_QUERY = `#graphql
  fragment Policy on ShopPolicy {
    body
    handle
    id
    title
    url
  }
  query Policy(
    $country: CountryCode
    $language: LanguageCode
    $privacyPolicy: Boolean!
    $refundPolicy: Boolean!
    $shippingPolicy: Boolean!
    $termsOfService: Boolean!
  ) @inContext(language: $language, country: $country) {
    shop {
      privacyPolicy @include(if: $privacyPolicy) {
        ...Policy
      }
      shippingPolicy @include(if: $shippingPolicy) {
        ...Policy
      }
      termsOfService @include(if: $termsOfService) {
        ...Policy
      }
      refundPolicy @include(if: $refundPolicy) {
        ...Policy
      }
    }
  }
`;

/**
 * @typedef {keyof Pick<
 *   Shop,
 *   'privacyPolicy' | 'shippingPolicy' | 'termsOfService' | 'refundPolicy'
 * >} SelectedPolicies
 */

/** @typedef {import('./+types/policies.$handle').Route} Route */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').Shop} Shop */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
