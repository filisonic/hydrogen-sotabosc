import { Link } from 'react-router';

/**
 * Shown at /membership while paid membership is dormant — keeps old links friendly.
 */
export function MembershipDormantPage() {
  return (
    <div className="mag" style={{ backgroundColor: 'var(--y)', color: 'var(--ink)', minHeight: '80vh' }}>
      <section
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: 'clamp(4rem, 12vh, 8rem) 2rem',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: '10px',
            fontWeight: 800,
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            marginBottom: '1.5rem',
            opacity: 0.55,
          }}
        >
          Membership — paused
        </p>
        <h1
          style={{
            fontSize: 'clamp(2rem, 6vw, 3.5rem)',
            fontWeight: 900,
            lineHeight: 0.95,
            letterSpacing: '-0.04em',
            textTransform: 'uppercase',
            margin: '0 0 1.25rem',
          }}
        >
          Explore the map first.
        </h1>
        <p style={{ fontSize: 'var(--step-0)', lineHeight: 1.6, opacity: 0.75, margin: '0 auto 2.5rem', maxWidth: '28rem' }}>
          We&apos;re building visitor momentum on the living ecosystem — scroll the city, browse places, pick your
          domain. Paid membership returns when the community layer is ready.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/" className="mag-btn">
            Enter the living map
          </Link>
          <Link to="/city" className="mag-btn-o">
            Browse directory
          </Link>
        </div>
        <p style={{ marginTop: '2.5rem', fontSize: '11px', opacity: 0.45 }}>
          <Link to="/contact" style={{ color: 'inherit', textDecoration: 'underline' }}>
            Contact
          </Link>
          {' '}
          for listings or collaborations.
        </p>
      </section>
    </div>
  );
}
