// src/components/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, QrCode, Database, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { icon: LayoutDashboard, name: 'Dashboard', path: '/' },
  { icon: PlusCircle, name: 'Add Component', path: '/add-component' },
  { icon: QrCode, name: 'Scan Codes', path: '/scan' },
  { icon: Database, name: 'Database Viewer', path: '/database' },
  { icon: Settings, name: 'Settings', path: '/settings' },
];

// --- The Sidebar now accepts props to control its state ---
const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  const handleLinkClick = () => {
    // Close the sidebar when a link is clicked on mobile
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <aside
      className={`
        bg-slate-800 text-slate-200 flex flex-col z-20
        fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:w-64 md:flex-shrink-0
        ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}
      `}
    >
      <div className="h-20 flex items-center justify-center border-b border-slate-700">
        <h1 className="text-xl font-bold">Rail-DPM</h1>
      </div>
      <nav className="flex-grow px-4 py-6">
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            end
            onClick={handleLinkClick} // <-- Close on click
            className={({ isActive }) =>
              `flex items-center px-4 py-3 mb-2 rounded-lg transition-colors duration-200 ${
                isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'
              }`
            }
          >
            <link.icon className="w-5 h-5 mr-3" />
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-slate-700">
        <button
          onClick={() => {
            logout();
            onClose(); // Ensure sidebar closes on logout
          }}
          className="flex items-center w-full px-4 py-3 rounded-lg text-slate-200 hover:bg-red-600 hover:text-white transition-colors duration-200"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;