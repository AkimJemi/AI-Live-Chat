
import React, { useState } from 'react';
import { SavedSession, Language, PracticeMode } from '../types';

interface HistoryPanelProps {
  sessions: SavedSession[];
  onDelete: (id: string) => void;
  lang: Language;
}

const LOCAL_CONTENT: Record<Language, any> = {
  [Language.ENGLISH]: {
    empty: "The Archive is Empty",
    restore: "Access Neural Log",
    delete: "Purge",
    terms: "Mastered",
    messages: "Turns",
    cloud: "Cloud Sync Ready"
  },
  [Language.JAPANESE]: {
    empty: "履歴データがありません",
    restore: "ログにアクセス",
    delete: "削除",
    terms: "習得用語",
    messages: "対話数",
    cloud: "クラウド同期準備完了"
  },
  [Language.CHINESE]: {
    empty: "档案库为空",
    restore: "访问日志",
    delete: "清除",
    terms: "掌握",
    messages: "对话",
    cloud: "云同步就绪"
  },
  [Language.KOREAN]: {
    empty: "보관소가 비어 있습니다",
    restore: "로그 액세스",
    delete: "삭제",
    terms: "습득",
    messages: "대화",
    cloud: "클라우드 동기화 준비 완료"
  }
};

const HistoryPanel: React.FC<HistoryPanelProps> = ({ sessions, onDelete, lang }) => {
  const [selectedSession, setSelectedSession] = useState<SavedSession | null>(null);
  const t = LOCAL_CONTENT[lang] || LOCAL_CONTENT[Language.ENGLISH];

  if (sessions.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-20 bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[3rem] opacity-40">
        <p className="text-sm font-black uppercase tracking-[0.4em] text-slate-500">{t.empty}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => (
          <div 
            key={session.id}
            className="group relative bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 hover:border-blue-500/50 hover:bg-slate-800/60 transition-all duration-500 shadow-xl"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter">
                    {new Date(session.timestamp).toLocaleString()}
                  </span>
                </div>
                <h4 className="text-sm font-black text-white uppercase italic tracking-tight">{session.topic}</h4>
                <span className="text-[8px] font-mono text-slate-600 mt-1">{session.userId}</span>
              </div>
              <button 
                onClick={() => onDelete(session.id)}
                className="p-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 mb-8">
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed italic border-l border-slate-700 pl-3">
                {session.summary}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-800">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{t.terms}</span>
                <span className="text-lg font-black text-white">{session.learnedTerms.length}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{t.messages}</span>
                <span className="text-lg font-black text-white">{session.transcriptions.length}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 py-2 bg-slate-950/40 rounded-xl border border-slate-800/50">
               <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
               </svg>
               <span className="text-[8px] font-black text-emerald-500/80 uppercase tracking-widest">{t.cloud}</span>
            </div>

            <button
              onClick={() => setSelectedSession(session)}
              className="w-full mt-4 py-3 bg-slate-900/60 border border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all shadow-lg"
            >
              {t.restore}
            </button>
          </div>
        ))}
      </div>

      {/* Detail View Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-white italic uppercase">{selectedSession.topic}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Archive Link: {selectedSession.id}</p>
                  <span className="text-[10px] text-blue-500 font-mono">USER: {selectedSession.userId}</span>
                </div>
              </div>
              <button onClick={() => setSelectedSession(null)} className="p-2 text-slate-500 hover:text-white transition-colors text-2xl">✕</button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-2 gap-12 custom-scrollbar">
              <div className="space-y-8">
                 <div>
                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      AI Synthesis Report
                    </h4>
                    <div className="p-6 bg-slate-950/40 rounded-3xl border border-slate-800 text-sm text-slate-300 leading-relaxed italic">
                      {selectedSession.summary}
                    </div>
                 </div>
                 <div>
                    <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                      Extracted Neural Patterns (Mastered Terms)
                    </h4>
                    <div className="space-y-3">
                      {selectedSession.learnedTerms.map((item, i) => (
                        <div key={i} className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50 group hover:border-emerald-500/30 transition-all">
                          <div className="font-bold text-white mb-1 group-hover:text-emerald-400">{item.term}</div>
                          <div className="text-xs text-slate-400 leading-relaxed italic">{item.definition}</div>
                        </div>
                      ))}
                    </div>
                 </div>
              </div>

              <div>
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-slate-700 rounded-full"></div>
                    Linguistic Data Stream
                 </h4>
                 <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                    {selectedSession.transcriptions.map((entry, i) => (
                      <div key={i} className={`flex flex-col ${entry.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <span className="text-[8px] uppercase font-black text-slate-600 mb-1">{entry.role}</span>
                        <div className={`p-4 rounded-2xl text-xs max-w-[85%] ${
                          entry.role === 'user' ? 'bg-blue-600/10 border border-blue-500/20 text-blue-100' : 'bg-slate-800/80 border border-slate-700 text-slate-300'
                        }`}>
                          {entry.text}
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>

            <div className="p-8 bg-slate-950/50 border-t border-slate-800 flex justify-center">
               <button onClick={() => setSelectedSession(null)} className="px-12 py-4 bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-700 transition-all">Terminate Access</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;
