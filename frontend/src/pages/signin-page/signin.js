import React, { useState } from 'react';
import './signin.css';
import { validate } from 'react-email-validator';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import instance from '../../utils/config';

const SignIn = () => {

    const navigate = useNavigate();

    const [signin_email, setEmail] = useState('');
    const [signin_password, setPassword] = useState('');
  
    const handleEmailChange = (e) => {
      setEmail(e.target.value);
    };

    const handlePasswordChange = (e) => {
      setPassword(e.target.value);
    };
  
    const handleSigninSubmission = async (e) => {
      e.preventDefault();
      const valid = await validate(signin_email); 
      if (!valid) {
        alert('Please enter a valid email address.');
        return;
      }

      console.log("signin_email", signin_email);

      instance.post('/auth/login', {
        email: signin_email,
        password: signin_password,
      })
      .then(response => {
        // Traitement pour une création réussie
        console.log('User created successfully with ID:', response.data);
        console.log("email", signin_email);
        Cookies.set('email', signin_email, { expires: 1 });

        alert('Signed in succesfully !');
        navigate('/doubleAuth');
      })
      .catch(error => {
        if (error.response) {
          if (error.response.status === 404) {
            console.log('You are not registered');
            alert('You are not registered');
          } else {
            console.log('An error occurred:', error.response.statusText);
            alert('An error occured:');
          }
        } else {
          console.error('Network error:', error);
          alert('Network error:');
        }
      });    

    };
  
    return (
        <div className="animated-background">
        <div className='center-container'>
          <div>
                <div class="wave"></div>
                <div class="wave"></div>
                <div class="wave"></div>
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