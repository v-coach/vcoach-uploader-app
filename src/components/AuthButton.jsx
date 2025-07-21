import React from 'react';
import { useAuth } from '../AuthContext';

// SVG for the Discord logo
const DiscordIcon = () => (
  <svg aria-hidden="true" role="img" width="24" height="24" viewBox="0 0 24 24">
    <path fill="currentColor" d="M20.317 4.36981C18.699 3.50425 16.9423 2.85336 15.0993 2.44131C14.9403 2.72473 14.7695 3.03218 14.5866 3.36364C12.9575 3.13923 11.3204 3.13923 9.69128 3.36364C9.50838 3.03218 9.33758 2.72473 9.17859 2.44131C7.33564 2.85336 5.57898 3.50425 3.96098 4.36981C1.63594 7.01323 0.63699 9.94477 0.519992 13.04C1.72141 13.9137 3.04562 14.5818 4.47976 15.034C4.83389 14.4984 5.15894 13.9293 5.45491 13.3267C5.00288 13.1338 4.56285 12.9118 4.1348 12.6618C4.2838 12.5636 4.4298 12.4626 4.5718 12.3589C7.83082 14.3311 12.4333 14.3311 15.6923 12.3589C15.8343 12.4626 15.9803 12.5636 16.1293 12.6618C15.7013 12.9118 15.2612 13.1338 14.8092 13.3267C15.1052 13.9293 15.4302 14.4984 15.7843 15.034C17.2185 14.5818 18.5427 13.9137 19.7441 13.04C19.6351 9.94477 18.6282 7.01323 16.2952 4.36981L20.317 4.36981Z" />
    <path fill="currentColor" d="M8.22124 10.338C7.53424 10.338 6.96724 9.771 6.96724 9.084C6.96724 8.397 7.53424 7.83 8.22124 7.83C8.90824 7.83 9.47524 8.397 9.47524 9.084C9.47524 9.771 8.90824 10.338 8.22124 10.338Z" />
    <path fill="currentColor" d="M12 10.338C11.313 10.338 10.746 9.771 10.746 9.084C10.746 8.397 11.313 7.83 12 7.83C12.687 7.83 13.254 8.397 13.254 9.084C13.254 9.771 12.687 10.338 12 10.338Z" />
    <path fill="currentColor" d="M15.7788 10.338C15.0918 10.338 14.5248 9.771 14.5248 9.084C14.5248 8.397 15.0918 7.83 15.7788 7.83C16.4658 7.83 17.0328 8.397 17.0328 9.084C17.0328 9.771 16.4658 10.338 15.7788 10.338Z" />
  </svg>
);


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
    <button 
      onClick={handleLogin} 
      className="h-11 px-6 bg-indigo-500 text-white hover:bg-indigo-600 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-bold shadow-lg transition-colors"
    >
      <DiscordIcon />
      <span className="ml-2">Connect with Discord</span>
    </button>
  );
}

export default AuthButton;
