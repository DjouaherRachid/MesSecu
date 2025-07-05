// utils/crypto/encryption.ts

import { binaryStringToUint8Array, ensureArrayBuffer, toArrayBuffer } from "../encoding";
import { ensureSessionWithRecipient, getSessionCipher } from "./session";
import { fromByteArray, toByteArray } from 'base64-js';
import { SignalMessageInput, SignalEncryptedMessage } from '../../types/signal';
import type { SessionCipher } from '@privacyresearch/libsignal-protocol-typescript';

// export function encodeSignalMessage(encrypted: any) {
//   console.log('[encodeSignalMessage] Entrée :', encrypted);

//   if (!encrypted || !encrypted.body || !encrypted.type) {
//     console.error('[encodeSignalMessage] Format invalide :', encrypted);
//     return null;
//   }

//   console.log('[encodeSignalMessage] Type de encrypted.body :', typeof encrypted.body);
//   console.log('[encodeSignalMessage] encrypted.body.constructor.name :', encrypted.body?.constructor?.name);

//   let bodyBase64: string;

//   if (typeof encrypted.body === 'string') {
//     // On convertit la string binaire en Uint8Array
//     const byteArray = binaryStringToUint8Array(encrypted.body);
//     bodyBase64 = fromByteArray(byteArray);
//     console.log('[encodeSignalMessage] body converti en base64 :', bodyBase64);
//   } else if (encrypted.body instanceof ArrayBuffer) {
//     const byteArray = new Uint8Array(encrypted.body);
//     bodyBase64 = fromByteArray(byteArray);
//     console.log('[encodeSignalMessage] body encodé en base64 :', bodyBase64);
//   } else if (ArrayBuffer.isView(encrypted.body)) {
//     const byteArray = new Uint8Array(encrypted.body.buffer);
//     bodyBase64 = fromByteArray(byteArray);
//     console.log('[encodeSignalMessage] body encodé en base64 :', bodyBase64);
//   } else {
//     console.error('[encodeSignalMessage] Format inconnu pour encrypted.body');
//     return null;
//   }

//   const payload = {
//     type: encrypted.type,
//     body: bodyBase64,
//     ...(encrypted.registrationId && { registrationId: encrypted.registrationId }),
//     ...(encrypted.preKeyId && { preKeyId: encrypted.preKeyId }),
//     ...(encrypted.signedPreKeyId && { signedPreKeyId: encrypted.signedPreKeyId }),
//   };

//   console.log('[encodeSignalMessage] Payload généré :', payload);

//   return payload;
// }

export async function decodeSignalMessage(payload: SignalMessageInput): Promise<string> {
  const senderId = parseInt(payload.message.sender.user_id, 10);
  const cipher: SessionCipher = await getSessionCipher(senderId);

  // console.log('[decodeSignalMessage] cipher:', cipher);

  const encryptedBytes = toByteArray(payload.message.content);
  const encryptedArrayBuffer = toArrayBuffer(encryptedBytes);

  let decrypted: ArrayBuffer;

  if (payload.signal_type === 3) {
    // console.log('[decodeSignalMessage] Déchiffrement avec PreKeyWhisperMessage');
    decrypted = await cipher.decryptPreKeyWhisperMessage(encryptedArrayBuffer, 'binary');
  } else if (payload.signal_type === 1) {
    // console.log('[decodeSignalMessage] Déchiffrement avec WhisperMessage');
    decrypted = await cipher.decryptWhisperMessage(encryptedArrayBuffer, 'binary');
  } else {
    throw new Error(`Type de message inconnu : ${payload.signal_type}`);
  }

  return new TextDecoder().decode(decrypted);
}

export async function encryptMessageForRecipient(
  userId: number,
  message: string
): Promise<{
  to: string;
  content: string; // base64
  signal_type: number;
  registrationId?: number;
  preKeyId?: number;
  signedPreKeyId?: number;
}> {
  await ensureSessionWithRecipient(userId);
  const cipher: SessionCipher = await getSessionCipher(userId);

  const messageBuffer = new TextEncoder().encode(message).buffer;

  const encrypted = await cipher.encrypt(messageBuffer as any) as SignalEncryptedMessage;

  let byteArray: Uint8Array;

  if (typeof encrypted.body === 'string') {
    console.log('[encrypt] String - Longueur totale du message chiffré (body):', encrypted.body.length);
    byteArray = binaryStringToUint8Array(encrypted.body);
  } else if (encrypted.body instanceof ArrayBuffer) {
    console.log('[encrypt] ArrayBuffer - Longueur totale du message chiffré (body):', encrypted.body.byteLength);
    byteArray = new Uint8Array(encrypted.body);
  } else if (ArrayBuffer.isView(encrypted.body)) {
    console.log('[encrypt] TypedArray - Longueur totale du message chiffré (body):', encrypted.body.byteLength);
    byteArray = new Uint8Array(
      encrypted.body.buffer,
      encrypted.body.byteOffset,
      encrypted.body.byteLength
    );
  } else {
    throw new Error('Format inconnu pour encrypted.body');
  }

  // Taille standard du MAC dans Signal (en bytes)
  const macLength = 16;

  if (byteArray.length >= macLength) {
    console.log(`[encrypt] Taille totale message chiffré : ${byteArray.length} bytes`);
    console.log(`[encrypt] Taille MAC estimée : ${macLength} bytes`);
    console.log(`[encrypt] Taille message chiffré sans MAC : ${byteArray.length - macLength} bytes`);
  } else {
    console.warn('[encrypt] Message chiffré trop court pour contenir un MAC valide');
  }

  const bodyBase64 = fromByteArray(byteArray);

  return {
    to: userId.toString(),
    content: bodyBase64,
    signal_type: encrypted.type,
    ...(encrypted.registrationId ? { registrationId: encrypted.registrationId } : {}),
    ...(encrypted.preKeyId ? { preKeyId: encrypted.preKeyId } : {}),
    ...(encrypted.signedPreKeyId ? { signedPreKeyId: encrypted.signedPreKeyId } : {}),
  };
}

// console.log('[TEST] ON TESTE La fonction encodeSignalMessage pour Hello world', encodeSignalMessage('Hello World', 5));

// async function encodeSignalMessage(plaintext : string, userId: number){
//     await ensureSessionWithRecipient(userId);
//     var enc = new TextEncoder();
//     const messageBuffer = enc.encode(plaintext);
//     const sessionCipher: SessionCipher = await getSessionCipher(userId);
//     const encrypted = await sessionCipher.encrypt(ensureArrayBuffer(messageBuffer) as any);

//     console.log('Encrypted object:', encrypted);
//     console.log('encrypted.type:', encrypted.type); // devrait être 3 pour PreKeyWhisperMessage
//     console.log('typeof encrypted.body:', typeof encrypted.body);
//     console.log('encrypted.body instanceof ArrayBuffer:', (encrypted.body as any) instanceof ArrayBuffer);
//     console.log('encrypted.body instanceof Uint8Array:', (encrypted.body as any) instanceof Uint8Array);

//     if ((encrypted.body as any) instanceof ArrayBuffer || (encrypted.body as any) instanceof Uint8Array) {
//         const body = new Uint8Array(encrypted.body as any);
//         console.log('body byteLength:', body.byteLength);
//         console.log('body preview:', Array.from(body.slice(0, 32))); // premières données utiles
//     }


//     const decrypted = await sessionCipher.decryptPreKeyWhisperMessage(encrypted.body as string);
//     console.log('[encodeSignalMessage] Message déchiffré:', decrypted);
// }