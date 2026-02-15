
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type } from '@google/genai';
import { TranscriptionEntry, VoiceName, SessionStatus, Language, PracticeMode, BusinessSituation, BusinessCategory, DAILY_TOPICS, CERTIFICATION_TOPICS, SavedSession, LinguisticEvaluation, BkimSchedule, StudyCondition, LearnedTerm } from './types';
import { createBlob, decode, decodeAudioData } from './services/audioService';
import ControlPanel from './components/ControlPanel';
import TranscriptionView from './components/TranscriptionView';
import AudioVisualizer from './components/AudioVisualizer';
import SuggestionPanel from './components/SuggestionPanel';
import HistoryPanel from './components/HistoryPanel';
import DiagnosticView from './components/DiagnosticView';
import VisionPreview from './components/VisionPreview';
import MissionPanel from './components/MissionPanel';
import SkillsAndInterests from './components/SkillsAndInterests';
import ProjectShowcase from './components/ProjectShowcase';
import WorkExperience from './components/WorkExperience';
import Education from './components/Education';
import Testimonials from './components/Testimonials';
import ContactSection from './components/ContactSection';
import BkimProtocolView from './components/BkimProtocolView';
import SummaryModal from './components/SummaryModal';

const MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-12-2025';
const EVALUATION_MODEL_NAME = 'gemini-3-flash-preview';

const LOCALIZED_STRINGS: Record<Language, any> = {
  [Language.ENGLISH]: {
    appTitle: "Polyglot Labs",
    appSub: "Multimodal Neural Interface",
    visionLink: "Vision Link",
    uplinkReady: "Uplink Ready",
    uplinkActive: "Synchronized",
    streamTitle: "Linguistic Data Stream",
    analyzeTitle: "Diagnostic AI Protocol",
    analyzeDesc: "Analyzes grammar, vocabulary, and fluency.",
    archiveTitle: "Session Commit",
    archiveDesc: "Saves current logs.",
    analyzeBtn: "Analyze Flow",
    archiveBtn: "Archive State",
    finishBtn: "Finish Study",
    oscilloscope: "Neural Oscilloscope",
    aboutMe: "Engineer Profile",
    portfolio: "Portfolio",
    camError: "Camera access denied.",
    camNotFound: "No camera found."
  },
  [Language.JAPANESE]: {
    appTitle: "Polyglot Labs",
    appSub: "マルチモーダル・ニューラル・インターフェース",
    visionLink: "ビジョン・リンク",
    uplinkReady: "待機中",
    uplinkActive: "同期済み",
    streamTitle: "言語データストリーム",
    analyzeTitle: "AI診断プロトコル",
    analyzeDesc: "文法、語彙、流暢さを分析。",
    archiveTitle: "セッション・コミット",
    archiveDesc: "ログを保存。",
    analyzeBtn: "フロー解析",
    archiveBtn: "状態保存",
    finishBtn: "勉強終了",
    oscilloscope: "ニューラル・オシロスコープ",
    aboutMe: "エンジニア・プロフィール",
    portfolio: "ポートフォリオ",
    camError: "カメラの使用が拒否されました。",
    camNotFound: "カメラが見つかりません。"
  },
  [Language.CHINESE]: {
    appTitle: "博学语言实验室",
    appSub: "多模态神经接口",
    visionLink: "视觉连接",
    uplinkReady: "链路就绪",
    uplinkActive: "已同步",
    streamTitle: "语言数据流",
    analyzeTitle: "AI 诊断协议",
    analyzeDesc: "分析语法、词汇和流畅度。",
    archiveTitle: "会话归档",
    archiveDesc: "保存日志。",
    analyzeBtn: "分析流程",
    archiveBtn: "存档状态",
    finishBtn: "完成学习",
    oscilloscope: "神经示波器",
    aboutMe: "工程师简介",
    portfolio: "作品集",
    camError: "相机访问被拒绝。",
    camNotFound: "未找到相机。"
  },
  [Language.KOREAN]: {
    appTitle: "폴리그랏 랩스",
    appSub: "멀티모달 뉴럴 인터페이스",
    visionLink: "비전 링크",
    uplinkReady: "대기 중",
    uplinkActive: "동기화됨",
    streamTitle: "언어 데이터 스트リーム",
    analyzeTitle: "AI 진단프로토콜",
    analyzeDesc: "문법, 어휘, 유창성 분석.",
    archiveTitle: "세션 커밋",
    archiveDesc: "로그 저장.",
    analyzeBtn: "흐름 분석",
    archiveBtn: "상태 저장",
    finishBtn: "학습 종료",
    oscilloscope: "뉴럴 오실로스코프",
    aboutMe: "엔지니어 프로필",
    portfolio: "포트폴리오",
    camError: "카메라 접근 거부됨.",
    camNotFound: "카메라 없음."
  }
};

