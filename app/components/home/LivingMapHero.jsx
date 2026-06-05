import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { DOMAIN_KEYS, DOMAINS, DOMAIN_ROLES } from '~/lib/directory/domains';

const HERO_IMAGE = '/assets/world/aurelia/canopy.png';

/**
 * Solarpunk hero for the living map homepage — image + thesis; domain picker follows below.
 *
 * @param {{ placeCount?: number }} props
 */
export function LivingMapHero({ placeCount = 0 }) {
  const countLabel = placeCount > 0 ? `${placeCount}+ places mapped` : 'Creative Barcelona';

  return (
    <header className="living-map-hero relative z-[120] border-b mag overflow-hidden">
      <div className="living-map-hero__media sotabosc-aurelia-photo" aria-hidden>
        <img src={HERO_IMAGE} alt="" loading="eager" fetchPriority="high" />
      </div>
      <div className="living-map-hero__wash" aria-hidden />
      <div className="living-map-hero__grain" aria-hidden />

      <div className="living-map-hero__content max-w-6xl mx-auto px-4 py-10 md:py-14 relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="living-map-hero__kicker">Solarpunk directory · Barcelona</p>
          <h1 className="living-map-hero__title">
            Barcelona mapped by <span className="living-map-hero__accent">ecosystem role</span>
            <span className="living-map-hero__title-sub"> — not industry.</span>
          </h1>
          <p className="living-map-hero__lede">
            Solarpunk here is taxonomy, not wallpaper: a living map of galleries, studios, cafés, and
            venues classified by what each place <em>does</em> in the city&apos;s creative
            infrastructure — grow, connect, activate, restore, ground.
          </p>
          <p className="living-map-hero__meta">{countLabel} · scroll the layers below</p>

          <div className="living-map-hero__spectrum" role="list" aria-label="Five ecosystem leagues">
            {DOMAIN_KEYS.map((key) => {
              const domain = DOMAINS[key];
              const role = DOMAIN_ROLES[key];
              return (
                <span
                  key={key}
                  role="listitem"
                  className="living-map-hero__spectrum-seg"
                  style={{ '--seg-color': domain.color }}
                  title={`${role} · ${domain.label}`}
                >
                  <span className="living-map-hero__spectrum-role">{role}</span>
                  <span className="living-map-hero__spectrum-label">{domain.label}</span>
                </span>
              );
            })}
          </div>

          <div className="living-map-hero__cta">
            <a href="#living-map-scroll" className="mag-btn living-map-hero__btn-primary">
              Explore the map
            </a>
            <Link to="/city" className="mag-btn-o living-map-hero__btn-secondary">
              Browse directory
            </Link>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
