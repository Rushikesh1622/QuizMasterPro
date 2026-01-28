import React, { useState } from 'react';
import { ShieldAlert, Lock, User as UserIcon, LogIn, Eye, EyeOff, Info } from 'lucide-react';
import { User } from '../../types';

interface AdminLoginProps {
  onLogin: (user: User) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const adminIdentity = import.meta.env.VITE_ADMIN_IDENTITY;
    const adminMasterKey = import.meta.env.VITE_ADMIN_MASTER_KEY;

    if (!adminIdentity || !adminMasterKey) {
      setError('Admin credentials are not configured');
      return;
    }

    if (
      username.trim() !== adminIdentity ||
      password !== adminMasterKey
    ) {
      setError('Access Denied: Invalid administrator credentials');
      return;
    }

    // ✅ SUCCESS: set admin user in app state
    const adminUser: User = {
      id: 'admin',
      username: adminIdentity,
      role: 'admin'
    };

    console.log('ADMIN LOGIN SUCCESS:', adminUser); // debug (safe to remove later)
    onLogin(adminUser);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="p-10">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-slate-100 text-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
              <ShieldAlert size={40} />
            </div>
            <h1 className="text-3xl font-black text-slate-800">
              System Admin
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              Enter master credentials to access the console
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase mb-2">
                Identity
              </label>
              <div className="relative">
                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 font-bold"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase mb-2">
                Master Key
              </label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-14 py-4 rounded-2xl border-2 font-bold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex items-center space-x-2">
                <Info size={18} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl"
            >
              <LogIn className="inline mr-2" />
              Unlock Console
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
