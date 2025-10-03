// src/App.jsx
import React, { useState } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header'; // <-- 1. IMPORT HEADER
import Dashboard from './pages/Dashboard';
import AddComponentPage from './pages/AddComponentPage';
import ScanPage from './pages/ScanPage';
import DatabaseViewer from './pages/DatabaseViewer';
import ComponentDetailsPage from './pages/ComponentDetailsPage';
import Settings from './pages/Settings';

// --- 2. THE APP LAYOUT IS NOW STATEFUL ---
const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Mobile Header with Hamburger Menu */}
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        
        {/* Page Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black opacity-50 z-10"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="add-component" element={<AddComponentPage />} />
          <Route path="scan" element={<ScanPage />} />
          <Route path="database" element={<DatabaseViewer />} />
          <Route path="component/:componentId" element={<ComponentDetailsPage />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;