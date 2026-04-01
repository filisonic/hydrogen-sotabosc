import { Link } from 'react-router';
import { getDomain } from '~/lib/directory/domains';
import { directoryRoutes } from '~/lib/directory/routes';

export function PlaceCard({ place }) {
  const domain = getDomain(place.primaryDomain);

  return (
    <Link
      to={directoryRoutes.place(place.slug)}
      className="group block bg-white rounded-2xl border border-black/5 hover:border-black/15 transition-all hover:shadow-lg overflow-hidden"
    >
      {place.imageUrl ? (
        <div className="aspect-[16/10] bg-black/5 overflow-hidden">
          <img
            src={place.imageUrl}
            alt={place.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div
          className="aspect-[16/10] flex items-center justify-center text-4xl"
          style={{ backgroundColor: `${domain.color}15` }}
        >
          {domain.emoji}
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${domain.color}20`, color: domain.color }}
          >
            {domain.emoji} {domain.label}
          </span>
          {place.categories.slice(0, 2).map((cat) => (
            <span
              key={cat}
              className="text-xs text-black/40 bg-black/5 px-2 py-0.5 rounded-full"
            >
              {cat.replace('-', ' ')}
            </span>
          ))}
        </div>
        <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-black/80 transition-colors">
          {place.name}
        </h3>
        <p className="text-sm text-black/50 line-clamp-2">{place.summary}</p>
        <p className="text-xs text-black/30 mt-3">{place.neighborhood}</p>
      </div>
    </Link>
  );
}
