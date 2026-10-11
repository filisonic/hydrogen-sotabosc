import { Form, Link, useActionData, useLoaderData, useNavigation } from 'react-router';
import { DirectorySurface } from '~/components/directory/DirectorySurface';
import { KINGDOMS, KINGDOMS_BY_KEY } from '~/lib/city/kingdoms';
import { addSubscriberToMailerLite } from '~/lib/mailerlite.server';
import { openGraphImageMeta } from '~/lib/seo/siteImagery';

const ROLES = [
  { id: 'business', label: 'A business' },
  { id: 'artist', label: 'An artist' },
  { id: 'event', label: 'An event or festival' },
];

export const meta = ({ data }) => [
  { title: 'Claim a plot — Sotabosc' },
  {
    name: 'description',
    content:
      'Sotabosc is a small city of Barcelona businesses, artists and events. Apply for one of the limited plots in its five kingdoms.',
  },
  ...openGraphImageMeta(data?.origin),
];

export async function loader({ request, context }) {
  const url = new URL(request.url);
  const { getCityDirectory } = await import('~/lib/directory/source.server');
  const { getPlaceBySlug } = await getCityDirectory(context);
  const placeSlug = url.searchParams.get('place');
  const place = placeSlug ? getPlaceBySlug(placeSlug) : null;
  const kingdom = url.searchParams.get('kingdom');
  return {
    origin: url.origin,
    place: place ? { slug: place.slug, name: place.name } : null,
    kingdom: KINGDOMS_BY_KEY[kingdom] ? kingdom : '',
  };
}

export async function action({ request, context }) {
  const form = await request.formData();
  const get = (key) => form.get(key)?.toString().trim() ?? '';
  const claim = {
    name: get('name'),
    email: get('email'),
    business: get('business'),
    role: get('role'),
    kingdom: get('kingdom'),
    placeSlug: get('placeSlug'),
    wantsScreen: form.get('wantsScreen') === 'on',
    message: get('message'),
  };

  if (!claim.email || !claim.email.includes('@')) {
    return { error: 'Please add an email we can reach you on.' };
  }
  if (!claim.business) {
    return { error: 'Tell us the name of your business, practice or event.' };
  }

  // MailerLite only stores name + source; the full claim survives in the worker log.
  console.warn('[city/claim]', JSON.stringify(claim));

  try {
    const groupId = context.env.MAILERLITE_CITY_GROUP_ID;
    await addSubscriberToMailerLite(context.env.MAILERLITE_API_KEY, {
      email: claim.email,
      fields: {
        name: claim.name ? `${claim.name} (${claim.business})` : claim.business,
        signup_source: `city_plot_claim:${claim.role || 'business'}:${claim.kingdom || 'any'}`,
      },
      groups: groupId ? [groupId] : [],
    });
  } catch {
    return { error: 'Something went wrong sending your claim. Please try again.' };
  }

  return { success: true, business: claim.business };
}

export default function CityClaimPage() {
  const { place, kingdom } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const submitting = navigation.state === 'submitting';

  const inputClass =
    'w-full text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 border transition-shadow bg-white';
  const labelClass = 'block text-xs font-bold mb-2 uppercase tracking-wide';

  return (
    <DirectorySurface>
      <div className="max-w-xl mx-auto px-4 py-12">
        <Link to="/" className="text-xs mb-8 inline-block opacity-70 hover:opacity-100">
          ← Back to the city
        </Link>

        <h1 className="text-3xl font-black tracking-tight mb-2 font-[family-name:var(--font-display)]">
          {place ? `Claim ${place.name}` : 'Claim a plot in Sotabosc'}
        </h1>
        <p className="text-sm mb-8 max-w-md opacity-75">
          The city is small on purpose: six plots per kingdom. Citizens get a listing on the map, a
          context-aware screen and a place in the cross-promotion loop with their neighbours.
        </p>

        {actionData?.success ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
            <h2 className="font-bold text-green-800 mb-2">Claim received for {actionData.business}.</h2>
            <p className="text-sm text-green-700 mb-6">
              We&apos;ll be in touch about which kingdom fits and what your screen could show.
            </p>
            <Link to="/" className="mag-btn">
              Back to the city
            </Link>
          </div>
        ) : (
          <Form method="post" className="space-y-5">
            {place ? <input type="hidden" name="placeSlug" value={place.slug} /> : null}

            <fieldset>
              <legend className={labelClass}>I am</legend>
              <div className="flex flex-wrap gap-3">
                {ROLES.map((r, i) => (
                  <label key={r.id} className="inline-flex items-center gap-2 text-sm">
                    <input type="radio" name="role" value={r.id} defaultChecked={i === 0} />
                    {r.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="claim-business" className={labelClass}>
                Business, practice or event
              </label>
              <input
                id="claim-business"
                name="business"
                defaultValue={place?.name ?? ''}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="claim-kingdom" className={labelClass}>
                Which kingdom feels like home?
              </label>
              <select id="claim-kingdom" name="kingdom" defaultValue={kingdom} className={inputClass}>
                <option value="">Not sure yet — help me choose</option>
                {KINGDOMS.map((k) => (
                  <option key={k.key} value={k.key}>
                    {k.emoji} {k.name} — {k.role}: {k.epithet}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="claim-name" className={labelClass}>
                  Your name
                </label>
                <input id="claim-name" name="name" className={inputClass} />
              </div>
              <div>
                <label htmlFor="claim-email" className={labelClass}>
                  Email
                </label>
                <input id="claim-email" name="email" type="email" required className={inputClass} />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="wantsScreen" defaultChecked />
              I&apos;m interested in a Sotabosc screen for my space
            </label>

            <div>
              <label htmlFor="claim-message" className={labelClass}>
                Anything we should know?
              </label>
              <textarea id="claim-message" name="message" rows={4} className={`${inputClass} resize-none`} />
            </div>

            {actionData?.error ? <p className="text-sm text-red-700">{actionData.error}</p> : null}

            <button type="submit" className="mag-btn" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send my claim'}
            </button>
          </Form>
        )}
      </div>
    </DirectorySurface>
  );
}
