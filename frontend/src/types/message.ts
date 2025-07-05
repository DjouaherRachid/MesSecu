export type MessageRead = {
  user_id: number;
  username?: string;
  read_at: string; 
};

type Sender = {
  user_id: number;
  name: string;
  avatar: string | null;
};

export type Message = {
  message_id: number;
  content: string;
  sender: Sender;
  created_at: string;
  reads: MessageRead[];
  signal_type: string;
  registrationId: string;
  preKeyId: string;
  signedPreKeyId: string;
};

export type NewMessagePayload = {
  conversationId: string;
  message: {
    message_id: number;
    content: string; 
    sender: {
      user_id: number;
      name: string;
      avatar: string | null;
    };
    created_at: string;
    reads: { user_id: number; read_at: string }[];
  };
  signal_type: number; 
};
