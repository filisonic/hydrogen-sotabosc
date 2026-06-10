import { useLoaderData, Link, useSearchParams } from 'react-router';
import { openGraphImageMeta } from '~/lib/seo/siteImagery';
import { CONTACT_EMAIL } from '~/lib/site/contact';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({ data }) => {
  const origin = data?.origin;
  return [
    { title: "Contact — Sotabosc" },
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
export async function loader(args) {
  return {
    origin: new URL(args.request.url).origin,
  };
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
  const data = useLoaderData();
  const [searchParams] = useSearchParams();
  const defaultProjectType = searchParams.get('type') || '';

  function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const href = buildMailtoHref({
      name: String(formData.get('name') || ''),
      email: String(formData.get('email') || ''),
      organization: String(formData.get('organization') || ''),
      projectType: String(formData.get('project-type') || ''),
      message: String(formData.get('message') || ''),
    });
    window.location.href = href;
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
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

      {/* Content */}
      <section className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Info */}
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
                    <li>• Community-centered digital platforms</li>
                    <li>• Cultural preservation and documentation</li>
                    <li>• Neighborhood and city innovation initiatives</li>
                    <li>• Research into urban social ecosystems</li>
                    <li>• Regenerative tourism and cultural exchange</li>
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

            {/* Contact Form */}
            <div className="bg-stone-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-stone-900 mb-6">Start the conversation</h2>
              
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
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
                    Tell us about your project
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors resize-none"
                    placeholder="What are you working on? What challenges are you facing? What kind of collaboration are you looking for?"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-8 py-4 bg-green-700 text-white font-semibold rounded-full hover:bg-green-800 transition-colors focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
                >
                  Send message
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-stone-200">
                <p className="text-sm text-stone-600">
                  We typically respond within 2-3 business days. For urgent inquiries, 
                  you can also reach us directly at{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-green-700 hover:text-green-800 transition-colors">
                    {CONTACT_EMAIL}
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

/** @typedef {import('./+types/_index').Route} Route */