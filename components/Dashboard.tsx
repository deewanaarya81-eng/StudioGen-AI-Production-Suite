
import React, { useState, useEffect, useRef } from 'react';
import { AppTab, GeneratedAsset } from '../types';

interface DashboardProps {
  setActiveTab: (tab: AppTab) => void;
  assets: GeneratedAsset[];
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveTab, assets }) => {
  const [cpu, setCpu] = useState(60);
  const [ram, setRam] = useState(75);
  const [storage, setStorage] = useState(20);
  const [logs, setLogs] = useState<string[]>([]);
  
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpu(prev => Math.min(100, Math.max(0, prev + (Math.random() - 0.5) * 8)));
      setRam(prev => Math.min(100, Math.max(0, prev + (Math.random() - 0.5) * 4)));
    }, 2000);

    const logInterval = setInterval(() => {
      const messages = [
        "Syncing neural weights...",
        "Grounded search completed (8ms)",
        "Veo Engine heartbeats active",
        "Asset buffer cleared",
        "Mastering manifest updated",
        "Direct link to Node-01 established",
        "Optimizing 4K encoding profile...",
        "New version snapshot created",
        "TTS Engine: Voice 'Kore' loaded"
      ];
      setLogs(prev => [...prev.slice(-10), `[${new Date().toLocaleTimeString()}] ${messages[Math.floor(Math.random() * messages.length)]}`]);
    }, 4000);

    return () => {
      clearInterval(interval);
      clearInterval(logInterval);
    };
  }, []);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-sans max-w-5xl mx-auto">
      <div className="bg-[#0f172a] border-2 border-slate-800 rounded-3xl overflow-hidden shadow-[0_0_50px_-12px_rgba(99,102,241,0.1)]">
        {/* Header Bar */}
        <div className="bg-slate-800/80 px-10 py-5 flex items-center justify-between border-b border-slate-700 backdrop-blur-md">
          <div className="flex items-center gap-4">
             <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
             <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-300">
               StudioGen Production Core
             </h2>
          </div>
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-600" />
            <div className="w-2 h-2 rounded-full bg-slate-600" />
            <div className="w-2 h-2 rounded-full bg-slate-600" />
          </div>
        </div>

        {/* Navigation Action Row */}
        <div className="bg-slate-900/40 px-10 py-6 flex gap-10 border-b border-slate-800">
          <button onClick={() => setActiveTab('scripts')} className="text-xs font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-all transform hover:scale-105">[New Project]</button>
          <button onClick={() => setActiveTab('extension')} className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all transform hover:scale-105">[Templates]</button>
          <button onClick={() => setActiveTab('collab')} className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all transform hover:scale-105">[My Files]</button>
        </div>

        <div className="p-12 grid grid-cols-1 lg:grid-cols-2 gap-16 bg-[#0b0f19]">
          {/* Quick Actions List */}
          <div className="space-y-12">
            <div>
              <h3 className="text-[10px] font-black text-indigo-500/50 uppercase tracking-[0.3em] mb-8 border-l-2 border-indigo-500 pl-4">Production Hub</h3>
              <ul className="space-y-8">
                <QuickActionItem label="Convert Article to Video" onClick={() => setActiveTab('segmenter')} />
                <QuickActionItem label="YouTube Series (5 parts)" onClick={() => setActiveTab('scripts')} />
                <QuickActionItem label="Instagram / TikTok Reels" onClick={() => setActiveTab('video')} />
                <QuickActionItem label="Neural Directing (Live)" onClick={() => setActiveTab('live')} />
              </ul>
            </div>
            
            {/* System Log */}
            <div className="bg-black/40 rounded-2xl border border-white/5 p-6 h-32 flex flex-col">
               <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-3">Live System Log</p>
               <div ref={logContainerRef} className="flex-1 overflow-y-auto font-mono text-[9px] text-indigo-400/70 space-y-1 custom-scrollbar">
                  {logs.map((log, i) => <div key={i} className="animate-in slide-in-from-left-2">{log}</div>)}
                  {logs.length === 0 && <div className="opacity-30">Awaiting signal...</div>}
               </div>
            </div>
          </div>

          {/* ASCII Resource Monitor */}
          <div className="space-y-10 bg-black/40 p-12 rounded-[2.5rem] border border-white/5 shadow-inner flex flex-col justify-center">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center mb-6">Hardware Telemetry:</h3>
            <div className="space-y-10 font-mono">
              <AsciiMonitor label="CPU" value={cpu} />
              <AsciiMonitor label="VRAM" value={ram} />
              <AsciiMonitor label="IO" value={storage} customLabel="200GB FREE" />
            </div>
            
            <div className="pt-10 border-t border-white/5 mt-10 text-[10px] text-slate-600 uppercase font-black flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse" />
                <span className="tracking-widest">BRIDGE: LOCAL-NODE-01</span>
              </div>
              <span className="text-indigo-500/80 tracking-widest">8ms LATENCY</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pb-20">
        <StatSummary label="Active Assets" value={assets.length.toString()} trend="Local" />
        <StatSummary label="Master Grade" value={assets.filter(a => a.type === 'master_production').length.toString()} trend="Pro" />
        <StatSummary label="GPU Load" value="44%" trend="Optimal" />
        <StatSummary label="Registry" value="1.8 GB" trend="Ready" />
      </div>
    </div>
  );
};

const QuickActionItem: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <li className="group">
    <button 
      onClick={onClick}
      className="flex items-center gap-6 text-2xl font-black text-slate-500 hover:text-white transition-all w-full text-left"
    >
      <span className="text-indigo-600 font-black group-hover:translate-x-3 transition-transform text-3xl">•</span>
      <span className="group-hover:translate-x-2 transition-transform italic tracking-tighter">{label}</span>
    </button>
  </li>
);

const AsciiMonitor: React.FC<{ label: string; value: number; customLabel?: string }> = ({ label, value, customLabel }) => {
  const bars = Math.round(value / 10);
  const visual = '█'.repeat(bars) + '░'.repeat(10 - bars);
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-[11px] font-black uppercase text-slate-600 mb-1 tracking-widest">
        <span>{label}</span>
        <span className="text-indigo-500">{customLabel || `${Math.round(value)}%`}</span>
      </div>
      <div className="flex items-center gap-6">
        <span className="text-indigo-500/80 text-4xl tracking-[-0.15em] font-mono leading-none drop-shadow-[0_0_5px_rgba(99,102,241,0.3)]">{visual}</span>
        <span className="text-[10px] text-slate-700 font-black">{Math.round(value)}%</span>
      </div>
    </div>
  );
};

const StatSummary: React.FC<{ label: string; value: string; trend: string }> = ({ label, value, trend }) => (
  <div className="bg-slate-900/40 p-8 rounded-[2rem] border border-white/5 transition-all hover:bg-slate-800/40 cursor-default group hover:border-indigo-500/20">
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 group-hover:text-slate-300">{label}</p>
    <div className="flex items-baseline gap-4">
      <p className="text-4xl font-black text-white italic">{value}</p>
      <p className="text-[10px] font-black text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full uppercase tracking-tighter">{trend}</p>
    </div>
  </div>
);

export default Dashboard;
