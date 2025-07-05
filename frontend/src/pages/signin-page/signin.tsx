import React, { useState } from 'react';
import './signin.css';
import { validate } from 'react-email-validator';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { loginUser } from '../../api/auth';
import MissingPrivateKeyModal from '../../components/modals/missing-private-key/missing-private-key';

const SignIn = () => {

    const navigate = useNavigate();

    const [signin_email, setEmail] = useState('');
    const [signin_password, setPassword] = useState('');

    const [missingPrivateKey, setMissingPrivateKey] = useState(false);
  
    const handleEmailChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
      setEmail(e.target.value);
    };

    const handlePasswordChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
      setPassword(e.target.value);
    };
  
    const handleSigninSubmission = async (e: { preventDefault: () => void }) => {
      e.preventDefault();
      // clearAllBrowserData(); 

      const valid = await validate(signin_email);
      if (!valid) {
        alert('Please enter a valid email address.');
        return;
      }
      try {
      const response = await loginUser({
        email: signin_email,
        password: signin_password});

        const { accessToken, user } = response;
        const userId = user.id;

        Cookies.set('email', signin_email, { expires: 1 });
        
        const expirationDate = new Date(new Date().getTime() + 1 * 60 * 1000); // 15 minutes
        Cookies.set('accessToken', accessToken, {
          expires: expirationDate,
          secure: true,
          sameSite: 'Strict',
        });

        Cookies.set('userId', userId.toString(), { expires: 1 });

        // handleKeyGenerationAndStorage(userId);
        const privateKey = localStorage.getItem(`privateKey_${userId}`);

        if (!privateKey) {
          setMissingPrivateKey(true);
          return;
        }

        // handleRSAKeyGenerationAndStorage(userId);

        // alert('Signed in successfully!');
        navigate('/dashboard', { replace: true });

      } catch (error: any) {
        if (error.response) {
          switch (error.response.status) {
            case 401:
              alert('Mot de passe ou email invalide.');
              break;
            case 403:
              alert('Accès interdit. Veuillez contacter l\'administrateur.');
              break;
            case 404:
              alert('Vous n\'êtes pas enregistré. Veuillez vous inscrire.');
              break;
            default:
              alert('Une erreur est survenue lors de la connexion.');
          }
        } else {
          console.error('Erreur réseau:', error.response);
          console.error('Network error:', error);
          alert('Une erreur est survenue, veuillez réessayer.');
        }
      }
    };

  const handleKeyImported = (privateKey: CryptoKey, publicKey: CryptoKey) => {
    setMissingPrivateKey(false);
    handleSigninSubmission({ preventDefault: () => {} });
  };

    return (
        <div className="animated-background">
            {missingPrivateKey && <MissingPrivateKeyModal onKeyImported={handleKeyImported} />}
        <div className='center-container'>
          <div>
                <div className="wave"></div>
                <div className="wave"></div>
                <div className="wave"></div>
          </div>
          <div className="form-container">
            <h2>Se connecter</h2>
            <form onSubmit={handleSigninSubmission}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={signin_email}
                  onChange={handleEmailChange}
                  required
                />
                <label>Mot de passe</label>
                <input
                  type="password"
                  value={signin_password}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <button type="submit">Se connecter</button>
              Vous n'avez pas de compte ? <a href="/signup">S'inscrire</a>
            </form>
          </div>
        </div>
        </div>
      );
  }

export default SignIn;