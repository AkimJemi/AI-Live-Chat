
import React from 'react';
import { LinguisticEvaluation } from '../types';

interface DiagnosticViewProps {
  evaluation: LinguisticEvaluation;
  onClose: () => void;
}

const DiagnosticView: React.FC<DiagnosticViewProps> = ({ evaluation, onClose }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-blue-400';
    return 'text-amber-400';
  };

  const MetricRow = ({ label, score }: { label: string; score: number }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
        <span className="text-slate-500">{label}</span>
        <span className={getScoreColor(score)}>{score}%</span>
      </div>
      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${
            score >= 80 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
            score >= 60 ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 
            'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
          }`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/80 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 space-y-8">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Neural Diagnostic</h2>
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em]">Linguistic Health Report</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex flex-col items-center justify-center shadow-lg">
              <span className="text-[9px] font-black text-slate-500 uppercase leading-none mb-1">Grade</span>
              <span className={`text-2xl font-black leading-none ${
                evaluation.overallGrade === 'S' ? 'text-emerald-400' : 
                evaluation.overallGrade === 'A' ? 'text-blue-400' : 
                'text-slate-300'
              }`}>
                {evaluation.overallGrade}
              </span>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 gap-4 bg-slate-800/30 p-6 rounded-3xl border border-slate-800">
            <MetricRow label="Grammar Precision" score={evaluation.grammarScore} />
            <MetricRow label="Lexical Range" score={evaluation.vocabularyScore} />
            <MetricRow label="Naturalness Flow" score={evaluation.naturalnessScore} />
          </div>

          {/* Insights */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-[9px] font-black text-emerald-500 uppercase tracking-widest ml-1">Key Strengths</h4>
              <ul className="space-y-2">
                {evaluation.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-[9px] font-black text-amber-500 uppercase tracking-widest ml-1">Refinement Areas</h4>
              <ul className="space-y-2">
                {evaluation.weaknesses.map((w, i) => (
                  <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span> {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl">
            <h4 className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Strategic Advice</h4>
            <p className="text-xs text-blue-100 italic leading-relaxed">
              "{evaluation.suggestedImprovement}"
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-blue-900/40"
          >
            Acknowledge Findings
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticView;
