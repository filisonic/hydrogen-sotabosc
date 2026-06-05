import type { DomainCategory } from './types';
import { normalizeDomain, type PublicDomainCategory } from './domains';

/** Shown in the compact domain band after the visitor picks a domain. */
export const DOMAIN_ENTRY_EFFECT: Record<PublicDomainCategory, string> = {
  plants:
    'The map favors places that grow community — studios, gardens, and spaces people return to weekly. Your artifact roots here.',
  fungi:
    'Listings tilt toward connectors — galleries, networks, fermentation, rooms where you meet people through the space.',
  animals:
    'Energy and motion rise — venues, events, pop-ups. The scroll world picks up pace; your artifact tracks activation.',
  algae:
    'Flow and restoration — retreats, wellness, coastal rhythm. Calmer layers surface first.',
  earth:
    'Grounded ritual — coffee, craft, tables, material shops. The bedrock layer of the city.',
};

export function getDomainEntryEffect(domain: DomainCategory | string | null | undefined): string {
  const key = normalizeDomain(domain);
  return key ? DOMAIN_ENTRY_EFFECT[key] : '';
}

export const DOMAIN_IDLE_HINT =
  'Tap a domain to join its league — your choice locks in and the map reshapes around you. You can scroll first, but picking is how you start earning resonance.';

/** After pick — domain switcher is hidden; explains league lock. */
export const DOMAIN_LOCKED_HINT =
  'Earn resonance by clearing trail nodes, finding specimens, and opening listings. Domain leagues and badges are next.';
