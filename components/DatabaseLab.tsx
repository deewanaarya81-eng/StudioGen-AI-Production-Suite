
import React, { useState, useMemo } from 'react';
import { GeneratedAsset } from '../types';

interface DatabaseLabProps {
  assets: GeneratedAsset[];
  onDelete: (id: string) => void;
  onClear: () => void;
  onImport: (data: string) => void;
}

const DatabaseLab: React.FC<DatabaseLabProps> = ({ assets, onDelete, onClear, onImport }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch = asset.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            asset.prompt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || asset.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [assets, searchQuery, filterType]);

  const stats = useMemo(() => {
    const total = assets.length;
    const videos = assets.filter(a => a.type === 'video').length;
    const audio = assets.filter(a => a.type === 'audio').length;
    const images = assets.filter(a => a.type === 'image').length;
    return { total, videos, audio, images };
  }, [assets]);

  const handleExportDB = () => {
    const data = JSON.stringify({ assets, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studiogen_database_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Creative Database</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">IndexedDB Persistent Media Storage</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportDB}
            className="px-4 py-2 bg-slate-800 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white transition-all"
          >
            Backup DB
          </button>
          <label className="px-4 py-2 bg-slate-800 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white transition-all cursor-pointer">
            Restore DB
            <input type="file" className="hidden" accept=".json" onChange={handleFileUpload} />
          </label>
          <button 
            onClick={onClear}
            className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all"
          >
            Purge All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <StatCard label="Total Records" value={stats.total} icon="📦" />
        <StatCard label="Video Forge" value={stats.videos} icon="🎬" />
        <StatCard label="Vocal Threads" value={stats.audio} icon="🎙️" />
        <StatCard label="Visual Assets" value={stats.images} icon="🎨" />
      </div>

      <div className="bg-slate-900/50 rounded-[2.5rem] border border-white/5 p-10 space-y-8 shadow-2xl">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="relative flex-1 group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
            <input 
              type="text" 
              placeholder="Query creative metadata..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner"
            />
          </div>
          <div className="flex gap-2 p-1.5 bg-slate-950 rounded-2xl border border-white/5">
            {['all', 'video', 'audio', 'image'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filterType === type 
                    ? 'bg-indigo-600 text-white shadow-lg' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar rounded-2xl border border-white/5">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950/80 text-slate-500 font-black uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Asset Identification</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Creative Prompt</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center opacity-30 italic">No matching records found in local storage.</td>
                </tr>
              ) : filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-sm border border-white/10">
                        {asset.type === 'video' && '🎬'}
                        {asset.type === 'audio' && '🎙️'}
                        {asset.type === 'image' && '🎨'}
                        {asset.type === 'master_production' && '🎞️'}
                      </div>
                      <span className="truncate max-w-[150px]">{asset.label}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase">{asset.type}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 italic max-w-xs truncate">
                    {asset.prompt}
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-mono">
                    {new Date(asset.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onDelete(asset.id)}
                      className="text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-lg font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number; icon: string }> = ({ label, value, icon }) => (
  <div className="bg-slate-900/40 p-6 rounded-3xl border border-white/5 flex items-center gap-5 hover:border-indigo-500/30 transition-all group">
    <div className="text-3xl bg-slate-950 w-14 h-14 rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-white italic">{value}</p>
    </div>
  </div>
);

export default DatabaseLab;
