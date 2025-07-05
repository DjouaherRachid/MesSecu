import { IdentityKey } from '../../types/keys';
// src/lib/signal/signal-protocol-store.ts
import { Direction } from "@privacyresearch/libsignal-protocol-typescript/lib/types";
import { get, set, del } from "idb-keyval";
import { ensureArrayBuffer } from '../encoding';

export class SignalProtocolStore {
  constructor() {
  }


  async put(key: string, value: any): Promise<void> {
    await set(key, value);
  }

  async get(key: string): Promise<any> {
    return await get(key);
  }

  async remove(key: string): Promise<void> {
    await del(key);
  }

  // Sessions
  async loadSession(address: string): Promise<any> {
    return await this.get(`session:${address}`);
  }

  async storeSession(address: string, record: any): Promise<void> {
    await this.put(`session:${address}`, record);
  }

  // Signed Pre Key
  async storeSignedPreKey(keyId: number | string, record: any): Promise<void> {
    await this.put(`signedPreKey:${keyId}`, record);
  }

  async loadSignedPreKey(keyId: number | string): Promise<any> {
    return await this.get(`signedPreKey:${keyId}`);
  }

  async removeSignedPreKey(keyId: number | string): Promise<void> {
    await this.remove(`signedPreKey:${keyId}`);
  }

  // One-time Pre Keys
  async storePreKey(keyId: number | string, record: any): Promise<void> {
    await this.put(`preKey:${keyId}`, record);
  }

  async loadPreKey(keyId: number | string): Promise<any> {
    return await this.get(`preKey:${keyId}`);
  }

  async removePreKey(keyId: number | string): Promise<void> {
    await this.remove(`preKey:${keyId}`);
  }

  // Identity Key
  async getIdentityKey(): Promise<any> {
    return await this.get('identityKey');
  }

  async setIdentityKey(identityKey: any): Promise<void> {

    await this.put('identityKey', identityKey);
  }

  async getIdentityKeyPair(): Promise<any> {
  const keys = await this.get('identityKey');

  if (!keys) return null;

  return {
    pubKey: ensureArrayBuffer(keys.pubKey),
    privKey: ensureArrayBuffer(keys.privKey),
  };
}


  async getLocalRegistrationId(): Promise<any> {
    return await this.get('registration_id');
  }

  async saveIdentity(identifier: string, identityKey: ArrayBuffer): Promise<boolean> {
    const existing = await this.get(`identityKey:${identifier}`);
    const isNew = !existing;

    await this.put(`identityKey:${identifier}`, identityKey);
    return isNew;
  }
  
  async loadIdentityKey(identifier: string): Promise<any> {
    const IdentityKey = await this.get(`identityKey:${identifier}`);
    return await this.get(`identityKey:${identifier}`);
  }

  async isTrustedIdentity(identifier: string, identityKey: ArrayBuffer, direction: Direction): Promise<boolean> {
    const existing = await this.get(`identityKey:${identifier}`);
    if (!existing) return true;

    const equal =
      existing.byteLength === identityKey.byteLength &&
      new Uint8Array(existing).every((v, i) => v === new Uint8Array(identityKey)[i]);

    return equal;
  }
}

// Crée une instance unique du store
const signalProtocolStore = new SignalProtocolStore();
export default signalProtocolStore;