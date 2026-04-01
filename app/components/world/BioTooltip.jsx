import { motion } from 'framer-motion';

/**
 * BioTooltip - An "outgrowth" style hover-label for specimens
 * @param {Object} props
 * @param {string} props.name - Display name (Newsreader Serif)
 * @param {string} props.meta - Metadata like rarity or type (Space Grotesk)
 * @param {boolean} props.isVisible - Visibility state
 */
export function BioTooltip({ name, meta, isVisible }) {
    return (
        <motion.div
            className="absolute left-10 top-1/2 -translate-y-1/2 z-50 pointer-events-none"
            initial={{ opacity: 0, x: -20, scale: 0.8 }}
            animate={{
                opacity: isVisible ? 1 : 0,
                x: isVisible ? 0 : -20,
                scale: isVisible ? 1 : 0.8,
            }}
            transition={{
                type: "spring",
                damping: 30,
                stiffness: 200
            }}
        >
            <div className="flex flex-col items-start bg-black/40 backdrop-blur-3xl px-5 py-3 rounded-2xl border border-white/20 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                {/* Meta Header */}
                <span className="text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase mb-1 font-sans">
                    {meta || "Specimen Record"}
                </span>

                {/* Primary Name */}
                <h3 className="text-xl font-serif text-white leading-tight">
                    {name}
                </h3>

                {/* Biological Filament (Decoration) */}
                <motion.div
                    className="absolute -left-4 top-1/2 -translate-y-1/2 w-4 h-[1px] bg-white/30"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isVisible ? 1 : 0 }}
                />
            </div>
        </motion.div>
    );
}
