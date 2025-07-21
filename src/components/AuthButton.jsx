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
        <span className="font-semibold text-sm">{user.username}</span>
        <button onClick={logout} className="h-9 px-3 bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium">
          Logout
        </button>
      </div>
    );
  }

  return (
    <button onClick={handleLogin} className="h-9 px-3 bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium">
      Login with Discord
    </button>
  );
}

export default AuthButton;
