import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { getDomain } from '~/lib/directory/domains';

/** @type {Record<string, { glyph: string; label: string }>} */
const LAYER_BRIDGE = {
  canopy: { glyph: '🌤', label: 'Canopy' },
  understory: { glyph: '🌿', label: 'Understory' },
  water: { glyph: '🌊', label: 'Currents' },
  soil: { glyph: '🪴', label: 'Soil' },
  bedrock: { glyph: '🗺️', label: 'Bedrock' },
};

/**
 * Compact transition band: layer bridge, trail progress, shop thumbnails, specimen collectibles.
 *
 * @param {{
 *   stepIndex: number;
 *   totalSteps: number;
 *   fromLayer: string;
 *   toLayer: string;
 *   domainKey: string | null;
 *   tone?: 'dark' | 'ink';
 *   shopProducts?: Array<{
 *     id: string;
 *     handle: string;
 *     title: string;
 *     featuredImage?: { url: string; altText?: string | null } | null;
 *   }>;
 *   collectibles?: Array<{ id: string; href: string; image: string; label: string; color: string }>;
 *   embedded?: boolean;
 *   edge?: boolean;
 * }} props
 */
export function JourneySpine({
  stepIndex,
  totalSteps,
  fromLayer,
  toLayer,
  domainKey,
  tone = 'dark',
  shopProducts = [],
  collectibles = [],
  embedded = false,
  edge = false,
}) {
  const ink = tone === 'ink';
  const domainTheme = domainKey ? getDomain(domainKey) : null;
  const accent = domainTheme?.color ?? 'rgba(148, 163, 184, 0.55)';

  const fromMeta = LAYER_BRIDGE[fromLayer] ?? { glyph: '·', label: fromLayer };
  const toMeta = LAYER_BRIDGE[toLayer] ?? { glyph: '·', label: toLayer };

  const leg = stepIndex;

  const ariaLabel = `Trail segment ${leg} of ${totalSteps - 1}. From ${fromMeta.label} to ${toMeta.label}.`;

  const bgInk = `
    radial-gradient(ellipse 120% 80% at 50% 0%, color-mix(in srgb, ${accent} 10%, transparent), transparent 55%),
    radial-gradient(ellipse 90% 60% at 20% 100%, color-mix(in srgb, ${accent} 6%, transparent), transparent 50%),
    linear-gradient(180deg, #f4f2ec 0%, #ebe8e0 50%, #e4e1da 100%)
  `;
  const bgDark = `
    radial-gradient(ellipse 120% 80% at 50% 0%, color-mix(in srgb, ${accent} 22%, transparent), transparent 55%),
    radial-gradient(ellipse 90% 60% at 20% 100%, color-mix(in srgb, ${accent} 12%, transparent), transparent 50%),
    radial-gradient(ellipse 80% 50% at 85% 90%, color-mix(in srgb, ${accent} 10%, transparent), transparent 45%),
    linear-gradient(180deg, rgba(12, 18, 14, 0.92) 0%, rgba(3, 8, 6, 0.97) 50%, rgba(8, 12, 10, 0.94) 100%)
  `;

  const iconFrame =
    'flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border shadow-md transition-transform hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1';
  const iconFrameInk = `${iconFrame} border-stone-300/85 bg-white/90 focus-visible:ring-stone-400 focus-visible:ring-offset-[#f4f2ec]`;
  const iconFrameDark = `${iconFrame} border-white/20 bg-black/45 focus-visible:ring-white/55 focus-visible:ring-offset-[#030806]`;

  const rotatedCollectibles = (() => {
    if (!collectibles.length) return [];
    const k = stepIndex % collectibles.length;
    const rotated = [...collectibles.slice(k), ...collectibles.slice(0, k)];
    return rotated.slice(0, Math.min(4, collectibles.length));
  })();

  const shellClass = embedded
    ? `journey-spine-band journey-spine-band--embedded${edge ? ' journey-spine-band--edge' : ''} relative w-full${edge ? '' : ' px-3 py-1.5 sm:px-4'}`
    : `journey-spine-band relative z-[15] -mb-px overflow-hidden border-y ${ink ? 'border-stone-200/75' : 'border-white/[0.07]'}`;

  const rowClass = embedded && edge
    ? 'journey-spine-band__row journey-spine-band__row--embedded journey-spine-band__row--edge relative z-[1] mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2.5 sm:gap-x-4 sm:px-6'
    : embedded
      ? 'journey-spine-band__row journey-spine-band__row--embedded relative z-[1] mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-xl border border-stone-300/80 bg-white/92 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_10px_28px_rgba(0,0,0,0.08)] backdrop-blur-md sm:gap-x-4 sm:px-4'
      : 'relative z-[1] mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-3 py-1.5 sm:gap-x-4 sm:px-4';

  return (
    <div
      className={shellClass}
      style={embedded ? undefined : {background: ink ? bgInk : bgDark}}
      role="separator"
      aria-label={ariaLabel}
    >
      {!embedded ? (
        <div
          className={`pointer-events-none absolute inset-0 ${ink ? 'opacity-[0.035]' : 'opacity-[0.04]'}`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
      ) : null}

      <div className={rowClass}>
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.span
              className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border text-sm sm:text-base shadow-lg backdrop-blur-sm ${
                ink ? 'border-stone-300/80 bg-white/75' : 'border-white/15 bg-black/40'
              }`}
              style={{ boxShadow: ink ? `0 0 16px ${accent}18` : `0 0 20px ${accent}22` }}
              initial={{ scale: 0.92, opacity: 0.7 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.35 }}
              title={fromMeta.label}
            >
              {fromMeta.glyph}
            </motion.span>

            <div className="relative flex h-7 w-14 sm:w-20 items-center justify-center">
              <div
                className={`absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r ${
                  ink ? 'from-stone-300/40 via-stone-400/55 to-stone-300/40' : 'from-white/25 via-white/45 to-white/25'
                }`}
              />
              <motion.div
                className="absolute h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor: accent,
                  boxShadow: `0 0 12px ${accent}, 0 0 24px ${accent}66`,
                }}
                animate={{ x: [-22, 22, -22], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <svg
                className={`relative z-[1] h-5 w-full ${ink ? 'text-stone-400/70' : 'text-white/30'}`}
                viewBox="0 0 96 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M8 12h80"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeDasharray="3 5"
                />
              </svg>
            </div>

            <motion.span
              className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border text-sm sm:text-base shadow-lg backdrop-blur-md ${
                ink ? 'border-stone-300/90 bg-white/85' : 'border-white/25 bg-black/50'
              }`}
              style={{
                boxShadow: ink ? `0 0 20px ${accent}28` : `0 0 28px ${accent}44, inset 0 0 20px ${accent}14`,
              }}
              initial={{ scale: 0.92, opacity: 0.85 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              title={toMeta.label}
            >
              {toMeta.glyph}
            </motion.span>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5" aria-hidden>
            {Array.from({ length: totalSteps }, (_, i) => {
              const done = i < leg;
              const entering = i === leg;
              const upcoming = i > leg;
              const idleBorder = ink ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)';
              const idleBg = ink ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)';
              return (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <motion.span
                    className="block rounded-full border transition-colors"
                    style={{
                      width: entering ? 8 : 6,
                      height: entering ? 8 : 6,
                      borderColor: done || entering ? `${accent}99` : idleBorder,
                      backgroundColor: done ? accent : entering ? `${accent}55` : idleBg,
                      boxShadow:
                        entering || done
                          ? `0 0 10px ${entering ? `${accent}88` : `${accent}44`}`
                          : 'none',
                    }}
                    animate={entering ? { scale: [1, 1.12, 1] } : {}}
                    transition={entering ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
                  />
                  <span
                    className={`hidden text-[6px] font-semibold uppercase tracking-wider sm:block ${
                      ink ? 'text-stone-400' : 'text-white/25'
                    }`}
                  >
                    {upcoming ? '·' : done ? '✓' : '→'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {shopProducts.length > 0 ? (
            <div className="flex items-center gap-2" aria-label="Store picks">
              <span
                className={`hidden text-[8px] font-bold uppercase tracking-[0.2em] sm:inline ${
                  embedded || ink ? 'text-stone-600' : 'text-white/35'
                }`}
              >
                Shop
              </span>
              <div className="flex items-center gap-1.5">
                {shopProducts.map((p) => (
                  <Link
                    key={p.id}
                    to={`/products/${p.handle}`}
                    title={p.title}
                    className={ink ? iconFrameInk : iconFrameDark}
                  >
                    {p.featuredImage?.url ? (
                      <img
                        src={p.featuredImage.url}
                        alt={p.featuredImage.altText || ''}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span className={`text-[10px] font-bold ${ink ? 'text-stone-500' : 'text-white/50'}`}>◇</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <Link
              to="/collections"
              className={`text-[9px] font-bold uppercase tracking-wider ${
                embedded || ink
                  ? 'text-stone-800 hover:text-stone-950'
                  : 'text-white/40 hover:text-white/65'
              }`}
            >
              Browse shop →
            </Link>
          )}

          {rotatedCollectibles.length > 0 ? (
            <div className="flex items-center gap-2" aria-label="Trail collectibles">
              <span
                className={`hidden text-[8px] font-bold uppercase tracking-[0.2em] sm:inline ${
                  embedded || ink ? 'text-stone-600' : 'text-white/35'
                }`}
              >
                Finds
              </span>
              <div className="flex items-center gap-1.5">
                {rotatedCollectibles.map((c) => (
                  <Link
                    key={c.id}
                    to={c.href}
                    title={c.label}
                    className={ink ? iconFrameInk : iconFrameDark}
                  >
                    <img
                      src={c.image}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                      style={{ backgroundColor: `${c.color}33` }}
                    />
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
