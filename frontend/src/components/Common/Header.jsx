import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { SettingsContext } from '../../context/SettingsContext';
import { FiMenu, FiUser, FiLogOut } from 'react-icons/fi';

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);
  const { settings, fetchSettings } = useContext(SettingsContext);

  useEffect(() => {
    if (user && !settings) {
      fetchSettings().catch(err => console.error('Failed to load store settings in header:', err.message));
    }
  }, [user, settings, fetchSettings]);

  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between w-full h-16 px-6 bg-white border-b border-slate-100 shadow-sm">
      {/* Brand & Toggle Container */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-50 lg:hidden"
        >
          <FiMenu className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3">
          {settings?.logo?.url ? (
            <img 
              src={settings.logo.url} 
              alt="Logo" 
              className="w-9 h-9 object-contain rounded-md"
            />
          ) : (
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-bold text-lg shadow-md shadow-indigo-500/20">
              B
            </div>
          )}
          <span className="text-lg font-bold text-slate-800 tracking-tight hidden sm:block">
            {settings?.companyName || 'Bookstore Inventory'}
          </span>
        </div>
      </div>

      {/* User Actions Container */}
      <div className="flex items-center gap-3">
        {/* User Info Details (Desktop) */}
        <div className="hidden md:flex flex-col items-end leading-none">
          <span className="text-sm font-semibold text-slate-700">{user.name}</span>
          <span className="text-[11px] font-medium text-slate-400 capitalize mt-0.5">{user.role}</span>
        </div>

        {/* User Avatar Bubble */}
        <div className="relative group">
          <button className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 font-semibold transition-all duration-200">
            {user.name ? user.name.slice(0, 2).toUpperCase() : <FiUser className="w-5 h-5" />}
          </button>

          {/* Quick Dropdown on Hover */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl py-1 hidden group-hover:block transition-all duration-300">
            <div className="px-4 py-2 border-b border-slate-50 md:hidden">
              <p className="text-sm font-semibold text-slate-700">{user.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user.role}</p>
            </div>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to log out?')) {
                  logout();
                }
              }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-sm text-rose-500 hover:bg-rose-50/50 transition-colors"
            >
              <FiLogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
