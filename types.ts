// types.ts

// Add type definitions for Speech Recognition
export interface SpeechRecognition extends EventTarget {
  maxAlternatives: number;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

// Define types
export interface AnalysisData {
  faceDetected: boolean;
  confidence: number;
  emotion: string;
  emotionScores: Record<string, number>;
  confidenceHistory: number[];
  processedImage?: string;
}

export interface ChartDataPoint {
  time: number;
  confidence: number;
}

export interface EmotionScore {
  emotion: string;
  score: number;
}

export interface InterviewSession {
  sessionId: string;
  jobRole: string;
  duration: number;
  status: "setup" | "active" | "completed";
  currentQuestion: string | null;
  currentQuestionId: number;
  isLoadingQuestion: boolean;
  answers: { question: string; answer: string }[];
  timeRemaining: number;
  feedback: string | null;
}

export interface AnalysisData {
  faceDetected: boolean;
  confidence: number;
  emotion: string;
  emotionScores: Record<string, number>;
  confidenceHistory: number[];
  processedImage?: string;
}

export interface InterviewStats {
  answersCount: number;
  avgConfidence: number;
  duration: string;
}

export interface VoiceInputProps {
  value: string;
  onInputChange: (value: string) => void;
  disabled?: boolean;
}

export interface EmotionAnalysisProps {
  analysisData?: AnalysisData;
}

export interface InterviewFeedbackProps {
  feedback?: string;
  stats: InterviewStats;
  onNewInterview: () => void;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface CodingQuestion {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number;
  testCases: TestCase[];
  starterCode?: string;
}

export interface CVAnalysisResult {
  skillLevel: "beginner" | "intermediate" | "advanced";
  questions: CodingQuestion[];
}

export interface CodeEvaluation {
  isCorrect: boolean;
  timeComplexity: string;
  spaceComplexity: string;
  optimizations: string[];
  feedback: string;
  errors?: string[];
}

export interface UserSubmission {
  questionId: string;
  code: string;
  submittedAt: Date;
  executionTime?: number;
  evaluation?: CodeEvaluation;
}
