const SITE_NAME = 'Sotabosc';

/** @param {string} title */
export function pageTitle(title) {
  if (!title?.trim()) return SITE_NAME;
  return `${title.trim()} — ${SITE_NAME}`;
}

export {SITE_NAME};
