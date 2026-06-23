import React from 'react';
import { Link } from 'react-router-dom';
import { FiCompass } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="flex justify-center mb-5 text-indigo-500">
          <FiCompass className="w-16 h-16 animate-pulse" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">404</h1>
        <h2 className="text-lg font-bold text-slate-600 mt-1">Page Not Found</h2>
        <p className="mt-3 text-slate-500 text-sm leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/dashboard"
            className="inline-flex justify-center px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-200"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
