import * as libsignal from '@privacyresearch/libsignal-protocol-typescript';
import instance from '../../api/instance';
import {  base64ToArrayBuffer, ensureArrayBuffer, toBase64 } from '../encoding';
import signalProtocolStore, { SignalProtocolStore } from './signal-store';

export async function generateInitialKeyBundle(oneTimePreKeyCount = 100) {
  const identityKeyPair = await libsignal.KeyHelper.generateIdentityKeyPair();
  const registrationId = await libsignal.KeyHelper.generateRegistrationId();
  const signedPreKey = await libsignal.KeyHelper.generateSignedPreKey(identityKeyPair, 1);

  // Générer un lot de one-time pre keys (clé publique en base64 ici directement)
  const oneTimePreKeys = [];
  const oneTimePreKeysArray = []; // Pour stockage local

  for (let i = 0; i < oneTimePreKeyCount; i++) {
    const preKey = await libsignal.KeyHelper.generatePreKey(i + 1);

    // Pour le serveur
    oneTimePreKeys.push({
      key_id: preKey.keyId,
      public_key: toBase64(preKey.keyPair.pubKey),     
      private_key: toBase64(preKey.keyPair.privKey),  
      used: false,
    });

    // Pour le stockage local
    oneTimePreKeysArray.push({
      key_id: preKey.keyId,
      keyPair: {
        pubKey: new Uint8Array(preKey.keyPair.pubKey),
        privKey: new Uint8Array(preKey.keyPair.privKey),
      },
    });
  }

  // Clé signée
  const signedPreKeyObj = {
    key_id: signedPreKey.keyId,
    keyPair: {
      pubKey: new Uint8Array(signedPreKey.keyPair.pubKey),
      privKey: new Uint8Array(signedPreKey.keyPair.privKey),
    },
    signature: new Uint8Array(signedPreKey.signature),
  };

  const identityKeyPairConverted = {
    pubKey: new Uint8Array(identityKeyPair.pubKey),
    privKey: new Uint8Array(identityKeyPair.privKey),
  };

  // Stocker les clés localement
  await storeKeysLocally({
    identity_key: identityKeyPairConverted,
    registration_id: registrationId,
    signed_pre_key: signedPreKeyObj,
    one_time_pre_keys: oneTimePreKeysArray,
  });

  // Retourner les clés encodées vers le backend
  return {
    identityKey: {
      public_key: toBase64(identityKeyPair.pubKey),
      private_key: toBase64(identityKeyPair.privKey),
    },
    signedPreKey: {
      key_id: signedPreKey.keyId,
      public_key: toBase64(signedPreKey.keyPair.pubKey),
      private_key: toBase64(signedPreKey.keyPair.privKey),
      signature: toBase64(signedPreKey.signature),
    },
    registrationId,
    oneTimePreKeys,
  };
}

export async function uploadKeyBundleToServer(user_id: number, bundle: any) {
  const { identityKey, signedPreKey, oneTimePreKeys } = bundle;

  await instance.post('/identity-keys', {
    user_id,
    public_key: identityKey.public_key,
  });

  await instance.post('/signed-pre-keys', {
    user_id,
    key_id: signedPreKey.key_id,
    public_key: signedPreKey.public_key,
    signature: signedPreKey.signature,
  });


  if (oneTimePreKeys && Array.isArray(oneTimePreKeys)) {
    for (const preKey of oneTimePreKeys) {
      await instance.post('/one-time-pre-keys', {
        user_id,
        key_id: preKey.key_id,
        public_key: preKey.public_key, 
      });
    }
  }
}

  interface StoreKeysParams {
    identity_key: { pubKey: Uint8Array; privKey: Uint8Array };
    registration_id: number;
    signed_pre_key: {
      key_id: number;
      keyPair: { pubKey: Uint8Array; privKey: Uint8Array };
      signature: Uint8Array;
    };
    one_time_pre_keys: {
      key_id: number;
      keyPair: { pubKey: Uint8Array; privKey?: Uint8Array };
    }[];
  }

  export const storeKeysLocally = async ({
    identity_key,
    registration_id,
    signed_pre_key,
    one_time_pre_keys,
  }: StoreKeysParams) => {

    await signalProtocolStore.put('identityKey', {
      pubKey: ensureArrayBuffer(identity_key.pubKey),
      privKey: ensureArrayBuffer(identity_key.privKey),
    });

    await signalProtocolStore.put('registrationId', registration_id);

    await signalProtocolStore.storeSignedPreKey(signed_pre_key.key_id, {
      keyId: signed_pre_key.key_id,
      pubKey: ensureArrayBuffer(signed_pre_key.keyPair.pubKey),
      privKey: ensureArrayBuffer(signed_pre_key.keyPair.privKey),
      signature: ensureArrayBuffer(signed_pre_key.signature),
    });

    for (const preKey of one_time_pre_keys) {
      await signalProtocolStore.storePreKey(preKey.key_id, {
        keyId: preKey.key_id,
        pubKey: ensureArrayBuffer(preKey.keyPair.pubKey),
        privKey: ensureArrayBuffer(preKey.keyPair.privKey),
      });
    }

  };



export async function fetchPreKeyBundle(recipientId: number) {
  try {
    // 1. Signed Pre Key
    const signedPreKeyResp = await instance.get(`/signed-pre-keys/${recipientId}`);
    const signedPreKeyData = signedPreKeyResp.data;

    // 2. Identity Key
    const identityKeyResp = await instance.get(`/identity-keys/${recipientId}`);
    const identityKeyData = identityKeyResp.data;

    // 3. One-Time Pre Keys
    const oneTimePreKeysResp = await instance.get(`/one-time-pre-keys/${recipientId}/`);
    const oneTimePreKeysData = oneTimePreKeysResp.data;

    const oneTimePreKey = oneTimePreKeysData.find((key: any) => {
      return (
        !key.used &&
        typeof key.public_key === "string" &&
        key.public_key.length >= 20 && // protection minimale
        /^[A-Za-z0-9+/=]+$/.test(key.public_key)
      );
    });

    return {
      recipientId,
      registrationId: signedPreKeyData.id,

      identityKey: new Uint8Array(base64ToArrayBuffer('identityKey', identityKeyData.public_key)),

      signedPreKey: new Uint8Array(base64ToArrayBuffer('signedPreKey', signedPreKeyData.public_key)),
      signedPreKeyId: signedPreKeyData.key_id,
      signedPreKeySignature: new Uint8Array(base64ToArrayBuffer('signedPreKeySignature', signedPreKeyData.signature)),

      oneTimePreKey: oneTimePreKey
        ? new Uint8Array(base64ToArrayBuffer('oneTimePreKey', oneTimePreKey.public_key))
        : undefined,
      oneTimePreKeyId: oneTimePreKey?.key_id,
    };
  } catch (err) {
    console.error(`❌ [fetchPreKeyBundle] Échec lors de la récupération des clés pour ${recipientId}:`, err);
    throw err;
  }
}