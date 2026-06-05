# Membership setup (one-time)

## Public launch toggle

Membership sales and nav CTAs are controlled by **`app/lib/featureFlags.ts`** (`MEMBERSHIP_PUBLIC`).
While building visitor momentum, leave this off (default). To re-enable without a code change, set
`PUBLIC_MEMBERSHIP_ENABLED=true` in Oxygen / `.env`.

---

Paid membership checkout uses Shopify product **`mycelial-network-membership`** (€50) and
activates members via the `orders/paid` webhook.

## 1. Shopify Admin — product

1. Open **Products → Sotabosc Network Membership** (`mycelial-network-membership`).
2. Set status to **Active**.
3. Under **Sales channels**, publish to **Online Store**.
4. Inventory: set **Continue selling when out of stock** (digital membership).
5. **Subscriptions** (Shopify Subscriptions app):
   - Create a **monthly** selling plan at **€50**.
   - Attach it to this product.

Or run (requires Admin API token with `read_products`, `write_products`):

```bash
node scripts/setup-membership-product.mjs fix
```

## 2. Oxygen / `.env` secrets

Add to production env (Shopify Oxygen → Environment variables):

| Variable | Purpose |
|----------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Webhook upgrades profiles (never expose client-side) |
| `SHOPIFY_WEBHOOK_SECRET` | HMAC verification for `orders/paid` webhook |
| `MAILERLITE_PAID_GROUP_ID` | Paid members group (already set locally) |
| `MAILERLITE_WAITLIST_GROUP_ID` | Optional waitlist group |

Optional overrides:

- `MEMBERSHIP_PRODUCT_HANDLE` (default: `mycelial-network-membership`)
- `MEMBERSHIP_SHOPIFY_PRODUCT_ID` (default: `10785070907735`)

## 3. Supabase migration

```bash
supabase db push
# or apply: supabase/migrations/20260603140000_membership_activation.sql
```

## 4. Shopify webhook

**Settings → Notifications → Webhooks → Create webhook**

| Field | Value |
|-------|-------|
| Event | Order payment |
| Format | JSON |
| URL | `https://sotabosc.world/api/webhooks/shopify/orders-paid` |

Copy the **signing secret** into `SHOPIFY_WEBHOOK_SECRET`.

## 5. Smoke test

1. Visit `/membership` → **Join Now — €50 / month**
2. Complete Shopify checkout (use Bogus Gateway in dev store)
3. Confirm webhook logs `activated` and MailerLite paid group receives the email
4. Sign in via magic link — Supabase `profiles.tier` should be `paid`
