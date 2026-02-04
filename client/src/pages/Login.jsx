import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-[380px]">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🐦</span>
            <span className="text-3xl font-semibold text-white">Chirp</span>
          </div>
        </div>

        <div className="card p-8">
          <h1 className="text-2xl font-semibold text-white mb-6">Sign in</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm border border-red-500/20">
                {error}
              </div>
            )}

            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username or email"
                className="input-clean w-full"
                required
              />
            </div>

            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="input-clean w-full"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-[#71767b] mt-6 text-center text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#a855f7] hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        <div className="mt-6 card p-4">
          <p className="text-[#71767b] text-xs mb-3 text-center">Demo accounts</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-[#71767b]">
              <span className="text-[#e7e9ea]">swyx</span>
              <span className="text-xs ml-1">234d 🔥</span>
            </div>
            <div className="text-[#71767b]">
              <span className="text-[#e7e9ea]">cassidoo</span>
              <span className="text-xs ml-1">156d 🔥</span>
            </div>
            <div className="text-[#71767b]">
              <span className="text-[#e7e9ea]">naval</span>
              <span className="text-xs ml-1">128d 🔥</span>
            </div>
            <div className="text-[#71767b]">
              <span className="text-[#e7e9ea]">dan_abramov</span>
            </div>
          </div>
          <p className="text-[#71767b] text-xs mt-3 text-center">Password: password123</p>
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <span className="badge badge-subtle">Vibes</span>
          <span className="badge badge-subtle">Reactions</span>
          <span className="badge badge-subtle">Polls</span>
          <span className="badge badge-subtle">Achievements</span>
          <span className="badge badge-subtle">Code</span>
        </div>
      </div>
    </div>
  );
}
