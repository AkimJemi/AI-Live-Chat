
import React from 'react';
import { Language } from '../types';

// Added prop definition to fix TS error in App.tsx
interface TestimonialsProps {
  lang: Language;
}

const LOCAL_CONTENT: Record<Language, any> = {
  [Language.ENGLISH]: {
    references: "References",
    testimonialsTitle: "Testimonials"
  },
  [Language.JAPANESE]: {
    references: "推薦",
    testimonialsTitle: "推薦状"
  },
  [Language.CHINESE]: {
    references: "推荐",
    testimonialsTitle: "评价"
  },
  [Language.KOREAN]: {
    references: "추천",
    testimonialsTitle: "추천평"
  }
};

const Testimonials: React.FC<TestimonialsProps> = ({ lang }) => {
  const t = LOCAL_CONTENT[lang] || LOCAL_CONTENT[Language.ENGLISH];

  const testimonials = [
    {
      quote: "One of those rare engineers who possesses both deep technical expertise and an intuitive sense for product design. A force multiplier for any team.",
      author: "Sarah Chen",
      role: "CTO, TechFlow Systems"
    },
    {
      quote: "I've never seen someone debug complex race conditions faster. They not only fixed the issue but re-architected the module to prevent it forever.",
      author: "Mike Ross",
      role: "Lead Architect, DataSphere"
    }
  ];

  return (
    <section className="w-full max-w-4xl mt-12 px-1">
      <div className="flex flex-col items-center mb-10">
        <span className="text-xs font-bold text-orange-500 uppercase tracking-[0.3em] mb-2">{t.references}</span>
        <h2 className="text-3xl font-bold text-white">{t.testimonialsTitle}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((item, idx) => (
          <div key={idx} className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 p-8 rounded-2xl relative">
            <svg className="absolute top-6 left-6 w-8 h-8 text-slate-700 opacity-50" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21L14.017 18C14.017 16.096 14.017 14.742 14.453 13.069C14.92 11.387 15.494 9.942 16.235 8.652C17.009 7.332 18.239 6.274 20.017 5.234L19.5 3C17.962 3.738 16.29 4.887 14.864 6.305C13.566 7.585 12.56 9.049 11.906 10.596C11.356 11.895 11.056 13.57 11.017 15.5L11.017 21L14.017 21ZM5 21L5 18C5 16.096 5 14.742 5.435 13.069C5.902 11.387 6.476 9.942 7.217 8.652C7.992 7.332 9.222 6.274 11 5.234L10.5 3C8.962 3.738 7.29 4.887 5.864 6.305C4.566 7.585 3.56 9.049 2.906 10.596C2.356 11.895 2.056 13.57 2.017 15.5L2.017 21L5 21Z" />
            </svg>
            <p className="text-slate-300 italic mb-6 relative z-10 pl-4 border-l-2 border-orange-500/30">
              "{item.quote}"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">
                {item.author.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-bold text-white">{item.author}</div>
                <div className="text-xs text-orange-400">{item.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
