import instance from "../utils/config";

export const fetchMessages = async (
  conversationId: number,
  before?: string,
  limit: number = 20
) => {
  const params: Record<string, any> = { limit };
  if (before) {
    params.before = before;
  }

  const res = await instance.get(`/messages/conversation/${conversationId}/paginated`, { params });

  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Erreur API: ${res.status}`);
  }

  return res.data; 
};