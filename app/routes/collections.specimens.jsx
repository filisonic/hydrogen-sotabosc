import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DirectorySurface } from '~/components/directory/DirectorySurface';
import { useOrganismStore } from '~/lib/store/useOrganismStore';
import { MOCK_SPECIMENS } from '~/lib/world/specimens';
import { SpecimenOverlay } from '~/components/world/SpecimenOverlay';
import { canonicalLinkMeta } from '~/lib/seo/metaHelpers';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [
    { title: 'My Discoveries — Sotabosc' },
    {
      name: 'description',
      content: 'View your discovered specimens from the Sotabosc ecosystem.',
    },
    ...canonicalLinkMeta(window?.location?.origin || '', '/collections/specimens'),
  ];
};

export default function DiscoveredSpecimens() {
  const discoveredSpecimens = useOrganismStore((state) => state.discoveredSpecimens);
  const [selectedSpecimen, setSelectedSpecimen] = useState(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  
  // Get discovered specimen data
  const discoveredSpecimenData = Object.values(MOCK_SPECIMENS).filter(
    specimen => discoveredSpecimens.includes(specimen.id)
  );

  const handleSpecimenClick = (specimen) => {
    setSelectedSpecimen(specimen);
    setIsOverlayOpen(true);
  };

  return (
    <DirectorySurface>
      <div className="min-h-screen pt-20 md:pt-24">
        <section
          className="px-4 pb-8 pt-8 md:pt-10"
          style={{ backgroundColor: 'var(--sotabosc-surface-muted)' }}
        >
          <div className="max-w-6xl mx-auto">
            <nav className="text-sm mb-4" style={{ color: 'var(--sotabosc-muted)' }}>
              <span style={{ color: 'var(--sotabosc-text)' }}>My Discoveries</span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3 font-[family-name:var(--font-display)]">
              Discovered Specimens
            </h1>
            <p className="text-lg max-w-2xl" style={{ color: 'var(--sotabosc-muted)' }}>
              Your personal collection of discovered specimens from the Sotabosc ecosystem.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <div className="text-sm" style={{ color: 'var(--sotabosc-muted)' }}>
                <span className="font-semibold">{discoveredSpecimenData.length}</span> specimens discovered
              </div>
              {discoveredSpecimenData.length > 0 && (
                <div className="text-xs px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                  Collection Active
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="px-4 py-10 md:py-12">
          <div className="max-w-6xl mx-auto">
            {discoveredSpecimenData.length === 0 ? (
              <div className="text-center py-16">
                <div className="mb-6 text-6xl opacity-30">🌱</div>
                <h2 className="text-xl font-semibold mb-3 font-[family-name:var(--font-display)]">
                  No Specimens Discovered Yet
                </h2>
                <p className="text-base max-w-md mx-auto mb-6" style={{ color: 'var(--sotabosc-muted)' }}>
                  Explore the interactive world on the homepage to discover and collect specimens.
                </p>
                <a
                  href="/"
                  className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--sotabosc-accent)',
                    color: 'var(--sotabosc-surface)',
                  }}
                >
                  Start Exploring
                </a>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {discoveredSpecimenData.map((specimen, index) => (
                  <SpecimenCard
                    key={specimen.id}
                    specimen={specimen}
                    index={index}
                    onClick={() => handleSpecimenClick(specimen)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <SpecimenOverlay
          specimen={selectedSpecimen}
          isOpen={isOverlayOpen}
          onClose={() => setIsOverlayOpen(false)}
        />
      </div>
    </DirectorySurface>
  );
}

function SpecimenCard({ specimen, index, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div
        className="rounded-2xl border p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-b from-black/40 to-black/60 backdrop-blur-xl"
        style={{
          borderColor: specimen.color ? `${specimen.color}30` : 'var(--sotabosc-border)',
          boxShadow: specimen.color ? `0 0 20px ${specimen.color}20` : undefined,
        }}
      >
        {/* Image Area */}
        <div
          className="aspect-square rounded-xl mb-4 bg-black/60 flex items-center justify-center overflow-hidden relative"
          style={{
            background: specimen.color 
              ? `radial-gradient(circle at center, ${specimen.color}20 0%, transparent 70%)`
              : 'var(--sotabosc-surface-muted)'
          }}
        >
          {specimen.image ? (
            <img
              src={specimen.image}
              alt={specimen.name}
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-full border text-white/50 flex items-center justify-center text-xs tracking-widest border-white/20"
              style={{ boxShadow: `0 0 20px ${specimen.color || '#333'}` }}
            >
              {specimen.name?.slice(0, 2)?.toUpperCase() || 'SP'}
            </div>
          )}
          
          {/* Subtle glow overlay */}
          <div
            className="absolute inset-0 opacity-20 mix-blend-screen rounded-xl"
            style={{
              background: `radial-gradient(circle at center, ${specimen.color || '#444'} 0%, transparent 70%)`,
            }}
          />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <div className="text-xs font-bold tracking-wider text-white/40 uppercase">
            {specimen.layer || "General"}
          </div>
          <h3 className="text-sm font-serif text-white/90 leading-tight group-hover:text-white transition-colors">
            {specimen.name}
          </h3>
          <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
            {specimen.description || "A mysterious specimen from the Sotabosc ecosystem."}
          </p>
          
          {/* Affinity bar */}
          <div className="pt-2">
            <div className="flex justify-between items-end text-[8px] uppercase font-sans tracking-widest mb-1">
              <span className="text-white/40 font-bold">Affinity</span>
              <span className="text-white/80 font-mono">{specimen.affinity || 45}%</span>
            </div>
            <div className="h-[1px] bg-white/10 relative overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 h-full bg-white/60"
                initial={{ width: 0 }}
                animate={{ width: `${specimen.affinity || 45}%` }}
                transition={{ delay: index * 0.1 + 0.3, duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/** @typedef {import('./+types/collections.specimens').Route} Route */