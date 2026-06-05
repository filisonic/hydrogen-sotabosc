import {activatePaidMembership} from '~/lib/membership.activate.server';
import {
  orderContainsMembershipLine,
} from '~/lib/membership.server';
import {verifyShopifyWebhook} from '~/lib/shopify.webhook.server';

/**
 * Shopify `orders/paid` webhook — upgrades Supabase tier + MailerLite after payment.
 * Register in Shopify Admin → Settings → Notifications → Webhooks:
 *   Event: Order payment
 *   URL: https://sotabosc.world/api/webhooks/shopify/orders-paid
 *   Format: JSON
 */
export async function action({request, context}) {
  if (request.method !== 'POST') {
    return Response.json({error: 'Method not allowed'}, {status: 405});
  }

  const secret = context.env.SHOPIFY_WEBHOOK_SECRET;
  const rawBody = await request.text();

  if (!(await verifyShopifyWebhook(request, secret, rawBody))) {
    console.error('[webhooks/orders-paid] Invalid HMAC');
    return Response.json({error: 'Unauthorized'}, {status: 401});
  }

  let order;
  try {
    order = JSON.parse(rawBody);
  } catch {
    return Response.json({error: 'Invalid JSON'}, {status: 400});
  }

  const lineItems = order.line_items ?? [];
  if (!orderContainsMembershipLine(lineItems, context.env)) {
    return Response.json({ok: true, skipped: 'not_membership_order'});
  }

  const email =
    order.email?.trim() ||
    order.contact_email?.trim() ||
    order.customer?.email?.trim() ||
    '';

  if (!email) {
    console.error('[webhooks/orders-paid] Membership order missing email', order.id);
    return Response.json({error: 'Order email missing'}, {status: 422});
  }

  if (order.financial_status && order.financial_status !== 'paid') {
    return Response.json({ok: true, skipped: 'not_paid'});
  }

  const customerName = [order.customer?.first_name, order.customer?.last_name]
    .filter(Boolean)
    .join(' ')
    .trim();

  try {
    await activatePaidMembership(context.env, {
      email,
      shopifyOrderId: String(order.id ?? ''),
      customerName,
    });

    return Response.json({ok: true, activated: email});
  } catch (error) {
    console.error('[webhooks/orders-paid] Activation failed:', error);
    return Response.json({error: 'Activation failed'}, {status: 500});
  }
}
