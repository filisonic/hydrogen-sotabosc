/** GoHighLevel / LeadConnector booking widget base URL */
export const GHL_BOOKING_WIDGET_BASE =
  'https://api.leadconnectorhq.com/widget/booking';

/**
 * Manual control switches.
 * - ENABLED slugs always show booking.
 * - DISABLED slugs never show booking.
 */
const BOOKING_ENABLED_BY_SLUG = {
  'roast-club-cafe': true,
};

const BOOKING_DISABLED_BY_SLUG = {};

/**
 * Per-listing calendar IDs (OAuth-provisioned calendars added here or via env map).
 * Demo: Roast Club Cafe — calendar configured for iframe embed on Sotabosc.
 */
const CALENDAR_ID_BY_SLUG = {
  'roast-club-cafe': 'GksbzZMRs3u8x2r8wpCM',
};

/**
 * @param {string} slug
 * @param {Record<string, string | undefined>} [env]
 * @returns {string | null}
 */
function resolveCalendarId(slug, env = {}) {
  return CALENDAR_ID_BY_SLUG[slug] || env.PUBLIC_GHL_BOOKING_CALENDAR_ID || null;
}

/**
 * GHL only allows iframe embed for some calendars (X-Frame-Options).
 * Per-slug calendars are assumed embed-ready; shared env calendar opens in a new tab
 * unless PUBLIC_GHL_BOOKING_EMBED_IFRAME=true after you enable embed in GHL.
 *
 * @param {string} slug
 * @param {Record<string, string | undefined>} [env]
 * @returns {'iframe' | 'external'}
 */
export function getBookingEmbedMode(slug, env = {}) {
  if (CALENDAR_ID_BY_SLUG[slug]) return 'iframe';
  if (env.PUBLIC_GHL_BOOKING_EMBED_IFRAME === 'true') return 'iframe';
  return 'external';
}

/**
 * Booking appears only when a listing is considered bookable.
 * Default policy: listing has at least one event.
 *
 * @param {string} slug Place slug from directory seed
 * @param {Array<unknown>} [events=[]] Events linked to the listing
 * @returns {boolean}
 */
export function isBookingEnabledForPlace(slug, events = []) {
  if (BOOKING_DISABLED_BY_SLUG[slug]) return false;
  if (BOOKING_ENABLED_BY_SLUG[slug]) return true;
  return Array.isArray(events) && events.length > 0;
}

/**
 * @param {string} slug Place slug from directory seed
 * @param {Array<unknown>} [events=[]] Events linked to the listing
 * @param {Record<string, string | undefined>} [env] Hydrogen context.env
 * @returns {string | null} Full iframe src URL, or null when booking is hidden
 */
export function getBookingWidgetUrl(slug, events = [], env = {}) {
  if (!isBookingEnabledForPlace(slug, events)) return null;

  const calendarId = resolveCalendarId(slug, env);
  if (!calendarId) return null;
  return `${GHL_BOOKING_WIDGET_BASE}/${calendarId}`;
}

/**
 * @param {string} slug
 * @param {Array<unknown>} [events=[]]
 * @param {Record<string, string | undefined>} [env]
 * @returns {{ widgetUrl: string, embedMode: 'iframe' | 'external' } | null}
 */
export function getBookingForPlace(slug, events = [], env = {}) {
  const widgetUrl = getBookingWidgetUrl(slug, events, env);
  if (!widgetUrl) return null;

  return {
    widgetUrl,
    embedMode: getBookingEmbedMode(slug, env),
  };
}
