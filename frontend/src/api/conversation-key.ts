import instance from "./instance";

export const createConversationKey = async (data: {
  conversation_participant_id: number;
  user_id: number;
  encrypted_aes_key: string;
}) => {
  try {
    const res = await instance.post('/conversation-keys', data);
    return res.data;
  } catch (error) {
    console.error('Erreur lors de la création de la conversation key:', error);
    throw error;
  }
};

export const fetchEncryptedConversationKey = async (
  conversationId: number,
  userId: number
): Promise<{ encrypted_aes_key: string } | null> => {
  try {
    const res = await instance.get(`/conversation-keys/${conversationId}/${userId}`);
    return res.data; // { encrypted_aes_key: string }
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      console.warn(`[AES] Aucune clé AES trouvée côté serveur pour conversation ${conversationId}, utilisateur ${userId}`);
      return null;
    }
    console.error('Erreur lors de la récupération de la clé AES:', error);
    throw error;
  }
};

export const deleteConversationKey = async (conversationParticipantId: number) => {
  try {
    const res = await instance.delete(`/conversation-keys/${conversationParticipantId}`);
    return res.data;
  } catch (error) {
    console.error('Erreur lors de la suppression de la conversation key:', error);
    throw error;
  }
};
