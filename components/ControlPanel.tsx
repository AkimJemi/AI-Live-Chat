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
  availableDailyTopics: string[];
  onAddDailyTopic: () => void;
  isChallengeMode: boolean;
  onChallengeToggle: (val: boolean) => void;
}

const CONTROL_LOCALIZATION: Record<Language, any> = {
  [Language.ENGLISH]: {
    targetLang: "Target",
    simType: "Simulation Setting",
    challengeTitle: "Diagnostic Protocol",
    trainingTitle: "Learning Protocol",
    challengeDesc: "Examiner mode. Strict evaluation and technical scrutiny.",
    trainingDesc: "Coach mode. Gentle corrections and conversational support.",
    challengeBtn: "Challenge Mode",
    trainingBtn: "Training Mode",
    path: "Practice Path",
    casual: "Casual",
    pro: "Professional",
    scenarios: "Scenarios",
    domain: "Domain",
    customDomain: "+ Add Domain",
    customScenario: "+ Add Scenario",
    start: "Start Immersion",
    sync: "Syncing...",
    neuralActive: "Link Active",
    diagActive: "Diagnostic Active",
    categories: {
      [BusinessCategory.DEVELOPMENT]: "Software Development",
      [BusinessCategory.MARKETING]: "Digital Marketing",
      [BusinessCategory.FINANCE]: "Investment & Finance",
      [BusinessCategory.HR]: "Human Resources",
      [BusinessCategory.SALES]: "Sales & Outreach"
    },
    topics: {
      'Exploring Local Markets': 'Exploring Local Markets',
      'Beachside Small Talk': 'Beachside Small Talk',
      'Mountain Trail Guide': 'Mountain Trail Guide',
      'Island Tour Planning': 'Island Tour Planning',
      'Seaside Restaurant': 'Seaside Restaurant',
      'Nature Photography': 'Nature Photography'
    }
  },
  [Language.JAPANESE]: {
    targetLang: "対象言語",
    simType: "シミュレーション設定",
    challengeTitle: "診断プロトコル",
    trainingTitle: "学習プロトコル",
    challengeDesc: "試験官モード。厳格な評価と技術的な精査が行われます。",
    trainingDesc: "コーチモード。優しい修正と会話サポートを提供します。",
    challengeBtn: "チャレンジモード",
    trainingBtn: "トレーニングモード",
    path: "練習コース",
    casual: "日常会話",
    pro: "ビジネス",
    scenarios: "シナリオ選択",
    domain: "専門分野",
    customDomain: "+ 分野を追加",
    customScenario: "+ シナリオを追加",
    start: "トレーニング開始",
    sync: "同期中...",
    neuralActive: "リンク有効",
    diagActive: "診断有効",
    categories: {
      [BusinessCategory.DEVELOPMENT]: "ソフトウェア開発",
      [BusinessCategory.MARKETING]: "デジタルマーケティング",
      [BusinessCategory.FINANCE]: "投資・金融",
      [BusinessCategory.HR]: "人事・採用",
      [BusinessCategory.SALES]: "営業・アウトリーチ"
    },
    topics: {
      'Exploring Local Markets': '地元の市場を探索',
      'Beachside Small Talk': 'ビーチでの雑談',
      'Mountain Trail Guide': '登山のガイド',
      'Island Tour Planning': '島巡りの計画',
      'Seaside Restaurant': '海辺のレストラン',
      'Nature Photography': '自然写真の撮影'
    }
  },
  [Language.CHINESE]: {
    targetLang: "目标语言",
    simType: "模拟设置",
    challengeTitle: "诊断协议",
    trainingTitle: "学习协议",
    challengeDesc: "考官模式。严格评估和技术审查。",
    trainingDesc: "教练模式。温和纠正和对话支持。",
    challengeBtn: "挑战模式",
    trainingBtn: "练习模式",
    path: "练习路径",
    casual: "休闲生活",
    pro: "专业职场",
    scenarios: "场景选择",
    domain: "专业领域",
    customDomain: "+ 添加领域",
    customScenario: "+ 添加场景",
    start: "开始沉浸",
    sync: "同步中...",
    neuralActive: "连接激活",
    diagActive: "诊断激活",
    categories: {
      [BusinessCategory.DEVELOPMENT]: "软件开发",
      [BusinessCategory.MARKETING]: "数字营销",
      [BusinessCategory.FINANCE]: "投资与金融",
      [BusinessCategory.HR]: "人力资源",
      [BusinessCategory.SALES]: "销售与外联"
    },
    topics: {
      'Exploring Local Markets': '探索当地市场',
      'Beachside Small Talk': '海边闲聊',
      'Mountain Trail Guide': '山间小径向导',
      'Island Tour Planning': '岛屿旅游规划',
      'Seaside Restaurant': '海滨餐厅',
      'Nature Photography': '自然摄影'
    }
  },
  [Language.KOREAN]: {
    targetLang: "대상 언어",
    simType: "시뮬레이션 설정",
    challengeTitle: "진단 프로토콜",
    trainingTitle: "학습 프로토콜",
    challengeDesc: "시험관 모드. 엄격한 평가 및 기술적 분석 수행.",
    trainingDesc: "코치 모드. 부드러운 교정 및 대화형 지원.",
    challengeBtn: "챌린지 모드",
    trainingBtn: "트레이닝 모드",
    path: "학습 경로",
    casual: "일상 생활",
    pro: "프로페셔널",
    scenarios: "시나리오選択",
    domain: "전문 분야",
    customDomain: "+ 분야 추가",
    customScenario: "+ 시나리오 추가",
    start: "몰입 시작",
    sync: "동기화 중...",
    neuralActive: "링크 활성화",
    diagActive: "진단 활성화",
    categories: {
      [BusinessCategory.DEVELOPMENT]: "소프트웨어 개발",
      [BusinessCategory.MARKETING]: "디지털 마케팅",
      [BusinessCategory.FINANCE]: "투자 및 금융",
      [BusinessCategory.HR]: "인사 관리",
      [BusinessCategory.SALES]: "영업 및 아웃리치"
    },
    topics: {
      'Exploring Local Markets': '현지 시장 탐방',
      'Beachside Small Talk': '해변에서의 스몰토크',
      'Mountain Trail Guide': '등산로 안내',
      'Island Tour Planning': '섬 투어 계획',
      'Seaside Restaurant': '해변 레스토랑',
      'Nature Photography': '자연 사진 촬영'
    }
  }
};

