
import React, { useState } from 'react';
import { segmentScript, generateSpeech, generateImage, startVideoGeneration, pollVideoStatus, generateSubtitles } from '../services/geminiService';
import { ScriptSegment } from '../types';

const SegmenterLab: React.FC = () => {
  const [scriptText, setScriptText] = useState('');
  const [targetDuration, setTargetDuration] = useState(3);
  const [isProcessing, setIsProcessing] = useState(false);
  const [segments, setSegments] = useState<ScriptSegment[]>([]);

  const handleSegment = async () => {
    if (!scriptText.trim()) return;
    setIsProcessing(true);
    setSegments([]);
    try {
      const result = await segmentScript(scriptText, targetDuration);
      setSegments(result.map((s: any, idx: number) => ({
        ...s,
        id: `seg_${Date.now()}_${idx}`,
        productionStatus: 'idle'
      })));
    } catch (error) {
      alert("Error splitting content.");
    } finally {
      setIsProcessing(false);
    }
  };

  const produceFullMedia = async (segmentId: string) => {
    const segment = segments.find(s => s.id === segmentId);
    if (!segment) return;

    const updateStatus = (status: ScriptSegment['productionStatus'], assets?: any) => {
      setSegments(prev => prev.map(s => s.id === segmentId ? { ...s, productionStatus: status, producedAssets: assets ? { ...s.producedAssets, ...assets } : s.producedAssets } : s));
    };

    try {
      // 1. Narration
      updateStatus('narration');
      const audio = await generateSpeech(segment.content);
      const subtitles = await generateSubtitles(segment.content);
      updateStatus('visuals', { audio, subtitles });

      // 2. Visuals
      const imagePrompt = `Cinematic keyframe for: ${segment.title}. Detailed, 8k, professional lighting.`;
      const image = await generateImage(imagePrompt);
      updateStatus('motion', { image });

      // 3. Motion
      let operation = await startVideoGeneration(`Cinematic animation of this scene: ${segment.title}`, image);
      while (!operation.done) {
        await new Promise(r => setTimeout(r, 8000));
        operation = await pollVideoStatus(operation);
      }
      
      const video = `${operation.response?.generatedVideos?.[0]?.video?.uri}&key=${process.env.API_KEY}`;
      updateStatus('complete', { video });
      
    } catch (error) {
      console.error(error);
      updateStatus('error');
    }
  };

  return (
    <section className="bg-slate-900/50 rounded-[2rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-8xl grayscale">✂️</div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-white mb-2">Content Segmenter</h2>
            <p className="text-slate-400 max-w-md">Forge complete media bundles from raw long-form content.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Targeting</h3>
              <div className="space-y-4">
                <input 
                  type="range" min="1" max="10" step="0.5"
                  value={targetDuration}
                  onChange={(e) => setTargetDuration(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 bg-slate-800 rounded-lg appearance-none h-1.5"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>1m</span>
                  <span className="text-indigo-400 font-bold">{targetDuration}m</span>
                  <span>10m</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleSegment}
              disabled={isProcessing || !scriptText.trim()}
              className="w-full py-4 rounded-xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-indigo-400 hover:text-white transition-all shadow-xl shadow-indigo-500/10"
            >
              {isProcessing ? 'Segmenting...' : 'Split Script'}
            </button>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-slate-950/80 border border-white/10 rounded-[1.5rem] p-8">
              <textarea
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                placeholder="Paste long-form script here..."
                className="w-full h-48 bg-transparent text-slate-200 placeholder-slate-700 focus:outline-none transition-all resize-none text-sm leading-relaxed"
              />
            </div>

            <div className="grid gap-6">
              {segments.map((seg) => (
                <div key={seg.id} className="bg-slate-800/40 border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                        seg.productionStatus === 'complete' ? 'bg-green-500' : 'bg-indigo-600'
                      }`}>
                        {seg.productionStatus === 'idle' && <span className="text-white font-bold text-xs">#</span>}
                        {seg.productionStatus === 'narration' && <span className="animate-pulse text-white">🎙️</span>}
                        {seg.productionStatus === 'visuals' && <span className="animate-pulse text-white">🖼️</span>}
                        {seg.productionStatus === 'motion' && <span className="animate-spin text-white">🎬</span>}
                        {seg.productionStatus === 'complete' && <span className="text-white">✅</span>}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{seg.title}</h4>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">
                          Status: {seg.productionStatus}
                        </p>
                      </div>
                    </div>
                    
                    {seg.productionStatus === 'idle' ? (
                      <button 
                        onClick={() => produceFullMedia(seg.id)}
                        className="px-4 py-2 bg-white text-black text-[10px] font-black rounded-lg hover:bg-indigo-400 hover:text-white transition-all shadow-lg"
                      >
                        INITIATE AI PRODUCTION
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        {seg.producedAssets?.video && (
                           <a href={seg.producedAssets.video} target="_blank" className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg text-xs hover:bg-indigo-600 hover:text-white transition-all">Download Bundle</a>
                        )}
                        {seg.productionStatus === 'error' && <span className="text-red-500 text-[10px] font-black">PRODUCTION FAILED</span>}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">{seg.content}</p>
                  
                  {seg.productionStatus !== 'idle' && seg.productionStatus !== 'complete' && (
                    <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                      <div className={`h-full bg-indigo-500 transition-all duration-1000 ${
                        seg.productionStatus === 'narration' ? 'w-1/4' :
                        seg.productionStatus === 'visuals' ? 'w-1/2' :
                        seg.productionStatus === 'motion' ? 'w-3/4' : 'w-0'
                      }`} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SegmenterLab;
