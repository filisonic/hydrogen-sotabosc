import { Link } from 'react-router';

const ACTIONS = [
  { label: 'Suggest a place', icon: '📍', href: '/feedback?type=suggest-place' },
  { label: 'Add an event', icon: '📅', href: '/feedback?type=add-event' },
  { label: 'Claim listing', icon: '✋', href: '/feedback?type=claim' },
  { label: 'Leave a review', icon: '⭐', href: '/feedback?type=review' },
];

export function ContributionActions({ compact = false }) {
  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {ACTIONS.map((a) => (
          <Link
            key={a.label}
            to={a.href}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-black/5 hover:bg-black/10 rounded-full transition-colors"
          >
            <span>{a.icon}</span> {a.label}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <section className="bg-white/60 backdrop-blur-sm rounded-2xl border border-black/5 p-6">
      <h3 className="font-bold text-sm mb-1">Help grow the ecosystem</h3>
      <p className="text-xs text-black/40 mb-4">
        Know a place that should be here? Share it with the community.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ACTIONS.map((a) => (
          <Link
            key={a.label}
            to={a.href}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-black/5 hover:border-black/15 hover:shadow-md transition-all text-center"
          >
            <span className="text-2xl">{a.icon}</span>
            <span className="text-xs font-semibold">{a.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
