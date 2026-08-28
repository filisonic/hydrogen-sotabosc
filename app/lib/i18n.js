/** @typedef {{language: string; country: string}} StoreLocale */

const DEFAULT_LOCALE = {
  language: 'EN',
  country: 'ES',
};

/**
 * Storefront locale for Shopify @inContext pricing.
 * Override in Oxygen with PUBLIC_STORE_COUNTRY / PUBLIC_STORE_LANGUAGE if needed.
 *
 * @param {Record<string, string | undefined>} [env]
 * @returns {StoreLocale}
 */
export function getStoreLocale(env = {}) {
  const language = (env.PUBLIC_STORE_LANGUAGE || DEFAULT_LOCALE.language).toUpperCase();
  const country = (env.PUBLIC_STORE_COUNTRY || DEFAULT_LOCALE.country).toUpperCase();

  return {language, country};
}

/**
 * @param {StoreLocale} locale
 * @returns {{countryCode: string}}
 */
export function getBuyerIdentity(locale) {
  return {countryCode: locale.country};
}
