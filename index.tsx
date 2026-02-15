
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, LiveServerMessage, Modality, Type } from '@google/genai';
import { TranscriptionEntry, VoiceName, SessionStatus, Language, PracticeMode, BusinessSituation, BusinessCategory, DAILY_TOPICS, CERTIFICATION_TOPICS, SavedSession, LinguisticEvaluation, BkimSchedule } from './types';
import { createBlob, decode, decodeAudioData } from './services/audioService';
import ControlPanel from './components/ControlPanel';
import TranscriptionView from './components/TranscriptionView';
import AudioVisualizer from './components/AudioVisualizer';
import SuggestionPanel from './components/SuggestionPanel';
import HistoryPanel from './components/HistoryPanel';
import DiagnosticView from './components/DiagnosticView';
import VisionPreview from './components/VisionPreview';
import MissionPanel from './components/MissionPanel';
import BkimProtocolView from './components/BkimProtocolView';
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
    analyzeDesc: "Analyzes grammar, vocabulary, and fluency.",
    archiveTitle: "Session Commit",
    archiveDesc: "Saves current logs.",
    analyzeBtn: "Analyze Flow",
    archiveBtn: "Archive State",
    oscilloscope: "Neural Oscilloscope",
    aboutMe: "Engineer Profile",
    portfolio: "Portfolio",
    camError: "Camera access denied.",
    camNotFound: "No camera found.",
    micDenied: "Microphone access denied. Please enable it in browser settings.",
    micNotFound: "Microphone hardware not found.",
    secureContextError: "Media access requires a secure context (HTTPS/localhost)."
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
    oscilloscope: "ニューラル・オシロスコープ",
    aboutMe: "エンジニア・プロフィール",
    portfolio: "ポートフォリオ",
    camError: "カメラの使用が拒否されました。",
    camNotFound: "カメラが見つかりません。",
    micDenied: "マイクの使用が拒否されました。ブラウザの設定で許可してください。",
    micNotFound: "マイクが見つかりませんでした。",
    secureContextError: "マイクの使用にはHTTPS通信が必要です。"
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
    oscilloscope: "神经示波器",
    aboutMe: "工程师简介",
    portfolio: "作品集",
    camError: "相机访问被拒绝。",
    camNotFound: "未找到相机。",
    micDenied: "麦克风访问被拒绝。",
    micNotFound: "未找到麦克风。",
    secureContextError: "需要 HTTPS 连接才能访问媒体。"
  },
  [Language.KOREAN]: {
    appTitle: "폴리그랏 랩스",
    appSub: "멀티모달 뉴럴 인터페이스",
    visionLink: "비전 링크",
    uplinkReady: "대기 중",
    uplinkActive: "동기화됨",
    streamTitle: "언어 데이터 스트リーム",
    analyzeTitle: "AI 진단 프로토콜",
    analyzeDesc: "문법, 어휘, 유창성 분석.",
    archiveTitle: "세션 커밋",
    archiveDesc: "로그 저장.",
    analyzeBtn: "흐름 분석",
    archiveBtn: "상태 저장",
    oscilloscope: "뉴럴 오실로スコープ",
    aboutMe: "엔지니어 프로필",
    portfolio: "포트폴리오",
    camError: "카메라 접근 거부됨.",
    camNotFound: "카메라 없음.",
    micDenied: "마이크 접근이 거부되었습니다.",
    micNotFound: "마이크를 찾을 수 없습니다.",
    secureContextError: "미디어 접근을 위해 HTTPS 연결이 필요합니다."
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
  
  const [isChallengeMode, setIsChallengeMode] = useState(false);
  const [isVisionEnabled, setIsVisionEnabled] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  
  const [transcriptions, setTranscriptions] = useState<TranscriptionEntry[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [currentEvaluation, setCurrentEvaluation] = useState<LinguisticEvaluation | null>(null);
  const [currentBkimSchedule, setCurrentBkimSchedule] = useState<BkimSchedule | null>(null);

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

  const t = LOCALIZED_STRINGS[language] || LOCALIZED_STRINGS[Language.ENGLISH];

  useEffect(() => {
    if (isVisionEnabled) {
      if (!window.isSecureContext) {
        setStatus(prev => ({ ...prev, error: t.secureContextError }));
        setIsVisionEnabled(false);
        return;
      }
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
          setTimeout(() => setStatus(prev => ({ ...prev, error: null })), 6000);
        });
    } else {
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
        setCameraStream(null);
      }
    }
  }, [isVisionEnabled, t.camError, t.camNotFound, t.secureContextError]);

  const cleanup = useCallback(() => {
    isConnectedRef.current = false;
    sourcesRef.current.forEach(s => { try { s.stop(); } catch(e){} });
    sourcesRef.current.clear();
    if (visionIntervalRef.current) clearInterval(visionIntervalRef.current);
    if (sessionRef.current) sessionRef.current.close();
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    setStatus({ isConnected: false, isConnecting: false, error: null });
  }, []);

  const startSession = async () => {
    if (status.isConnecting || status.isConnected) return;
    if (!window.isSecureContext) {
      setStatus({ isConnecting: false, isConnected: false, error: t.secureContextError });
      return;
    }
    setStatus({ isConnecting: true, isConnected: false, error: null });
    
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = audioStream;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      if (!audioContextRef.current) {
        audioContextRef.current = { 
          input: new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 }),
          output: new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 })
        };
        inputAnalyserRef.current = audioContextRef.current.input.createAnalyser();
        outputAnalyserRef.current = audioContextRef.current.output.createAnalyser();
      }
      
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
                setTranscriptions(prev => [
                  ...prev,
                  ...(u ? [{ role: 'user' as const, text: u, timestamp: Date.now() }] : []),
                  ...(m ? [{ role: 'model' as const, text: m, timestamp: Date.now()+1 }] : [])
                ]);
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
          onerror: (e) => setStatus({ isConnected: false, isConnecting: false, error: "Link failed" }),
          onclose: () => cleanup(),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
          systemInstruction: mode === PracticeMode.CERTIFICATION 
            ? `You are an expert instructor for the ${certificationTopic} certification. Your goal is to help the user study, explain complex technical terms in ${languageRef.current}, quiz them on key concepts, and provide encouraging feedback. Speak in ${languageRef.current}.`
            : `You are Bkim, a technical senior engineer. Scenario: ${mode}. Focus: ${category}. Respond naturally in ${languageRef.current}.`,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
      });
      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error(err);
      setStatus({ isConnecting: false, isConnected: false, error: err.message || "Failed to start neural link." });
      cleanup();
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center py-8 px-4 text-slate-200">
      {status.error && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md bg-red-500/10 border border-red-500/50 backdrop-blur-xl p-4 rounded-2xl flex items-center gap-4 shadow-2xl animate-in slide-in-from-top-4">
          <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">!</div>
          <div className="flex-grow">
            <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest leading-none mb-1">System Alert</h4>
            <p className="text-xs text-red-100 font-medium leading-tight">{status.error}</p>
          </div>
          <button onClick={() => setStatus(prev => ({ ...prev, error: null }))} className="text-red-400/50 hover:text-red-400 transition-colors p-2 text-xl">✕</button>
        </div>
      )}

      <header className="w-full max-w-7xl flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-blue-600 rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.4)]">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white uppercase italic leading-none">{t.appTitle}</h1>
            <span className="text-[10px] text-blue-400 font-black uppercase tracking-[0.3em] mt-1">{t.appSub}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <button 
            onClick={() => setIsVisionEnabled(!isVisionEnabled)}
            className={`px-6 py-3 rounded-xl border transition-all ${isVisionEnabled ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'}`}
          >
            {t.visionLink}
          </button>
          <div className="px-6 py-3 bg-slate-800/80 border border-slate-700 rounded-xl flex items-center gap-3">
             <div className={`w-3 h-3 rounded-full ${status.isConnected ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-slate-700'}`}></div>
             <span className="text-xs font-black uppercase tracking-widest text-slate-400">
               {status.isConnected ? t.uplinkActive : t.uplinkReady}
             </span>
          </div>
        </div>
      </header>

      <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-3 space-y-6">
          <ControlPanel
            isConnecting={status.isConnecting} isConnected={status.isConnected}
            onToggle={() => status.isConnected ? cleanup() : startSession()}
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
            isChallengeMode={isChallengeMode} onChallengeToggle={setIsChallengeMode}
          />
          <VisionPreview stream={cameraStream} isActive={isVisionEnabled} />
        </aside>

        <section className="lg:col-span-9 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[500px]">
            <div className="lg:col-span-2 flex flex-col bg-slate-900/40 rounded-[2.5rem] border border-slate-800 p-8 shadow-2xl backdrop-blur-sm overflow-hidden">
              <TranscriptionView entries={transcriptions} lang={language} />
            </div>
            <SuggestionPanel suggestions={suggestions} isLoading={isSuggestionsLoading} error={null} onSelect={() => {}} isPlaying={null} lang={language} />
          </div>
          
          <div className="p-8 bg-slate-900/40 rounded-[2rem] border border-slate-800 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60 ml-1">Mic Input</span>
              <AudioVisualizer analyser={inputAnalyserRef.current} isActive={status.isConnected} color="#10b981" />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-500/60 ml-1">AI Output</span>
              <AudioVisualizer analyser={outputAnalyserRef.current} isActive={status.isConnected} color="#3b82f6" />
            </div>
          </div>
        </section>
      </main>

      <div className="w-full max-w-7xl mt-24 border-t border-slate-800 pt-20">
        <div className="space-y-20">
          <SkillsAndInterests lang={language} />
          <ProjectShowcase lang={language} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 px-4">
            <WorkExperience lang={language} />
            <Education lang={language} />
          </div>
          <Testimonials lang={language} />
          <ContactSection lang={language} />
        </div>
      </div>

      {currentBkimSchedule && <BkimProtocolView schedule={currentBkimSchedule} onClose={() => setCurrentBkimSchedule(null)} />}
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}

export default App;
