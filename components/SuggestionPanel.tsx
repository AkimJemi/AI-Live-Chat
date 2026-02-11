
import React from 'react';

interface SuggestionPanelProps {
  suggestions: string[];
  isLoading: boolean;
  onSelect: (text: string) => void;
}

const SuggestionPanel: React.FC<SuggestionPanelProps> = ({ suggestions, isLoading, onSelect }) => {
  return (
    <div className="flex flex-col h-full bg-slate-900/50 rounded-2xl border border-slate-700 p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-yellow-500/20 rounded-lg">
          <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Suggested Responses</h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {isLoading && suggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-600 gap-2">
            <div className="w-5 h-5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs">Thinking of ideas...</span>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-xs text-slate-600 italic text-center mt-10">
            Start the conversation to see suggestions here.
          </div>
        ) : (
          suggestions.map((text, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(text)}
              className="w-full text-left p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 hover:border-blue-500/50 transition-all group group-hover:shadow-lg group-hover:shadow-blue-900/20"
            >
              <p className="text-sm text-slate-300 group-hover:text-white transition-colors">
                {text}
              </p>
            </button>
          ))
        )}
      </div>
      
      <div className="mt-4 pt-3 border-t border-slate-700/50">
        <p className="text-[10px] text-slate-500 text-center">
          Click a suggestion to copy (or just say it!)
        </p>
      </div>
    </div>
  );
};

export default SuggestionPanel;
