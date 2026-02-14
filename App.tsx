
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type } from '@google/genai';
import { TranscriptionEntry, VoiceName, SessionStatus, Language, PracticeMode, BusinessSituation, BusinessCategory, DAILY_TOPICS, SavedSession, LinguisticEvaluation } from './types';
import { createBlob, decode, decodeAudioData } from './services/audioService';
import ControlPanel from './components/ControlPanel';
import TranscriptionView from './components/TranscriptionView';
import AudioVisualizer from './components/AudioVisualizer';
import SuggestionPanel from './components/SuggestionPanel';
import HistoryPanel from './components/HistoryPanel';
import DiagnosticView from './components/DiagnosticView';

const MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-12-2025';
const SUGGESTION_MODEL_NAME = 'gemini-3-flash-preview';
const TTS_MODEL_NAME = 'gemini-2.5-flash-preview-tts';
const EVALUATION_MODEL_NAME = 'gemini-3-flash-preview';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

const App: React.FC = () => {
  const [status, setStatus] = useState<SessionStatus>({
    isConnected: false,
    isConnecting: false,
    error: null,
  });
  const [voice, setVoice] = useState<VoiceName>(VoiceName.ZEPHYR);
  const [language, setLanguage] = useState<Language>(Language.JAPANESE);
  const [mode, setMode] = useState<PracticeMode>(PracticeMode.DAILY);
  const [situation, setSituation] = useState<BusinessSituation>(BusinessSituation.MEETING);
  const [availableCategories, setAvailableCategories] = useState<string[]>(Object.values(BusinessCategory));
  const [category, setCategory] = useState<string>(BusinessCategory.DEVELOPMENT);
  const [dailyTopic, setDailyTopic] = useState<string>(DAILY_TOPICS[0]);
  const [isChallengeMode, setIsChallengeMode] = useState(false);
  
  const [transcriptions, setTranscriptions] = useState<TranscriptionEntry[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [isPlayingTTS, setIsPlayingTTS] = useState<string | null>(null);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  
  const [currentEvaluation, setCurrentEvaluation] = useState<LinguisticEvaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const audioContextRef = useRef<{ input: AudioContext; output: AudioContext; } | null>(null);
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const isConnectedRef = useRef<boolean>(false);
  
  const languageRef = useRef(language);
  const modeRef = useRef(mode);
  const situationRef = useRef(situation);
  const categoryRef = useRef(category);
  const dailyTopicRef = useRef(dailyTopic);
  const lastSuggestionTimeRef = useRef<number>(0);
  const isQuotaExceededRef = useRef<boolean>(false);

  useEffect(() => { languageRef.current = language; }, [language]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { situationRef.current = situation; }, [situation]);
  useEffect(() => { categoryRef.current = category; }, [category]);
  useEffect(() => { dailyTopicRef.current = dailyTopic; }, [dailyTopic]);

  useEffect(() => {
    const stored = localStorage.getItem('polyglot_labs_history');
    if (stored) {
      try {
        setSavedSessions(JSON.parse(stored));
      } catch (e) { console.error("Failed to parse history", e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('polyglot_labs_history', JSON.stringify(savedSessions));
  }, [savedSessions]);

  const currentInputTranscription = useRef('');
  const currentOutputTranscription = useRef('');

  const stopAllAudio = useCallback(() => {
    sourcesRef.current.forEach((source) => {
      try { source.stop(); } catch (e) {}
    });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  }, []);

  const cleanup = useCallback(() => {
    isConnectedRef.current = false;
    stopAllAudio();
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

  const runDiagnostic = async (history: TranscriptionEntry[]) => {
    if (history.length < 2) return;
    setIsEvaluating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analyze this ${languageRef.current} language learning transcript. Evaluate the 'user' performance based on grammar, vocabulary level, and naturalness.
      Transcript: ${history.map(h => `[${h.role}] ${h.text}`).join('\n')}
      Return a JSON object matching the linguistic evaluation schema.`;

      const response = await ai.models.generateContent({
        model: EVALUATION_MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              grammarScore: { type: Type.NUMBER },
              vocabularyScore: { type: Type.NUMBER },
              naturalnessScore: { type: Type.NUMBER },
              overallGrade: { type: Type.STRING, enum: ['S', 'A', 'B', 'C', 'D'] },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggestedImprovement: { type: Type.STRING }
            },
            required: ["grammarScore", "vocabularyScore", "naturalnessScore", "overallGrade", "strengths", "weaknesses", "suggestedImprovement"]
          }
        }
      });

      const result = JSON.parse(response.text);
      setCurrentEvaluation(result);
      return result;
    } catch (e) {
      console.error("Diagnostic failed", e);
    } finally {
      setIsEvaluating(false);
    }
  };

  const saveCurrentSession = async () => {
    if (transcriptions.length === 0) return;
    
    // Auto-run diagnostic on save if it's a significant conversation
    let evalData;
    if (transcriptions.length >= 4) {
      evalData = await runDiagnostic(transcriptions);
    }

    const newSession: SavedSession = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      language: language,
      mode: mode,
      category: category,
      dailyTopic: dailyTopic,
      transcriptions: [...transcriptions],
      preview: transcriptions[transcriptions.length - 1].text,
      evaluation: evalData
    };

    setSavedSessions(prev => [newSession, ...prev].slice(0, 20));
  };

  const generateSuggestions = async (history: TranscriptionEntry[]) => {
    if (isQuotaExceededRef.current) return;
    const now = Date.now();
    if (history.length > 0 && now - lastSuggestionTimeRef.current < 15000) return;

    setIsGeneratingSuggestions(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const currentContext = modeRef.current === PracticeMode.DAILY 
        ? dailyTopicRef.current 
        : `${categoryRef.current} context for a ${situationRef.current}`;

      const prompt = history.length === 0 
        ? `I am practicing ${languageRef.current} in a ${currentContext} setting. Give me 3 short sentences I could say to start the conversation. Separate them by "|".`
        : `Recent conversation: ${history.slice(-3).map(h => h.text).join(' ')}. Context: ${currentContext}. Give me 3 short follow-up options for the user in ${languageRef.current}. Separate them by "|".`;

      const response = await ai.models.generateContent({
        model: SUGGESTION_MODEL_NAME,
        contents: prompt
      });
      
      lastSuggestionTimeRef.current = Date.now();
      const text = response.text || '';
      const parts = text.split('|').map(s => s.trim()).filter(s => s.length > 0);
      setSuggestions(parts.length > 0 ? parts.slice(0, 3) : ['Hello', 'How are you?', 'Let\'s start']);
    } catch (e: any) {
      if (e.message?.includes('429')) isQuotaExceededRef.current = true;
    } finally { setIsGeneratingSuggestions(false); }
  };

  const playTTS = async (text: string) => {
    if (isPlayingTTS) return;
    setIsPlayingTTS(text);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: TTS_MODEL_NAME,
        contents: [{ parts: [{ text: `Speak in ${languageRef.current}: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio && audioContextRef.current) {
        const { output } = audioContextRef.current;
        const buffer = await decodeAudioData(decode(base64Audio), output, 24000, 1);
        const source = output.createBufferSource();
        source.buffer = buffer;
        source.connect(output.destination);
        source.onended = () => setIsPlayingTTS(null);
        source.start(0);
      }
    } catch (err) { setIsPlayingTTS(null); }
  };

  const getSystemInstruction = () => {
    const lang = languageRef.current;
    const mod = modeRef.current;
    const type = isChallengeMode ? "EXAMINER" : "COACH";
    
    const base = mod === PracticeMode.DAILY 
      ? `Activity: ${dailyTopicRef.current}. Location: Island.` 
      : `Domain: ${categoryRef.current}. Scenario: ${situationRef.current}.`;

    const instructions = isChallengeMode 
      ? `Act as a strict but fair language EXAMINER. Challenge the user to use advanced vocabulary. After each turn, implicitly steer them towards a specific linguistic task. If they make mistakes, don't correct them immediately, but note it for later.`
      : `Act as a helpful, friendly language COACH. Keep the flow natural and encouraging. Correct user mistakes gently if they occur.`;

    return `You are a ${type} for ${lang}. 
    Context: ${base}
    Goal: High-immersion roleplay.
    Rules:
    1. Speak ONLY in ${lang}.
    2. Keep turns short (1-2 sentences).
    ${instructions}`;
  };

  const startSession = async () => {
    if (status.isConnecting || status.isConnected) return;
    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) await window.aistudio.openSelectKey();

    setStatus({ isConnecting: true, isConnected: false, error: null });
    setTranscriptions([]);
    setSuggestions([]);
    isQuotaExceededRef.current = false;
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      if (!audioContextRef.current) {
        const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        audioContextRef.current = { input: inputCtx, output: outputCtx };
        inputAnalyserRef.current = inputCtx.createAnalyser();
        outputAnalyserRef.current = outputCtx.createAnalyser();
      }

      await audioContextRef.current.input.resume();
      await audioContextRef.current.output.resume();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const sessionPromise = ai.live.connect({
        model: MODEL_NAME,
        callbacks: {
          onopen: () => {
            isConnectedRef.current = true;
            setStatus({ isConnected: true, isConnecting: false, error: null });
            generateSuggestions([]);
            const source = audioContextRef.current!.input.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.input.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              if (!isConnectedRef.current) return;
              const pcmBlob = createBlob(e.inputBuffer.getChannelData(0));
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob })).catch(() => {});
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
                setTranscriptions(prev => {
                  const updated = [...prev, ...(u ? [{ role: 'user' as const, text: u, timestamp: Date.now() }] : []), ...(m ? [{ role: 'model' as const, text: m, timestamp: Date.now()+1 }] : [])];
                  generateSuggestions(updated);
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
              source.onended = () => sourcesRef.current.delete(source);
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
          systemInstruction: getSystemInstruction(),
        },
      });
      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      setStatus({ isConnecting: false, isConnected: false, error: err.message });
      cleanup();
    }
  };

  // Fixed missing handleAddCategory function
  const handleAddCategory = () => {
    const custom = prompt("Enter custom category:");
    if (custom && !availableCategories.includes(custom)) {
      setAvailableCategories(prev => [...prev, custom]);
      setCategory(custom);
    }
  };

  // Fixed missing loadSession function
  const loadSession = (session: SavedSession) => {
    setTranscriptions(session.transcriptions);
    setLanguage(session.language);
    setMode(session.mode);
    setCategory(session.category);
    setDailyTopic(session.dailyTopic);
    setCurrentEvaluation(session.evaluation || null);
    if (status.isConnected) {
      cleanup();
    }
  };

  // Fixed missing deleteSession function
  const deleteSession = (id: string) => {
    setSavedSessions(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center py-10 px-4 sm:px-6 text-slate-200">
      {/* Header */}
      <header className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-900/40">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white uppercase italic">Polyglot Labs</h1>
            <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.3em]">Neural Linguistic Forge</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <div className="px-4 py-2 bg-slate-900/60 border border-slate-700/50 rounded-2xl flex items-center gap-2">
             <div className={`w-2 h-2 rounded-full ${status.isConnected ? 'bg-green-500 animate-pulse' : 'bg-slate-700'}`}></div>
             <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
               {status.isConnected ? (isChallengeMode ? 'Assessment Link' : 'Immersion Link') : 'Link Offline'}
             </span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        <div className="lg:col-span-4 space-y-6">
          <ControlPanel
            isConnecting={status.isConnecting}
            isConnected={status.isConnected}
            onToggle={() => status.isConnected ? cleanup() : startSession()}
            selectedVoice={voice}
            onVoiceChange={setVoice}
            selectedLanguage={language}
            onLanguageChange={setLanguage}
            selectedMode={mode}
            onModeChange={setMode}
            selectedSituation={situation}
            onSituationChange={setSituation}
            selectedCategory={category}
            onCategoryChange={setCategory}
            availableCategories={availableCategories}
            onAddCategory={handleAddCategory}
            selectedDailyTopic={dailyTopic}
            onDailyTopicChange={setDailyTopic}
            isChallengeMode={isChallengeMode}
            onChallengeToggle={setIsChallengeMode}
          />
          
          <div className="p-5 bg-slate-950/40 rounded-[2rem] border border-slate-800 backdrop-blur-md">
            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Neural Feedback</h3>
            <div className="space-y-4">
              <AudioVisualizer analyser={inputAnalyserRef.current} isActive={status.isConnected} color="#10b981" />
              <AudioVisualizer analyser={outputAnalyserRef.current} isActive={status.isConnected} color="#3b82f6" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 flex flex-col h-[750px]">
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Live Simulation Transcript</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => runDiagnostic(transcriptions)}
                  disabled={transcriptions.length < 4 || isEvaluating}
                  className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600/10 border border-emerald-500/30 rounded-xl text-[9px] font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-30"
                >
                  {isEvaluating ? 'Analyzing...' : 'Run Diagnostic'}
                </button>
                <button 
                  onClick={saveCurrentSession}
                  disabled={transcriptions.length === 0}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 border border-blue-500/30 rounded-xl text-[9px] font-black uppercase tracking-widest text-blue-400 hover:bg-blue-600 hover:text-white transition-all disabled:opacity-30"
                >
                  Save State
                </button>
              </div>
            </div>
            <TranscriptionView entries={transcriptions} />
          </div>
          <div className="md:col-span-1">
             <SuggestionPanel 
                suggestions={suggestions} 
                isLoading={isGeneratingSuggestions} 
                error={suggestionError}
                onSelect={playTTS}
                isPlaying={isPlayingTTS}
             />
          </div>
        </div>
      </main>

      <HistoryPanel 
        sessions={savedSessions} 
        onLoad={(s) => loadSession(s)} 
        onDelete={(id) => deleteSession(id)} 
      />

      {/* Diagnostics Modal */}
      {currentEvaluation && (
        <DiagnosticView evaluation={currentEvaluation} onClose={() => setCurrentEvaluation(null)} />
      )}

      {/* Footer Branding */}
      <footer className="mt-20 py-10 border-t border-slate-800/30 w-full flex flex-col items-center gap-4">
         <span className="text-[10px] text-slate-600 font-black tracking-[0.4em] uppercase">Gemini 2.5 Multi-Modal Adaptive Learning Engine</span>
      </footer>
    </div>
  );
};

export default App;
