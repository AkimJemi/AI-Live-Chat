
import React from 'react';
import { SavedSession, Language } from '../types';

interface HistoryPanelProps {
  sessions: SavedSession[];
  onLoad: (session: SavedSession) => void;
  onDelete: (id: string) => void;
  lang: Language;
}

const LOCAL_CONTENT: Record<Language, any> = {
  [Language.ENGLISH]: {
    title: "Neural History Archive",
    restore: "Restore Session",
    empty: "No text history"
  },
  [Language.JAPANESE]: {
    title: "履歴アーカイブ",
    restore: "セッションを復元",
    empty: "履歴なし"
  },
  [Language.CHINESE]: {
    title: "神经历史存档",
    restore: "恢复会话",
    empty: "暂无历史记录"
  },
  [Language.KOREAN]: {
    title: "기록 보관소",
    restore: "세션 복원",
    empty: "대화 기록 없음"
  }
};

const HistoryPanel: React.FC<HistoryPanelProps> = ({ sessions, onLoad, onDelete, lang }) => {
  const t = LOCAL_CONTENT[lang] || LOCAL_CONTENT[Language.ENGLISH];
  if (sessions.length === 0) return null;

  return (
    <section className="w-full max-w-6xl mt-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex items-center gap-4 mb-6 px-4">
        <div className="h-px flex-1 bg-slate-800"></div>
        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] whitespace-nowrap">{t.title}</h2>
        <div className="h-px flex-1 bg-slate-800"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map((session) => (
          <div 
            key={session.id}
            className="group relative bg-slate-900/40 border border-slate-800 rounded-3xl p-5 hover:border-blue-500/50 hover:bg-slate-800/60 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex flex-col">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter">
                  {new Date(session.timestamp).toLocaleString()}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded-lg bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase">
                    {session.language}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-700/50 text-slate-400 text-[9px] font-bold uppercase">
                    {session.mode === 'Business' ? '💼' : '🌴'}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => onDelete(session.id)}
                className="p-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            <p className="text-xs text-slate-300 line-clamp-2 italic mb-4 min-h-[2rem]">
              "{session.preview || t.empty}"
            </p>

            <button
              onClick={() => onLoad(session)}
              className="w-full py-2 bg-slate-800 border border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all"
            >
              {t.restore}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HistoryPanel;
