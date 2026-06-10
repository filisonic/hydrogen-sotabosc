import {useLoaderData, Link} from 'react-router';
import {motion} from 'framer-motion';
import {JsonLd} from '~/components/seo/JsonLd';
import {openGraphImageMeta} from '~/lib/seo/siteImagery';
import {
  getMediaPageContent,
  getMediaProcess,
  getMediaProjects,
  getMediaServices,
  getMediaSocialReels,
} from '~/lib/media/content';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  const origin = data?.origin;
  const ogImage = origin
    ? `${origin.replace(/\/$/, '')}/images/media/posters/director-showreel.jpg`
    : null;
  return [
    {title: 'Media — Brand & Creative Studio | Sotabosc'},
    {
      name: 'description',
      content:
        'Brand direction, creative strategy, and media production for founders and teams building something real. Films, campaigns, installations, and creative systems.',
    },
    ...(ogImage
      ? [
          {property: 'og:image', content: ogImage},
          {name: 'twitter:card', content: 'summary_large_image'},
          {name: 'twitter:image', content: ogImage},
        ]
      : openGraphImageMeta(origin)),
  ];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  return {
    origin: new URL(args.request.url).origin,
    page: getMediaPageContent(),
    services: getMediaServices(),
    process: getMediaProcess(),
    projects: getMediaProjects(),
    socialReels: getMediaSocialReels(),
  };
}

const wordReveal = {
  hidden: {opacity: 0, y: 28},
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {duration: 0.55, delay: 0.12 + i * 0.07, ease: [0.22, 1, 0.36, 1]},
  }),
};

function ServiceCard({service}) {
  return (
    <div className="mag-feat-card" style={{minHeight: '220px'}}>
      <span className="mag-feat-card-tag">{service.tagline}</span>
      <h4>{service.title}</h4>
      <p>{service.description}</p>
      {service.tags?.length > 0 ? (
        <p
          style={{
            marginTop: '12px',
            fontSize: '10px',
            letterSpacing: '.1em',
            textTransform: 'uppercase',
            color: 'var(--ink4)',
            fontWeight: 600,
          }}
        >
          {service.tags.join(' · ')}
        </p>
      ) : null}
      {service.link ? (
        <p style={{marginTop: '10px', marginBottom: 0}}>
          <a
            href={service.link.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '11px',
              color: 'var(--ink3)',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            }}
          >
            {service.link.label} →
          </a>
        </p>
      ) : null}
    </div>
  );
}

function SocialReelCard({reel}) {
  return (
    <article
      className="mag-place"
      style={{overflow: 'hidden'}}
    >
      <video
        className="mag-place-img"
        style={{height: 'auto', aspectRatio: '9/16', objectFit: 'cover', display: 'block'}}
        src={reel.video}
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        aria-label={reel.title}
      />
      <div className="mag-place-body">
        <span className="mag-place-cat">{reel.client}</span>
        <h4>{reel.title}</h4>
      </div>
    </article>
  );
}

function ProjectCard({project}) {
  const inner = (
    <>
      <img
        src={project.image}
        alt=""
        className="mag-place-img"
        loading="lazy"
        style={{height: '200px'}}
      />
      <div className="mag-place-body">
        <span className="mag-place-cat">{project.category}</span>
        <h4>{project.title}</h4>
        {project.summary ? <p>{project.summary}</p> : null}
      </div>
    </>
  );

  if (project.external || project.url?.startsWith('http')) {
    return (
      <a
        href={project.url}
        className="mag-place"
        target="_blank"
        rel="noopener noreferrer"
      >
        {inner}
      </a>
    );
  }

  if (project.url?.startsWith('/')) {
    return (
      <Link to={project.url} className="mag-place">
        {inner}
      </Link>
    );
  }

  return <div className="mag-place">{inner}</div>;
}

