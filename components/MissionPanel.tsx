
import React from 'react';
import { MissionObjective, Language } from '../types';

interface MissionPanelProps {
  missions: MissionObjective[];
  lang: Language;
}

const LOCAL_CONTENT: Record<Language, any> = {
  [Language.ENGLISH]: {
    title: "Neural Missions",
    secured: "All Objectives Secured"
  },
  [Language.JAPANESE]: {
    title: "ニューラル・ミッション",
    secured: "全ミッション完了"
  },
  [Language.CHINESE]: {
    title: "神经网络任务",
    secured: "已完成所有目标"
  },
  [Language.KOREAN]: {
    title: "뉴럴 미션",
    secured: "모든 목표 달성됨"
  }
};

const MissionPanel: React.FC<MissionPanelProps> = ({ missions, lang }) => {
  const t = LOCAL_CONTENT[lang] || LOCAL_CONTENT[Language.ENGLISH];
  if (missions.length === 0) return null;

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6 backdrop-blur-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-amber-500/20 rounded-xl">
          <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.title}</h3>
      </div>

      <div className="space-y-3">
        {missions.map((mission) => (
          <div 
            key={mission.id}
            className={`flex items-start gap-3 p-4 rounded-2xl border transition-all duration-500 ${
              mission.isCompleted 
                ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                : 'bg-slate-800/50 border-slate-700/50 opacity-60'
            }`}
          >
            <div className={`mt-1 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
              mission.isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'
            }`}>
              {mission.isCompleted && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <p className={`text-xs font-bold leading-relaxed ${mission.isCompleted ? 'text-emerald-100' : 'text-slate-400'}`}>
              {mission.description}
            </p>
          </div>
        ))}
      </div>
      
      {!missions.some(m => !m.isCompleted) && missions.length > 0 && (
        <div className="mt-6 p-3 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-xl text-center animate-bounce shadow-lg shadow-emerald-900/40">
          {t.secured}
        </div>
      )}
    </div>
  );
};

export default MissionPanel;
