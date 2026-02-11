
export interface TranscriptionEntry {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
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
  MEETING = 'Meeting / Brainstorming',
  NEGOTIATION = 'Client Negotiation',
  INTERVIEW = 'Job Interview',
  PRESENTATION = 'Q&A after Presentation',
  NETWORKING = 'Networking Event'
}

export interface SessionStatus {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}
