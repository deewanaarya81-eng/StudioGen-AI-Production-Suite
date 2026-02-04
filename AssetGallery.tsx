
import React, { useState } from 'react';
import { GeneratedAsset, Comment, ProjectRole } from '../types';

interface AssetGalleryProps {
  assets: GeneratedAsset[];
  onUpdateAsset?: (asset: GeneratedAsset) => void;
  activeRole?: ProjectRole;
}

const AssetGallery: React.FC<AssetGalleryProps> = ({ assets, onUpdateAsset, activeRole }) => {
  const [selectedAsset, setSelectedAsset] = useState<GeneratedAsset | null>(null);
  const [commentText, setCommentText] = useState('');
  const [mediaTime, setMediaTime] = useState(0);

  const handleAddComment = () => {
    if (!selectedAsset || !onUpdateAsset || !commentText.trim()) return;

    const newComment: Comment = {
      id: `c_${Date.now()}`,
      userId: 'local_user',
      userName: activeRole || 'Guest',
      text: commentText,
      timestamp: Date.now(),
      mediaTimestamp: selectedAsset.type === 'video' ? mediaTime : undefined
    };

    const updatedAsset: GeneratedAsset = {
      ...selectedAsset,
      comments: [...(selectedAsset.comments || []), newComment]
    };

    onUpdateAsset(updatedAsset);
    setSelectedAsset(updatedAsset);
    setCommentText('');
  };

  if (assets.length === 0) {
    return (
      <section className="py-12 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
        <div className="opacity-20">
          <span className="text-4xl">📦</span>
          <p className="mt-4 font-black uppercase tracking-widest text-xs">Library is Empty</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Production Library</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{assets.length} Total Items</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {assets.map((asset) => (
          <div key={asset.id} className="group relative bg-slate-900/50 rounded-2xl overflow-hidden border border-white/5 hover:border-indigo-500/50 transition-all shadow-lg hover:shadow-indigo-500/5">
            <div className="aspect-video relative overflow-hidden bg-black flex items-center justify-center cursor-pointer" onClick={() => setSelectedAsset(asset)}>
              {asset.type === 'image' && (
                <img src={asset.url} alt={asset.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              )}
              {asset.type === 'video' && (
                <div className="relative w-full h-full group">
                   <video src={asset.url} className="w-full h-full object-cover" />
                   <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                     <span className="text-white text-3xl">💬</span>
                   </div>
                </div>
              )}
              {asset.type === 'audio' && (
                <div className="flex flex-col items-center justify-center opacity-40">
                  <span className="text-4xl">🎙️</span>
                </div>
              )}
              <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md border border-white/10 text-[8px] font-black uppercase tracking-widest text-white">
                {asset.type}
              </div>
            </div>
            
            <div className="p-4 border-t border-white/5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-bold text-slate-200 truncate flex-1">{asset.label}</p>
                {asset.comments && asset.comments.length > 0 && (
                  <span className="text-[8px] font-black text-indigo-400 bg-indigo-400/10 px-1.5 rounded-full">
                    {asset.comments.length}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-600 truncate">{asset.prompt}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Comment Overlay / Detail Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-5xl bg-slate-900 rounded-[2.5rem] border border-white/10 overflow-hidden flex h-[80vh] shadow-2xl">
            {/* Asset Preview */}
            <div className="flex-[3] bg-black flex flex-col items-center justify-center relative">
              <button onClick={() => setSelectedAsset(null)} className="absolute top-6 left-6 z-20 text-white/50 hover:text-white transition-colors">✕ CLOSE</button>
              
              <div className="w-full h-full flex items-center justify-center p-12">
                {selectedAsset.type === 'video' ? (
                  <video 
                    src={selectedAsset.url} 
                    controls 
                    className="max-h-full max-w-full rounded-2xl shadow-2xl" 
                    onTimeUpdate={(e) => setMediaTime((e.target as HTMLVideoElement).currentTime)}
                  />
                ) : selectedAsset.type === 'image' ? (
                  <img src={selectedAsset.url} className="max-h-full max-w-full rounded-2xl shadow-2xl object-contain" />
                ) : (
                  <div className="text-center space-y-4">
                    <span className="text-8xl">🎙️</span>
                    <audio src={selectedAsset.url} controls className="mx-auto" />
                  </div>
                )}
              </div>
            </div>

            {/* Discussion Panel */}
            <div className="flex-[2] border-l border-white/10 flex flex-col">
              <div className="p-8 border-b border-white/5 bg-slate-900/50">
                <h3 className="text-lg font-black text-white">{selectedAsset.label}</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-1">Review & Feedback Thread</p>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                {(!selectedAsset.comments || selectedAsset.comments.length === 0) ? (
                  <div className="text-center py-20 opacity-20 italic text-sm">No feedback recorded yet.</div>
                ) : (
                  selectedAsset.comments.map(c => (
                    <div key={c.id} className="space-y-2 group">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{c.userName}</span>
                        {c.mediaTimestamp !== undefined && (
                          <span className="text-[10px] font-mono text-slate-500">@{new Date(c.mediaTimestamp * 1000).toISOString().substr(14, 5)}</span>
                        )}
                      </div>
                      <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                        <p className="text-xs text-slate-300 leading-relaxed">{c.text}</p>
                      </div>
                      <p className="text-[8px] text-slate-700 font-bold uppercase tracking-tighter">{new Date(c.timestamp).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-8 border-t border-white/5 space-y-4 bg-slate-950/30">
                <textarea 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add feedback..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all resize-none h-24"
                />
                <button 
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all disabled:opacity-50"
                >
                  Post Time-Stamped Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AssetGallery;
