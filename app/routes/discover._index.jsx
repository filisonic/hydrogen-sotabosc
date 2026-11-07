import {useLoaderData, Link} from 'react-router';
import {motion} from 'framer-motion';
import { JsonLd } from '~/components/seo/JsonLd';
import {resolveEventImageUrl, resolvePlaceImageUrl} from '~/lib/directory/sceneVisuals';

export const meta = () => [
  {title: "Discover — Sotabosc"},
  {name: 'description', content: "Barcelona cultural directory — places, events, and creators. Companion to the Sotabosc magazine edition."},
  {property: 'og:title', content: "Sotabosc — Discover Barcelona"},
  {property: 'og:description', content: "Curated places, events, and creators. Culture, art and creative life."},
  {property: 'og:type', content: 'website'},
  {property: 'og:url', content: 'https://sotabosc.world/discover'},
  {property: 'og:site_name', content: 'Sotabosc'},
  {name: 'twitter:card', content: 'summary_large_image'},
  {name: 'twitter:title', content: "Sotabosc — Discover Barcelona"},
  {name: 'twitter:description', content: "Curated places, events, and creators. Culture, art and creative life."},
];

export async function loader({context}) {
  try {
    const {getCityDirectory} = await import('~/lib/directory/source.server');
    const {places, events, creators, reviews, getUpcomingEvents} = await getCityDirectory(context);
    const upcoming = getUpcomingEvents();
    const placesById = new Map(places.map((place) => [place.id, place]));
    const eventImageByPlaceSlug = new Map();

    for (const ev of events) {
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
    const galleries = places.filter(p => p.categories.includes('art-gallery')).slice(0, 4).map(addImg);
    const coffee = places.filter(p => p.categories.includes('specialty-coffee')).slice(0, 3).map(addImg);
    const music = places.filter(p => p.categories.includes('music-venue')).slice(0, 3).map(addImg);
    const workshops = places.filter(p => p.categories.includes('workshop')).slice(0, 3).map(addImg);
    const restaurants = places.filter(p => p.categories.includes('restaurant')).slice(0, 3).map(addImg);
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
      creators: creators.slice(0, 6),
      reviews: reviews.slice(0, 4),
      featuredImage,
      totalPlaces: places.length,
      totalEvents: events.length,
      totalCreators: creators.length,
    };
  } catch (e) {
    return {upcomingEvents:[], galleries:[], coffee:[], music:[], workshops:[], restaurants:[], creators:[], reviews:[], featuredImage:null, totalPlaces:0, totalEvents:0, totalCreators:0};
  }
}

const SECTIONS = [
  {id:'edition', label:'Magazine edition', desc:'Culture, art and creative life — the Barcelona channel edition on the web.', href:'/', cta:'Open the edition'},
  {id:'directory', label:'Directory', desc:'Places — galleries, coffee, music venues, workshops, and restaurants curated by neighbourhood.', href:'/city', cta:'Browse places'},
  {id:'events', label:'Happening', desc:'What’s on — last 30 days through the weeks ahead, from the city directory.', href:'/city/events', cta:'See the calendar'},
  {id:'screens', label:'Screens', desc:'Sotabosc in physical space — cultural channel, not lobby signage.', href:'/screens', cta:'See the screens'},
  {id:'creators', label:'Creators', desc:'Artists and makers in the network — short portraits, not a portfolio dump.', href:'/city/creators', cta:'Meet creators'},
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
        "url": "https://sotabosc.world",
        "description": "Barcelona cultural directory — places, events, and creators.",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://sotabosc.world/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Organization",
        "name": "Sotabosc",
        "url": "https://sotabosc.world",
        "logo": "https://sotabosc.world/favicon.svg",
        "description": "Local cultural channel with magazine sensibility"
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
              City directory · Magazine companion
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
                Barcelona’s cultural network — places, events, and creators — feeding the channel edition and the screens.
              </p>
              <div className="mag-home-cta-row">
                <Link to="/" className="mag-btn">Open the edition</Link>
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
              {['Edition', 'Directory', 'Happening', 'Creators', 'Screens', 'Galleries', 'Barcelona'].map((item, i) => (
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
          <span className="mag-feat-main-tag">Barcelona Edition</span>
          <h3>Culture, art and creative life</h3>
          <p>The magazine homepage — happenings, exhibitions, artists, and the local edit. Same spine as the channel.</p>
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

      {/* ═══════════════ CHANNEL + MAP ═══════════════ */}
      <div className="mag-sec"><div className="mag-sec-head"><h2 className="mag-sec-label">Channel & map</h2></div></div>
      <div className="mag-feat">
        <Link
          to="/screens"
          className="mag-feat-main"
          style={d.featuredImage ? {
            backgroundImage: `linear-gradient(rgba(20,16,8,0.52), rgba(20,16,8,0.82)), url(${d.featuredImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } : undefined}
        >
          <span className="mag-feat-main-tag">Screens</span>
          <h3>Sotabosc in physical space</h3>
          <p>A cultural channel for boutique venues — atmosphere first, host as setting, not a brochure loop.</p>
        </Link>
        <div className="mag-feat-side">
          <Link to="/map" className="mag-feat-card">
            <span className="mag-feat-card-tag">Living map</span>
            <h4>Spatial view of the network — optional, not the homepage</h4>
            <p>Open the map →</p>
          </Link>
          <Link to="/city/creators" className="mag-feat-card">
            <span className="mag-feat-card-tag">Creators</span>
            <h4>Artists and makers in the Barcelona edition</h4>
            <p>Meet creators →</p>
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
          <Link to="/">Edition</Link><Link to="/how-it-works">About</Link><Link to="/screens">Screens</Link><Link to="/map">Map</Link><Link to="/contact">Contact</Link>
        </div>
        <span className="mag-footer-brand">Sotabosc · Barcelona</span>
      </footer>
    </div>
  );
}
