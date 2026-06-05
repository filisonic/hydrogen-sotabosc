import { Link } from 'react-router';

/**
 * Organism Lab — full-page iframe wrapper.
 * Serves the static p5.js organism lab tool at tools.sotabosc.world/organism-lab.
 */
export const meta = () => {
  return [
    { title: 'Organism Lab — Parametric Generative Life | Sotabosc Tools' },
    {
      name: 'description',
      content:
        'Explore parametric generative organisms with 50+ presets across animals, plants, fungi, minerals, and cosmic forms. Built with p5.js.',
    },
  ];
};

export default function OrganismLab() {
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#07080a',
        color: '#e8ecf2',
        fontFamily:
          'ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
      }}
    >
      {/* Minimal top bar */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          borderBottom: '1px solid #1c2029',
          background: '#0d0f12',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            to="/tools"
            style={{
              fontSize: '10px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#555b66',
              textDecoration: 'none',
              transition: 'color 0.12s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#7cf3d8')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#555b66')}
          >
            ← Tools
          </Link>
          <span style={{ color: '#252a34' }}>|</span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.04em',
              color: '#8a93a1',
            }}
          >
            Organism Lab
          </span>
        </div>
        <span
          style={{
            fontSize: '9px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#7cf3d8',
            padding: '2px 7px',
            border: '1px solid #7cf3d830',
            borderRadius: '3px',
            background: '#0f1a18',
          }}
        >
          p5.js
        </span>
      </nav>

      {/* Full-page iframe */}
      <iframe
        src="/tools/organism-lab-app.html"
        title="Organism Lab — Parametric Generative Life"
        style={{
          flex: 1,
          width: '100%',
          border: 'none',
          display: 'block',
        }}
        allow="fullscreen"
      />
    </div>
  );
}

/** @typedef {import('./+types/tools.organism-lab').Route} Route */
