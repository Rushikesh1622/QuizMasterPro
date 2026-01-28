import React, { useState } from 'react';
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
  useLocation
} from 'react-router-dom';

import { User } from './types';
import { storage } from './services/StorageService';

import Login from './components/Login';
import AdminLogin from './components/Admin/AdminLogin';
import Dashboard from './components/Admin/Dashboard';
import QuizEditor from './components/Admin/QuizEditor';
import UserDashboard from './components/User/UserDashboard';
import QuizSession from './components/User/QuizSession';
import GlobalLeaderboard from './components/Leaderboard';

import { LayoutDashboard, LogOut, Trophy, Shield } from 'lucide-react';

/* ---------- UI HELPERS ---------- */

const SidebarLink = ({ to, icon: Icon, label }: any) => {
  const location = useLocation();

  const isActive =
    location.pathname === to ||
    (to === '/admin' && location.pathname.startsWith('/admin'));

  return (
    <Link
      to={to}
      className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${
        isActive ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      <Icon size={20} />
      <span className="font-bold text-sm">{label}</span>
    </Link>
  );
};

const AppLayout = ({
  children,
  user,
  onLogout
}: {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="hidden md:flex w-64 bg-white border-r p-6 flex-col">
        <h1 className="text-xl font-black mb-10">QuizMaster</h1>

        <nav className="flex-1 space-y-2">
          {user.role === 'admin' ? (
            <>
              <SidebarLink to="/admin" icon={Shield} label="Admin Console" />
              <SidebarLink to="/leaderboard" icon={Trophy} label="Rankings" />
            </>
          ) : (
            <>
              <SidebarLink to="/user" icon={LayoutDashboard} label="My Contests" />
              <SidebarLink to="/leaderboard" icon={Trophy} label="Leaderboard" />
            </>
          )}
        </nav>

        <button
          onClick={onLogout}
          className="mt-auto flex items-center space-x-2 text-red-500 font-bold"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
};

/* ---------- ROUTER CONTENT ---------- */

const RouterContent = ({
  user,
  handleLogin
}: {
  user: User | null;
  handleLogin: (user: User) => void;
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    storage.clearCurrentUser();
    window.location.hash = '#/';
  };

  return (
    <Routes>
      {/* ---------- ROOT ---------- */}
      <Route
        path="/"
        element={
          !user ? (
            <Login onLogin={handleLogin} />
          ) : user.role === 'admin' ? (
            <Navigate to="/admin" />
          ) : (
            <Navigate to="/user" />
          )
        }
      />

      {/* ---------- ADMIN ---------- */}
      <Route
        path="/admin"
        element={
          user?.role === 'admin' ? (
            <AppLayout user={user} onLogout={handleLogout}>
              <Dashboard />
            </AppLayout>
          ) : (
            <AdminLogin onLogin={handleLogin} />
          )
        }
      />

      <Route
        path="/admin/create"
        element={
          user?.role === 'admin' ? (
            <AppLayout user={user} onLogout={handleLogout}>
              <QuizEditor />
            </AppLayout>
          ) : (
            <Navigate to="/admin" />
          )
        }
      />

      <Route
        path="/admin/edit/:id"
        element={
          user?.role === 'admin' ? (
            <AppLayout user={user} onLogout={handleLogout}>
              <QuizEditor />
            </AppLayout>
          ) : (
            <Navigate to="/admin" />
          )
        }
      />

      {/* ---------- USER ---------- */}
      <Route
        path="/user"
        element={
          user?.role === 'user' ? (
            <AppLayout user={user} onLogout={handleLogout}>
              <UserDashboard />
            </AppLayout>
          ) : (
            <Navigate to="/" />
          )
        }
      />

      <Route
        path="/quiz/:id"
        element={user ? <QuizSession user={user} /> : <Navigate to="/" />}
      />

      {/* ---------- LEADERBOARD ---------- */}
      <Route
        path="/leaderboard"
        element={
          user ? (
            <AppLayout user={user} onLogout={handleLogout}>
              <GlobalLeaderboard />
            </AppLayout>
          ) : (
            <GlobalLeaderboard />
          )
        }
      />

      {/* ---------- FALLBACK ---------- */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

/* ---------- APP ROOT ---------- */

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(
    storage.getCurrentUser()
  );

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    storage.setCurrentUser(user);
  };

  return (
    <HashRouter>
      <RouterContent user={currentUser} handleLogin={handleLogin} />
    </HashRouter>
  );
}
