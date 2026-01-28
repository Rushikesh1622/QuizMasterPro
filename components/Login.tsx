
import React, { useState } from 'react';
import { User, Quiz } from '../types';
import { storage } from '../services/StorageService';
import { Info, User as UserIcon, Hash, ArrowRight, ChevronLeft, Trophy, Loader2 } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User, targetQuizId?: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [userStep, setUserStep] = useState<'pin' | 'name'>('pin');
  const [gamePin, setGamePin] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validatedQuiz, setValidatedQuiz] = useState<Quiz | null>(null);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const quizzes = await storage.getQuizzes();
      // Adjusting to check game_pin vs gamePin (Supabase vs UI type)
      const quiz = quizzes.find(q => (q as any).game_pin === gamePin && (q.status === 'active' || q.status === 'scheduled'));

      if (quiz) {
        setValidatedQuiz(quiz);
        setUserStep('name');
      } else {
        setError('Invalid Game PIN or Quiz is not yet active');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    setLoading(true);
    try {
      const users = await storage.getUsers();
      const existingUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
      
      if (existingUser) {
        const results = await storage.getResults();
        const alreadyCompleted = results.some(r => (r as any).user_id === existingUser.id && (r as any).quiz_id === validatedQuiz?.id);
        
        if (alreadyCompleted) {
          onLogin(existingUser); 
        } else {
          onLogin(existingUser, validatedQuiz?.id);
        }
      } else {
        const newUser = await storage.registerUser(username);
        if (newUser) {
          onLogin(newUser, validatedQuiz?.id);
        } else {
          setError('That username is already taken');
        }
      }
    } catch (err) {
      setError('An error occurred during sign-in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-4">
      <div className="bg-white w-full max-md rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-4 rotate-3">
                {userStep === 'pin' ? <Hash size={40} /> : <UserIcon size={40} />}
              </div>
              <h1 className="text-3xl font-black text-slate-800">
                {userStep === 'pin' ? 'Join Contest' : 'Ready to Play?'}
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                {userStep === 'pin' 
                  ? 'Enter the 6-digit Game PIN to enter' 
                  : `Joining: ${validatedQuiz?.title}`}
              </p>
            </div>

            {userStep === 'pin' ? (
              <form onSubmit={handlePinSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={gamePin}
                    onChange={(e) => setGamePin(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-6 py-6 text-center text-4xl font-black tracking-[0.4em] rounded-3xl border-4 border-slate-50 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-100"
                    placeholder="000000"
                    autoFocus
                    disabled={loading}
                  />
                </div>
                {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold flex items-center space-x-2">
                    <Info size={16} />
                    <span>{error}</span>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-3xl shadow-xl shadow-indigo-200 transition-all flex items-center justify-center space-x-2 text-xl disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : (
                    <>
                      <span>Enter Pin</span>
                      <ArrowRight size={24} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleUserJoin} className="space-y-4">
                <div className="relative">
                  <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 rounded-3xl border-4 border-slate-50 focus:border-indigo-600 outline-none transition-all font-bold text-xl"
                    placeholder="Pick a Username"
                    autoFocus
                    disabled={loading}
                  />
                </div>
                {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold flex items-center space-x-2">
                    <Info size={16} />
                    <span>{error}</span>
                  </div>
                )}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setUserStep('pin')}
                    className="p-5 bg-slate-100 text-slate-500 rounded-3xl hover:bg-slate-200 transition-colors"
                    disabled={loading}
                  >
                    <ChevronLeft size={28} />
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-black py-5 rounded-3xl shadow-xl shadow-green-100 transition-all flex items-center justify-center space-x-2 text-xl disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <span>Start Game</span>}
                  </button>
                </div>
              </form>
            )}
            
            <div className="pt-6 border-t border-slate-100 text-center">
               <button 
                 onClick={() => window.location.hash = '/leaderboard'}
                 className="text-slate-400 font-bold text-sm hover:text-indigo-600 flex items-center justify-center space-x-2 mx-auto transition-colors"
               >
                 <Trophy size={16} />
                 <span>View Global Standings</span>
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
