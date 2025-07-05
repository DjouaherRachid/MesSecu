import { NewMessagePayload, Message } from "../../types/message";
import { decryptWithAesGcm, getOrFetchAesKey } from "../../utils/AES-GSM/aes";
import Cookies from 'js-cookie';

export async function decryptAndNormalizeAesMessage(
  data: NewMessagePayload
): Promise<Message> {
  const { conversationId, message, signal_type } = data;

  const conversationIdInt = parseInt(conversationId);

  const userId = parseInt(Cookies.get('userId') as string);

  // Étape 1 : récupérer la clé AES de la conversation
  const aesKey = await getOrFetchAesKey(conversationIdInt, userId);

  // Étape 2 : déchiffrer le contenu
  const decryptedText = await decryptWithAesGcm(message.content, aesKey);

  // Étape 3 : reconstruire un objet Message conforme
  return {
    ...message,
    content: decryptedText,
    message_id: (message.message_id),
    sender: {
      ...message.sender,
      user_id: (message.sender.user_id),
    },
    reads: message.reads.map(read => ({
      user_id: (read.user_id),
      read_at: read.read_at,
    })),
    signal_type: signal_type.toString(),
    registrationId: '',
    preKeyId: '',
    signedPreKeyId: '',
  };
}
