// src/pages/Settings.jsx
import React from 'react';
import { User } from 'lucide-react';

const Settings = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Admin Settings</h1>
      <div className="max-w-2xl mx-auto space-y-10">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-slate-700 mb-4 flex items-center gap-2"><User size={20} /> User Profile</h2>
          <div className="flex items-center">
            <span className="text-slate-600 font-medium">Logged in as:</span>
            <span className="ml-2 font-bold text-blue-600">admin</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;