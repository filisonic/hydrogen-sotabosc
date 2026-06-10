export type ContactFormPayload = {
  name: string;
  email: string;
  organization?: string;
  projectType?: string;
  message: string;
};

export type ContactFormResult =
  | {ok: true}
  | {ok: false; error: string; code?: 'not_configured' | 'validation' | 'upstream'};

type FormspreeEnv = {
  FORMSPREE_FORM_ID?: string;
};

/**
 * Forwards contact submissions to Formspree (free tier: ~50/month).
 * Set FORMSPREE_FORM_ID in Oxygen — the ID from https://formspree.io/forms/…/integration
 */
export async function submitContactToFormspree(
  env: FormspreeEnv,
  payload: ContactFormPayload,
): Promise<ContactFormResult> {
  const formId = env.FORMSPREE_FORM_ID?.trim();
  if (!formId) {
    return {
      ok: false,
      error: 'Contact form is not configured yet.',
      code: 'not_configured',
    };
  }

  const subject = `Sotabosc inquiry${payload.projectType ? `: ${payload.projectType}` : ''}`;

  const body = new FormData();
  body.set('name', payload.name);
  body.set('email', payload.email);
  body.set('_replyto', payload.email);
  body.set('_subject', subject);
  if (payload.organization) body.set('organization', payload.organization);
  if (payload.projectType) body.set('project_type', payload.projectType);
  body.set('message', payload.message);

  try {
    const response = await fetch(`https://formspree.io/f/${formId}`, {
      method: 'POST',
      headers: {Accept: 'application/json'},
      body,
    });

    if (response.ok) {
      return {ok: true};
    }

    let detail = 'Unable to send your message. Please try again or email us directly.';
    try {
      const data = (await response.json()) as {error?: string};
      if (data?.error) detail = data.error;
    } catch {
      // ignore JSON parse errors
    }

    return {ok: false, error: detail, code: 'upstream'};
  } catch (err) {
    console.error('[contact/formspree]', err);
    return {
      ok: false,
      error: 'Network error while sending. Please try again or email us directly.',
      code: 'upstream',
    };
  }
}
