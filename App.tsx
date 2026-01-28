
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Quiz } from './types';
import { storage } from './services/StorageService';
import Login from './components/Login';
import AdminLogin from './components/Admin/AdminLogin';
import Dashboard from './components/Admin/Dashboard';
import QuizEditor from './components/Admin/QuizEditor';
import UserDashboard from './components/User/UserDashboard';
import QuizSession from './components/User/QuizSession';
import GlobalLeaderboard from './components/Leaderboard';
import { LayoutDashboard, LogOut, Trophy, User as UserIcon, Shield, Menu, X } from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  
  return (
    <Link 
      to={to} 
      className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${
        isActive 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      <Icon size={20} />
      <span className="font-bold text-sm">{label}</span>
    </Link>
  );
};

const MobileNavLink = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  
  return (
    <Link 
      to={to} 
      className={`flex flex-col items-center justify-center flex-1 py-2 transition-all ${
        isActive ? 'text-indigo-600' : 'text-slate-400'
      }`}
    >
      <Icon size={20} className={isActive ? 'animate-bounce' : ''} />
      <span className={`text-[10px] font-bold mt-1 uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-70'}`}>
        {label}
      </span>
    </Link>
  );
};

interface AppLayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, user, onLogout }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row pb-20 md:pb-0">
      {/* Mobile Top Header */}
      <header className="md:hidden bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm">Q</div>
          <span className="font-black text-slate-800 tracking-tight">QuizMaster</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            <UserIcon size={14} className="text-indigo-600" />
            <span className="text-xs font-black text-slate-700 truncate max-w-[80px]">{user.username}</span>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 p-6 flex-col sticky top-0 h-screen">
        <div className="flex items-center space-x-3 mb-10 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100">Q</div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">QuizMaster</h1>
        </div>

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

        <div className="pt-6 mt-6 border-t border-slate-100">
          <div className="flex items-center space-x-3 p-3 mb-4 bg-slate-50 rounded-2xl">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-black text-slate-800 truncate">{user.username}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 p-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-bold text-sm"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-4 md:p-10">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex items-center justify-around px-4 py-1 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {user.role === 'admin' ? (
          <>
            <MobileNavLink to="/admin" icon={Shield} label="Admin" />
            <MobileNavLink to="/leaderboard" icon={Trophy} label="Rankings" />
          </>
        ) : (
          <>
            <MobileNavLink to="/user" icon={LayoutDashboard} label="Contests" />
            <MobileNavLink to="/leaderboard" icon={Trophy} label="Rankings" />
          </>
        )}
      </nav>
    </div>
  );
};

const RootContainer = ({ currentUser, handleLogin }: { currentUser: User | null, handleLogin: (user: User, quizId?: string) => void }) => {
  const [initialQuizId, setInitialQuizId] = useState<string | null>(null);
  
  const onLoginWrapper = (user: User, quizId?: string) => {
    if (quizId) setInitialQuizId(quizId);
    handleLogin(user, quizId);
  };

  return <HashRouterContent user={currentUser} initialQuizId={initialQuizId} handleLogin={onLoginWrapper} />;
};

const HashRouterContent = ({ user, initialQuizId, handleLogin }: { user: User | null, initialQuizId: string | null, handleLogin: (user: User) => void }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (user && initialQuizId && !hasRedirected) {
      navigate(`/quiz/${initialQuizId}`);
      setHasRedirected(true);
    }
  }, [user, initialQuizId, navigate, hasRedirected]);

  const handleLogout = () => {
    storage.setCurrentUser(null);
    window.location.href = '/'; // Hard reset
  };

  return (
    <Routes>
      {/* Admin territory: Only reachable via /admin path */}
      <Route 
        path="/admin" 
        element={
          user?.role === 'admin' ? (
            <AppLayout user={user} onLogout={handleLogout}><Dashboard /></AppLayout>
          ) : (
            <AdminLogin onLogin={handleLogin} />
          )
        } 
      />
      <Route 
        path="/admin/edit/:id" 
        element={
          user?.role === 'admin' ? (
            <AppLayout user={user} onLogout={handleLogout}><QuizEditor /></AppLayout>
          ) : <Navigate to="/admin" />
        } 
      />
      <Route 
        path="/admin/create" 
        element={
          user?.role === 'admin' ? (
            <AppLayout user={user} onLogout={handleLogout}><QuizEditor /></AppLayout>
          ) : <Navigate to="/admin" />
        } 
      />

      {/* Main Contestant paths */}
      <Route 
        path="/" 
        element={
          user ? <Navigate to="/user" /> : <Login onLogin={handleLogin} />
        } 
      />
      
      <Route 
        path="/user" 
        element={
          user ? <AppLayout user={user} onLogout={handleLogout}><UserDashboard /></AppLayout> : <Navigate to="/" />
        } 
      />
      
      <Route 
        path="/quiz/:id" 
        element={
          user ? <div className="min-h-screen bg-slate-900"><QuizSession user={user} /></div> : <Navigate to="/" />
        } 
      />
      
      <Route 
        path="/leaderboard" 
        element={
          user 
            ? <AppLayout user={user} onLogout={handleLogout}><GlobalLeaderboard /></AppLayout> 
            : <div className="min-h-screen bg-slate-50"><GlobalLeaderboard /></div>
        } 
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(storage.getCurrentUser());

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    storage.setCurrentUser(user);
  };

  return (
    <HashRouter>
      <RootContainer currentUser={currentUser} handleLogin={handleLogin} />
    </HashRouter>
  );
}
