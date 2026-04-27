import { addSubscriberToMailerLite } from '~/lib/mailerlite.server';
import { createClient } from '~/lib/supabase.server';

export async function action({ request, context }) {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const email = formData.get('email')?.toString().trim();
    const name = formData.get('name')?.toString().trim() || '';

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    // 1. Send Supabase magic link so they can access their account later
    try {
      const supabase = createClient(context.env);
      // emailRedirectTo ensures the magic link points to production, not localhost
      const siteUrl = context.env.PUBLIC_SITE_URL || 'https://sotabosc.world';
      await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${siteUrl}/account/authorize`,
          data: { name, membership_tier: 'mycelial_network' },
        },
      });
    } catch (supabaseError) {
      // Non-fatal — log but continue so MailerLite still captures the lead
      console.error('[membership/join] Supabase error:', supabaseError);
    }

    // 2. Add to MailerLite with paid-tier tag
    // Optionally assign to a specific group if MAILERLITE_PAID_GROUP_ID is set
    const groups = context.env.MAILERLITE_PAID_GROUP_ID
      ? [context.env.MAILERLITE_PAID_GROUP_ID]
      : [];

    await addSubscriberToMailerLite(context.env.MAILERLITE_API_KEY, {
      email,
      fields: {
        name,
        membership_tier: 'mycelial_network',
        signup_source: 'membership_page',
      },
      groups,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('[membership/join] Error:', error);
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
