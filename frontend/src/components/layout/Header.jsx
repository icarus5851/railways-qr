// src/components/layout/Header.jsx
import React from 'react';
import { Menu } from 'lucide-react';

const Header = ({ onMenuClick }) => {
  return (
    <header className="bg-white shadow-md p-4 flex items-center md:hidden">
      {/* Hamburger menu button, only visible on mobile (md:hidden) */}
      <button onClick={onMenuClick} className="text-slate-700">
        <Menu size={24} />
      </button>
      <h1 className="text-lg font-bold text-slate-800 ml-4">Rail-DPM</h1>
    </header>
  );
};

export default Header;