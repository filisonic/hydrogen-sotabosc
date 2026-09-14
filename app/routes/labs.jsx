import {useEffect, useState} from 'react';
import {motion} from 'framer-motion';
import {Link} from 'react-router';
import {
  getLabsCapabilities,
  getLabsPageContent,
  getLabsProjects,
  labsVimeoEmbedSrc,
} from '~/lib/labs/content';

/**
 * Labs — Interactive design studio
 * Dark immersive studio page: mapping, interactive, displays, fabrication, live.
 *
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [
    {title: 'Labs — Interactive Studio | Sotabosc'},
    {
      name: 'description',
      content:
        'Interactive design studio practice: projection mapping, kinetic work, AR/VR, and live making at Sotabosc Labs in Barcelona.',
    },
  ];
};

const lineReveal = {
  hidden: {scaleX: 0},
  visible: {
    scaleX: 1,
    transition: {duration: 0.8, ease: [0.22, 1, 0.36, 1]},
  },
};

export default function Labs() {
  const page = getLabsPageContent();
  const capabilities = getLabsCapabilities();
  const projects = getLabsProjects();
  const [titleLead, titleMid, titleTrail] = page.hero.titleLines;
  const [activeId, setActiveId] = useState(/** @type {string | null} */ (null));
  const active = projects.find((p) => p.id === activeId) || null;

  useEffect(() => {
    if (!activeId) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setActiveId(null);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [activeId]);

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
        .lab-hero-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.28;
          filter: saturate(0.85) contrast(1.05);
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

        .lab-divider {
          height: 1px;
          background: var(--lab-border);
          margin: 0 32px;
          transform-origin: left;
        }

        .lab-mq {
          overflow: hidden;
          border-block: 1px solid var(--lab-border);
          padding: 18px 0;
          margin: 0;
        }
        .lab-mq-inner {
          display: flex;
          width: max-content;
          animation: lab-marquee 40s linear infinite;
        }
        .lab-mq-item {
          font-family: var(--lab-mono);
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--lab-dim);
          white-space: nowrap;
          padding: 0 28px;
        }
        @keyframes lab-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .lab-section {
          padding: 80px 32px;
        }
        .lab-section-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 24px;
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
        .lab-section-intro {
          font-size: 15px;
          color: var(--lab-muted);
          line-height: 1.65;
          max-width: 640px;
          margin: 0 0 40px;
        }

        .lab-cap-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 14px;
        }
        .lab-cap-card {
          background: var(--lab-surface);
          border: 1px solid var(--lab-border);
          border-radius: 10px;
          padding: 24px;
          min-height: 180px;
          display: flex;
          flex-direction: column;
        }
        .lab-cap-title {
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 0 0 10px;
        }
        .lab-cap-desc {
          font-size: 13px;
          color: var(--lab-muted);
          line-height: 1.6;
          margin: 0 0 16px;
          flex: 1;
        }
        .lab-cap-tags {
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

        .lab-project-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }
        .lab-project-card {
          position: relative;
          display: block;
          width: 100%;
          text-align: left;
          text-decoration: none;
          color: inherit;
          border: 1px solid var(--lab-border);
          border-radius: 12px;
          overflow: hidden;
          background: var(--lab-surface);
          cursor: pointer;
          padding: 0;
          font: inherit;
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .lab-project-card:hover {
          transform: translateY(-3px);
          border-color: rgba(0,0,0,0.16);
          box-shadow: 0 10px 28px rgba(0,0,0,0.08);
        }
        .lab-project-media {
          aspect-ratio: 16 / 10;
          overflow: hidden;
          background: #111;
          position: relative;
        }
        .lab-project-media img,
        .lab-project-media video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.5s ease;
        }
        .lab-project-card:hover .lab-project-media img,
        .lab-project-card:hover .lab-project-media video {
          transform: scale(1.04);
        }
        .lab-project-play {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(to top, rgba(0,0,0,0.4), transparent 55%);
          pointer-events: none;
        }
        .lab-project-play span {
          width: 52px;
          height: 52px;
          border-radius: 999px;
          background: rgba(255,229,0,0.92);
          color: #111;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-family: var(--lab-mono);
          letter-spacing: 0.06em;
          font-weight: 700;
          box-shadow: 0 8px 24px rgba(0,0,0,0.25);
        }
        .lab-project-body {
          padding: 22px 22px 24px;
        }
        .lab-project-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
        }
        .lab-project-category {
          font-size: 9px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--lab-accent);
          font-family: var(--lab-mono);
        }
        .lab-project-tech {
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
        .lab-project-title {
          font-size: clamp(22px, 3vw, 28px);
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 0 0 8px;
        }
        .lab-project-summary {
          font-size: 13px;
          color: var(--lab-muted);
          line-height: 1.6;
          margin: 0 0 14px;
        }
        .lab-project-link {
          font-size: 10px;
          color: var(--lab-accent);
          font-family: var(--lab-mono);
          letter-spacing: 0.08em;
        }

        .lab-lightbox {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(8,8,8,0.88);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .lab-lightbox-panel {
          width: min(960px, 100%);
          background: #0c0c0c;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 14px;
          overflow: hidden;
          color: #f5f5f5;
        }
        .lab-lightbox-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 16px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .lab-lightbox-head h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
        .lab-lightbox-head p {
          margin: 4px 0 0;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
          font-family: var(--lab-mono);
        }
        .lab-lightbox-close {
          border: 1px solid rgba(255,255,255,0.2);
          background: transparent;
          color: #fff;
          border-radius: 8px;
          padding: 8px 12px;
          cursor: pointer;
          font-family: var(--lab-mono);
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .lab-lightbox-frame {
          position: relative;
          aspect-ratio: 16 / 9;
          background: #000;
        }
        .lab-lightbox-frame iframe,
        .lab-lightbox-frame video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: 0;
        }

        .lab-crosslink {
          margin: 0 32px 80px;
          padding: 28px;
          border: 1px solid var(--lab-border);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
          background: var(--lab-surface);
        }
        .lab-crosslink p {
          margin: 0;
          font-size: 14px;
          color: var(--lab-muted);
          max-width: 520px;
          line-height: 1.6;
        }
        .lab-crosslink a {
          font-family: var(--lab-mono);
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--lab-text);
          text-decoration: none;
          border-bottom: 1px solid var(--lab-border);
          padding-bottom: 2px;
        }

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

        @media (max-width: 768px) {
          .lab-hero { padding: 0 20px 60px; }
          .lab-section { padding: 60px 20px; }
          .lab-project-grid { grid-template-columns: 1fr; }
          .lab-utility { padding: 8px 16px; font-size: 8px; }
          .lab-footer { padding: 32px 20px 80px; }
          .lab-crosslink { margin: 0 20px 80px; }
        }
      `}</style>

      <section className="lab-hero">
        <div className="lab-hero-canvas">
          <img
            className="lab-hero-image"
            src="/images/labs/jakub-zerdzicki-oG3rjdcSnEU-unsplash.jpg"
            alt=""
            aria-hidden="true"
          />
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
            {page.hero.meta}
          </motion.div>

          <motion.h1
            className="lab-hero-title"
            initial={{opacity: 0, y: 40}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1]}}
          >
            {titleLead}
            <br />
            <span className="lab-hero-title-dim">{titleMid}</span>
            <br />
            {titleTrail}
          </motion.h1>

          <motion.p
            className="lab-hero-desc"
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1]}}
          >
            {page.hero.description}
          </motion.p>
        </div>
      </section>

      <div className="lab-mq" aria-hidden="true">
        <div className="lab-mq-inner">
          {[0, 1].map((row) => (
            <span key={row} style={{display: 'flex'}}>
              {page.marquee.map((item) => (
                <span key={`${row}-${item}`} className="lab-mq-item">
                  {item} ·
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <motion.div
        className="lab-divider"
        initial="hidden"
        whileInView="visible"
        viewport={{once: true}}
        variants={lineReveal}
      />

      <section className="lab-section">
        <div className="lab-section-header">
          <h2 className="lab-section-label">Capabilities</h2>
          <span className="lab-section-count">
            {capabilities.length} specialties
          </span>
        </div>
        <p className="lab-section-intro">{page.capabilitiesIntro}</p>
        <div className="lab-cap-grid">
          {capabilities.map((cap, i) => (
            <motion.div
              key={cap.id}
              className="lab-cap-card"
              initial={{opacity: 0, y: 20}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true}}
              transition={{
                duration: 0.5,
                delay: i * 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <h3 className="lab-cap-title">{cap.title}</h3>
              <p className="lab-cap-desc">{cap.description}</p>
              <div className="lab-cap-tags">
                {cap.tags.map((tag) => (
                  <span key={tag} className="lab-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <motion.div
        className="lab-divider"
        initial="hidden"
        whileInView="visible"
        viewport={{once: true}}
        variants={lineReveal}
      />

      <section className="lab-section">
        <div className="lab-section-header">
          <h2 className="lab-section-label">Selected Work</h2>
          <span className="lab-section-count">{projects.length} projects</span>
        </div>
        <p className="lab-section-intro">{page.projectsIntro}</p>
        <div className="lab-project-grid">
          {projects.map((project, i) => {
            const canPlay = Boolean(project.vimeoId || project.video);
            return (
              <motion.div
                key={project.id}
                initial={{opacity: 0, y: 20}}
                whileInView={{opacity: 1, y: 0}}
                viewport={{once: true}}
                transition={{
                  duration: 0.5,
                  delay: i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <button
                  type="button"
                  className="lab-project-card"
                  onClick={() => {
                    if (canPlay) setActiveId(project.id);
                  }}
                  disabled={!canPlay}
                  style={canPlay ? undefined : {cursor: 'default', opacity: 0.92}}
                >
                  <div className="lab-project-media">
                    <img src={project.image} alt="" />
                    {canPlay ? (
                      <div className="lab-project-play">
                        <span>Play</span>
                      </div>
                    ) : null}
                  </div>
                  <div className="lab-project-body">
                    <div className="lab-project-meta">
                      <span className="lab-project-category">
                        {project.category}
                      </span>
                      {project.tech ? (
                        <span className="lab-project-tech">{project.tech}</span>
                      ) : null}
                    </div>
                    <h3 className="lab-project-title">{project.title}</h3>
                    <p className="lab-project-summary">{project.summary}</p>
                    <span className="lab-project-link">
                      {canPlay ? 'Watch here →' : 'Coming soon'}
                    </span>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>
      </section>

      {active ? (
        <div
          className="lab-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          onClick={() => setActiveId(null)}
        >
          <div
            className="lab-lightbox-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lab-lightbox-head">
              <div>
                <h3>{active.title}</h3>
                <p>
                  {active.category}
                  {active.tech ? ` · ${active.tech}` : ''}
                </p>
              </div>
              <button
                type="button"
                className="lab-lightbox-close"
                onClick={() => setActiveId(null)}
              >
                Close
              </button>
            </div>
            <div className="lab-lightbox-frame">
              {active.vimeoId ? (
                <iframe
                  title={active.title}
                  src={labsVimeoEmbedSrc(active.vimeoId, true)}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : active.video ? (
                <video
                  src={active.video}
                  controls
                  autoPlay
                  playsInline
                  poster={active.image}
                />
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <div className="lab-crosslink">
        <p>
          Looking for film and animation deliverables? Those live on Media.
          Research and living systems sit under Research. Plotter, aquarium, and
          other offline pieces can be added when you have Vimeo links or files.
        </p>
        <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
          <Link to="/media">Media →</Link>
          <Link to="/research">Research →</Link>
        </div>
      </div>

      <div className="lab-utility">
        <div className="lab-utility-item">
          <span className="lab-utility-dot" />
          <span>{page.utilityLabel}</span>
        </div>
        <div className="lab-utility-item">BCN · 41.3874° N, 2.1686° E</div>
        <div className="lab-utility-item">
          {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
          })}
        </div>
      </div>

      <footer className="lab-footer">
        <div style={{display: 'flex', gap: '20px'}}>
          <Link to="/">Home</Link>
          <Link to="/tools">Tools</Link>
          <Link to="/research">Research</Link>
          <Link to="/media">Media</Link>
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
