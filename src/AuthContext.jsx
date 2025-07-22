import React, { createContext, useState, useEffect, useContext } from 'react';
import jwt_decode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('v-coach-token'));
  const [isInitializing, setIsInitializing] = useState(true); // New state to handle initial load
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwt_decode(token);
        if (decoded.exp * 1000 > Date.now()) {
          setUser(decoded);
        } else {
          // Token expired, clear it
          localStorage.removeItem('v-coach-token');
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        // Invalid token, clear it
        localStorage.removeItem('v-coach-token');
        setToken(null);
        setUser(null);
      }
    }
    // Mark initialization as complete
    setIsInitializing(false);
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await axios.post('/.netlify/functions/login', { username, password });
      const { token } = response.data;
      localStorage.setItem('v-coach-token', token);
      setToken(token);
      navigate('/admin'); // Redirect to admin dashboard on successful login
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error.response?.data?.message || error.message);
      return { success: false, message: error.response?.data?.message || 'Login failed.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('v-coach-token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isInitializing }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
