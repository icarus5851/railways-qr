// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; 

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username && password) {
      await login(username, password);
    }
  };

  return (
    // --- UPDATED: Padding changed from p-8 to p-4 sm:p-8 ---
    <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="p-8 bg-white rounded-xl shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-slate-800 mb-6">Admin Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-600">Username</label>
            <input
              type="text" id="username" value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="input w-full px-3" // Added px-3 for padding
            />
          </div>
          <div>
            <label htmlFor="password"className="block text-sm font-medium text-slate-600">Password</label>
            <input
              type="password" id="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input w-full px-3" // Added px-3 for padding
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;