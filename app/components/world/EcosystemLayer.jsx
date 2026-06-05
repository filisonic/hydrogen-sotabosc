/**
 * Ecosystem layer: title on the open background, specimen hotspots in a dedicated upper “field”
 * (not inside the listing panel), then listings in a separate scrollable region below.
 *
 * @param {string} id
 * @param {string} title
 * @param {string} description
 * @param {React.ReactNode} background
 * @param {React.ReactNode} children — SpecimenNode(s); lives on the forest layer with room to breathe.
 * @param {React.ReactNode} [heroEmbed] — narrative + directory cards; below the specimen field (page scroll, no inner trap).
 * @param {'dark' | 'ink'} [surface] — ink: light B&W scene + dark type; dark: legacy night forest.
 */
export function EcosystemLayer({
  id,
  title,
  description,
  background,
  children,
  heroEmbed,
  className = '',
  surface = 'ink',
}) {
  const ink = surface === 'ink';

  return (
    <div
      data-eco-layer={id}
      data-eco-surface={surface}
      className={`eco-layer-section relative w-full flex flex-col ${className}`}
    >
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">{background}</div>

      <div
        className={`eco-layer-content relative z-10 flex flex-col w-full max-w-7xl mx-auto px-4 pt-1 pb-1 md:pt-1.5 md:pb-1.5 text-center ${
          ink ? 'text-stone-900' : 'text-white'
        }`}
      >
        <div
          className={
            ink
              ? 'shrink-0 max-w-4xl mx-auto rounded-2xl md:rounded-3xl px-3 py-2.5 md:px-6 md:py-3.5 bg-white/72 backdrop-blur-md ring-1 ring-white/70 shadow-[0_12px_40px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.95)]'
              : 'shrink-0 max-w-4xl mx-auto'
          }
        >
          <span
            className={`text-[10px] md:text-xs uppercase tracking-[0.35em] mb-1.5 md:mb-2 block font-sans font-bold ${
              ink
                ? 'text-stone-800 [text-shadow:0_1px_0_rgb(255_255_255/0.9),0_0_12px_rgb(255_255_255/0.5)]'
                : 'opacity-60'
            }`}
          >
            layer // {id}
          </span>
          <h2
            className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif mb-2 md:mb-3 text-balance font-semibold tracking-tight leading-[1.08] ${
              ink
                ? 'text-stone-950 [text-shadow:0_1px_0_rgb(255_255_255/1),0_0_2px_rgb(255_255_255/1),0_2px_24px_rgb(255_255_255/0.55),0_4px_18px_rgb(0_0_0/0.22)]'
                : 'drop-shadow-2xl'
            }`}
          >
            {title}
          </h2>
          {description && (
            <p
              className={`text-sm sm:text-base md:text-xl max-w-2xl md:max-w-3xl mx-auto font-serif leading-relaxed px-0.5 md:px-1 font-medium ${
                ink
                  ? 'text-stone-900 [text-shadow:0_1px_0_rgb(255_255_255/0.95),0_0_14px_rgb(255_255_255/0.45)]'
                  : 'opacity-85 drop-shadow-md'
              }`}
            >
              {description}
            </p>
          )}
        </div>

        {children ? (
          <div
            className="relative z-[15] w-full max-w-6xl mx-auto h-0 pointer-events-none"
            role="presentation"
          >
            <div className="absolute inset-x-0 top-0 flex h-14 md:h-16 items-center justify-center">
              {children}
            </div>
          </div>
        ) : null}

        {heroEmbed ? (
          <div
            className="relative z-20 w-full max-w-6xl mx-auto mt-3 md:mt-4 flex flex-col pointer-events-auto text-left"
            role="region"
            aria-label={`${title} listings`}
          >
            <div
              className={
                ink
                  ? 'rounded-2xl md:rounded-3xl border border-stone-300/70 bg-gradient-to-b from-white/75 via-white/60 to-stone-100/70 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_18px_50px_rgba(0,0,0,0.08)]'
                  : 'rounded-2xl md:rounded-3xl border border-white/16 bg-gradient-to-b from-black/40 via-black/28 to-black/45 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_24px_70px_rgba(0,0,0,0.45)]'
              }
            >
              <div className="p-3 md:p-5">{heroEmbed}</div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
