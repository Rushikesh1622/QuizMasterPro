
export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  timeLimit: number; // in seconds
}

export interface Quiz {
  id: string;
  gamePin: string; // 6-digit unique numeric code
  title: string;
  description: string;
  questions: Question[];
  scheduledAt: string; // ISO date string
  status: 'draft' | 'scheduled' | 'active' | 'completed';
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface QuizResult {
  userId: string;
  username: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  durationMs: number;
}

export interface AppState {
  currentUser: User | null;
  quizzes: Quiz[];
  results: QuizResult[];
}
