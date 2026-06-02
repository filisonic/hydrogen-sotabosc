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
 * Demo: Roast Club Cafe — public GHL booking widget.
 */
const CALENDAR_ID_BY_SLUG = {
  'roast-club-cafe': 'GksbzZMRs3u8x2r8wpCM',
};

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

  const calendarId =
    CALENDAR_ID_BY_SLUG[slug] || env.PUBLIC_GHL_BOOKING_CALENDAR_ID || null;

  if (!calendarId) return null;
  return `${GHL_BOOKING_WIDGET_BASE}/${calendarId}`;
}
