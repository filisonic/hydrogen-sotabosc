import { Link } from 'react-router';

export function HomeExploreFeed({ directory }) {
  if (!directory) return null;

  return (
    <section className="py-14 px-4 relative z-[100]" style={{ backgroundColor: 'var(--sotabosc-bg)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black mb-4" style={{ color: 'var(--sotabosc-text)' }}>
            Explore the ecosystem
          </h2>
          <p className="text-sm opacity-70 max-w-2xl mx-auto">
            Discover places, events, and creators in Barcelona's living cultural network.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Places */}
          <div>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--sotabosc-text)' }}>
              Places
            </h3>
            <div className="space-y-2">
              {directory.places?.slice(0, 5).map((place, index) => (
                <Link
                  key={index}
                  to={`/city/places/${place.slug || index}`}
                  className="block p-3 rounded-lg border hover:shadow-sm transition-shadow"
                  style={{
                    backgroundColor: 'var(--sotabosc-surface)',
                    borderColor: 'var(--sotabosc-border)',
                  }}
                >
                  <div className="text-sm font-medium">{place.name}</div>
                  <div className="text-xs opacity-60 mt-1">{place.neighborhood}</div>
                </Link>
              ))}
            </div>
            <Link
              to="/city/places"
              className="inline-flex items-center text-xs font-bold mt-4 hover:opacity-70 transition-opacity"
              style={{ color: 'var(--sotabosc-accent)' }}
            >
              View all places →
            </Link>
          </div>

          {/* Events */}
          <div>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--sotabosc-text)' }}>
              Events
            </h3>
            <div className="space-y-2">
              {directory.events?.slice(0, 5).map((event, index) => (
                <Link
                  key={index}
                  to={`/city/events/${event.slug || index}`}
                  className="block p-3 rounded-lg border hover:shadow-sm transition-shadow"
                  style={{
                    backgroundColor: 'var(--sotabosc-surface)',
                    borderColor: 'var(--sotabosc-border)',
                  }}
                >
                  <div className="text-sm font-medium">{event.title}</div>
                  <div className="text-xs opacity-60 mt-1">{event.date}</div>
                </Link>
              ))}
            </div>
            <Link
              to="/city/events"
              className="inline-flex items-center text-xs font-bold mt-4 hover:opacity-70 transition-opacity"
              style={{ color: 'var(--sotabosc-accent)' }}
            >
              View all events →
            </Link>
          </div>

          {/* Creators */}
          <div>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--sotabosc-text)' }}>
              Creators
            </h3>
            <div className="space-y-2">
              {directory.creators?.slice(0, 5).map((creator, index) => (
                <Link
                  key={index}
                  to={`/city/creators/${creator.slug || index}`}
                  className="block p-3 rounded-lg border hover:shadow-sm transition-shadow"
                  style={{
                    backgroundColor: 'var(--sotabosc-surface)',
                    borderColor: 'var(--sotabosc-border)',
                  }}
                >
                  <div className="text-sm font-medium">{creator.name}</div>
                  <div className="text-xs opacity-60 mt-1">{creator.type}</div>
                </Link>
              ))}
            </div>
            <Link
              to="/city/creators"
              className="inline-flex items-center text-xs font-bold mt-4 hover:opacity-70 transition-opacity"
              style={{ color: 'var(--sotabosc-accent)' }}
            >
              View all creators →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}