import { redirect } from 'react-router';

/**
 * Creates a Shopify cart with the membership product and redirects to checkout.
 *
 * Requires a product with handle "sotabosc-network-membership" in Shopify admin.
 */
export async function action({ request, context }) {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const { storefront } = context;

  try {
    // 1. Fetch the membership product variant ID
    const { product } = await storefront.query(MEMBERSHIP_PRODUCT_QUERY, {
      variables: { handle: 'sotabosc-network-membership' },
    });

    if (!product?.variants?.nodes?.[0]) {
      return Response.json(
        { error: 'Membership product not found. Please set it up in Shopify admin.' },
        { status: 404 },
      );
    }

    const variantId = product.variants.nodes[0].id;

    // 2. Create a cart with the membership product
    const { cartCreate } = await storefront.mutate(CART_CREATE_MUTATION, {
      variables: {
        input: {
          lines: [{ merchandiseId: variantId, quantity: 1 }],
        },
      },
    });

    const checkoutUrl = cartCreate?.cart?.checkoutUrl;

    if (!checkoutUrl) {
      throw new Error('Could not create cart');
    }

    return redirect(checkoutUrl);
  } catch (error) {
    console.error('[membership/checkout]', error);
    return Response.json(
      { error: 'Could not start checkout. Please try again.' },
      { status: 500 },
    );
  }
}

const MEMBERSHIP_PRODUCT_QUERY = `#graphql
  query MembershipProduct($handle: String!) {
    product(handle: $handle) {
      id
      title
      variants(first: 1) {
        nodes {
          id
          price {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;

const CART_CREATE_MUTATION = `#graphql
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;
