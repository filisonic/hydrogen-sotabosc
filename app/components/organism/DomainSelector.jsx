import { motion } from 'framer-motion';
import { generateOrganism } from '~/lib/organism/generator';
import { useOrganismStore } from '~/lib/store/useOrganismStore';
import { DOMAIN_KEYS, DOMAINS, getDomain } from '~/lib/directory/domains';
import { MagDomainGlyph } from '~/components/mag/MagEcosphereGlyphs';
/**
 * @param {{ variant?: 'full' | 'strip'; hideStripLabel?: boolean; compact?: boolean; prominent?: boolean; awaitingPick?: boolean; locked?: boolean }} props
 */
export function DomainSelector({
  variant = 'full',
  hideStripLabel = false,
  compact = false,
  prominent = false,
  awaitingPick = false,
  locked = false,
}) {
    const setOrganism = useOrganismStore((s) => s.setOrganism);
    const current = useOrganismStore((s) => s.organism?.domain);

    const handleSelect = (domainId) => {
        if (locked) return;
        const organism = generateOrganism(domainId);
        setOrganism(organism);
    };

    if (variant === 'strip') {
        const stripClass = compact
          ? `domain-strip domain-strip--compact flex-1 min-w-0${prominent ? ' domain-strip--prominent' : ''}${locked ? ' domain-strip--locked' : ''}${awaitingPick ? ' domain-strip--awaiting' : ''}`
          : 'domain-strip w-full max-w-6xl mx-auto px-4 py-2.5';
        const pillClass = prominent
          ? 'domain-strip__pill domain-strip__pill--prominent inline-flex items-center gap-2 rounded-full border-2 px-3 py-2 sm:px-3.5 sm:py-2.5 text-xs sm:text-sm font-extrabold transition-all shrink-0'
          : compact
            ? 'domain-strip__pill inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold transition-all shrink-0'
            : 'domain-strip__pill inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition-all';
        const iconBoxClass = prominent
          ? 'domain-strip__icon inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border-2'
          : compact
            ? 'domain-strip__icon inline-flex h-4 w-4 items-center justify-center rounded border'
            : 'domain-strip__icon inline-flex h-5 w-5 items-center justify-center rounded-md border';
        const glyphSize = prominent ? 20 : compact ? 11 : 13;

        if (locked && current) {
            const d = getDomain(current);
            return (
                <div className={`${stripClass} domain-strip--locked-league`}>
                    <div
                        className={`${pillClass} domain-strip__pill--locked-league`}
                        style={{
                            borderColor: d.color,
                            backgroundColor: `${d.color}22`,
                            color: d.color,
                            boxShadow: `0 0 0 2px ${d.color}44, 0 3px 0 rgba(0,0,0,0.12)`,
                        }}
                        role="status"
                        aria-label={`Locked to ${d.label} league`}
                    >
                        <span
                            className={iconBoxClass}
                            style={{
                                borderColor: `${d.color}88`,
                                backgroundColor: `${d.color}18`,
                            }}
                        >
                            <MagDomainGlyph domainKey={current} color={d.color} size={glyphSize} />
                        </span>
                        <span>{d.role ? `${d.role} · ${d.label}` : d.label} league</span>
                        <span className="domain-strip__lock-badge" aria-hidden>
                            Locked
                        </span>
                    </div>
                </div>
            );
        }

        return (
            <div className={stripClass}>
                <div
                  className={
                    compact
                      ? 'flex items-center gap-1.5 min-w-0'
                      : 'flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4'
                  }
                >
                    {!hideStripLabel ? (
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] shrink-0 opacity-60">
                        Your domain
                      </p>
                    ) : null}
                    <div
                      className={
                        compact
                          ? `domain-strip__pills flex flex-1 min-w-0 overflow-x-auto pb-0.5${prominent ? ' gap-2 sm:gap-2.5' : ' gap-1'}`
                          : 'flex flex-wrap gap-2 flex-1 justify-center sm:justify-start'
                      }
                    >
                        {DOMAIN_KEYS.map((key) => {
                            const d = getDomain(key);
                            const active = current === key;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => handleSelect(key)}
                                    aria-pressed={active}
                                    className={`${pillClass}${active ? ' domain-strip__pill--active' : ''}`}
                                    style={{
                                        borderColor: active ? d.color : 'var(--sotabosc-border, rgba(0,0,0,0.1))',
                                        backgroundColor: active ? `${d.color}1f` : 'var(--sotabosc-surface, #fff)',
                                        color: active ? d.color : 'var(--sotabosc-text, #1a1a1a)',
                                        boxShadow: active ? `0 0 0 2px ${d.color}44` : undefined,
                                    }}
                                >
                                    <span
                                        className={iconBoxClass}
                                        style={{
                                            borderColor: active ? `${d.color}66` : 'var(--sotabosc-border, rgba(0,0,0,0.1))',
                                            backgroundColor: active ? `${d.color}15` : 'transparent',
                                        }}
                                    >
                                        <MagDomainGlyph domainKey={key} color={active ? d.color : 'currentColor'} size={glyphSize} />
                                    </span>
                                    <span className="domain-strip__pill-text">
                                      {d.role ? (
                                        <>
                                          <span className="domain-strip__pill-role">{d.role}</span>
                                          <span className="domain-strip__pill-label">{d.label}</span>
                                        </>
                                      ) : (
                                        d.label
                                      )}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="domain-selector py-20 px-4 max-w-4xl mx-auto relative z-10 w-full">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
            >
                <h2 className="text-5xl font-heading text-white/90 mb-4 tracking-tight">What are you?</h2>
                <p className="text-lg text-white/50 font-serif italic max-w-lg mx-auto">Choose your domain to enter the forest as a unique organism.</p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {DOMAIN_KEYS.map((key, index) => {
                    const domain = DOMAINS[key];
                    return (
                    <motion.button
                        key={key}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        whileHover={{ scale: 1.03, y: -5 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleSelect(key)}
                        className="group relative flex flex-col items-center p-8 bg-[#0a0a0a]/60 backdrop-blur-xl rounded-3xl border border-white/5 hover:border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_40px_rgba(255,255,255,0.05)] transition-all duration-500 overflow-hidden text-center"
                    >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                        <span className="text-4xl mb-6 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] group-hover:scale-110 transition-transform duration-500">{domain.emoji}</span>
                        <h3 className="text-xl font-serif text-white/90 mb-1">{domain.label}</h3>
                        {domain.role ? (
                          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/50 mb-3">
                            {domain.role}
                          </p>
                        ) : null}
                        <p className="text-xs text-white/40 font-sans tracking-wide leading-relaxed">{domain.description}</p>
                    </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
