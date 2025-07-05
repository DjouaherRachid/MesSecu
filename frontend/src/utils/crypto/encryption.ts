// utils/crypto/encryption.ts

import { arrayBufferToBase64 } from "../encoding";
import { getSessionCipher } from "./session";

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

export function encodeSignalMessage(encrypted: any) {
  return {
    type: encrypted.type,
    body: arrayBufferToBase64(encrypted.body),
    ...(encrypted.registrationId && { registrationId: encrypted.registrationId }),
    ...(encrypted.preKeyId && { preKeyId: encrypted.preKeyId }),
    ...(encrypted.signedPreKeyId && { signedPreKeyId: encrypted.signedPreKeyId }),
  };
}

// export async function encryptMessageForGroup(
//   plaintext: string,
//   participants: number[],
//   currentUserId: number
// ): Promise<
//   { recipientId: number; ciphertext: string; type: number }[]
// > {
//   const results = [];

//   for (const recipientId of participants) {
//     if (recipientId === currentUserId) continue;

//     const cipher = getSessionCipher(recipientId);
//     const encrypted = await cipher.encrypt(plaintext);

//     results.push({
//       recipientId,
//       ciphertext: btoa(String.fromCharCode(...encrypted.body)), 
//       type: encrypted.type, // 3 = preKeyMessage ou 1 = SignalMessage
//     });
//   }

//   return results;
// }