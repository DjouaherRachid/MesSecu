import { base64ToUint8Array } from "../../utils/encoding";
import { generateInitialKeyBundle, storeKeysLocally, uploadKeyBundleToServer } from "../../utils/signal/key-manager";

export const handleSignalKeyGenerationAndStorage = async (userId: number) => {
  try {
    const bundle = await generateInitialKeyBundle();

    await storeKeysLocally({
      identity_key: {
        pubKey: base64ToUint8Array(bundle.identityKey.public_key),
        privKey: base64ToUint8Array(bundle.identityKey.private_key),
      },
      registration_id: bundle.registrationId,
      signed_pre_key: {
        key_id: bundle.signedPreKey.key_id,
        keyPair: {
          pubKey: base64ToUint8Array(bundle.signedPreKey.public_key),
          privKey: base64ToUint8Array(bundle.signedPreKey.private_key),
        },
        signature: base64ToUint8Array(bundle.signedPreKey.signature),
      },
      one_time_pre_keys: bundle.oneTimePreKeys.map(p => ({
        key_id: p.key_id,
        keyPair: {
          pubKey: base64ToUint8Array(p.public_key),
          privKey: base64ToUint8Array(p.private_key),
        },
      })),
    });

    await uploadKeyBundleToServer(userId, bundle);
    return true; // Succès

  } catch (error) {
    console.error('[Signup] Key generation or storage failed:', error);
    throw error; // Propagation pour gestion dans handleSignupSubmission
  }
};