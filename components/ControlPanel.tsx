
import React from 'react';
import { VoiceName, Language, PracticeMode, BusinessSituation, BusinessCategory, StudyCondition } from '../types';

interface ControlPanelProps {
  isConnecting: boolean;
  isConnected: boolean;
  onToggle: () => void;
  onFinishStudy?: () => void;
  isSummarizing?: boolean;
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
  selectedCondition: StudyCondition;
  onConditionChange: (cond: StudyCondition) => void;
  isChallengeMode: boolean;
  onChallengeToggle: (val: boolean) => void;
}

const CONTROL_LOCALIZATION: Record<Language, any> = {
  [Language.ENGLISH]: {
    targetLang: "Target Language",
    simType: "Mode Select",
    casual: "Daily",
    pro: "Business",
    study: "Study",
    scenarios: "Scenario",
    domain: "Domain",
    situation: "Situation",
    exams: "Topic",
    modifiers: "Condition",
    start: "Start Link",
    sync: "Syncing...",
    neuralActive: "Active",
    finish: "Archive State",
    trainingTitle: "Study Protocol",
    addNew: "+ New"
  },
  [Language.JAPANESE]: {
    targetLang: "学習言語",
    simType: "学習モード",
    casual: "日常会話",
    pro: "ビジネス",
    study: "資格・専門",
    scenarios: "シナリオ選択",
    domain: "ビジネス分野",
    situation: "状況設定",
    exams: "専門トピック",
    modifiers: "学習コンディション",
    start: "ニューラル接続",
    sync: "同期中...",
    neuralActive: "通信中",
    finish: "アーカイブ保存",
    trainingTitle: "学習プロトコル",
    addNew: "+ 追加"
  },
  [Language.CHINESE]: {
    targetLang: "目标语言",
    simType: "模式选择",
    casual: "日常",
    pro: "商务",
    study: "学术",
    scenarios: "场景",
    domain: "领域",
    situation: "场合",
    exams: "课题",
    modifiers: "附加条件",
    start: "启动链接",
    sync: "同步中...",
    neuralActive: "已激活",
    finish: "保存存档",
    trainingTitle: "学习协议",
    addNew: "+ 新增"
  },
  [Language.KOREAN]: {
    targetLang: "대상 언어",
    simType: "모드 선택",
    casual: "일상",
    pro: "비즈니스",
    study: "자격증",
    scenarios: "시나리오",
    domain: "분야",
    situation: "상황",
    exams: "시험 주제",
    modifiers: "학습 조건",
    start: "링크 시작",
    sync: "동기화 중...",
    neuralActive: "활성화됨",
    finish: "기록 보관",
    trainingTitle: "학습 프로토콜",
    addNew: "+ 추가"
  }
};

const ControlPanel: React.FC<ControlPanelProps> = ({
  isConnecting, isConnected, onToggle, onFinishStudy, isSummarizing,
  selectedLanguage, onLanguageChange,
  selectedMode, onModeChange,
  selectedSituation, onSituationChange,
  selectedCategory, onCategoryChange,
  availableCategories, onAddCategory,
  selectedDailyTopic, onDailyTopicChange,
  availableDailyTopics, onAddDailyTopic,
  selectedCertTopic, onCertTopicChange,
  availableCertTopics, onAddCertTopic,
  selectedCondition, onConditionChange,
}) => {
  const loc = CONTROL_LOCALIZATION[selectedLanguage] || CONTROL_LOCALIZATION[Language.ENGLISH];

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 bg-slate-800/40 rounded-[2.5rem] border border-slate-700 shadow-2xl backdrop-blur-md">
      
      {/* Power Core */}
      <div className="flex flex-col items-center gap-4 py-2">
        <button 
          onClick={onToggle} 
          disabled={isConnecting}
          className={`relative flex items-center justify-center w-28 h-28 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-2xl ${
            isConnected ? 'bg-rose-500 shadow-rose-900/40' : 'bg-gradient-to-br from-emerald-600 to-teal-700 shadow-emerald-900/40'
          } disabled:opacity-50`}
        >
          {isConnecting ? (
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
          ) : isConnected ? (
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-10 bg-white rounded-full" />
              <div className="w-2.5 h-10 bg-white rounded-full" />
            </div>
          ) : (
            <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
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

      {/* Language Engine */}
      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">{loc.targetLang}</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(Language).map((lang) => (
            <button
              key={lang}
              onClick={() => onLanguageChange(lang)}
              className={`px-3 py-2 text-[10px] font-bold rounded-xl border transition-all ${
                selectedLanguage === lang ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900/60 border-slate-700 text-slate-500 hover:text-slate-300'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Protocol Core */}
      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">{loc.simType}</label>
        <div className="grid grid-cols-1 gap-2">
          {[PracticeMode.DAILY, PracticeMode.BUSINESS, PracticeMode.CERTIFICATION].map(m => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className={`py-3 px-4 text-left text-[11px] font-black uppercase tracking-widest rounded-xl border transition-all ${
                selectedMode === m ? 'bg-slate-800 border-emerald-500/50 text-emerald-400 shadow-sm' : 'bg-slate-900/40 border-slate-800 text-slate-500'
              }`}
            >
              {m === PracticeMode.DAILY ? loc.casual : m === PracticeMode.BUSINESS ? loc.pro : loc.study}
            </button>
          ))}
        </div>
      </div>

      {/* Detailed Tuning */}
      <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
        {selectedMode === PracticeMode.DAILY && (
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{loc.scenarios}</label>
              <button onClick={onAddDailyTopic} className="text-[9px] text-emerald-500 font-bold hover:underline">{loc.addNew}</button>
            </div>
            <select
              value={selectedDailyTopic}
              onChange={(e) => onDailyTopicChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-slate-200 outline-none focus:border-emerald-500 transition-all appearance-none"
            >
              {availableDailyTopics.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        )}

        {selectedMode === PracticeMode.BUSINESS && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{loc.domain}</label>
                <button onClick={onAddCategory} className="text-[9px] text-indigo-500 font-bold hover:underline">{loc.addNew}</button>
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-slate-200 outline-none focus:border-indigo-500"
              >
                {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{loc.situation}</label>
              <select
                value={selectedSituation}
                onChange={(e) => onSituationChange(e.target.value as BusinessSituation)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-slate-200 outline-none focus:border-indigo-500"
              >
                {Object.values(BusinessSituation).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </>
        )}

        {selectedMode === PracticeMode.CERTIFICATION && (
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{loc.exams}</label>
              <button onClick={onAddCertTopic} className="text-[9px] text-emerald-500 font-bold hover:underline">{loc.addNew}</button>
            </div>
            <select
              value={selectedCertTopic}
              onChange={(e) => onCertTopicChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-slate-200 outline-none focus:border-emerald-500"
            >
              {availableCertTopics.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{loc.modifiers}</label>
          <select
            value={selectedCondition}
            onChange={(e) => onConditionChange(e.target.value as StudyCondition)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-slate-200 outline-none focus:border-teal-500"
          >
            {Object.values(StudyCondition).map(cond => <option key={cond} value={cond}>{cond}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
