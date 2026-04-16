import { useLoaderData, Link } from 'react-router';
import { openGraphImageMeta } from '~/lib/seo/siteImagery';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({ data }) => {
  const origin = data?.origin;
  return [
    { title: "About — Sotabosc" },
    {
      name: 'description',
      content:
        "Learn about our philosophy of symbiotic design, cultural research methodology, and commitment to community-centered innovation.",
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

export default function AboutPage() {
  const data = useLoaderData();

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl sm:text-6xl font-bold text-stone-900 leading-tight font-[family-name:var(--font-editorial)] mb-8">
            About Sotabosc
          </h1>
          
          <div className="prose prose-lg prose-stone max-w-none">
            <p className="text-xl leading-relaxed mb-8">
              We design systems that strengthen communities by applying nature's patterns 
              to urban innovation. Based in Barcelona, we work at the intersection of 
              cultural research, community design, and regenerative technology.
            </p>

            <h2 className="text-3xl font-bold text-stone-900 mt-12 mb-6">Our philosophy</h2>
            
            <p>
              Cities are living ecosystems where culture, community, and technology 
              interact in complex symbiotic relationships. Our role is to understand 
              these relationships deeply and design interventions that strengthen 
              rather than disrupt the natural flows of connection and creativity.
            </p>

            <p>
              We believe the best technology is almost invisible — it amplifies 
              what already works while gently addressing what doesn't. Our projects 
              start with extensive cultural research and community listening, ensuring 
              that any solution we develop emerges from and serves the needs of 
              the people who will use it.
            </p>

            <h2 className="text-3xl font-bold text-stone-900 mt-12 mb-6">Our approach</h2>

            <h3 className="text-xl font-semibold text-stone-900 mt-8 mb-4">Cultural research</h3>
            <p>
              Every project begins with deep ethnographic research to understand 
              the cultural ecosystem we're working within. We map relationships, 
              identify patterns, and uncover the informal networks that make 
              communities resilient.
            </p>

            <h3 className="text-xl font-semibold text-stone-900 mt-8 mb-4">Community co-design</h3>
            <p>
              We design with communities, not for them. Our process involves 
              extensive collaboration with stakeholders to ensure solutions 
              reflect real needs and cultural values.
            </p>

            <h3 className="text-xl font-semibold text-stone-900 mt-8 mb-4">Symbiotic systems</h3>
            <p>
              We create platforms that grow stronger through community participation, 
              following biological principles of mutual benefit and regenerative growth.
            </p>

            <h2 className="text-3xl font-bold text-stone-900 mt-12 mb-6">Why Barcelona?</h2>
            
            <p>
              Barcelona provides the perfect laboratory for our work. The city's 
              rich cultural heritage, strong neighborhood identities, and innovative 
              approach to urban planning create ideal conditions for studying and 
              designing community-centered systems.
            </p>

            <p>
              Our Barcelona Living Directory project serves as both a practical 
              tool for the city and a research platform for understanding how 
              cultural communities form, connect, and sustain themselves in 
              urban environments.
            </p>

            <h2 className="text-3xl font-bold text-stone-900 mt-12 mb-6">Working with us</h2>
            
            <p>
              We take on a limited number of projects each year to ensure we 
              can give each one the attention and care it deserves. We're particularly 
              interested in working with organizations that share our values of 
              community empowerment, cultural preservation, and regenerative design.
            </p>

            <p>
              Whether you're a municipality looking to strengthen neighborhood 
              connections, a cultural organization seeking to document and share 
              local knowledge, or a community group needing a platform that 
              reflects your values — we'd love to explore how we might collaborate.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-stone-200">
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-4 bg-green-700 text-white font-semibold rounded-full hover:bg-green-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
            >
              Start a conversation
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

/** @typedef {import('./+types/_index').Route} Route */