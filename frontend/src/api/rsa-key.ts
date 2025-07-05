import instance from "./instance";

export const updateRsaPublicKey = async (rsa_public_key: string) => {
  try {
    const res = await instance.post('/keys/rsa', { rsa_public_key });
    return res.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la clé RSA publique :', error);
    throw error;
  }
};

export const fetchRsaPublicKey = async (userId: number) => {
  try {
    const res = await instance.get(`/keys/rsa/${userId}`);
    return res.data; 
  } catch (error) {
    console.error('Erreur lors de la récupération de la clé RSA publique :', error);
    throw error;
  }
};
