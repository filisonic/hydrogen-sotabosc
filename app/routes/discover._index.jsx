import {useLoaderData, Link} from 'react-router';
import {motion} from 'framer-motion';
import { JsonLd } from '~/components/seo/JsonLd';
import {DOMAIN_KEYS, DOMAINS} from '~/lib/directory/domains';
import {MagDomainGlyph} from '~/components/mag/MagEcosphereGlyphs';
import {resolveEventImageUrl, resolvePlaceImageUrl} from '~/lib/directory/sceneVisuals';

export const meta = () => [
  {title: "Discover — Sotabosc"},
  {name: 'description', content: "Culture, creativity, and nature in Barcelona. Curated directory, generative tools, research lab, and more."},
  {property: 'og:title', content: "Sotabosc — Barcelona's Living Creative Ecosystem"},
  {property: 'og:description', content: "Culture, creativity, and nature in Barcelona. Curated directory, generative tools, research lab, and more."},
  {property: 'og:type', content: 'website'},
  {property: 'og:url', content: 'https://sotabosc.org/'},
  {property: 'og:site_name', content: 'Sotabosc'},
  {name: 'twitter:card', content: 'summary_large_image'},
  {name: 'twitter:title', content: "Sotabosc — Barcelona's Living Creative Ecosystem"},
  {name: 'twitter:description', content: "Culture, creativity, and nature in Barcelona. Curated directory, generative tools, research lab, and more."},
];

export async function loader() {
  try {
    const {SEED_PLACES, SEED_EVENTS, SEED_CREATORS, SEED_REVIEWS, getUpcomingEvents} = await import('~/lib/directory/seed.server');
    const upcoming = getUpcomingEvents();
    const placesById = new Map(SEED_PLACES.map((place) => [place.id, place]));
    const eventImageByPlaceSlug = new Map();

    for (const ev of SEED_EVENTS) {
      const eventPlace = ev.placeId ? placesById.get(ev.placeId) : null;
      if (!eventPlace || eventImageByPlaceSlug.has(eventPlace.slug)) continue;
      const resolvedEventImage = resolveEventImageUrl(ev, eventPlace);
      if (resolvedEventImage) eventImageByPlaceSlug.set(eventPlace.slug, resolvedEventImage);
    }

    const addImg = (p) => {
      return {
        ...p,
        imageUrl:
          p.imageUrl ||
          eventImageByPlaceSlug.get(p.slug) ||
          resolvePlaceImageUrl(p) ||
          null,
      };
    };
    const galleries = SEED_PLACES.filter(p => p.categories.includes('art-gallery')).slice(0, 4).map(addImg);
    const coffee = SEED_PLACES.filter(p => p.categories.includes('specialty-coffee')).slice(0, 3).map(addImg);
    const music = SEED_PLACES.filter(p => p.categories.includes('music-venue')).slice(0, 3).map(addImg);
    const workshops = SEED_PLACES.filter(p => p.categories.includes('workshop')).slice(0, 3).map(addImg);
    const restaurants = SEED_PLACES.filter(p => p.categories.includes('restaurant')).slice(0, 3).map(addImg);
    const featuredImage =
      upcoming
        .map((ev) => resolveEventImageUrl(ev, ev.placeId ? placesById.get(ev.placeId) : null))
        .find(Boolean) ||
      galleries[0]?.imageUrl ||
      coffee[0]?.imageUrl ||
      music[0]?.imageUrl ||
      workshops[0]?.imageUrl ||
      restaurants[0]?.imageUrl ||
      null;
    return {
      upcomingEvents: upcoming.slice(0, 6),
      galleries, coffee, music, workshops, restaurants,
      creators: SEED_CREATORS.slice(0, 6),
      reviews: SEED_REVIEWS.slice(0, 4),
      featuredImage,
      totalPlaces: SEED_PLACES.length,
      totalEvents: SEED_EVENTS.length,
      totalCreators: SEED_CREATORS.length,
    };
  } catch (e) {
    return {upcomingEvents:[], galleries:[], coffee:[], music:[], workshops:[], restaurants:[], creators:[], reviews:[], featuredImage:null, totalPlaces:0, totalEvents:0, totalCreators:0};
  }
}

const SECTIONS = [
  {id:'experiences', label:'Curated Experiences', desc:'Descend through sky, canopy, understory, water, and soil — Barcelona mapped as a living ecosystem.', href:'/', cta:'Begin the journey'},
  {id:'directory', label:'Directory', desc:'100+ places — galleries, coffee, music venues, workshops, and restaurants curated by neighbourhood.', href:'/city', cta:'Browse places'},
  {id:'tools', label:'Creative Tools', desc:'Generative instruments and parametric sketches built for experimentation.', href:'/tools', cta:'Open tools'},
  {id:'labs', label:'Speculative Futures Lab', desc:'Research into speculative design, embodied interaction, and emergent systems.', href:'/labs', cta:'Enter lab'},
];

const PLACE_META = {
  'art-gallery':      { icon: '🎨', gradient: 'linear-gradient(135deg, #f0e6ff 0%, #e8d5f5 50%, #dfc4eb 100%)' },
  'specialty-coffee':  { icon: '☕', gradient: 'linear-gradient(135deg, #f5e6d0 0%, #eddcc4 50%, #e5d2b8 100%)' },
  'music-venue':       { icon: '🎵', gradient: 'linear-gradient(135deg, #d0e8f5 0%, #c4dced 50%, #b8d0e5 100%)' },
  'workshop':          { icon: '🔧', gradient: 'linear-gradient(135deg, #e6f0d0 0%, #dce8c4 50%, #d2e0b8 100%)' },
  'restaurant':        { icon: '🍽️', gradient: 'linear-gradient(135deg, #f5d0d0 0%, #edc4c4 50%, #e5b8b8 100%)' },
  'bar':               { icon: '🍸', gradient: 'linear-gradient(135deg, #f0d0e6 0%, #e8c4dc 50%, #e0b8d2 100%)' },
  'coworking':         { icon: '💻', gradient: 'linear-gradient(135deg, #d0f0e6 0%, #c4e8dc 50%, #b8e0d2 100%)' },
};
const DEFAULT_META = { icon: '📍', gradient: 'linear-gradient(135deg, #f0edd0 0%, #e8e5c4 50%, #e0ddb8 100%)' };

function PlaceCard({p}) {
  const meta = p.categories?.map(c => PLACE_META[c]).find(Boolean) || DEFAULT_META;
  return (
    <Link to={`/city/places/${p.slug}`} className="mag-place">
      {p.imageUrl
        ? <img src={p.imageUrl} alt={p.name} className="mag-place-img" loading="lazy" />
        : (
          <div className="mag-place-placeholder" style={{ background: meta.gradient }}>
            <span style={{ fontSize: '36px', filter: 'saturate(0.8)' }}>{meta.icon}</span>
            <span style={{
              fontSize: '8px', letterSpacing: '.2em', textTransform: 'uppercase',
              color: 'rgba(0,0,0,0.25)', fontWeight: 700, marginTop: '6px'
            }}>
              {p.categories?.[0]?.replace(/-/g, ' ') || 'place'}
            </span>
          </div>
        )
      }
      <div className="mag-place-body">
        <span className="mag-place-cat">{p.neighborhood}</span>
        <h4>{p.name}</h4>
        <p>{p.summary}</p>
      </div>
    </Link>
  );
}

