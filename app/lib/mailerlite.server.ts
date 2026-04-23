export const MAILERLITE_API_URL = 'https://connect.mailerlite.com/api/subscribers';

export interface MailerLiteSubscriber {
  email: string;
  fields?: Record<string, string | number | boolean>;
  groups?: string[];
}

/**
 * Adds or updates a subscriber in MailerLite and assigns them to an organism domain.
 * This function should be called from the server environment only.
 */
export async function addSubscriberToMailerLite(
  apiKey: string,
  subscriber: MailerLiteSubscriber
) {
  if (!apiKey) {
    console.warn('MailerLite API key is missing. Skipping newsletter subscription.');
    return;
  }

  try {
    const response = await fetch(MAILERLITE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email: subscriber.email,
        fields: subscriber.fields,
        groups: subscriber.groups,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('MailerLite API error:', errorData);
      throw new Error(`Failed to add subscriber: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error integrating with MailerLite:', error);
    throw error;
  }
}
