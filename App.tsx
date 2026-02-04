
import React, { useState, useEffect } from 'react';
import { AppTab, GeneratedAsset, ProjectRole, ProjectVersion } from './types';
import { db } from './utils/db';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import VoiceLab from './components/VoiceLab';
import LiveLab from './components/LiveLab';
import VisualLab from './components/VisualLab';
import ScriptStudio from './components/ScriptStudio';
import AssetGallery from './components/AssetGallery';
import DialogueLab from './components/DialogueLab';
import SegmenterLab from './components/SegmenterLab';
import CompilerLab from './components/CompilerLab';
import ExtensionHub from './components/ExtensionHub';
import CollabLab from './components/CollabLab';
import DatabaseLab from './components/DatabaseLab';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [apiKeySelected, setApiKeySelected] = useState<boolean>(false);
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [activeRole, setActiveRole] = useState<ProjectRole>('Producer');
  const [versions, setVersions] = useState<ProjectVersion[]>([]);

  useEffect(() => {
    const initialize = async () => {
      try {
        await db.init();
        const [storedAssets, storedVersions] = await Promise.all([
          db.getAllAssets(),
          db.getAllVersions()
        ]);
        setAssets(storedAssets.sort((a, b) => b.timestamp - a.timestamp));
        setVersions(storedVersions.sort((a, b) => b.timestamp - a.timestamp));
      } catch (err) {
        console.error("Critical: Database link failure", err);
      }

      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setApiKeySelected(hasKey);
      }
    };
    initialize();

    const savedRole = localStorage.getItem('studiogen_role');
    if (savedRole) setActiveRole(savedRole as ProjectRole);
  }, []);

  const addAsset = async (asset: GeneratedAsset) => {
    setAssets(prev => [asset, ...prev]);
    await db.saveAsset(asset);
  };

  const updateAsset = async (updatedAsset: GeneratedAsset) => {
    setAssets(prev => prev.map(a => a.id === updatedAsset.id ? updatedAsset : a));
    await db.saveAsset(updatedAsset);
  };

  const deleteAsset = async (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    await db.deleteAsset(id);
  };

  const addVersion = async (label: string) => {
    const newVersion: ProjectVersion = {
      id: `v_${Date.now()}`,
      label,
      timestamp: Date.now(),
      author: activeRole,
      snapshot: JSON.stringify({ assets })
    };
    setVersions(prev => [newVersion, ...prev]);
    await db.saveVersion(newVersion);
  };

  const restoreVersion = async (version: ProjectVersion) => {
    const data = JSON.parse(version.snapshot);
    if (data.assets && confirm(`Restore version "${version.label}"? Current active production will be overwritten.`)) {
      // Sequence DB operations for stability
      await db.clearAllAssets();
      await Promise.all(data.assets.map((asset: GeneratedAsset) => db.saveAsset(asset)));
      
      // Update UI state
      setAssets(data.assets);
      alert(`Production manifest rolled back to: ${version.label}`);
    }
  };

  const handleRoleChange = (role: ProjectRole) => {
    setActiveRole(role);
    localStorage.setItem('studiogen_role', role);
  };

  const handleOpenKeySelector = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setApiKeySelected(true);
    }
  };

  const handleImportProject = async (data: string) => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.assets) {
        await db.clearAllAssets();
        await Promise.all(parsed.assets.map((asset: GeneratedAsset) => db.saveAsset(asset)));
        setAssets(parsed.assets);
        alert('External production manifest synchronized successfully.');
      }
    } catch (e) {
      alert('Failed to parse external manifest.');
    }
  };

  const clearDatabase = async () => {
    if (confirm('CRITICAL: Purge entire Creative Database? This action cannot be undone.')) {
      await db.clearAllAssets();
      setAssets([]);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden text-slate-200">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col h-full bg-[#0b0e14]">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-slate-900/30 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-3">
             <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="text-white font-black italic">S</span>
             </div>
             <div>
                <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-300 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                  StudioGen AI
                </h1>
                <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">Production Suite 2.5</p>
             </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-white/10">
               <span className="text-xs font-medium text-slate-400">Role:</span>
               <select 
                 value={activeRole} 
                 onChange={(e) => handleRoleChange(e.target.value as ProjectRole)}
                 className="bg-transparent text-xs font-black text-indigo-400 focus:outline-none cursor-pointer"
               >
                 <option value="Writer">Writer</option>
                 <option value="Editor">Editor</option>
                 <option value="Producer">Producer</option>
                 <option value="Director">Director</option>
               </select>
             </div>
             
             {!apiKeySelected && (
               <button 
                 onClick={handleOpenKeySelector}
                 className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-indigo-500/20"
               >
                 Initialize Video Engine
               </button>
             )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto pb-20">
            {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} assets={assets} />}
            {activeTab === 'database' && <DatabaseLab assets={assets} onDelete={deleteAsset} onClear={clearDatabase} onImport={handleImportProject} />}
            {activeTab === 'live' && <LiveLab />}
            {activeTab === 'voice' && <VoiceLab onAssetGenerated={addAsset} />}
            {activeTab === 'dialogue' && <DialogueLab onAssetGenerated={addAsset} />}
            {activeTab === 'video' && <VisualLab type="video" apiKeySelected={apiKeySelected} onAssetGenerated={addAsset} />}
            {activeTab === 'image' && <VisualLab type="image" apiKeySelected={apiKeySelected} onAssetGenerated={addAsset} />}
            {activeTab === 'scripts' && <ScriptStudio />}
            {activeTab === 'segmenter' && <SegmenterLab />}
            {activeTab === 'compiler' && <CompilerLab assets={assets} onAssetGenerated={addAsset} versions={versions} onAddVersion={addVersion} onRestoreVersion={restoreVersion} />}
            {activeTab === 'collab' && <CollabLab currentRole={activeRole} onRoleChange={handleRoleChange} assets={assets} onImport={handleImportProject} />}
            {activeTab === 'extension' && <ExtensionHub />}
            
            {assets.length > 0 && !['dashboard', 'database'].includes(activeTab) && (
              <div className="mt-16 pt-16 border-t border-white/5">
                <AssetGallery assets={assets} onUpdateAsset={updateAsset} activeRole={activeRole} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
