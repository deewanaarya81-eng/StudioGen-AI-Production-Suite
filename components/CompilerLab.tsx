
import React, { useState } from 'react';
import { GeneratedAsset, ProjectVersion, ExportProfile, ExportProfileId } from '../types';
import { compileMasterProduction } from '../services/geminiService';

interface CompilerLabProps {
  assets: GeneratedAsset[];
  onAssetGenerated: (asset: GeneratedAsset) => void;
  versions: ProjectVersion[];
  onAddVersion: (label: string) => void;
  onRestoreVersion: (version: ProjectVersion) => void;
}

const exportProfiles: ExportProfile[] = [
  { 
    id: 'youtube', 
    name: 'YouTube Optimized', 
    description: '4K HDR mastering with automatic chapter markers and SEO tagging.',
    aspectRatio: '16:9',
    resolution: '4K',
    features: ['HDR Color', 'Chapter Map', 'SEO Tags']
  },
  { 
    id: 'tiktok', 
    name: 'TikTok Series', 
    description: '9:16 vertical orientation with hook-first pacing and dynamic bold captions.',
    aspectRatio: '9:16',
    resolution: '1080p',
    features: ['Hook-First', 'Auto-Captions', 'Retention AI']
  },
  { 
    id: 'educational', 
    name: 'Educational / Tutorial', 
    description: 'Slower pacing with detailed on-screen callouts and high-fidelity narration.',
    aspectRatio: '16:9',
    resolution: '1080p',
    features: ['Slow Pace', 'Detail Overlay', 'Pro Audio']
  },
  { 
    id: 'documentary', 
    name: 'Documentary Master', 
    description: 'Cinematic color grading with a focus on deep narration and grain matching.',
    aspectRatio: '16:9',
    resolution: '4K',
    features: ['Cinematic LUT', 'Grain Match', 'Pro Master']
  },
  { 
    id: 'social_mix', 
    name: 'Social Media Mix', 
    description: 'One-click parallel export to 16:9, 9:16, and 1:1 formats.',
    aspectRatio: 'multi',
    resolution: '1080p',
    features: ['Multi-Aspect', 'Bulk Render', 'Asset Pack']
  }
];