const App: React.FC = () => {
  const [status, setStatus] = useState<SessionStatus>({ isConnected: false, isConnecting: false, error: null });
  const [voice, setVoice] = useState<VoiceName>(VoiceName.ZEPHYR);
  const [language, setLanguage] = useState<Language>(Language.JAPANESE);
  const [mode, setMode] = useState<PracticeMode>(PracticeMode.DAILY);
  const [category, setCategory] = useState<string>(BusinessCategory.DEVELOPMENT);
  const [availableCategories, setAvailableCategories] = useState<string[]>(Object.values(BusinessCategory));
  const [dailyTopic, setDailyTopic] = useState<string>(DAILY_TOPICS[0]);
  const [availableDailyTopics, setAvailableDailyTopics] = useState<string[]>(DAILY_TOPICS);
  const [certificationTopic, setCertificationTopic] = useState<string>(CERTIFICATION_TOPICS[0]);
  const [availableCertTopics, setAvailableCertTopics] = useState<string[]>(CERTIFICATION_TOPICS);
  
  const [condition, setCondition] = useState<StudyCondition>(StudyCondition.STANDARD);

  const [isChallengeMode, setIsChallengeMode] = useState(false);
  const [isVisionEnabled, setIsVisionEnabled] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  
  const [transcriptions, setTranscriptions] = useState<TranscriptionEntry[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  // Added learnedTerms state to fix missing prop in SuggestionPanel
  const [learnedTerms, setLearnedTerms] = useState<LearnedTerm[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [currentEvaluation, setCurrentEvaluation] = useState<LinguisticEvaluation | null>(null);
  const [currentBkimSchedule, setCurrentBkimSchedule] = useState<BkimSchedule | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [studySummary, setStudySummary] = useState<string | null>(null);

  const audioContextRef = useRef<{ input: AudioContext; output: AudioContext; } | null>(null);
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const isConnectedRef = useRef<boolean>(false);
  const visionIntervalRef = useRef<number | null>(null);
  
  const languageRef = useRef(language);
  useEffect(() => { languageRef.current = language; }, [language]);

  // Added modeRef to track current state in async callbacks
  const modeRef = useRef(mode);
  useEffect(() => { modeRef.current = mode; }, [mode]);

  const currentInputTranscription = useRef('');
  const currentOutputTranscription = useRef('');

  useEffect(() => {
    const stored = localStorage.getItem('polyglot_labs_history');
    if (stored) {
      try { setSavedSessions(JSON.parse(stored)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('polyglot_labs_history', JSON.stringify(savedSessions));
  }, [savedSessions]);

  const t = LOCALIZED_STRINGS[language] || LOCALIZED_STRINGS[Language.ENGLISH];

  useEffect(() => {
    if (isVisionEnabled) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          setCameraStream(stream);
          setStatus(prev => ({ ...prev, error: null }));
        })
        .catch(err => {
          console.error("Camera error:", err);
          setIsVisionEnabled(false);
          let errorMsg = t.camError;
          if (err.name === 'NotFoundError') errorMsg = t.camNotFound;
          setStatus(prev => ({ ...prev, error: errorMsg }));
          setTimeout(() => setStatus(prev => ({ ...prev, error: null })), 5000);
        });
    } else {
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
        setCameraStream(null);
      }
    }
  }, [isVisionEnabled, t.camError, t.camNotFound]);

  const cleanup = useCallback(() => {
    isConnectedRef.current = false;
    sourcesRef.current.forEach(s => { try { s.stop(); } catch(e){} });
    sourcesRef.current.clear();
    if (visionIntervalRef.current) clearInterval(visionIntervalRef.current);
    if (sessionRef.current) { try { sessionRef.current.close(); } catch(e){} }
    if (streamRef.current) { streamRef.current.getTracks().forEach(track => track.stop()); }
    setStatus({ isConnected: false, isConnecting: false, error: null });
  }, []);

  const handleFinishStudy = async () => {
    if (transcriptions.length === 0) return;
    setIsSummarizing(true);
    cleanup();

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const historyText = transcriptions.map(e => `[${e.role}] ${e.text}`).join('\n');
      const prompt = `Based on the following study session for the "${certificationTopic}" certification (${condition} mode), please generate a structured study report in ${languageRef.current}.
      Include:
      1. Overall Summary of the session.
      2. Key Concepts & Technical Terms learned.
      3. Areas requiring further review.
      4. Actionable takeaways for the next session.
      
      Transcript:
      ${historyText}`;

      const response = await ai.models.generateContent({
        model: EVALUATION_MODEL_NAME,
        contents: prompt
      });

      setStudySummary(response.text || "Summary generation failed.");
    } catch (e) {
      console.error(e);
      setStatus(prev => ({ ...prev, error: "Summary generation failed." }));
    } finally {
      setIsSummarizing(false);
    }
  };

  const exportSummaryAsFile = () => {
    if (!studySummary) return;
    const blob = new Blob([studySummary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `Study_Report_${certificationTopic.replace(/\s+/g, '_')}_${dateStr}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const fetchSuggestions = async (history: TranscriptionEntry[]) => {
    if (history.length === 0) return;
    setIsSuggestionsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Logic for providing context-aware suggestions or concept extractions
      const isStudyMode = modeRef.current === PracticeMode.CERTIFICATION;
      const prompt = isStudyMode 
        ? `Based on this study session about ${certificationTopic}, extract 3-4 key technical terms or concepts discussed and provide a concise definition for each in ${languageRef.current}. Return as a JSON array of objects: [{"term": "...", "definition": "..."}]`
        : `Based on the conversation context in ${languageRef.current}, provide 3 natural response suggestions for the user in ${languageRef.current}. Return as JSON array of strings: ["...", "...", "..."]`;

      const response = await ai.models.generateContent({
        model: EVALUATION_MODEL_NAME,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const result = JSON.parse(response.text || "[]");
      if (isStudyMode) {
        setLearnedTerms(result);
      } else {
        setSuggestions(result);
      }
    } catch (e) { console.error("Suggestion fetch error:", e); } finally { setIsSuggestionsLoading(false); }
  };

  const startSession = async () => {
    if (status.isConnecting || status.isConnected) return;
    setStatus({ isConnecting: true, isConnected: false, error: null });
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      if (!audioContextRef.current) {
        audioContextRef.current = { 
          input: new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 }),
          output: new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 })
        };
        inputAnalyserRef.current = audioContextRef.current.input.createAnalyser();
        outputAnalyserRef.current = audioContextRef.current.output.createAnalyser();
      }
      
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = audioStream;

      const sessionPromise = ai.live.connect({
        model: MODEL_NAME,
        callbacks: {
          onopen: () => {
            isConnectedRef.current = true;
            setStatus({ isConnected: true, isConnecting: false, error: null });
            const source = audioContextRef.current!.input.createMediaStreamSource(audioStream);
            const scriptProcessor = audioContextRef.current!.input.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              if (!isConnectedRef.current) return;
              const pcmBlob = createBlob(e.inputBuffer.getChannelData(0));
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(inputAnalyserRef.current!);
            inputAnalyserRef.current!.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.input.destination);
          },
          onmessage: async (msg) => {
            if (msg.serverContent?.outputTranscription) currentOutputTranscription.current += msg.serverContent.outputTranscription.text;
            if (msg.serverContent?.inputTranscription) currentInputTranscription.current += msg.serverContent.inputTranscription.text;
            
            if (msg.serverContent?.turnComplete) {
              const u = currentInputTranscription.current.trim();
              const m = currentOutputTranscription.current.trim();
              if (u || m) {
                const newEntries = [
                  ...(u ? [{ role: 'user' as const, text: u, timestamp: Date.now() }] : []),
                  ...(m ? [{ role: 'model' as const, text: m, timestamp: Date.now()+1 }] : [])
                ];
                setTranscriptions(prev => {
                  const updated = [...prev, ...newEntries];
                  if (m) fetchSuggestions(updated);
                  return updated;
                });
              }
              currentInputTranscription.current = '';
              currentOutputTranscription.current = '';
            }

            const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              const { output } = audioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, output.currentTime);
              const buffer = await decodeAudioData(decode(base64Audio), output, 24000, 1);
              const source = output.createBufferSource();
              source.buffer = buffer;
              source.connect(outputAnalyserRef.current!);
              outputAnalyserRef.current!.connect(output.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }
          },
          onerror: () => cleanup(),
          onclose: () => cleanup(),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
          systemInstruction: mode === PracticeMode.CERTIFICATION 
            ? `You are an expert instructor for the ${certificationTopic} certification. Target condition: ${condition}. Help the user study and explain concepts clearly in ${languageRef.current}.`
            : `You are a coach. Condition: ${condition}. Scenario: ${mode}. Focus: ${category}. Language: ${languageRef.current}.`,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
      });
      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      setStatus({ isConnecting: false, isConnected: false, error: err.message });
      cleanup();
    }
  };

  const runDiagnostic = async (history: TranscriptionEntry[]) => {
    if (history.length < 2) return;
    setIsEvaluating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analyze this ${languageRef.current} transcript. Return JSON: { grammarScore: 0-100, vocabularyScore: 0-100, naturalnessScore: 0-100, overallGrade: "S"|"A"|"B"|"C"|"D", strengths: string[], weaknesses: string[], suggestedImprovement: string }. Transcript: ${history.map(h => `[${h.role}] ${h.text}`).join('\n')}`;
      const response = await ai.models.generateContent({
        model: EVALUATION_MODEL_NAME,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      setCurrentEvaluation(JSON.parse(response.text || "{}"));
    } catch (e) { console.error(e); } finally { setIsEvaluating(false); }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center py-12 px-6 text-slate-200 overflow-x-hidden text-left">
      {status.error && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md bg-red-500/10 border border-red-500/50 backdrop-blur-xl p-4 rounded-2xl flex items-center gap-4 shadow-2xl animate-in slide-in-from-top-4">
          <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 text-white font-bold">!</div>
          <div className="flex-grow">
            <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest leading-none mb-1">System Alert</h4>
            <p className="text-xs text-red-100 font-medium leading-tight">{status.error}</p>
          </div>
          <button onClick={() => setStatus(prev => ({ ...prev, error: null }))} className="text-red-400/50 hover:text-red-400 transition-colors">✕</button>
        </div>
      )}

      <header className="w-full max-w-7xl flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
        <div className="flex items-center gap-6">
          <div className="p-5 bg-blue-600 rounded-[1.5rem] shadow-[0_0_40px_rgba(37,99,235,0.4)]">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white uppercase italic leading-none">{t.appTitle}</h1>
            <span className="text-[11px] text-blue-400 font-black uppercase tracking-[0.4em] mt-1">{t.appSub}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <button 
            onClick={() => setIsVisionEnabled(!isVisionEnabled)}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all ${isVisionEnabled ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'}`}
          >
            <span className="text-xl">{isVisionEnabled ? '👁️' : '🕶️'}</span>
            <span className="text-[11px] font-black uppercase tracking-widest">{t.visionLink}</span>
          </button>
          <div className="px-6 py-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center gap-4">
             <div className={`w-3 h-3 rounded-full ${status.isConnected ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.8)]' : 'bg-slate-700'}`}></div>
             <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
               {status.isConnected ? t.uplinkActive : t.uplinkReady}
             </span>
          </div>
        </div>
      </header>

      <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-10">
        <aside className="lg:col-span-3 space-y-10">
          <ControlPanel
            isConnecting={status.isConnecting} isConnected={status.isConnected}
            onToggle={() => status.isConnected ? cleanup() : startSession()}
            onFinishStudy={handleFinishStudy} isSummarizing={isSummarizing}
            selectedVoice={voice} onVoiceChange={setVoice}
            selectedLanguage={language} onLanguageChange={setLanguage}
            selectedMode={mode} onModeChange={setMode}
            selectedSituation={BusinessSituation.MEETING} onSituationChange={() => {}}
            selectedCategory={category} onCategoryChange={setCategory}
            availableCategories={availableCategories} onAddCategory={() => {}}
            selectedDailyTopic={dailyTopic} onDailyTopicChange={setDailyTopic}
            availableDailyTopics={availableDailyTopics} onAddDailyTopic={() => {}}
            selectedCertTopic={certificationTopic} onCertTopicChange={setCertificationTopic}
            availableCertTopics={availableCertTopics} onAddCertTopic={() => {}}
            selectedCondition={condition} onConditionChange={setCondition}
            isChallengeMode={isChallengeMode} onChallengeToggle={setIsChallengeMode}
          />
          <VisionPreview stream={cameraStream} isActive={isVisionEnabled} />
        </aside>

        <section className="lg:col-span-9 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 min-h-[500px]">
            <div className="lg:col-span-2 flex flex-col bg-slate-900/20 rounded-[2.5rem] border border-slate-800 p-8 shadow-2xl backdrop-blur-sm overflow-hidden relative">
              <div className="flex items-center justify-between mb-8 z-20">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.streamTitle}</h3>
                </div>
                <div className="flex gap-2">
                   {mode === PracticeMode.CERTIFICATION && (
                     <button onClick={handleFinishStudy} disabled={transcriptions.length === 0 || isSummarizing} className="study-finish-btn">
                       {isSummarizing ? <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" /> : t.finishBtn}
                     </button>
                   )}
                   <button onClick={() => runDiagnostic(transcriptions)} disabled={transcriptions.length < 2 || isEvaluating} className="action-btn-emerald">
                     {isEvaluating ? <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" /> : t.analyzeBtn}
                   </button>
                </div>
              </div>
              <TranscriptionView entries={transcriptions} lang={language} mode={mode} />
            </div>
            {/* Fixed missing props: added learnedTerms and mode */}
            <SuggestionPanel 
              suggestions={suggestions} 
              learnedTerms={learnedTerms}
              isLoading={isSuggestionsLoading} 
              error={null} 
              onSelect={() => {}} 
              isPlaying={null} 
              lang={language} 
              mode={mode}
            />
          </div>
          
          <div className="p-8 bg-slate-950/60 rounded-[2.5rem] border border-slate-800 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60 ml-1">Input Stream</span>
              <AudioVisualizer analyser={inputAnalyserRef.current} isActive={status.isConnected} color="#10b981" />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-500/60 ml-1">Output Response</span>
              <AudioVisualizer analyser={outputAnalyserRef.current} isActive={status.isConnected} color="#3b82f6" />
            </div>
          </div>
        </section>
      </main>

      <div className="w-full max-w-7xl mt-24 border-t border-slate-800 pt-20">
        <div className="space-y-20">
          <SkillsAndInterests lang={language} />
          <ProjectShowcase lang={language} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <WorkExperience lang={language} />
            <Education lang={language} />
          </div>
          <Testimonials lang={language} />
          <ContactSection lang={language} />
        </div>
      </div>

      {currentEvaluation && <DiagnosticView evaluation={currentEvaluation} onClose={() => setCurrentEvaluation(null)} />}
      {studySummary && (
        <SummaryModal 
          summary={studySummary} 
          onClose={() => setStudySummary(null)} 
          onDownload={exportSummaryAsFile} 
          lang={language} 
        />
      )}

      <style>{`
        .action-btn-emerald {
          @apply px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[9px] font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-20 flex items-center justify-center min-w-[100px];
        }
        .study-finish-btn {
          @apply px-4 py-2 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-[9px] font-black uppercase tracking-widest text-emerald-100 hover:bg-emerald-600 transition-all disabled:opacity-20 flex items-center justify-center min-w-[100px] shadow-lg shadow-emerald-900/20;
        }
      `}</style>
    </div>
  );
};

export default App;
