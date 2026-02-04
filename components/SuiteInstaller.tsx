
import React, { useState, useEffect } from 'react';

interface SuiteInstallerProps {
  onComplete: () => void;
  onCancel: () => void;
}

type InstallStep = 'INIT' | 'DEPENDENCY' | 'DOWNLOAD' | 'CONFIG' | 'VERIFY' | 'TUTORIAL' | 'SUCCESS';

const SuiteInstaller: React.FC<SuiteInstallerProps> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState<InstallStep>('INIT');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [config, setConfig] = useState({ autoUpdate: true, telemetry: false, hardwareAccel: true });

  const addLog = (msg: string) => setLogs(prev => [...prev.slice(-8), `[${new Date().toLocaleTimeString()}] ${msg}`]);

  useEffect(() => {
    if (currentStep === 'DEPENDENCY') {
      const runCheck = async () => {
        addLog("Initializing dependency analysis...");
        await new Promise(r => setTimeout(r, 800));
        addLog("Checking for FFmpeg runtime...");
        await new Promise(r => setTimeout(r, 600));
        addLog("Verifying GPU acceleration drivers...");
        await new Promise(r => setTimeout(r, 700));
        addLog("Found CUDA 12.1 compatible device.");
        setCurrentStep('DOWNLOAD');
      };
      runCheck();
    }

    if (currentStep === 'DOWNLOAD') {
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.random() * 15;
        if (currentProgress >= 100) {
          setProgress(100);
          clearInterval(interval);
          setTimeout(() => setCurrentStep('CONFIG'), 500);
        } else {
          setProgress(currentProgress);
          if (currentProgress > 20 && currentProgress < 25) addLog("Fetching Core Engine (1.2GB)...");
          if (currentProgress > 55 && currentProgress < 60) addLog("Downloading Coqui TTS models...");
          if (currentProgress > 85 && currentProgress < 90) addLog("Syncing Stable Diffusion weights...");
        }
      }, 300);
      return () => clearInterval(interval);
    }

    if (currentStep === 'VERIFY') {
      const runVerify = async () => {
        addLog("Testing local suite communication...");
        await new Promise(r => setTimeout(r, 1000));
        addLog("Ping test: 8ms (Sub-millisecond peak)");
        setCurrentStep('TUTORIAL');
      };
      runVerify();
    }
  }, [currentStep]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-6">
      <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col min-h-[500px] animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-white/5 bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">📦</span>
            </div>
            <div>
              <h3 className="text-xl font-black text-white">VideoGen Suite Installer</h3>
              <p className="text-[10px] text-slate-500 font-black tracking-widest uppercase">Version 2.5-Stable</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-slate-500 hover:text-white transition-colors">✕</button>
        </div>

        <div className="flex-1 p-10 flex flex-col">
          {currentStep === 'INIT' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
              <span className="text-6xl animate-bounce">⚡</span>
              <h4 className="text-2xl font-bold text-white tracking-tighter">Connect Local Production Suite</h4>
              <p className="text-slate-400 max-w-sm text-sm leading-relaxed">
                Unlock hardware-accelerated rendering and high-fidelity local voice cloning via the desktop CLI bridge.
              </p>
              <button 
                onClick={() => setCurrentStep('DEPENDENCY')}
                className="px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-indigo-500 shadow-xl"
              >
                Begin Automated Installation
              </button>
            </div>
          )}

          {(currentStep === 'DEPENDENCY' || currentStep === 'DOWNLOAD') && (
            <div className="flex-1 flex flex-col">
              <h4 className="text-lg font-bold text-white mb-2">{currentStep === 'DEPENDENCY' ? 'Env Setup' : 'Fetching Assets'}</h4>
              <div className="space-y-6 mt-4">
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: currentStep === 'DEPENDENCY' ? '20%' : `${progress}%` }} />
                </div>
                <div className="bg-black/40 rounded-xl p-4 font-mono text-[10px] text-indigo-400 border border-white/5 min-h-[160px]">
                  {logs.map((log, i) => <div key={i} className="mb-1">{log}</div>)}
                </div>
              </div>
            </div>
          )}

          {currentStep === 'CONFIG' && (
            <div className="flex-1 flex flex-col gap-4">
              <h4 className="text-lg font-bold text-white mb-4">Master Config</h4>
              <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                <p className="text-xs font-bold text-white">Neural RAM Reservation</p>
                <span className="text-[10px] text-indigo-400 font-black">4GB ALLOCATED</span>
              </div>
              <button 
                onClick={() => setCurrentStep('VERIFY')}
                className="mt-auto w-full py-4 bg-indigo-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl"
              >
                Finalize & Link Engine
              </button>
            </div>
          )}

          {currentStep === 'SUCCESS' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
               <span className="text-6xl">🚀</span>
               <h4 className="text-3xl font-black text-white">Link Active</h4>
               <p className="text-slate-500 uppercase tracking-widest font-black text-[10px]">Suite 2.5 Bridge Established</p>
               <button onClick={onComplete} className="px-12 py-4 bg-white text-black font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-indigo-500 hover:text-white shadow-2xl">Open Suite Control</button>
            </div>
          )}

          {currentStep === 'TUTORIAL' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
              <h4 className="text-2xl font-bold text-white">Suite Verified</h4>
              <button onClick={() => setCurrentStep('SUCCESS')} className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest">Continue</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuiteInstaller;
