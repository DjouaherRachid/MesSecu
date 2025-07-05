import { base64ToUint8Array } from "../../utils/encoding";
import { generateInitialKeyBundle, uploadKeyBundleToServer, storeKeysLocally } from "../../utils/signal/key-manager";
import signalProtocolStore from "../../utils/signal/signal-store";

export const handleKeyGenerationAndStorage = async (userId: number) => {
        
        const identityKey = await signalProtocolStore.get('identityKey');

        if (!identityKey || !identityKey.privKey) {

          const bundle = await generateInitialKeyBundle();

          await uploadKeyBundleToServer(userId, bundle);

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

        } else {
          console.log('[Auth] Clés Signal déjà présentes localement.');
        }
    }