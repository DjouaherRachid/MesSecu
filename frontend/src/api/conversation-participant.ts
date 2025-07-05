import instance from "../utils/instance";

export const toggleFavoriteConversation = async (participantId: number, isFavorite: boolean) => {
  try {
    const res = await instance.put(`/participants/${participantId}/favorite`, { isFavorite });
    return res.data;
  } catch (error) {
    console.error("Erreur lors du toggle favori :", error);
    throw error;
  }
};

export const fetchFavoriteConversations = async () => {
  try {
    const res = await instance.get('/participants/favorites/me');
    return res.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des favoris :", error);
    throw error;
  }
};
