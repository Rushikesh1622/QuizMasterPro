
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Quiz, User, QuizResult } from '../../types';
import { storage } from '../../services/StorageService';
import { Clock, CheckCircle2, AlertCircle, Trophy, ArrowRight, Loader2 } from 'lucide-react';

interface QuizSessionProps {
  user: User;
}

const QuizSession: React.FC<QuizSessionProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime] = useState(Date.now());
  const timerRef = useRef<any>(null);

  // Fix: storage methods are async and return Promises. We must await them inside an async function.
  useEffect(() => {
    const initSession = async () => {
      const quizzes = await storage.getQuizzes();
      const activeQuiz = quizzes.find(q => q.id === id);
      
      if (!activeQuiz) {
        navigate('/user');
        return;
      }

      // SECURITY CHECK: Ensure user hasn't already completed this quiz
      const results = await storage.getResults();
      // Use any cast for snake_case fields returned from Supabase
      const existingResult = results.find(r => (r as any).user_id === user.id && (r as any).quiz_id === id);
      
      if (existingResult) {
        console.warn("User attempted to re-take quiz. Redirecting to dashboard.");
        navigate('/user');
        return;
      }

      setQuiz(activeQuiz);
      if (activeQuiz.questions.length > 0) {
        setTimeLeft(activeQuiz.questions[0].timeLimit);
        setAnswers(new Array(activeQuiz.questions.length).fill(-1));
      }
    };

    initSession();
  }, [id, navigate, user.id]);

  useEffect(() => {
    if (isFinished || !quiz) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleNext();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIdx, isFinished, quiz]);

  const handleNext = (selectedOptionIndex?: number) => {
    if (!quiz) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const updatedAnswers = [...answers];
    if (selectedOptionIndex !== undefined) {
      updatedAnswers[currentIdx] = selectedOptionIndex;
      setAnswers(updatedAnswers);
    }

    if (currentIdx < quiz.questions.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setTimeLeft(quiz.questions[nextIdx].timeLimit);
    } else {
      finishQuiz(updatedAnswers);
    }
  };

  const finishQuiz = (finalAnswers: number[]) => {
    if (!quiz) return;
    setIsFinished(true);
    
    let score = 0;
    quiz.questions.forEach((q, i) => {
      if (finalAnswers[i] === q.correctAnswerIndex) score++;
    });

    const result: QuizResult = {
      userId: user.id,
      username: user.username,
      quizId: quiz.id,
      score,
      totalQuestions: quiz.questions.length,
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - startTime
    };

    storage.submitResult(result);
  };

  if (!quiz) return <div className="flex items-center justify-center h-screen text-white bg-slate-900"><Loader2 className="animate-spin" /></div>;

  if (isFinished) {
    const finalScore = answers.reduce((acc, ans, i) => ans === quiz.questions[i].correctAnswerIndex ? acc + 1 : acc, 0);
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-xl rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy size={40} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Quiz Completed!</h2>
          <p className="text-slate-500 mb-8">You have successfully finished {quiz.title}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 p-4 rounded-2xl">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Score</p>
              <p className="text-2xl font-black text-indigo-600">{finalScore} / {quiz.questions.length}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Time Taken</p>
              <p className="text-2xl font-black text-indigo-600">{Math.floor((Date.now() - startTime) / 1000)}s</p>
            </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => navigate('/leaderboard')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center space-x-2"
            >
              <Trophy size={20} />
              <span>See Leaderboard</span>
            </button>
            <button 
              onClick={() => navigate('/user')}
              className="w-full text-slate-600 font-bold py-4 hover:bg-slate-50 rounded-2xl transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIdx];
  const progress = quiz.questions.length > 0 ? ((currentIdx + 1) / quiz.questions.length) * 100 : 0;
  const timeProgress = currentQuestion ? (timeLeft / currentQuestion.timeLimit) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-900 max-w-4xl mx-auto flex flex-col p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 text-white gap-4">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md shrink-0">
            <Trophy size={20} className="text-indigo-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-bold truncate">{quiz.title}</h1>
            <p className="text-[10px] text-white/50 uppercase font-black tracking-widest">Question {currentIdx + 1}/{quiz.questions.length}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 shrink-0">
          <div className="text-right flex flex-col items-end">
            <p className="text-[9px] text-white/50 uppercase font-black tracking-wider mb-0.5">Time Left</p>
            <p className={`text-xl md:text-2xl font-mono font-black leading-none ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-indigo-400'}`}>
              {timeLeft < 10 ? `0${timeLeft}` : timeLeft}s
            </p>
          </div>
          <div className="w-12 h-12 md:w-16 md:h-16 relative">
             <svg className="w-full h-full transform -rotate-90">
                {/* Fixed multiple className attributes on the same element */}
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="transparent" className="md:cx-32 md:cy-32 md:r-28 text-white/10" />
                <circle 
                  cx="24" cy="24" r="20"
                  stroke="currentColor" 
                  strokeWidth="3" 
                  fill="transparent" 
                  strokeDasharray={126} // Fixed radius path for mobile (2*PI*20 ~ 125.6)
                  strokeDashoffset={126 - (126 * timeProgress) / 100} 
                  /* Merged className attributes to fix syntax error */
                  className={`md:cx-32 md:cy-32 md:r-28 ${timeLeft <= 5 ? 'text-red-400' : 'text-indigo-400'} transition-all duration-1000 ease-linear`} 
                  strokeLinecap="round"
                />
             </svg>
             <div className="absolute inset-0 flex items-center justify-center">
                <Clock size={16} className={timeLeft <= 5 ? 'text-red-400' : 'text-white/20'} />
             </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-white/5 rounded-full mb-10 overflow-hidden">
        <div className="h-full bg-indigo-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${progress}%` }} />
      </div>

      {/* Question Card */}
      <div className="flex-1 flex flex-col">
        {currentQuestion ? (
          <div className="bg-white rounded-[2rem] p-6 md:p-12 shadow-2xl shadow-indigo-900/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 md:p-8 text-indigo-50/50 pointer-events-none">
              <span className="text-6xl md:text-8xl font-black opacity-30 md:opacity-100">?</span>
            </div>

            <div className="relative z-10">
              <h2 className="text-xl md:text-3xl font-bold text-slate-800 mb-8 md:mb-12 leading-tight">
                {currentQuestion.text}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {currentQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleNext(idx)}
                    className="group relative flex items-center p-4 md:p-6 text-left border-2 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all duration-300 transform active:scale-[0.98]"
                  >
                    <span className="w-8 h-8 md:w-10 md:h-10 shrink-0 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors mr-3 md:mr-4 text-sm md:text-base">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-base md:text-lg font-semibold text-slate-700 group-hover:text-indigo-900 leading-snug">{option}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center">
            <Loader2 className="animate-spin mx-auto text-indigo-600 mb-4" size={48} />
            <p className="text-slate-500 font-bold">Preparing Next Question...</p>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-white/50 px-2 gap-4">
          <div className="flex items-center space-x-2">
            <AlertCircle size={14} className="shrink-0" />
            <span className="text-[10px] md:text-xs font-medium">Progress is auto-saved. Do not refresh.</span>
          </div>
          <button 
            onClick={() => handleNext()}
            className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors text-sm font-bold group"
          >
            <span>Skip Question</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizSession;
