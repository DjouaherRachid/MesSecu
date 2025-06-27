import { use } from 'react';
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
};