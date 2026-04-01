import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { OrganismCard } from '../organism/types';
import type { ArtifactActivity, ArtifactActionType } from '../directory/types';
import { getXPForAction } from '../organism/progression';

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
            setOrganism: (organism) => set({ organism }),
            clearOrganism: () => set({ organism: null, activities: [], totalXP: 0 }),
            addDiscovery: (specimenId) => set((state) => ({
                discoveredSpecimens: state.discoveredSpecimens.includes(specimenId)
                    ? state.discoveredSpecimens
                    : [...state.discoveredSpecimens, specimenId]
            })),
            recordActivity: (actionType, targetId) => set((state) => {
                if (!state.organism) return {};
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
        }
    )
);
