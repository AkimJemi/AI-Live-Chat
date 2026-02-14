
export interface TranscriptionEntry {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface LinguisticEvaluation {
  grammarScore: number;
  vocabularyScore: number;
  naturalnessScore: number;
  overallGrade: 'S' | 'A' | 'B' | 'C' | 'D';
  strengths: string[];
  weaknesses: string[];
  suggestedImprovement: string;
}

export interface SavedSession {
  id: string;
  timestamp: number;
  language: Language;
  mode: PracticeMode;
  category: string;
  dailyTopic: string;
  transcriptions: TranscriptionEntry[];
  preview: string;
  evaluation?: LinguisticEvaluation;
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
  BUSINESS = 'Business'
}

export enum BusinessSituation {
  MEETING = 'Regular Meeting',
  NEGOTIATION = 'Client Negotiation',
  INTERVIEW = 'Job Interview',
  PRESENTATION = 'Technical Presentation',
  NETWORKING = 'Networking Event'
}

// Fixed missing BusinessCategory enum used for professional immersion settings
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

export interface SessionStatus {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}
