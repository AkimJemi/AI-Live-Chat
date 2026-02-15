
import React from 'react';
import { VoiceName, Language, PracticeMode, BusinessSituation, BusinessCategory, DAILY_TOPICS, CERTIFICATION_TOPICS } from '../types';

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
  availableDailyTopics: string[];
  onAddDailyTopic: () => void;
  selectedCertTopic: string;
  onCertTopicChange: (topic: string) => void;
  availableCertTopics: string[];
  onAddCertTopic: () => void;
  isChallengeMode: boolean;
  onChallengeToggle: (val: boolean) => void;
}

const CONTROL_LOCALIZATION: Record<Language, any> = {
  [Language.ENGLISH]: {
    targetLang: "Target",
    simType: "Simulation Setting",
    casual: "Daily",
    pro: "Business",
    study: "Study",
    scenarios: "Scenarios",
    domain: "Domain",
    exams: "Certifications",
    start: "Start Immersion",
    sync: "Syncing...",
    neuralActive: "Active",
    challengeTitle: "Diagnostic Protocol",
    trainingTitle: "Learning Protocol",
    challengeDesc: "Examiner mode.",
    trainingDesc: "Coach mode."
  },
  [Language.JAPANESE]: {
    targetLang: "対象言語",
    simType: "シミュレーション設定",
    casual: "日常会話",
    pro: "ビジネス",
    study: "資格勉強",
    scenarios: "シナリオ",
    domain: "分野",
    exams: "対象資格",
    start: "トレーニング開始",
    sync: "同期中...",
    neuralActive: "有効",
    challengeTitle: "診断プロトコル",
    trainingTitle: "学習プロトコル",
    challengeDesc: "試験官モード。",
    trainingDesc: "コーチモード。"
  },
  [Language.CHINESE]: {
    targetLang: "目标语言",
    simType: "模拟设置",
    casual: "日常",
    pro: "商务",
    study: "考试学习",
    scenarios: "场景",
    domain: "领域",
    exams: "证书",
    start: "开始沉浸",
    sync: "同步中...",
    neuralActive: "激活",
    challengeTitle: "诊断协议",
    trainingTitle: "学习协议",
    challengeDesc: "考官模式。",
    trainingDesc: "教练模式。"
  },
  [Language.KOREAN]: {
    targetLang: "대상 언어",
    simType: "시뮬레이션 설정",
    casual: "일상",
    pro: "비즈니스",
    study: "자격증 공부",
    scenarios: "시나리오",
    domain: "분야",
    exams: "자격증",
    start: "몰입 시작",
    sync: "동기화 중...",
    neuralActive: "활성",
    challengeTitle: "진단 프로토콜",
    trainingTitle: "학습 프로토콜",
    challengeDesc: "시험관 모드。",
    trainingDesc: "코치 모드。"
  }
};

const ControlPanel: React.FC<ControlPanelProps> = ({
  isConnecting, isConnected, onToggle,
  selectedLanguage, onLanguageChange,
  selectedMode, onModeChange,
  selectedCategory, onCategoryChange,
  availableCategories, onAddCategory,
  selectedDailyTopic, onDailyTopicChange,
  availableDailyTopics, onAddDailyTopic,
  selectedCertTopic, onCertTopicChange,
  availableCertTopics, onAddCertTopic,
  isChallengeMode, onChallengeToggle,
}) => {
  const loc = CONTROL_LOCALIZATION[selectedLanguage] || CONTROL_LOCALIZATION[Language.ENGLISH];

  const getDropdownConfig = () => {
    switch(selectedMode) {
      case PracticeMode.DAILY:
        return { label: loc.scenarios, value: selectedDailyTopic, onChange: onDailyTopicChange, options: availableDailyTopics, onAdd: onAddDailyTopic };
      case PracticeMode.BUSINESS:
        return { label: loc.domain, value: selectedCategory, onChange: onCategoryChange, options: availableCategories, onAdd: onAddCategory };
      case PracticeMode.CERTIFICATION:
        return { label: loc.exams, value: selectedCertTopic, onChange: onCertTopicChange, options: availableCertTopics, onAdd: onAddCertTopic };
    }
  };

  const config = getDropdownConfig();

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 bg-slate-800/40 rounded-[2.5rem] border border-slate-700 shadow-2xl backdrop-blur-md">
      
      {/* Connection Button */}
      <div className="flex flex-col items-center gap-4 py-2">
        <button 
          onClick={onToggle} 
          disabled={isConnecting}
          className={`relative flex items-center justify-center w-24 h-24 md:w-28 md:h-28 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-2xl p-0 ${
            isConnected ? 'bg-red-500 shadow-red-900/40' : 'bg-gradient-to-br from-blue-600 to-indigo-700 shadow-blue-900/40'
          } disabled:opacity-50`}
        >
          {isConnecting ? (
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
          ) : isConnected ? (
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-8 bg-white rounded-full" />
              <div className="w-2.5 h-8 bg-white rounded-full" />
            </div>
          ) : (
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          )}
        </button>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
          {isConnecting ? loc.sync : isConnected ? loc.neuralActive : loc.start}
        </span>
      </div>

      <div className="h-px bg-slate-700/50 w-full"></div>

      {/* Language */}
      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">{loc.targetLang}</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(Language).map((lang) => (
            <button
              key={lang}
              onClick={() => onLanguageChange(lang)}
              className={`px-3 py-2 text-[10px] font-bold rounded-xl border transition-all ${
                selectedLanguage === lang ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-900/60 border-slate-700 text-slate-500 hover:border-slate-500'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Mode Selector - 3 Options Now */}
      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">{loc.simType}</label>
        <div className="grid grid-cols-3 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-700">
          <button
            onClick={() => onModeChange(PracticeMode.DAILY)}
            className={`py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${
              selectedMode === PracticeMode.DAILY ? 'bg-slate-800 text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {loc.casual}
          </button>
          <button
            onClick={() => onModeChange(PracticeMode.BUSINESS)}
            className={`py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${
              selectedMode === PracticeMode.BUSINESS ? 'bg-slate-800 text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {loc.pro}
          </button>
          <button
            onClick={() => onModeChange(PracticeMode.CERTIFICATION)}
            className={`py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${
              selectedMode === PracticeMode.CERTIFICATION ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {loc.study}
          </button>
        </div>
      </div>

      {/* Context Selection Dropdown */}
      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">
          {config.label}
        </label>
        <select
          value={config.value}
          onChange={(e) => config.onChange(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-slate-200 outline-none focus:border-blue-500 transition-all appearance-none"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }}
        >
          {config.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <button 
          onClick={config.onAdd}
          className="text-[9px] font-black text-blue-500/60 uppercase tracking-widest hover:text-blue-400 transition-colors ml-1"
        >
          + Add Custom
        </button>
      </div>

      <div className="h-px bg-slate-700/50 w-full"></div>

      {/* Challenge Toggle */}
      <div className="space-y-4">
        <div 
          onClick={() => onChallengeToggle(!isChallengeMode)}
          className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${
            isChallengeMode ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-slate-900/40 border-slate-800 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[10px] font-black uppercase tracking-widest ${isChallengeMode ? 'text-emerald-400' : 'text-slate-500'}`}>
              {isChallengeMode ? loc.challengeTitle : loc.trainingTitle}
            </span>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${isChallengeMode ? 'bg-emerald-500' : 'bg-slate-700'}`}>
              <div className="absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all" style={{ left: isChallengeMode ? '1.125rem' : '0.125rem' }}></div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed italic">
            {isChallengeMode ? loc.challengeDesc : loc.trainingDesc}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
