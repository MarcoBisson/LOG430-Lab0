import { use, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getToken } from '../APIs/AuthAPI';
import { useAuthStore } from '../stores/useAuthStore';

export default function LoginPage() {
  const [username, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const setUser = useAuthStore(state => state.setUser);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { user, token } = await getToken(username, password)
      localStorage.setItem('token', token);
      setUser(user);

      toast.info('Connexion avec succès');

      if (user.role === 'CLIENT') {
        navigate('/sales');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      toast.error('Une erreur est survenue')
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto' }}>
      <h1>Connexion</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label>Username :</label>
          <input
            type="text"
            value={username}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Mot de passe :</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">Se connecter</button>
      </form>
    </div>
  );
}
