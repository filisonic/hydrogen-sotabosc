import { Link, useLocation } from 'react-router';
import { LISTING_CATEGORIES, LISTING_CATEGORY_KEYS, DOMAINS, DOMAIN_KEYS } from '~/lib/directory/domains';
import { directoryRoutes } from '~/lib/directory/routes';

export function CategoryPills({ activeCategory }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        to={directoryRoutes.city()}
        className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
          !activeCategory
            ? 'bg-black text-white border-black'
            : 'bg-white text-black/60 border-black/10 hover:border-black/30'
        }`}
      >
        All
      </Link>
      {LISTING_CATEGORY_KEYS.map((key) => (
        <Link
          key={key}
          to={directoryRoutes.category(key)}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
            activeCategory === key
              ? 'bg-black text-white border-black'
              : 'bg-white text-black/60 border-black/10 hover:border-black/30'
          }`}
        >
          {LISTING_CATEGORIES[key].label}
        </Link>
      ))}
    </div>
  );
}

export function DomainPills({ activeDomain }) {
  return (
    <div className="flex flex-wrap gap-2">
      {DOMAIN_KEYS.map((key) => {
        const d = DOMAINS[key];
        const isActive = activeDomain === key;
        return (
          <Link
            key={key}
            to={`${directoryRoutes.city()}?domain=${key}`}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
              isActive
                ? 'text-white border-transparent'
                : 'bg-white border-black/10 hover:border-black/30'
            }`}
            style={isActive ? { backgroundColor: d.color, color: '#fff' } : { color: d.color }}
          >
            {d.emoji} {d.label}
          </Link>
        );
      })}
    </div>
  );
}
