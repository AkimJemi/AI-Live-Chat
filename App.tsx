
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { TranscriptionEntry, VoiceName, SessionStatus, Language, PracticeMode, BusinessSituation } from './types';
import { createBlob, decode, decodeAudioData } from './services/audioService';
import ControlPanel from './components/ControlPanel';
import TranscriptionView from './components/TranscriptionView';
import AudioVisualizer from './components/AudioVisualizer';
import SuggestionPanel from './components/SuggestionPanel';
import SkillsAndInterests from './components/SkillsAndInterests';
import ProjectShowcase from './components/ProjectShowcase';
import WorkExperience from './components/WorkExperience';
import Education from './components/Education';
import Testimonials from './components/Testimonials';
import ContactSection from './components/ContactSection';

const MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-12-2025';
const SUGGESTION_MODEL_NAME = 'gemini-2.0-flash'; // Optimized for speed

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
  // Session States
  const [status, setStatus] = useState<SessionStatus>({
    isConnected: false,
    isConnecting: false,
    error: null,
  });
  const [voice, setVoice] = useState<VoiceName>(VoiceName.ZEPHYR);
  const [language, setLanguage] = useState<Language>(Language.JAPANESE);
  const [mode, setMode] = useState<PracticeMode>(PracticeMode.DAILY);
  const [situation, setSituation] = useState<BusinessSituation>(BusinessSituation.MEETING);
  
  const [transcriptions, setTranscriptions] = useState<TranscriptionEntry[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

  // Refs for audio and session
  const audioContextRef = useRef<{ input: AudioContext; output: AudioContext; } | null>(null);
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const isConnectedRef = useRef<boolean>(false);
  
  // Refs for state (to access inside closures/callbacks safely)
  const languageRef = useRef(language);
  const modeRef = useRef(mode);
  const situationRef = useRef(situation);
  const transcriptionsRef = useRef(transcriptions);

  // Sync refs with state
  useEffect(() => { languageRef.current = language; }, [language]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { situationRef.current = situation; }, [situation]);
  useEffect(() => { transcriptionsRef.current = transcriptions; }, [transcriptions]);

  // Transcription buffers
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

  const changeApiKey = useCallback(async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        setStatus(prev => ({ ...prev, error: null }));
      } catch (err) {
        console.error('Failed to open key selector:', err);
      }
    }
  }, []);

  // Helper to generate suggestions
  const generateSuggestions = async (history: TranscriptionEntry[]) => {
    setIsGeneratingSuggestions(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const currentLang = languageRef.current;
      const currentMode = modeRef.current;
      const currentSit = situationRef.current;

      let prompt = '';

      if (history.length === 0) {
        // Initial Starters
        prompt = `
          Task: Provide 3 short, natural conversation starters (first sentences) for a user practicing ${currentLang}.
          Context: The user is in a "${currentMode}" mode${currentMode === PracticeMode.BUSINESS ? ` doing a "${currentSit}"` : ''}.
          Role: You are a coach suggesting what the USER should say to start the conversation with the AI.
          Format: Return ONLY 3 phrases separated by a pipe "|". No numbers, no labels.
          Example: Hello, how are you? | I'd like to practice today. | Good morning.
        `;
      } else {
        // Contextual Responses
        const recentContext = history.slice(-4).map(h => `${h.role}: ${h.text}`).join('\n');
        prompt = `
          Context: The user is practicing ${currentLang} in a ${currentMode} setting.
          
          Recent Conversation:
          ${recentContext}
          
          Task: Provide 3 short, natural response options the USER could say NEXT.
          Format: Return ONLY the 3 phrases separated by a pipe "|". No numbers.
        `;
      }

      const response = await ai.models.generateContent({
        model: SUGGESTION_MODEL_NAME,
        contents: prompt
      });
      
      const text = response.text || '';
      const parts = text.split('|').map(s => s.trim()).filter(s => s.length > 0);
      
      if (parts.length > 0) {
        setSuggestions(parts.slice(0, 3));
      } else {
        // Fallback if model output format is weird
        setSuggestions(['Hello!', 'How are you?', 'Let\'s start.']);
      }
    } catch (e) {
      console.warn('Failed to generate suggestions', e);
      // Don't clear suggestions on error, keep old ones
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const getSystemInstruction = () => {
    // Access refs to ensure we get the values at the moment of connection
    const lang = languageRef.current;
    const mod = modeRef.current;
    const sit = situationRef.current;

    let instruction = `You are an advanced language practice partner speaking in ${lang}. `;
    
    if (mod === PracticeMode.DAILY) {
      instruction += `
        Role: A friendly, casual acquaintance.
        Tone: Relaxed, natural, colloquial.
        Goal: Chat about hobbies, weather, food, or daily life. Keep the conversation flowing naturally.
      `;
    } else {
      instruction += `
        Role: A professional colleague or business partner.
        Situation: ${sit}.
        Tone: Professional, polite, clear, structured.
        Goal: Roleplay this specific business scenario. Challenge the user slightly with relevant questions.
      `;
    }

    instruction += `
      IMPORTANT:
      - Speak ONLY in ${lang}.
      - Keep responses concise (1-3 sentences) to allow the user to speak more.
      - If the user struggles, politely rephrase or encourage them.
    `;

    return instruction;
  };

  const startSession = async () => {
    if (status.isConnecting || status.isConnected) return;

    if (window.aistudio) {
      try {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await window.aistudio.openSelectKey();
        }
      } catch (err) {
        console.warn('API Key selection check failed, proceeding anyway:', err);
      }
    }

    setStatus({ isConnecting: true, isConnected: false, error: null });
    setTranscriptions([]);
    setSuggestions([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      if (!audioContextRef.current) {
        const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        const inputAnalyser = inputCtx.createAnalyser();
        const outputAnalyser = outputCtx.createAnalyser();
        inputAnalyser.fftSize = 256;
        outputAnalyser.fftSize = 256;

        audioContextRef.current = { input: inputCtx, output: outputCtx };
        inputAnalyserRef.current = inputAnalyser;
        outputAnalyserRef.current = outputAnalyser;
      }

      await audioContextRef.current.input.resume();
      await audioContextRef.current.output.resume();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const sessionPromise = ai.live.connect({
        model: MODEL_NAME,
        callbacks: {
          onopen: () => {
            console.log('Gemini Live session opened');
            isConnectedRef.current = true;
            setStatus({ isConnected: true, isConnecting: false, error: null });
            
            // Trigger initial suggestions immediately upon connection
            generateSuggestions([]);

            const source = audioContextRef.current!.input.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.input.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              if (!isConnectedRef.current) return;

              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              
              sessionPromise.then((session) => {
                if (session && isConnectedRef.current) {
                  try { session.sendRealtimeInput({ media: pcmBlob }); } catch (e) {}
                }
              }).catch(() => {});
            };

            source.connect(inputAnalyserRef.current!);
            inputAnalyserRef.current!.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.input.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              currentOutputTranscription.current += message.serverContent.outputTranscription.text;
            } else if (message.serverContent?.inputTranscription) {
              currentInputTranscription.current += message.serverContent.inputTranscription.text;
            }

            if (message.serverContent?.turnComplete) {
              const userText = currentInputTranscription.current.trim();
              const modelText = currentOutputTranscription.current.trim();
              
              if (userText || modelText) {
                const newEntry = { role: 'model' as const, text: modelText, timestamp: Date.now() + 1 };
                
                // Functional update to ensure we have latest state
                setTranscriptions(prev => {
                  const updated = [
                    ...prev,
                    ...(userText ? [{ role: 'user' as const, text: userText, timestamp: Date.now() }] : []),
                    ...(modelText ? [newEntry] : [])
                  ];
                  
                  // Trigger suggestion generation based on the updated history
                  generateSuggestions(updated);
                  return updated;
                });
              }

              currentInputTranscription.current = '';
              currentOutputTranscription.current = '';
            }

            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              const { output } = audioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, output.currentTime);
              
              try {
                const audioBuffer = await decodeAudioData(decode(base64Audio), output, 24000, 1);
                const source = output.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputAnalyserRef.current!);
                outputAnalyserRef.current!.connect(output.destination);
                source.addEventListener('ended', () => { sourcesRef.current.delete(source); });
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
              } catch (decodeErr) {
                console.error('Audio decoding error:', decodeErr);
              }
            }

            if (message.serverContent?.interrupted) {
              stopAllAudio();
            }
          },
          onerror: (e: any) => {
            console.error('Session error:', e);
            isConnectedRef.current = false;
            let errorMessage = 'Connection error. Please check your internet connection.';
            const msg = e instanceof Error ? e.message : String(e);
            
            if (msg.includes('Requested entity was not found') || msg.includes('404')) {
              errorMessage = 'Model not found. Please ensure you are using a Paid Project API Key.';
            } else if (msg.includes('Network error')) {
              errorMessage = 'Network error. Verify API Key and connection.';
            }

            setStatus({ isConnecting: false, isConnected: false, error: errorMessage });
            cleanup();
          },
          onclose: (e: any) => {
            isConnectedRef.current = false;
            cleanup();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
          },
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          systemInstruction: getSystemInstruction(),
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error('Failed to start session catch:', err);
      setStatus({ 
        isConnecting: false, 
        isConnected: false, 
        error: err.message || 'Failed to connect.' 
      });
      cleanup();
    }
  };

  const toggleSession = () => {
    if (status.isConnected) {
      cleanup();
    } else {
      startSession();
    }
  };

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center py-12 px-4 sm:px-8 relative">
      {window.aistudio && (
        <button 
          onClick={changeApiKey}
          className="absolute top-4 right-4 text-xs font-mono text-slate-500 hover:text-white border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-lg transition-all"
        >
          Change API Key
        </button>
      )}

      {/* Header */}
      <header className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-900/40">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Polyglot AI Coach
          </h1>
        </div>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Immersive language practice with real-time feedback and situational roleplay.
        </p>
      </header>

      {/* Main Interaction Area */}
      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-12">
        
        {/* Left Column: Controls (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <ControlPanel
            isConnecting={status.isConnecting}
            isConnected={status.isConnected}
            onToggle={toggleSession}
            selectedVoice={voice}
            onVoiceChange={setVoice}
            selectedLanguage={language}
            onLanguageChange={setLanguage}
            selectedMode={mode}
            onModeChange={setMode}
            selectedSituation={situation}
            onSituationChange={setSituation}
          />

          <div className="flex flex-col gap-4 p-6 bg-slate-800/30 rounded-2xl border border-slate-700/50 flex-grow min-h-[200px]">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Signal</span>
              <div className="flex gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                 <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse delay-75"></div>
              </div>
            </div>
            <div className="space-y-2 flex flex-col justify-center h-full">
              <AudioVisualizer analyser={inputAnalyserRef.current} isActive={status.isConnected} color="#3b82f6" />
              <AudioVisualizer analyser={outputAnalyserRef.current} isActive={status.isConnected} color="#6366f1" />
            </div>
          </div>
        </div>

        {/* Right Column: Conversation (8 cols) -> Split into Transcripts and Suggestions */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Transcript Area (2/3 width on md) */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider px-1">Live Transcript</h2>
              {transcriptions.length > 0 && (
                <button 
                  onClick={() => setTranscriptions([])}
                  className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
                >
                  CLEAR
                </button>
              )}
            </div>
            
            <TranscriptionView entries={transcriptions} />
            
            {status.error && (
              <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-400 text-sm flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex flex-col gap-1">
                   <strong className="font-semibold">Connection Error</strong>
                   <p className="text-xs opacity-90">{status.error}</p>
                   {window.aistudio && (
                      <button onClick={changeApiKey} className="text-xs underline hover:text-white mt-1 text-left">Update API Key</button>
                   )}
                </div>
              </div>
            )}
          </div>

          {/* Suggestions Area (1/3 width on md) */}
          <div className="md:col-span-1 h-full min-h-[300px]">
             <SuggestionPanel 
                suggestions={suggestions} 
                isLoading={isGeneratingSuggestions} 
                onSelect={() => {}} 
             />
          </div>
        </div>
      </main>

      {/* Professional Profile Sections (Still relevant as the 'Persona' user might be) */}
      <SkillsAndInterests />
      <WorkExperience />
      <Education />
      <ProjectShowcase />
      <Testimonials />
      <ContactSection />
    </div>
  );
};

export default App;
