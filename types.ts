
export interface TranscriptionEntry {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface LearnedTerm {
  term: string;
  definition: string;
}

// Added MissionObjective interface for MissionPanel component
export interface MissionObjective {
  id: string;
  description: string;
  isCompleted: boolean;
}

// Added LinguisticEvaluation interface for DiagnosticView component
export interface LinguisticEvaluation {
  grammarScore: number;
  vocabularyScore: number;
  naturalnessScore: number;
  overallGrade: 'S' | 'A' | 'B' | 'C' | 'D';
  strengths: string[];
  weaknesses: string[];
  suggestedImprovement: string;
}

// Added BkimSchedule interface for BkimProtocolView component
export interface BkimSchedule {
  protocolId: string;
  dailySchedule: {
    time: string;
    task: string;
    priority: string;
    status: string;
  }[];
  executionPrep: {
    item: string;
    ready: boolean;
  }[];
}

export interface SavedSession {
  id: string;
  userId: string; // ユーザー識別子を追加
  timestamp: number;
  language: Language;
  mode: PracticeMode;
  condition: StudyCondition;
  topic: string;
  transcriptions: TranscriptionEntry[];
  learnedTerms: LearnedTerm[];
  summary: string;
  isSynced: boolean; // クラウド同期状態
}

export interface SessionStatus {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export enum VoiceName {
  ZEPHYR = 'Zephyr',
  PUCK = 'Puck',
  CHARON = 'Charon',
  KORE = 'Kore',
  FENRIR = 'Fenrir'
}

export enum Language {
  JAPANESE = 'Japanese',
  ENGLISH = 'English',
  CHINESE = 'Chinese',
  KOREAN = 'Korean'
}

export enum PracticeMode {
  DAILY = 'Daily Conversation',
  BUSINESS = 'Business',
  CERTIFICATION = 'Certification Study'
}

export enum StudyCondition {
  STANDARD = 'Standard',
  INTENSIVE = 'Intensive Drill',
  VOCABULARY = 'Vocabulary Focus',
  STRICT = 'Strict Feedback',
  EXPLAIN = 'Deep Explanation'
}

export enum BusinessSituation {
  MEETING = 'Regular Meeting',
  NEGOTIATION = 'Client Negotiation',
  INTERVIEW = 'Job Interview',
  PRESENTATION = 'Technical Presentation',
  NETWORKING = 'Networking Event'
}

export enum BusinessCategory {
  DEVELOPMENT = 'Software Development',
  MARKETING = 'Digital Marketing',
  FINANCE = 'Investment & Finance',
  HR = 'Human Resources',
  SALES = 'Sales & Outreach'
}

export const DAILY_TOPICS = [
  'Exploring Local Markets',
  'Beachside Small Talk',
  'Mountain Trail Guide',
  'Island Tour Planning',
  'Seaside Restaurant',
  'Nature Photography'
];

export const CERTIFICATION_TOPICS = [
  'G検定 (JDLA Deep Learning for GENERAL)',
  'AWS Certified Solutions Architect',
  'JLPT (Japanese Language Proficiency)',
  'EIKEN (English Proficiency Test)',
  'TOEIC Listening & Reading',
  'PMP (Project Management Professional)',
  'Azure Fundamentals',
  'Google Cloud Professional Data Engineer'
];
