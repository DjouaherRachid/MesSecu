// crypto/aes.ts

import instance from "../../api/instance";
import { fetchRsaPublicKey } from "../../api/rsa-key";
import { arrayBufferToBase64, base64ToUint8Array } from "../encoding";
import { decryptAesKey, encryptAesKeyForUser, importPublicKey } from "./rsa";
import { fetchEncryptedConversationKey } from "../../api/conversation-key";
import { importPrivateKey } from "./rsa";

const AES_KEY_PREFIX = 'aesKey_';

export async function generateAesKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function encryptWithAesGcm(plaintext: string, key: CryptoKey): Promise<string> {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = enc.encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  const result = `${arrayBufferToBase64(iv.buffer)}:${arrayBufferToBase64(ciphertext)}`;
  return result;
}

export async function decryptWithAesGcm(encryptedBase64: string, key: CryptoKey): Promise<string> {
  const [ivB64, dataB64] = encryptedBase64.split(":");
  const iv = base64ToUint8Array(ivB64);
  const encryptedData = base64ToUint8Array(dataB64);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encryptedData
  );

  return new TextDecoder().decode(decrypted);
}

export async function prepareEncryptedAesKeysForParticipants(
  conversationId: number,
  participantUserIds: number[]
) {
  try {
    const aesKey = await generateAesKey();

    for (const userId of participantUserIds) {
      const { rsa_public_key } = await fetchRsaPublicKey(userId);

      const publicKey = await importPublicKey(rsa_public_key);
      const encryptedAesKey = await encryptAesKeyForUser(aesKey, publicKey);

      await instance.post('/conversation-keys', {
        encrypted_aes_key: encryptedAesKey,
        user_id: userId,
        conversation_id: conversationId,
      });
    }
    
    return aesKey; 
  } catch (error) {
    console.error(`[prepareEncryptedAesKeysForParticipants] Erreur :`, error);
    throw error;
  }
}

export async function getOrFetchAesKey(
  conversationId: number,
  userId: number
): Promise<CryptoKey> {
  // Étape 1 : récupération depuis le stockage local
  const localKey = await getStoredAesKey(conversationId);
  if (localKey) {
    return localKey;
  }

  try {
    // Étape 2 : récupération de la clé chiffrée depuis le backend
    const response = await fetchEncryptedConversationKey(conversationId, userId);

    if (!response || !response.encrypted_aes_key) {
      throw new Error("Clé AES chiffrée manquante dans la réponse du serveur");
    }
    const { encrypted_aes_key } = response;

    // Étape 3 : récupération de la clé privée RSA depuis le localStorage
    const privateKeyBase64 = localStorage.getItem(`privateKey_${userId}`);
    if (!privateKeyBase64) {
      throw new Error(`Clé privée RSA manquante pour l'utilisateur ${userId}`);
    }

    const privateKey = await importPrivateKey(privateKeyBase64);

    // Étape 4 : déchiffrement de la clé AES
    const aesKey = await decryptAesKey(encrypted_aes_key, privateKey);

    // Étape 5 : stockage local
    await storeAesKey(conversationId, aesKey);

    return aesKey;
  } catch (err) {
    console.error(`[AES] Échec de récupération de la clé AES pour la conversation ${conversationId}`, err);
    throw err;
  }
}

export async function storeAesKey(conversationId: number, key: CryptoKey) {
  const exportedKey = await crypto.subtle.exportKey("raw", key);
  const keyBase64 = arrayBufferToBase64(exportedKey);
  localStorage.setItem(`aesKey_${conversationId}`, keyBase64);
}

export async function generateAndStoreAesKey(conversationId: number): Promise<CryptoKey> {
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  const raw = await crypto.subtle.exportKey("raw", key);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(raw)));
  localStorage.setItem(`${AES_KEY_PREFIX}${conversationId}`, base64);
  return key;
}

export async function getStoredAesKey(conversationId: number): Promise<CryptoKey | null> {
  const base64 = localStorage.getItem(`${AES_KEY_PREFIX}${conversationId}`);
  if (!base64) return null;
  const raw = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  return crypto.subtle.importKey("raw", raw, "AES-GCM", true, ["encrypt", "decrypt"]);
}
