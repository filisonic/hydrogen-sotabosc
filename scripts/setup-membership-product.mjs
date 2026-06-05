/**
 * One-time admin setup: inspect + fix membership product.
 * Uses PRIVATE_STOREFRONT_API_TOKEN (Admin API) from .env via dotenv.
 */
import 'dotenv/config';

const shop = process.env.PUBLIC_STORE_DOMAIN;
const token = process.env.PRIVATE_STOREFRONT_API_TOKEN;
const API = `https://${shop}/admin/api/2025-01/graphql.json`;

async function gql(query, variables = {}) {
  const res = await fetch(API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) {
    console.error(JSON.stringify(json.errors, null, 2));
    throw new Error(json.errors[0].message);
  }
  return json.data;
}

const PRODUCT_GID = 'gid://shopify/Product/10785070907735';
const VARIANT_GID = 'gid://shopify/ProductVariant/53419395842391';

async function inspect() {
  const data = await gql(`#graphql
    query InspectMembership($id: ID!) {
      product(id: $id) {
        id title handle status
        publishedAt
        totalInventory
        tracksInventory
        requiresSellingPlan
        variants(first: 1) {
          nodes {
            id
            inventoryQuantity
            inventoryPolicy
            availableForSale
            sellingPlanGroups(first: 5) {
              nodes { id name sellingPlans(first: 5) { nodes { id name } } }
            }
          }
        }
      }
    }
  `, { id: PRODUCT_GID });
  console.log('INSPECT:', JSON.stringify(data, null, 2));
}

async function fixProduct() {
  const data = await gql(`#graphql
    mutation FixMembershipProduct($product: ProductUpdateInput!) {
      productUpdate(product: $product) {
        product { id handle status }
        userErrors { field message }
      }
    }
  `, {
    product: {
      id: PRODUCT_GID,
      status: 'ACTIVE',
    },
  });
  console.log('PRODUCT UPDATE:', JSON.stringify(data, null, 2));

  const inv = await gql(`#graphql
    mutation FixInventory($id: ID!, $input: ProductVariantInput!) {
      productVariantUpdate(id: $id, input: $input) {
        productVariant { id inventoryPolicy inventoryQuantity }
        userErrors { field message }
      }
    }
  `, {
    id: VARIANT_GID,
    input: {
      inventoryPolicy: 'CONTINUE',
    },
  });
  console.log('VARIANT UPDATE:', JSON.stringify(inv, null, 2));

  const pub = await gql(`#graphql
    mutation PublishProduct($id: ID!, $channels: [PublicationInput!]!) {
      publishablePublish(id: $id, input: $channels) {
        publishable { ... on Product { id handle } }
        userErrors { field message }
      }
    }
  `, {
    id: PRODUCT_GID,
    channels: [{ publicationId: await getOnlineStorePublicationId() }],
  });
  console.log('PUBLISH:', JSON.stringify(pub, null, 2));
}

async function getOnlineStorePublicationId() {
  const data = await gql(`#graphql
    query Publications {
      publications(first: 10) {
        nodes { id name }
      }
    }
  `);
  const online = data.publications.nodes.find((p) =>
    /online store/i.test(p.name),
  );
  if (!online) throw new Error('Online Store publication not found');
  return online.id;
}

async function ensureSellingPlan() {
  const inspect = await gql(`#graphql
    query ExistingPlans($id: ID!) {
      product(id: $id) {
        variants(first: 1) {
          nodes {
            sellingPlanGroups(first: 5) {
              nodes {
                id
                sellingPlans(first: 5) { nodes { id name } }
              }
            }
          }
        }
      }
    }
  `, { id: PRODUCT_GID });

  const existing =
    inspect.product?.variants?.nodes?.[0]?.sellingPlanGroups?.nodes?.[0];
  if (existing?.sellingPlans?.nodes?.[0]) {
    console.log('SELLING PLAN EXISTS:', existing.sellingPlans.nodes[0].id);
    return existing.sellingPlans.nodes[0].id;
  }

  const data = await gql(`#graphql
    mutation CreateSellingPlan($input: SellingPlanGroupInput!) {
      sellingPlanGroupCreate(input: $input) {
        sellingPlanGroup {
          id
          sellingPlans(first: 1) { nodes { id name } }
        }
        userErrors { field message }
      }
    }
  `, {
    input: {
      name: 'Mycelial Network',
      merchantCode: 'mycelial-network-monthly',
      options: ['Billing frequency'],
      sellingPlansToCreate: [
        {
          name: 'Monthly — €50',
          category: 'SUBSCRIPTION',
          billingPolicy: {
            recurring: {
              interval: 'MONTH',
              intervalCount: 1,
            },
          },
          pricingPolicies: [
            {
              fixed: {
                adjustmentType: 'PERCENTAGE',
                adjustmentValue: { percentage: 0.0 },
              },
            },
          ],
        },
      ],
      resources: {
        productIds: [PRODUCT_GID],
      },
    },
  });

  const planId =
    data.sellingPlanGroupCreate?.sellingPlanGroup?.sellingPlans?.nodes?.[0]?.id;
  console.log('CREATED SELLING PLAN:', planId);
  return planId;
}

const cmd = process.argv[2] || 'inspect';
try {
  if (cmd === 'inspect') await inspect();
  else if (cmd === 'fix') {
    await fixProduct();
    await ensureSellingPlan();
    await inspect();
  } else {
    console.log('Usage: node scripts/setup-membership-product.mjs [inspect|fix]');
  }
} catch (err) {
  console.error(err);
  process.exit(1);
}
