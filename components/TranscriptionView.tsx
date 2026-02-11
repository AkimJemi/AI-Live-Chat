
import React, { useEffect, useRef } from 'react';
import { TranscriptionEntry } from '../types';

interface TranscriptionViewProps {
  entries: TranscriptionEntry[];
}

const TranscriptionView: React.FC<TranscriptionViewProps> = ({ entries }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 italic opacity-50 p-8 text-center border-2 border-dashed border-slate-700 rounded-2xl">
        No conversation history yet. Start talking to see transcriptions.
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex flex-col gap-4 overflow-y-auto max-h-[400px] p-6 bg-slate-900/50 rounded-2xl border border-slate-800 scroll-smooth"
    >
      {entries.map((entry, idx) => (
        <div
          key={`${entry.timestamp}-${idx}`}
          className={`flex flex-col max-w-[85%] ${entry.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
        >
          <span className="text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-wider">
            {entry.role === 'user' ? 'You' : 'Gemini'}
          </span>
          <div
            className={`px-4 py-2 rounded-2xl text-sm leading-relaxed ${
              entry.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-none'
                : 'bg-slate-700 text-slate-100 rounded-tl-none border border-slate-600'
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
