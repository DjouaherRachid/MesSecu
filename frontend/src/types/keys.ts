export interface IdentityKey {
  public_key: string;
  priv_key: ArrayBuffer;
}

export interface SignedPreKey {
  key_id: number;
  public_key: string;
  signature: string;
}

export interface OneTimePreKey {
  key_id: number;
  public_key: string;
}
