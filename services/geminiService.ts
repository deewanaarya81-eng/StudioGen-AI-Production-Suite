
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { decode, decodeAudioData } from "../utils/audio";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const processAudioResponse = async (response: any): Promise<AudioBuffer> => {
  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio data returned");

  const outputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
  return await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
};

export const generateSpeech = async (text: string, voice: string = 'Kore'): Promise<AudioBuffer> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Say clearly and professionally: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
      },
    },
  });
  return processAudioResponse(response);
};

export const generateDialogue = async (prompt: string, s1: { name: string, voice: string }, s2: { name: string, voice: string }): Promise<AudioBuffer> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: [
            { speaker: s1.name, voiceConfig: { prebuiltVoiceConfig: { voiceName: s1.voice } } },
            { speaker: s2.name, voiceConfig: { prebuiltVoiceConfig: { voiceName: s2.voice } } },
          ]
        }
      }
    }
  });
  return processAudioResponse(response);
};

export const fetchTrendingTopics = async () => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: "Research current trending topics for media content (YouTube, TikTok, News) and identify viral potential. Return JSON array of {topic, potential, region}.",
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            potential: { type: Type.STRING, enum: ['Viral', 'Rising', 'Steady'] },
            region: { type: Type.STRING }
          },
          required: ["topic", "potential", "region"]
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const searchStockMedia = async (query: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Find high-quality stock media sources or descriptions for: ${query}. Use Pexels or Unsplash as references.`,
    config: { tools: [{ googleSearch: {} }] }
  });
  return {
    results: response.text || '',
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const generateImage = async (prompt: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio: "16:9" } }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("No image data found");
};

export const startVideoGeneration = async (prompt: string, imageBase64?: string) => {
  const ai = getAI();
  const payload: any = {
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
  };

  if (imageBase64) {
    const cleanBase64 = imageBase64.split(',')[1] || imageBase64;
    payload.image = { imageBytes: cleanBase64, mimeType: 'image/png' };
  }

  return await ai.models.generateVideos(payload);
};

export const pollVideoStatus = async (operation: any) => {
  const ai = getAI();
  return await ai.operations.getVideosOperation({ operation });
};

export const generateSubtitles = async (text: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Convert this script into a properly timed .srt subtitle block. Assume a standard speech rate of 150 words per minute. Start from 00:00:00. Script: ${text}`,
  });
  return response.text || '';
};

export const segmentScript = async (fullScript: string, targetDuration: number) => {
  const ai = getAI();
  const wordsPerMinute = 150;
  const targetWords = targetDuration * wordsPerMinute;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Split the script into logical parts of approx ${targetWords} words. Return JSON array of objects with title, content, cliffhanger.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            cliffhanger: { type: Type.STRING }
          },
          required: ["title", "content"]
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
};

export const compileMasterProduction = async (segments: any[], settings: any) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Act as a Video Director and Master Editor. Review these segments: ${JSON.stringify(segments.map(s => ({ title: s.label, prompt: s.prompt })))}. 
    
    Mastering Profile: ${settings.profile.name}
    Technical Requirements:
    - Resolution: ${settings.profile.resolution}
    - Format: ${settings.profile.aspectRatio}
    - Transitions: ${settings.transition}
    - Grading: ${settings.grading}
    - Features: ${settings.profile.features.join(', ')}
    - Smart Editing: ${settings.smartEditing ? 'Enabled' : 'Disabled'}
    
    Create a detailed master manifest including chapter markers, grading consistency notes, and transition timings. If profile is 'TikTok Series', optimize for hook-first pacing.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          manifest: { type: Type.STRING },
          chapters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                timestamp: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["title", "timestamp"]
            }
          },
          colorGradingAnalysis: { type: Type.STRING },
          transitionLogic: { type: Type.STRING }
        },
        required: ["manifest", "chapters"]
      }
    }
  });
  
  return JSON.parse(response.text || '{}');
};

export const generateScriptWithResearch = async (topic: string, type: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Research and write a script for: ${topic} in the style of ${type}.`,
    config: { tools: [{ googleSearch: {} }] }
  });
  
  return {
    text: response.text || '',
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};
