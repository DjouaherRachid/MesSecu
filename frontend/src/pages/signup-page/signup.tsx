import React, { useState } from 'react';
import './signup.css';
import { validate } from 'react-email-validator';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import instance from '../../api/instance';
import { handleSignalKeyGenerationAndStorage } from './signal';
import { loginUser, registerUser } from '../../api/auth';
import { handleRSAKeyGenerationAndStorage } from '../../utils/AES-GSM/rsa';
import { clearAllBrowserData } from '../../utils/delete-browser-data';
import { exportKeyPairToJson, saveKeyPairAsFile } from '../../utils/AES-GSM/key-export-import';
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

const SignUp = () => {

    const navigate = useNavigate();

    const [signup_username, setUsername] = useState('');
    const [signup_email, setEmail] = useState('');
    const [signup_password, setPassword] = useState('');
  
    const handleUsernameChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
      setUsername(e.target.value);
    };

    const handleEmailChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
      setEmail(e.target.value);
    };

    const handlePasswordChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
      setPassword(e.target.value);
    };

    function validatePassword(password : string) {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s]).{8,}$/;

      // Vérifie qu'il n'y a aucun espace
      const hasNoSpaces = !/\s/.test(password);

      return passwordRegex.test(password) && hasNoSpaces;
    }

    async function rollBackChanges() {
                const userId = Cookies.get('userId');
          // Rollback si la création des clés échoue
          if (userId) {
            try {
              await instance.delete(`/internal/users/${userId}`, {
                headers: { 'x-internal-api-key': INTERNAL_API_KEY }
              });
              alert('La création de l\'utilisateur a été annulée en raison d\'une erreur lors de la configuration des clés.');
            } catch (deleteError) {
              console.error('Échec de la suppression de l\'utilisateur après l\'échec de la configuration des clés :', deleteError);
              alert('Erreur critique : utilisateur créé mais échec de la configuration des clés.');
            }
          } else {
            alert('Erreur réseau. Veuillez réessayer plus tard.');
          }
    }

    const handleSignupSubmission = async (e: { preventDefault: () => void }) => {
      e.preventDefault();
      clearAllBrowserData();

      // Validation email + mot de passe
      const valid = await validate(signup_email);
      if (!valid) {
        alert('Veuillez entrer une adresse e-mail valide.');
        return;
      }

      const isValidPassword = validatePassword(signup_password);
      if (!isValidPassword) {
        alert('Le mot de passe doit comporter au moins 8 caractères, contenir au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial.');
        return;
      }

      try {
        const payload = {
          email: signup_email,
          username: signup_username,
          password: signup_password,
          rsa_public_key: 'placeholder' 
        };

        // Enregistrement utilisateur
        const response = await registerUser(payload);

        const { message, userId } = response;
        Cookies.set('email', signup_email, { expires: 1 });
        Cookies.set('userId', userId.toString(), { expires: 1 });
        
        alert('Votre compte a été créé avec succès.');

          const loginResponse = await loginUser({
                email: signup_email,
                password: signup_password});
        
          const { accessToken } = loginResponse;
        
          Cookies.set('email', signup_email, { expires: 1 });
          Cookies.set('accessToken', accessToken, {
                  expires: 15,
                  secure: true,
                  sameSite: 'Strict',
                });
          Cookies.set('userId', userId.toString(), { expires: 1 });

        // Gestion des clés 
        // await handleSignalKeyGenerationAndStorage(userId);
        const keys = await handleRSAKeyGenerationAndStorage(userId);

        // Exporter la paire de clés en JSON et la télécharger
        const keyPairJson = await exportKeyPairToJson(keys.privateKey, keys.publicKey);
        saveKeyPairAsFile(keyPairJson, `rsa-keypair-${userId}.json`);
        alert("Votre clé privée a été téléchargée. Conservez-la précieusement, elle est indispensable pour accéder à vos messages chiffrés si vous changez d'appareil ou de navigateur.");

        navigate('/dashboard');

      } catch (error: any) {
        await rollBackChanges(); // Rollback en cas d'erreur
        // Gestion des erreurs
        if (error.response) {
          if (error.response.status === 409) {
            alert('Email or username already exists');
          } else {
            console.error('An error occurred:', error.response.statusText);
            alert('An error occurred during registration.');
          }
        } else {
          console.error('Network or key error:', error);
          
        }
      }
    };

    return (
      <div className="animated-background">
      <div className='center-container'>
          <div>
                <div className="wave"></div>
                <div className="wave"></div>
                <div className="wave"></div>
          </div>
        <div className="form-container">
          <h2>S'inscrire</h2>
          <form onSubmit={handleSignupSubmission}>
            <div className="form-group">
              <label>Nom d'utilisateur</label>
              <input
                type="username"
                value={signup_username}
                onChange={handleUsernameChange}
                required
              />
              <label>Email</label>
              <input
                type="email"
                value={signup_email}
                onChange={handleEmailChange}
                required
              />
              <label>Mot de passe</label>
              <input
                type="password"
                value={signup_password}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <button type="submit">S'inscrire</button>
            Vous avez déjà un compte? <a href="/signin">Se connecter</a>
          </form>
        </div>
      </div>    
      </div>
    );
  }

export default SignUp;