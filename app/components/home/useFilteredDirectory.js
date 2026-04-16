import { useMemo } from 'react';
import { useOrganismStore } from '~/lib/store/useOrganismStore';
import { getDomain } from '~/lib/directory/domains';
import { itemMatchesUserDomain } from '~/lib/theme/domainTheme';

/**
 * @param {{ places: unknown[]; events: unknown[]; creators: unknown[] }} directory
 */
export function useFilteredDirectory(directory) {
  const userDomain = useOrganismStore((s) => s.organism?.domain) ?? null;
  const { places = [], events = [], creators = [] } = directory || {};

  const filteredPlaces = useMemo(
    () =>
      places.filter((p) =>
        itemMatchesUserDomain(p.primaryDomain, p.secondaryDomains, userDomain),
      ),
    [places, userDomain],
  );

  const filteredEvents = useMemo(
    () =>
      events.filter((e) =>
        itemMatchesUserDomain(e.primaryDomain, e.secondaryDomains, userDomain),
      ),
    [events, userDomain],
  );

  const filteredCreators = useMemo(
    () =>
      creators.filter((c) =>
        itemMatchesUserDomain(c.primaryDomain, c.secondaryDomains, userDomain),
      ),
    [creators, userDomain],
  );

  const showPersonalized = Boolean(userDomain);
  const themeLabel = userDomain ? getDomain(userDomain).label : null;

  return {
    userDomain,
    filteredPlaces,
    filteredEvents,
    filteredCreators,
    showPersonalized,
    themeLabel,
  };
}
