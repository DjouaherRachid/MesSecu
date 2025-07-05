import Cookies from "js-cookie";
import signalProtocolStore, { SignalProtocolStore } from "./signal-store";
import * as libsignal from '@privacyresearch/libsignal-protocol-typescript';
import { fetchPreKeyBundle } from "./key-manager";
import instance from "../../api/instance";
import { ensureArrayBuffer } from "../encoding";

/**
 * Crée une session avec un destinataire à partir de son preKeyBundle
 */
export async function buildSessionWithRecipient({
  recipientId,
  registrationId,
  identityKey,
  signedPreKey,
  signedPreKeySignature,
  oneTimePreKey,
  signedPreKeyId,
  oneTimePreKeyId,
}: {
  recipientId: number;
  registrationId: number;
  identityKey: Uint8Array; // Clé publique uniquement
  signedPreKey: Uint8Array; // Clé publique uniquement
  signedPreKeySignature: Uint8Array;
  oneTimePreKey: Uint8Array;
  signedPreKeyId: number;
  oneTimePreKeyId: number;
}) {
  console.log('[buildSessionWithRecipient] 🔨 Construction de la session pour le destinataire ID:', recipientId);

  const address = new libsignal.SignalProtocolAddress(recipientId.toString(), 1);
  const builder = new libsignal.SessionBuilder(signalProtocolStore, address);

  const preKeyBundle = {
    registrationId,
    identityKey: ensureArrayBuffer(identityKey),
    signedPreKey: {
      keyId: signedPreKeyId,
      publicKey: ensureArrayBuffer(signedPreKey),
      signature: ensureArrayBuffer(signedPreKeySignature),
    },
    preKey: oneTimePreKey
      ? {
          keyId: oneTimePreKeyId,
          publicKey: ensureArrayBuffer(oneTimePreKey),
        }
      : undefined,
  };


  console.log('[buildSessionWithRecipient] 📦 preKeyBundle construit :', preKeyBundle);

  // créer la session
  await builder.processPreKey(preKeyBundle as any);

  // Vérification : session bien créée ?
  const sessionRecord = await signalProtocolStore.loadSession(address.toString());
  if (!sessionRecord) {
    throw new Error('[buildSessionWithRecipient] ❌ Session non sauvegardée dans IndexedDB');
  }

  // Optionnel : sauvegarde sur le backend
  try {
    await instance.post('/sessions', {
      body: JSON.stringify({
        userId: Cookies.get('userId'),
        peerId: recipientId,
        sessionData: sessionRecord,
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    console.log('[buildSessionWithRecipient] ✅ Session sauvegardée sur le backend');
  } catch (error) {
    console.error('[buildSessionWithRecipient] ❌ Échec de la sauvegarde de session côté serveur:', error);
    throw error;
  }
}

/**
 * Vérifie si une session avec le destinataire existe. Sinon, tente de la créer.
 */
export async function ensureSessionWithRecipient(recipientId: number) {
  console.log('[ensureSessionWithRecipient] 🔍 Vérification de la session pour le destinataire ID:', recipientId);

  const address = new libsignal.SignalProtocolAddress(recipientId.toString(), 1);
  const addressStr = address.toString();

  try {
    const session = await signalProtocolStore.loadSession(addressStr);
    if (session) {
      console.log(`[ensureSessionWithRecipient] ✅ Session existante trouvée pour ${addressStr}`);
      return;
    }
  } catch (err) {
    console.warn(`[ensureSessionWithRecipient] ⚠️ Erreur lors du chargement de session pour ${addressStr}:`, err);
  }

  console.log(`[ensureSessionWithRecipient] 🆕 Aucune session. Tentative de création...`);

  try {
    const bundle = await fetchPreKeyBundle(recipientId);

    console.log('[ensureSessionWithRecipient] 📦 Bundle reçu :', bundle);

    await buildSessionWithRecipient({
      recipientId,
      registrationId: bundle.registrationId,
      identityKey: bundle.identityKey, // public key
      signedPreKey: bundle.signedPreKey,
      signedPreKeySignature: bundle.signedPreKeySignature,
      oneTimePreKey: bundle.oneTimePreKey as Uint8Array,
      signedPreKeyId: bundle.signedPreKeyId,
      oneTimePreKeyId: bundle.oneTimePreKeyId,
    });

    console.log('[ensureSessionWithRecipient] ✅ Session créée avec succès');
  } catch (err) {
    console.error('[ensureSessionWithRecipient] ❌ Échec de création de session :', err);
    throw err;
  }
}

/**
 * Récupère un SessionCipher pour chiffrer/déchiffrer avec un destinataire.
 */
let sharedStore: SignalProtocolStore | null = null;

export async function getSessionCipher(recipientId: number) {
  if (!sharedStore) {
    sharedStore = new SignalProtocolStore(); // Init une seule fois
    console.log('[getSessionCipher] SignalProtocolStore initialisé');
  }

  const address = new libsignal.SignalProtocolAddress(recipientId.toString(), 1);
  console.log('[getSessionCipher] Création du SessionCipher pour', address.toString());
  return new libsignal.SessionCipher(sharedStore, address);
}