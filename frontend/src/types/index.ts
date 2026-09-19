export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'CANDIDATE';
  avatarUrl?: string;
  attemptId?: string;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  explanation?: string;
}

export interface QuestionExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface StarterCodes {
  python?: string;
  javascript?: string;
  java?: string;
  cpp?: string;
}

export interface Question {
  id: string;
  assessmentId?: string;
  title: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  examples: QuestionExample[];
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  starterCodes: StarterCodes;
  points: number;
  orderIndex: number;
  sampleTestCases?: TestCase[];
  testCases?: TestCase[];
}

export interface Assessment {
  id: string;
  code: string;
  title: string;
  description: string;
  durationMinutes: number;
  passingScore: number;
  maxAttempts: number;
  allowedLanguages: string[];
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  questionCount?: number;
  totalCandidates?: number;
  completedCandidates?: number;
  averageScore?: number;
  questions?: Question[];
  createdAt: string;
}

export interface CandidateAnswer {
  id?: string;
  questionId: string;
  code: string;
  language: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'PASSED' | 'FAILED' | 'RUNTIME_ERROR';
  score?: number;
  testCasesPassed?: number;
  testCasesTotal?: number;
  executionTime?: string;
  memoryUsage?: string;
  autosavedAt?: string;
}

export interface CandidateAttempt {
  id: string;
  candidateName: string;
  candidateEmail: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED' | 'FLAGGED';
  score: number;
  passedQuestions: number;
  totalQuestions: number;
  currentQuestionIndex: number;
  startTime?: string;
  expiresAt?: string;
  submittedAt?: string;
  remainingSeconds: number;
  cameraStatus: 'CONNECTED' | 'DISCONNECTED' | 'PERMISSION_DENIED';
  micStatus: 'CONNECTED' | 'DISCONNECTED' | 'PERMISSION_DENIED';
  tabSwitches?: number;
  fullscreenExits?: number;
  answers?: CandidateAnswer[];
}

export interface TestCaseResult {
  id?: string;
  testCaseNumber: number;
  input: string;
  expectedOutput?: string;
  actualOutput: string;
  passed: boolean;
  isHidden?: boolean;
  executionTime: string;
  memoryUsage: string;
  errorMessage?: string;
}

export interface CodeExecutionResponse {
  success: boolean;
  status: 'SUCCESS' | 'COMPILATION_ERROR' | 'RUNTIME_ERROR' | 'TIME_LIMIT_EXCEEDED' | 'MEMORY_LIMIT_EXCEEDED';
  passed: number;
  failed: number;
  total: number;
  score: number;
  executionTime: string;
  memoryUsage: string;
  results: TestCaseResult[];
  message?: string;
}

export interface ProctoringEvent {
  id: string;
  eventType: string;
  severity: 'INFO' | 'WARNING' | 'DANGER' | 'CRITICAL';
  questionId?: string;
  timestamp: string;
  details: any;
  candidate?: {
    id: string;
    name: string;
    email: string;
  };
  assessment?: {
    id: string;
    title: string;
    code: string;
  };
}

export interface LiveCandidate {
  id: string;
  candidateName: string;
  candidateEmail: string;
  assessmentTitle: string;
  assessmentCode: string;
  status: string;
  riskLevel: 'ACTIVE' | 'WARNING' | 'REVIEW_REQUIRED';
  cameraStatus: string;
  micStatus: string;
  remainingSeconds: number;
  tabSwitches: number;
  fullscreenExits: number;
  totalEvents: number;
  questionsSolved: string;
  recentEvents: Array<{
    eventType: string;
    severity: string;
    timestamp: string;
  }>;
}

export interface CandidateTableItem {
  id: string;
  name: string;
  email: string;
  assessmentId: string;
  assessmentTitle: string;
  assessmentCode: string;
  passingScore: number;
  status: string;
  score: number;
  isPassed: boolean;
  startedAt?: string;
  submittedAt?: string;
  durationTakenMinutes?: number | null;
  tabSwitches: number;
  fullscreenExits: number;
  cameraStatus: string;
  activityFlags: number;
  eventsCount: number;
  answersCount: number;
}
