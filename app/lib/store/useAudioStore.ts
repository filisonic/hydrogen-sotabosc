import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AudioState {
    isMuted: boolean;
    volume: number;
    setMuted: (isMuted: boolean) => void;
    toggleMute: () => void;
    setVolume: (volume: number) => void;
}

/**
 * useAudioStore
 * Manages global audio state (mute/volume).
 * Persisted to localStorage to remember user preference.
 */
export const useAudioStore = create<AudioState>()(
    persist(
        (set) => ({
            isMuted: true, // Muted by default as per browser standards
            volume: 0.5,
            setMuted: (isMuted) => set({ isMuted }),
            toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
            setVolume: (volume) => set({ volume }),
        }),
        {
            name: 'sotabosc-audio-storage',
            storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : (null as any))),
        }
    )
);
