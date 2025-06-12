import { useState } from 'react';
import axios from '../../api/api'; 

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token); // stocke le JWT
      // rediriger ou afficher un succès
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Mot de passe" />
      <button type="submit">Se connecter</button>
    </form>
  );
}
