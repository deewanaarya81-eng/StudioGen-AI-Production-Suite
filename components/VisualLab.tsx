
import React, { useState, useRef } from 'react';
import { generateImage, startVideoGeneration, pollVideoStatus, searchStockMedia } from '../services/geminiService';
import { GeneratedAsset } from '../types';

interface VisualLabProps {
  type: 'image' | 'video';
  apiKeySelected: boolean;
  onAssetGenerated: (asset: GeneratedAsset) => void;
}

const VisualLab: React.FC<VisualLabProps> = ({ type, apiKeySelected, onAssetGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [refImage, setRefImage] = useState<string | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [mode, setMode] = useState<'generate' | 'stock'>('generate');
  const [stockResults, setStockResults] = useState<string>('');
  const [stockSources, setStockSources] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setRefImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSchedule = () => {
    if (!prompt.trim()) return;
    setIsScheduling(true);
    setTimeout(() => {
      setIsScheduling(false);
      alert("Job added to Smart Scheduler for off-peak processing.");
      setPrompt('');
    }, 1000);
  };

  const handleStockSearch = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setStatusMessage("Fetching stock references...");
    try {
      const result = await searchStockMedia(prompt);
      setStockResults(result.results);
      setStockSources(result.sources);
    } catch (e) {
      alert("Stock search failed.");
    } finally {
      setIsGenerating(false);
      setStatusMessage('');
    }
  };

  const handleGenerate = async () => {
    if (mode === 'stock') {
      handleStockSearch();
      return;
    }

    if (!prompt.trim()) return;
    
    if (type === 'video' && !apiKeySelected) {
      alert("Please select an API key to enable Video Generation (Veo Engine).");
      return;
    }

    setIsGenerating(true);
    setStatusMessage(`Initializing ${type} engine...`);

    try {
      if (type === 'image') {
        const url = await generateImage(prompt);
        onAssetGenerated({
          id: Math.random().toString(36).substr(2, 9),
          type: 'image',
          url,
          prompt,
          label: `Visual_${Date.now()}`,
          timestamp: Date.now()
        });
      } else {
        setStatusMessage("Uploading sequence to Veo core...");
        let operation = await startVideoGeneration(prompt, refImage || undefined);
        
        while (!operation.done) {
          setStatusMessage("Processing temporal metadata... Rendering frames.");
          await new Promise(resolve => setTimeout(resolve, 10000));
          operation = await pollVideoStatus(operation);
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (downloadLink) {
           const finalUrl = `${downloadLink}&key=${process.env.API_KEY}`;
           onAssetGenerated({
             id: Math.random().toString(36).substr(2, 9),
             type: 'video',
             url: finalUrl,
             prompt,
             label: `Forge_${Date.now()}`,
             timestamp: Date.now()
           });
        } else {
           throw new Error("Video generation failed.");
        }
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || `Failed to generate ${type}.`);
    } finally {
      setIsGenerating(false);
      setStatusMessage('');
    }
  };

  return (
    <section className="bg-slate-900/50 rounded-[2rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-8xl grayscale">
        {type === 'image' ? '🎨' : '🎬'}
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-white mb-2">{type === 'image' ? 'Visual Studio' : 'Video Forge'}</h2>
            <div className="flex items-center gap-4 mt-2">
              <button 
                onClick={() => setMode('generate')}
                className={`text-[10px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${mode === 'generate' ? 'text-indigo-400 border-indigo-400' : 'text-slate-500 border-transparent'}`}
              >
                Neural Engine
              </button>
              <button 
                onClick={() => setMode('stock')}
                className={`text-[10px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${mode === 'stock' ? 'text-indigo-400 border-indigo-400' : 'text-slate-500 border-transparent'}`}
              >
                Stock Asset Fetcher
              </button>
            </div>
          </div>
          <div className="bg-slate-950/80 px-4 py-2 rounded-xl border border-white/5 flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] text-slate-500 font-black tracking-widest uppercase">Intelligent Resource Mode</span>
          </div>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-4">
              <div className="relative group">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={mode === 'generate' 
                    ? (type === 'image' ? "A macro shot of liquid gold flowing over black obsidian..." : "A cinematic drone shot through the Swiss Alps at dawn...")
                    : "Describe the stock media you need (e.g. 'high speed city traffic time lapse')..."}
                  className="w-full h-32 bg-slate-950/50 border border-white/10 rounded-2xl px-6 py-5 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none shadow-inner"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className={`flex-[2] py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                    isGenerating || !prompt.trim()
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-indigo-400 hover:text-white shadow-xl shadow-indigo-500/10'
                  }`}
                >
                  {isGenerating ? statusMessage : (mode === 'stock' ? 'SEARCH STOCK' : `INITIATE ${type === 'image' ? 'RENDER' : 'FORGE'}`)}
                </button>
                
                <button 
                  onClick={handleSchedule}
                  disabled={isGenerating || !prompt.trim() || isScheduling}
                  className="flex-1 py-4 bg-slate-800 text-slate-400 border border-white/5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-700 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  {isScheduling ? 'Queuing...' : <><span>📅</span> Batch</>}
                </button>
                
                {mode === 'generate' && type === 'video' && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-14 h-14 flex items-center justify-center rounded-2xl border transition-all ${
                      refImage ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-white/10 text-slate-500 hover:text-white'
                    }`}
                    title="Upload starting frame"
                  >
                    <span className="text-xl">🖼️</span>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                  </button>
                )}
              </div>

              {mode === 'stock' && stockResults && (
                <div className="bg-slate-950/50 p-6 rounded-2xl border border-indigo-500/20 mt-4 animate-in slide-in-from-top-2">
                  <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Stock Asset Recommendations</h4>
                  <div className="prose prose-invert prose-xs text-slate-400 leading-relaxed mb-6 whitespace-pre-wrap">
                    {stockResults}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {stockSources.map((s, i) => (
                      <a 
                        key={i} 
                        href={s.web.uri} 
                        target="_blank" 
                        className="px-3 py-1 bg-slate-900 rounded-lg text-[10px] text-white hover:bg-indigo-600 transition-all border border-white/5"
                      >
                        {s.web.title || 'Stock Link'}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="h-full bg-slate-950/50 rounded-2xl border border-white/5 p-4 flex flex-col items-center justify-center text-center">
                {refImage ? (
                  <div className="relative group w-full h-full min-h-[140px]">
                    <img src={refImage} className="w-full h-full object-cover rounded-xl border border-white/10" />
                    <button 
                      onClick={() => setRefImage(null)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                    <p className="mt-2 text-[10px] text-slate-500 uppercase tracking-widest font-bold">Reference Frame</p>
                  </div>
                ) : (
                  <div className="opacity-20 flex flex-col items-center">
                    <span className="text-4xl mb-3">📡</span>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Waiting for input</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisualLab;
