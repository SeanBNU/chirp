import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const demoAccounts = [
  { username: 'swyx', name: 'swyx', streak: 234 },
  { username: 'dan_abramov', name: 'Dan Abramov', streak: 156 },
  { username: 'sarah_edo', name: 'Sarah Drasner', streak: 89 },
  { username: 'kentcdodds', name: 'Kent C. Dodds', streak: 312 },
  { username: 'cassidoo', name: 'Cassidy Williams', streak: 145 },
];

export function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const handleDemoLogin = async (demoUsername: string) => {
    setError('');
    try {
      await login(demoUsername, 'password123');
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🐦 Chirp</h1>
          <p className="text-[#71767b]">Where developers share thoughts</p>
        </div>

        <div className="card p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Sign in</h2>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full input-clean"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full input-clean"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link to="/register" className="text-[#a855f7] hover:underline">
              Create an account
            </Link>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-4">Demo accounts</h3>
          <p className="text-sm text-[#71767b] mb-4">
            Click any account to log in instantly (password: password123)
          </p>
          <div className="space-y-2">
            {demoAccounts.map((account) => (
              <button
                key={account.username}
                onClick={() => handleDemoLogin(account.username)}
                disabled={isLoading}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.05] transition-colors text-left"
              >
                <div>
                  <div className="font-medium">{account.name}</div>
                  <div className="text-sm text-[#71767b]">@{account.username}</div>
                </div>
                <div className="text-sm text-orange-400">
                  {account.streak}d 🔥
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {['Vibes', 'Reactions', 'Streaks', 'Polls', 'Code Snippets'].map((feature) => (
              <span key={feature} className="badge badge-subtle">{feature}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
