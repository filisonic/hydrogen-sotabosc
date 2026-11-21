import { useState } from 'react';

/**
 * Remote preview for directory cards: if the URL fails (CSP, 404, network),
 * try `fallbackSrc` (stock photo), then the React `fallback` node.
 *
 * @param {'aurelia' | 'none'} [treatment] — `aurelia`: Figma Aurelia-style grade + canvas grain.
 */
export function DirectoryPreviewImage({
  src,
  alt,
  className = '',
  fallback,
  fallbackSrc,
  treatment = 'aurelia',
}) {
  const [stage, setStage] = useState(/** @type {'primary' | 'stock' | 'done'} */ ('primary'));

  const activeSrc =
    stage === 'primary' && src
      ? src
      : stage !== 'done' && fallbackSrc
        ? fallbackSrc
        : null;

  if (!activeSrc) {
    return fallback ?? null;
  }

  const img = (
    <img
      src={activeSrc}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => {
        if (stage === 'primary' && fallbackSrc && fallbackSrc !== src) {
          setStage('stock');
        } else {
          setStage('done');
        }
      }}
    />
  );

  if (treatment === 'none') {
    return img;
  }

  return <div className="sotabosc-aurelia-photo absolute inset-0">{img}</div>;
}
