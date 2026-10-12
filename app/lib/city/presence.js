/**
 * Simulated presence — no accounts, no sensors, no chat.
 * Size drifts with the Barcelona hour so a room feels busier at night.
 */
function barcelonaHour(date) {
  return Number(
    new Intl.DateTimeFormat('en-GB', {
      hour: 'numeric',
      hour12: false,
      timeZone: 'Europe/Madrid',
    }).format(date),
  );
}

function hashSlug(slug) {
  let n = 7;
  for (const c of slug) n = (n * 33 + c.charCodeAt(0)) >>> 0;
  return n;
}

/** How many silhouettes this gathering shows right now. */
export function gatheringPresence(slug, date = new Date()) {
  const hour = barcelonaHour(date);
  const salt = hashSlug(slug);
  const base = 6 + (salt % 10);
  const evening = hour >= 17 && hour < 23;
  const afternoon = hour >= 12 && hour < 17;
  const extra = evening ? 8 + (salt % 6) : afternoon ? 4 : hour >= 8 ? 2 : 1;
  return base + extra;
}

/** Soft city-wide count for the plaza — not a real headcount. */
export function cityPresence(date = new Date()) {
  const hour = barcelonaHour(date);
  const minute = date.getMinutes();
  if (hour >= 18 && hour < 23) return 32 + (minute % 11);
  if (hour >= 11 && hour < 18) return 18 + (minute % 7);
  if (hour >= 8) return 9 + (minute % 5);
  return 4 + (minute % 3);
}
