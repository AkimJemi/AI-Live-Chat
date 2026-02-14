
import React from 'react';
import { Language } from '../types';

interface SuggestionPanelProps {
  suggestions: string[];
  isLoading: boolean;
  error: string | null;
  isPlaying: string | null;
  onSelect: (text: string) => void;
  lang: Language;
}

const LOCAL_CONTENT: Record<Language, any> = {
  [Language.ENGLISH]: {
    title: "How to Respond",
    awaiting: "Awaiting Turn",
    tipTitle: "Learning Tip",
    tipDesc: "Repeat the selected phrase three times after listening to internalize the intonation.",
    quota: "Quota Notice",
    option: "Option"
  },
  [Language.JAPANESE]: {
    title: "推奨回答",
    awaiting: "発話を待機中",
    tipTitle: "学習のヒント",
    tipDesc: "聞いたフレーズを3回繰り返して、イントネーションを定着させましょう。",
    quota: "制限通知",
    option: "選択肢"
  },
  [Language.CHINESE]: {
    title: "如何回答",
    awaiting: "等待发言",
    tipTitle: "学习贴士",
    tipDesc: "听完后将所选短语重复三遍，以巩固语调。",
    quota: "配额通知",
    option: "选项"
  },
  [Language.KOREAN]: {
    title: "추천 답변",
    awaiting: "발화 대기 중",
    tipTitle: "학습 팁",
    tipDesc: "들은 문장을 세 번 반복하여 억양을 익히세요.",
    quota: "할당량 알림",
    option: "옵션"
  }
};

const SuggestionPanel: React.FC<SuggestionPanelProps> = ({ suggestions, isLoading, error, isPlaying, onSelect, lang }) => {
  const t = LOCAL_CONTENT[lang] || LOCAL_CONTENT[Language.ENGLISH];

  return (
    <div className="flex flex-col h-full bg-slate-900/40 rounded-[2rem] border border-slate-700/50 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 rounded-xl">
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-sm font-black text-slate-300 uppercase tracking-wider">{t.title}</h3>
        </div>
        {isLoading && <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide">
        {error ? (
          <div className="p-4 text-center border border-red-500/20 rounded-2xl bg-red-900/10 text-[10px] text-red-400 font-medium leading-relaxed">
            <p className="mb-1 uppercase font-bold tracking-wider">{t.quota}</p>
            {error}
          </div>
        ) : suggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-600">
            <svg className="w-10 h-10 mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">{t.awaiting}</p>
          </div>
        ) : (
          suggestions.map((text, idx) => (
            <div
              key={idx}
              className={`group relative p-4 rounded-2xl border transition-all duration-300 ${
                isPlaying === text 
                  ? 'bg-blue-600/10 border-blue-500/50 ring-1 ring-blue-500/30' 
                  : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-500 hover:bg-slate-800/60'
              }`}
            >
              <div className="pr-10">
                <span className="text-[9px] font-bold text-blue-500/60 uppercase tracking-widest mb-1 block">{t.option} {idx + 1}</span>
                <p className="text-sm text-slate-200 font-medium leading-relaxed">{text}</p>
              </div>
              
              <button
                onClick={() => onSelect(text)}
                disabled={!!isPlaying}
                className={`absolute top-4 right-4 p-2 rounded-xl transition-all ${
                  isPlaying === text
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 animate-pulse'
                    : 'bg-slate-700/50 text-slate-400 hover:bg-blue-600 hover:text-white hover:shadow-lg'
                }`}
                title="Hear Pronunciation"
              >
                {isPlaying === text ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 9V15H16V9H14ZM18 9V15H20V9H18ZM10 9L5 13H2V11V9H5L10 13V9Z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                )}
              </button>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-6 flex flex-col gap-2">
         <div className="h-px bg-slate-800 w-full mb-2"></div>
         <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
           <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{t.tipTitle}</p>
         </div>
         <p className="text-[10px] text-slate-400 leading-normal italic">
           {t.tipDesc}
         </p>
      </div>
    </div>
  );
};

export default SuggestionPanel;