export default function DiscoverPage() {
  const d = useLoaderData();
  const title = 'Sotabosc';

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "name": "Sotabosc",
        "url": "https://sotabosc.org",
        "description": "Culture, creativity, and nature in Barcelona. Curated directory, generative tools, research lab, and more.",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://sotabosc.org/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Organization",
        "name": "Sotabosc",
        "url": "https://sotabosc.org",
        "logo": "https://sotabosc.org/favicon.svg",
        "description": "Barcelona's Living Creative Ecosystem"
      }
    ]
  };

  return (
    <div className="mag">
      <JsonLd data={jsonLd} />
       {/* ═══════════════ HERO ═══════════════ */}
      <section className="mag-home-hero">
        <motion.div 
          className="max-w-[1400px] mx-auto w-full"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1, delayChildren: 0.2 }
            }
          }}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
            }} 
            style={{ marginBottom: '4rem' }}
          >
            <span style={{ fontSize: 'var(--step--1)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5em', color: 'var(--ink)' }}>
              Curated Directory & Research Lab
            </span>
          </motion.div>
          
          <div className="mag-home-hero-grid">
            <motion.h1 
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
              }}
              style={{ 
                fontSize: 'clamp(5rem, 15vw, 15rem)', 
                fontWeight: 900, 
                lineHeight: 0.8, 
                letterSpacing: '-0.06em', 
                margin: 0,
                textTransform: 'uppercase',
                color: 'var(--ink)'
              }}
            >
              The <br />Creative <br />Soil.
            </motion.h1>
            
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
              }}
              className="mag-home-hero-aside"
            >
               <p style={{ fontSize: 'var(--step-2)', fontWeight: 800, lineHeight: 1.1, color: 'var(--ink)', maxWidth: '500px' }}>
                We map Barcelona’s creative network through places, events, and creators shaped by sustainability, community, and spirit.
              </p>
              <div className="mag-home-cta-row">
                <Link to="/" className="mag-btn">Enter the living map</Link>
                <Link to="/city" className="mag-btn-o">Browse directory</Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════ MARQUEE ═══════════════ */}
      <div className="mag-mq" style={{ borderBottom: '4px solid var(--ink)' }}>
        <div className="mag-mq-inner">
          {[...Array(2)].map((_, r) => (
            <span key={r} style={{ display: 'flex' }}>
              {['Directory', 'Curated Experiences', 'Generative Tools', 'Speculative Research', 'Gallery', 'Community', 'Barcelona', 'Nature × Culture'].map((item, i) => (
                <span key={i} className="mag-mq-item">{item} ·</span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ═══════════════ FEATURED ═══════════════ */}
      <div className="mag-sec"><div className="mag-sec-head"><h2 className="mag-sec-label">Featured</h2></div></div>
      <div className="mag-feat">
        <Link
          to="/"
          className="mag-feat-main"
          style={d.featuredImage ? {
            backgroundImage: `linear-gradient(rgba(20,16,8,0.45), rgba(20,16,8,0.78)), url(${d.featuredImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } : undefined}
        >
          <span className="mag-feat-main-tag">Curated Experiences</span>
          <h3>Descend Through Barcelona's Living Layers</h3>
          <p>Sky → canopy → understory → forest floor → water → soil. An immersive vertical journey mapping the city to the natural world.</p>
        </Link>
        <div className="mag-feat-side">
          {SECTIONS.slice(1, 3).map(s => (
            <Link key={s.id} to={s.href} className="mag-feat-card">
              <span className="mag-feat-card-tag">{s.label}</span>
              <h4>{s.desc.split('.')[0]}</h4>
              <p>{s.cta} →</p>
            </Link>
          ))}
        </div>
      </div>

      {/* ═══════════════ UPCOMING EVENTS ═══════════════ */}
      {d.upcomingEvents?.length > 0 && (<>
        <div className="mag-sec"><div className="mag-sec-head"><h2 className="mag-sec-label">Upcoming Events</h2><Link to="/city/events" className="mag-sec-link">View all →</Link></div></div>
        <div className="mag-events">
          {d.upcomingEvents.map(ev => (
            <Link key={ev.id} to={`/city/events/${ev.slug}`} className="mag-ev">
              <div className="mag-ev-date">{new Date(ev.startsAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              <h4>{ev.title}</h4>
              <p>{ev.placeName}</p>
            </Link>
          ))}
        </div>
      </>)}

      {/* ═══════════════ GALLERIES ═══════════════ */}
      {d.galleries?.length > 0 && (<>
        <div className="mag-sec"><div className="mag-sec-head"><h2 className="mag-sec-label">Art Galleries</h2><Link to="/city?cat=art-gallery" className="mag-sec-link">All galleries →</Link></div></div>
        <div className="mag-places">
          {d.galleries.map(p => <PlaceCard key={p.id} p={p} />)}
        </div>
      </>)}

      {/* ═══════════════ COFFEE ═══════════════ */}
      {d.coffee?.length > 0 && (<>
        <div className="mag-sec"><div className="mag-sec-head"><h2 className="mag-sec-label">Specialty Coffee</h2><Link to="/city?cat=specialty-coffee" className="mag-sec-link">All cafés →</Link></div></div>
        <div className="mag-places">
          {d.coffee.map(p => <PlaceCard key={p.id} p={p} />)}
        </div>
      </>)}

      {/* ═══════════════ STATS ═══════════════ */}
      <motion.div className="mag-stats" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .5 }}>
        <div className="mag-stat"><div className="mag-stat-num">{d.totalPlaces || '100'}+</div><div className="mag-stat-label">Places mapped</div></div>
        <div className="mag-stat"><div className="mag-stat-num">{d.totalEvents || '24'}</div><div className="mag-stat-label">Events</div></div>
        <div className="mag-stat"><div className="mag-stat-num">{d.totalCreators || '14'}</div><div className="mag-stat-label">Creators</div></div>
        <div className="mag-stat"><div className="mag-stat-num">6</div><div className="mag-stat-label">Ecosystem layers</div></div>
      </motion.div>

      {/* ═══════════════ MUSIC ═══════════════ */}
      {d.music?.length > 0 && (<>
        <div className="mag-sec"><div className="mag-sec-head"><h2 className="mag-sec-label">Live Music</h2><Link to="/city?cat=music-venue" className="mag-sec-link">All venues →</Link></div></div>
        <div className="mag-places">
          {d.music.map(p => <PlaceCard key={p.id} p={p} />)}
        </div>
      </>)}

      {/* ═══════════════ CREATORS ═══════════════ */}
      {d.creators?.length > 0 && (<>
        <div className="mag-sec"><div className="mag-sec-head"><h2 className="mag-sec-label">Creators</h2><Link to="/city/creators" className="mag-sec-link">All creators →</Link></div></div>
        <div className="mag-creators">
          {d.creators.map(c => (
            <Link key={c.id} to={`/city/creators/${c.slug}`} className="mag-creator">
              <h4>{c.displayName}</h4>
              <p>{c.bio}</p>
            </Link>
          ))}
        </div>
      </>)}

      {/* ═══════════════ ECOSYSTEM MAP (mycelial band) ═══════════════ */}
      <section className="mag-home-ecosphere">
        <div className="mag-home-ecosphere-inner">
          <motion.div
            className="mag-home-ecosphere-copy"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            <span style={{ fontSize: 'var(--step--1)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.4em', marginBottom: '1rem', display: 'block', opacity: 0.9 }}>
              The Mycelial Call
            </span>
            <h2 style={{ fontSize: 'clamp(2.2rem, 5vw, var(--step-5))', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-0.05em', textTransform: 'uppercase' }}>
              Five leagues.
            </h2>
            <p className="mag-home-ecosphere-lede">
              Five leagues — grow, connect, activate, restore, ground — so listings, trips, and trail paths match your role in the ecosystem.
            </p>
            <div className="mag-home-ecosphere-cta">
              <Link to="/" className="mag-pill mag-pill-primary">
                Enter the living map
              </Link>
              <Link to="/city">Browse all places →</Link>
            </div>
          </motion.div>

          <motion.div
            className="mag-home-stack"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
            }}
          >
            <h3 className="mag-home-stack-label">Domains — how you enter</h3>
            <div className="mag-home-domains">
              {DOMAIN_KEYS.map((domainKey, idx) => {
                const domain = DOMAINS[domainKey];
                return (
                  <motion.div
                    key={domainKey}
                    variants={{
                      hidden: { opacity: 0, y: 14 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
                    }}
                  >
                    <Link
                      to="/"
                      className="mag-home-domain"
                      style={{ borderLeft: `3px solid ${domain.color}` }}
                    >
                      <div className="mag-home-card-head">
                        <span className="mag-home-icon-slot mag-home-icon-slot--domain">
                          <MagDomainGlyph
                            domainKey={domainKey}
                            size={14}
                            color={domain.color}
                          />
                        </span>
                        <div className="mag-home-card-head-text">
                          <span className="mag-home-domain-index">
                            {domain.role ?? `Domain ${(idx + 1).toString().padStart(2, '0')}`}
                          </span>
                          <span className="mag-home-domain-title">{domain.label}</span>
                        </div>
                      </div>
                      <p className="mag-home-domain-blurb">{domain.description}</p>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ EXPLORE MORE ═══════════════ */}
      <div className="mag-sec"><div className="mag-sec-head"><h2 className="mag-sec-label">Explore More</h2></div></div>
      <div className="mag-feat">
        <Link
          to="/labs"
          className="mag-feat-main"
          style={{
            backgroundImage:
              'linear-gradient(rgba(20,16,8,0.52), rgba(20,16,8,0.82)), url(https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&h=800&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <span className="mag-feat-main-tag">Speculative Futures Lab</span>
          <h3>Research at the Edge of Nature and Technology</h3>
          <p>Speculative design, embodied interaction, and emergent systems — four active research areas.</p>
        </Link>
        <div className="mag-feat-side">
          <Link to="/tools" className="mag-feat-card">
            <span className="mag-feat-card-tag">Creative Tools</span>
            <h4>Generative instruments and parametric sketches</h4>
            <p>Open tools →</p>
          </Link>
          <Link to="/gallery" className="mag-feat-card">
            <span className="mag-feat-card-tag">Gallery</span>
            <h4>Discovered specimens — an evolving archive</h4>
            <p>View gallery →</p>
          </Link>
        </div>
      </div>

      {/* ═══════════════ REVIEWS ═══════════════ */}
      {d.reviews?.length > 0 && (<>
        <div className="mag-sec"><div className="mag-sec-head"><h2 className="mag-sec-label">Community Voices</h2></div></div>
        <div className="mag-reviews">
          {d.reviews.map(r => (
            <div key={r.id} className="mag-review">
              <q>{r.body}</q>
              <cite>— {r.authorName}</cite>
            </div>
          ))}
        </div>
      </>)}

      {/* ═══════════════ RESTAURANTS ═══════════════ */}
      {d.restaurants?.length > 0 && (<>
        <div className="mag-sec"><div className="mag-sec-head"><h2 className="mag-sec-label">Food & Dining</h2><Link to="/city?cat=restaurant" className="mag-sec-link">All restaurants →</Link></div></div>
        <div className="mag-places">
          {d.restaurants.map(p => <PlaceCard key={p.id} p={p} />)}
        </div>
      </>)}

      {d.workshops?.length > 0 && (<>
        <div className="mag-sec"><div className="mag-sec-head"><h2 className="mag-sec-label">Workshops & Classes</h2><Link to="/city?cat=workshop" className="mag-sec-link">All workshops →</Link></div></div>
        <div className="mag-places">
          {d.workshops.map(p => <PlaceCard key={p.id} p={p} />)}
        </div>
      </>)}

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
