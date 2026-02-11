
import React from 'react';

interface Project {
  title: string;
  tag: string;
  description: string;
  tech: string[];
}

const ProjectShowcase: React.FC = () => {
  const projects: Project[] = [
    {
      title: "Vision-AI Assistant",
      tag: "Multimodal",
      description: "A real-time edge processing application that translates spatial environment data into spoken descriptive audio for accessibility.",
      tech: ["Gemini 2.5", "WebRTC", "TensorFlow.js"]
    },
    {
      title: "Nexus Code Engine",
      tag: "Agentic AI",
      description: "An autonomous development agent that performs multi-file refactoring and automated unit test generation based on natural language.",
      tech: ["Node.js", "LangChain", "OpenAI"]
    },
    {
      title: "Rhythm Flow",
      tag: "Creative Tech",
      description: "An interactive music synthesizer that adapts its tempo and key based on the user's vocal tone and speech cadence.",
      tech: ["Web Audio API", "React", "DSP"]
    }
  ];

  return (
    <section className="w-full max-w-4xl mt-12 px-1">
      <div className="flex flex-col items-center mb-8">
        <span className="text-xs font-bold text-blue-500 uppercase tracking-[0.3em] mb-2">Portfolio</span>
        <h2 className="text-3xl font-bold text-white">Featured Projects</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects.map((project, idx) => (
          <div key={idx} className="flex flex-col bg-slate-800/20 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/40 hover:border-blue-500/30 transition-all duration-500 group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                {project.tag}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
              {project.title}
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6 flex-grow">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-700/50">
              {project.tech.map(t => (
                <span key={t} className="text-[9px] font-mono text-slate-500">
                  #{t.replace(/\s+/g, '')}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProjectShowcase;
