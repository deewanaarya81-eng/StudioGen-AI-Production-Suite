
export type AppTab = 'dashboard' | 'live' | 'voice' | 'dialogue' | 'video' | 'image' | 'scripts' | 'segmenter' | 'compiler' | 'extension' | 'collab' | 'database';

export type ProjectRole = 'Writer' | 'Editor' | 'Producer' | 'Director';

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
  mediaTimestamp?: number;
}

export interface ProjectVersion {
  id: string;
  label: string;
  timestamp: number;
  author: string;
  snapshot: string;
}

export type ExportProfileId = 'youtube' | 'tiktok' | 'educational' | 'documentary' | 'social_mix';

export interface ExportProfile {
  id: ExportProfileId;
  name: string;
  description: string;
  aspectRatio: '16:9' | '9:16' | '1:1' | 'multi';
  resolution: '4K' | '1080p' | '720p';
  features: string[];
}

export interface PluginItem {
  id: string;
  name: string;
  description: string;
  installed: boolean;
  category: 'audio' | 'video' | 'visual' | 'workflow';
  icon: string;
}

export interface Template {
  id: string;
  name: string;
  category: 'explainer' | 'vlog' | 'documentary' | 'ad';
  thumbnail: string;
  description: string;
}

export interface TrendTopic {
  topic: string;
  potential: 'Viral' | 'Rising' | 'Steady';
  region: string;
}

export interface ScheduledJob {
  id: string;
  type: 'video' | 'image' | 'audio' | 'master' | 'clone';
  label: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  priority: 'normal' | 'high' | 'off-peak';
  scheduledTime: number;
  eta: string;
}

export interface GeneratedAsset {
  id: string;
  type: 'audio' | 'video' | 'image' | 'production_pack' | 'master_production';
  url: string;
  prompt: string;
  label: string;
  timestamp: number;
  comments?: Comment[];
  assets?: {
    audioUrl?: string;
    imageUrl?: string;
    videoUrl?: string;
    subtitles?: string;
    segments?: string[];
  };
}

export interface ScriptItem {
  id: string;
  title: string;
  content: string;
  type: string;
  sources?: any[];
}

export interface ScriptSegment {
  id: string;
  title: string;
  content: string;
  cliffhanger?: string;
  productionStatus?: 'idle' | 'narration' | 'visuals' | 'motion' | 'complete' | 'error';
  producedAssets?: {
    audio?: AudioBuffer;
    image?: string;
    video?: string;
    subtitles?: string;
  };
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
    webkitAudioContext: typeof AudioContext;
  }
}
