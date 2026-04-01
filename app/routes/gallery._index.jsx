import { useOrganismStore } from '~/lib/store/useOrganismStore';
import { MOCK_SPECIMENS } from '~/lib/world/specimens';
import { OrganismCard } from '~/components/organism/OrganismCard';
import { motion } from 'framer-motion';
import { Link } from 'react-router';

export default function GalleryPage() {
    const { organism, discoveredSpecimens, clearOrganism } = useOrganismStore();

    // Filter mock specimens to only show discovered ones
    const discoveredData = Object.values(MOCK_SPECIMENS).filter(s =>
        discoveredSpecimens.includes(s.id)
    );

    // Calculate depth based on layer of last discovered specimen or 0
    const layers = ['sky', 'canopy', 'understory', 'water', 'soil', 'bedrock'];
    const maxLayerIndex = discoveredData.reduce((max, s) => {
        const idx = layers.indexOf(s.layer);
        return idx > max ? idx : max;
    }, -1);
    const depthLevel = maxLayerIndex === -1 ? 'Atmospheric' : layers[maxLayerIndex].charAt(0).toUpperCase() + layers[maxLayerIndex].slice(1);
    const depthProgress = ((maxLayerIndex + 1) / layers.length) * 100;

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12 overflow-x-hidden font-sans">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <Link to="/" className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-40 hover:opacity-100 transition-opacity mb-6 inline-block">
                            ← Back to World
                        </Link>
                        <h1 className="text-5xl md:text-7xl font-serif leading-tight">
                            Symbiosis <span className="text-cyan-400 font-sans italic font-light">Gallery</span>
                        </h1>
                    </div>

                    <div className="text-left md:text-right">
                        <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-30 mb-2">Total Discoveries</p>
                        <p className="text-4xl font-mono text-cyan-400">{discoveredData.length} <span className="text-white/20">/</span> {Object.keys(MOCK_SPECIMENS).length}</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-16">
                    {/* Left Column: Identity Card & Stats */}
                    <div className="xl:col-span-4 flex flex-col gap-8">
                        <div className="xl:sticky xl:top-12">
                            <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-30 mb-6">Current Identity</h2>

                            {organism ? (
                                <OrganismCard />
                            ) : (
                                <div className="p-10 bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-dashed border-white/20 text-center">
                                    <p className="text-sm opacity-40 italic mb-6">No identity seeded yet.</p>
                                    <Link to="/" className="inline-block px-6 py-2 bg-cyan-500 text-white rounded-full text-xs font-bold uppercase tracking-widest">
                                        Seed Identity
                                    </Link>
                                </div>
                            )}

                            <div className="mt-8 p-10 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-xl">
                                <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-30 mb-8">Ecological Progress</h3>
                                <div className="space-y-8">
                                    <StatRow
                                        label="Mycelial Affinity"
                                        value={`${Math.min(100, discoveredData.length * 15)}%`}
                                        progress={Math.min(100, discoveredData.length * 15)}
                                    />
                                    <StatRow
                                        label="Biomass Sync"
                                        value={`${(discoveredData.length * 2.4).toFixed(1)}kg`}
                                        progress={Math.min(100, discoveredData.length * 10)}
                                    />
                                    <StatRow
                                        label="Layer Depth"
                                        value={depthLevel}
                                        progress={depthProgress}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Specimen Grid */}
                    <div className="xl:col-span-8">
                        <div className="flex items-center justify-between mb-8 px-4">
                            <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-30">Collected Specimens</h2>
                            {discoveredData.length > 0 && (
                                <span className="text-[10px] font-mono opacity-20 uppercase">Staggered Archive View</span>
                            )}
                        </div>

                        {discoveredData.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {discoveredData.map((specimen, i) => (
                                    <SpecimenGridItem key={specimen.id} specimen={specimen} index={i} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-40 text-center bg-white/5 rounded-[3rem] border border-dashed border-white/10 backdrop-blur-sm">
                                <div className="w-16 h-16 bg-white/5 rounded-full mx-auto mb-6 flex items-center justify-center">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="opacity-20">
                                        <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <p className="text-xl opacity-30 font-serif italic mb-2">The forest holds many secrets.</p>
                                <p className="text-xs opacity-20 uppercase tracking-widest mb-8">Discover specimens to populate your gallery.</p>
                                <Link to="/" className="inline-block px-10 py-4 bg-white/10 hover:bg-white text-white hover:text-black rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-500 shadow-xl">
                                    Begin Descent
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <footer className="mt-32 pt-16 border-t border-white/5 text-center">
                <p className="text-[10px] opacity-20 tracking-[0.5em] uppercase italic">
                    All life is interconnected within the Sotabosc.
                </p>
            </footer>
        </div>
    );
}

function StatRow({ label, value, progress }) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-end">
                <span className="text-[10px] opacity-40 uppercase tracking-wider font-bold">{label}</span>
                <span className="text-sm font-mono text-cyan-400">{value}</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400"
                />
            </div>
        </div>
    );
}

function SpecimenGridItem({ specimen, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.15, type: 'spring', damping: 20 }}
            className={`p-8 bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 hover:border-white/30 transition-all duration-500 group cursor-pointer relative overflow-hidden shadow-xl ${index % 3 === 1 ? 'lg:mt-12' : index % 3 === 2 ? 'lg:mt-24' : 'mt-0'
                }`}
        >
            {/* Hover Glow */}
            <div
                className="absolute -inset-2 opacity-0 group-hover:opacity-10 transition-opacity blur-2xl"
                style={{ backgroundColor: specimen.color }}
            />

            <div className="aspect-square rounded-3xl mb-8 relative z-10 flex items-center justify-center bg-black/30 overflow-hidden">
                <div
                    className="absolute inset-0 opacity-10 blur-3xl scale-150"
                    style={{ backgroundColor: specimen.color }}
                />
                <motion.div
                    animate={{
                        scale: [1, 1.05, 1],
                        filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)'],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="w-full h-full relative z-10"
                >
                    {specimen.image ? (
                        <img
                            src={specimen.image}
                            alt={specimen.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div
                            className="w-20 h-20 rounded-full shadow-2xl mx-auto mt-16 border-4 border-white/40 ring-4 ring-white/10"
                            style={{ backgroundColor: specimen.color }}
                        />
                    )}
                </motion.div>
            </div>

            <div className="relative z-10">
                <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-cyan-400/60 block mb-2">{specimen.layer}</span>
                <h3 className="text-2xl font-serif text-white/90 mb-6 group-hover:text-white transition-colors uppercase leading-tight">{specimen.name}</h3>

                <Link
                    to={specimen.productUrl}
                    className="flex h-12 items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] uppercase font-bold tracking-widest text-white/40 group-hover:bg-cyan-500 group-hover:text-white group-hover:border-transparent transition-all duration-500"
                >
                    Portal to Archive
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </Link>
            </div>
        </motion.div>
    );
}
