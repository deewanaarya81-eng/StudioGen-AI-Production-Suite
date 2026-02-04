
import React, { useState } from 'react';
import { generateDialogue } from '../services/geminiService';
import { GeneratedAsset } from '../types';
import { audioBufferToWav } from '../utils/audio';

interface DialogueLabProps {
  onAssetGenerated: (asset: GeneratedAsset) => void;
}

const DialogueLab: React.FC<DialogueLabProps> = ({ onAssetGenerated }) => {
  const [prompt, setPrompt] = useState(`Joe: Hey Jane, have you seen the new AI models?
Jane: I have Joe, the quality is absolutely stunning!`);
  const [isGenerating, setIsGenerating] = useState(false);

  const [s1, setS1] = useState({ name: 'Joe', voice: 'Kore' });
  const [s2, setS2] = useState({ name: 'Jane', voice: 'Puck' });

  const voiceOptions = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const audioBuffer = await generateDialogue(prompt, s1, s2);
      
      const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start();

      const wavBlob = audioBufferToWav(audioBuffer);
      const audioUrl = URL.createObjectURL(wavBlob);
      
      onAssetGenerated({
        id: `dialogue_${Date.now()}`,
        type: 'audio',
        url: audioUrl,
        prompt: prompt.substring(0, 50) + (prompt.length > 50 ? '...' : ''),
        label: `Dialogue_${new Date().toLocaleTimeString()}`,
        timestamp: Date.now()
      });
      
    } catch (error) {
      console.error(error);
      alert("Failed to generate dialogue.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="bg-slate-900/50 rounded-[2rem] p-10 border border-white/5 shadow-2xl overflow-hidden group">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-white mb-2">Dialogue Engine</h2>
          <p className="text-slate-400 max-w-sm">Craft multi-character conversations with distinct personas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-64 bg-slate-950 border border-white/10 rounded-[1.5rem] p-8 text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none shadow-inner font-mono text-sm leading-relaxed"
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl ${
              isGenerating || !prompt.trim()
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20'
            }`}
          >
            {isGenerating ? 'Synthesizing Dialogue...' : 'Forge Conversation'}
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-950/80 rounded-[1.5rem] p-8 border border-white/5 space-y-8">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Speaker Config</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <input 
                  value={s1.name} 
                  onChange={e => setS1({...s1, name: e.target.value})}
                  className="w-full bg-slate-900 border border-white/5 rounded-lg px-3 py-2 text-xs text-white"
                  placeholder="Speaker 1 Name"
                />
                <select 
                  value={s1.voice} 
                  onChange={e => setS1({...s1, voice: e.target.value})}
                  className="w-full bg-slate-900 border border-white/5 rounded-lg px-3 py-2 text-xs text-slate-400"
                >
                  {voiceOptions.map(v => <option key={v}>{v}</option>)}
                </select>
              </div>

              <div className="h-px bg-white/5" />

              <div className="space-y-2">
                <input 
                  value={s2.name} 
                  onChange={e => setS2({...s2, name: e.target.value})}
                  className="w-full bg-slate-900 border border-white/5 rounded-lg px-3 py-2 text-xs text-white"
                  placeholder="Speaker 2 Name"
                />
                <select 
                  value={s2.voice} 
                  onChange={e => setS2({...s2, voice: e.target.value})}
                  className="w-full bg-slate-900 border border-white/5 rounded-lg px-3 py-2 text-xs text-slate-400"
                >
                  {voiceOptions.map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-slate-950/50 rounded-[1.5rem] border border-white/5">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Usage</p>
            <p className="text-slate-400 text-[10px] leading-relaxed">
              Format your script with <span className="text-white">Name:</span> prefixes. The engine will automatically switch voices based on the speaker mapping.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DialogueLab;
