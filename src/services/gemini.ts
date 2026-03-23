// src/services/gemini.ts
import { GoogleGenAI, Type } from "@google/genai";
import { 
  SeoResult, 
  AspectRatio, 
  KeywordAnalysisResult,
  ProjectPlan
} from "../types";
import { 
  SEO_OVERHAUL_INSTRUCTIONS, 
  KEYWORD_ANALYSIS_SYSTEM_PROMPT,
  DATA_ANALYSIS_SYSTEM_PROMPT
} from "./prompts";

// Helper to get the AI settings
const getAiSettings = () => {
  const customKey = localStorage.getItem('yt_api_key');
  const modelPreference = localStorage.getItem('yt_model_preference') || 'pro'; 
  return { customKey, modelPreference };
};

// Helper to get the AI client
const getAiClient = () => {
  const { customKey } = getAiSettings();
  // @ts-ignore
  const envKey = import.meta.env?.VITE_GEMINI_API_KEY || "";
  const apiKey = (customKey && customKey.trim() !== '') ? customKey.trim() : envKey;
  if (!apiKey) {
    throw new Error("Gemini API Key missing. Please set VITE_GEMINI_API_KEY or provide one in Settings.");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to get the active model based on preference and capability
const getActiveModel = (capability: 'text' | 'image' | 'video' | 'thinking' | 'analysis' | 'fast-text' | 'audio' | 'tts' | 'live' = 'text'): string => {
  const { modelPreference } = getAiSettings();
  
  if (capability === 'image') return 'gemini-3.1-flash-image-preview';
  if (capability === 'fast-text') return 'gemini-3.1-flash-lite-preview';
  
  if (modelPreference === 'flash') {
    return 'gemini-3-flash-preview';
  }
  
  if (capability === 'analysis') return 'gemini-3.1-flash-preview'; 
  return 'gemini-3.1-pro-preview';
};

/**
 * Universal Retry Wrapper with Exponential Backoff
 */
const executeWithRetry = async <T>(
  fn: () => Promise<T>,
  retries: number = 2,
  delay: number = 2000
): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    const status = error?.status || error?.response?.status;
    const message = error?.message || "";
    const isTransient = status === 429 || status === 503 || status === 500 || message.includes('fetch failed');
    
    if (isTransient && retries > 0) {
      await new Promise(r => setTimeout(r, delay));
      return executeWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

// Helper to clean markdown JSON code blocks
const cleanJsonString = (text: string): string => {
  if (!text) return "";
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
  
  try {
    JSON.parse(cleaned);
    return cleaned;
  } catch (e) {
    // If repair fails, just return as is and let the caller handle it
    return cleaned;
  }
};

export const generateSeoData = async (
  concept: string, 
  niche: string,
  script: string,
  stats: string,
  videoLength: string,
  channelUrl: string,
  internalLinks: string,
  videoFormat: 'Longform' | 'Shorts',
  plan?: ProjectPlan
): Promise<SeoResult> => {
  const ai = getAiClient();
  
  const planContext = plan ? `
    PROJECT PLAN: ${JSON.stringify(plan)}
  ` : '';

  const responseSchema: any = {
    type: Type.OBJECT,
    properties: {
      analysis: { type: Type.STRING },
      filenames: {
        type: Type.OBJECT,
        properties: {
          video: { type: Type.STRING },
          thumbnail: { type: Type.STRING }
        }
      },
      titleSets: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            thumbnailPrompt: { type: Type.STRING },
            thumbnailText: { type: Type.STRING }
          },
          required: ["title", "thumbnailPrompt", "thumbnailText"]
        }
      },
      description: { type: Type.STRING },
      tags: { type: Type.STRING },
      category: { type: Type.STRING },
      pinnedComment: { type: Type.ARRAY, items: { type: Type.STRING } },
      communityPost: { type: Type.ARRAY, items: { type: Type.STRING } },
      shortsScript: { type: Type.STRING },
      educationMoments: { type: Type.STRING },
      social: {
        type: Type.OBJECT,
        properties: {
          twitter: { type: Type.STRING },
          email: { type: Type.STRING }
        }
      }
    },
    required: ["analysis", "filenames", "titleSets", "description", "tags", "category", "pinnedComment", "communityPost", "shortsScript", "educationMoments", "social"]
  };

  const prompt = `
    ${SEO_OVERHAUL_INSTRUCTIONS}

    INPUT DATA:
    Concept: ${concept}
    Niche: ${niche}
    Script: ${script}
    Stats: ${stats || 'New Video'}
    Length: ${videoLength}
    Channel: ${channelUrl}
    Links: ${internalLinks}
    Format: ${videoFormat}
    Plan: ${planContext}
  `;

  const modelId = getActiveModel('analysis');
  
  return await executeWithRetry(async () => {
    const aiModel = ai.getGenerativeModel({ model: modelId });
    const result = await aiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
      tools: [{ googleSearch: {} }] as any,
    });

    const text = result.response.text();
    const jsonStr = cleanJsonString(text);
    const data = JSON.parse(jsonStr);

    return {
      ...data,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      concept,
      niche
    };
  });
};

