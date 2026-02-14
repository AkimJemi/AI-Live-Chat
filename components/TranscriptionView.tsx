import React, { useEffect, useRef } from 'react';
import { TranscriptionEntry, Language } from '../types';

interface TranscriptionViewProps {
  entries: TranscriptionEntry[];
  lang: Language;
}

const LOCAL_CONTENT: Record<Language, any> = {
  [Language.ENGLISH]: {
    awaiting: "Neural Stream Awaiting Input",
    startTip: "Start talking to see real-time transcriptions.",
    user: "Linguistic Source",
    model: "Gemini Response"
  },
  [Language.JAPANESE]: {
    awaiting: "入力待機中...",
    startTip: "話し始めるとリアルタイムで文字起こしが表示されます。",
    user: "あなたの発言",
    model: "Geminiの応答"
  },
  [Language.CHINESE]: {
    awaiting: "等待输入中...",
    startTip: "开始说话即可查看实时转录。",
    user: "你的发言",
    model: "Gemini 响应"
  },
  [Language.KOREAN]: {
    awaiting: "입력 대기 중...",
    startTip: "말을 시작하면 실시간 대화 기록이 표시됩니다.",
    user: "사용자 입력",
    model: "Gemini 응답"
  }
};

const TranscriptionView: React.FC<TranscriptionViewProps> = ({ entries, lang }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = LOCAL_CONTENT[lang] || LOCAL_CONTENT[Language.ENGLISH];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] md:min-h-[500px] text-slate-500 italic opacity-40 p-6 md:p-12 text-center border-2 border-dashed border-slate-800 rounded-[1.5rem] md:rounded-[2.5rem] bg-slate-950/20">
        <svg className="w-10 h-10 md:w-12 md:h-12 mb-4 md:mb-6 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="text-[10px] md:text-[11px] font-black uppercase tracking-widest">{t.awaiting}</p>
        <span className="text-[9px] md:text-[10px] mt-2 opacity-50">{t.startTip}</span>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex flex-col gap-4 md:gap-6 overflow-y-auto h-full max-h-[400px] md:max-h-[500px] p-4 md:p-8 bg-slate-950/40 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-800 scroll-smooth custom-scrollbar"
    >
      {entries.map((entry, idx) => (
        <div
          key={`${entry.timestamp}-${idx}`}
          className={`flex flex-col max-w-[95%] md:max-w-[90%] ${entry.role === 'user' ? 'self-end items-end' : 'self-start items-start'} animate-in slide-in-from-bottom-2 duration-300`}
        >
          <span className={`text-[8px] md:text-[10px] uppercase font-black mb-1 md:mb-1.5 tracking-widest ${entry.role === 'user' ? 'text-blue-500' : 'text-slate-500'}`}>
            {entry.role === 'user' ? t.user : t.model}
          </span>
          <div
            className={`px-4 md:px-5 py-2 md:py-3 rounded-[1.2rem] md:rounded-[1.5rem] text-xs md:text-[13px] leading-relaxed shadow-lg ${
              entry.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-none'
                : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
            }`}
          >
            {entry.text}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TranscriptionView;