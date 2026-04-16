import { motion } from 'framer-motion';
import { useOrganismStore } from '~/lib/store/useOrganismStore';
import { Link } from 'react-router';
import { getStageForXP, getNextStage, getProgressToNext } from '~/lib/organism/progression';
import { getDomainTheme } from '~/lib/theme/domainTheme';
import { OrganismPortrait } from '~/components/organism/OrganismPortrait';

/**
 * OrganismCard Component
 * Displays the current identity metadata with a premium, ephemeral aesthetic.
 */
export function OrganismCard() {
    const { organism, discoveredSpecimens, clearOrganism, totalXP } = useOrganismStore();
    const discoveryCount = discoveredSpecimens.length;

    if (!organism) return null;

    const ageDays = Math.floor((Date.now() - organism.createdAt) / 86400000);
    const stage = getStageForXP(totalXP);
    const nextStage = getNextStage(totalXP);
    const progress = getProgressToNext(totalXP);
    const domainTheme = getDomainTheme(organism.domain);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20, rotateX: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="organism-card p-10 bg-[#060606]/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] max-w-md w-full relative overflow-hidden group"
            style={{ perspective: 1000 }}
        >
            {/* Subtle noise overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

            {/* Generative Evolution Graphic */}
            <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-20">
                <EvoGraphic count={discoveryCount} theme={organism.domain} />
            </div>

            {/* Decorative Gradient Blob - Changes color based on evolution */}
            <div
                className={`absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[80px] transition-all duration-1000 mix-blend-screen ${discoveryCount > 3 ? 'bg-fuchsia-600/30' :
                    discoveryCount > 1 ? 'bg-indigo-600/20' :
                        'bg-sky-600/20'
                    }`}
            />

            <header className="relative z-10 mb-8 flex justify-between items-start pt-6">
                <div className="flex gap-6 items-center">
                    <OrganismPortrait
                        src={organism.image}
                        emoji={domainTheme.emoji}
                        alt={organism.displayName}
                        size="lg"
                        accent={domainTheme.accentSoft}
                        borderColor="rgba(255,255,255,0.12)"
                        fallbackSurface="rgba(0,0,0,0.45)"
                        className="shadow-inner bg-black/40"
                    />
                    <div>
                        <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40 block mb-1">ECOLOGICAL IDENTITY</span>
                        <h1 className="text-3xl font-heading text-white/90 leading-none">{organism.displayName}</h1>
                        <p className="text-sm italic text-white/60 font-medium mt-1">{organism.species}</p>
                    </div>
                </div>
                <button
                    onClick={clearOrganism}
                    className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white transition-colors"
                >
                    Reseed
                </button>
            </header>

            <div className="relative z-10 space-y-6">
                <section>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-white/40 block mb-2">DOMAIN</span>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-white/5 text-white/90 text-xs font-bold border border-white/10 shadow-inner">
                            {organism.domain}
                        </span>
                    </div>
                </section>

                <div className="grid grid-cols-2 gap-4">
                    <section>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-white/40 block mb-2">AGE (CYCLES)</span>
                        <p className="text-xl font-medium tabular-nums text-white/80">{ageDays} days</p>
                    </section>
                    <section>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-white/40 block mb-2">HABITAT</span>
                        <p className="text-xs text-white/60 leading-relaxed">{organism.habitat}</p>
                    </section>
                </div>

                <section className="pt-6 border-t border-white/10">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-white/40 block mb-2">ECOLOGICAL ROLE</span>
                    <p className="text-sm text-white/70 leading-relaxed font-light">{organism.role}</p>
                </section>

                <section className="pt-6 border-t border-white/10">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-white/40">GROWTH STAGE</span>
                        <span className="text-xs font-bold text-white/60">{stage.emoji} {stage.label}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                            className="h-full rounded-full bg-white/40"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                        />
                    </div>
                    <p className="text-[10px] text-white/30 mt-1.5 text-right">
                        {nextStage ? `${totalXP} XP · next: ${nextStage.label} at ${nextStage.minXP}` : `${totalXP} XP · Elder achieved`}
                    </p>
                </section>
            </div>

            <footer className="mt-12 flex items-center justify-between gap-4 relative z-10">
                <Link
                    to="/gallery"
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-2xl text-[10px] font-bold tracking-[0.2em] text-white/90 text-center uppercase transition-all shadow-inner"
                >
                    View Gallery
                </Link>
                <div className="flex-1 text-[10px] text-white/30 text-center tracking-widest uppercase italic">
                    The forest remembers you.
                </div>
            </footer>
        </motion.div>
    );
}

/**
 * EvoGraphic - Generative SVG component that evolves with discovery count
 */
function EvoGraphic({ count, theme }) {
    // Determine visual primitives based on domain
    const isFungi = theme?.toLowerCase().includes('fungi');
    const isPlant = theme?.toLowerCase().includes('plant');

    return (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="transition-all duration-1000 text-cyan-900">
            {/* Base Ring - Always present */}
            <circle cx="60" cy="60" r="40" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" className="opacity-20" />

            {/* Level 1: Core Pulse (0+ discoveries) */}
            <motion.circle
                animate={{
                    r: [25, 28, 25],
                    opacity: [0.1, 0.3, 0.1]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                cx="60" cy="60" r="25"
                stroke="currentColor" strokeWidth="1"
            />

            {/* Level 2: Geometric Orbitals (2+ discoveries) */}
            {count >= 2 && (
                <motion.g
                    animate={{ rotate: 360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                >
                    <rect x="40" y="40" width="40" height="40" stroke="currentColor" strokeWidth="0.5" className="opacity-30" />
                    <circle cx="60" cy="20" r="3" fill="currentColor" className="opacity-40" />
                    <circle cx="60" cy="100" r="3" fill="currentColor" className="opacity-40" />
                </motion.g>
            )}

            {/* Level 3: Mycelial/Botanical Filaments (4+ discoveries) */}
            {count >= 4 && (
                <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {[...Array(6)].map((_, i) => (
                        <motion.path
                            key={i}
                            d={`M60 60 C ${60 + Math.cos(i) * 20} ${60 + Math.sin(i) * 20}, ${70 + Math.cos(i) * 30} ${70 + Math.sin(i) * 30}, ${60 + Math.cos(i) * 50} ${60 + Math.sin(i) * 50}`}
                            stroke="currentColor"
                            strokeWidth="0.5"
                            className="opacity-20"
                            animate={{ pathLength: [0, 1, 0] }}
                            transition={{ duration: 5, delay: i * 0.5, repeat: Infinity }}
                        />
                    ))}
                </motion.g>
            )}

            {/* Level 4: Master Symmetry (6+ discoveries) */}
            {count >= 6 && (
                <motion.circle
                    animate={{
                        scale: [0.8, 1.2, 0.8],
                        rotate: [0, 180, 360]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    cx="60" cy="60" r="55"
                    stroke="currentColor"
                    strokeWidth="0.2"
                    strokeDasharray="1 8"
                    className="opacity-50"
                />
            )}
        </svg>
    );
}
