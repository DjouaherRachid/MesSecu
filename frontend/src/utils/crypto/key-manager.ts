import * as libsignal from '@privacyresearch/libsignal-protocol-typescript';
import instance from '../../api/instance';
import { base64ToArrayBuffer, toBase64 } from '../encoding';
import signalProtocolStore, { SignalProtocolStore } from './signal-store';

export async function generateInitialKeyBundle(oneTimePreKeyCount = 100) {
  const identityKeyPair = await libsignal.KeyHelper.generateIdentityKeyPair();
  const registrationId = await libsignal.KeyHelper.generateRegistrationId();
  const signedPreKey = await libsignal.KeyHelper.generateSignedPreKey(identityKeyPair, 1);

  // Générer un lot de one-time pre keys
  const oneTimePreKeys = [];
  for (let i = 0; i < oneTimePreKeyCount; i++) {
    const preKey = await libsignal.KeyHelper.generatePreKey(i + 1); 
    oneTimePreKeys.push({
      key_id: preKey.keyId,
      public_key: preKey.keyPair.pubKey,
      private_key: preKey.keyPair.privKey,
      used: false,
    });
  }

  // Préparer les clés au format attendu par storeKeysLocally
  const oneTimePreKeysArray = oneTimePreKeys.map(preKey => ({
    key_id: preKey.key_id,
    keyPair: {
      pubKey: new Uint8Array(preKey.public_key),
      privKey: new Uint8Array(preKey.private_key), 
    },
  }));


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

  return {
    identityKey: {
      public_key: toBase64(identityKeyPair.pubKey),
      private_key: identityKeyPair.privKey, 
    },
    signedPreKey: {
      public_key: toBase64(signedPreKey.keyPair.pubKey),
      private_key: signedPreKey.keyPair.privKey,
      key_id: signedPreKey.keyId,
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

  console.log('oneTimePreKeys', oneTimePreKeys);

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

    console.log('[storeKeysLocally] Stockage des clés Signal localement...');

    await signalProtocolStore.put('identityKey', {
      pubKey: identity_key.pubKey,
      privKey: identity_key.privKey,
    });

    await signalProtocolStore.put('registrationId', registration_id);

    await signalProtocolStore.storeSignedPreKey(signed_pre_key.key_id, {
      keyId: signed_pre_key.key_id,
      keyPair: signed_pre_key.keyPair,
      signature: signed_pre_key.signature,
    });

    for (const preKey of one_time_pre_keys) {
      await signalProtocolStore.storePreKey(preKey.key_id, {
        keyId: preKey.key_id,
        keyPair: preKey.keyPair,
      });
    }

    console.log(`[storeKeysLocally] Clés stockées localement : identityKey ✅, signedPreKey id=${signed_pre_key.key_id} ✅, ${one_time_pre_keys.length} one-time pre-keys ✅`);
  };

export async function fetchPreKeyBundle(recipientId: number) {
  // 1. Récupérer la signed pre key
  const signedPreKeyResp = await instance.get(`/signed-pre-keys/${recipientId}`);
  const signedPreKeyData = signedPreKeyResp.data;

  // 2. Récupérer la identity key
  const identityKeyResp = await instance.get(`/identity-keys/${recipientId}`);
  const identityKeyData = identityKeyResp.data;

  // 3. Récupérer la liste des one-time pre keys (peut être vide)
  const oneTimePreKeysResp = await instance.get(`/one-time-pre-keys/${recipientId}/`);
  const oneTimePreKeysData = oneTimePreKeysResp.data;

  const oneTimePreKey = oneTimePreKeysData.find((key: any) => !key.used);

  return {
    recipientId,
    registrationId: signedPreKeyData.id,

    // ✅ Conversion des clés base64 → Uint8Array
    identityKey: new Uint8Array(base64ToArrayBuffer(identityKeyData.public_key)),

    signedPreKey: new Uint8Array(base64ToArrayBuffer(signedPreKeyData.public_key)),
    signedPreKeyId: signedPreKeyData.key_id,
    signedPreKeySignature: new Uint8Array(base64ToArrayBuffer(signedPreKeyData.signature)),

    oneTimePreKey: oneTimePreKey
      ? new Uint8Array(base64ToArrayBuffer(oneTimePreKey.public_key))
      : undefined,
    oneTimePreKeyId: oneTimePreKey?.key_id,
  };
}
