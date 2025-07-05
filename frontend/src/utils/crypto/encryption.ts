// utils/crypto/encryption.ts

export async function encryptMessage(sessionKey: CryptoKey, plaintext: string): Promise<string> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder().encode(plaintext);

  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    sessionKey,
    enc
  );

  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return btoa(String.fromCharCode(...combined));
}

export async function decryptMessage(sessionKey: CryptoKey, b64cipher: string): Promise<string> {
  const raw = Uint8Array.from(atob(b64cipher), c => c.charCodeAt(0));
  const iv = raw.slice(0, 12);
  const ciphertext = raw.slice(12);

  const plaintext = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    sessionKey,
    ciphertext
  );

  return new TextDecoder().decode(plaintext);
}
