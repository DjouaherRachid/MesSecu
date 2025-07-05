// utils/crypto/serialization.ts
export async function importPublicKey(spkiB64: string): Promise<CryptoKey> {
  const buffer = Uint8Array.from(atob(spkiB64), c => c.charCodeAt(0));
  return await crypto.subtle.importKey(
    'spki',
    buffer,
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    []
  );
}

export async function importIdentityPrivateKey(pkcs8B64: string): Promise<CryptoKey> {
  const buffer = Uint8Array.from(atob(pkcs8B64), c => c.charCodeAt(0));
  return await crypto.subtle.importKey(
    'pkcs8',
    buffer,
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign']
  );
}
