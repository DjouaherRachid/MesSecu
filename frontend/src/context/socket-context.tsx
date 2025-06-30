import Cookies from 'js-cookie';
import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | undefined>(Cookies.get('accessToken'));
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Fonction pour vérifier périodiquement la présence du token
    const checkTokenInterval = setInterval(() => {
      const currentToken = Cookies.get('accessToken');
      if (currentToken !== token) {
        setToken(currentToken);
      }
    }, 1000); // vérifie toutes les secondes

    return () => clearInterval(checkTokenInterval);
  }, [token]);

  useEffect(() => {
    if (!token) {
      // Pas de token : déconnecter la socket si elle existe
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Crée une nouvelle socket avec le token
    const newSocket = io(process.env.REACT_APP_BACKEND_URL || '', {
      extraHeaders: {
        auth: token,
      },
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
