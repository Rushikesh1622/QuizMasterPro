
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Quiz, Question } from '../../types';
import { storage } from '../../services/StorageService';
import { Save, Plus, Trash2, ArrowLeft, Clock, CheckCircle2, Loader2 } from 'lucide-react';

const QuizEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quiz, setQuiz] = useState<Quiz>({
    id: crypto.randomUUID(),
    gamePin: '',
    title: '',
    description: '',
    questions: [],
    scheduledAt: new Date().toISOString().split('T')[0],
    status: 'draft'
  });

  useEffect(() => {
    const init = async () => {
      if (id) {
        const quizzes = await storage.getQuizzes();
        const existing = quizzes.find(q => q.id === id);
        if (existing) {
          setQuiz({
            ...existing,
            gamePin: (existing as any).game_pin || existing.gamePin
          });
        }
      }
      setLoading(false);
    };
    init();
  }, [id]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      text: '',
      options: ['', '', '', ''],
      correctAnswerIndex: 0,
      timeLimit: 30
    };
    setQuiz({ ...quiz, questions: [...quiz.questions, newQuestion] });
  };

  const removeQuestion = (qId: string) => {
    setQuiz({ ...quiz, questions: quiz.questions.filter(q => q.id !== qId) });
  };

  const updateQuestion = (qId: string, updates: Partial<Question>) => {
    setQuiz({
      ...quiz,
      questions: quiz.questions.map(q => q.id === qId ? { ...q, ...updates } : q)
    });
  };

  const handleSave = async () => {
    if (!quiz.title.trim()) {
      alert('Quiz title is required');
      return;
    }
    if (quiz.questions.length === 0) {
      alert('Add at least one question');
      return;
    }
    
    setSaving(true);
    try {
      await storage.saveQuiz(quiz);
      navigate('/admin');
    } catch (err) {
      alert('Failed to save quiz. Please check your connection.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => navigate('/admin')}
            className="flex items-center space-x-2 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-bold">Dashboard</span>
          </button>
          
          {quiz.gamePin && (
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Game PIN</span>
              <span className="font-black text-indigo-600 tracking-widest text-lg">{quiz.gamePin}</span>
            </div>
          )}
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl shadow-lg flex items-center space-x-2 font-semibold transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          <span>{saving ? 'Saving...' : 'Save Quiz'}</span>
        </button>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6 mb-8">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Quiz Title</label>
          <input
            type="text"
            value={quiz.title}
            onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="e.g., General Knowledge Trivia"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Scheduled Date</label>
            <input
              type="date"
              value={quiz.scheduledAt ? quiz.scheduledAt.split('T')[0] : ''}
              onChange={(e) => setQuiz({ ...quiz, scheduledAt: new Date(e.target.value).toISOString() })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Initial Status</label>
            <select
              value={quiz.status}
              onChange={(e) => setQuiz({ ...quiz, status: e.target.value as any })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="active">Active (Playable)</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
          <textarea
            value={quiz.description}
            onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            rows={3}
            placeholder="Describe what the quiz is about..."
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Questions ({quiz.questions.length})</h2>
          <button 
            onClick={addQuestion}
            className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center space-x-1"
          >
            <Plus size={18} />
            <span>Add Question</span>
          </button>
        </div>

        {quiz.questions.map((q, qIndex) => (
          <div key={q.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative group">
            <button 
              onClick={() => removeQuestion(q.id)}
              className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={18} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Question {qIndex + 1}</label>
                <input
                  type="text"
                  value={q.text}
                  onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                  placeholder="Enter your question here..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                  <Clock size={12} className="mr-1" /> Time (s)
                </label>
                <input
                  type="number"
                  value={q.timeLimit}
                  onChange={(e) => updateQuestion(q.id, { timeLimit: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  min={5}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {q.options.map((option, optIndex) => (
                <div key={optIndex} className="flex items-center space-x-2">
                  <button 
                    onClick={() => updateQuestion(q.id, { correctAnswerIndex: optIndex })}
                    className={`p-2 rounded-lg transition-all ${
                      q.correctAnswerIndex === optIndex 
                        ? 'bg-green-100 text-green-600 shadow-sm' 
                        : 'bg-slate-50 text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 size={20} />
                  </button>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...q.options];
                      newOptions[optIndex] = e.target.value;
                      updateQuestion(q.id, { options: newOptions });
                    }}
                    className={`flex-1 px-4 py-2.5 rounded-xl border transition-all outline-none ${
                      q.correctAnswerIndex === optIndex 
                        ? 'border-green-200 bg-green-50/30' 
                        : 'border-slate-100 bg-slate-50'
                    }`}
                    placeholder={`Option ${optIndex + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizEditor;
