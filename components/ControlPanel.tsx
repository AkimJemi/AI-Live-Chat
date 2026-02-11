
import React from 'react';
import { VoiceName, Language, PracticeMode, BusinessSituation } from '../types';

interface ControlPanelProps {
  isConnecting: boolean;
  isConnected: boolean;
  onToggle: () => void;
  selectedVoice: VoiceName;
  onVoiceChange: (voice: VoiceName) => void;
  selectedLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  selectedMode: PracticeMode;
  onModeChange: (mode: PracticeMode) => void;
  selectedSituation: BusinessSituation;
  onSituationChange: (sit: BusinessSituation) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  isConnecting,
  isConnected,
  onToggle,
  selectedVoice,
  onVoiceChange,
  selectedLanguage,
  onLanguageChange,
  selectedMode,
  onModeChange,
  selectedSituation,
  onSituationChange,
}) => {
  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-800/50 rounded-2xl border border-slate-700 shadow-xl backdrop-blur-sm">
      
      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Language Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Language</label>
          <div className="flex flex-wrap gap-2">
            {Object.values(Language).map((lang) => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                disabled={isConnecting || isConnected}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  selectedLanguage === lang
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                } disabled:opacity-50`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Voice Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Voice</label>
          <div className="flex flex-wrap gap-2">
            {Object.values(VoiceName).map((voice) => (
              <button
                key={voice}
                onClick={() => onVoiceChange(voice)}
                disabled={isConnecting || isConnected}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  selectedVoice === voice
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                } disabled:opacity-50`}
              >
                {voice}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-px bg-slate-700/50 w-full" />

      {/* Mode Selection */}
      <div className="flex flex-col gap-4">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Conversation Mode</label>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onModeChange(PracticeMode.DAILY)}
            disabled={isConnecting || isConnected}
            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
              selectedMode === PracticeMode.DAILY
                ? 'bg-orange-500/10 border-orange-500 text-orange-200'
                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-600'
            } disabled:opacity-50`}
          >
            <span className="text-2xl">☕</span>
            <span className="font-bold text-sm">Daily Chat</span>
          </button>

          <button
            onClick={() => onModeChange(PracticeMode.BUSINESS)}
            disabled={isConnecting || isConnected}
            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
              selectedMode === PracticeMode.BUSINESS
                ? 'bg-indigo-500/10 border-indigo-500 text-indigo-200'
                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-600'
            } disabled:opacity-50`}
          >
            <span className="text-2xl">💼</span>
            <span className="font-bold text-sm">Business</span>
          </button>
        </div>

        {/* Situation Selector (Only for Business) */}
        {selectedMode === PracticeMode.BUSINESS && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <select
              value={selectedSituation}
              onChange={(e) => onSituationChange(e.target.value as BusinessSituation)}
              disabled={isConnecting || isConnected}
              className="w-full p-3 bg-slate-900 border border-slate-600 rounded-xl text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {Object.values(BusinessSituation).map((sit) => (
                <option key={sit} value={sit}>{sit}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Connect Button */}
      <div className="flex flex-col items-center gap-4 mt-2">
        <button
          onClick={onToggle}
          disabled={isConnecting}
          className={`relative flex items-center justify-center w-20 h-20 rounded-full transition-all transform hover:scale-105 active:scale-95 ${
            isConnected
              ? 'bg-red-500 shadow-lg shadow-red-900/40'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-900/40'
          } disabled:opacity-50`}
        >
          {isConnecting ? (
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : isConnected ? (
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          )}
          {isConnected && <div className="absolute inset-0 rounded-full border-4 border-red-400/30 voice-pulse"></div>}
        </button>

        <div className="text-center">
          <p className={`text-sm font-bold ${isConnected ? 'text-green-400' : 'text-slate-400'}`}>
            {isConnecting ? 'Connecting...' : isConnected ? 'Session Active' : 'Start Session'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
