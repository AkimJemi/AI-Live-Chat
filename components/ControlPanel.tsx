
import React from 'react';
import { VoiceName, Language, PracticeMode, BusinessSituation, BusinessCategory, DAILY_TOPICS, CERTIFICATION_TOPICS, StudyCondition } from '../types';

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
    start: "Start Training",
    sync: "Syncing...",
    neuralActive: "Linked",
    finish: "Commit to DB",
    trainingTitle: "Study Protocol"
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
    start: "トレーニング開始",
    sync: "同期中...",
    neuralActive: "リンク中",
    finish: "セッション終了・保存",
    trainingTitle: "学習プロトコル"
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
    start: "开始训练",
    sync: "同步中...",
    neuralActive: "已连接",
    finish: "保存会话",
    trainingTitle: "学习协议"
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
    start: "훈련 시작",
    sync: "동기화 중...",
    neuralActive: "연결됨",
    finish: "학습 완료 및 저장",
    trainingTitle: "학습 프로토콜"
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
      
      {/* 接続ボタン */}
      <div className="flex flex-col items-center gap-4 py-2">
        <button 
          onClick={onToggle} 
          disabled={isConnecting}
          className={`relative flex items-center justify-center w-24 h-24 md:w-28 md:h-28 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-2xl ${
            isConnected ? 'bg-rose-500 shadow-rose-900/40' : 'bg-gradient-to-br from-emerald-600 to-teal-700 shadow-emerald-900/40'
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

        {/* 保存ボタン */}
        {isConnected && onFinishStudy && (
          <button 
            onClick={onFinishStudy}
            disabled={isSummarizing}
            className="w-full mt-2 py-3 bg-blue-500/20 border border-blue-500/50 rounded-2xl text-[10px] font-black text-blue-400 uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {isSummarizing ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : loc.finish}
          </button>
        )}
      </div>

      <div className="h-px bg-slate-700/50 w-full"></div>

      {/* 言語設定 */}
      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">{loc.targetLang}</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(Language).map((lang) => (
            <button
              key={lang}
              onClick={() => onLanguageChange(lang)}
              className={`px-3 py-2 text-[10px] font-bold rounded-xl border transition-all ${
                selectedLanguage === lang ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900/60 border-slate-700 text-slate-500'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* モード切替 */}
      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">{loc.simType}</label>
        <div className="grid grid-cols-3 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-700">
          {[PracticeMode.DAILY, PracticeMode.BUSINESS, PracticeMode.CERTIFICATION].map(m => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className={`py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${
                selectedMode === m ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-500'
              }`}
            >
              {m === PracticeMode.DAILY ? loc.casual : m === PracticeMode.BUSINESS ? loc.pro : loc.study}
            </button>
          ))}
        </div>
      </div>

      {/* 詳細トピック設定 */}
      <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
        {selectedMode === PracticeMode.DAILY && (
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{loc.scenarios}</label>
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
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{loc.domain}</label>
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
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{loc.exams}</label>
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
