// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);
const API_BASE_URL = 'http://localhost:8000/api';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      localStorage.setItem('authToken', token);
      // Set the token for all future axios requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('authToken');
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, { username, password });
      setToken(response.data.access_token);
      navigate('/'); // Redirect to dashboard on successful login
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed: Invalid username or password.');
    }
  };

  const logout = () => {
    setToken(null);
    navigate('/login'); // Redirect to login page on logout
  };

  const isAuthenticated = !!token;

  const value = { token, isAuthenticated, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};