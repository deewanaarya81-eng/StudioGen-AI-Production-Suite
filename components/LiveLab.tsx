
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { decode, decodeAudioData, encode } from '../utils/audio';

const LiveLab: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState<{ role: string, text: string }[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const startSession = async () => {
    setIsConnecting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      const outputContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            const source = audioContextRef.current!.createMediaStreamSource(streamRef.current!);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle output transcription
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscription(prev => [...prev, { role: 'ai', text }]);
            }

            // Handle input transcription (user)
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setTranscription(prev => [...prev, { role: 'user', text }]);
            }

            // Handle audio output
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
            if (base64Audio) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputContext.currentTime);
              const buffer = await decodeAudioData(decode(base64Audio), outputContext, 24000, 1);
              const source = outputContext.createBufferSource();
              source.buffer = buffer;
              source.connect(outputContext.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => {
                try { s.stop(); } catch (e) {}
              });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error("Live Error", e);
            stopSession();
          },
          onclose: () => stopSession()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          systemInstruction: 'You are a high-level Creative Director for StudioGen AI. Your goal is to assist the user in real-time with cinematic storytelling, script adjustments, and visual direction. Be insightful, creative, and professional.'
        }
      });
      
      sessionRef.current = await sessionPromise;
    } catch (err) {
      alert("Failed to connect to Live Engine. Check your API key or permissions.");
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch (e) {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    setIsActive(false);
    setIsConnecting(false);
  };

  return (
    <section className="bg-slate-900/50 rounded-[2.5rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden min-h-[600px] flex flex-col animate-in fade-in duration-500">
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-9xl">⚡</div>
      
      <div className="mb-10 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-black text-white mb-2 italic tracking-tighter">Live Studio</h2>
          <p className="text-slate-400 max-w-md text-sm">Conversational neural directing for real-time production brainstorming.</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-white/5">
           <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isActive ? 'DIRECTOR ONLINE' : 'DIRECTOR IDLE'}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-8">
        <div className="flex-1 bg-slate-950/80 rounded-[2rem] border border-white/5 p-8 overflow-y-auto custom-scrollbar flex flex-col gap-6 shadow-inner">
          {transcription.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center opacity-20 text-center space-y-4">
              <span className="text-7xl">🧠</span>
              <p className="font-black uppercase tracking-[0.3em] text-xs">Awaiting Neural Link</p>
            </div>
          ) : (
            transcription.map((t, i) => (
              <div key={i} className={`flex ${t.role === 'ai' ? 'justify-start' : 'justify-end'} animate-in slide-in-from-bottom-2 duration-300`}>
                <div className={`p-5 rounded-2xl max-w-md shadow-lg ${
                  t.role === 'ai' 
                    ? 'bg-indigo-600/10 text-indigo-200 border border-indigo-500/20' 
                    : 'bg-slate-800 text-slate-200 border border-white/5'
                  } text-sm font-medium leading-relaxed`}>
                  <p className="text-[8px] font-black uppercase tracking-widest mb-1 opacity-50">{t.role === 'ai' ? 'Director' : 'You'}</p>
                  {t.text}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-center gap-8 py-4">
          <button
            onClick={isActive ? stopSession : startSession}
            disabled={isConnecting}
            className={`w-28 h-28 rounded-full flex items-center justify-center transition-all shadow-2xl relative group ${
              isActive 
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20 active:scale-95' 
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/30 active:scale-95'
            }`}
          >
            {isConnecting ? (
              <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="text-4xl text-white transform group-hover:scale-110 transition-transform">
                {isActive ? '⏹️' : '🎙️'}
              </span>
            )}
            {isActive && <div className="absolute -inset-2 border-2 border-red-500/30 rounded-full animate-ping pointer-events-none" />}
          </button>
          
          <div className="flex flex-col gap-2">
             <span className={`text-xs font-black uppercase tracking-[0.2em] ${isActive ? 'text-green-500' : isConnecting ? 'text-indigo-400' : 'text-slate-600'}`}>
               {isActive ? 'Link established' : isConnecting ? 'Initializing Link...' : 'Link Disconnected'}
             </span>
             <p className="text-[10px] text-slate-500 font-bold max-w-[200px] leading-tight">
               StudioGen Directorial Core v2.5 • PCM 16kHz Duplex Stream
             </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveLab;
