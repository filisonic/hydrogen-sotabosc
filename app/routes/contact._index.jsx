import {useLoaderData, Link, useSearchParams, useFetcher} from 'react-router';
import {openGraphImageMeta} from '~/lib/seo/siteImagery';
import {CONTACT_EMAIL} from '~/lib/site/contact';
import {submitContactToFormspree} from '~/lib/contact/formspree.server';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  const origin = data?.origin;
  return [
    {title: 'Contact — Sotabosc'},
    {
      name: 'description',
      content:
        "Get in touch with our team to discuss cultural research, community platform design, or urban innovation projects. Let's cultivate something together.",
    },
    ...openGraphImageMeta(origin),
  ];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader({request, context}) {
  return {
    origin: new URL(request.url).origin,
    formspreeEnabled: Boolean(context.env.FORMSPREE_FORM_ID?.trim()),
    contactEmail: CONTACT_EMAIL,
  };
}

/**
 * @param {Route.ActionArgs} args
 */
export async function action({request, context}) {
  if (request.method !== 'POST') {
    return Response.json({ok: false, error: 'Method not allowed'}, {status: 405});
  }

  const formData = await request.formData();
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const organization = String(formData.get('organization') || '').trim();
  const projectType = String(formData.get('project-type') || '').trim();
  const message = String(formData.get('message') || '').trim();

  if (!name || !email || !message) {
    return Response.json(
      {ok: false, error: 'Name, email, and message are required.', code: 'validation'},
      {status: 400},
    );
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return Response.json(
      {ok: false, error: 'Please enter a valid email address.', code: 'validation'},
      {status: 400},
    );
  }

  const result = await submitContactToFormspree(context.env, {
    name,
    email,
    organization: organization || undefined,
    projectType: projectType || undefined,
    message,
  });

  if (result.ok) {
    return Response.json({ok: true});
  }

  const status = result.code === 'not_configured' ? 503 : 502;
  return Response.json(result, {status});
}

