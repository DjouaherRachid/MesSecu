import { Message } from "./message";

export interface SignalMessageInput {
  signal_type: number; // 1 = SignalMessage, 3 = PreKeySignalMessage
  message: {
    message_id: string;
    sender: {
      user_id: string;
      name : string;
      avatar: string | null;
    };
    created_at: string;
    reads: { user_id: string; read_at: string }[];
    content: string; // base64
  };
}

export interface EncryptedSignalPayload {
  to: string;
  content: string;
  signal_type: number;
  registrationId?: number;
  preKeyId?: number;
  signedPreKeyId?: number;
}

// Typage explicite du retour de cipher.encrypt()
export interface SignalEncryptedMessage {
  type: number;
  body: ArrayBuffer | string | Uint8Array;
  registrationId?: number;
  preKeyId?: number;
  signedPreKeyId?: number;
}