export const generateKeywordAnalysis = async (
  concept: string,
  niche: string
): Promise<KeywordAnalysisResult> => {
  const ai = getAiClient();

  const responseSchema: any = {
    type: Type.OBJECT,
    properties: {
      lsiKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
      longTailKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
      searchIntent: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            query: { type: Type.STRING },
            intent: { type: Type.STRING },
            contentAngle: { type: Type.STRING }
          }
        }
      },
      viralHooks: { type: Type.ARRAY, items: { type: Type.STRING } },
      trendData: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            month: { type: Type.STRING },
            google: { type: Type.NUMBER },
            youtube: { type: Type.NUMBER }
          }
        }
      },
      keywordMetrics: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
             keyword: { type: Type.STRING },
             volume: { type: Type.NUMBER },
             difficulty: { type: Type.NUMBER },
             relevance: { type: Type.NUMBER }
          }
        }
      },
      demographics: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            group: { type: Type.STRING },
            percentage: { type: Type.NUMBER }
          }
        }
      },
      contentFormats: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            format: { type: Type.STRING },
            percentage: { type: Type.NUMBER }
          }
        }
      },
      sentimentAnalysis: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
             emotion: { type: Type.STRING },
             score: { type: Type.NUMBER }
          }
        }
      },
      retentionForecast: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                timePoint: { type: Type.STRING },
                retention: { type: Type.NUMBER }
            }
        }
      },
      competitorScores: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                aspect: { type: Type.STRING },
                score: { type: Type.NUMBER }
            }
        }
      },
      ctrPowerWords: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                word: { type: Type.STRING },
                score: { type: Type.NUMBER }
            }
        }
      },
      formatRoi: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                format: { type: Type.STRING },
                effort: { type: Type.NUMBER },
                impact: { type: Type.NUMBER }
            }
        }
      },
      marketAnalysis: { type: Type.STRING }
    },
    required: ["lsiKeywords", "longTailKeywords", "searchIntent", "viralHooks", "trendData", "keywordMetrics", "demographics", "contentFormats", "sentimentAnalysis", "retentionForecast", "competitorScores", "ctrPowerWords", "formatRoi", "marketAnalysis"]
  };

  const prompt = `
    ${KEYWORD_ANALYSIS_SYSTEM_PROMPT}
    Concept: "${concept}"
    Niche: "${niche}"
  `;

  return await executeWithRetry(async () => {
    const modelId = getActiveModel('analysis');
    const aiModel = ai.getGenerativeModel({ model: modelId });
    
    const result = await aiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
      tools: [{ googleSearch: {} }] as any,
    });

    const text = result.response.text();
    const jsonStr = cleanJsonString(text);
    return JSON.parse(jsonStr) as KeywordAnalysisResult;
  });
};

