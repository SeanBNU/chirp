import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { login, demoLogin } = useAuth();
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

  const handleDemoLogin = async () => {
    setError('');
    setDemoLoading(true);

    try {
      await demoLogin();
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-3">
            <span className="text-5xl">🐦</span>
            <span className="text-4xl font-semibold text-white">Chirp</span>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-center text-[#71767b] mb-8 text-lg">
          A developer social network with vibes, reactions, and achievements.
        </p>

        {/* Demo button - front and center */}
        <button
          onClick={handleDemoLogin}
          disabled={demoLoading}
          className="w-full py-4 px-6 rounded-full text-lg font-semibold text-white transition-all duration-200"
          style={{
            background: demoLoading
              ? '#6b21a8'
              : 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)',
          }}
          onMouseEnter={(e) => {
            if (!demoLoading) e.target.style.boxShadow = '0 0 30px rgba(168, 85, 247, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.boxShadow = '0 0 20px rgba(168, 85, 247, 0.3)';
          }}
        >
          {demoLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Signing in...
            </span>
          ) : (
            'Try the Demo'
          )}
        </button>

        <p className="text-center text-[#71767b] text-sm mt-3">
          Jump right in — no account needed
        </p>

        {error && (
          <div className="mt-4 bg-red-500/10 text-red-400 p-3 rounded-lg text-sm border border-red-500/20">
            {error}
          </div>
        )}

        {/* Feature badges */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <span className="badge badge-subtle">Vibes</span>
          <span className="badge badge-subtle">Reactions</span>
          <span className="badge badge-subtle">Polls</span>
          <span className="badge badge-subtle">Achievements</span>
          <span className="badge badge-subtle">Code Snippets</span>
          <span className="badge badge-subtle">Streaks</span>
        </div>

        {/* Divider */}
        <div className="mt-8 flex items-center gap-4">
          <div className="flex-1 h-px bg-[#2f3336]" />
          <span className="text-[#71767b] text-xs uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-[#2f3336]" />
        </div>

        {/* Collapsible sign-in */}
        <div className="mt-6">
          {!showLogin ? (
            <button
              onClick={() => setShowLogin(true)}
              className="w-full py-3 px-6 rounded-full text-sm font-medium text-[#a855f7] border border-[#2f3336] hover:border-[#a855f7]/50 hover:bg-[#a855f7]/5 transition-all duration-200"
            >
              Sign in with an existing account
            </button>
          ) : (
            <div className="card p-6 animate-fadeIn">
              <form onSubmit={handleSubmit} className="space-y-4">
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

              <p className="text-[#71767b] mt-4 text-center text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="text-[#a855f7] hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
