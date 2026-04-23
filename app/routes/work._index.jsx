import { useLoaderData, Link } from 'react-router';
import { motion } from 'framer-motion';
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
        image: "/images/hero/robynne-o-HOrhCnQsxnQ-unsplash.jpg",
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
        image: "/images/hero/tom-prejeant-IaEsXtU8iN4-unsplash.jpg",
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
        image: "/images/hero/lai-man-nung-bnZ8_95Q8NE-unsplash.jpg",
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
  const title = 'Our Work';

  return (
    <div className="mag">
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="mag-hero" style={{ minHeight: '60vh' }}>
        <motion.h1
          className="mag-hero-title"
          initial="hidden" animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: .04 } } }}
          style={{ fontSize: 'clamp(60px, 12vw, 160px)' }}
        >
          {title.split('').map((l, i) => (
            <motion.span
              key={i}
              className="mag-hero-letter"
              variants={{
                hidden: { opacity: 0, y: 60, rotateX: -40 },
                visible: {
                  opacity: 1, y: 0, rotateX: 0,
                  transition: { duration: .6, ease: [.22, 1, .36, 1] }
                }
              }}
            >
              {l === ' ' ? '\u00A0' : l}
            </motion.span>
          ))}
        </motion.h1>

        <motion.div
          className="mag-hero-sub"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .7, delay: .45, ease: [.22, 1, .36, 1] }}
        >
          <p className="mag-hero-tag">
            Projects that strengthen communities, preserve culture, and foster sustainable growth through design and technology.
          </p>
        </motion.div>
      </section>

      {/* ═══════════════ MARQUEE ═══════════════ */}
      <div className="mag-mq">
        <div className="mag-mq-inner">
          {[...Array(2)].map((_, r) => (
            <span key={r} style={{ display: 'flex' }}>
              {['Cultural Platforms', 'Urban Research', 'Generative Systems', 'Speculative Design', 'Community Networks', 'Barcelona', 'Living Systems'].map((item, i) => (
                <span key={i} className="mag-mq-item">{item} ·</span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ═══════════════ PROJECTS ═══════════════ */}
      <div className="mag-sec"><div className="mag-sec-head"><h2 className="mag-sec-label">Selected Projects</h2></div></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '64px', padding: '0 32px 32px' }}>
        {data.projects.map((project, index) => (
          <div key={project.id} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', alignItems: 'center' }}>
            <div style={{ order: index % 2 === 1 ? 2 : 1 }}>
              <div className="mag-place-img" style={{ height: 'auto', aspectRatio: '4/3', borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                <img src={project.image} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
            
            <div style={{ order: index % 2 === 1 ? 1 : 2 }}>
              <div style={{ marginBottom: '16px' }}>
                <span className="mag-feat-main-tag" style={{ color: 'var(--ink)' }}>{project.category} · {project.year}</span>
              </div>
              
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '36px', fontWeight: '600', marginBottom: '20px', lineHeight: '1.2' }}>
                {project.title}
              </h3>
              
              <p style={{ fontSize: '15px', color: 'var(--ink2)', lineHeight: '1.6', marginBottom: '32px' }}>
                {project.description}
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
                <div>
                  <h4 style={{ fontSize: '10px', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: '8px', fontWeight: '700' }}>Challenge</h4>
                  <p style={{ fontSize: '13px', color: 'var(--ink3)', lineHeight: '1.5', margin: 0 }}>{project.details.challenge}</p>
                </div>
                
                <div>
                  <h4 style={{ fontSize: '10px', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: '8px', fontWeight: '700' }}>Approach</h4>
                  <p style={{ fontSize: '13px', color: 'var(--ink3)', lineHeight: '1.5', margin: 0 }}>{project.details.approach}</p>
                </div>
                
                <div>
                  <h4 style={{ fontSize: '10px', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: '8px', fontWeight: '700' }}>Impact</h4>
                  <p style={{ fontSize: '13px', color: 'var(--ink3)', lineHeight: '1.5', margin: 0 }}>{project.details.impact}</p>
                </div>
              </div>
              
              {project.url.startsWith('/') && (
                <Link to={project.url} className="mag-btn">
                  Explore project →
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ═══════════════ CTA ═══════════════ */}
      <div className="mag-sec"><div className="mag-sec-head"><h2 className="mag-sec-label">Collaborate</h2></div></div>
      <div className="mag-feat">
        <div className="mag-feat-main" style={{ minHeight: 'auto', padding: '64px 48px', gridColumn: '1 / -1' }}>
          <span className="mag-feat-main-tag">Let's create something meaningful</span>
          <h3 style={{ marginTop: '16px', marginBottom: '24px', maxWidth: '800px' }}>Have a project that could benefit from our cultural research and community-centered design approach?</h3>
          <div>
            <Link to="/contact" className="mag-btn" style={{ background: 'var(--y)', color: 'var(--ink)' }}>
              Start a conversation →
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="mag-footer">
        <div className="mag-footer-links">
          <Link to="/about">About</Link><Link to="/work">Work</Link><Link to="/contact">Contact</Link><Link to="/feedback">Feedback</Link>
        </div>
        <span className="mag-footer-brand">Sotabosc · Barcelona</span>
      </footer>
    </div>
  );
}

/** @typedef {import('./+types/_index').Route} Route */