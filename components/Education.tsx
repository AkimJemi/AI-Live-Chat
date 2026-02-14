
import React from 'react';
import { Language } from '../types';

// Added prop definition to fix TS error in App.tsx
interface EducationProps {
  lang: Language;
}

const LOCAL_CONTENT: Record<Language, any> = {
  [Language.ENGLISH]: {
    academic: "Academic",
    eduTitle: "Education"
  },
  [Language.JAPANESE]: {
    academic: "学歴",
    eduTitle: "学歴"
  },
  [Language.CHINESE]: {
    academic: "教育背景",
    eduTitle: "教育经历"
  },
  [Language.KOREAN]: {
    academic: "학력",
    eduTitle: "학력 사항"
  }
};

const Education: React.FC<EducationProps> = ({ lang }) => {
  const t = LOCAL_CONTENT[lang] || LOCAL_CONTENT[Language.ENGLISH];

  return (
    <section className="w-full max-w-4xl mt-12 px-2">
      <div className="flex flex-col items-center mb-8">
        <span className="text-xs font-bold text-purple-500 uppercase tracking-[0.3em] mb-2">{t.academic}</span>
        <h2 className="text-3xl font-bold text-white">{t.eduTitle}</h2>
      </div>

      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-700 group-hover:bg-purple-600/20"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 relative z-10">
          <div>
            <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
              Bachelor of Science in Computer Science
            </h3>
            <div className="text-slate-400 font-medium mt-1">University of Technology</div>
          </div>
          <div className="mt-2 md:mt-0 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-mono">
            2012 - 2016
          </div>
        </div>

        <p className="text-sm text-slate-400 leading-relaxed mb-6 relative z-10 max-w-2xl">
          Graduated with Honors. Focused on Distributed Systems and Human-Computer Interaction (HCI). Capstone project involved building a decentralized voting system using early blockchain protocols.
        </p>

        <div className="flex flex-wrap gap-2 relative z-10">
          {['Algorithms', 'Data Structures', 'OS Architecture', 'AI Fundamentals'].map((course) => (
            <span key={course} className="text-[10px] text-slate-500 border border-slate-700 px-2 py-1 rounded-md">
              {course}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Education;
