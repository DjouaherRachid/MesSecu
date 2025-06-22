import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import instance from './config.js'; 

const ProtectedRoute = ({ element: Component, ...rest }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    console.log("ProtectedRoute useEffect called");
    const checkSession = async () => {
      try {
        // Appelle /users/me pour valider le token en backend
        await instance.get('/users/me');
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkSession();
  }, []);

  if (isAuthenticated === null) {
    // Chargement pendant vérification
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Component {...rest} /> : <Navigate to="/signin" />;
};

export default ProtectedRoute;
