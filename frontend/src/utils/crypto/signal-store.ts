export class SignalProtocolStore {
  store: Map<string, any>;

  constructor() {
    this.store = new Map();
  }

  put(key: string, value: any) {
    this.store.set(key, value);
  }

  get(key: string): any {
    return this.store.get(key);
  }

  remove(key: string) {
    this.store.delete(key);
  }

  // Sessions
  loadSession(address: string) {
    return this.get(`session:${address}`);
  }

  storeSession(address: string, record: any) {
    this.put(`session:${address}`, record);
  }

  // Signed Pre Key
  async storeSignedPreKey(keyId: number, record: any) {
    this.put(`signedPreKey:${keyId}`, record);
  }

  async loadSignedPreKey(keyId: number) {
    return this.get(`signedPreKey:${keyId}`);
  }

  async removeSignedPreKey(keyId: number) {
    this.remove(`signedPreKey:${keyId}`);
  }

  // One-time Pre Keys
  async storePreKey(keyId: number, record: any) {
    this.put(`preKey:${keyId}`, record);
  }

  async loadPreKey(keyId: number) {
    return this.get(`preKey:${keyId}`);
  }

  async removePreKey(keyId: number) {
    this.remove(`preKey:${keyId}`);
  }

  // Identity Key
  async getIdentityKey() {
    return this.get('identityKey');
  }

  async setIdentityKey(identityKey: any) {
    this.put('identityKey', identityKey);
  }
}
