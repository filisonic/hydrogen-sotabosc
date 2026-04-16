import { useState } from 'react';

/**
 * Remote preview for directory cards: if the URL fails (CSP, 404, network), show fallback.
 *
 * @param {'aurelia' | 'none'} [treatment] — `aurelia`: Figma Aurelia-style grade + canvas grain (see aurelia-imagery.css).
 */
export function DirectoryPreviewImage({ src, alt, className = '', fallback, treatment = 'aurelia' }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return fallback;
  }

  const img = (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer-when-downgrade"
      onError={() => setFailed(true)}
    />
  );

  if (treatment === 'none') {
    return img;
  }

  return <div className="sotabosc-aurelia-photo absolute inset-0">{img}</div>;
}
