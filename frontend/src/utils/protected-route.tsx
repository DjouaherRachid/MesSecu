import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import instance from './config'; 

interface ProtectedRouteProps {
  element: React.ComponentType<any>;
  [key: string]: any;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element: Component, ...rest }) => {
  // Initialiser à null pour marquer "en cours de chargement"
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    console.log("ProtectedRoute useEffect called");
    const checkSession = async () => {
      try {
        // Appelle /users/me pour valider le token en backend
        await instance.get('/users/me');
        setIsAuthenticated(true);
        console.log("User is authenticated");
      } catch (error) {
        setIsAuthenticated(false);
        console.log("User is not authenticated", error);
      }
    };

    checkSession();
  }, []);

  if (isAuthenticated === null) {
    // Affiche un loader tant que la vérification est en cours
    return <div>Loading...</div>;
  }

  // Si authentifié, affiche le composant demandé, sinon redirige vers /signin
  return isAuthenticated ? <Component {...rest} /> : <Navigate to="/signin" replace />;
};

export default ProtectedRoute;