// --- Thumbnail Studio (Pro Image) ---
export const generateThumbnailConcept = async (
  seoResult?: SeoResult | null,
  currentPrompt?: string
): Promise<{ prompt: string; aspectRatio: AspectRatio }> => {
  const ai = getAiClient();
  
  const responseSchema: any = {
    type: Type.OBJECT,
    properties: {
      visualPrompt: { 
        type: Type.STRING, 
        description: "A highly detailed text-to-image prompt optimized for high CTR." 
      },
      aspectRatio: { 
        type: Type.STRING, 
        enum: ["16:9", "9:16"], 
        description: "The optimal aspect ratio based on if the content implies Shorts or Long-form." 
      }
    },
    required: ["visualPrompt", "aspectRatio"]
  };

  const prompt = `
    IDENTITY: You are a world-class YouTube Thumbnail Artist.
    ${seoResult ? `INPUT: Concept: ${seoResult.concept}, Niche: ${seoResult.niche}, Title: ${seoResult.titleSets?.[0]?.title}.` : ''}
    ${currentPrompt ? `CURRENT DRAFT PROMPT TO REFINE: "${currentPrompt}"` : ''}
    TASK: Create a visual prompt for a generative AI model. ${currentPrompt ? 'Refine and improve the CURRENT DRAFT PROMPT to make it more professional and effective.' : ''}
    RULES: Subject focus, Rule of Thirds, Minimal Text (2-3 words), High Saturation, 16:9 default unless Shorts.
    OUTPUT: JSON with 'visualPrompt' and 'aspectRatio'.
  `;

  return await executeWithRetry(async () => {
    const modelId = getActiveModel('text');
    const aiModel = ai.getGenerativeModel({ model: modelId });
    
    const result = await aiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      }
    });

    const text = result.response.text();
    const jsonStr = cleanJsonString(text);
    const data = JSON.parse(jsonStr);

    return {
      prompt: data.visualPrompt,
      aspectRatio: data.aspectRatio === "9:16" ? AspectRatio.PORTRAIT_9_16 : AspectRatio.LANDSCAPE_16_9
    };
  });
};

export const generateThumbnail = async (
  prompt: string,
  aspectRatio: string = '16:9',
  imageSize: string = '1K',
  largeText?: string,
  smallText?: string
): Promise<string> => {
  const ai = getAiClient();
  
  // In V2, we might want to use the actual image generation model if available,
  // but for now we'll simulate or use the available image model logic.
  const fullPrompt = `${prompt} ${largeText ? `[TEXT: ${largeText}]` : ''} ${smallText ? `[SUBTEXT: ${smallText}]` : ''}`;
  
  const response = await ai.getGenerativeModel({ model: 'gemini-3-pro-image-preview' }).generateContent(fullPrompt);
  
  // Note: The @google/genai SDK format for images might differ. 
  // This is a simplified version based on legacy gemini.ts
  const part = response.response.candidates[0].content.parts.find(p => p.inlineData);
  if (part?.inlineData) {
    return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("No image generated by the model.");
};

export const rateThumbnail = async (
  imageBytes: string,
  mimeType: string,
  context?: { concept?: string; niche?: string }
): Promise<string> => {
  const ai = getAiClient();
  const prompt = `
    IDENTITY: YouTube Thumbnail Critic & Growth Expert.
    CONTEXT: ${context ? `Video Topic: ${context.concept}, Niche: ${context.niche}` : 'Generic YouTube Thumbnail'}
    TASK: Rate this thumbnail (0-10) and provide a detailed 4-point "Consultant Report" on:
    1. Visual Hierarchy & Subject Focus
    2. Color Psychology & Contrast
    3. Typography & Readability
    4. Clickability & Emotional Trigger
  `;

  const model = ai.getGenerativeModel({ model: 'gemini-3.1-pro-preview' });
  const result = await model.generateContent([
    {
      inlineData: {
        data: imageBytes,
        mimeType: mimeType,
      },
    },
    prompt,
  ]);

  return result.response.text();
};

export const analyzeChannelData = async (
  csvData: any[],
  modelPreference: 'pro' | 'flash' = 'pro'
): Promise<AnalyticsResult> => {
  const ai = getAiClient();
  
  // Truncate data for the prompt if too large
  const dataSubset = csvData.slice(0, 100).map(row => {
    const { _id, _sourceFile, _fileId, _folder, ...cleanRow } = row;
    return cleanRow;
  });

  const prompt = `
    ${DATA_ANALYSIS_SYSTEM_PROMPT}

    RAW DATASET (TOP 100 RECORDS):
    ${JSON.stringify(dataSubset, null, 2)}
  `;

  return await executeWithRetry(async () => {
    const modelId = getActiveModel('analysis');
    const aiModel = ai.getGenerativeModel({ model: modelId });
    
    const result = await aiModel.generateContent(prompt);
    const text = result.response.text();
    const jsonStr = cleanJsonString(text);
    return JSON.parse(jsonStr) as AnalyticsResult;
  });
};
