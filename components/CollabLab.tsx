
import React, { useRef } from 'react';
import { ProjectRole, GeneratedAsset } from '../types';

interface CollabLabProps {
  currentRole: ProjectRole;
  onRoleChange: (role: ProjectRole) => void;
  assets: GeneratedAsset[];
  onImport: (data: string) => void;
}

const CollabLab: React.FC<CollabLabProps> = ({ currentRole, onRoleChange, assets, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const roles: ProjectRole[] = ['Writer', 'Editor', 'Producer', 'Director'];

  const handleExport = () => {
    const data = JSON.stringify({ assets, role: currentRole, timestamp: Date.now() }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studiogen_project_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          onImport(ev.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <section className="bg-slate-900/50 rounded-[2.5rem] p-10 border border-white/5 shadow-2xl space-y-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-9xl">🤝</div>
      
      <div className="relative z-10 max-w-4xl mx-auto space-y-16">
        <header className="text-center space-y-4">
          <h2 className="text-4xl font-black text-white">Collaboration Hub</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-lg leading-relaxed">
            Synchronize your creative team. Manage roles, share project manifests, and track production versioning.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Role Management */}
          <div className="bg-slate-950/50 p-8 rounded-[2rem] border border-white/5 space-y-8">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Identity & Permissions</h3>
            <div className="grid grid-cols-2 gap-4">
              {roles.map(role => (
                <button
                  key={role}
                  onClick={() => onRoleChange(role)}
                  className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                    currentRole === role
                      ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-900/50 border-white/5 text-slate-500 hover:border-white/20'
                  }`}
                >
                  <span className="text-2xl">
                    {role === 'Writer' && '✍️'}
                    {role === 'Editor' && '✂️'}
                    {role === 'Producer' && '💼'}
                    {role === 'Director' && '🎬'}
                  </span>
                  <span className="text-xs font-black uppercase tracking-widest">{role}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-600 text-center italic">
              Your role influences available mastering tools and version metadata.
            </p>
          </div>

          {/* Project Manifest Sharing */}
          <div className="bg-slate-950/50 p-8 rounded-[2rem] border border-white/5 flex flex-col justify-center space-y-8 text-center">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Project Sharing</h3>
            <div className="space-y-4">
              <button
                onClick={handleExport}
                className="w-full py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-400 hover:text-white transition-all shadow-xl"
              >
                Export Project Manifest
              </button>
              <div className="flex items-center gap-4">
                <div className="h-px bg-white/5 flex-1" />
                <span className="text-[10px] font-black text-slate-700">OR</span>
                <div className="h-px bg-white/5 flex-1" />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileImport} 
                className="hidden" 
                accept=".json"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-5 bg-slate-900 text-slate-400 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all"
              >
                Import External Manifest
              </button>
            </div>
            <p className="text-[10px] text-slate-600">
              Share the production bundle to sync assets across creative workstations.
            </p>
          </div>
        </div>

        {/* Workflow Info */}
        <div className="bg-indigo-600/5 rounded-[2rem] p-10 border border-indigo-500/10 text-center">
          <h4 className="text-white font-bold text-lg mb-4">Real-time Team Sync</h4>
          <div className="flex justify-center gap-12">
            <div className="space-y-2">
              <p className="text-2xl font-black text-indigo-400">0ms</p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sync Latency</p>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-black text-indigo-400">AES-256</p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Encrypted Stream</p>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-black text-indigo-400">GitFlow</p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Branching Logic</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CollabLab;
