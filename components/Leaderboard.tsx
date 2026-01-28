
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Quiz, QuizResult } from '../types';
import { storage } from '../services/StorageService';
import { Trophy, Medal, Star, Clock, User, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';

const GlobalLeaderboard: React.FC = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string>('');
  const [leaderboard, setLeaderboard] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const qData = await storage.getQuizzes();
        setQuizzes(qData);
        if (qData.length > 0) setSelectedQuizId(qData[0].id);
      } catch (err) {
        console.error("Init failed", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (selectedQuizId) {
        setLoading(true);
        try {
          const lData = await storage.getLeaderboard(selectedQuizId);
          setLeaderboard(lData);
        } catch (err) {
          console.error("Leaderboard fetch failed", err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchLeaderboard();
  }, [selectedQuizId]);

  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3, 15);

  const getPodiumStyles = (index: number) => {
    switch (index) {
      case 0: return {
        container: 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-yellow-200',
        icon: <Medal size={32} className="text-white" />,
        label: '1st Place',
        accent: 'bg-yellow-300/30'
      };
      case 1: return {
        container: 'bg-gradient-to-br from-slate-300 to-slate-500 shadow-slate-200',
        icon: <Medal size={28} className="text-white" />,
        label: '2nd Place',
        accent: 'bg-slate-200/30'
      };
      case 2: return {
        container: 'bg-gradient-to-br from-amber-500 to-amber-700 shadow-amber-200',
        icon: <Medal size={28} className="text-white" />,
        label: '3rd Place',
        accent: 'bg-amber-400/30'
      };
      default: return null;
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="space-y-8 pb-12 px-4 md:px-0">
      <div className="pt-4 md:pt-0">
        <button 
          onClick={handleBack}
          className="group flex items-center space-x-2 text-slate-400 hover:text-indigo-600 transition-colors font-bold text-sm"
        >
          <div className="p-2 rounded-xl bg-white border border-slate-100 shadow-sm group-hover:border-indigo-100 group-hover:bg-indigo-50 transition-all">
            <ArrowLeft size={18} />
          </div>
          <span>Back to Home</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Trophy size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Hall of Fame</h1>
            <p className="text-slate-500 font-medium text-sm md:text-base">Real-time performance rankings</p>
          </div>
        </div>
        
        <div className="w-full md:w-80">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Select Contest</label>
          <div className="relative">
            <select 
              value={selectedQuizId}
              onChange={(e) => setSelectedQuizId(e.target.value)}
              className="w-full pl-5 pr-10 py-3.5 bg-white rounded-2xl border-2 border-slate-100 focus:border-indigo-600 outline-none transition-all font-bold text-slate-700 appearance-none shadow-sm cursor-pointer"
            >
              {quizzes.map(q => (
                <option key={q.id} value={q.id}>{q.title}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
               <ChevronRight size={20} className="rotate-90" />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>
      ) : leaderboard.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-4">
            {topThree.map((res, idx) => {
              const styles = getPodiumStyles(idx);
              return (
                <div key={idx} className={`${styles?.container} p-6 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300`}>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`p-3 ${styles?.accent} rounded-2xl backdrop-blur-md`}>
                        {styles?.icon}
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{styles?.label}</p>
                        <p className="text-3xl font-black">{res.score}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center font-black text-xl backdrop-blur-md border border-white/20">
                        {res.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xl font-black truncate max-w-[180px]">{res.username}</p>
                        <div className="flex items-center text-xs opacity-70 font-bold">
                          <Clock size={12} className="mr-1" />
                          <span>Speed: {Math.floor(res.durationMs / 1000)}s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
               {remaining.map((res, idx) => (
                  <div key={idx} className="px-4 md:px-8 py-5 flex items-center justify-between border-b last:border-0">
                    <div className="flex items-center space-x-4">
                      <span className="font-black text-slate-300">{idx + 4}</span>
                      <p className="font-black text-slate-800">{res.username}</p>
                    </div>
                    <p className="font-black text-indigo-600">{res.score} pts</p>
                  </div>
               ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-24 rounded-[3rem] text-center">
          <Trophy size={48} className="mx-auto text-slate-200 mb-6" />
          <h3 className="text-2xl font-black text-slate-800">The Stage is Empty</h3>
        </div>
      )}
    </div>
  );
};

export default GlobalLeaderboard;
