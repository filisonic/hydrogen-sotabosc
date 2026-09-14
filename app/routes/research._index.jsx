import {useLoaderData, Link} from 'react-router';
import {motion} from 'framer-motion';
import {openGraphImageMeta} from '~/lib/seo/siteImagery';
import {
  getResearchAreas,
  getResearchProjects,
} from '~/lib/research/content';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  const origin = data?.origin;
  return [
    {title: 'Research — Sotabosc'},
    {
      name: 'description',
      content:
        'Speculative design, living systems, and cultural research — from the Living Map to Barcelona’s creative ecosystem.',
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
    areas: getResearchAreas(),
    projects: getResearchProjects(),
  };
}

export default function ResearchPage() {
  const data = useLoaderData();
  const title = 'Research';

  return (
    <div className="mag">
      <section className="mag-hero" style={{minHeight: '60vh'}}>
        <motion.h1
          className="mag-hero-title"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {transition: {staggerChildren: 0.04}},
          }}
          style={{fontSize: 'clamp(60px, 12vw, 160px)'}}
        >
          {title.split('').map((l, i) => (
            <motion.span
              key={i}
              className="mag-hero-letter"
              variants={{
                hidden: {opacity: 0, y: 60, rotateX: -40},
                visible: {
                  opacity: 1,
                  y: 0,
                  rotateX: 0,
                  transition: {duration: 0.6, ease: [0.22, 1, 0.36, 1]},
                },
              }}
            >
              {l === ' ' ? '\u00A0' : l}
            </motion.span>
          ))}
        </motion.h1>

        <motion.div
          className="mag-hero-sub"
          initial={{opacity: 0, y: 24}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1]}}
        >
          <p className="mag-hero-tag">
            Speculative futures, living systems, and cultural research —
            practice that asks how communities, cities, and interfaces might
            grow together.
          </p>
        </motion.div>
      </section>

      <div className="mag-mq">
        <div className="mag-mq-inner">
          {[...Array(2)].map((_, r) => (
            <span key={r} style={{display: 'flex'}}>
              {[
                'Speculative Design',
                'Living Map',
                'Urban Research',
                'Embodied Interaction',
                'Community Networks',
                'Barcelona',
                'Living Systems',
              ].map((item, i) => (
                <span key={i} className="mag-mq-item">
                  {item} ·
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <div className="mag-sec">
        <div className="mag-sec-head">
          <h2 className="mag-sec-label">Research Areas</h2>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0',
          padding: '0 32px 48px',
        }}
      >
        {data.areas.map((area) => (
          <div
            key={area.id}
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(64px, 80px) 1fr',
              gap: '24px',
              padding: '36px 0',
              borderTop: '1px solid var(--border)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--mono)',
                fontSize: '28px',
                fontWeight: 700,
                color: 'var(--ink4)',
                letterSpacing: '-0.04em',
              }}
            >
              {area.index}
            </span>
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                  marginBottom: '6px',
                }}
              >
                <h3
                  style={{
                    fontFamily: 'var(--serif)',
                    fontSize: '28px',
                    fontWeight: 600,
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  {area.title}
                </h3>
                <span
                  className="mag-feat-main-tag"
                  style={{color: 'var(--ink)'}}
                >
                  {area.status}
                </span>
              </div>
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--ink3)',
                  margin: '0 0 12px',
                }}
              >
                {area.subtitle}
              </p>
              <p
                style={{
                  fontSize: '15px',
                  color: 'var(--ink2)',
                  lineHeight: 1.6,
                  margin: '0 0 16px',
                  maxWidth: '640px',
                }}
              >
                {area.description}
              </p>
              <p
                style={{
                  fontSize: '10px',
                  letterSpacing: '.1em',
                  textTransform: 'uppercase',
                  color: 'var(--ink4)',
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                {area.tags.join(' · ')}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mag-sec">
        <div className="mag-sec-head">
          <h2 className="mag-sec-label">Selected Projects</h2>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '64px',
          padding: '0 32px 32px',
        }}
      >
        {data.projects.map((project, index) => (
          <div
            key={project.id}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '48px',
              alignItems: 'center',
            }}
          >
            <div style={{order: index % 2 === 1 ? 2 : 1}}>
              <div
                className="mag-place-img"
                style={{
                  height: 'auto',
                  aspectRatio: '4/3',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                }}
              >
                <img
                  src={project.image}
                  alt={project.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            </div>

            <div style={{order: index % 2 === 1 ? 1 : 2}}>
              <div style={{marginBottom: '16px'}}>
                <span
                  className="mag-feat-main-tag"
                  style={{color: 'var(--ink)'}}
                >
                  {project.category} · {project.year}
                </span>
              </div>

              <h3
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: '36px',
                  fontWeight: '600',
                  marginBottom: '20px',
                  lineHeight: '1.2',
                }}
              >
                {project.title}
              </h3>

              <p
                style={{
                  fontSize: '15px',
                  color: 'var(--ink2)',
                  lineHeight: '1.6',
                  marginBottom: '32px',
                }}
              >
                {project.description}
              </p>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  marginBottom: '40px',
                }}
              >
                <div>
                  <h4
                    style={{
                      fontSize: '10px',
                      letterSpacing: '.15em',
                      textTransform: 'uppercase',
                      color: 'var(--ink)',
                      marginBottom: '8px',
                      fontWeight: '700',
                    }}
                  >
                    Challenge
                  </h4>
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--ink3)',
                      lineHeight: '1.5',
                      margin: 0,
                    }}
                  >
                    {project.details.challenge}
                  </p>
                </div>

                <div>
                  <h4
                    style={{
                      fontSize: '10px',
                      letterSpacing: '.15em',
                      textTransform: 'uppercase',
                      color: 'var(--ink)',
                      marginBottom: '8px',
                      fontWeight: '700',
                    }}
                  >
                    Approach
                  </h4>
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--ink3)',
                      lineHeight: '1.5',
                      margin: 0,
                    }}
                  >
                    {project.details.approach}
                  </p>
                </div>

                <div>
                  <h4
                    style={{
                      fontSize: '10px',
                      letterSpacing: '.15em',
                      textTransform: 'uppercase',
                      color: 'var(--ink)',
                      marginBottom: '8px',
                      fontWeight: '700',
                    }}
                  >
                    Impact
                  </h4>
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--ink3)',
                      lineHeight: '1.5',
                      margin: 0,
                    }}
                  >
                    {project.details.impact}
                  </p>
                </div>
              </div>

              {project.url?.startsWith('/') ? (
                <Link to={project.url} className="mag-btn">
                  Explore project →
                </Link>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="mag-sec">
        <div className="mag-sec-head">
          <h2 className="mag-sec-label">Collaborate</h2>
        </div>
      </div>
      <div className="mag-feat">
        <div
          className="mag-feat-main"
          style={{minHeight: 'auto', padding: '64px 48px', gridColumn: '1 / -1'}}
        >
          <span className="mag-feat-main-tag">
            Let&apos;s create something meaningful
          </span>
          <h3
            style={{marginTop: '16px', marginBottom: '24px', maxWidth: '800px'}}
          >
            Have a project that could benefit from cultural research and
            community-centered design?
          </h3>
          <div>
            <Link
              to="/contact"
              className="mag-btn"
              style={{background: 'var(--y)', color: 'var(--ink)'}}
            >
              Start a conversation →
            </Link>
          </div>
        </div>
      </div>

      <footer className="mag-footer">
        <div className="mag-footer-links">
          <Link to="/about">About</Link>
          <Link to="/research">Research</Link>
          <Link to="/labs">Labs</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/feedback">Feedback</Link>
        </div>
        <span className="mag-footer-brand">Sotabosc · Barcelona</span>
      </footer>
    </div>
  );
}

/** @typedef {import('./+types/research._index').Route} Route */
