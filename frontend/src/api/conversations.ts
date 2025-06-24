import instance from "../utils/config";

export const fetchMyConversations = async () => {
  const res = await instance.get('/conversations/me');


  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Erreur API: ${res.status}`);
  }

  const data = res.data;

  // Suppression de doublons par ID si nécessaire
  return Array.from(new Map(data.map((c: { id: number; }) => [c.id, c])).values());
};
