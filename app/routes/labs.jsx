import {motion} from 'framer-motion';
import {Link} from 'react-router';

/**
 * Labs — Speculative Futures Lab
 * Volvox Labs-inspired: dark immersive, monospace utility type,
 * full-bleed sections, cockpit-style metadata bar.
 *
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [
    {title: 'Labs — Speculative Futures | Sotabosc'},
    {
      name: 'description',
      content:
        'Research and practice exploring speculative design, embodied interaction, and emergent systems at the intersection of nature and technology.',
    },
  ];
};

/* ── Data ─────────────────────────────────────────────── */

const RESEARCH_AREAS = [
  {
    id: 'speculative-design',
    index: '01',
    title: 'Speculative Design',
    subtitle: 'Possible futures through design fiction',
    description:
      'We explore alternative presents and plausible futures through design fiction, world-building, and critical making. Our practice investigates how speculative narratives can reshape our relationship with technology, ecology, and each other.',
    tags: ['Design Fiction', 'World-Building', 'Critical Making', 'Futures'],
    status: 'active',
  },
  {
    id: 'embodied-interaction',
    index: '02',
    title: 'Embodied Interaction',
    subtitle: 'Body, technology, and space',
    description:
      'Investigating the relationship between human bodies, computational systems, and physical space. We create installations and interfaces that respond to gesture, breath, proximity, and presence — moving beyond screens toward spatial computing.',
    tags: [
      'Spatial Computing',
      'Gesture',
      'Installation',
      'Projection Mapping',
    ],
    status: 'active',
  },
  {
    id: 'emergent-systems',
    index: '03',
    title: 'Emergent Systems',
    subtitle: 'Complex adaptive behaviors',
    description:
      'Studying complex adaptive systems and their emergent behaviors — from mycelial networks to urban ecosystems. We build simulations and generative tools that model how order arises from simple rules and local interactions.',
    tags: ['Complexity', 'Generative', 'Simulation', 'Networks'],
    status: 'active',
  },
  {
    id: 'biomimetic-interfaces',
    index: '04',
    title: 'Biomimetic Interfaces',
    subtitle: 'Nature-informed digital design',
    description:
      'Drawing from biological patterns, growth algorithms, and ecological principles to inform digital interface design. We believe the most intuitive interfaces mirror the systems humans evolved within.',
    tags: ['Biomimicry', 'Growth Algorithms', 'Organic UI', 'Ecology'],
    status: 'exploring',
  },
];

const EXPERIMENTS = [
  {
    title: 'Organism Lab',
    description:
      'Parametric generative life — 50+ presets across animals, plants, fungi, microbes, minerals, and cosmic forms.',
    href: '/tools/organism-lab',
    tech: 'p5.js',
  },
  {
    title: 'Projection Mapping',
    description:
      'Real-time depth-sensing projection onto physical objects using Kinect + TouchDesigner.',
    href: null,
    tech: 'TouchDesigner',
  },
  {
    title: 'Scroll Ecosystem',
    description:
      'Six-layer vertical cross-section of a forest ecosystem — a living interface metaphor.',
    href: '/city-world',
    tech: 'React + GSAP',
  },
];

/* ── Variants ─────────────────────────────────────────── */

const fadeIn = {
  hidden: {opacity: 0, y: 30},
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1]},
  }),
};

const lineReveal = {
  hidden: {scaleX: 0},
  visible: {
    scaleX: 1,
    transition: {duration: 0.8, ease: [0.22, 1, 0.36, 1]},
  },
};

/* ── Component ────────────────────────────────────────── */

