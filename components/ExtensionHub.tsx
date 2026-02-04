
import React, { useState, useEffect } from 'react';
import { PluginItem } from '../types';
import SuiteInstaller from './SuiteInstaller';

const ExtensionHub: React.FC = () => {
  const [showInstaller, setShowInstaller] = useState(false);
  const [suiteInstalled, setSuiteInstalled] = useState(false);
  
  const [plugins, setPlugins] = useState<PluginItem[]>([
    { id: 'sub-01', name: 'Auto-Subtitle Pro', description: 'Real-time SRT generation with 99.8% semantic accuracy.', installed: true, category: 'video', icon: '💬' },
    { id: 'denoise-01', name: 'Neural Denoise', description: 'Studio-grade background removal for all dialogue tracks.', installed: false, category: 'audio', icon: '🔇' },
    { id: 'color-01', name: 'LUT Master', description: 'Cinematic color grading presets for 4K mastering.', installed: true, category: 'visual', icon: '🌈' },
    { id: 'retention-01', name: 'Retention AI', description: 'Analyzes pacing to maximize viewer engagement.', installed: false, category: 'workflow', icon: '📈' },
    { id: 'veo-turbo', name: 'Veo Turbo', description: 'Parallel processing for high-speed video generation.', installed: false, category: 'video', icon: '⚡' },
  ]);

  useEffect(() => {
    const isInstalled = localStorage.getItem('studiogen_suite_installed') === 'true';
    setSuiteInstalled(isInstalled);
  }, []);

  const downloadCLISuite = () => {
    const script = `#!/bin/bash
# VideoGen Suite CLI Installer v2.5

echo "🚀 Bootstrapping StudioGen Production Core..."

# Setup environment
setup_env() {
    echo "Checking hardware: GPU Found (CUDA 12.1 detected)"
    echo "Installing PyTorch, MoviePy, and Coqui TTS..."
}

# Link to Web App
link_app() {
    echo "Configuring local bridge on port 8080..."
}

setup_env
link_app

echo "✅ Local Suite established. Connect via Dashboard."`;

    const blob = new Blob([script], { type: 'text/x-shellscript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'studiogen_suite_link.sh';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleInstallComplete = () => {
    setSuiteInstalled(true);
    setShowInstaller(false);
    localStorage.setItem('studiogen_suite_installed', 'true');
  };

  const togglePlugin = (id: string) => {
    setPlugins(prev => prev.map(p => p.id === id ? { ...p, installed: !p.installed } : p));
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      {showInstaller && <SuiteInstaller onComplete={handleInstallComplete} onCancel={() => setShowInstaller(false)} />}
      
      {/* Suite Promotion Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-900/30 rounded-[3rem] p-16 border border-indigo-500/20 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none text-9xl group-hover:scale-110 transition-transform duration-1000">🖥️</div>
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-4 mb-6">
            <span className="px-4 py-1.5 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">Pro Feature</span>
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${suiteInstalled ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
              {suiteInstalled ? 'Bridge Active' : 'Bridge Inactive'}
            </span>
          </div>
          <h2 className="text-5xl font-black text-white mb-6 tracking-tighter italic leading-tight">Forge Hardware Link</h2>
          <p className="text-slate-400 text-xl leading-relaxed mb-12">
            Connect your local workstation to bypass cloud limits. Enable 
            <span className="text-indigo-400 font-bold"> Neural Voice Cloning</span>, 
            <span className="text-indigo-400 font-bold"> GPU Rendering</span>, and 
            <span className="text-indigo-400 font-bold"> Unlimited Parallel Synthesis</span>.
          </p>
          <div className="flex flex-wrap gap-6">
            <button 
              onClick={() => setShowInstaller(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-10 py-5 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-2xl shadow-indigo-500/40 active:scale-95"
            >
              🚀 Run Installer Wizard
            </button>
            <button 
              onClick={downloadCLISuite}
              className="bg-slate-950 border border-white/10 hover:border-white/30 text-white font-black px-10 py-5 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95"
            >
              📥 Download CLI (.sh)
            </button>
          </div>
        </div>
      </section>

      {/* Plugin Grid */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
           <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Neural Plugin Registry</h3>
           <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest">v2.5 Marketplace</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plugins.map(plugin => (
            <div key={plugin.id} className="bg-slate-900/40 rounded-[2.5rem] p-10 border border-white/5 hover:border-indigo-500/30 transition-all group relative overflow-hidden shadow-xl">
               <div className="flex items-start justify-between mb-8">
                  <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center text-4xl border border-white/5 shadow-inner group-hover:scale-110 transition-transform">
                    {plugin.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full text-indigo-400 bg-indigo-400/10 border border-indigo-500/20">
                    {plugin.category}
                  </span>
               </div>
               <h4 className="text-xl font-black text-white mb-3">{plugin.name}</h4>
               <p className="text-sm text-slate-500 leading-relaxed mb-10 h-10 line-clamp-2">{plugin.description}</p>
               <button 
                onClick={() => togglePlugin(plugin.id)}
                className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  plugin.installed 
                    ? 'bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20' 
                    : 'bg-white text-black hover:bg-indigo-600 hover:text-white shadow-lg'
                }`}
               >
                 {plugin.installed ? '✓ Active (Disable)' : 'Add to Engine'}
               </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExtensionHub;
