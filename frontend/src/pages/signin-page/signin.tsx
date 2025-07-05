import React, { useState } from 'react';
import './signin.css';
import { validate } from 'react-email-validator';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import instance from '../../api/instance';
import { base64ToArrayBuffer, base64ToUint8Array } from '../../utils/encoding';
import { generateInitialKeyBundle, storeKeysLocally } from '../../utils/crypto/key-manager';
import signalProtocolStore, { SignalProtocolStore } from '../../utils/crypto/signal-store';

const SignIn = () => {

    const navigate = useNavigate();

    const [signin_email, setEmail] = useState('');
    const [signin_password, setPassword] = useState('');
  
    const handleEmailChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
      setEmail(e.target.value);
    };

    const handlePasswordChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
      setPassword(e.target.value);
    };
  
    const handleSigninSubmission = async (e: { preventDefault: () => void }) => {
      e.preventDefault();

      const valid = await validate(signin_email);
      if (!valid) {
        alert('Please enter a valid email address.');
        return;
      }

      try {
        // 🔐 Authentification
        const response = await instance.post('/auth/login', {
          email: signin_email,
          password: signin_password,
        });

        const { accessToken, user } = response.data;
        const userId = user.id;

        // 🍪 Cookies
        Cookies.set('email', signin_email, { expires: 1 });
        Cookies.set('accessToken', accessToken, {
          expires: 15,
          secure: true,
          sameSite: 'Strict',
        });
        Cookies.set('userId', userId.toString(), { expires: 1 });

        // 🔎 Vérification des clés déjà présentes localement
        const identityKey = await signalProtocolStore.get('identityKey');
        console.log('🔑 Clé d\'identité locale:', identityKey);

        if (!identityKey || !identityKey.privKey) {
          console.log('[Auth] Aucune clé privée locale. Génération d’un nouveau bundle...');

          const {
            identityKey: generatedIdentityKey,
            signedPreKey,
            registrationId,
            oneTimePreKeys
          } = await generateInitialKeyBundle();

          // 📤 Envoi des parties publiques au serveur
          await instance.post('/keys/upload', {
            identityKey: generatedIdentityKey.public_key,
            signedPreKey: {
              key_id: signedPreKey.key_id,
              public_key: signedPreKey.public_key,
              signature: signedPreKey.signature,
            },
            oneTimePreKeys: oneTimePreKeys.map(p => ({
              key_id: p.key_id,
              public_key: p.public_key,
            })),
          });

          // 💾 Stockage local (clé complète)
          await storeKeysLocally({
            identity_key: {
              pubKey: base64ToUint8Array(generatedIdentityKey.public_key),
              privKey: new Uint8Array(generatedIdentityKey.private_key),
            },
            registration_id: registrationId,
            signed_pre_key: {
              key_id: signedPreKey.key_id,
              keyPair: {
                pubKey: base64ToUint8Array(signedPreKey.public_key),
                privKey: new Uint8Array(signedPreKey.private_key),
              },
              signature: base64ToUint8Array(signedPreKey.signature),
            },
            one_time_pre_keys: oneTimePreKeys.map(preKey => ({
              key_id: preKey.key_id,
              keyPair: {
                pubKey: new Uint8Array(preKey.public_key),
                privKey: new Uint8Array(preKey.private_key),
              },
            })),
          });

        } else {
          console.log('[Auth] Clés Signal déjà présentes localement.');
        }

        alert('Signed in successfully!');
        navigate('/dashboard', { replace: true });

      } catch (error: any) {
        if (error.response) {
          if (error.response.status === 404) {
            console.warn('User not registered');
            alert('You are not registered');
          } else {
            console.error('Server error:', error.response.statusText);
            alert('An error occurred during sign-in.');
          }
        } else {
          console.error('Network error:', error);
          alert('Network error. Please try again later.');
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