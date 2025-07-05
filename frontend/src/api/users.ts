import instance from "../utils/instance";

export const fetchMyContacts = async () => {
    try{
        const res = await instance.get('/users/me/contacts');
        return res.data;
    }catch (error) {
        console.error("Erreur lors de la récupération des contacts :", error);
        throw error;
    }
};