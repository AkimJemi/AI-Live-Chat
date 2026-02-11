
import React from 'react';

const SkillsAndInterests: React.FC = () => {
  const skills = {
    professional: ['React & Next.js', 'TypeScript', 'Gemini API', 'UI/UX Design', 'Cloud Architecture', 'Performance Optimization'],
    personal: ['Strategic Thinking', 'Empathetic Mentorship', 'Complex Problem Solving', 'Adaptability', 'Clear Communication']
  };

  const interests = [
    {
      title: 'Generative AI',
      icon: '🤖',
      description: 'Pushing the boundaries of what models can do in real-time applications. It represents the intersection of logic and creativity.'
    },
    {
      title: 'Digital Minimalism',
      icon: '🧘',
      description: 'Focused on building tools that provide value without stealing attention. Intentionality in tech is a core philosophy.'
    },
    {
      title: 'Music Composition',
      icon: '🎸',
      description: 'Playing guitar and experimenting with soundscapes. It provides a necessary rhythmic balance to the structured world of code.'
    },
    {
      title: 'Mountain Biking',
      icon: '🚵',
      description: 'Finding focus on high-speed trails. It teaches resilience and the importance of looking ahead to navigate obstacles.'
    }
  ];

  return (
    <section className="w-full max-w-4xl mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Skills Section */}
      <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Skills
        </h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Professional</h4>
            <div className="flex flex-wrap gap-2">
              {skills.professional.map(skill => (
                <span key={skill} className="px-3 py-1 bg-blue-600/20 border border-blue-500/30 text-blue-200 text-xs rounded-full font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Personal</h4>
            <div className="flex flex-wrap gap-2">
              {skills.personal.map(skill => (
                <span key={skill} className="px-3 py-1 bg-indigo-600/20 border border-indigo-500/30 text-indigo-200 text-xs rounded-full font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interests Section */}
      <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Interests
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {interests.map(interest => (
            <div key={interest.title} className="group p-3 rounded-xl bg-slate-900/40 border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-300">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{interest.icon}</span>
                <span className="text-sm font-semibold text-slate-200">{interest.title}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors">
                {interest.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillsAndInterests;
