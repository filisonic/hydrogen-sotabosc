import { Link } from 'react-router';

/**
 * Tools index — landing page for tools.sotabosc.world
 * Lists all available generative/creative tools.
 */
export const meta = () => {
  return [
    { title: 'Tools — Sotabosc' },
    {
      name: 'description',
      content:
        'Generative experiments and creative instruments from the Sotabosc ecosystem.',
    },
  ];
};

const TOOLS = [
  {
    id: 'organism-lab',
    title: 'Organism Lab',
    description:
      'Parametric generative life — explore 50+ organism presets across animals, plants, fungi, microbes, minerals, and cosmic forms. Built with p5.js.',
    tags: ['p5.js', 'generative', 'parametric'],
    status: 'live',
    href: '/tools/organism-lab',
  },
];

export default function ToolsIndex() {
  return (
    <div className="mag tools-mag-page">
      <header className="tools-mag-head">
        <p className="tools-mag-kicker">Sotabosc · Creative instruments</p>
        <h1 className="tools-mag-title">Tools</h1>
        <p className="tools-mag-desc">
          Generative experiments, creative instruments, and interactive sketches from
          the Sotabosc ecosystem — same palette as the rest of the site.
        </p>
      </header>

      <div className="tools-mag-grid">
        {TOOLS.map((tool) => (
          <Link key={tool.id} to={tool.href} className="tools-mag-card">
            <span
              className={`tools-mag-badge ${tool.status === 'live' ? 'tools-mag-badge--live' : ''}`}
            >
              {tool.status}
            </span>
            <h2>{tool.title}</h2>
            <p>{tool.description}</p>
            <div className="tools-mag-tags">
              {tool.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </Link>
        ))}

        <div className="tools-mag-placeholder">More tools coming soon</div>
      </div>
    </div>
  );
}

/** @typedef {import('./+types/tools._index').Route} Route */
