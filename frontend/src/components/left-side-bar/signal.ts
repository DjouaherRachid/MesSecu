import { decodeSignalMessage } from "../../utils/signal/encryption";

/**
 * Déchiffre un message Signal et gère les erreurs silencieusement.
 * Retourne le message d'origine en cas d'échec.
 */
export  const decryptSignalMessageContent = async (
  message: {
    message_id: string;
    content: string; // Base64
    sender_id: string;
    sender_name?: string;
    created_at: string;
    signal_type?: number;
  }
): Promise<string> => {
  if (!message.content) return message.content;

  try {
    const decrypted = await decodeSignalMessage({
      signal_type: Number(message.signal_type || 3),
      message: {
        message_id: String(message.message_id),
        content: message.content,
        sender: {
          user_id: String(message.sender_id),
          name: message.sender_name || 'Inconnu',
          avatar: null,
        },
        created_at: message.created_at,
        reads: [],
      },
    });
    return decrypted;
  } catch (err) {
    console.error(`[Signal] Failed to decrypt message ${message.message_id}:`, err);
    return message.content; // Fallback: retourne le contenu chiffré
  }
};