import React, { useState } from 'react';
import './signup.css';
import { validate } from 'react-email-validator';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import instance from '../../utils/config';

const SignUp = () => {

    const navigate = useNavigate();

    const [signup_username, setUsername] = useState('');
    const [signup_email, setEmail] = useState('');
    const [signup_password, setPassword] = useState('');
  
    const handleUsernameChange = (e) => {
      setUsername(e.target.value);
    };

    const handleEmailChange = (e) => {
      setEmail(e.target.value);
    };

    const handlePasswordChange = (e) => {
      setPassword(e.target.value);
    };

    function validatePassword(password) {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s]).{8,}$/;

      // Vérifie qu'il n'y a aucun espace
      const hasNoSpaces = !/\s/.test(password);

      return passwordRegex.test(password) && hasNoSpaces;
    }

    const handleSignupSubmission = async (e) => {
      e.preventDefault();
      const valid = await validate(signup_email); 
      if (!valid) {
        alert('Please enter a valid email address.');
        return;
      }

      const isValidPassword = validatePassword(signup_password);
      console.log("signup_password", signup_password);
      console.log("isValidPassword", isValidPassword);

      if (!isValidPassword) {
        alert('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
        return;
      }

      instance.post('/auth/register', {
        username: signup_username,
        email: signup_email,
        password: signup_password,
      })
      .then(response => {
        // Traitement pour une création réussie
        console.log('User created successfully with ID:', response.data);
        console.log("email", signup_email);
        Cookies.set('email', signup_email, { expires: 1 });

        alert('Your account has been registered successfully!');
        navigate('/doubleAuth');
      })
      .catch(error => {
        if (error.response) {
          if (error.response.status === 409) {
            console.log('Email already exists');
            alert('Email already exists');
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