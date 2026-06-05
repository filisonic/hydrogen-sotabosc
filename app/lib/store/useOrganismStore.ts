import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { OrganismCard } from '../organism/types';
import type { ArtifactActivity, ArtifactActionType } from '../directory/types';
import { getXPForAction } from '../organism/progression';
import { normalizeDomain } from '../directory/domains';

function normalizeStoredOrganism(organism: OrganismCard | null): OrganismCard | null {
    if (!organism) return null;
    const domain = normalizeDomain(organism.domain as string);
    if (!domain) return null;
    return domain === organism.domain ? organism : { ...organism, domain };
}

interface OrganismState {
    organism: OrganismCard | null;
    discoveredSpecimens: string[];
    activities: ArtifactActivity[];
    totalXP: number;
    setOrganism: (organism: OrganismCard | null) => void;
    clearOrganism: () => void;
    addDiscovery: (specimenId: string) => void;
    recordActivity: (actionType: ArtifactActionType, targetId: string) => void;
}

export const useOrganismStore = create<OrganismState>()(
    persist(
        (set, get) => ({
            organism: null,
            discoveredSpecimens: [],
            activities: [],
            totalXP: 0,
            setOrganism: (organism) => set((state) => {
                const next = normalizeStoredOrganism(organism);
                if (!next) return { organism: null };
                const isNewJoin = !state.organism;
                if (!isNewJoin) return { organism: next };

                const activity: ArtifactActivity = {
                    actionType: 'domain_join',
                    targetId: next.domain,
                    domain: next.domain,
                    timestamp: Date.now(),
                };
                const xp = getXPForAction('domain_join');
                return {
                    organism: next,
                    activities: [activity, ...state.activities].slice(0, 50),
                    totalXP: state.totalXP + xp,
                };
            }),
            clearOrganism: () =>
                set({ organism: null, activities: [], totalXP: 0, discoveredSpecimens: [] }),
            addDiscovery: (specimenId) => set((state) => {
                if (state.discoveredSpecimens.includes(specimenId)) return {};
                if (!state.organism) {
                    return { discoveredSpecimens: [...state.discoveredSpecimens, specimenId] };
                }
                const activity: ArtifactActivity = {
                    actionType: 'specimen_discover',
                    targetId: specimenId,
                    domain: state.organism.domain,
                    timestamp: Date.now(),
                };
                const xp = getXPForAction('specimen_discover');
                return {
                    discoveredSpecimens: [...state.discoveredSpecimens, specimenId],
                    activities: [activity, ...state.activities].slice(0, 50),
                    totalXP: state.totalXP + xp,
                };
            }),
            recordActivity: (actionType, targetId) => set((state) => {
                if (!state.organism) return {};
                const already = state.activities.some(
                    (a) => a.actionType === actionType && a.targetId === targetId,
                );
                if (already) return {};
                const xp = getXPForAction(actionType);
                const activity: ArtifactActivity = {
                    actionType,
                    targetId,
                    domain: state.organism.domain,
                    timestamp: Date.now(),
                };
                return {
                    activities: [activity, ...state.activities].slice(0, 50),
                    totalXP: state.totalXP + xp,
                };
            }),
        }),
        {
            name: 'sotabosc-organism-storage',
            storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : (null as any))),
            merge: (persisted, current) => {
                const p = persisted as Partial<OrganismState> | undefined;
                if (!p) return current;
                return {
                    ...current,
                    ...p,
                    organism: normalizeStoredOrganism(p.organism ?? null),
                };
            },
        }
    )
);