export default function MediaPage() {
  const {page, services, process, projects, socialReels, origin} = useLoaderData();
  const headlineWords = page.hero.headline.split(' ');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: 'Media — Sotabosc',
        url: `${origin}/media`,
        description: page.hero.subhead,
        image: `${origin}/images/media/posters/director-showreel.jpg`,
      },
      {
        '@type': 'ProfessionalService',
        name: 'Sotabosc Media',
        url: `${origin}/media`,
        description: page.hero.subhead,
        areaServed: 'Worldwide',
        serviceType: services.map((s) => s.title),
        provider: {
          '@type': 'Organization',
          name: 'Sotabosc',
          url: origin,
        },
      },
    ],
  };

  return (
    <div className="mag">
      <JsonLd data={jsonLd} />

      {/* Hero */}
      <section className="mag-hero" style={{minHeight: '70vh'}} aria-labelledby="media-hero-title">
        <motion.h1
          id="media-hero-title"
          className="mag-hero-title"
          initial="hidden"
          animate="visible"
          style={{
            fontSize: 'clamp(42px, 8vw, 110px)',
            flexWrap: 'wrap',
            gap: '0.12em',
            lineHeight: 0.95,
          }}
        >
          {headlineWords.map((word, i) => (
            <motion.span
              key={i}
              className="mag-hero-letter"
              custom={i}
              variants={wordReveal}
              style={{marginRight: '0.08em'}}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        <motion.div
          className="mag-hero-sub"
          initial={{opacity: 0, y: 24}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1]}}
          style={{alignItems: 'stretch', width: '100%'}}
        >
          <div style={{flex: '1 1 320px', maxWidth: '560px'}}>
            <p className="mag-hero-tag" style={{maxWidth: 'none'}}>
              {page.hero.subhead}
            </p>
            <div className="mag-hero-ctas" style={{marginTop: '24px'}}>
              <Link to={page.cta.href} className="mag-btn">
                {page.cta.buttonLabel} →
              </Link>
            </div>
          </div>

          <div
            style={{
              flex: '1 1 360px',
              maxWidth: '520px',
              borderRadius: '14px',
              overflow: 'hidden',
              border: '1px solid var(--border)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              position: 'relative',
              aspectRatio: '16/10',
            }}
          >
            {page.hero.showreelVideo ? (
              <video
                src={page.hero.showreelVideo}
                poster={page.hero.image}
                muted
                loop
                playsInline
                autoPlay
                preload="metadata"
                style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
                aria-label="Director showreel preview"
              />
            ) : (
              <img
                src={page.hero.image}
                alt=""
                style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
                loading="eager"
              />
            )}
          </div>
        </motion.div>
      </section>

      {/* Marquee */}
      <div className="mag-mq" aria-hidden="true">
        <div className="mag-mq-inner">
          {[...Array(2)].map((_, r) => (
            <span key={r} style={{display: 'flex'}}>
              {page.marquee.map((item, i) => (
                <span key={i} className="mag-mq-item">
                  {item} ·
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* Brand & social reels */}
      <div className="mag-sec">
        <div className="mag-sec-head">
          <h2 className="mag-sec-label">{page.socialSection.label}</h2>
          <a
            href={page.workSection.linkHref + '#social-edits'}
            className="mag-sec-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            More on portfolio →
          </a>
        </div>
      </div>
      <p
        style={{
          padding: '0 32px 24px',
          margin: 0,
          maxWidth: '640px',
          fontFamily: 'var(--serif)',
          fontSize: '18px',
          fontStyle: 'italic',
          color: 'var(--ink2)',
          lineHeight: 1.6,
        }}
      >
        {page.socialSection.intro}
      </p>
      <div
        className="mag-places"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          paddingBottom: '16px',
        }}
      >
        {socialReels.map((reel) => (
          <SocialReelCard key={reel.id} reel={reel} />
        ))}
      </div>

      {/* What we do */}
      <div className="mag-sec">
        <div className="mag-sec-head">
          <h2 className="mag-sec-label">{page.servicesSection.label}</h2>
        </div>
      </div>
      <p
        style={{
          padding: '0 32px 24px',
          margin: 0,
          maxWidth: '640px',
          fontFamily: 'var(--serif)',
          fontSize: '18px',
          fontStyle: 'italic',
          color: 'var(--ink2)',
          lineHeight: 1.6,
        }}
      >
        {page.servicesSection.intro}
      </p>
      <div
        className="mag-feat"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          paddingBottom: '16px',
        }}
      >
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>

      {/* How we work */}
      <div className="mag-sec">
        <div className="mag-sec-head">
          <h2 className="mag-sec-label">{page.processSection.label}</h2>
        </div>
      </div>
      <p
        style={{
          padding: '0 32px 24px',
          margin: 0,
          maxWidth: '640px',
          fontSize: '14px',
          color: 'var(--ink3)',
          lineHeight: 1.6,
        }}
      >
        {page.processSection.intro}
      </p>
      <div
        className="mag-stats"
        style={{marginTop: 0, marginBottom: '24px'}}
        role="list"
        aria-label={page.processSection.label}
      >
        {process.map((step) => (
          <div key={step.index} className="mag-stat" role="listitem">
            <div
              className="mag-stat-num"
              style={{fontSize: 'clamp(20px, 3vw, 32px)', letterSpacing: '.08em'}}
              aria-hidden="true"
            >
              {step.index}
            </div>
            <div
              className="mag-stat-label"
              style={{fontSize: '11px', marginBottom: '8px', color: 'var(--ink)'}}
            >
              {step.title}
            </div>
            <p
              style={{
                margin: 0,
                fontSize: '12px',
                color: 'var(--ink3)',
                lineHeight: 1.5,
                maxWidth: '220px',
                marginInline: 'auto',
              }}
            >
              {step.description}
            </p>
          </div>
        ))}
      </div>

      {/* Selected work */}
      <div className="mag-sec">
        <div className="mag-sec-head">
          <h2 className="mag-sec-label">{page.workSection.label}</h2>
          {page.workSection.external ? (
            <a
              href={page.workSection.linkHref}
              className="mag-sec-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {page.workSection.linkLabel} →
            </a>
          ) : (
            <Link to={page.workSection.linkHref} className="mag-sec-link">
              {page.workSection.linkLabel} →
            </Link>
          )}
        </div>
      </div>
      <div className="mag-places" style={{paddingBottom: '32px'}}>
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {/* CTA */}
      <div className="mag-sec">
        <div className="mag-sec-head">
          <h2 className="mag-sec-label">{page.cta.tag}</h2>
        </div>
      </div>
      <div className="mag-feat">
        <div
          className="mag-feat-main"
          style={{minHeight: 'auto', padding: '64px 48px', gridColumn: '1 / -1'}}
        >
          <span className="mag-feat-main-tag">{page.cta.tag}</span>
          <h3 style={{marginTop: '16px', marginBottom: '16px', maxWidth: '720px'}}>
            {page.cta.heading}
          </h3>
          <p style={{maxWidth: '560px', marginBottom: '32px'}}>{page.cta.body}</p>
          <div>
            <Link to={page.cta.href} className="mag-btn" style={{background: 'var(--y)', color: 'var(--ink)'}}>
              {page.cta.buttonLabel} →
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mag-footer">
        <div className="mag-footer-links">
          <Link to="/about">About</Link>
          <Link to="/media">Media</Link>
          <Link to="/work">Work</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/feedback">Feedback</Link>
        </div>
        <span className="mag-footer-brand">Sotabosc · Barcelona</span>
      </footer>
    </div>
  );
}

/** @typedef {import('./+types/media._index').Route} Route */
