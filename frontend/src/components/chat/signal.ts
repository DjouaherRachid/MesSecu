import { Message } from "../../types/message";
import { decodeSignalMessage } from "../../utils/signal/encryption";

export async function decryptAndNormalizeSignalMessage(
  data: any
): Promise<Message> {
  const { message, signal_type } = data;

  if (![1, 3].includes(signal_type)) {
    throw new Error(`Type de message Signal inconnu : ${signal_type}`);
  }

  const decodedText = await decodeSignalMessage({
    signal_type,
    message,
  });

  return {
    ...message,
    content: decodedText,
    message_id: parseInt(message.message_id),
    sender: {
      ...message.sender,
      user_id: parseInt(message.sender.user_id),
    },
    reads: message.reads.map((read: { user_id: string; read_at: any; }) => ({
      user_id: parseInt(read.user_id),
      read_at: read.read_at,
    })),
    signal_type: signal_type.toString(),
    registrationId: '',
    preKeyId: '',
    signedPreKeyId: '',
  };
}