const CompilerLab: React.FC<CompilerLabProps> = ({ assets, onAssetGenerated, versions, onAddVersion, onRestoreVersion }) => {
  const videoAssets = assets.filter(a => a.type === 'video');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileStatus, setCompileStatus] = useState('');
  const [masterResult, setMasterResult] = useState<any>(null);
  const [activeProfile, setActiveProfile] = useState<ExportProfile>(exportProfiles[0]);
  
  const [settings, setSettings] = useState({
    transition: 'Kinetic Dissolve',
    grading: 'Cinematic Teale',
    levelAudio: true,
    smartEditing: true,
    captionStyle: 'Minimal'
  });

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSnapshot = () => {
    const label = prompt("Enter version label (e.g., 'Initial Draft', 'Final Grade'):");
    if (label) onAddVersion(label);
  };

  const handleCompile = async () => {
    if (selectedIds.length === 0) return;
    setIsCompiling(true);
    setMasterResult(null);
    
    const selectedAssets = videoAssets.filter(a => selectedIds.includes(a.id));
    
    try {
      setCompileStatus(`Initializing ${activeProfile.name} profile...`);
      await new Promise(r => setTimeout(r, 1000));
      
      if (activeProfile.id === 'social_mix') {
        setCompileStatus('Parallel Engines: Creating 16:9, 9:16, and 1:1 instances...');
        await new Promise(r => setTimeout(r, 2000));
      }

      setCompileStatus(`AI Directing: Optimizing pacing for ${activeProfile.id}...`);
      await new Promise(r => setTimeout(r, 2000));

      setCompileStatus('Final Encoding: Rendering Master Stream...');
      const result = await compileMasterProduction(selectedAssets, { ...settings, profile: activeProfile });
      
      const masterAsset: GeneratedAsset = {
        id: `master_${Date.now()}`,
        type: 'master_production',
        url: selectedAssets[0].url, 
        prompt: `Master compiled using ${activeProfile.name} profile.`,
        label: `Master_${activeProfile.id.toUpperCase()}_${new Date().toLocaleDateString()}`,
        timestamp: Date.now(),
        assets: {
          segments: selectedIds
        }
      };

      onAssetGenerated(masterAsset);
      setMasterResult(result);
      
    } catch (error) {
      alert("Mastering Error: Neural node failed.");
    } finally {
      setIsCompiling(false);
      setCompileStatus('');
    }
  };

  return (
    <section className="bg-slate-900/50 rounded-[2.5rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-8xl grayscale">🎞️</div>

      <div className="relative z-10">
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black text-white mb-2">Master Production Engine</h2>
            <p className="text-slate-400 max-w-md">Compile segments into platform-optimized master productions.</p>
          </div>
          <div className="flex gap-3">
             <button 
               onClick={handleSnapshot}
               className="bg-slate-950 px-4 py-2 rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all"
             >
               📸 Snapshot
             </button>
             {masterResult && (
               <div className="bg-green-500/10 text-green-400 px-4 py-2 rounded-xl border border-green-500/20 text-[10px] font-black uppercase tracking-widest">
                 Master Ready
               </div>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-3 space-y-8">
            {/* Export Profile Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exportProfiles.map(profile => (
                <button
                  key={profile.id}
                  onClick={() => setActiveProfile(profile)}
                  className={`p-6 rounded-2xl border-2 text-left transition-all relative group overflow-hidden ${
                    activeProfile.id === profile.id
                      ? 'bg-indigo-600/10 border-indigo-500 shadow-xl shadow-indigo-500/10'
                      : 'bg-slate-950/50 border-white/5 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${activeProfile.id === profile.id ? 'text-indigo-400' : 'text-slate-500'}`}>
                      {profile.id === 'social_mix' ? '🔥 MIX' : 'PROFILE'}
                    </span>
                    <span className="text-[10px] font-black text-slate-600 font-mono">{profile.resolution}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2">{profile.name}</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed mb-4 line-clamp-2">{profile.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.features.map(f => (
                      <span key={f} className="text-[8px] font-black px-1.5 py-0.5 bg-indigo-500/10 rounded-md text-indigo-300 uppercase">{f}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-slate-950/50 p-8 rounded-[2rem] border border-white/5 min-h-[350px] flex flex-col shadow-inner">
              <div className="flex items-center justify-between mb-8 px-2">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mastering Timeline</h3>
                {selectedIds.length > 0 && (
                  <button onClick={() => setSelectedIds([])} className="text-[10px] text-red-400 font-black hover:text-red-300">RESET</button>
                )}
              </div>
              
              {selectedIds.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center opacity-30 border-2 border-dashed border-white/5 rounded-2xl m-4">
                  <span className="text-5xl mb-4">🧩</span>
                  <p className="text-xs font-bold uppercase tracking-widest text-center max-w-xs">Sequence segments to begin {activeProfile.name} production</p>
                </div>
              ) : (
                <div className="flex items-center gap-6 overflow-x-auto pb-6 px-2 custom-scrollbar">
                  {selectedIds.map((id, idx) => {
                    const asset = videoAssets.find(a => a.id === id);
                    return (
                      <div key={id} className="relative group shrink-0 w-56 bg-slate-900 rounded-[1.5rem] border-2 border-indigo-500/40 overflow-hidden shadow-2xl hover:scale-105 transition-all">
                        <div className="relative h-32">
                          <video src={asset?.url} className="w-full h-full object-cover opacity-70" />
                          <div className="absolute top-3 left-3 bg-black/60 px-2 py-1 rounded text-[8px] font-black text-white">#{idx + 1}</div>
                        </div>
                        <div className="p-4 bg-slate-950/80">
                          <p className="text-[10px] font-black text-white truncate mb-2">{asset?.label}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] text-slate-500 font-bold">~15s</span>
                            <button onClick={() => toggleSelection(id)} className="text-[9px] text-red-500 font-black hover:bg-red-500/10 px-2 py-1 rounded">REMOVE</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {masterResult && (
                <div className="mt-8 pt-8 border-t border-white/5 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Platform Spec Sheet</h4>
                    <span className="text-[9px] font-black text-slate-600 font-mono uppercase">Master Stream: {activeProfile.id.toUpperCase()}</span>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">{masterResult.manifest}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <SpecItem label="Target Pacing" value={activeProfile.id === 'tiktok' ? 'FAST/HOOK-DRIVEN' : 'STEADY/NARRATIVE'} />
                        <SpecItem label="Loudness" value="-14 LUFS" />
                        <SpecItem label="Color Grade" value={settings.grading} />
                        <SpecItem label="Subtitles" value={activeProfile.id === 'tiktok' ? 'BOLD KINETIC' : 'MINIMAL SRT'} />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Automatic Chapter Mapping</p>
                      <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                        {masterResult.chapters.map((chap: any, i: number) => (
                          <div key={i} className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all cursor-default">
                            <span className="text-xs font-black text-indigo-500 font-mono w-12">{chap.timestamp}</span>
                            <div className="flex-1">
                              <p className="text-xs font-bold text-slate-200">{chap.title}</p>
                              <p className="text-[9px] text-slate-600 mt-0.5">{chap.description || 'Transition point generated'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-950/80 rounded-[2rem] p-8 border border-white/5 space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/20" />
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Master HUD</h3>
              
              <div className="space-y-6">
                <div className="p-5 bg-slate-900 rounded-2xl border border-white/5 space-y-4">
                   <div className="flex items-center justify-between text-[9px] font-black text-slate-600 uppercase">
                     <span>Encoding Profile</span>
                     <span className="text-white">{activeProfile.resolution} HDR</span>
                   </div>
                   <div className="flex items-center justify-between text-[9px] font-black text-slate-600 uppercase">
                     <span>Neural Match</span>
                     <span className="text-indigo-400">ACTIVE</span>
                   </div>
                </div>

                <div className="space-y-4">
                  <HUDOption label="Transitions" value={settings.transition} />
                  <HUDOption label="LUT Master" value={settings.grading} />
                </div>

                <button
                  onClick={handleCompile}
                  disabled={isCompiling || selectedIds.length === 0}
                  className={`w-full py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all relative z-10 ${
                    isCompiling || selectedIds.length === 0
                      ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-2xl shadow-indigo-500/30 active:scale-95'
                  }`}
                >
                  {isCompiling ? 'MASTERING STREAM...' : 'START MASTERING'}
                </button>
              </div>
            </div>

            {isCompiling && (
              <div className="p-6 bg-indigo-600/10 rounded-[2rem] border border-indigo-500/30 animate-pulse">
                <p className="text-xs text-white font-medium mb-4">{compileStatus}</p>
                {activeProfile.id === 'social_mix' ? (
                  <div className="space-y-3">
                    <BatchProgressBar label="16:9 Master" progress={45} />
                    <BatchProgressBar label="9:16 Vertical" progress={32} />
                  </div>
                ) : (
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 animate-[loading_1.5s_ease-in-out_infinite]" style={{width: '70%'}}></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const SpecItem: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-[10px] font-bold text-slate-300 truncate">{value}</p>
  </div>
);

const HUDOption: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between text-[10px] border-b border-white/5 pb-2">
    <span className="text-slate-500 font-bold uppercase">{label}</span>
    <span className="text-slate-200 font-black">{value}</span>
  </div>
);

const BatchProgressBar: React.FC<{ label: string, progress: number }> = ({ label, progress }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[8px] font-black uppercase text-slate-500">
      <span>{label}</span>
      <span>{progress}%</span>
    </div>
    <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
      <div className="h-full bg-indigo-500" style={{ width: `${progress}%` }}></div>
    </div>
  </div>
);

export default CompilerLab;
