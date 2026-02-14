
import React from 'react';
import { VoiceName, Language, PracticeMode, BusinessSituation, BusinessCategory, DAILY_TOPICS } from '../types';

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
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  availableCategories: string[];
  onAddCategory: () => void;
  selectedDailyTopic: string;
  onDailyTopicChange: (topic: string) => void;
  isChallengeMode: boolean;
  onChallengeToggle: (val: boolean) => void;
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
  selectedCategory,
  onCategoryChange,
  availableCategories,
  onAddCategory,
  selectedDailyTopic,
  onDailyTopicChange,
  isChallengeMode,
  onChallengeToggle,
}) => {
  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-800/50 rounded-[2rem] border border-slate-700 shadow-xl backdrop-blur-sm">
      
      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Language Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Language</label>
          <div className="flex flex-wrap gap-1.5">
            {Object.values(Language).map((lang) => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                disabled={isConnecting || isConnected}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border ${
                  selectedLanguage === lang
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                } disabled:opacity-50`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Challenge Mode Toggle */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Simulation Type</label>
          <button
            onClick={() => onChallengeToggle(!isChallengeMode)}
            disabled={isConnecting || isConnected}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${
              isChallengeMode 
                ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">{isChallengeMode ? '⚡' : '🛡️'}</span>
              <span className="text-[10px] font-black uppercase">{isChallengeMode ? 'Challenge Mode' : 'Training Mode'}</span>
            </div>
            <div className={`w-6 h-3 rounded-full relative transition-colors ${isChallengeMode ? 'bg-amber-500' : 'bg-slate-700'}`}>
              <div className={`absolute top-0.5 w-2 h-2 rounded-full bg-white transition-all ${isChallengeMode ? 'right-0.5' : 'left-0.5'}`}></div>
            </div>
          </button>
        </div>
      </div>

      <div className="h-px bg-slate-700/50 w-full" />

      {/* Mode Selection */}
      <div className="flex flex-col gap-4">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Practice Path</label>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onModeChange(PracticeMode.DAILY)}
            disabled={isConnecting || isConnected}
            className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
              selectedMode === PracticeMode.DAILY
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-600'
            } disabled:opacity-50`}
          >
            <span className="text-xl">🌴</span>
            <span className="font-black text-[10px] uppercase tracking-tighter">Casual Life</span>
          </button>

          <button
            onClick={() => onModeChange(PracticeMode.BUSINESS)}
            disabled={isConnecting || isConnected}
            className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
              selectedMode === PracticeMode.BUSINESS
                ? 'bg-blue-500/10 border-blue-500 text-blue-200 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-600'
            } disabled:opacity-50`}
          >
            <span className="text-xl">👔</span>
            <span className="font-black text-[10px] uppercase tracking-tighter">Professional</span>
          </button>
        </div>

        {/* Dynamic Scenario Settings */}
        <div className="mt-2 min-h-[100px]">
          {selectedMode === PracticeMode.DAILY ? (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block ml-1">Island Tour Scenarios</label>
              <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                {DAILY_TOPICS.map((topic) => (
                  <label
                    key={topic}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all active:scale-[0.98] ${
                      selectedDailyTopic === topic
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-100 ring-1 ring-emerald-500/30'
                        : 'bg-slate-900/40 border-slate-700 text-slate-500 hover:border-slate-600 hover:bg-slate-800/60'
                    }`}
                  >
                    <input
                      type="radio"
                      name="dailyTopic"
                      className="hidden"
                      checked={selectedDailyTopic === topic}
                      onChange={() => onDailyTopicChange(topic)}
                      disabled={isConnecting || isConnected}
                    />
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                      selectedDailyTopic === topic ? 'border-emerald-400 bg-emerald-400/10' : 'border-slate-600'
                    }`}>
                      {selectedDailyTopic === topic && <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />}
                    </div>
                    <span className="text-xs font-bold">{topic}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block ml-1">Expertise Domain</label>
                <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                  {availableCategories.map((cat) => (
                    <label
                      key={cat}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all active:scale-[0.98] ${
                        selectedCategory === cat
                          ? 'bg-blue-600/20 border-blue-500 text-blue-100 ring-1 ring-blue-500/30'
                          : 'bg-slate-900/40 border-slate-700 text-slate-500 hover:border-slate-600 hover:bg-slate-800/60'
                      }`}
                    >
                      <input
                        type="radio"
                        name="businessCategory"
                        className="hidden"
                        checked={selectedCategory === cat}
                        onChange={() => onCategoryChange(cat)}
                        disabled={isConnecting || isConnected}
                      />
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                        selectedCategory === cat ? 'border-blue-400 bg-blue-400/10' : 'border-slate-600'
                      }`}>
                        {selectedCategory === cat && <div className="w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)]" />}
                      </div>
                      <span className="text-xs font-bold">{cat}</span>
                    </label>
                  ))}
                </div>
                
                <button
                  onClick={onAddCategory}
                  disabled={isConnecting || isConnected}
                  className="w-full mt-2 py-3 px-4 rounded-xl border border-dashed border-slate-700 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:border-blue-500/50 hover:text-blue-400 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  <svg className="w-3 h-3 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Custom Category
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block ml-1">Context / Scenario</label>
                <div className="relative">
                  <select
                    value={selectedSituation}
                    onChange={(e) => onSituationChange(e.target.value as BusinessSituation)}
                    disabled={isConnecting || isConnected}
                    className="w-full p-3.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer hover:border-slate-600"
                  >
                    {Object.values(BusinessSituation).map((sit) => (
                      <option key={sit} value={sit}>{sit}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="h-px bg-slate-700/50 w-full" />

      {/* Connect Button */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={onToggle}
          disabled={isConnecting}
          className={`relative flex items-center justify-center w-24 h-24 rounded-full transition-all transform hover:scale-105 active:scale-95 ${
            isConnected
              ? 'bg-red-500 shadow-xl shadow-red-900/40'
              : 'bg-gradient-to-br from-blue-600 to-indigo-700 shadow-xl shadow-blue-900/40'
          } disabled:opacity-50`}
        >
          {isConnecting ? (
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : isConnected ? (
            <div className="flex items-center gap-1">
               <div className="w-2.5 h-7 bg-white rounded-full"></div>
               <div className="w-2.5 h-7 bg-white rounded-full"></div>
            </div>
          ) : (
            <svg className="w-10 h-10 text-white translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          )}
          {isConnected && <div className="absolute inset-0 rounded-full border-4 border-red-400/30 voice-pulse"></div>}
        </button>

        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isConnected ? 'text-green-400' : 'text-slate-500'}`}>
          {isConnecting ? 'Syncing...' : isConnected ? (isChallengeMode ? 'Diagnostic Active' : 'Neural Link Active') : 'Start Immersion'}
        </p>
      </div>
    </div>
  );
};

export default ControlPanel;
