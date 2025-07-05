export interface Conversation {
  id: number;
  name: string;
  picture?: string | null;
  updated_at: string;
  other_users: {
    user_id: number;
    username: string;
    avatar_url: string;
  };
  last_message: {
    message_id: number;
    content: string;
    sender_name: string;
    sender_id: number;
    seen: boolean;
    signal_type: number; // 1 for SignalMessage, 3 for PreKeySignalMessage
    created_at: string;
  };
}

export interface EncryptedConversation {
  id: number;
  name: string;
  picture?: string | null;
  updated_at: string;
  other_users: {
    user_id: number;
    username: string;
    avatar_url: string;
  };
  last_message: {
    message_id: number;
    // content: {
    //   type: "Buffer";
    //   data: number[];
    // };
    content : string; // base64 encoded
    sender_name: string;
    sender_id: number;
    seen: boolean;
    signal_type: number; // 1 for SignalMessage, 3 for PreKeySignalMessage
    created_at: string;
  };
}
