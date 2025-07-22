import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(username, password);
    if (!result.success) {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="rounded-xl border border-white/20 bg-black/30 backdrop-blur-lg shadow-2xl p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Admin & Coach Login</h1>
          </div>
          <div>
            <label className="text-sm font-medium text-white/80 block mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-12 rounded-md border border-white/20 bg-transparent px-3 text-base text-white"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-white/80 block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 rounded-md border border-white/20 bg-transparent px-3 text-base text-white"
              required
            />
          </div>
          {error && <p className="text-sm text-red-400 text-center">{error}</p>}
          <div>
            <button type="submit" disabled={loading} className="w-full h-12 px-6 bg-sky-500 text-white hover:bg-sky-600 rounded-md text-base font-bold disabled:opacity-50">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
