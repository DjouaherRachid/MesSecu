import instance from "../utils/config";

export const createConversation = async (
  name: string,
  participants: number[],
  picture_url?: string
) => {
  try {
    const payload = {
      name,
      participants,
      ...(picture_url ? { picture_url } : {}),
    };

    const res = await instance.post('/conversations', payload);
    return res.data;
  } catch (error) {
    console.error("Erreur lors de la création de la conversation :", error);
    throw error;
  }
};

export const fetchMyConversations = async () => {
  try {
    const res = await instance.get('/conversations/me');

    if (res.status < 200 || res.status >= 300) {
      throw new Error(`Erreur API: ${res.status}`);
    }

    const data = res.data;

    // Suppression de doublons par ID si nécessaire
    return Array.from(new Map(data.map((c: { id: number }) => [c.id, c])).values());
  } catch (error) {
    console.error("Erreur lors de la récupération des conversations :", error);
    throw error;
  }
};

export const fetchConversationById = async (conversationId: number) => {
  try {
    const res = await instance.get(`/conversations/${conversationId}`);

    if (res.status < 200 || res.status >= 300) {
      throw new Error(`Erreur API: ${res.status}`);
    }

    return res.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de la conversation ${conversationId} :`, error);
    throw error;
  }
};
