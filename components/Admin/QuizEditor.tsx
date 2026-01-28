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

  const [quiz, setQuiz] = useState<Quiz>({
    id: crypto.randomUUID(),
    title: '',
    description: '',
    status: 'draft',
    gamePin: '',
    scheduledAt: new Date().toISOString(),
    questions: []
  });

  /* ---------- LOAD QUIZ ---------- */
  useEffect(() => {
    const loadQuiz = async () => {
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

    loadQuiz();
  }, [id]);

  /* ---------- QUESTIONS ---------- */
  const addQuestion = () => {
    const q: Question = {
      id: crypto.randomUUID(),
      text: '',
      options: ['', '', '', ''],
      correctAnswerIndex: 0,
      timeLimit: 30
    };

    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, q]
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

  const removeQuestion = (qid: string) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== qid)
    }));
  };

  /* ---------- SAVE ---------- */
  const handleSave = async () => {
    if (!quiz.title.trim()) {
      alert('Quiz title required');
      return;
    }

    if (quiz.questions.length === 0) {
      alert('Add at least one question');
      return;
    }

    setSaving(true);

    try {
      const quizPayload = {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        status: quiz.status,
        game_pin:
          quiz.gamePin || Math.floor(100000 + Math.random() * 900000).toString(),
        start_time: new Date(quiz.scheduledAt).toISOString()
      };

      await storage.saveQuiz(quizPayload, quiz.questions);
      navigate('/admin');
    } catch (err) {
      console.error(err);
      alert('Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  /* ---------- UI ---------- */
  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-slate-500"
        >
          <ArrowLeft size={18} /> Dashboard
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-600 text-white px-6 py-2 rounded-xl flex items-center gap-2"
        >
          {saving ? <Loader2 className="animate-spin" /> : <Save />}
          Save Quiz
        </button>
      </div>

      {/* QUIZ META */}
      <div className="bg-white p-6 rounded-xl space-y-4 mb-8">
        <input
          className="w-full p-3 border rounded-lg"
          placeholder="Quiz title"
          value={quiz.title}
          onChange={e => setQuiz({ ...quiz, title: e.target.value })}
        />

        <textarea
          className="w-full p-3 border rounded-lg"
          placeholder="Description"
          value={quiz.description}
          onChange={e => setQuiz({ ...quiz, description: e.target.value })}
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
          className="p-3 border rounded-lg"
        />
      </div>

      {/* QUESTIONS */}
      <div className="space-y-6">
        <button
          onClick={addQuestion}
          className="text-indigo-600 font-bold flex items-center gap-1"
        >
          <Plus size={16} /> Add Question
        </button>

        {quiz.questions.map((q, qi) => (
          <div key={q.id} className="bg-white p-6 rounded-xl relative">
            <button
              onClick={() => removeQuestion(q.id)}
              className="absolute top-4 right-4 text-red-500"
            >
              <Trash2 size={18} />
            </button>

            <input
              className="w-full mb-3 p-2 border rounded"
              placeholder={`Question ${qi + 1}`}
              value={q.text}
              onChange={e => updateQuestion(q.id, { text: e.target.value })}
            />

            {/* TIMER */}
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} />
              <input
                type="number"
                min={5}
                value={q.timeLimit}
                onChange={e =>
                  updateQuestion(q.id, {
                    timeLimit: Number(e.target.value) || 30
                  })
                }
                className="w-24 p-2 border rounded"
              />
              <span className="text-sm text-slate-500">seconds</span>
            </div>

            {/* OPTIONS */}
            <div className="grid md:grid-cols-2 gap-3">
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateQuestion(q.id, { correctAnswerIndex: oi })
                    }
                    className={`p-2 rounded ${
                      q.correctAnswerIndex === oi
                        ? 'bg-green-100 text-green-600'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <CheckCircle2 size={18} />
                  </button>

                  <input
                    className="flex-1 p-2 border rounded"
                    placeholder={`Option ${oi + 1}`}
                    value={opt}
                    onChange={e => {
                      const opts = [...q.options];
                      opts[oi] = e.target.value;
                      updateQuestion(q.id, { options: opts });
                    }}
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
