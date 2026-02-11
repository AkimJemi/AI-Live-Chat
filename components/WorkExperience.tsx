
import React from 'react';

const WorkExperience: React.FC = () => {
  const experiences = [
    {
      role: "Senior Frontend Engineer",
      company: "TechFlow Systems",
      period: "2021 - Present",
      description: "Leading the migration to a micro-frontend architecture using module federation. Improved core web vitals by 40% across the platform. Mentoring a team of 5 developers and establishing engineering best practices.",
      tech: ["React", "TypeScript", "GraphQL", "AWS"]
    },
    {
      role: "Software Engineer",
      company: "DataSphere Analytics",
      period: "2018 - 2021",
      description: "Developed real-time data visualization dashboards for enterprise clients processing TBs of data. Implemented WebSocket streaming for live updates and reduced data latency by 60%.",
      tech: ["Vue.js", "D3.js", "Python", "Docker"]
    },
    {
      role: "Junior Web Developer",
      company: "Creative Pulse",
      period: "2016 - 2018",
      description: "Collaborated with designers to implement pixel-perfect responsive landing pages for high-profile clients. Optimized asset delivery and set up automated CI/CD pipelines.",
      tech: ["JavaScript", "Sass", "Webpack", "Firebase"]
    }
  ];

  return (
    <section className="w-full max-w-4xl mt-12 px-2">
      <div className="flex flex-col items-center mb-10">
        <span className="text-xs font-bold text-green-500 uppercase tracking-[0.3em] mb-2">Career</span>
        <h2 className="text-3xl font-bold text-white">Work Experience</h2>
      </div>

      <div className="relative border-l border-slate-700/50 ml-3 md:ml-6 space-y-12">
        {experiences.map((exp, idx) => (
          <div key={idx} className="relative pl-8 md:pl-12 group">
            {/* Timeline Dot */}
            <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-slate-600 group-hover:bg-green-500 transition-colors duration-300 ring-4 ring-slate-900" />
            
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2">
              <h3 className="text-xl font-bold text-slate-100 group-hover:text-green-400 transition-colors">
                {exp.role}
              </h3>
              <span className="text-sm font-mono text-slate-500">{exp.period}</span>
            </div>
            
            <div className="text-md text-slate-300 font-medium mb-3">{exp.company}</div>
            
            <p className="text-sm text-slate-400 leading-relaxed max-w-2xl mb-4">
              {exp.description}
            </p>
            
            <div className="flex flex-wrap gap-2">
              {exp.tech.map(t => (
                <span key={t} className="px-2 py-1 rounded-md bg-slate-800/50 border border-slate-700 text-[10px] text-slate-400 font-mono">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WorkExperience;
