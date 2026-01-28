import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Quiz, Question } from '../../types';
import { storage } from '../../services/StorageService';
import {
  Save,
  Plus,
  Trash2,
  ArrowLeft,
  Clock,
  CheckCircle2,
  Loader2
} from 'lucide-react';

const QuizEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ---------- FRONTEND STATE ----------
  const [quiz, setQuiz] = useState<Quiz>({
    id: crypto.randomUUID(),
    gamePin: '',
    title: '',
    description: '',
    questions: [],
    scheduledAt: new Date().toISOString(),
    status: 'draft'
  });

  // ---------- LOAD EXISTING QUIZ ----------
  useEffect(() => {
    const init = async () => {
      if (id) {
        const quizzes = await storage.getQuizzes();
        const existing: any = quizzes.find(q => q.id === id);

        if (existing) {
          setQuiz({
            id: existing.id,
            title: existing.title,
            description: existing.description,
            status: existing.status,
            gamePin: existing.game_pin,
            scheduledAt: existing.start_time,
            questions: await storage.getQuestions(existing.id)
          });
        }
      }
      setLoading(false);
    };

    init();
  }, [id]);

  // ---------- QUESTIONS ----------
  const addQuestion = () => {
    setQuiz(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: crypto.randomUUID(),
          text: '',
          options: ['', '', '', ''],
          correctAnswerIndex: 0,
          timeLimit: 30
        }
      ]
    }));
  };

  const removeQuestion = (qid: string) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== qid)
    }));
  };

  const updateQuestion = (qid: string, updates: Partial<Question>) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === qid ? { ...q, ...updates } : q
      )
    }));
  };

  // ---------- SAVE ----------
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
      // ✅ TRANSFORM → SUPABASE SHAPE
      const quizPayload = {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        status: quiz.status,
        game_pin: quiz.gamePin || Math.floor(100000 + Math.random() * 900000).toString(),
        start_time: new Date(quiz.scheduledAt).toISOString()
      };

      await storage.saveQuiz(quizPayload, quiz.questions);
      navigate('/admin');
    } catch (err) {
      console.error(err);
      alert('Failed to save quiz. Please check your connection.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  // ---------- UI ----------
  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center space-x-2 text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft size={20} />
          <span className="font-bold">Dashboard</span>
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl flex items-center space-x-2"
        >
          {saving ? <Loader2 className="animate-spin" /> : <Save />}
          <span>{saving ? 'Saving…' : 'Save Quiz'}</span>
        </button>
      </div>

      {/* QUIZ META */}
      <div className="bg-white p-8 rounded-2xl space-y-6 mb-8">
        <input
          className="w-full p-3 border rounded-xl"
          placeholder="Quiz title"
          value={quiz.title}
          onChange={e => setQuiz({ ...quiz, title: e.target.value })}
        />

        <input
          type="date"
          value={quiz.scheduledAt.split('T')[0]}
          onChange={e =>
            setQuiz({
              ...quiz,
              scheduledAt: new Date(e.target.value).toISOString()
            })
          }
          className="p-3 border rounded-xl"
        />

        <textarea
          className="w-full p-3 border rounded-xl"
          placeholder="Description"
          value={quiz.description}
          onChange={e => setQuiz({ ...quiz, description: e.target.value })}
        />
      </div>

      {/* QUESTIONS */}
      <div className="space-y-6">
        <button onClick={addQuestion} className="text-indigo-600 font-bold">
          + Add Question
        </button>

        {quiz.questions.map((q, i) => (
          <div key={q.id} className="bg-white p-6 rounded-xl relative">
            <button
              onClick={() => removeQuestion(q.id)}
              className="absolute top-4 right-4 text-red-500"
            >
              <Trash2 />
            </button>

            <input
              className="w-full mb-4 p-2 border rounded"
              placeholder={`Question ${i + 1}`}
              value={q.text}
              onChange={e => updateQuestion(q.id, { text: e.target.value })}
            />

            {q.options.map((opt, idx) => (
              <input
                key={idx}
                className="w-full mb-2 p-2 border rounded"
                placeholder={`Option ${idx + 1}`}
                value={opt}
                onChange={e => {
                  const opts = [...q.options];
                  opts[idx] = e.target.value;
                  updateQuestion(q.id, { options: opts });
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizEditor;
