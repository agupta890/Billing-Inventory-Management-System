import React, { useContext } from 'react';
import { SettingsContext } from '../../context/SettingsContext';

const Footer = () => {
  const { settings } = useContext(SettingsContext);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-4 px-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-medium text-slate-400">
      <span>
        &copy; {currentYear} {settings?.companyName || 'Bookstore Inventory System'}. All rights reserved.
      </span>
      <span className="flex items-center gap-1.5">
        Designed with premium care &bull; <span className="text-slate-500">v1.0.0</span>
      </span>
    </footer>
  );
};

export default Footer;
