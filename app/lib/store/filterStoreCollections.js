/** Shopify auto-creates a front-page collection; hide it from public store UI. */
const EXCLUDED_COLLECTION_HANDLES = new Set([
  'home-page',
  'frontpage',
  'homepage',
]);

/**
 * @param {ReadonlyArray<{handle?: string | null}>} collections
 */
export function filterStoreCollections(collections) {
  return collections.filter((collection) => {
    const handle = collection.handle?.toLowerCase();
    return handle && !EXCLUDED_COLLECTION_HANDLES.has(handle);
  });
}
