
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type } from '@google/genai';
import { TranscriptionEntry, VoiceName, SessionStatus, Language, PracticeMode, BusinessSituation, BusinessCategory, DAILY_TOPICS, SavedSession, LinguisticEvaluation, MissionObjective } from './types';
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
    analyzeDesc: "Analyzes grammar, vocabulary, and fluency to generate a detailed neural score report.",
    archiveTitle: "Session Commit Vault",
    archiveDesc: "Saves current logs, missions, and diagnostics to the persistent history archive.",
    analyzeBtn: "Analyze Flow",
    archiveBtn: "Archive State",
    oscilloscope: "Neural Oscilloscope",
    aboutMe: "Engineer Profile",
    portfolio: "Portfolio"
  },
  [Language.JAPANESE]: {
    appTitle: "Polyglot Labs",
    appSub: "マルチモーダル・ニューラル・インターフェース",
    visionLink: "ビジョン・リンク",
    uplinkReady: "待機中",
    uplinkActive: "同期済み",
    streamTitle: "言語データストリーム",
    analyzeTitle: "AI診断プロトコル",
    analyzeDesc: "文法、語彙、流暢さをニューラル分析し、詳細なスコアレポートを生成します。",
    archiveTitle: "セッション・コミット",
    archiveDesc: "対話ログ、ミッション、診断データを履歴アーカイブに永続保存します。",
    analyzeBtn: "フロー解析",
    archiveBtn: "状態保存",
    oscilloscope: "ニューラル・オシロスコープ",
    aboutMe: "エンジニア・プロフィール",
    portfolio: "ポートフォリオ"
  },
  [Language.CHINESE]: {
    appTitle: "博学语言实验室",
    appSub: "多模态神经接口",
    visionLink: "视觉连接",
    uplinkReady: "链路就绪",
    uplinkActive: "已同步",
    streamTitle: "语言数据流",
    analyzeTitle: "AI 诊断协议",
    analyzeDesc: "分析语法、词汇和流畅度，生成详细的神经网络评分报告。",
    archiveTitle: "会话归档库",
    archiveDesc: "将当前日志、任务和診断数据保存到持久历史档案中。",
    analyzeBtn: "分析流程",
    archiveBtn: "存档状态",
    oscilloscope: "神经示波器",
    aboutMe: "工程师简介",
    portfolio: "作品集"
  },
  [Language.KOREAN]: {
    appTitle: "폴리그랏 랩스",
    appSub: "멀티모달 뉴럴 인터페이스",
    visionLink: "비전 링크",
    uplinkReady: "대기 중",
    uplinkActive: "동기화됨",
    streamTitle: "언어 데이터 ストリーム",
    analyzeTitle: "AI 진단プロトコル",
    analyzeDesc: "문법, 어휘, 유창성을 분석하여 상세한 신경망 점수 보고서를 생성합니다.",
    archiveTitle: "세션 커밋 보관소",
    archiveDesc: "현재 로그, 미션 및 진단 데이터를 영구 기록 아카이브에 저장합니다.",
    analyzeBtn: "흐름 분석",
    archiveBtn: "상태 저장",
    oscilloscope: "뉴럴 오실로스코프",
    aboutMe: "엔지니어 프로필",
    portfolio: "포트폴리오"
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
  const [isChallengeMode, setIsChallengeMode] = useState(false);
  const [isVisionEnabled, setIsVisionEnabled] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  
  const [transcriptions, setTranscriptions] = useState<TranscriptionEntry[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [currentEvaluation, setCurrentEvaluation] = useState<LinguisticEvaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  // Handle camera stream when vision is toggled
  useEffect(() => {
    if (isVisionEnabled) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(setCameraStream)
        .catch(err => {
          console.error("Camera error:", err);
          setIsVisionEnabled(false);
        });
    } else {
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
        setCameraStream(null);
      }
    }
    return () => {
      if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
    };
  }, [isVisionEnabled]);

  const stopAllAudio = useCallback(() => {
    sourcesRef.current.forEach((source) => { try { source.stop(); } catch (e) {} });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  }, []);

  const cleanup = useCallback(() => {
    isConnectedRef.current = false;
    stopAllAudio();
    if (visionIntervalRef.current) {
      clearInterval(visionIntervalRef.current);
      visionIntervalRef.current = null;
    }
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch (e) {}
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setStatus({ isConnected: false, isConnecting: false, error: null });
  }, [stopAllAudio]);

  const fetchSuggestions = async (history: TranscriptionEntry[]) => {
    if (history.length === 0) return;
    setIsSuggestionsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Based on the conversation context in ${languageRef.current}, provide 3 natural and useful response suggestions for the user.
      Return exactly a JSON array of 3 strings. Each string must be in ${languageRef.current}.
      Context:
      ${history.slice(-5).map(h => `${h.role === 'user' ? 'User' : 'Coach'}: ${h.text}`).join('\n')}`;

      const response = await ai.models.generateContent({
        model: EVALUATION_MODEL_NAME,
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });

      const result = JSON.parse(response.text || "[]");
      setSuggestions(result);
    } catch (e) {
      console.error("Suggestion generation failed:", e);
    } finally {
      setIsSuggestionsLoading(false);
    }
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
      await audioContextRef.current.input.resume();
      await audioContextRef.current.output.resume();
      
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = audioStream;

      const sessionPromise = ai.live.connect({
        model: MODEL_NAME,
        callbacks: {
          onopen: () => {
            isConnectedRef.current = true;
            setStatus({ isConnected: true, isConnecting: false, error: null });
            
            // Audio input
            const source = audioContextRef.current!.input.createMediaStreamSource(audioStream);
            const scriptProcessor = audioContextRef.current!.input.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              if (!isConnectedRef.current) return;
              const pcmBlob = createBlob(e.inputBuffer.getChannelData(0));
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob })).catch(() => {});
            };
            source.connect(inputAnalyserRef.current!);
            inputAnalyserRef.current!.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.input.destination);

            // Vision link streaming
            if (isVisionEnabled && cameraStream) {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              const video = document.createElement('video');
              video.srcObject = cameraStream;
              video.play();

              visionIntervalRef.current = window.setInterval(() => {
                if (!ctx || !video.videoWidth) return;
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0);
                canvas.toBlob(async (blob) => {
                  if (blob) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const base64 = (reader.result as string).split(',')[1];
                      sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64, mimeType: 'image/jpeg' } }));
                    };
                    reader.readAsDataURL(blob);
                  }
                }, 'image/jpeg', 0.5);
              }, 1000);
            }
          },
          onmessage: async (msg) => {
            if (msg.serverContent?.outputTranscription) currentOutputTranscription.current += msg.serverContent.outputTranscription.text;
            if (msg.serverContent?.inputTranscription) currentInputTranscription.current += msg.serverContent.inputTranscription.text;
            
            if (msg.serverContent?.turnComplete) {
              const u = currentInputTranscription.current.trim();
              const m = currentOutputTranscription.current.trim();
              if (u || m) {
                setTranscriptions(prev => {
                  const newEntries = [...prev];
                  if (u) newEntries.push({ role: 'user' as const, text: u, timestamp: Date.now() });
                  if (m) newEntries.push({ role: 'model' as const, text: m, timestamp: Date.now()+1 });
                  if (m) fetchSuggestions(newEntries).catch(console.error);
                  return newEntries;
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
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          systemInstruction: `You are a high-immersion language coach for ${languageRef.current}. Speak ONLY in ${languageRef.current}. Mode: ${isChallengeMode ? 'Diagnostic/Challenge' : 'Supportive Training'}. Scenario: ${mode === PracticeMode.DAILY ? dailyTopic : category}.`,
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
      const prompt = `Analyze this ${languageRef.current} transcript. 
      Return a JSON object: { grammarScore: 0-100, vocabularyScore: 0-100, naturalnessScore: 0-100, overallGrade: "S"|"A"|"B"|"C"|"D", strengths: string[], weaknesses: string[], suggestedImprovement: string }. 
      Descriptions in ${languageRef.current}. 
      Transcript: ${history.map(h => `[${h.role}] ${h.text}`).join('\n')}`;

      const response = await ai.models.generateContent({
        model: EVALUATION_MODEL_NAME,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const text = response.text || "{}";
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const result = JSON.parse(cleanJson);
      setCurrentEvaluation(result);
    } catch (e) {
      console.error(e);
      setStatus(prev => ({ ...prev, error: "Diagnostic failed. Please try again." }));
    } finally { setIsEvaluating(false); }
  };

  const saveCurrentSession = async () => {
    if (transcriptions.length === 0) return;
    setIsSaving(true);
    try {
      const newSession: SavedSession = {
        id: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
        language,
        mode,
        category,
        dailyTopic,
        transcriptions: [...transcriptions],
        preview: transcriptions[transcriptions.length - 1]?.text || "No preview",
        evaluation: currentEvaluation || undefined
      };
      setSavedSessions(prev => [newSession, ...prev].slice(0, 10));
      await new Promise(r => setTimeout(r, 600));
    } finally { setIsSaving(false); }
  };

  const loadSession = (session: SavedSession) => {
    setLanguage(session.language);
    setMode(session.mode);
    setCategory(session.category);
    setDailyTopic(session.dailyTopic);
    setTranscriptions(session.transcriptions);
    setCurrentEvaluation(session.evaluation || null);
    if (isConnectedRef.current) cleanup();
  };

  const handleAddCategory = () => {
    const name = prompt('Enter new domain name:');
    if (name && !availableCategories.includes(name)) {
      setAvailableCategories(prev => [...prev, name]);
      setCategory(name);
    }
  };

  const handleAddDailyTopic = () => {
    const name = prompt('Enter new daily scenario:');
    if (name && !availableDailyTopics.includes(name)) {
      setAvailableDailyTopics(prev => [...prev, name]);
      setDailyTopic(name);
    }
  };

  const t = LOCALIZED_STRINGS[language] || LOCALIZED_STRINGS[Language.ENGLISH];

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center py-6 md:py-12 px-4 md:px-6 text-slate-200 overflow-x-hidden text-left">
      <header className="w-full max-w-7xl flex flex-col md:flex-row items-center justify-between mb-8 md:mb-12 gap-6 px-2">
        <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
          <div className="p-3 md:p-5 bg-blue-600 rounded-2xl md:rounded-[1.5rem] shadow-[0_0_40px_rgba(37,99,235,0.4)] flex-shrink-0">
            <svg className="w-6 h-6 md:w-10 md:h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white uppercase italic leading-none truncate">{t.appTitle}</h1>
            <span className="text-[9px] md:text-[11px] text-blue-400 font-black uppercase tracking-[0.2em] md:tracking-[0.4em] mt-1 truncate">{t.appSub}</span>
          </div>
        </div>
        
        <div className="flex flex-row items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
           <button 
            onClick={() => setIsVisionEnabled(!isVisionEnabled)}
            disabled={status.isConnected}
            className={`flex items-center justify-center gap-2 md:gap-3 h-12 md:h-14 px-4 md:px-6 rounded-xl md:rounded-2xl border transition-all flex-shrink-0 min-w-[130px] md:min-w-[170px] ${
              isVisionEnabled ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-slate-900 border-slate-800 text-slate-500'
            } disabled:opacity-30 active:scale-95`}
          >
            <span className="text-lg md:text-xl flex-shrink-0">{isVisionEnabled ? '👁️' : '🕶️'}</span>
            <span className="text-[9px] md:text-[11px] font-black uppercase tracking-widest truncate">{t.visionLink}</span>
          </button>
          
          <div className="h-12 md:h-14 px-4 md:px-6 bg-slate-900/80 border border-slate-800 rounded-xl md:rounded-2xl flex items-center justify-center gap-3 md:gap-4 flex-shrink-0 min-w-[150px] md:min-w-[190px]">
             <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full flex-shrink-0 ${status.isConnected ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.8)]' : 'bg-slate-700'}`}></div>
             <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-slate-400 truncate text-center">
               {status.isConnected ? t.uplinkActive : t.uplinkReady}
             </span>
          </div>
        </div>
      </header>

      <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 lg:items-start mb-12 px-2">
        <aside className="order-1 lg:col-span-3 flex flex-col space-y-6 md:space-y-10">
          <div className="order-1">
            <ControlPanel
              isConnecting={status.isConnecting} isConnected={status.isConnected}
              onToggle={() => status.isConnected ? cleanup() : startSession()}
              selectedVoice={voice} onVoiceChange={setVoice}
              selectedLanguage={language} onLanguageChange={setLanguage}
              selectedMode={mode} onModeChange={setMode}
              selectedSituation={BusinessSituation.MEETING} onSituationChange={() => {}}
              selectedCategory={category} onCategoryChange={setCategory}
              availableCategories={availableCategories} onAddCategory={handleAddCategory}
              selectedDailyTopic={dailyTopic} onDailyTopicChange={setDailyTopic}
              availableDailyTopics={availableDailyTopics} onAddDailyTopic={handleAddDailyTopic}
              isChallengeMode={isChallengeMode} onChallengeToggle={setIsChallengeMode}
            />
          </div>
          <div className="order-2">
            <VisionPreview stream={cameraStream} isActive={isVisionEnabled} />
          </div>
          <div className="order-3">
            <MissionPanel missions={[]} lang={language} />
          </div>
        </aside>

        <section className="order-2 lg:col-span-9 flex flex-col space-y-8 md:space-y-10">
          <div className="flex flex-col lg:flex-row gap-6 md:gap-8 min-h-[500px] lg:h-[600px]">
            <div className="flex-grow lg:w-2/3 flex flex-col bg-slate-900/20 rounded-[2.5rem] border border-slate-800 p-6 md:p-8 shadow-2xl backdrop-blur-sm overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4 z-20">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                   <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">{t.streamTitle}</h3>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                   <button onClick={() => runDiagnostic(transcriptions)} disabled={transcriptions.length < 2 || isEvaluating} className="action-btn-emerald flex-1 sm:flex-none">
                     {isEvaluating ? <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" /> : t.analyzeBtn}
                   </button>
                   <button onClick={saveCurrentSession} disabled={transcriptions.length === 0 || isSaving} className="action-btn-blue flex-1 sm:flex-none">
                     {isSaving ? <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" /> : t.archiveBtn}
                   </button>
                </div>
              </div>
              <div className="flex-grow overflow-hidden">
                <TranscriptionView entries={transcriptions} lang={language} />
              </div>
            </div>

            <div className="lg:w-1/3 lg:max-w-[380px] flex flex-col">
              <SuggestionPanel 
                suggestions={suggestions} 
                isLoading={isSuggestionsLoading} 
                error={null} 
                onSelect={(text) => {
                  if (sessionRef.current && isConnectedRef.current) {
                    sessionRef.current.send({ parts: [{ text }] });
                  }
                }} 
                isPlaying={null} 
                lang={language} 
              />
            </div>
          </div>
          
          <div className="p-6 md:p-8 bg-slate-950/60 rounded-[2.5rem] border border-slate-800 shadow-xl w-full">
             <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 text-center">{t.oscilloscope}</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
               <div className="relative">
                 <span className="absolute -top-3 left-4 text-[7px] font-bold text-emerald-500/50 uppercase tracking-widest">Input</span>
                 <AudioVisualizer analyser={inputAnalyserRef.current} isActive={status.isConnected} color="#10b981" />
               </div>
               <div className="relative">
                 <span className="absolute -top-3 left-4 text-[7px] font-bold text-blue-500/50 uppercase tracking-widest">Feedback</span>
                 <AudioVisualizer analyser={outputAnalyserRef.current} isActive={status.isConnected} color="#3b82f6" />
               </div>
             </div>
          </div>
        </section>
      </main>

      <div className="w-full px-4">
        <HistoryPanel sessions={savedSessions} onLoad={loadSession} onDelete={(id) => setSavedSessions(s => s.filter(x => x.id !== id))} lang={language} />
      </div>

      <div className="w-full max-w-7xl mt-24 border-t border-slate-800 pt-20 px-4">
        <div className="flex flex-col items-center mb-16 text-center">
          <div className="px-4 py-1.5 bg-blue-600/10 border border-blue-500/30 rounded-full mb-4">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{t.aboutMe}</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter">{t.portfolio}</h2>
        </div>
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

      <style>{`
        .action-btn-emerald {
          @apply px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-[9px] font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all duration-300 disabled:opacity-20 flex items-center justify-center min-w-[110px];
        }
        .action-btn-blue {
          @apply px-4 py-2.5 bg-blue-500/10 border border-blue-500/30 rounded-2xl text-[9px] font-black uppercase tracking-widest text-blue-400 hover:bg-blue-500 hover:text-white transition-all duration-300 disabled:opacity-20 flex items-center justify-center min-w-[110px];
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default App;