export default function Labs() {
  return (
    <div className="labs-page mag">
      <style>{`
        .labs-page {
          --lab-bg: var(--bg);
          --lab-surface: var(--surface);
          --lab-border: var(--border);
          --lab-text: var(--ink);
          --lab-muted: var(--ink2);
          --lab-dim: var(--ink3);
          --lab-accent: var(--ink);
          --lab-accent-dim: rgba(0,0,0,0.08);
          --lab-mono: var(--mono);
          min-height: 100vh;
          background: var(--lab-bg);
          color: var(--lab-text);
          font-family: var(--sans);
          overflow-x: hidden;
        }

        /* ── Hero ─────────────────────── */
        .lab-hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 0 32px 80px;
          padding-top: 80px;
          position: relative;
        }
        .lab-hero-canvas {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }
        .lab-hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 70% 60% at 50% 60%, black 20%, transparent 80%);
          -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 60%, black 20%, transparent 80%);
        }
        .lab-hero-glow {
          position: absolute;
          top: 15%;
          left: 50%;
          transform: translateX(-50%);
          width: 700px;
          height: 500px;
          background: radial-gradient(ellipse, rgba(255,213,0,0.12) 0%, rgba(255,229,0,0.04) 40%, transparent 70%);
          pointer-events: none;
        }
        .lab-hero-content {
          position: relative;
          z-index: 2;
        }
        .lab-hero-meta {
          font-size: 10px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--lab-accent);
          font-family: var(--lab-mono);
          margin-bottom: 24px;
        }
        .lab-hero-title {
          font-size: clamp(40px, 8vw, 100px);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 0.92;
          margin: 0 0 24px;
        }
        .lab-hero-title-dim {
          color: var(--lab-muted);
        }
        .lab-hero-desc {
          font-size: 16px;
          color: var(--lab-muted);
          max-width: 560px;
          line-height: 1.7;
          margin: 0;
        }

        /* ── Divider line ─────────────── */
        .lab-divider {
          height: 1px;
          background: var(--lab-border);
          margin: 0 32px;
          transform-origin: left;
        }

        /* ── Research Areas ───────────── */
        .lab-research {
          padding: 80px 32px;
        }
        .lab-section-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 56px;
        }
        .lab-section-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--lab-muted);
          font-family: var(--lab-mono);
          margin: 0;
        }
        .lab-section-count {
          font-size: 10px;
          color: var(--lab-dim);
          font-family: var(--lab-mono);
        }

        .lab-area {
          display: grid;
          grid-template-columns: 80px 1fr;
          gap: 0 32px;
          padding: 40px 0;
          border-top: 1px solid var(--lab-border);
        }
        .lab-area:last-child {
          border-bottom: 1px solid var(--lab-border);
        }
        .lab-area-index {
          font-size: 48px;
          font-weight: 800;
          letter-spacing: -0.04em;
          color: var(--lab-dim);
          line-height: 1;
          font-family: var(--lab-mono);
        }
        .lab-area-content {}
        .lab-area-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 4px;
        }
        .lab-area-title {
          font-size: clamp(24px, 3vw, 34px);
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 0;
        }
        .lab-area-status {
          font-size: 8px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 100px;
          font-family: var(--lab-mono);
          font-weight: 600;
        }
        .lab-area-status--active {
          color: var(--lab-accent);
          background: var(--lab-accent-dim);
          border: 1px solid rgba(0,0,0,0.1);
        }
        .lab-area-status--exploring {
          color: #fbbf24;
          background: rgba(251,191,36,0.08);
          border: 1px solid rgba(251,191,36,0.12);
        }
        .lab-area-subtitle {
          font-size: 12px;
          color: var(--lab-muted);
          letter-spacing: 0.04em;
          margin: 0 0 16px;
        }
        .lab-area-desc {
          font-size: 14px;
          color: var(--lab-muted);
          line-height: 1.7;
          margin: 0 0 20px;
          max-width: 600px;
        }
        .lab-area-tags {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .lab-tag {
          font-size: 9px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 4px;
          border: 1px solid var(--lab-border);
          color: var(--lab-dim);
          font-family: var(--lab-mono);
          font-weight: 500;
        }

        /* ── Experiments ──────────────── */
        .lab-experiments {
          padding: 80px 32px;
        }
        .lab-exp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 14px;
        }
        .lab-exp-card {
          background: var(--lab-surface);
          border: 1px solid var(--lab-border);
          border-radius: 10px;
          padding: 28px;
          text-decoration: none;
          color: inherit;
          transition: border-color 0.2s, transform 0.2s;
          display: flex;
          flex-direction: column;
          min-height: 180px;
        }
        .lab-exp-card:hover {
          border-color: rgba(0,0,0,0.15);
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
        }
        .lab-exp-card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .lab-exp-card-title {
          font-size: 17px;
          font-weight: 600;
          margin: 0;
        }
        .lab-exp-card-tech {
          font-size: 9px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--lab-accent);
          font-family: var(--lab-mono);
          padding: 3px 8px;
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 4px;
          background: var(--lab-accent-dim);
        }
        .lab-exp-card-desc {
          font-size: 13px;
          color: var(--lab-muted);
          line-height: 1.6;
          margin: 0;
          flex: 1;
        }
        .lab-exp-card-link {
          font-size: 10px;
          color: var(--lab-accent);
          margin-top: 16px;
          font-family: var(--lab-mono);
          letter-spacing: 0.08em;
        }

        /* ── Utility bar ─────────────── */
        .lab-utility {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 28px;
          background: rgba(255,229,0,0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-top: 1px solid rgba(0,0,0,0.06);
          font-family: var(--lab-mono);
          font-size: 9px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--lab-dim);
        }
        .lab-utility-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .lab-utility-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--lab-accent);
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        /* ── Footer ───────────────────── */
        .lab-footer {
          border-top: 1px solid var(--lab-border);
          padding: 40px 32px 80px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        .lab-footer a {
          font-size: 10px;
          color: var(--lab-dim);
          text-decoration: none;
          letter-spacing: 0.08em;
          font-family: var(--lab-mono);
          transition: color 0.15s;
        }
        .lab-footer a:hover { color: var(--lab-text); }

        /* ── Responsive ───────────────── */
        @media (max-width: 768px) {
          .lab-hero { padding: 0 20px 60px; }
          .lab-research { padding: 60px 20px; }
          .lab-area {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          .lab-area-index {
            font-size: 28px;
          }
          .lab-experiments { padding: 60px 20px; }
          .lab-utility { padding: 8px 16px; font-size: 8px; }
          .lab-footer { padding: 32px 20px 80px; }
        }
      `}</style>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="lab-hero">
        <div className="lab-hero-canvas">
          <div className="lab-hero-grid" />
          <div className="lab-hero-glow" />
        </div>

        <div className="lab-hero-content">
          <motion.div
            className="lab-hero-meta"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 0.8}}
          >
            Sotabosc · Research & Practice
          </motion.div>

          <motion.h1
            className="lab-hero-title"
            initial={{opacity: 0, y: 40}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1]}}
          >
            Speculative
            <br />
            <span className="lab-hero-title-dim">Futures</span>
            <br />
            Lab
          </motion.h1>

          <motion.p
            className="lab-hero-desc"
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1]}}
          >
            Research and practice at the intersection of nature, technology, and
            culture. We explore speculative futures, embodied interaction, and
            emergent systems to reimagine how we inhabit digital and physical space.
          </motion.p>
        </div>
      </section>

      {/* ── Divider ─────────────────────────────────────────── */}
      <motion.div
        className="lab-divider"
        initial="hidden"
        whileInView="visible"
        viewport={{once: true}}
        variants={lineReveal}
      />

      {/* ── Research Areas ──────────────────────────────────── */}
      <section className="lab-research">
        <div className="lab-section-header">
          <h2 className="lab-section-label">Research Areas</h2>
          <span className="lab-section-count">
            {RESEARCH_AREAS.length} areas
          </span>
        </div>

        {RESEARCH_AREAS.map((area, i) => (
          <motion.div
            key={area.id}
            className="lab-area"
            initial={{opacity: 0, y: 20}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, margin: '-60px'}}
            transition={{
              duration: 0.5,
              delay: i * 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <span className="lab-area-index">{area.index}</span>
            <div className="lab-area-content">
              <div className="lab-area-header">
                <h3 className="lab-area-title">{area.title}</h3>
                <span
                  className={`lab-area-status lab-area-status--${area.status}`}
                >
                  {area.status}
                </span>
              </div>
              <p className="lab-area-subtitle">{area.subtitle}</p>
              <p className="lab-area-desc">{area.description}</p>
              <div className="lab-area-tags">
                {area.tags.map((tag) => (
                  <span key={tag} className="lab-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* ── Divider ─────────────────────────────────────────── */}
      <motion.div
        className="lab-divider"
        initial="hidden"
        whileInView="visible"
        viewport={{once: true}}
        variants={lineReveal}
      />

      {/* ── Experiments ─────────────────────────────────────── */}
      <section className="lab-experiments">
        <div className="lab-section-header">
          <h2 className="lab-section-label">Experiments</h2>
          <span className="lab-section-count">
            {EXPERIMENTS.length} projects
          </span>
        </div>

        <div className="lab-exp-grid">
          {EXPERIMENTS.map((exp, i) => {
            const Tag = exp.href ? Link : 'div';
            const linkProps = exp.href ? {to: exp.href} : {};
            return (
              <motion.div
                key={exp.title}
                initial={{opacity: 0, y: 20}}
                whileInView={{opacity: 1, y: 0}}
                viewport={{once: true}}
                transition={{
                  duration: 0.5,
                  delay: i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Tag className="lab-exp-card" {...linkProps}>
                  <div className="lab-exp-card-head">
                    <h3 className="lab-exp-card-title">{exp.title}</h3>
                    <span className="lab-exp-card-tech">{exp.tech}</span>
                  </div>
                  <p className="lab-exp-card-desc">{exp.description}</p>
                  {exp.href && (
                    <span className="lab-exp-card-link">View →</span>
                  )}
                </Tag>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Utility bar (Volvox-style) ──────────────────────── */}
      <div className="lab-utility">
        <div className="lab-utility-item">
          <span className="lab-utility-dot" />
          <span>Active research</span>
        </div>
        <div className="lab-utility-item">BCN · 41.3874° N, 2.1686° E</div>
        <div className="lab-utility-item">
          {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
          })}
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="lab-footer">
        <div style={{display: 'flex', gap: '20px'}}>
          <Link to="/">Home</Link>
          <Link to="/tools">Tools</Link>
          <Link to="/work">Work</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <span
          style={{
            fontSize: '9px',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'var(--lab-dim)',
            fontFamily: 'var(--lab-mono)',
          }}
        >
          Sotabosc Labs · Barcelona
        </span>
      </footer>
    </div>
  );
}

/** @typedef {import('./+types/labs').Route} Route */
