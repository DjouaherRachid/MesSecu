export interface Conversation {
  id: number;
  name: string;
  picture?: string | null;
  updatedAt: string;
  other_users: {
    username: string;
    avatar_url: string;
  };
  last_message: {
    message_id: number;
    content: string;
    sender_name: string;
    seen: boolean;
    created_at: string;
  };
}
