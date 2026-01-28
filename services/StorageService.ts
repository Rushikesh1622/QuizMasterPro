
import { Quiz, User, QuizResult, Question } from '../types';
import { supabase } from '../lib/supabase';

const AUTH_KEY = 'quizmaster_auth';

class StorageService {
  // --- Auth & Session (Local for persistence of session) ---
  getCurrentUser(): User | null {
    const data = localStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : null;
  }

  setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  }

  // --- Users ---
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    if (error) throw error;
    return data || [];
  }

  async registerUser(username: string, password?: string): Promise<User | null> {
    const newUser = {
      username,
      password,
      role: 'user'
    };
    
    const { data, error } = await supabase
      .from('users')
      .insert([newUser])
      .select()
      .single();
      
    if (error) {
      console.error("Error registering user:", error.message);
      return null;
    }
    return data;
  }

  async login(username: string, password?: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('username', username)
      .single();
      
    if (error || !data) return null;
    
    // Simplistic password check (use Supabase Auth for production)
    if (data.password && data.password !== password) {
      return null;
    }
    
    this.setCurrentUser(data);
    return data;
  }

  // --- Quizzes ---
  async getQuizzes(): Promise<Quiz[]> {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .order('scheduled_at', { ascending: false });
      
    if (error) throw error;
    return (data || []).map(q => ({
      ...q,
      scheduledAt: q.scheduled_at // Handle snake_case to camelCase if necessary
    }));
  }

  async saveQuiz(quiz: Quiz) {
    const payload = {
      title: quiz.title,
      description: quiz.description,
      questions: quiz.questions,
      scheduled_at: quiz.scheduledAt,
      status: quiz.status,
      game_pin: quiz.gamePin || await this.generateUniquePin()
    };

    if (quiz.id && quiz.id.length > 20) { // Check if it's a real UUID or a temporary client-side one
       const { error } = await supabase
        .from('quizzes')
        .update(payload)
        .eq('id', quiz.id);
       if (error) throw error;
    } else {
       const { error } = await supabase
        .from('quizzes')
        .insert([payload]);
       if (error) throw error;
    }
  }

  async deleteQuiz(id: string) {
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  private async generateUniquePin(): Promise<string> {
    let pin = '';
    let isUnique = false;
    while (!isUnique) {
      pin = Math.floor(100000 + Math.random() * 900000).toString();
      const { data } = await supabase
        .from('quizzes')
        .select('id')
        .eq('game_pin', pin)
        .maybeSingle();
      if (!data) isUnique = true;
    }
    return pin;
  }

  // --- Results ---
  async getResults(): Promise<QuizResult[]> {
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .order('completed_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async submitResult(result: QuizResult) {
    const { error } = await supabase
      .from('results')
      .insert([{
        user_id: result.userId,
        username: result.username,
        quiz_id: result.quizId,
        score: result.score,
        total_questions: result.totalQuestions,
        completed_at: result.completedAt,
        duration_ms: result.durationMs
      }]);
    if (error) throw error;
  }

  async getLeaderboard(quizId: string): Promise<QuizResult[]> {
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .eq('quiz_id', quizId)
      .order('score', { ascending: false })
      .order('duration_ms', { ascending: true })
      .limit(15);
      
    if (error) throw error;
    return data || [];
  }
}

export const storage = new StorageService();
