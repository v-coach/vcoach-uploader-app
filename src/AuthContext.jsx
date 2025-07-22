import React, { createContext, useState, useEffect, useContext } from 'react';
import jwt_decode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('v-coach-token'));
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwt_decode(token);
        if (decoded.exp * 1000 > Date.now()) {
          setUser(decoded);
        } else {
          logout(); // Token expired
        }
      } catch (error) {
        logout(); // Invalid token
      }
    }
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
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
