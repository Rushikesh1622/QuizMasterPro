
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Quiz, QuizResult, User } from '../../types';
import { storage } from '../../services/StorageService';
import { Plus, Edit2, Trash2, Users, Calendar, CheckCircle, BarChart3, Clock, Hash, Loader2 } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={24} />
      </div>
      <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">{title}</span>
    </div>
    <div className="text-3xl font-bold text-slate-800">{value}</div>
  </div>
);

const Dashboard: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [usersCount, setUsersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const [qData, rData, uData] = await Promise.all([
        storage.getQuizzes(),
        storage.getResults(),
        storage.getUsers()
      ]);
      setQuizzes(qData);
      setResults(rData);
      setUsersCount(uData.length);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this quiz?')) {
      await storage.deleteQuiz(id);
      loadData();
    }
  };

  const getParticipantCount = (quizId: string) => {
    return results.filter(r => (r as any).quiz_id === quizId).length;
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-500">Manage your quizzes and monitor performance</p>
        </div>
        <Link 
          to="/admin/create"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-center space-x-2 font-semibold transition-all"
        >
          <Plus size={20} />
          <span>New Quiz</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Quizzes" value={quizzes.length} icon={Calendar} color="bg-blue-50 text-blue-600" />
        <StatCard title="Active" value={quizzes.filter(q => q.status === 'active').length} icon={CheckCircle} color="bg-green-50 text-green-600" />
        <StatCard title="Total Users" value={usersCount} icon={Users} color="bg-purple-50 text-purple-600" />
        <StatCard title="Participations" value={results.length} icon={BarChart3} color="bg-orange-50 text-orange-600" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">Quiz Management</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Quiz Info</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Game PIN</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Activity</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quizzes.map((quiz) => (
                <tr key={quiz.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{quiz.title}</div>
                    <div className="text-xs text-slate-400 flex items-center mt-1">
                      <Clock size={12} className="mr-1" />
                      {new Date(quiz.scheduledAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-black tracking-widest text-lg border border-indigo-100">
                      <Hash size={14} className="mr-1 opacity-50" />
                      {(quiz as any).game_pin || quiz.gamePin}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                      quiz.status === 'active' ? 'bg-green-100 text-green-700' :
                      quiz.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {quiz.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-center">
                      <div className="text-sm text-slate-600 font-bold">{getParticipantCount(quiz.id)}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Players</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => navigate(`/admin/edit/${quiz.id}`)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(quiz.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
