import { createClient } from '~/lib/supabase.server';
import { addSubscriberToMailerLite } from '~/lib/mailerlite.server';

export async function action({ request, context }) {
    if (request.method !== 'POST') {
        return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    try {
        const formData = await request.formData();
        const email = formData.get('email');
        const domain = formData.get('domain');
        const organismName = formData.get('organismName');
        const species = formData.get('species');
        const habitat = formData.get('habitat');
        const role = formData.get('role');

        if (!email || !domain) {
            return Response.json({ error: 'Email and domain are required' }, { status: 400 });
        }

        // 1. Initialize Supabase Client
        // In Hydrogen, environment variables are accessible via context.env
        const supabase = createClient(context.env);

        // 2. Save User to Supabase Auth (Creates an account so they can restore it)
        // We use the service role or admin api here ideally, but for signup with just email:
        // Wait, supabase.auth.admin requires service_role key.
        // If we only have anon key, we can do a magic link signup or just sign in with OTP.
        // For a seamless "save" experience without requiring password creation right now,
        // we can trigger an OTP signup which creates the user and sends a magic link.
        const siteUrl = context.env.PUBLIC_SITE_URL || 'https://sotabosc.world';
        const { data: authData, error: authError } = await supabase.auth.signInWithOtp({
            email: email.toString(),
            options: {
                emailRedirectTo: `${siteUrl}/account/authorize`,
                data: {
                    domain: domain.toString(),
                    organism_name: organismName?.toString(),
                    species: species?.toString(),
                    habitat: habitat?.toString(),
                    role: role?.toString(),
                }
            }
        });

        if (authError) {
            console.error("Supabase Auth Error:", authError);
            // If they already exist or there's an error, we might still want to proceed
            // to Mailerlite or handle it gracefully.
        }

        // 3. Add to MailerLite
        try {
            await addSubscriberToMailerLite(context.env.MAILERLITE_API_KEY, {
                email: email.toString(),
                fields: {
                    name: organismName?.toString() || '',
                    domain: domain.toString()
                },
                // You can map the domain to a specific group ID later
                // groups: [getGroupIdForDomain(domain.toString())]
            });
        } catch (mlError) {
            console.error("MailerLite Error:", mlError);
            // Don't fail the whole request if newsletter fails
        }

        return Response.json({ success: true });

    } catch (error) {
        console.error("Action error:", error);
        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
