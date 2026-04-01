import { motion } from 'framer-motion';
import { useAudioStore } from '~/lib/store/useAudioStore';
import { audioManager } from '~/lib/sound/audioManager';

/**
 * SoundToggle Component
 * A subtle, premium UI toggle to manage atmospheric music/SFX.
 */
export function SoundToggle() {
    const { isMuted, toggleMute } = useAudioStore();

    const handleToggle = () => {
        toggleMute();
        if (isMuted) {
            audioManager.playAll();
        } else {
            audioManager.pauseAll();
        }
    };

    return (
        <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleToggle}
            className="fixed top-8 right-8 z-[200] flex items-center gap-3 px-6 py-3 bg-white/40 backdrop-blur-xl rounded-full border border-white/30 shadow-sm hover:shadow-lg transition-all"
        >
            <div className="relative w-4 h-4 flex items-center justify-center">
                {!isMuted ? (
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-2 h-2 bg-cyan-500 rounded-full"
                    />
                ) : (
                    <div className="w-2 h-2 bg-red-400 rounded-full opacity-50" />
                )}
            </div>
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40">
                {isMuted ? 'Muted' : 'Atmosphere'}
            </span>
        </motion.button>
    );
}
