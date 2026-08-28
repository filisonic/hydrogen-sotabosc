import {MEMBERSHIP_PUBLIC} from '~/lib/featureFlags';
import {
  getMembershipProductHandle,
  MEMBERSHIP_CART_CREATE_MUTATION,
  MEMBERSHIP_PRODUCT_QUERY,
} from '~/lib/membership.server';

/**
 * Creates a Shopify cart with the membership product and redirects to checkout.
 * Uses the monthly selling plan when one is attached to the product variant.
 */
export async function action({request, context}) {
  if (request.method !== 'POST') {
    return Response.json({error: 'Method not allowed'}, {status: 405});
  }

  if (!MEMBERSHIP_PUBLIC) {
    return Response.json(
      {error: 'Membership checkout is paused. Explore the map at sotabosc.world.'},
      {status: 503},
    );
  }

  const {storefront} = context;
  const handle = getMembershipProductHandle(context.env);

  try {
    const {product} = await storefront.query(MEMBERSHIP_PRODUCT_QUERY, {
      variables: {handle},
    });

    const variant = product?.variants?.nodes?.[0];

    if (!variant) {
      return Response.json(
        {
          error:
            'Membership product not found. Create a product with handle "mycelial-network-membership" in Shopify admin.',
        },
        {status: 404},
      );
    }

    if (!variant.availableForSale && !product.availableForSale) {
      return Response.json(
        {
          error:
            'Membership is not available for purchase yet. Enable the product in Shopify admin (Active + published to Online Store).',
        },
        {status: 503},
      );
    }

    const sellingPlanId =
      variant.sellingPlanAllocations?.nodes?.[0]?.sellingPlan?.id ?? null;

    const line = {
      merchandiseId: variant.id,
      quantity: 1,
      ...(sellingPlanId ? {sellingPlanId} : {}),
    };

    const {cartCreate} = await storefront.mutate(MEMBERSHIP_CART_CREATE_MUTATION, {
      variables: {
        input: {
          lines: [line],
          buyerIdentity: {
            countryCode: context.storefront.i18n.country,
          },
        },
      },
    });

    const userErrors = cartCreate?.userErrors ?? [];
    if (userErrors.length) {
      console.error('[membership/checkout] cart userErrors:', userErrors);
      return Response.json(
        {error: userErrors[0]?.message || 'Could not create cart'},
        {status: 400},
      );
    }

    const checkoutUrl = cartCreate?.cart?.checkoutUrl;
    if (!checkoutUrl) {
      throw new Error('Could not create cart');
    }

    return Response.redirect(checkoutUrl, 303);
  } catch (error) {
    console.error('[membership/checkout]', error);
    return Response.json(
      {error: 'Could not start checkout. Please try again.'},
      {status: 500},
    );
  }
}
