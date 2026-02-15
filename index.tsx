
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { TranscriptionEntry, VoiceName, SessionStatus, Language, PracticeMode, BusinessSituation, BusinessCategory, DAILY_TOPICS, CERTIFICATION_TOPICS, SavedSession, LearnedTerm, StudyCondition } from './types';
import { createBlob, decode, decodeAudioData } from './services/audioService';
import ControlPanel from './components/ControlPanel';
import TranscriptionView from './components/TranscriptionView';
import AudioVisualizer from './components/AudioVisualizer';
import SuggestionPanel from './components/SuggestionPanel';
import HistoryPanel from './components/HistoryPanel';
import VisionPreview from './components/VisionPreview';
import SummaryModal from './components/SummaryModal';

const MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-12-2025';
const EVALUATION_MODEL_NAME = 'gemini-3-flash-preview';

// Postgres Table Metadata (ai_lc_study_sessions)
const DB_CONFIG = {
  table: "ai_lc_study_sessions",
  host: "dpg-d63nv6cr85hc73bckig0-a.oregon-postgres.render.com",
  dbname: "g_kentei_prep_app_db",
  user: "g_kentei_prep_app_db_user"
};

const LOCALIZED_STRINGS: Record<Language, any> = {
  [Language.ENGLISH]: {
    appTitle: "Polyglot Labs",
    appSub: "Neural Database Interface",
    uplinkReady: "Awaiting Connection",
    uplinkActive: "Neural Link Established",
    archiveTitle: "Neural Archive [ai_lc_study_sessions]",
    archiveDesc: "Target Table: " + DB_CONFIG.table,
    userId: "UPLINK_ID: ",
    finishBtn: "Finish & Summarize"
  },
  [Language.JAPANESE]: {
    appTitle: "Polyglot Labs",
    appSub: "ニューラル・データベース・インターフェース",
    uplinkReady: "待機中",
    uplinkActive: "DB同期済み",
    archiveTitle: "学習履歴アーカイブ [ai_lc_study_sessions]",
    archiveDesc: "保存先テーブル: " + DB_CONFIG.table,
    userId: "ユーザーID: ",
    finishBtn: "学習を終了して整理"
  },
  [Language.CHINESE]: {
    appTitle: "博学语言实验室",
    appSub: "神经数据库接口",
    uplinkReady: "链路就绪",
    uplinkActive: "数据库已同步",
    archiveTitle: "进步档案 [ai_lc_study_sessions]",
    archiveDesc: "目標表: " + DB_CONFIG.table,
    userId: "识别码: ",
    finishBtn: "完成并总结"
  },
  [Language.KOREAN]: {
    appTitle: "폴리그랏 랩스",
    appSub: "뉴럴 데이터베이스 인터페이스",
    uplinkReady: "대기 중",
    uplinkActive: "DB 동기화됨",
    archiveTitle: "학습 기록 보관소 [ai_lc_study_sessions]",
    archiveDesc: "대상 테이블: " + DB_CONFIG.table,
    userId: "유저 ID: ",
    finishBtn: "학습 종료 및 정리"
  }
};

