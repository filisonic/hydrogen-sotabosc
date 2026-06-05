/**
 * Verifies Shopify webhook HMAC (base64-encoded SHA256).
 * Uses Web Crypto so this runs in Oxygen / Mini Oxygen workers (no node:crypto).
 */
export async function verifyShopifyWebhook(
  request: Request,
  secret: string | undefined,
  rawBody: string,
): Promise<boolean> {
  if (!secret) return false;

  const hmacHeader = request.headers.get('X-Shopify-Hmac-Sha256');
  if (!hmacHeader) return false;

  const digest = await hmacSha256Base64(secret, rawBody);
  const expected = base64ToBytes(digest);
  const received = base64ToBytes(hmacHeader);

  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}

async function hmacSha256Base64(secret: string, body: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    {name: 'HMAC', hash: 'SHA-256'},
    false,
    ['sign'],
  );
  const signature = await globalThis.crypto.subtle.sign('HMAC', key, enc.encode(body));
  return bytesToBase64(new Uint8Array(signature));
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!;
  return diff === 0;
}
