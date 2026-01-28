
import { Quiz, Question, User } from './types';

export const INITIAL_QUIZZES: Quiz[] = [
  {
    id: '1',
    gamePin: '123456',
    title: 'Modern Web Development',
    description: 'Test your knowledge on React, Tailwind, and TypeScript.',
    scheduledAt: new Date().toISOString(),
    status: 'active',
    questions: [
      {
        id: 'q1',
        text: 'What does JSX stand for?',
        options: ['JavaScript XML', 'Java Syntax Extension', 'JSON XML', 'JavaScript X-platform'],
        correctAnswerIndex: 0,
        timeLimit: 15
      },
      {
        id: 'q2',
        text: 'Which hook is used for side effects in React?',
        options: ['useState', 'useContext', 'useEffect', 'useMemo'],
        correctAnswerIndex: 2,
        timeLimit: 10
      }
    ]
  },
  {
    id: '2',
    gamePin: '654321',
    title: 'System Design Basics',
    description: 'Core concepts of scalable systems.',
    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    status: 'scheduled',
    questions: [
      {
        id: 'q3',
        text: 'What does CAP theorem stand for?',
        options: [
          'Consistency, Availability, Partition Tolerance',
          'Concurrency, Availability, Performance',
          'Cache, API, Proxy',
          'Control, Access, Privacy'
        ],
        correctAnswerIndex: 0,
        timeLimit: 20
      }
    ]
  }
];

export const ADMIN_USER: User = {
  id: 'admin-1',
  username: 'admin',
  password: 'polkmn_',
  role: 'admin',
  createdAt: new Date().toISOString()
};

export const SYSTEM_DOCS = {
  architecture: "The QuizMaster Pro platform follows a client-side reactive architecture. It utilizes a centralized storage service that handles data persistence via LocalStorage to simulate a backend. The UI is built using functional React components with a focus on atomic design for reusability.",
  techStack: "React 18+, TypeScript, Tailwind CSS, Lucide React (Icons), React Router (HashRouter).",
  timerLogic: "The per-question timer uses a custom useTimer hook which relies on a recursive setTimeout/setInterval approach with precise drift calculation and automatic cleanup to ensure accuracy across browser tabs.",
  leaderboardLogic: "Leaderboards are computed dynamically by filtering results by quiz ID, sorting primarily by score (descending) and secondarily by completion time (ascending) to break ties. Only the top 15 records are displayed.",
  security: "Basic client-side authentication is implemented. Unique username validation is enforced during the registration process by checking the 'users' store in local storage before committing a new record."
};
