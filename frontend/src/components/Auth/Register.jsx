import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiPhone, FiLock, FiBookOpen } from 'react-icons/fi';

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone || !password || !role) {
      return toast.error('Please fill in all fields');
    }
    if (name.length < 3) {
      return toast.error('Name must be at least 3 characters');
    }
    if (phone.length !== 10) {
      return toast.error('Phone number must be exactly 10 digits');
    }
    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      await register(name, phone, password, role);
      toast.success('Registration successful! Welcome.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] -top-40 -left-40 animate-pulse pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-[120px] -bottom-40 -right-40 animate-pulse delay-1000 pointer-events-none" />

      {/* Card Wrapper */}
      <div className="max-w-md w-full bg-slate-950/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-slate-800 relative z-10 my-8">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-bold text-2xl shadow-lg shadow-indigo-500/20 mb-4">
            <FiBookOpen className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Create Account</h2>
          <p className="text-slate-400 text-xs mt-1.5 font-medium">Join the bookstore inventory & billing system</p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                <FiUser className="w-5 h-5" />
              </span>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-white placeholder-slate-500 text-sm font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Phone Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                <FiPhone className="w-5 h-5" />
              </span>
              <input
                id="phone"
                type="tel"
                maxLength={10}
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit mobile number"
                className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-white placeholder-slate-500 text-sm font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                <FiLock className="w-5 h-5" />
              </span>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 6 characters)"
                className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-white placeholder-slate-500 text-sm font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Role Choice */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              System Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('employee')}
                className={`py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  role === 'employee'
                    ? 'border-indigo-500 bg-indigo-500/10 text-white font-bold'
                    : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                Employee
              </button>
              <button
                type="button"
                onClick={() => setRole('owner')}
                className={`py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  role === 'owner'
                    ? 'border-indigo-500 bg-indigo-500/10 text-white font-bold'
                    : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                Store Owner
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/35 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
            ) : (
              'Register Account'
            )}
          </button>
        </form>

        {/* Login Redirect */}
        <div className="mt-6 text-center border-t border-slate-800/80 pt-4">
          <p className="text-xs text-slate-400 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors ml-1">
              Sign in instead
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;
