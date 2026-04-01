import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useOrganismStore } from '~/lib/store/useOrganismStore';

/**
 * SpecimenOverlay - A glassmorphic detail view for discovered specimens
 * @param {Object} props
 * @param {Object} props.specimen - Specimen metadata
 * @param {boolean} props.isOpen - Visibility state
 * @param {Function} props.onClose - Close trigger
 */
export function SpecimenOverlay({ specimen, isOpen, onClose }) {
    const addDiscovery = useOrganismStore((state) => state.addDiscovery);

    useEffect(() => {
        if (isOpen && specimen?.id) {
            addDiscovery(specimen.id);
        }
    }, [isOpen, specimen?.id, addDiscovery]);

    if (!specimen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-md pointer-events-auto"
                        onClick={onClose}
                    />

                    {/* Card Content - Ultra Premium Glassmorphism */}
                    <motion.div
                        className="relative w-full max-w-3xl bg-[#030303]/60 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden pointer-events-auto"
                        initial={{ scale: 0.95, y: 40, opacity: 0, rotateX: 10 }}
                        animate={{ scale: 1, y: 0, opacity: 1, rotateX: 0 }}
                        exit={{ scale: 0.95, y: 20, opacity: 0 }}
                        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                        style={{ perspective: 1000 }}
                    >
                        <div className="flex flex-col md:flex-row h-full">
                            {/* Visual Asset Panel */}
                            <div className="relative w-full md:w-5/12 aspect-square md:aspect-auto bg-black/60 flex items-center justify-center overflow-hidden border-r border-white/5">
                                {/* Ambient Cinematic Glow */}
                                <motion.div
                                    className="absolute inset-0 opacity-40 mix-blend-screen"
                                    style={{
                                        background: `radial-gradient(circle at center, ${specimen.color || '#444'} 0%, transparent 70%)`,
                                        filter: 'blur(40px)'
                                    }}
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                                />

                                <motion.div
                                    animate={{ y: [-5, 5, -5] }}
                                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                                    className="relative z-10 w-full h-full p-8 flex items-center justify-center"
                                >
                                    {specimen.image ? (
                                        <img
                                            src={specimen.image}
                                            alt={specimen.name}
                                            className="w-full h-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]"
                                        />
                                    ) : (
                                        <div
                                            className="w-40 h-40 rounded-full border text-white/50 flex items-center justify-center text-xs tracking-widest border-white/20"
                                            style={{ boxShadow: `0 0 40px ${specimen.color}` }}
                                        >
                                            NO ASSET
                                        </div>
                                    )}
                                </motion.div>
                            </div>

                            {/* Data Panel */}
                            <div className="w-full md:w-7/12 p-10 md:p-12 flex flex-col justify-center relative">
                                {/* Subtle noise overlay on data panel */}
                                <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

                                <div className="space-y-8 relative z-10">
                                    <div>
                                        <motion.p
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="text-[9px] font-bold tracking-[0.4em] text-white/40 uppercase mb-3 font-sans"
                                        >
                                            Ecological Record — {specimen.layer || "General"}
                                        </motion.p>
                                        <motion.h2
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="text-4xl md:text-5xl font-serif text-white/90 leading-tight tracking-tight mb-4"
                                        >
                                            {specimen.name}
                                        </motion.h2>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "40px" }}
                                            transition={{ delay: 0.5, duration: 0.8 }}
                                            className="h-[1px] bg-gradient-to-r from-white/40 to-transparent"
                                        />
                                    </div>

                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-sm md:text-base text-white/60 font-serif leading-relaxed italic"
                                    >
                                        {specimen.description || "A speculatively evolved specimen discovered in the deep Sotabosc ecosystem."}
                                    </motion.p>

                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                        className="pt-2 space-y-3"
                                    >
                                        <div className="flex justify-between items-end text-[10px] uppercase font-sans tracking-widest">
                                            <span className="text-white/40 font-bold">Mycelial Affinity</span>
                                            <span className="text-white/80 font-mono">{specimen.affinity || 45}%</span>
                                        </div>
                                        <div className="h-[1px] bg-white/10 relative overflow-hidden">
                                            <motion.div
                                                className="absolute top-0 left-0 h-full bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${specimen.affinity || 45}%` }}
                                                transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
                                            />
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.7 }}
                                        className="pt-6"
                                    >
                                        <a
                                            href={specimen.productUrl || '#'}
                                            className="group relative flex items-center justify-center w-full py-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all duration-500 overflow-hidden"
                                        >
                                            {/* Shimmer effect */}
                                            <div className="absolute inset-0 w-full h-full -translate-x-[150%] bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:transition-all group-hover:duration-1000 group-hover:ease-in-out group-hover:translate-x-[150%]" />
                                            <span className="relative z-10 flex items-center gap-3 text-[10px] font-bold text-white/80 tracking-[0.3em] uppercase">
                                                Archive Transcript
                                                <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </span>
                                        </a>
                                    </motion.div>
                                </div>

                                {/* Modern Minimalist Close Button */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-6 right-6 p-2 text-white/40 hover:text-white transition-colors hover:rotate-90 duration-300"
                                >
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
