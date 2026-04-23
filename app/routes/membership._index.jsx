import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { MAG_IMAGE_COVER, MAG_IMAGE_PERKS } from '~/lib/magAssets';

export const meta = () => [
  { title: "Membership — Sotabosc" },
  { name: 'description', content: "Join Sotabosc's living ecosystem. Choose your ecological domain and get curated trips, magazines, and original art pieces." },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  }
};

export default function MembershipIndex() {
  return (
    <div className="mag" style={{ backgroundColor: 'var(--surface)', color: 'var(--ink)', overflowX: 'hidden' }}>
      {/* ═══════════════ HERO SPREAD ═══════════════ */}
      <section style={{ 
        backgroundColor: 'var(--y)', 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '5rem 2rem 4rem',
        position: 'relative',
        borderBottom: '4px solid var(--ink)'
      }}>
        <motion.div 
          className="max-w-[1400px] mx-auto w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.span 
            variants={itemVariants}
            style={{ 
              display: 'block', 
              fontSize: 'var(--step-1)', 
              fontWeight: 900, 
              textTransform: 'uppercase', 
              letterSpacing: '0.6em',
              marginBottom: '3rem',
              color: 'var(--ink)'
            }}
          >
            The Understory Needs You
          </motion.span>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', alignItems: 'start' }}>
            <motion.h1 
              variants={itemVariants}
              style={{ 
                fontSize: 'clamp(5rem, 18vw, 16rem)', 
                fontWeight: 900, 
                lineHeight: 0.75, 
                letterSpacing: '-0.06em',
                margin: 0,
                textTransform: 'uppercase',
                color: 'var(--ink)'
              }}
            >
              Nourish <br />the <br />Under- <br />story
            </motion.h1>
            
            <motion.div variants={itemVariants} style={{ marginTop: 'auto', paddingLeft: '4rem' }}>
              <p style={{ fontSize: 'var(--step-2)', fontWeight: 800, lineHeight: 1.1, color: 'var(--ink)', maxWidth: '500px' }}>
                We are moving away from passive consumption. Sotabosc is a living experiment in mutualism. By joining, you are an active part of the city's creative preservation.
              </p>
              <div style={{ marginTop: '4rem' }}>
                 <a href="#plans" className="mag-btn">Join the Network</a>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════ THE IMPACT SPREAD ═══════════════ */}
      <section style={{ backgroundColor: 'var(--pink)', color: '#fff', padding: '6rem 2rem', borderBottom: '4px solid var(--ink)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '4rem', alignItems: 'center' }}>
          <motion.div 
            style={{ gridColumn: 'span 5' }}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <h2 style={{ fontSize: 'clamp(2.4rem, 5vw, var(--step-5))', fontWeight: 900, lineHeight: 0.85, letterSpacing: '-0.04em', marginBottom: '2.5rem', textTransform: 'uppercase' }}>
              Your <br />impact <br />is real.
            </h2>
            <div style={{ borderLeft: '10px solid #fff', paddingLeft: '3rem' }}>
              <p style={{ fontSize: 'var(--step-1)', fontWeight: 800, lineHeight: 1.4, marginBottom: '2rem' }}>
                70% of your membership goes directly to funding local artist grants and our open-source research laboratory.
              </p>
              <p style={{ fontSize: 'var(--step-0)', fontWeight: 500, lineHeight: 1.6, opacity: 0.9 }}>
                When you subscribe, you are paying for the time local creators need to experiment, for the materials used in our speculative prototyping, and for the preservation of the data-driven "city-world" map.
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            style={{ gridColumn: 'span 7' }}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <div style={{ border: '4px solid var(--ink)', padding: '1.5rem', background: '#fff', transform: 'rotate(2deg)' }}>
               <img 
                src={MAG_IMAGE_PERKS}
                alt="Sotabosc membership — impact and perks"
                style={{ width: '100%', display: 'block' }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ LONG PERKS LIST (EDITORIAL) ═══════════════ */}
      
      {/* Perk 01: The Trip */}
      <section style={{ backgroundColor: 'var(--blue)', padding: '6rem 2rem', borderBottom: '4px solid var(--ink)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '3.5rem', alignItems: 'end' }}>
            <motion.h3 
              style={{ fontSize: 'clamp(2.25rem, 6vw, var(--step-5))', fontWeight: 900, lineHeight: 0.85, letterSpacing: '-0.05em', margin: 0, textTransform: 'uppercase' }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              The Weekly <br />Tailor-Made <br />Trip
            </motion.h3>
            <div style={{ textAlign: 'right' }}>
               <span style={{ fontSize: 'var(--step-2)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.4em' }}>Perk 01</span>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '4rem' }}>
             <motion.div 
               style={{ backgroundColor: '#fff', padding: '2.5rem', border: '4px solid var(--ink)', transform: 'rotate(-1deg)' }}
               whileHover={{ scale: 1.02, rotate: 0 }}
             >
                <h4 style={{ fontSize: 'var(--step-2)', fontWeight: 900, marginBottom: '2rem' }}>Why it exists:</h4>
                <p style={{ fontSize: 'var(--step-0)', lineHeight: 1.5, fontWeight: 600 }}>
                  Generic tourism is killing the city's soul. We created these trips to reroute the "human flow" toward the places that actually need support: the studios, the small-batch roasteries, and the independent galleries.
                </p>
             </motion.div>
             <motion.div 
               style={{ backgroundColor: 'var(--y)', padding: '2.5rem', border: '4px solid var(--ink)', transform: 'rotate(1.5deg)' }}
               whileHover={{ scale: 1.02, rotate: 0 }}
             >
                <h4 style={{ fontSize: 'var(--step-2)', fontWeight: 900, marginBottom: '2rem' }}>The Experience:</h4>
                <p style={{ fontSize: 'var(--step-0)', lineHeight: 1.5, fontWeight: 600 }}>
                  Every Friday morning, a bespoke itinerary appears in your profile. It's mapped to your ecological domain. If you are a 'Plant', we'll send you to hidden courtyard gardens and artisanal tea rooms.
                </p>
             </motion.div>
          </div>
        </div>
      </section>

      {/* Perk 02: The Magazine */}
      <section style={{ backgroundColor: 'var(--orange)', padding: '6rem 2rem', borderBottom: '4px solid var(--ink)', color: '#fff' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <motion.h3 
            style={{ fontSize: 'clamp(2.25rem, 6vw, var(--step-5))', fontWeight: 900, lineHeight: 0.85, letterSpacing: '-0.06em', marginBottom: '3.5rem', textTransform: 'uppercase', textAlign: 'center' }}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            Physical <br />Intelligence
          </motion.h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div style={{ fontSize: 'var(--step--1)', fontWeight: 900, transform: 'rotate(-90deg)', whiteSpace: 'nowrap', opacity: 0.6 }}>FORTNIGHTLY PUBLICATION</div>
            <motion.div 
              style={{ border: '12px solid #fff', overflow: 'hidden', boxShadow: '20px 20px 0 var(--ink)' }}
              whileInView={{ y: [20, -20] }}
              transition={{ repeat: Infinity, duration: 4, repeatType: 'reverse' }}
            >
               <img src={MAG_IMAGE_COVER} alt="Sotabosc print magazine and field notes" style={{ width: '100%' }} />
            </motion.div>
            <div style={{ padding: '2rem' }}>
              <p style={{ fontSize: 'var(--step-1)', fontWeight: 900, lineHeight: 1.2 }}>
                A 64-page document of Barcelona's current creative energy. Delivered to your door. Printed on recycled seaweed paper.
              </p>
              <p style={{ marginTop: '2rem', opacity: 0.8, fontWeight: 500 }}>
                Includes secret coordinates for local events, interviews with lab researchers, and generative art patterns to decode.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Perk 03: The Art */}
      <section style={{ backgroundColor: 'var(--surface)', padding: '6rem 2rem', borderBottom: '4px solid var(--ink)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2.5rem' }}>
           <div style={{ gridColumn: 'span 5' }}>
              <span style={{ fontSize: 'var(--step--1)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.4em', color: 'var(--pink)' }}>Perk 03</span>
              <h3 style={{ fontSize: 'clamp(2.1rem, 4.5vw, var(--step-4))', fontWeight: 900, lineHeight: 0.9, marginTop: '1.25rem', textTransform: 'uppercase' }}>Original <br />Artifacts.</h3>
           </div>
           <div style={{ gridColumn: 'span 7', borderLeft: '4px solid var(--ink)', paddingLeft: 'clamp(1.5rem, 4vw, 3.5rem)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(2rem, 4vw, 3.5rem)' }}>
                 <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <h4 style={{ fontSize: 'var(--step-1)', fontWeight: 900, marginBottom: '1.5rem' }}>Monthly Physical Pieces</h4>
                    <p style={{ fontSize: 'var(--step-0)', lineHeight: 1.6, fontWeight: 500 }}>
                      Once a month, we ship a tangible piece of the ecosystem to you. It might be a risograph print, a bio-plastic sculpture from the lab, or a curated seed-bank.
                    </p>
                 </motion.div>
                 <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                    <h4 style={{ fontSize: 'var(--step-1)', fontWeight: 900, marginBottom: '1.5rem' }}>Direct Creation</h4>
                    <p style={{ fontSize: 'var(--step-0)', lineHeight: 1.6, fontWeight: 500 }}>
                      These are not mass-produced "merch". They are limited edition artifacts created specifically for the Mycelial Network members.
                    </p>
                 </motion.div>
              </div>
           </div>
        </div>
      </section>

      {/* ═══════════════ THE PLANS SPREAD ═══════════════ */}
      <section id="plans" style={{ backgroundColor: 'var(--y)', padding: '6rem 2rem', borderBottom: '4px solid var(--ink)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <motion.h2 
            style={{ fontSize: 'clamp(3rem, 12vw, 9rem)', fontWeight: 900, lineHeight: 0.8, letterSpacing: '-0.05em', marginBottom: '4rem', textTransform: 'uppercase', textAlign: 'center' }}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Choose your <br />Connection.
          </motion.h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '6rem' }}>
            
            {/* FREE TIER */}
            <motion.div 
              style={{ 
                backgroundColor: 'var(--surface)', 
                padding: '4rem 3rem', 
                border: '4px solid var(--ink)',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '16px 16px 0 var(--ink)'
              }}
              whileHover={{ translate: '-8px -8px', boxShadow: '24px 24px 0 var(--ink)' }}
            >
              <span style={{ fontSize: 'var(--step--1)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.4em' }}>01 / Basic Root</span>
              <h3 style={{ fontSize: 'var(--step-4)', fontWeight: 900, margin: '2rem 0' }}>Free Seed</h3>
              <div style={{ fontSize: 'var(--step-3)', fontWeight: 900, marginBottom: '4rem' }}>€0 <span style={{ fontSize: 'var(--step--1)', opacity: 0.5 }}>/ LIFETIME</span></div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 6rem 0', fontWeight: 800, fontSize: 'var(--step-0)', flex: 1 }}>
                <li style={{ marginBottom: '1.5rem' }}>↳ Unique Ecological Identity</li>
                <li style={{ marginBottom: '1.5rem' }}>↳ Core Barcelona Directory</li>
                <li style={{ marginBottom: '1.5rem' }}>↳ Open Lab Research Papers</li>
              </ul>
              <Link to="/city-world" className="mag-btn-o" style={{ textAlign: 'center', display: 'block' }}>
                Initialize Profile
              </Link>
            </motion.div>

            {/* PAID TIER */}
            <motion.div 
              style={{ 
                backgroundColor: 'var(--pink)', 
                color: '#fff',
                padding: '4rem 3rem', 
                border: '4px solid var(--ink)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '16px 16px 0 var(--ink)'
              }}
              whileHover={{ translate: '-8px -8px', boxShadow: '24px 24px 0 var(--ink)' }}
            >
              <div style={{ 
                position: 'absolute', 
                top: '-30px', 
                right: '30px', 
                background: 'var(--y)', 
                color: 'var(--ink)', 
                padding: '1rem 2rem', 
                fontWeight: 900,
                fontSize: 'var(--step-0)',
                border: '4px solid var(--ink)',
                transform: 'rotate(5deg)'
              }}>
                INTRO RATE
              </div>
              <span style={{ fontSize: 'var(--step--1)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.4em' }}>02 / Full Symbiosis</span>
              <h3 style={{ fontSize: 'var(--step-4)', fontWeight: 900, margin: '2rem 0' }}>Mycelial Network</h3>
              <div style={{ fontSize: 'var(--step-3)', fontWeight: 900, marginBottom: '4rem' }}>€50 <span style={{ fontSize: 'var(--step--1)', opacity: 0.7 }}>/ MONTH</span></div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 6rem 0', fontWeight: 800, fontSize: 'var(--step-0)', flex: 1 }}>
                <li style={{ marginBottom: '1.5rem' }}>★ Fortnightly Physical Magazine</li>
                <li style={{ marginBottom: '1.5rem' }}>★ Weekly Bespoke Travel Itineraries</li>
                <li style={{ marginBottom: '1.5rem' }}>★ Monthly Original Art Artifact</li>
                <li style={{ marginBottom: '1.5rem' }}>★ Speculative Lab Early Access</li>
              </ul>
              <button 
                onClick={() => alert('Checkout integration pending!')}
                className="mag-btn"
                style={{ width: '100%', textAlign: 'center', background: 'var(--y)', color: 'var(--ink)' }}
              >
                Join the Network
              </button>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ═══════════════ FINAL CALL SPREAD ═══════════════ */}
      <section style={{ backgroundColor: 'var(--ink)', color: 'var(--surface)', padding: '6rem 2rem', textAlign: 'center' }}>
        <motion.div 
          style={{ maxWidth: '1000px', margin: '0 auto' }}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2 style={{ fontSize: 'var(--step-4)', fontWeight: 900, lineHeight: 1.1, marginBottom: '4rem', textTransform: 'uppercase' }}>
            Don't just watch <br />the city change. <br />Be the reason <br />it thrives.
          </h2>
          <Link to="/city-world" style={{ 
            display: 'inline-block',
            borderBottom: '8px solid var(--y)',
            color: 'var(--y)',
            fontSize: 'var(--step-1)',
            fontWeight: 900,
            textDecoration: 'none',
            paddingBottom: '0.5rem',
            textTransform: 'uppercase',
            letterSpacing: '0.3em'
          }}>
            Explore the ecosystem →
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
