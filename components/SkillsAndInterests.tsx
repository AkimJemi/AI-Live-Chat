import React from 'react';
import { Language } from '../types';

interface SkillsAndInterestsProps {
  lang: Language;
}

const LOCAL_CONTENT: Record<Language, any> = {
  [Language.ENGLISH]: {
    skills: "Skills",
    interests: "Interests",
    pro: "Professional",
    personal: "Personal",
    items: {
      pro: ['React & Next.js', 'TypeScript', 'Gemini API', 'UI/UX Design', 'Cloud Architecture'],
      personal: ['Strategic Thinking', 'Mentorship', 'Problem Solving', 'Adaptability'],
      interests: [
        { title: 'Generative AI', icon: '🤖', desc: 'Pushing boundaries of multimodal real-time applications.' },
        { title: 'Digital Minimalism', icon: '🧘', desc: 'Building tools that respect user attention.' },
        { title: 'Music Composition', icon: '🎸', desc: 'Experimental soundscapes and guitar rhythm.' },
        { title: 'Mountain Biking', icon: '🚵', desc: 'Focus and resilience on high-speed trails.' }
      ]
    }
  },
  [Language.JAPANESE]: {
    skills: "技術スキル",
    interests: "興味・関心",
    pro: "プロフェッショナル",
    personal: "パーソナル",
    items: {
      pro: ['React & Next.js', 'TypeScript', 'Gemini API', 'UI/UXデザイン', 'クラウド設計'],
      personal: ['戦略的思考', 'メンターシップ', '問題解決力', '適応能力'],
      interests: [
        { title: '生成AI', icon: '🤖', desc: 'マルチモーダルなリアルタイム応用の限界を追求。' },
        { title: 'デジタルミニマリズム', icon: '🧘', desc: 'ユーザーの集中を尊重するツール設計。' },
        { title: '音楽制作', icon: '🎸', desc: '実験的な音響空間とギターのリズム探求。' },
        { title: 'MTB', icon: '🚵', desc: '高速トレイルでの集中力とレジリエンス。' }
      ]
    }
  },
  [Language.CHINESE]: {
    skills: "专业技能",
    interests: "兴趣爱好",
    pro: "专业",
    personal: "个人",
    items: {
      pro: ['React & Next.js', 'TypeScript', 'Gemini API', 'UI/UX 设计', '云架构'],
      personal: ['战略思维', '导师经验', '问题解决', '适应能力'],
      interests: [
        { title: '生成式 AI', icon: '🤖', desc: '探索多模态实时应用的极限。' },
        { title: '数字极简主义', icon: '🧘', desc: '构建尊重用户注意力的工具。' },
        { title: '音乐创作', icon: '🎸', desc: '实验性音景和吉他节奏。' },
        { title: '山地自行车', icon: '🚵', desc: '高速赛道上的专注力和韧性。' }
      ]
    }
  },
  [Language.KOREAN]: {
    skills: "보유 기술",
    interests: "관심 분야",
    pro: "전문성",
    personal: "개인 역량",
    items: {
      pro: ['React & Next.js', 'TypeScript', 'Gemini API', 'UI/UX 디자인', '클라우드 아키텍처'],
      personal: ['전략적 사고', '멘토링', '문제 해결', '적응력'],
      interests: [
        { title: '생성형 AI', icon: '🤖', desc: '멀티모달 실시간 응용 분야의 한계 도전.' },
        { title: '디지털 미니멀리즘', icon: '🧘', desc: '사용자의 집중을 존중하는 툴 설계.' },
        { title: '음악 작곡', icon: '🎸', desc: '실험적 사운드와 기타 리듬 연구.' },
        { title: '산악 자전거', icon: '🚵', desc: '고속 트레일에서의 집중력과 회복탄력성.' }
      ]
    }
  }
};

const SkillsAndInterests: React.FC<SkillsAndInterestsProps> = ({ lang }) => {
  const t = LOCAL_CONTENT[lang] || LOCAL_CONTENT[Language.ENGLISH];

  return (
    <section className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-10 backdrop-blur-sm shadow-xl">
        <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3 italic uppercase">
          <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
          {t.skills}
        </h3>
        <div className="space-y-8">
          <div>
            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">{t.pro}</h4>
            <div className="flex flex-wrap gap-2.5">
              {t.items.pro.map((skill: string) => (
                <span key={skill} className="px-4 py-2 bg-blue-600/10 border border-blue-500/20 text-blue-200 text-xs rounded-2xl font-bold">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">{t.personal}</h4>
            <div className="flex flex-wrap gap-2.5">
              {t.items.personal.map((skill: string) => (
                <span key={skill} className="px-4 py-2 bg-indigo-600/10 border border-indigo-500/20 text-indigo-200 text-xs rounded-2xl font-bold">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-10 backdrop-blur-sm shadow-xl">
        <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3 italic uppercase">
          <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
          {t.interests}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {t.items.interests.map((interest: any) => (
            <div key={interest.title} className="group p-5 rounded-3xl bg-slate-950/40 border border-slate-800 hover:border-indigo-500/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{interest.icon}</span>
                <span className="text-sm font-black text-slate-100 uppercase tracking-tight">{interest.title}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors">
                {interest.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillsAndInterests;