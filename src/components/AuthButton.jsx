import React from 'react';
import { useAuth } from '../AuthContext';

function AuthButton() {
  const { user, logout } = useAuth();

  const handleLogin = () => {
    window.location.href = '/.netlify/functions/discord-auth';
  };

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <span className="font-semibold">{user.username}</span>
        <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
          Logout
        </button>
      </div>
    );
  }

  return (
    <button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
      Login with Discord
    </button>
  );
}

export default AuthButton;
