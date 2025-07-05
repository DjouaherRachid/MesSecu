import * as libsignal from '@privacyresearch/libsignal-protocol-typescript';
import instance from '../instance';
import { arrayBufferToBase64, toBase64 } from '../encoding';
import { SignalProtocolStore } from './signal-store';

export async function generateInitialKeyBundle(oneTimePreKeyCount = 100) {
  const identityKeyPair = await libsignal.KeyHelper.generateIdentityKeyPair();
  const registrationId = await libsignal.KeyHelper.generateRegistrationId();
  const signedPreKey = await libsignal.KeyHelper.generateSignedPreKey(identityKeyPair, 1);

  // Générer un lot de one-time pre keys
  const oneTimePreKeys = [];
  for (let i = 0; i < oneTimePreKeyCount; i++) {
    const preKey = await libsignal.KeyHelper.generatePreKey(i + 1); // i+1 pour key_id unique
    oneTimePreKeys.push({
      key_id: preKey.keyId,
      public_key: toBase64(preKey.keyPair.pubKey),
      private_key: preKey.keyPair.privKey,
      used: false, 
    });
  }

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
    oneTimePreKeys
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
    identity_key: ArrayBuffer;
    signed_pre_key: {
      key_id: number;
      public_key: ArrayBuffer;
      signature: ArrayBuffer;
    };
    one_time_pre_key: {
      key_id: number;
      public_key: ArrayBuffer;
    };
  }

  export const storeKeysLocally = async ({
    identity_key,
    signed_pre_key,
    one_time_pre_keys, 
  }: {
    identity_key: ArrayBuffer;
    signed_pre_key: {
      key_id: number;
      public_key: ArrayBuffer;
      signature: ArrayBuffer;
    };
    one_time_pre_keys: {
      key_id: number;
      public_key: ArrayBuffer;
    }[];
  }) => {
    const store = new SignalProtocolStore();

    // Stockage de la clé d'identité
    await store.put('identity_key', identity_key);

    // Stockage de la signed pre-key
    await store.storeSignedPreKey(signed_pre_key.key_id, {
      keyId: signed_pre_key.key_id,
      publicKey: signed_pre_key.public_key,
      signature: signed_pre_key.signature,
    });

    // Stockage de toutes les one-time pre-keys
    for (const preKey of one_time_pre_keys) {
      await store.storePreKey(preKey.key_id, {
        keyId: preKey.key_id,
        publicKey: preKey.public_key,
      });
    }

    console.log(`Clés Signal stockées localement : 
      - identity_key ✅ 
      - signed_pre_key id=${signed_pre_key.key_id} ✅ 
      - ${one_time_pre_keys.length} one-time pre-keys ✅`);
  };

