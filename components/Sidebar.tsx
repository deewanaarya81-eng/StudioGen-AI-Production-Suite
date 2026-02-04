
import React from 'react';
import { AppTab } from '../types';

interface SidebarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'database', label: 'Creative DB', icon: '💾' },
    { id: 'live', label: 'Live Studio', icon: '⚡' },
    { id: 'voice', label: 'Voice Lab', icon: '🎙️' },
    { id: 'dialogue', label: 'Dialogue', icon: '🗣️' },
    { id: 'video', label: 'Video Forge', icon: '🎬' },
    { id: 'image', label: 'Visual Studio', icon: '🎨' },
    { id: 'scripts', label: 'Script Studio', icon: '✍️' },
    { id: 'segmenter', label: 'Segmenter', icon: '✂️' },
    { id: 'compiler', label: 'Compiler', icon: '🎞️' },
    { id: 'collab', label: 'Collaboration', icon: '🤝' },
    { id: 'extension', label: 'Extensions', icon: '🔌' },
  ];

  return (
    <nav className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-full">
      <div className="p-6">
        <div className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AppTab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mt-auto p-6 border-t border-slate-800">
        <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">System Status</h4>
          <div className="space-y-2">
            <StatusRow label="DB Store" status="ready" />
            <StatusRow label="Live Core" status="ready" />
            <StatusRow label="Collab Sync" status="ready" />
          </div>
        </div>
      </div>
    </nav>
  );
};

const StatusRow: React.FC<{ label: string; status: 'ready' | 'loading' }> = ({ label, status }) => (
  <div className="flex items-center justify-between text-xs">
    <span className="text-slate-400">{label}</span>
    <span className="text-green-500 font-medium uppercase tracking-tighter">Ready</span>
  </div>
);

export default Sidebar;
