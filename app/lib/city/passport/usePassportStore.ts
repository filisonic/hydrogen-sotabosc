import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { addVisit, barcelonaDay, type Visit, type VisitSource } from './rules';

/**
 * City passport — where a visitor has been in Sotabosc.
 *
 * Lives in this browser today. Every change is also written to `outbox` as an
 * append-only event, so a server sync can be added later without changing the
 * rules or the UI: send the outbox, then `markSynced`. See docs/city-passport.md.
 */
export interface PassportEvent {
  id: string;
  type: 'visit' | 'collect';
  at: number;
  /** Place slug for a visit, collectible id for a collect. */
  target: string;
  kingdom: string | null;
  source?: VisitSource;
}

interface PassportState {
  /** Anonymous id for this browser; becomes the key for a synced passport. */
  visitorId: string | null;
  visits: Visit[];
  outbox: PassportEvent[];
  recordVisit: (place: string, kingdom: string, source?: VisitSource) => void;
  recordCollect: (collectibleId: string, kingdom: string | null) => void;
  markSynced: (eventIds: string[]) => void;
}

const MAX_VISITS = 600;
const MAX_OUTBOX = 200;

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export const usePassportStore = create<PassportState>()(
  persist(
    (set) => ({
      visitorId: null,
      visits: [],
      outbox: [],
      recordVisit: (place, kingdom, source = 'map') =>
        set((state) => {
          const now = new Date();
          const visit: Visit = { place, kingdom, day: barcelonaDay(now), at: now.getTime(), source };
          const visits = addVisit(state.visits, visit);
          if (visits === state.visits) return {};
          const event: PassportEvent = { id: newId(), type: 'visit', at: visit.at, target: place, kingdom, source };
          return {
            visitorId: state.visitorId ?? newId(),
            visits: visits.slice(-MAX_VISITS),
            outbox: [...state.outbox, event].slice(-MAX_OUTBOX),
          };
        }),
      recordCollect: (collectibleId, kingdom) =>
        set((state) => {
          if (state.outbox.some((e) => e.type === 'collect' && e.target === collectibleId)) return {};
          const event: PassportEvent = { id: newId(), type: 'collect', at: Date.now(), target: collectibleId, kingdom };
          return {
            visitorId: state.visitorId ?? newId(),
            outbox: [...state.outbox, event].slice(-MAX_OUTBOX),
          };
        }),
      markSynced: (eventIds) =>
        set((state) => ({ outbox: state.outbox.filter((e) => !eventIds.includes(e.id)) })),
    }),
    {
      name: 'sotabosc-city-passport',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : (null as any))),
    },
  ),
);
