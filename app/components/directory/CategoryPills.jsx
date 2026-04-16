import { Link } from 'react-router';
import { LISTING_CATEGORIES, LISTING_CATEGORY_KEYS, DOMAINS, DOMAIN_KEYS } from '~/lib/directory/domains';
import { directoryRoutes } from '~/lib/directory/routes';

const inactivePill =
  'text-xs font-semibold px-3 py-1.5 rounded-full border transition-all hover:opacity-90';
const inactiveStyle = {
  backgroundColor: 'var(--sotabosc-surface)',
  borderColor: 'var(--sotabosc-border)',
  color: 'var(--sotabosc-muted)',
};

export function CategoryPills({ activeCategory }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        to={directoryRoutes.city()}
        className={inactivePill}
        style={
          !activeCategory
            ? {
                backgroundColor: 'var(--sotabosc-accent)',
                color: 'var(--sotabosc-surface)',
                borderColor: 'transparent',
              }
            : inactiveStyle
        }
      >
        All
      </Link>
      {LISTING_CATEGORY_KEYS.map((key) => (
        <Link
          key={key}
          to={directoryRoutes.category(key)}
          className={inactivePill}
          style={
            activeCategory === key
              ? {
                  backgroundColor: 'var(--sotabosc-accent)',
                  color: 'var(--sotabosc-surface)',
                  borderColor: 'transparent',
                }
              : inactiveStyle
          }
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
              isActive ? 'border-transparent' : ''
            }`}
            style={
              isActive
                ? { backgroundColor: d.color, color: '#fff' }
                : {
                    backgroundColor: 'var(--sotabosc-surface)',
                    borderColor: 'var(--sotabosc-border)',
                    color: d.color,
                  }
            }
          >
            {d.emoji} {d.label}
          </Link>
        );
      })}
    </div>
  );
}
