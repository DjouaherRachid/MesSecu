export const fetchMyConversations = async (token: string) => {
  const res = await fetch('https://localhost:8000/conversations/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Erreur API: ${res.status}`);
  }

  const data = await res.json();

  // Suppression de doublons par ID si nécessaire
  return Array.from(new Map(data.map((c: { id: number; }) => [c.id, c])).values());
};
