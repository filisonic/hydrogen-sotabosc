import { MEMBERSHIP_PUBLIC } from '~/lib/featureFlags';
import { addSubscriberToMailerLite } from '~/lib/mailerlite.server';
import { createClient } from '~/lib/supabase.server';

export async function action({ request, context }) {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  if (!MEMBERSHIP_PUBLIC) {
    return Response.json(
      { error: 'Membership sign-up is paused. Explore the map at sotabosc.world.' },
      { status: 503 },
    );
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
      const siteUrl = context.env.PUBLIC_SITE_URL || 'https://sotabosc.world';
      await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${siteUrl}/account/authorize`,
          data: { name, membership_interest: 'mycelial_network_waitlist' },
        },
      });
    } catch (supabaseError) {
      console.error('[membership/join] Supabase error:', supabaseError);
    }

    // 2. Add to MailerLite waitlist (not the paid group)
    const waitlistGroupId = context.env.MAILERLITE_WAITLIST_GROUP_ID;
    const groups = waitlistGroupId ? [waitlistGroupId] : [];

    await addSubscriberToMailerLite(context.env.MAILERLITE_API_KEY, {
      email,
      fields: {
        name,
        membership_tier: 'waitlist',
        signup_source: 'membership_waitlist',
      },
      groups,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('[membership/join] Error:', error);
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
