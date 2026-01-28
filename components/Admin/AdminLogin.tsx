
import React, { useState } from 'react';
import { User } from '../../types';
import { storage } from '../../services/StorageService';
import { ShieldAlert, Lock, User as UserIcon, LogIn, Eye, EyeOff, Info } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (user: User) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Fix: storage.login is an async function, so handleSubmit must be async to await it.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const user = await storage.login(username, password);
      if (user && user.role === 'admin') {
        onLogin(user);
      } else {
        setError('Access Denied: Invalid administrator credentials');
      }
    } catch (err) {
      setError('An error occurred during authentication process.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="p-10">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-slate-100 text-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-4 border-2 border-slate-50">
              <ShieldAlert size={40} />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">System Admin</h1>
            <p className="text-slate-500 text-sm mt-2">Enter master credentials to access the console</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Identity</label>
              <div className="relative">
                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-slate-900 outline-none transition-all font-bold"
                  placeholder="Admin Username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Master Key</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-14 py-4 rounded-2xl border-2 border-slate-100 focus:border-slate-900 outline-none transition-all font-bold"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex items-center space-x-3 animate-pulse">
                <Info size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-3xl shadow-2xl shadow-slate-200 transition-all flex items-center justify-center space-x-2 text-lg mt-4"
            >
              <LogIn size={22} />
              <span>Unlock Console</span>
            </button>
            
            <div className="text-center pt-4">
               <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                 Authorized Access Only
               </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
