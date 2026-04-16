import { useLoaderData, Link } from 'react-router';
import { openGraphImageMeta } from '~/lib/seo/siteImagery';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({ data }) => {
  const origin = data?.origin;
  return [
    { title: "Our Work — Sotabosc" },
    {
      name: 'description',
      content:
        "Explore our portfolio of cultural research, community platforms, and urban innovation projects that connect communities through design and technology.",
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
    projects: [
      {
        id: 1,
        title: "Barcelona Living Directory",
        category: "Cultural Platform",
        year: "2024",
        description: "A symbiotic network connecting creators, wellness spaces, cultural venues, and community hubs through nature's living patterns. The platform reimagines city discovery as an organic ecosystem.",
        url: "/city",
        image: "/images/work/barcelona-directory.jpg",
        details: {
          challenge: "Barcelona's rich cultural landscape was fragmented across isolated platforms, making it difficult for visitors and locals to discover the interconnected nature of the city's creative ecosystem.",
          approach: "We developed a botanical framework that maps cultural venues as living organisms within interconnected domains - from underground/soil spaces to sky-level experiences.",
          impact: "Created an intuitive navigation system that reveals hidden connections between venues, events, and creators."
        }
      },
      {
        id: 2,
        title: "Urban Ecosystem Research",
        category: "Research",
        year: "2024",
        description: "Comprehensive mapping of cultural flows and community connections in Barcelona's creative landscape, identifying patterns of collaboration and symbiosis.",
        url: "/work/ecosystem-research",
        image: "/images/work/ecosystem-research.jpg",
        details: {
          challenge: "Understanding how creative communities form, connect, and sustain themselves in urban environments.",
          approach: "Ethnographic studies, network analysis, and community interviews to map invisible relationships and cultural flows.",
          impact: "Informed design principles for platforms that strengthen rather than extract from creative communities."
        }
      },
      {
        id: 3,
        title: "Neighborhood Memory Archive",
        category: "Community Platform",
        year: "2023",
        description: "Digital preservation of local stories, traditions, and knowledge through community-contributed content and oral histories.",
        url: "/work/memory-archive",
        image: "/images/work/memory-archive.jpg",
        details: {
          challenge: "Rapid gentrification was displacing longtime residents and erasing neighborhood memory.",
          approach: "Co-designed a platform with residents to capture and share stories, with special attention to elder knowledge.",
          impact: "Preserved 200+ stories and created intergenerational connections within the community."
        }
      }
    ]
  };
}

export default function WorkPage() {
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

      {/* Hero */}
      <section className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-5xl sm:text-6xl font-bold text-stone-900 leading-tight font-[family-name:var(--font-editorial)]">
              Our work
            </h1>
            <p className="mt-6 text-xl text-stone-600 leading-relaxed">
              Projects that strengthen communities, preserve culture, and foster sustainable growth through design and technology.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="pb-20 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-20">
            {data.projects.map((project, index) => (
              <div key={project.id} className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="aspect-[4/3] bg-stone-100 rounded-2xl overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-green-100 to-stone-100 flex items-center justify-center">
                      <span className="text-stone-400">Project image</span>
                    </div>
                  </div>
                </div>
                
                <div className={index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm font-medium text-green-700">{project.category}</span>
                    <span className="text-sm text-stone-400">•</span>
                    <span className="text-sm text-stone-600">{project.year}</span>
                  </div>
                  
                  <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4 font-[family-name:var(--font-editorial)]">
                    {project.title}
                  </h2>
                  
                  <p className="text-lg text-stone-600 leading-relaxed mb-8">
                    {project.description}
                  </p>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-2">Challenge</h3>
                      <p className="text-stone-600 leading-relaxed">{project.details.challenge}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-2">Approach</h3>
                      <p className="text-stone-600 leading-relaxed">{project.details.approach}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-2">Impact</h3>
                      <p className="text-stone-600 leading-relaxed">{project.details.impact}</p>
                    </div>
                  </div>
                  
                  {project.url.startsWith('/') && (
                    <div className="mt-8">
                      <Link
                        to={project.url}
                        className="inline-flex items-center px-6 py-3 bg-green-700 text-white font-semibold rounded-full hover:bg-green-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
                      >
                        Explore project →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-6 font-[family-name:var(--font-editorial)]">
            Let's create something meaningful together
          </h2>
          <p className="text-lg text-stone-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Have a project that could benefit from our cultural research and community-centered design approach?
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center px-8 py-4 bg-green-700 text-white font-semibold rounded-full hover:bg-green-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
          >
            Start a conversation
          </Link>
        </div>
      </section>
    </main>
  );
}

/** @typedef {import('./+types/_index').Route} Route */