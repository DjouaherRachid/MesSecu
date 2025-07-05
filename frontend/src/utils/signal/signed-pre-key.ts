// utils/crypto/signedPreKey.ts
import { generateIdentityKeyPair } from './identity';

export async function generateSignedPreKey(identityPrivateKey: CryptoKey, keyId: number) {
  const { privateKey, publicKey } = await window.crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    ['deriveKey', 'deriveBits']
  );

  const spki = await window.crypto.subtle.exportKey('spki', publicKey);
  const signature = await window.crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    identityPrivateKey,
    spki
  );

  return {
    keyId,
    privateKey,
    publicKey,
    signature: btoa(String.fromCharCode(...new Uint8Array(signature))),
  };
}
