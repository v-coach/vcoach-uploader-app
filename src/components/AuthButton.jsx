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
        <span className="font-semibold text-sm text-white/90">{user.username}</span>
        <button onClick={logout} className="h-10 px-4 bg-white/10 text-white hover:bg-white/20 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium">
          Logout
        </button>
      </div>
    );
  }

  return (
    <button onClick={handleLogin} className="h-10 px-5 bg-white text-gray-900 hover:bg-gray-200 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-bold">
      Login with Discord
    </button>
  );
}

export default AuthButton;
