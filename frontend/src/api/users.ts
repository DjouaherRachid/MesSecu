import instance from "./instance";

export const fetchMyContacts = async () => {
    try{
        // const res = await instance.get('/users/me/contacts');
        const res = await instance.get('/users/'); // temporaire
        return res.data;
    }catch (error) {
        console.error("Erreur lors de la récupération des contacts :", error);
        throw error;
    }
};

export const fetchUserById = async (userId: number) => {
    try {
        const res = await instance.get(`/users/${userId}`);
        return res.data; // Typiquement { user_id: number, name: string, username: string, email: string }
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur :', error);
        throw error;
    }
}