const App: React.FC = () => {
  const [status, setStatus] = useState<SessionStatus>({ isConnected: false, isConnecting: false, error: null });
  const [voice, setVoice] = useState<VoiceName>(VoiceName.ZEPHYR);
  const [language, setLanguage] = useState<Language>(Language.JAPANESE);
  const [mode, setMode] = useState<PracticeMode>(PracticeMode.CERTIFICATION);
  
  const [category, setCategory] = useState<string>(BusinessCategory.DEVELOPMENT);
  const [availableCategories, setAvailableCategories] = useState<string[]>(Object.values(BusinessCategory));
  const [dailyTopic, setDailyTopic] = useState<string>(DAILY_TOPICS[0]);
  const [availableDailyTopics, setAvailableDailyTopics] = useState<string[]>(DAILY_TOPICS);
  const [certificationTopic, setCertificationTopic] = useState<string>(CERTIFICATION_TOPICS[0]);
  const [availableCertTopics, setAvailableCertTopics] = useState<string[]>(CERTIFICATION_TOPICS);
  const [situation, setSituation] = useState<BusinessSituation>(BusinessSituation.MEETING);
  const [condition, setCondition] = useState<StudyCondition>(StudyCondition.STANDARD);
  
  const [userId] = useState<string>("USER-" + Math.random().toString(36).substring(2, 9).toUpperCase());
  const [isVisionEnabled, setIsVisionEnabled] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [transcriptions, setTranscriptions] = useState<TranscriptionEntry[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [learnedTerms, setLearnedTerms] = useState<LearnedTerm[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
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
  
  const currentSettings = useRef({ mode, category, dailyTopic, certificationTopic, situation, language, condition });
  useEffect(() => {
    currentSettings.current = { mode, category, dailyTopic, certificationTopic, situation, language, condition };
  }, [mode, category, dailyTopic, certificationTopic, situation, language, condition]);

  const currentInputTranscription = useRef('');
  const currentOutputTranscription = useRef('');

  useEffect(() => {
    const stored = localStorage.getItem('ai_lc_study_sessions_v3');
    if (stored) {
      try { setSavedSessions(JSON.parse(stored)); } catch (e) { console.error(e); }
    }
  }, []);

  const cleanup = useCallback(() => {
    isConnectedRef.current = false;
    sourcesRef.current.forEach(s => { try { s.stop(); } catch(e){} });
    sourcesRef.current.clear();
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
      const { mode: m, dailyTopic: dt, certificationTopic: ct, language: lang } = currentSettings.current;
      const topic = m === PracticeMode.CERTIFICATION ? ct : dt;
      
      const prompt = `Linguistic Data Scientist. Session Summary for table [${DB_CONFIG.table}] in ${lang}.
      会話の内容を以下の構成で整理してください：
      1. 【全体要約】: 今回話した内容の簡潔なまとめ。
      2. 【習得した概念・用語】: 登場した重要な専門用語や表現（箇条書き）。
      3. 【改善へのフィードバック】: 文法や自然さ、発音など、今後意識すべき点。
      4. 【次のステップ】: 次回のセッションで深掘りすべきトピックの提案。
      
      History: ${transcriptions.map(e => `[${e.role}] ${e.text}`).join('\n')}`;

      const response = await ai.models.generateContent({
        model: EVALUATION_MODEL_NAME,
        contents: prompt
      });

      const summaryText = response.text || "Report complete.";
      setStudySummary(summaryText);

      const newSession: SavedSession = {
        id: crypto.randomUUID(),
        userId: userId,
        timestamp: Date.now(),
        language: lang,
        mode: m,
        condition: currentSettings.current.condition,
        topic: topic,
        transcriptions: [...transcriptions],
        learnedTerms: [...learnedTerms],
        summary: summaryText,
        isSynced: false
      };

      setSavedSessions(prev => {
        const updated = [newSession, ...prev];
        localStorage.setItem('ai_lc_study_sessions_v3', JSON.stringify(updated));
        return updated;
      });

    } catch (e) {
      console.error(e);
      setStatus(prev => ({ ...prev, error: "レポート生成に失敗しました。" }));
    } finally {
      setIsSummarizing(false);
    }
  };

  const exportSummaryAsFile = () => {
    if (!studySummary) return;
    const { certificationTopic: ct, dailyTopic: dt, mode: m } = currentSettings.current;
    const topic = m === PracticeMode.CERTIFICATION ? ct : dt;
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `StudyReport_${topic.replace(/\s+/g, '_')}_${dateStr}.txt`;
    
    const blob = new Blob([studySummary], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
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
      const { mode: m, certificationTopic: ct, dailyTopic: dt, language: lang } = currentSettings.current;
      const isStudy = m === PracticeMode.CERTIFICATION;
      
      const prompt = isStudy 
        ? `Expert in ${ct}. Focus on Machine Learning and JDLA topics. Extract 1-2 key technical concepts from current conversation.
           Output ONLY JSON: [{"term": "...", "definition": "..."}]. Language: ${lang}.`
        : `Linguistic coach. Based on "${dt}", provide 3 natural response suggestions in ${lang}. Output ONLY JSON array of strings.`;

      const response = await ai.models.generateContent({
        model: EVALUATION_MODEL_NAME,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      const result = JSON.parse(response.text || "[]");
      if (isStudy) {
        setLearnedTerms(prev => {
          const newItems = (result as LearnedTerm[]).filter(newItem => 
            !prev.some(oldItem => oldItem.term.toLowerCase() === newItem.term.toLowerCase())
          );
          return [...prev, ...newItems];
        });
      } else {
        setSuggestions(result);
      }
    } catch (e) { console.error(e); } finally { setIsSuggestionsLoading(false); }
  };

  const startSession = async () => {
    if (status.isConnecting || status.isConnected) return;
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
      
      const { mode: m, category: cat, dailyTopic: dt, certificationTopic: ct, situation: sit, language: lang, condition: cond } = currentSettings.current;
      const currentTopicStr = m === PracticeMode.CERTIFICATION ? ct : m === PracticeMode.BUSINESS ? `${cat} at ${sit}` : dt;

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
          systemInstruction: `You are an elite linguistic coach and subject expert for ${lang}.
          Mode: ${m}. Focus: ${currentTopicStr}. Condition: ${cond}.
          If mode is Certification Study, prioritize technical accuracy and structured explanations.
          If Business, prioritize professional etiquette and clear articulation.
          If Daily, maintain a natural, supportive flow.`,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
      });
      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error(err);
      setStatus({ isConnecting: false, isConnected: false, error: err.message });
      cleanup();
    }
  };

  const handleAddTopic = (type: 'daily' | 'cert' | 'category') => {
    const val = prompt("新しいトピック名を入力してください:");
    if (!val) return;
    if (type === 'daily') {
      setAvailableDailyTopics(prev => [...prev, val]);
      setDailyTopic(val);
    } else if (type === 'cert') {
      setAvailableCertTopics(prev => [...prev, val]);
      setCertificationTopic(val);
    } else if (type === 'category') {
      setAvailableCategories(prev => [...prev, val]);
      setCategory(val);
    }
  };

  const t = LOCALIZED_STRINGS[language] || LOCALIZED_STRINGS[Language.ENGLISH];

  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center py-8 px-4 text-slate-200">
      <header className="w-full max-w-7xl flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-slate-900 border border-emerald-500/50 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white uppercase italic leading-none">{t.appTitle}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.3em]">{t.appSub}</span>
              <span className="text-[10px] text-slate-500 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{t.userId}{userId}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-6 py-3 bg-slate-800/80 border border-slate-700 rounded-xl flex items-center gap-3">
             <div className={`w-3 h-3 rounded-full ${status.isConnected ? 'bg-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-slate-700'}`}></div>
             <span className="text-xs font-black uppercase tracking-widest text-slate-400">{status.isConnected ? t.uplinkActive : t.uplinkReady}</span>
          </div>
          {transcriptions.length > 0 && (
            <button 
              onClick={handleFinishStudy} 
              disabled={isSummarizing}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
            >
              {isSummarizing ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : t.finishBtn}
            </button>
          )}
        </div>
      </header>

      <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 mb-24">
        <aside className="lg:col-span-3 space-y-6">
          <ControlPanel
            isConnecting={status.isConnecting} isConnected={status.isConnected}
            onToggle={() => status.isConnected ? cleanup() : startSession()}
            onFinishStudy={handleFinishStudy} isSummarizing={isSummarizing}
            selectedVoice={voice} onVoiceChange={setVoice}
            selectedLanguage={language} onLanguageChange={setLanguage}
            selectedMode={mode} onModeChange={setMode}
            selectedSituation={situation} onSituationChange={setSituation}
            selectedCategory={category} onCategoryChange={setCategory}
            availableCategories={availableCategories} onAddCategory={() => handleAddTopic('category')}
            selectedDailyTopic={dailyTopic} onDailyTopicChange={setDailyTopic}
            availableDailyTopics={availableDailyTopics} onAddDailyTopic={() => handleAddTopic('daily')}
            selectedCertTopic={certificationTopic} onCertTopicChange={setCertificationTopic}
            availableCertTopics={availableCertTopics} onAddCertTopic={() => handleAddTopic('cert')}
            selectedCondition={condition} onConditionChange={setCondition}
            isChallengeMode={false} onChallengeToggle={() => {}}
          />
          <VisionPreview stream={cameraStream} isActive={isVisionEnabled} />
        </aside>

        <section className="lg:col-span-9 space-y-8 h-full flex flex-col">
          {/* Main Content Area with Fixed Height */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[750px]">
            <div className="lg:col-span-2 flex flex-col bg-slate-900/40 rounded-[2.5rem] border border-slate-800 p-8 shadow-2xl backdrop-blur-sm overflow-hidden h-full">
              <TranscriptionView entries={transcriptions} lang={language} mode={mode} />
            </div>
            <div className="h-full overflow-hidden">
              <SuggestionPanel suggestions={suggestions} learnedTerms={learnedTerms} isLoading={isSuggestionsLoading} error={null} onSelect={() => {}} isPlaying={null} lang={language} mode={mode} />
            </div>
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

      <section className="w-full max-w-7xl border-t border-slate-800 pt-20 mb-24">
        <div className="flex flex-col items-center mb-12">
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">{t.archiveTitle}</h2>
          <p className="text-sm text-slate-500 mt-2 font-mono tracking-wide">{t.archiveDesc}</p>
        </div>
        <HistoryPanel sessions={savedSessions} onDelete={(id) => setSavedSessions(prev => prev.filter(s => s.id !== id))} lang={language} />
      </section>

      {studySummary && (
        <SummaryModal 
          summary={studySummary} 
          onClose={() => setStudySummary(null)} 
          onDownload={exportSummaryAsFile} 
          lang={language} 
        />
      )}
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}

export default App;
