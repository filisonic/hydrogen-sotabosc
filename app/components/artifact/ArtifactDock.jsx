import { useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrganismStore } from '~/lib/store/useOrganismStore';
import { getDomainTheme } from '~/lib/theme/domainTheme';
import { OrganismPortrait } from '~/components/organism/OrganismPortrait';
import { getStageForXP, getNextStage, getProgressToNext } from '~/lib/organism/progression';

const ACTION_LABELS = {
  listing_view: 'Place visited',
  event_view: 'Event viewed',
  creator_view: 'Creator viewed',
  review_create: 'Review shared',
  store_click: 'Store opened',
  purchase: 'Purchase',
};

export function ArtifactDock() {
  const [open, setOpen] = useState(false);
  const organism = useOrganismStore((s) => s.organism);
  const totalXP = useOrganismStore((s) => s.totalXP);
  const activities = useOrganismStore((s) => s.activities);
  const discoveredSpecimens = useOrganismStore((s) => s.discoveredSpecimens);
  const clearOrganism = useOrganismStore((s) => s.clearOrganism);

  const theme = organism ? getDomainTheme(organism.domain) : null;

  if (!organism || !theme) {
    return (
      <div className="fixed bottom-4 right-4 z-[400] max-w-[min(100vw-2rem,18rem)] pointer-events-none">
        <Link
          to="/#domain-strip"
          className="pointer-events-auto block rounded-2xl border px-4 py-3 text-xs font-bold shadow-xl backdrop-blur-md"
          style={{
            backgroundColor: 'var(--sotabosc-surface)',
            borderColor: 'var(--sotabosc-border)',
            color: 'var(--sotabosc-text)',
          }}
        >
          Tap a domain above to spawn your artifact — then collect specimens on the trail.
        </Link>
      </div>
    );
  }
  const stage = getStageForXP(totalXP);
  const next = getNextStage(totalXP);
  const progress = getProgressToNext(totalXP);
  const visitCount = activities.filter((a) => a.actionType === 'listing_view').length;
  const eventCount = activities.filter((a) => a.actionType === 'event_view').length;
  const reviewCount = activities.filter((a) => a.actionType === 'review_create').length;

  return (
    <div className="fixed bottom-4 right-4 z-[400] flex flex-col items-end gap-2 pointer-events-none">
      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto w-[min(100vw-2rem,22rem)] rounded-2xl border shadow-2xl overflow-hidden"
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border,
              color: theme.text,
              boxShadow: `0 25px 50px -12px ${theme.accentSoft}33`,
            }}
          >
            <div
              className="px-4 py-3 flex items-center gap-3 border-b"
              style={{ borderColor: theme.border, backgroundColor: theme.surfaceMuted }}
            >
              <OrganismPortrait
                src={organism.image}
                emoji={theme.emoji}
                alt={organism.displayName}
                size="md"
                accent={theme.accentSoft}
                borderColor={theme.border}
                fallbackSurface={theme.surfaceMuted}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-50">Your artifact</p>
                <p className="font-bold text-sm truncate">{organism.displayName}</p>
                <p className="text-xs opacity-60 truncate">{organism.species}</p>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold">
                    {stage.emoji} {stage.label}
                  </span>
                  <span className="opacity-60">
                    Resonance {next ? `${totalXP} → ${next.minXP}` : `${totalXP} max`}
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.surfaceMuted }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%`, backgroundColor: theme.accent }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <StatChip label="Places" value={visitCount} />
                <StatChip label="Events" value={eventCount} />
                <StatChip label="Reviews" value={reviewCount} />
                <StatChip label="Specimens" value={discoveredSpecimens.length} />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-2">Recent trail</p>
                <ul className="space-y-1.5 max-h-28 overflow-y-auto text-[11px]">
                  {activities.slice(0, 6).length === 0 ? (
                    <li className="opacity-50 italic">Scroll the city — activity builds resonance.</li>
                  ) : (
                    activities.slice(0, 6).map((a) => (
                      <li key={`${a.timestamp}-${a.targetId}`} className="opacity-80 flex gap-2">
                        <span className="opacity-40 shrink-0">
                          {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span>{ACTION_LABELS[a.actionType] || a.actionType}</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <Link
                  to="/city"
                  className="text-[11px] font-bold px-3 py-2 rounded-lg text-white"
                  style={{ backgroundColor: theme.accent }}
                >
                  Directory
                </Link>
                <Link
                  to="/collections/all"
                  className="text-[11px] font-bold px-3 py-2 rounded-lg border"
                  style={{ borderColor: theme.border, color: theme.text }}
                >
                  Collection
                </Link>
                <Link to="/gallery" className="text-[11px] font-bold px-3 py-2 rounded-lg border border-transparent underline opacity-70">
                  Gallery
                </Link>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Reseed your artifact? Resonance resets.')) clearOrganism();
                }}
                className="text-[10px] uppercase tracking-widest w-full text-center opacity-40 hover:opacity-70 pt-2"
              >
                Reseed artifact
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen(!open)}
        whileTap={{ scale: 0.97 }}
        className="pointer-events-auto flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-xl"
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.border,
          color: theme.text,
        }}
      >
        <OrganismPortrait
          src={organism.image}
          emoji={theme.emoji}
          alt={organism.displayName}
          size="sm"
          accent={theme.accentSoft}
          borderColor={theme.border}
          fallbackSurface={theme.surface}
        />
        <div className="text-left min-w-0 max-w-[10rem]">
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-50">Artifact</p>
          <p className="text-sm font-bold leading-tight truncate">{organism.displayName}</p>
          <p className="text-[11px] opacity-70 leading-tight truncate">
            {stage.emoji} {stage.label} · {totalXP} XP
          </p>
        </div>
        <span className="text-lg opacity-50">{open ? '↓' : '↑'}</span>
      </motion.button>
    </div>
  );
}

function StatChip({ label, value }) {
  return (
    <div className="rounded-lg px-2 py-1.5 bg-black/[0.04] text-center">
      <p className="font-bold tabular-nums">{value}</p>
      <p className="opacity-50">{label}</p>
    </div>
  );
}
