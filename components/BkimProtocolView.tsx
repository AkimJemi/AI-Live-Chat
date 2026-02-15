
import React from 'react';
import { BkimSchedule } from '../types';

interface BkimProtocolViewProps {
  schedule: BkimSchedule | null;
  onClose: () => void;
}

const BkimProtocolView: React.FC<BkimProtocolViewProps> = ({ schedule, onClose }) => {
  if (!schedule) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="w-full max-w-4xl bg-slate-900 border-2 border-cyan-500/30 rounded-[3rem] shadow-[0_0_100px_rgba(6,182,212,0.15)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Terminal Header */}
        <div className="bg-slate-950/80 p-6 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Bkim Protocol Engine</h2>
              <p className="text-[9px] font-mono text-cyan-400 uppercase tracking-[0.4em]">System Hash: {schedule.protocolId}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-800 rounded-full transition-colors text-slate-500 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-10 custom-scrollbar">
          
          {/* Daily Schedule Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1.5 h-5 bg-cyan-500 rounded-full"></div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">一日進捗予定 (Progress Schedule)</h3>
            </div>
            
            <div className="space-y-4">
              {schedule.dailySchedule.map((item, idx) => (
                <div key={idx} className="group relative p-5 bg-slate-950/50 border border-slate-800 rounded-2xl flex items-center gap-4 hover:border-cyan-500/50 transition-all duration-300">
                  <div className="text-[10px] font-mono text-cyan-500/70 w-16 flex-shrink-0">{item.time}</div>
                  <div className="flex-grow">
                    <div className="text-[13px] font-bold text-slate-100">{item.task}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                        item.priority === 'High' ? 'bg-red-500/10 text-red-400' : 'bg-slate-800 text-slate-500'
                      }`}>{item.priority}</span>
                      <span className="text-[8px] font-mono text-slate-600 uppercase tracking-tighter">Status: {item.status}</span>
                    </div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-cyan-500/20 group-hover:bg-cyan-400 transition-colors animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Execution Prep Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1.5 h-5 bg-indigo-500 rounded-full"></div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">実行準備 (Execution Prep)</h3>
            </div>
            
            <div className="bg-indigo-600/5 border border-indigo-500/20 rounded-[2rem] p-6 space-y-4">
              {schedule.executionPrep.map((prep, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-950/30 border border-slate-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${prep.ready ? 'bg-indigo-500 border-indigo-400' : 'bg-slate-800 border-slate-700'}`}>
                      {prep.ready && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className={`text-[11px] font-bold ${prep.ready ? 'text-indigo-100' : 'text-slate-500 italic'}`}>{prep.item}</span>
                  </div>
                  <span className={`text-[8px] font-mono uppercase tracking-widest ${prep.ready ? 'text-indigo-400' : 'text-slate-600'}`}>
                    {prep.ready ? 'Ready' : 'Incomplete'}
                  </span>
                </div>
              ))}
              
              <div className="mt-8 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-cyan-400 text-lg">💡</span>
                  <span className="text-[10px] font-black text-cyan-300 uppercase tracking-widest">Bkim's Note</span>
                </div>
                <p className="text-[11px] text-cyan-100/70 italic leading-relaxed">
                  "Architecture is about the things that are hard to change later. Let's focus on interface stability today."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-950/50 border-t border-cyan-500/10 flex justify-center">
          <button onClick={onClose} className="px-10 py-4 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-xl shadow-cyan-900/40 transform hover:scale-105 active:scale-95">
            Synchronize & Execute
          </button>
        </div>

      </div>
    </div>
  );
};

export default BkimProtocolView;
