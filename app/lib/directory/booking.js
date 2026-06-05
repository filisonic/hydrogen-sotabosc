/** GoHighLevel / LeadConnector booking widget base URL */
export const GHL_BOOKING_WIDGET_BASE =
  'https://api.leadconnectorhq.com/widget/booking';

/** Live demo listing — real iframe embed for prospects */
export const BOOKING_DEMO_PLACE_SLUG = 'roast-club-cafe';

/**
 * Per-listing calendar IDs (OAuth-provisioned calendars added here or via DB later).
 * Only slugs listed here get a real booking widget; all others see BookingPreviewTeaser.
 */
const CALENDAR_ID_BY_SLUG = {
  [BOOKING_DEMO_PLACE_SLUG]: 'GksbzZMRs3u8x2r8wpCM',
};

const BOOKING_DISABLED_BY_SLUG = {};

/**
 * @param {string} slug
 * @returns {boolean}
 */
export function hasActiveBookingCalendar(slug) {
  if (BOOKING_DISABLED_BY_SLUG[slug]) return false;
  return Boolean(CALENDAR_ID_BY_SLUG[slug]);
}

/**
 * @param {string} slug
 * @returns {string | null}
 */
function resolveCalendarId(slug) {
  return CALENDAR_ID_BY_SLUG[slug] || null;
}

/**
 * @param {string} slug
 * @returns {string | null} Full widget URL when this listing has its own calendar
 */
export function getBookingWidgetUrl(slug) {
  const calendarId = resolveCalendarId(slug);
  if (!calendarId) return null;
  return `${GHL_BOOKING_WIDGET_BASE}/${calendarId}`;
}

/**
 * @param {string} slug
 * @returns {{ widgetUrl: string, embedMode: 'iframe' } | null}
 */
export function getBookingForPlace(slug) {
  if (!hasActiveBookingCalendar(slug)) return null;

  const widgetUrl = getBookingWidgetUrl(slug);
  if (!widgetUrl) return null;

  return {widgetUrl, embedMode: 'iframe'};
}
