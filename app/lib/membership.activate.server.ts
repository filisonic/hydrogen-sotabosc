import {addSubscriberToMailerLite} from './mailerlite.server';
import {createAdminClient, type SupabaseEnv} from './supabase.server';
import type {MembershipEnv} from '~/lib/membership.server';

export interface ActivateMembershipInput {
  email: string;
  shopifyOrderId: string;
  customerName?: string;
}

/**
 * Marks a customer as a paid member in Supabase and MailerLite.
 * Uses a SECURITY DEFINER RPC so webhook + service role can upgrade by email.
 */
export async function activatePaidMembership(
  env: SupabaseEnv & MembershipEnv,
  {email, shopifyOrderId, customerName}: ActivateMembershipInput,
) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error('Email is required to activate membership');
  }

  const supabase = createAdminClient(env);
  const {error} = await supabase.rpc('upgrade_membership_by_email', {
    p_email: normalizedEmail,
    p_order_id: shopifyOrderId,
  });

  if (error) {
    console.error('[membership/activate] Supabase RPC error:', error);
    throw error;
  }

  try {
    const groups = env.MAILERLITE_PAID_GROUP_ID
      ? [env.MAILERLITE_PAID_GROUP_ID]
      : [];

    await addSubscriberToMailerLite(env.MAILERLITE_API_KEY || '', {
      email: normalizedEmail,
      fields: {
        name: customerName || '',
        membership_tier: 'mycelial_network',
        signup_source: 'membership_checkout',
        shopify_order_id: shopifyOrderId,
      },
      groups,
    });
  } catch (mailerLiteError) {
    // Payment succeeded — don't fail the webhook if MailerLite is down.
    console.error('[membership/activate] MailerLite error:', mailerLiteError);
  }

  return {email: normalizedEmail, shopifyOrderId};
}
