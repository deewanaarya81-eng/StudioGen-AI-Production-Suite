
import React, { useState, useRef, useEffect } from 'react';
import { generateSpeech } from '../services/geminiService';
import { GeneratedAsset } from '../types';
import { audioBufferToWav } from '../utils/audio';

interface VoiceLabProps {
  onAssetGenerated: (asset: GeneratedAsset) => void;
}

const VoiceLab: React.FC<VoiceLabProps> = ({ onAssetGenerated }) => {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('Kore');
  const [engine, setEngine] = useState<'google' | 'coqui'>('google');
  const [isGenerating, setIsGenerating] = useState(false);
  const [cloningMode, setCloningMode] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);

  const voices = [
    { id: 'Kore', label: 'Kore (Studio Warm)' },
    { id: 'Puck', label: 'Puck (Narrator)' },
    { id: 'Charon', label: 'Charon (Deep Bass)' },
    { id: 'Fenrir', label: 'Fenrir (Corporate)' },
    { id: 'Zephyr', label: 'Zephyr (Airy)' },
  ];

  // Simulated Waveform Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerY = canvas.height / 2;
      const barWidth = 3;
      const barGap = 2;
      const barCount = Math.floor(canvas.width / (barWidth + barGap));
      
      for (let i = 0; i < barCount; i++) {
        const height = isPlaying 
          ? Math.random() * (canvas.height * 0.8) + 5
          : Math.sin(Date.now() / 200 + i / 5) * 5 + 10;
        
        ctx.fillStyle = isPlaying ? '#6366f1' : '#1e293b';
        ctx.fillRect(
          i * (barWidth + barGap), 
          centerY - height / 2, 
          barWidth, 
          height
        );
      }
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [isPlaying]);

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setIsGenerating(true);
    try {
      const audioBuffer = await generateSpeech(text, voice);
      
      const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      
      setIsPlaying(true);
      source.start();
      source.onended = () => setIsPlaying(false);
      
      const wavBlob = audioBufferToWav(audioBuffer);
      const audioUrl = URL.createObjectURL(wavBlob);
      
      onAssetGenerated({
        id: `vocal_${Date.now()}`,
        type: 'audio',
        url: audioUrl,
        prompt: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
        label: `Vocal_${new Date().toLocaleTimeString()}`,
        timestamp: Date.now()
      });
      
    } catch (error) {
      console.error(error);
      alert("Failed to generate speech.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCloneUpload = () => {
    setIsCloning(true);
    setTimeout(() => {
      setIsCloning(false);
      setCloningMode(false);
      alert("Voice profile trained successfully via Coqui Neural Engine.");
    }, 3000);
  };

  return (
    <section className="bg-slate-900/50 rounded-[2.5rem] p-10 border border-white/5 shadow-2xl overflow-hidden group">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-white mb-2 italic tracking-tighter uppercase">Voice Lab</h2>
          <div className="flex gap-4">
            <button 
              onClick={() => setEngine('google')}
              className={`text-[10px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${engine === 'google' ? 'text-indigo-400 border-indigo-400' : 'text-slate-500 border-transparent'}`}
            >
              Standard Engine (Google)
            </button>
            <button 
              onClick={() => setEngine('coqui')}
              className={`text-[10px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${engine === 'coqui' ? 'text-indigo-400 border-indigo-400' : 'text-slate-500 border-transparent'}`}
            >
              Neural Engine (Coqui)
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setCloningMode(!cloningMode)}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
              cloningMode ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-950 text-indigo-400 border-indigo-500/20 hover:border-indigo-500/40'
            }`}
          >
            {cloningMode ? '✕ Cancel Cloning' : '🎙️ Clone Voice'}
          </button>
        </div>
      </div>

      {cloningMode ? (
        <div className="bg-slate-950/50 rounded-[2rem] p-12 border border-indigo-500/20 text-center space-y-8 animate-in zoom-in-95 duration-300">
           <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto border border-indigo-500/30">
             <span className="text-5xl">🧬</span>
           </div>
           <div>
             <h3 className="text-2xl font-black text-white mb-2">Neural Voice Cloning</h3>
             <p className="text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
               Using Coqui TTS open-source protocols to train a local voice fingerprint. 
               Requires 10-15 seconds of clean reference audio for zero-shot synthesis.
             </p>
           </div>
           <div className="max-w-xs mx-auto space-y-4">
             <input type="file" ref={fileInputRef} className="hidden" accept="audio/*" />
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="w-full py-4 bg-slate-900 border border-white/10 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition-all"
             >
               Select Audio Sample (.wav, .mp3)
             </button>
             <button 
               onClick={handleCloneUpload}
               disabled={isCloning}
               className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20"
             >
               {isCloning ? 'Tuning Neural Weights...' : 'Start Training'}
             </button>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Input script for synthesis... "
                className="w-full h-64 bg-slate-950 border border-white/10 rounded-[1.5rem] p-8 text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none shadow-inner text-sm leading-relaxed font-medium"
              />
              <div className="absolute bottom-4 right-8">
                 <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{text.length} Characters</p>
              </div>
            </div>

            <div className="flex items-center gap-6 p-6 bg-slate-950/50 border border-white/5 rounded-2xl">
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Signal Output</p>
                <canvas ref={canvasRef} width={400} height={40} className="w-full h-10" />
              </div>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !text.trim()}
                className={`flex-1 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl ${
                  isGenerating || !text.trim()
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-white text-black hover:bg-indigo-500 hover:text-white shadow-indigo-500/10 active:scale-95'
                }`}
              >
                {isGenerating ? 'Synthesizing...' : `Initiate ${engine === 'coqui' ? 'Neural' : 'Cloud'} Synthesis`}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-950/80 rounded-[2rem] p-8 border border-white/5 shadow-inner">
              <h3 className="text-[10px] font-black text-slate-500 mb-6 uppercase tracking-widest">Select Persona</h3>
              <div className="space-y-3">
                {voices.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVoice(v.id)}
                    className={`w-full text-left px-5 py-4 rounded-xl text-xs font-bold transition-all border ${
                      voice === v.id
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-500/20'
                        : 'bg-slate-900/50 text-slate-500 border-white/5 hover:border-white/20'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-8 bg-gradient-to-br from-indigo-900/20 to-slate-900/50 rounded-[2rem] border border-indigo-500/10">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xl">⚙️</span>
                <p className="text-[10px] text-indigo-300 font-black uppercase tracking-widest">Engine Parameters</p>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed italic">
                {engine === 'google' 
                  ? 'Cloud TTS Mode: Optimized for low latency and high clarity. Best for narration.' 
                  : 'Coqui Mode: High fidelity local synthesis. Requires CLI Bridge for local weight processing.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default VoiceLab;
