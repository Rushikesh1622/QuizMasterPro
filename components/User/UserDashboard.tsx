
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Quiz, QuizResult } from '../../types';
import { storage } from '../../services/StorageService';
import { Play, Trophy, Clock, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

const UserDashboard: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const currentUser = storage.getCurrentUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [qData, rData] = await Promise.all([
          storage.getQuizzes(),
          storage.getResults()
        ]);
        setQuizzes(qData);
        setResults(rData);
      } catch (err) {
        console.error("Fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const userResults = results.filter(r => (r as any).user_id === currentUser?.id);

  const isCompleted = (quizId: string) => {
    return userResults.some(r => (r as any).quiz_id === quizId);
  };

  const getResult = (quizId: string) => {
    return userResults.find(r => (r as any).quiz_id === quizId);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Available Contests</h1>
        <p className="text-slate-500">Jump into a challenge and prove your knowledge</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.filter(q => q.status === 'active' || q.status === 'scheduled').map((quiz) => {
          const completed = isCompleted(quiz.id);
          const result = getResult(quiz.id);

          return (
            <div key={quiz.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
              <div className="h-2 bg-indigo-600 w-full opacity-10 group-hover:opacity-100 transition-opacity" />
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{quiz.title}</h3>
                  {completed && <CheckCircle className="text-green-500 shrink-0" size={20} />}
                </div>
                <p className="text-slate-500 text-sm line-clamp-2 mb-6">{quiz.description}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-slate-600">
                    <Clock size={16} className="mr-2 text-slate-400" />
                    <span>{quiz.questions.length} Questions</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Trophy size={16} className="mr-2 text-slate-400" />
                    <span>Top Prize: Ultimate Glory</span>
                  </div>
                </div>

                {completed ? (
                  <div className="bg-green-50 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-green-600 uppercase">Your Score</p>
                      <p className="text-xl font-bold text-green-700">{result?.score} / {result?.totalQuestions}</p>
                    </div>
                    <button 
                      onClick={() => navigate('/leaderboard')}
                      className="text-green-700 hover:bg-green-100 p-2 rounded-lg transition-colors"
                      title="View Leaderboard"
                    >
                      <Trophy size={20} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => navigate(`/quiz/${quiz.id}`)}
                    className="w-full bg-slate-900 group-hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-slate-200 group-hover:shadow-indigo-200"
                  >
                    <Play size={18} fill="currentColor" />
                    <span>Start Quiz</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserDashboard;
