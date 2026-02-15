
import React from 'react';
import { Language } from '../types';

interface SummaryModalProps {
  summary: string;
  onClose: () => void;
  onDownload: () => void;
  lang: Language;
}

const LOCAL_CONTENT: Record<Language, any> = {
  [Language.ENGLISH]: {
    title: "Study Session Report",
    download: "Download .txt",
    close: "Close",
    exporting: "Exporting Data..."
  },
  [Language.JAPANESE]: {
    title: "学習セッション・レポート",
    download: "ファイルを保存 (.txt)",
    close: "閉じる",
    exporting: "データ出力中..."
  },
  [Language.CHINESE]: {
    title: "学习环节报告",
    download: "下载 .txt",
    close: "关闭",
    exporting: "导出数据中..."
  },
  [Language.KOREAN]: {
    title: "학습 세션 보고서",
    download: "파일 저장 (.txt)",
    close: "닫기",
    exporting: "데이터 내보내는 중..."
  }
};

const SummaryModal: React.FC<SummaryModalProps> = ({ summary, onClose, onDownload, lang }) => {
  const t = LOCAL_CONTENT[lang] || LOCAL_CONTENT[Language.ENGLISH];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">{t.title}</h2>
              <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-[0.3em]">AI-Generated Synthesis</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
          <div className="bg-slate-950/50 rounded-3xl p-6 border border-slate-800/50">
            <pre className="text-xs md:text-sm text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
              {summary}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-950/50 border-t border-slate-800 flex gap-4">
          <button 
            onClick={onDownload}
            className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-emerald-900/20 active:scale-95 flex items-center justify-center gap-3"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            {t.download}
          </button>
          <button 
            onClick={onClose}
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-95"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SummaryModal;
