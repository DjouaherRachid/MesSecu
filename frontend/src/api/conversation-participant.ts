import instance from "../utils/config";

export const toggleFavoriteConversation = async (participantId: number, isFavorite: boolean) => {
  const res = await instance.put(`/participants/${participantId}/favorite`, {
    isFavorite,
  });

  return res.data;
};

export const fetchFavoriteConversations = async () => {
  const res = await instance.get('/participants/favorites/me');
  return res.data;
};
