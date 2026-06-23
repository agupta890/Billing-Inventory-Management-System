import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  FiGrid, 
  FiBook, 
  FiFileText, 
  FiLayers, 
  FiPercent, 
  FiTrendingUp, 
  FiSettings, 
  FiLogOut 
} from 'react-icons/fi';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null;

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: FiGrid, roles: ['owner', 'employee'] },
    { name: 'Products', path: '/products', icon: FiBook, roles: ['owner', 'employee'] },
    { name: 'Billing', path: '/billing', icon: FiFileText, roles: ['owner', 'employee'] },
    { name: 'Inventory', path: '/inventory', icon: FiLayers, roles: ['owner', 'employee'] },
    { name: 'Discounts', path: '/discounts', icon: FiPercent, roles: ['owner'] },
    { name: 'Reports', path: '/reports', icon: FiTrendingUp, roles: ['owner', 'employee'] },
    { name: 'Settings', path: '/settings', icon: FiSettings, roles: ['owner'] },
  ];

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      await logout();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 lg:translate-x-0 lg:static lg:h-[calc(100vh-64px)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo Info (Only visible on mobile sidebar drawer since header handles desktop logo) */}
        <div className="flex items-center gap-3 px-6 py-5 lg:hidden border-b border-slate-800">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-lg">
            B
          </div>
          <div>
            <h2 className="text-white font-semibold leading-none">Bookstore</h2>
            <span className="text-xs text-indigo-400 font-medium">Management System</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {links
            .filter((link) => link.roles.includes(user.role))
            .map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => {
                    if (window.innerWidth < 1024) toggleSidebar();
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
        </nav>

        {/* User Footer Profile & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between gap-3 px-2 py-1">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-indigo-400 font-medium capitalize">{user.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Log out"
            >
              <FiLogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
