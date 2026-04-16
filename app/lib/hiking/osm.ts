/**
 * Open the main map at a trail area (browse-only; no tiles embedded here).
 * @see https://www.openstreetmap.org/copyright
 */
export function openStreetMapBrowseUrl(lat: number, lon: number, zoom = 13) {
  return `https://www.openstreetmap.org/#map=${zoom}/${lat}/${lon}`;
}
