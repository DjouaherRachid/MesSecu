import instance from "./instance";

export type RegisterPayload = {
  email: string;
  username: string;
  password: string;
  rsa_public_key: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export const registerUser = async (payload: RegisterPayload) => {
  try {
    const { data } = await instance.post('/auth/register', payload);
    return {
      message: data.message,
      userId: data.userId
    };
  } catch (error: any) {
    if (error.response?.status === 409) {
      throw new Error('Email déjà utilisé');
    }
    console.error('[Auth] Registration error:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Échec de l\'inscription');
  }
};

export const loginUser = async (payload: LoginPayload) => {
  try {
    const { data } = await instance.post('/auth/login', payload);
    
    return {
      accessToken: data.accessToken,
      user: data.user
    };
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error(error.response.data?.message || 'Identifiants invalides');
    }
    console.error('[Auth] Login error:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Échec de la connexion');
  }
};

export const refreshAccessToken = async () => {
  try {
    const response = await instance.post('/auth/refresh', {}, { withCredentials: true });
    const newAccessToken = response.data.accessToken;
    return response;
  } catch (err) {
    console.error('Échec du rafraîchissement du token');
  }
};

export const logoutUser = () => {
  delete instance.defaults.headers.common['Authorization'];
};