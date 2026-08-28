/** Default Shopify product handle for the paid tier. */
export const MEMBERSHIP_PRODUCT_HANDLE = 'mycelial-network-membership';

/** Legacy handle kept for order webhook matching. */
export const MEMBERSHIP_PRODUCT_HANDLES = [
  MEMBERSHIP_PRODUCT_HANDLE,
  'sotabosc-network-membership',
] as const;

export const MEMBERSHIP_SHOPIFY_PRODUCT_ID = '10785070907735';

export interface MembershipEnv {
  MEMBERSHIP_PRODUCT_HANDLE?: string;
  MEMBERSHIP_SHOPIFY_PRODUCT_ID?: string;
  MAILERLITE_API_KEY?: string;
  MAILERLITE_PAID_GROUP_ID?: string;
}

export function getMembershipProductHandle(env: MembershipEnv) {
  return env.MEMBERSHIP_PRODUCT_HANDLE || MEMBERSHIP_PRODUCT_HANDLE;
}

export function getMembershipShopifyProductId(env: MembershipEnv) {
  return env.MEMBERSHIP_SHOPIFY_PRODUCT_ID || MEMBERSHIP_SHOPIFY_PRODUCT_ID;
}

export interface ShopifyOrderLineItem {
  product_id?: number | string | null;
  title?: string | null;
  sku?: string | null;
}

export function orderContainsMembershipLine(
  lineItems: ShopifyOrderLineItem[],
  env: MembershipEnv,
) {
  const productId = String(getMembershipShopifyProductId(env));
  return lineItems.some((item) => {
    if (item.product_id != null && String(item.product_id) === productId) {
      return true;
    }
    const title = (item.title || '').toLowerCase();
    return title.includes('network membership') || title.includes('mycelial');
  });
}

export const MEMBERSHIP_PRODUCT_QUERY = `#graphql
  query MembershipProduct(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      availableForSale
      variants(first: 1) {
        nodes {
          id
          availableForSale
          price {
            amount
            currencyCode
          }
          sellingPlanAllocations(first: 5) {
            nodes {
              sellingPlan {
                id
                name
                billingPolicy {
                  ... on SellingPlanRecurringBillingPolicy {
                    interval
                    intervalCount
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const MEMBERSHIP_CART_CREATE_MUTATION = `#graphql
  mutation MembershipCartCreate($input: CartInput!) {
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
