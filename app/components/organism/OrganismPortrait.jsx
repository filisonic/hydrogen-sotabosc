import { useState } from 'react';

/**
 * Avatar for the user's organism / artifact — framed glow, graceful fallback if asset fails.
 */
export function OrganismPortrait({
  src,
  emoji,
  alt = '',
  size = 'md',
  accent,
  borderColor,
  /** Shown behind emoji when there is no image (or load failed). */
  fallbackSurface = 'rgba(0,0,0,0.06)',
  className = '',
}) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  const box =
    size === 'sm'
      ? 'w-10 h-10 rounded-xl'
      : size === 'lg'
        ? 'w-20 h-20 rounded-2xl'
        : 'w-12 h-12 rounded-xl';

  return (
    <div
      className={`relative shrink-0 overflow-hidden ${box} ${className}`}
      style={{
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: borderColor || 'rgba(255,255,255,0.12)',
        boxShadow: accent
          ? `0 4px 20px -6px ${accent}55, 0 0 0 2px ${accent}22 inset`
          : undefined,
        backgroundColor: showImage ? undefined : fallbackSurface,
      }}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className={`flex h-full w-full items-center justify-center select-none ${
            size === 'lg' ? 'text-4xl' : size === 'sm' ? 'text-xl' : 'text-2xl'
          }`}
          aria-hidden
        >
          {emoji || '🌿'}
        </span>
      )}
    </div>
  );
}
