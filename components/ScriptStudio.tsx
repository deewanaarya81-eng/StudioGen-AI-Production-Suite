
import React, { useState, useEffect } from 'react';
import { generateScriptWithResearch, fetchTrendingTopics } from '../services/geminiService';
import { TrendTopic, Template } from '../types';

const ScriptStudio: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [type, setType] = useState('YouTube Video');
  const [isGenerating, setIsGenerating] = useState(false);
  const [script, setScript] = useState('');
  const [sources, setSources] = useState<any[]>([]);
  const [trends, setTrends] = useState<TrendTopic[]>([]);
  const [isFetchingTrends, setIsFetchingTrends] = useState(false);

  const templates: Template[] = [
    { id: 'exp-1', name: 'Standard Explainer', category: 'explainer', thumbnail: '📚', description: 'Technical & educational step-by-step.' },
    { id: 'vlog-1', name: 'Cinematic Vlog', category: 'vlog', thumbnail: '🤳', description: 'Narrative-heavy, lifestyle focus.' },
    { id: 'doc-1', name: 'Deep Dive Doc', category: 'documentary', thumbnail: '🌍', description: 'Long-form research & journalism.' },
    { id: 'ad-1', name: 'Quick Pitch Ad', category: 'ad', thumbnail: '💰', description: 'High-energy sales & promotion.' },
  ];

  useEffect(() => {
    loadTrends();
  }, []);

  const loadTrends = async () => {
    setIsFetchingTrends(true);
    try {
      const data = await fetchTrendingTopics();
      setTrends(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingTrends(false);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    try {
      const result = await generateScriptWithResearch(topic, type);
      setScript(result.text || '');
      setSources(result.sources || []);
    } catch (error) {
      alert("Failed to generate script.");
    } finally {
      setIsGenerating(false);
    }
  };

  const applyTemplate = (template: Template) => {
    setType(template.name);
    setTopic(`Focus on a ${template.name} regarding...`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetEditor = () => {
    setScript('');
    setTopic('');
  };

  return (
    <section className="bg-slate-900/50 rounded-[2.5rem] p-10 border border-white/5 shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between pb-6 border-b border-white/5">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
             <span className="text-2xl">✍️</span>
           </div>
           <div>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Script Studio</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Neural Research & Grounded Synthesis</p>
           </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase bg-indigo-500/10 text-indigo-400 px-4 py-2 rounded-full border border-indigo-500/20 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            LIVE RESEARCH NODES
          </div>
          {script && (
            <button 
              onClick={resetEditor}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Reset Board
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-1 space-y-6">
          {/* Trend Section */}
          <div className="bg-slate-950/80 p-6 rounded-[2rem] border border-white/5 shadow-inner">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Trends</h3>
              <button onClick={loadTrends} className="text-xs text-indigo-400 hover:text-white transition-colors">↻</button>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
              {isFetchingTrends ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : trends.map((t, i) => (
                <button 
                  key={i} 
                  onClick={() => setTopic(t.topic)}
                  className="w-full text-left group bg-slate-900/40 hover:bg-indigo-500/10 p-3 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all"
                >
                  <p className="text-xs font-bold text-slate-300 group-hover:text-white truncate transition-colors">{t.topic}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[8px] text-slate-600 font-black uppercase">{t.region}</span>
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                      t.potential === 'Viral' ? 'bg-red-500/20 text-red-400' : 'bg-indigo-500/20 text-indigo-400'
                    }`}>{t.potential}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {/* Main Editor / Dashboard */}
          <div className="bg-slate-950/80 border border-white/10 rounded-[2.5rem] p-10 min-h-[600px] flex flex-col shadow-inner">
             {script ? (
               <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col h-full">
                 <div className="flex items-center justify-between mb-10 pb-4 border-b border-white/5">
                   <div>
                     <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Active Master</span>
                     <h3 className="text-2xl font-black text-white italic">{type}</h3>
                   </div>
                   <button className="px-6 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-xl">Copy Script</button>
                 </div>
                 <div className="flex-1 whitespace-pre-wrap leading-relaxed text-slate-300 font-medium font-mono text-sm pr-4 overflow-y-auto custom-scrollbar">
                   {script}
                 </div>
               </div>
             ) : (
               <div className="flex-1 flex flex-col">
                  {/* Top Prompt Section */}
                  <div className="mb-12">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 ml-1">Master Creative Directive</label>
                    <div className="relative group">
                      <textarea
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="What is your creative vision for this piece? (e.g. 'The future of quantum computing in 2030')"
                        className="w-full bg-slate-900 border border-white/10 rounded-2xl px-8 py-6 text-slate-200 text-lg font-medium h-32 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30 transition-all resize-none shadow-inner"
                      />
                      <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !topic.trim()}
                        className="absolute bottom-4 right-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 py-3 rounded-xl transition-all shadow-xl shadow-indigo-500/20 uppercase tracking-widest text-[10px] active:scale-95 disabled:bg-slate-800 disabled:text-slate-600"
                      >
                        {isGenerating ? 'Synthesizing...' : 'Initialize Script'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Blueprint Grid */}
                  <div className="mt-auto">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 ml-1">Cinematic Blueprints</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {templates.map(tmp => (
                        <button 
                          key={tmp.id}
                          onClick={() => applyTemplate(tmp)}
                          className="p-6 bg-slate-900/30 border border-white/5 rounded-3xl text-left hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all group flex gap-5 items-center shadow-lg"
                        >
                          <span className="text-3xl bg-slate-950 w-14 h-14 flex items-center justify-center rounded-2xl border border-white/5 group-hover:scale-110 transition-transform">
                            {tmp.thumbnail}
                          </span>
                          <div>
                            <h4 className="text-md font-bold text-white mb-0.5 group-hover:text-indigo-400 transition-colors">{tmp.name}</h4>
                            <p className="text-[10px] text-slate-500 leading-tight">{tmp.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
               </div>
             )}
          </div>

          {sources.length > 0 && (
            <div className="bg-slate-950/40 rounded-[2rem] p-8 border border-white/5 animate-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-indigo-500">⚡</span>
                <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Verified Grounding Sources</h4>
              </div>
              <div className="flex flex-wrap gap-4">
                {sources.map((chunk, i) => (
                  chunk.web && (
                    <a 
                      key={i} 
                      href={chunk.web.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-2.5 bg-slate-900 border border-white/5 rounded-xl text-[10px] text-indigo-400 hover:text-white hover:bg-indigo-600 transition-all shadow-lg group"
                    >
                      <span className="opacity-40 group-hover:opacity-100">🔗</span>
                      <span className="max-w-[220px] truncate font-bold uppercase tracking-tight">{chunk.web.title || chunk.web.uri}</span>
                    </a>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ScriptStudio;
