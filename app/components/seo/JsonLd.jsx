import { useNonce } from '@shopify/hydrogen';

/**
 * @param {{ data: Record<string, unknown> | Record<string, unknown>[] }}
 */
export function JsonLd({ data }) {
  let nonce;
  try {
    nonce = useNonce();
  } catch (error) {
    console.warn('useNonce hook failed in JsonLd, using undefined nonce:', error.message);
    nonce = undefined;
  }
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
