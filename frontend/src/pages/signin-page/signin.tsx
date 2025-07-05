import React, { useState } from 'react';
import './signin.css';
import { validate } from 'react-email-validator';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import instance from '../../utils/instance';
import { base64ToArrayBuffer } from '../../utils/encoding';
import { storeKeysLocally } from '../../utils/crypto/key-manager';

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
        // Authentification
        const response = await instance.post('/auth/login', {
          email: signin_email,
          password: signin_password,
        });

        const { accessToken, user } = response.data;
        const userId = user.id;

        // Cookies
        Cookies.set('email', signin_email, { expires: 1 });
        Cookies.set('accessToken', accessToken, {
          expires: 15,
          secure: true,
          sameSite: 'Strict',
        });
        Cookies.set('userId', userId.toString(), { expires: 1 });

        // Récupération des clés Signal
        const [identityKeyRes, signedPreKeyRes, oneTimePreKeyRes] = await Promise.all([
          instance.get(`/identity-keys/${userId}`),
          instance.get(`/signed-pre-keys/${userId}`),
          instance.get(`/one-time-pre-keys/${userId}`),
        ]);

        const identityKey = identityKeyRes.data;
        const signedPreKey = signedPreKeyRes.data;
        const oneTimePreKey = oneTimePreKeyRes.data; 

        console.log('Identity Key:', identityKey);
        console.log('Signed Pre Key:', signedPreKey);
        console.log('One Time Pre Key:', oneTimePreKey);

        // Vérification des données
        if (
          !identityKey.public_key ||
          !signedPreKey.public_key ||
          !signedPreKey.signature ||
          !oneTimePreKey[0].public_key ||
          oneTimePreKey[0].used === true
        ) {
          throw new Error('Missing or invalid keys from server');
        }

        // Conversion en ArrayBuffer
        const identityPubKey = base64ToArrayBuffer(identityKey.public_key);
        const signedPrePubKey = base64ToArrayBuffer(signedPreKey.public_key);
        const signedPreSignature = base64ToArrayBuffer(signedPreKey.signature);
        const oneTimePreKeyArray = oneTimePreKey.map((preKey: { key_id: any; public_key: string; }) => ({
          key_id: preKey.key_id,
          public_key: base64ToArrayBuffer(preKey.public_key),
        }));

        console.log('Identity Key ArrayBuffer:', oneTimePreKeyArray);

        // Stockage local via libsignal
        await storeKeysLocally({
          identity_key: identityPubKey,
          signed_pre_key: {
            key_id: signedPreKey.key_id,
            public_key: signedPrePubKey,
            signature: signedPreSignature,
          },
          one_time_pre_keys: oneTimePreKeyArray,
        });

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