const ControlPanel: React.FC<ControlPanelProps> = ({
  isConnecting, isConnected, onToggle,
  selectedLanguage, onLanguageChange,
  selectedMode, onModeChange,
  selectedSituation, onSituationChange,
  selectedCategory, onCategoryChange,
  availableCategories, onAddCategory,
  selectedDailyTopic, onDailyTopicChange,
  availableDailyTopics, onAddDailyTopic,
  isChallengeMode, onChallengeToggle,
}) => {
  const loc = CONTROL_LOCALIZATION[selectedLanguage] || CONTROL_LOCALIZATION[Language.ENGLISH];

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 bg-slate-800/40 rounded-[2rem] md:rounded-[2.5rem] border border-slate-700 shadow-2xl backdrop-blur-md">
      
      {/* 1. Main Connection Trigger */}
      <div className="flex flex-col items-center gap-4 py-2">
        <button onClick={onToggle} disabled={isConnecting}
          className={`relative flex items-center justify-center w-24 h-24 md:w-28 md:h-28 rounded-full transition-all transform hover:scale-105 active:scale-90 shadow-2xl ${
            isConnected ? 'bg-red-500 shadow-red-900/40' : 'bg-gradient-to-br from-blue-600 to-indigo-700 shadow-blue-900/40'
          } disabled:opacity-50`}>
          {isConnecting ? <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-white border-t-transparent rounded-full animate-spin" /> : 
            isConnected ? <div className="flex items-center gap-1.5"><div className="w-2.5 h-7 md:w-3 md:h-8 bg-white rounded-full" /><div className="w-2.5 h-7 md:w-3 md:h-8 bg-white rounded-full" /></div> :
            <svg className="w-10 h-10 md:w-12 md:h-12 text-white translate-x-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
          }
          {isConnected && <div className="absolute inset-0 rounded-full border-4 border-red-400/30 voice-pulse" />}
        </button>
        <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] h-4 text-center ${isConnected ? 'text-green-400 animate-pulse' : 'text-slate-500'}`}>
          {isConnecting ? loc.sync : isConnected ? (isChallengeMode ? loc.diagActive : loc.neuralActive) : loc.start}
        </p>
      </div>

      <div className="h-px bg-slate-700/50 w-full" />

      {/* 2. Configuration Grid */}
      <div className="flex flex-col gap-6">
        {/* Language Selection */}
        <div className="flex flex-col gap-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{loc.targetLang}</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(Language).map((lang) => (
              <button 
                key={lang} 
                onClick={() => onLanguageChange(lang)} 
                disabled={isConnecting || isConnected}
                className={`h-9 rounded-xl text-[10px] font-black border transition-all ${
                  selectedLanguage === lang 
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300' 
                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Mode Switcher (Casual/Pro) */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => onModeChange(PracticeMode.DAILY)} disabled={isConnecting || isConnected}
            className={`h-20 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 ${
              selectedMode === PracticeMode.DAILY ? 'bg-emerald-500/10 border-emerald-500 text-emerald-200 shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}>
            <span className="text-xl">🌴</span>
            <span className="font-black text-[9px] uppercase tracking-widest">{loc.casual}</span>
          </button>
          <button onClick={() => onModeChange(PracticeMode.BUSINESS)} disabled={isConnecting || isConnected}
            className={`h-20 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 ${
              selectedMode === PracticeMode.BUSINESS ? 'bg-blue-500/10 border-blue-500 text-blue-200 shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}>
            <span className="text-xl">👔</span>
            <span className="font-black text-[9px] uppercase tracking-widest">{loc.pro}</span>
          </button>
        </div>

        {/* Dynamic Selection List (Localized) */}
        <div className="flex flex-col gap-2 min-h-[160px] overflow-y-auto max-h-[220px] custom-scrollbar pr-2">
          {selectedMode === PracticeMode.DAILY ? (
            availableDailyTopics.map((topic) => (
              <button 
                key={topic} 
                onClick={() => onDailyTopicChange(topic)} 
                disabled={isConnecting || isConnected}
                className={`w-full p-3 rounded-xl border text-[11px] font-bold text-left transition-all ${
                  selectedDailyTopic === topic ? 'bg-emerald-600/20 border-emerald-500 text-emerald-100' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                }`}
              >
                {loc.topics[topic] || topic}
              </button>
            ))
          ) : (
            availableCategories.map((cat) => (
              <button 
                key={cat} 
                onClick={() => onCategoryChange(cat)} 
                disabled={isConnecting || isConnected}
                className={`w-full p-3 rounded-xl border text-[11px] font-bold text-left transition-all ${
                  selectedCategory === cat ? 'bg-blue-600/20 border-blue-500 text-blue-100' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                }`}
              >
                {loc.categories[cat] || cat}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;