function buildMailtoHref({name, email, organization, projectType, message}) {
  const subject = encodeURIComponent(
    `Sotabosc inquiry${projectType ? `: ${projectType}` : ''}`,
  );
  const body = encodeURIComponent(
    [
      `Name: ${name}`,
      `Email: ${email}`,
      organization ? `Organization: ${organization}` : null,
      projectType ? `Project type: ${projectType}` : null,
      '',
      message,
    ]
      .filter(Boolean)
      .join('\n'),
  );
  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

export default function ContactPage() {
  const {formspreeEnabled, contactEmail} = useLoaderData();
  const [searchParams] = useSearchParams();
  const fetcher = useFetcher();
  const defaultProjectType = searchParams.get('type') || '';

  const isSubmitting = fetcher.state === 'submitting';
  const result = fetcher.data;
  const succeeded = result?.ok === true;
  const error = result?.ok === false ? result.error : null;
  const showMailtoFallback = !formspreeEnabled || result?.code === 'not_configured';

  function handleMailtoFallback(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    window.location.href = buildMailtoHref({
      name: String(formData.get('name') || ''),
      email: String(formData.get('email') || ''),
      organization: String(formData.get('organization') || ''),
      projectType: String(formData.get('project-type') || ''),
      message: String(formData.get('message') || ''),
    });
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="bg-stone-50 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-stone-600 hover:text-stone-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 rounded-md"
          >
            ← Back to agency
          </Link>
        </div>
      </div>

      <section className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h1 className="text-5xl sm:text-6xl font-bold text-stone-900 leading-tight font-[family-name:var(--font-editorial)] mb-6">
                Let's cultivate something together
              </h1>

              <p className="text-xl text-stone-600 leading-relaxed mb-12">
                Whether you're working on community platforms, cultural research, or social impact projects — we'd love to explore how we can collaborate.
              </p>

              <div className="space-y-8">
                <div>
                  <h2 className="text-lg font-bold text-stone-900 mb-3">Perfect projects for us</h2>
                  <ul className="space-y-2 text-stone-600">
                    <li>• Brand direction, film, and media production</li>
                    <li>• Community-centered digital platforms</li>
                    <li>• Cultural preservation and documentation</li>
                    <li>• Neighborhood and city innovation initiatives</li>
                    <li>• Research into urban social ecosystems</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-stone-900 mb-3">Our approach</h2>
                  <p className="text-stone-600 leading-relaxed">
                    We begin every project with deep listening — understanding your community,
                    goals, and context before proposing solutions. Our work is collaborative,
                    iterative, and always designed to strengthen rather than extract from existing relationships.
                  </p>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-stone-900 mb-3">Timeline</h2>
                  <p className="text-stone-600 leading-relaxed">
                    Most projects range from 2-6 months depending on scope. We typically start
                    with a research and strategy phase before moving into design and development.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-stone-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-stone-900 mb-6">Start the conversation</h2>

              {succeeded ? (
                <div
                  className="rounded-xl border border-green-200 bg-green-50 px-5 py-6 text-green-900"
                  role="status"
                >
                  <p className="font-semibold mb-2">Message sent — thank you.</p>
                  <p className="text-sm text-green-800 leading-relaxed">
                    We typically reply within 2–3 business days. For anything urgent, email{' '}
                    <a href={`mailto:${contactEmail}`} className="underline underline-offset-2">
                      {contactEmail}
                    </a>
                    .
                  </p>
                </div>
              ) : (
                <fetcher.Form
                  method="post"
                  className="space-y-6"
                  onSubmit={showMailtoFallback ? handleMailtoFallback : undefined}
                >
                  {error ? (
                    <div
                      className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                      role="alert"
                    >
                      {error}
                      {showMailtoFallback ? (
                        <span>
                          {' '}
                          You can also use the button below to open your email app.
                        </span>
                      ) : null}
                    </div>
                  ) : null}

                  {!formspreeEnabled ? (
                    <p className="text-sm text-stone-500 rounded-lg border border-stone-200 bg-white px-4 py-3">
                      Form delivery is being set up. Submitting will open your email app to{' '}
                      <strong>{contactEmail}</strong>.
                    </p>
                  ) : null}

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-2">
                      Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      autoComplete="name"
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2">
                      Email <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      autoComplete="email"
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="organization" className="block text-sm font-medium text-stone-700 mb-2">
                      Organization (optional)
                    </label>
                    <input
                      type="text"
                      id="organization"
                      name="organization"
                      autoComplete="organization"
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors"
                      placeholder="Your organization"
                    />
                  </div>

                  <div>
                    <label htmlFor="project-type" className="block text-sm font-medium text-stone-700 mb-2">
                      Project type
                    </label>
                    <select
                      id="project-type"
                      name="project-type"
                      defaultValue={defaultProjectType}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors"
                    >
                      <option value="">Select a project type</option>
                      <option value="Brand & Media">Brand & Media</option>
                      <option value="Community Platform">Community Platform</option>
                      <option value="Cultural Research">Cultural Research</option>
                      <option value="Documentation Project">Documentation Project</option>
                      <option value="Urban Innovation">Urban Innovation</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-stone-700 mb-2">
                      Tell us about your project <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors resize-none"
                      placeholder="What are you working on? What challenges are you facing? What kind of collaboration are you looking for?"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-8 py-4 bg-green-700 text-white font-semibold rounded-full hover:bg-green-800 transition-colors focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting
                      ? 'Sending…'
                      : showMailtoFallback
                        ? 'Open email to send'
                        : 'Send message'}
                  </button>
                </fetcher.Form>
              )}

              <div className="mt-8 pt-8 border-t border-stone-200">
                <p className="text-sm text-stone-600">
                  We typically respond within 2-3 business days. For urgent inquiries,
                  you can also reach us directly at{' '}
                  <a href={`mailto:${contactEmail}`} className="text-green-700 hover:text-green-800 transition-colors">
                    {contactEmail}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/** @typedef {import('./+types/contact._index').Route} Route */
