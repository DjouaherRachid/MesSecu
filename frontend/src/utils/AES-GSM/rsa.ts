import { updateRsaPublicKey } from "../../api/rsa-key";

export async function generateRsaKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );
}

export const handleRSAKeyGenerationAndStorage = async (userId: number) => {
    try {
   // 1. Générer la paire RSA
        const keyPair = await generateRsaKeyPair();

        // 2. Exporter la clé publique
        const exportedPublicKey = await exportPublicKey(keyPair.publicKey);

        // 3. Envoyer la clé publique au backend
        updateRsaPublicKey(exportedPublicKey);
        
        // 4. Exporter la clé privée et la stocker localement
        const exportedPrivateKey = await exportPrivateKey(keyPair.privateKey);
        await savePrivateKeyLocally(userId, exportedPrivateKey);

        return keyPair;

    } catch (error) {
        console.error('Error generating and storing keys:', error);
        throw error;
    }
};

export async function encryptAesKeyForUser(
  aesKey: CryptoKey,
  recipientPublicKey: CryptoKey
): Promise<string> {
  const rawKey = await crypto.subtle.exportKey("raw", aesKey);
  const encrypted = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    recipientPublicKey,
    rawKey
  );
  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}

export async function decryptAesKey(
  encryptedBase64: string,
  privateKey: CryptoKey
): Promise<CryptoKey> {
  const encrypted = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
  const rawKey = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, encrypted.buffer);
  return crypto.subtle.importKey(
    "raw",
    rawKey,
    "AES-GCM",
    true,
    ["encrypt", "decrypt"]
  );
}

export async function savePrivateKeyLocally(userId: number, privateKeyBase64: string) {
  // Exemple simple avec localStorage (à améliorer avec IndexedDB ou Web Crypto Storage)
  localStorage.setItem(`privateKey_${userId}`, privateKeyBase64);
}

export async function exportPublicKey(key: CryptoKey): Promise<string> {
  const spki = await crypto.subtle.exportKey("spki", key);
  return btoa(String.fromCharCode(...new Uint8Array(spki)));
}

export async function importPublicKey(base64: string): Promise<CryptoKey> {
  const spki = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  return crypto.subtle.importKey(
    "spki",
    spki,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["encrypt"]
  );
}

export async function exportPrivateKey(key: CryptoKey): Promise<string> {
  const pkcs8 = await crypto.subtle.exportKey("pkcs8", key);
  return btoa(String.fromCharCode(...new Uint8Array(pkcs8)));
}

export async function importPrivateKey(base64: string): Promise<CryptoKey> {
  const pkcs8 = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  return crypto.subtle.importKey(
    "pkcs8",
    pkcs8,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["decrypt"]
  );
}
