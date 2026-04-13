import { GoogleGenAI, Type, ThinkingLevel, GenerateContentResponse } from "@google/genai";
import { AspectRatio, ImageSize } from "@/types";
import type {
  SeoResult,
  MediaAnalysisResult,
  KeywordAnalysisResult,
  AnalyticsResult,
  HookResult,
  AlgorithmDiagnosis,
  DailyBrief,
  PollBlueprint,
  ShortsConcept,
  ProjectPlan,
  Scene
} from "@/types";
import {
  DATA_ANALYSIS_SYSTEM_PROMPT,
  DATA_HANDLING_INSTRUCTIONS,
  SEO_OVERHAUL_INSTRUCTIONS,
  KEYWORD_ANALYSIS_SYSTEM_PROMPT,
  HOOK_GENERATION_INSTRUCTIONS,
  ALGORITHM_DIAGNOSIS_INSTRUCTIONS,
  DAILY_COMMAND_INSTRUCTIONS
} from "@/services/prompts";
import { geminiQueue } from "../utils/RequestQueue";
import { getVaultKey } from "./keyVault";

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

// Helper to get the AI settings
const getAiSettings = () => {
  const customKey =
    getVaultKey('gemini') ||
    localStorage.getItem('yt_api_key') ||
    localStorage.getItem('vt_gemini_api_key') ||
    localStorage.getItem('gemini_api_key') ||
    localStorage.getItem('google_api_key') ||
    '';
  const modelPreference = localStorage.getItem('yt_model_preference') || 'pro'; // Default to pro
  return { customKey, modelPreference };
};

const getEnvGeminiKey = (): string => {
  // @ts-ignore
  const envGemini = import.meta.env?.VITE_GEMINI_API_KEY || "";
  // @ts-ignore
  const envGoogle = import.meta.env?.VITE_GOOGLE_API_KEY || "";
  return String(envGemini || envGoogle || "").trim();
};

const resolveGeminiApiKey = (): string => {
  const { customKey } = getAiSettings();
  const key = String(customKey || "").trim() || getEnvGeminiKey();
  return key;
};

// Helper to get the AI client
const getAiClient = () => {
  const apiKey = resolveGeminiApiKey();
  if (!apiKey) {
    throw new Error("Gemini API key is missing. Open System Settings -> Key Vault and set Gemini AI API Key.");
  }
  return new GoogleGenAI({ apiKey });
};

export const hasGeminiKey = (): boolean => {
  return resolveGeminiApiKey().length > 0;
};

// Helper to get the active model based on preference and capability
const getActiveModel = (capability: 'text' | 'image' | 'video' | 'thinking' | 'analysis' | 'fast-text' | 'audio' | 'tts' | 'live' = 'text'): string => {
  const { modelPreference } = getAiSettings();

  if (capability === 'image') return 'gemini-3.1-flash-image-preview';
  if (capability === 'video') return 'veo-3.1-fast-generate-preview';
  if (capability === 'fast-text') return 'gemini-3.1-flash-lite-preview';
  if (capability === 'audio') return 'gemini-2.5-flash-preview-tts';
  if (capability === 'tts') return 'gemini-2.5-flash-preview-tts';
  if (capability === 'live') return 'gemini-2.5-flash-native-audio-preview-12-2025';

  if (modelPreference === 'flash') {
    return 'gemini-3-flash-preview';
  }

  // Pro preference
  if (capability === 'analysis') return 'gemini-3-flash-preview'; // Use flash for large JSON generation to avoid timeouts
  if (capability === 'thinking') return 'gemini-3.1-pro-preview';
  return 'gemini-3.1-pro-preview';
};

// --- HARBOR PILOT: RELIABILITY HELPERS ---

/**
 * Universal Retry Wrapper with Exponential Backoff
 */
const executeWithRetry = async <T>(
  fn: () => Promise<T>
): Promise<T> => {
  return geminiQueue.add(fn);
};

/**
 * Self-Correction Loop for Truncated or Malformatted JSON
 */
const selfCorrectJson = async (brokenJson: string, schema: any): Promise<any> => {
  try {
    const ai = getAiClient();
    const model = getActiveModel('fast-text');
    const correctionPrompt = `REPAIR MISSION: The following JSON string was truncated or malformatted. 
    Fix it so it is valid JSON and strictly follows the provided schema. 
    DO NOT apologize. DO NOT add conversational text. ONLY return the valid JSON.
    
    SCHEMA: ${JSON.stringify(schema)}
    BROKEN JSON: ${brokenJson}`;

    const result = await ai.models.generateContent({ model, contents: correctionPrompt });
    const cleaned = cleanJsonString(result.text || "");
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("[Gemini] Self-correction failed:", e);
    throw e;
  }
};

// Helper to clean markdown JSON code blocks and repair truncated JSON
const cleanJsonString = (text: string, isIntermediate: boolean = false): string => {
  if (!text) return "";
  let cleaned = text.trim();

  // Strip markdown fences if present
  cleaned = cleaned.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();

  // Try parsing the cleaned string first. If it's valid, return it.
  try {
    JSON.parse(cleaned);
    return cleaned;
  } catch (e) {
    // If it fails, we'll try to repair it below
  }

  if (isIntermediate) {
    return cleaned;
  }

  // Attempt to repair truncated JSON
  let repaired = cleaned;

  // 1. Handle unterminated strings
  // Count unescaped double quotes
  let quoteCount = 0;
  for (let i = 0; i < repaired.length; i++) {
    if (repaired[i] === '"' && (i === 0 || repaired[i - 1] !== '\\')) {
      quoteCount++;
    }
  }
  if (quoteCount % 2 !== 0) {
    repaired += '"';
  }

  // 2. Close open braces and brackets
  const stack: ('{' | '[')[] = [];
  let inString = false;

  for (let i = 0; i < repaired.length; i++) {
    const char = repaired[i];
    const prevChar = i > 0 ? repaired[i - 1] : '';

    if (char === '"' && prevChar !== '\\') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === '{') {
      stack.push('{');
    } else if (char === '[') {
      stack.push('[');
    } else if (char === '}') {
      if (stack.length > 0 && stack[stack.length - 1] === '{') {
        stack.pop();
      }
    } else if (char === ']') {
      if (stack.length > 0 && stack[stack.length - 1] === '[') {
        stack.pop();
      }
    }
  }

  // Clean up trailing commas or colons before closing
  repaired = repaired.trim();
  while (repaired.endsWith(',') || repaired.endsWith(':')) {
    repaired = repaired.slice(0, -1).trim();
  }

  // Close in reverse order
  while (stack.length > 0) {
    const last = stack.pop();
    if (last === '{') repaired += '}';
    else if (last === '[') repaired += ']';
  }

  // Try parsing the repaired string
  try {
    JSON.parse(repaired);
    return repaired;
  } catch (e) {
    // If repair failed, fall back to the original extraction logic
  }

  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');

  let isObject = false;
  let isArray = false;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    isObject = true;
  } else if (firstBracket !== -1) {
    isArray = true;
  }

  if (isObject) {
    let lastBrace = cleaned.lastIndexOf('}');
    while (lastBrace !== -1 && lastBrace > firstBrace) {
      const candidate = cleaned.substring(firstBrace, lastBrace + 1);
      try {
        JSON.parse(candidate);
        return candidate;
      } catch (e) {
        lastBrace = cleaned.lastIndexOf('}', lastBrace - 1);
      }
    }
  } else if (isArray) {
    let lastBracket = cleaned.lastIndexOf(']');
    while (lastBracket !== -1 && lastBracket > firstBracket) {
      const candidate = cleaned.substring(firstBracket, lastBracket + 1);
      try {
        JSON.parse(candidate);
        return candidate;
      } catch (e) {
        lastBracket = cleaned.lastIndexOf(']', lastBracket - 1);
      }
    }
  }

  return cleaned;
};

// --- YT-OS v5.0 Launch Protocol (SEO) ---
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
    PROJECT PLAN:
    - Topic: ${plan.topic}
    - Description: ${plan.description}
    - Length: ${plan.length}
    - Audience: ${plan.audience}
    - Vision: ${plan.vision}
    - Hook: ${plan.hook}
  ` : '';

  const responseSchema: any = {
    type: Type.OBJECT,
    properties: {
      analysis: { type: Type.STRING, description: "Phase 1: Gap, Search Intent, Verbal SEO, Retention Spike suggestions." },
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
            thumbnailText: { type: Type.STRING, description: "A 2-3 word overlay phrase designed to be placed on the thumbnail image." }
          },
          required: ["title", "thumbnailPrompt", "thumbnailText"]
        },
        description: "6 sets of titles paired with highly detailed text-to-image prompts for a YouTube thumbnail."
      },
      description: { type: Type.STRING, description: "The full, ready-to-paste YouTube description with proper line breaks." },
      tags: { type: Type.STRING, description: "Comma separated tag list." },
      category: { type: Type.STRING, description: "Best YouTube category for the video." },
      pinnedComment: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "3 distinct engaging pinned comment options. DO NOT number them."
      },
      communityPost: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "3 options for a Community Tab post to promote the video."
      },
      shortsScript: { type: Type.STRING },
      educationMoments: { type: Type.STRING, description: "Timestamped questions and phrases for the Education section." },
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

  let channelHandle = channelUrl.trim();
  if (channelHandle.includes('@')) {
    channelHandle = channelHandle.substring(channelHandle.indexOf('@') + 1).split(/[/?]/)[0];
  } else {
    channelHandle = channelHandle.replace(/^https?:\/\/(www\.)?youtube\.com\/(c\/|channel\/|user\/)?/, '').split(/[/?]/)[0];
  }

  const prompt = `
    ${SEO_OVERHAUL_INSTRUCTIONS}

    INPUT DATA:
    1. Core Concept: ${concept}
    2. Niche: ${niche}
    3. Script: ${script}
    4. Stats (Post-Upload): ${stats || 'New Video (No Stats)'}
    5. Video Length: ${videoLength}
    6. Channel URL: ${channelUrl}
    7. Internal Links: ${internalLinks}
    8. Format: ${videoFormat}
    9. Project Plan: ${planContext}
  `;

  let lastError: any;
  const preferred = getActiveModel('analysis');

  const modelsToTry = [preferred];
  if (preferred !== 'gemini-3-flash-preview') {
    modelsToTry.push('gemini-3-flash-preview');
  }

  for (const modelId of modelsToTry) {
    try {
      const { data, groundingUrls } = await executeWithRetry(async () => {
        const result = await getAiClient().models.generateContent({
          model: modelId,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            responseMimeType: 'application/json',
            responseSchema: responseSchema,
            maxOutputTokens: 16380,
            tools: [{ googleSearch: {} }] as any,
          },
        });

        const text = result.text;
        if (!text) throw new Error("No payload returned");

        // Extract grounding
        const urls: string[] = [];
        const metadata = result.candidates?.[0]?.groundingMetadata;
        if (metadata?.searchEntryPoint?.renderedContent) {
          // Simplified extraction if needed, or just track metadata presence
        }
        if (metadata?.groundingChunks) {
          metadata.groundingChunks.forEach((chunk: any) => {
            if (chunk.web?.uri) urls.push(chunk.web.uri);
          });
        }

        try {
          const jsonStr = cleanJsonString(text);
          return { data: JSON.parse(jsonStr), groundingUrls: urls };
        } catch (e) {
          console.warn(`[Gemini] JSON parse failed for ${modelId}, checking self-correction...`);
          const corrected = await selfCorrectJson(text, responseSchema);
          return { data: corrected, groundingUrls: urls };
        }
      });

      return {
        ...data,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        concept,
        niche,
        groundingUrls
      };

    } catch (error: any) {
      console.warn(`Attempt failed with model ${modelId}:`, error.message);
      lastError = error;
      if (modelId === modelsToTry[modelsToTry.length - 1]) {
        break;
      }
    }
  }

  console.error("All models failed. Last error:", lastError);
  if (lastError?.message?.includes('INVALID_ARGUMENT')) {
    throw new Error("Input data too large. Please reduce script length.");
  }
  if (lastError?.message?.includes('PERMISSION_DENIED') || lastError?.message?.includes('403')) {
    throw new Error("Permission denied (403). Please check your API key.");
  }
  throw lastError;
};

// --- Keyword Research (LSI/Intent/Stats) ---
export const generateKeywordAnalysis = async (
  concept: string,
  niche: string,
  plan?: ProjectPlan
): Promise<KeywordAnalysisResult> => {
  const ai = getAiClient();

  const planContext = plan ? `
    PROJECT PLAN:
    - Topic: ${plan.topic}
    - Description: ${plan.description}
    - Length: ${plan.length}
    - Audience: ${plan.audience}
    - Vision: ${plan.vision}
    - Hook: ${plan.hook}
  ` : '';

  const responseSchema: any = {
    type: Type.OBJECT,
    properties: {
      lsiKeywords: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "15-20 Latent Semantic Indexing keywords."
      },
      longTailKeywords: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "10 specific, low-competition phrases."
      },
      searchIntent: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            query: { type: Type.STRING },
            intent: { type: Type.STRING, enum: ['Informational', 'Transactional', 'Navigational', 'Commercial'] },
            contentAngle: { type: Type.STRING }
          }
        }
      },
      viralHooks: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      trendData: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            month: { type: Type.STRING, description: "Month name (e.g. Jan, Feb)" },
            google: { type: Type.NUMBER, description: "Estimated search volume index 0-100 on Google" },
            youtube: { type: Type.NUMBER, description: "Estimated search volume index 0-100 on YouTube" }
          }
        },
        description: "12-month trend data estimating interest in this topic."
      },
      keywordMetrics: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            keyword: { type: Type.STRING },
            volume: { type: Type.NUMBER, description: "Estimated monthly searches" },
            difficulty: { type: Type.NUMBER, description: "0-100 Difficulty Score" },
            relevance: { type: Type.NUMBER, description: "0-100 Relevance Score to the main concept" }
          }
        },
        description: "Top 8 related keywords with metrics for scatter plot analysis."
      },
      demographics: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            group: { type: Type.STRING, description: "Age group (e.g. 18-24)" },
            percentage: { type: Type.NUMBER, description: "Percentage share" }
          }
        },
        description: "Estimated audience age distribution for this topic."
      },
      contentFormats: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            format: { type: Type.STRING, description: "Video format (e.g. Shorts, Tutorial, Vlog, Live Stream, Commentary)" },
            percentage: { type: Type.NUMBER, description: "Percentage of top-ranking results matching this format." }
          }
        },
        description: "Breakdown of what video formats are currently winning for this topic."
      },
      sentimentAnalysis: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            emotion: { type: Type.STRING, description: "Emotional hook (e.g. Curiosity, Fear, Gain, Logic, Humor)" },
            score: { type: Type.NUMBER, description: "0-100 dominance score of this emotion in top videos." }
          }
        },
        description: "Analysis of the emotional triggers used by successful videos in this niche."
      },
      // 4 NEW CHARTS
      retentionForecast: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            timePoint: { type: Type.STRING, description: "Video percentage e.g. '0%', '25%'" },
            retention: { type: Type.NUMBER, description: "Predicted retention percentage (0-100)" }
          }
        },
        description: "Predicted audience retention curve for this topic."
      },
      competitorScores: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            aspect: { type: Type.STRING, description: "Competitive aspect (e.g. Production, Story, SEO)" },
            score: { type: Type.NUMBER, description: "Score 0-100" }
          }
        },
        description: "Radar chart data comparing user potential vs competitor average."
      },
      ctrPowerWords: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            score: { type: Type.NUMBER, description: "CTR Impact Score 0-100" }
          }
        },
        description: "Top 5 words that drive clicks in this niche."
      },
      formatRoi: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            format: { type: Type.STRING },
            effort: { type: Type.NUMBER, description: "Production Effort 1-10" },
            impact: { type: Type.NUMBER, description: "View Potential 1-10" }
          }
        },
        description: "Effort vs Impact matrix for different content types."
      },
      marketAnalysis: {
        type: Type.STRING,
        description: "A paragraph explaining the relationship between keyword relevancy, difficulty, and volume for this specific niche."
      }
    },
    required: ["lsiKeywords", "longTailKeywords", "searchIntent", "viralHooks", "trendData", "keywordMetrics", "demographics", "contentFormats", "sentimentAnalysis", "retentionForecast", "competitorScores", "ctrPowerWords", "formatRoi", "marketAnalysis"]
  };

  const prompt = `
    ${KEYWORD_ANALYSIS_SYSTEM_PROMPT}

    INPUT PARAMETERS:
    - Concept/Topic: "${concept}"
    - Niche: "${niche}"
    ${plan ? `PROJECT PLAN CONTEXT: ${JSON.stringify(plan)}` : ''}
  `;

  return await executeWithRetry(async () => {
    const modelId = getActiveModel('analysis');
    const result = await getAiClient().models.generateContent({
      model: modelId,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        maxOutputTokens: 16380,
        tools: [{ googleSearch: {} }] as any,
      },
    });

    const text = result.text;
    if (!text) throw new Error("No keywords generated");

    try {
      const jsonStr = cleanJsonString(text);
      return JSON.parse(jsonStr) as KeywordAnalysisResult;
    } catch (e) {
      console.warn(`[Gemini] Keyword JSON parse failed, attempting self-correction...`);
      return await selfCorrectJson(text, responseSchema);
    }
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
    const result = await getAiClient().models.generateContent({
      model: modelId,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      }
    });

    const text = result.text;
    if (!text) throw new Error("No concept generated");

    try {
      const jsonStr = cleanJsonString(text);
      const data = JSON.parse(jsonStr);

      return {
        prompt: data.visualPrompt,
        aspectRatio: data.aspectRatio === "9:16" ? AspectRatio.PORTRAIT_9_16 : AspectRatio.LANDSCAPE_16_9
      };
    } catch (e) {
      console.warn(`[Gemini] Thumbnail Concept JSON parse failed, attempting self-correction...`);
      const corrected = await selfCorrectJson(text, responseSchema);
      return {
        prompt: corrected.visualPrompt,
        aspectRatio: corrected.aspectRatio === "9:16" ? AspectRatio.PORTRAIT_9_16 : AspectRatio.LANDSCAPE_16_9
      };
    }
  });
};

export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<string> => {
  return geminiQueue.add(async () => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: getActiveModel('tts'),
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio generated");
    return `data:audio/wav;base64,${base64Audio}`;
  });
};

export const transcribeAudio = async (audioData: string, mimeType: string = 'audio/pcm;rate=16000'): Promise<string> => {
  return geminiQueue.add(async () => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{
        parts: [{
          inlineData: {
            data: audioData,
            mimeType: mimeType
          }
        }, {
          text: "Transcribe this audio."
        }]
      }]
    });
    return response.text || "";
  });
};

export const generateVideo = async (prompt: string, aspectRatio: '16:9' | '9:16' = '16:9'): Promise<string> => {
  const ai = getAiClient();
  let operation = await geminiQueue.add(() => ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '1080p',
      aspectRatio: aspectRatio
    }
  }));

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("No video generated");
  return downloadLink;
};

export const analyzeImage = async (imageBytes: string, mimeType: string, prompt: string): Promise<string> => {
  return geminiQueue.add(async () => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBytes,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });
    return response.text || "";
  });
};

export const generateImage = async (prompt: string, aspectRatio: string = '1:1', imageSize: string = '1K'): Promise<string> => {
  return geminiQueue.add(async () => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: imageSize
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  });
};

export const generateChatResponse = async (history: any[], newMessage: string, useThinking: boolean = false, systemInstruction?: string): Promise<string> => {
  const ai = getAiClient();
  const config: any = {};
  if (useThinking) {
    config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
  }
  if (systemInstruction) {
    config.systemInstruction = { role: 'system', parts: [{ text: systemInstruction }] };
  }
  const chat = ai.chats.create({
    model: getActiveModel(useThinking ? 'thinking' : 'text'),
    config,
    history
  });
  const response = await chat.sendMessage({ message: newMessage });
  return response.text || "";
};

export const analyzeVideo = async (videoData: string, mimeType: string, prompt: string): Promise<string> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: {
      parts: [
        {
          inlineData: {
            data: videoData,
            mimeType: mimeType,
          },
        },
        {
          text: prompt,
        },
      ],
    },
  });
  return response.text || "";
};

export const generateThumbnail = async (
  prompt: string,
  aspectRatio: AspectRatio,
  imageSize: ImageSize,
  largeText?: string,
  smallText?: string
): Promise<string> => {
  if (window.aistudio) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
    }
  }

  const ai = getAiClient();

  let textInstruction = "";
  if (largeText || smallText) {
    textInstruction = `\n\nCRITICAL TEXT INSTRUCTIONS: You MUST include the following text EXACTLY as written. Do NOT add any other text or words to the image.`;
    if (largeText) textInstruction += `\n- Large Text: "${largeText}" (Make this very prominent and large)`;
    if (smallText) textInstruction += `\n- Small Text: "${smallText}" (Make this smaller and secondary)`;
  }

  const response = await ai.models.generateContent({
    model: getActiveModel('image'),
    contents: {
      parts: [{ text: `A high quality, click-baity, vibrant YouTube thumbnail: ${prompt}${textInstruction}` }]
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio,
        imageSize: imageSize
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image generated");
};

export const rateThumbnail = async (
  fileBase64: string,
  mimeType: string,
  context?: { concept: string; niche: string }
): Promise<string> => {
  const ai = getAiClient();

  const contextPrompt = context
    ? `CONTEXT: This thumbnail is for a video about "${context.concept}" targeting the "${context.niche}" niche.`
    : "CONTEXT: No specific video topic provided. Judge based on general YouTube best practices.";

  const prompt = `
    ${contextPrompt}
    TASK: Analyze thumbnail for CTR.
    OUTPUT: 
    1. Viral Score (0-100)
    2. Analysis (2 sentences)
    3. Strengths
    4. Critical Fixes
  `;

  const preferred = getActiveModel('analysis');
  const modelsToTry = [preferred];
  if (preferred !== 'gemini-3-flash-preview') {
    modelsToTry.push('gemini-3-flash-preview');
  }

  let lastError: any;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: {
          parts: [
            {
              inlineData: {
                data: fileBase64,
                mimeType: mimeType
              }
            },
            { text: prompt }
          ]
        }
      });

      return response.text || "Could not analyze thumbnail.";
    } catch (error: any) {
      console.warn(`Thumbnail Rating failed with model ${model}:`, error.message);
      lastError = error;
      if (error.message?.includes('INVALID_ARGUMENT')) {
        return "Error: Image file too large for analysis. Please try a smaller image (under 10MB).";
      }
      if (model === modelsToTry[modelsToTry.length - 1]) {
        break;
      }
    }
  }

  console.error("All models failed for Thumbnail Rating. Last error:", lastError);
  throw lastError;
};

// --- Strategy Chat (Pro + Thinking) ---
export const generateStrategyResponse = async (
  history: { role: string; parts: { text: string }[] }[],
  newMessage: string
) => {
  const ai = getAiClient();
  const preferred = getActiveModel('thinking');
  const modelsToTry = [preferred];
  if (preferred !== 'gemini-3-flash-preview') {
    modelsToTry.push('gemini-3-flash-preview');
  }

  let lastError: any;

  for (const model of modelsToTry) {
    try {
      const chat = ai.chats.create({
        model: model,
        history: history,
        config: {
          systemInstruction: `You are an elite YouTube Strategist and Content Creation Consultant. 
Your goal is to provide advanced reasoning and actionable recommendations for content creation, channel growth, and audience retention.
When answering, break down your reasoning step-by-step. Use data-driven insights where possible.
Provide clear, structured advice using markdown (headings, bullet points, bold text).
Focus on:
1. Identifying the core value proposition of the creator's ideas.
2. Suggesting high-retention narrative structures.
3. Optimizing for YouTube's algorithm (CTR + AVD).
4. Identifying market gaps and unique angles.`,
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
        }
      });

      const response = await chat.sendMessage({ message: newMessage });
      return response.text;
    } catch (error: any) {
      console.warn(`Strategy Chat failed with model ${model}:`, error.message);
      lastError = error;
      if (model === modelsToTry[modelsToTry.length - 1]) {
        break;
      }
    }
  }

  console.error("All models failed for Strategy Chat. Last error:", lastError);
  throw lastError;
};

// --- Channel Goal Analysis ---
export const analyzeChannelGoals = async (
  goals: any[],
  channelData: any,
  csvData: any[]
): Promise<any[]> => {
  const ai = getAiClient();

  const responseSchema: any = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        analysis: { type: Type.STRING, description: "Deep analysis of the goal based on current stats and market position." },
        guidance: { type: Type.STRING, description: "Specific, actionable advice for achieving the goal." },
        outline: { type: Type.STRING, description: "A non-obvious, detailed weekly/milestone outline for staying on track." }
      },
      required: ["id", "analysis", "guidance", "outline"]
    }
  };

  const prompt = `
    IDENTITY: You are an elite YouTube Growth Strategist.
    
    INPUT DATA:
    1. Current Channel Goals: ${JSON.stringify(goals)}
    2. Channel Profile: ${JSON.stringify(channelData)}
    3. Historical Performance (CSV): ${JSON.stringify(csvData.slice(0, 50))} // Sample for context
    
    TASK:
    Analyze each goal and provide:
    1. **Analysis**: Why this goal is important and how realistic it is given current trends.
    2. **Guidance**: Specific, non-obvious strategies. Don't just say "post more". Say "leverage the current spike in X topic by creating Y format".
    3. **Outline**: A detailed, non-linear progress plan. For example, if the goal is 1000 subscribers in a month, don't just divide by 4. Explain that they might need to hit 600 by week 2 because of a planned high-effort video, or how to front-load growth.
    
    Be specific, data-driven, and creative. Use all available information to provide the best possible growth path.
  `;

  return await executeWithRetry(async () => {
    const modelId = getActiveModel('analysis');
    const result = await getAiClient().models.generateContent({
      model: modelId,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      }
    });

    const text = result.text;
    if (!text) throw new Error("No goal analysis generated");

    try {
      const jsonStr = cleanJsonString(text);
      return JSON.parse(jsonStr);
    } catch (e) {
      console.warn(`[Gemini] Goal Analysis JSON parse failed, attempting self-correction...`);
      return await selfCorrectJson(text, responseSchema);
    }
  });
};


// --- Tag Generation (Ranked Suggestions) ---
export interface TagSuggestion {
  tag: string;
  score: number;
  searchVolume: number;
  competition: number;
  rank: number;
  tripleKeyword: boolean;
}

export const generateTagSuggestions = async (
  title: string,
  description: string
): Promise<TagSuggestion[]> => {
  const ai = getAiClient();

  const responseSchema: any = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        tag: { type: Type.STRING },
        score: { type: Type.INTEGER, description: "Overall SEO Score (Balance of Volume vs. Competition) 1-100" },
        searchVolume: { type: Type.INTEGER, description: "Estimated Monthly YouTube searches" },
        competition: { type: Type.INTEGER, description: "Estimated number of competing videos" },
        rank: { type: Type.INTEGER, description: "Estimated current search position (#1, #2, etc.)" },
        tripleKeyword: { type: Type.BOOLEAN, description: "Whether the tag is present in Title + Description" }
      },
      required: ["tag", "score", "searchVolume", "competition", "rank", "tripleKeyword"]
    }
  };

  const prompt = `
    IDENTITY: YouTube SEO Expert.
    INPUT: 
    Title: "${title}"
    Description: "${description}"
    
    TASK: Generate 10 highly relevant, high-performing YouTube tags for this video.
    For each tag, provide:
    1. The tag itself.
    2. An overall SEO score (1-100) balancing search volume and competition.
    3. Estimated monthly search volume.
    4. Estimated competition (number of competing videos).
    5. Estimated rank (where this video might rank for this tag).
    6. Whether this tag is a "Triple Keyword" (present in both the title and description provided).
    
    Mix broad category tags with specific long-tail keywords.
    
    OUTPUT: A JSON array of 10 objects with 'tag', 'score', 'searchVolume', 'competition', 'rank', and 'tripleKeyword'.
  `;

  const preferred = getActiveModel('fast-text');
  const modelsToTry = [preferred];
  if (preferred !== 'gemini-3-flash-preview') {
    modelsToTry.push('gemini-3-flash-preview');
  }
  if (!modelsToTry.includes('gemini-3.1-pro-preview')) {
    modelsToTry.push('gemini-3.1-pro-preview');
  }

  let lastError: any;

  for (const model of modelsToTry) {
    try {
      const jsonStr = await executeWithRetry(async () => {
        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: responseSchema,
          }
        });
        const text = response.text;
        if (!text) throw new Error("No tags generated");
        return cleanJsonString(text);
      });
      return JSON.parse(jsonStr);
    } catch (e: any) {
      console.warn(`Tag Generation failed with model ${model}:`, e.message);
      lastError = e;
      if (model === modelsToTry[modelsToTry.length - 1]) {
        break;
      }
    }
  }

  console.error("All models failed for Tag Generation. Last error:", lastError);
  throw lastError;
};

// --- Analyze Existing Tags ---
export const analyzeExistingTags = async (
  title: string,
  description: string,
  tags: string[]
): Promise<TagSuggestion[]> => {
  const ai = getAiClient();

  const responseSchema: any = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        tag: { type: Type.STRING },
        score: { type: Type.INTEGER, description: "Overall SEO Score (Balance of Volume vs. Competition) 1-100" },
        searchVolume: { type: Type.INTEGER, description: "Estimated Monthly YouTube searches" },
        competition: { type: Type.INTEGER, description: "Estimated number of competing videos" },
        rank: { type: Type.INTEGER, description: "Estimated current search position (#1, #2, etc.)" },
        tripleKeyword: { type: Type.BOOLEAN, description: "Whether the tag is present in Title + Description" }
      },
      required: ["tag", "score", "searchVolume", "competition", "rank", "tripleKeyword"]
    }
  };

  const prompt = `
    IDENTITY: YouTube SEO Expert.
    INPUT: 
    Title: "${title}"
    Description: "${description}"
    Tags: "${tags.join(', ')}"
    
    TASK: Analyze the provided YouTube tags for this video.
    For each tag, provide:
    1. The tag itself.
    2. An overall SEO score (1-100) balancing search volume and competition.
    3. Estimated monthly search volume.
    4. Estimated competition (number of competing videos).
    5. Estimated rank (where this video might rank for this tag).
    6. Whether this tag is a "Triple Keyword" (present in both the title and description provided).
    
    OUTPUT: A JSON array of objects with 'tag', 'score', 'searchVolume', 'competition', 'rank', and 'tripleKeyword'.
  `;

  const preferred = getActiveModel('fast-text');
  const modelsToTry = [preferred];
  if (preferred !== 'gemini-3-flash-preview') {
    modelsToTry.push('gemini-3-flash-preview');
  }
  if (!modelsToTry.includes('gemini-3.1-pro-preview')) {
    modelsToTry.push('gemini-3.1-pro-preview');
  }

  let lastError: any;

  for (const model of modelsToTry) {
    try {
      const jsonStr = await executeWithRetry(async () => {
        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: responseSchema,
          }
        });
        const text = response.text;
        if (!text) throw new Error("No tags analyzed");
        return cleanJsonString(text);
      });
      return JSON.parse(jsonStr);
    } catch (e: any) {
      console.warn(`Tag Analysis failed with model ${model}:`, e.message);
      lastError = e;
      if (model === modelsToTry[modelsToTry.length - 1]) {
        break;
      }
    }
  }

  console.error("All models failed for Tag Analysis. Last error:", lastError);
  throw lastError;
};

// --- Media Analysis (Pro Multimodal) ---
export const generateVisualImage = async (
  prompt: string,
  aspectRatio: AspectRatio = AspectRatio.LANDSCAPE_16_9,
  imageSize: ImageSize = ImageSize.SIZE_1K
): Promise<string> => {
  if (window.aistudio) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
    }
  }

  const ai = getAiClient();

  const response = await ai.models.generateContent({
    model: getActiveModel('image'),
    contents: {
      parts: [{ text: `A high quality, cinematic video frame: ${prompt}` }]
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio,
        imageSize: imageSize
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image generated");
};

export const generateVisualVideo = async (
  prompt: string,
  imageBytes?: string,
  aspectRatio: '16:9' | '9:16' = '16:9'
): Promise<string> => {
  if (window.aistudio) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
    }
  }

  const ai = getAiClient();

  let operation;
  if (imageBytes) {
    const base64Data = imageBytes.split(',')[1] || imageBytes;
    operation = await ai.models.generateVideos({
      model: getActiveModel('video'),
      prompt: prompt,
      image: {
        imageBytes: base64Data,
        mimeType: 'image/png',
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio
      }
    });
  } else {
    operation = await ai.models.generateVideos({
      model: getActiveModel('video'),
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '1080p',
        aspectRatio: aspectRatio
      }
    });
  }

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error("No video generated");
  }

  const apiKey = resolveGeminiApiKey();
  if (!apiKey) {
    throw new Error("Gemini API key is missing. Open System Settings -> Key Vault and set Gemini AI API Key.");
  }
  const response = await fetch(downloadLink, {
    method: 'GET',
    headers: {
      'x-goog-api-key': apiKey,
    },
  });

  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const analyzeMediaContent = async (
  fileBase64: string,
  mimeType: string,
  prompt: string
): Promise<MediaAnalysisResult> => {
  const ai = getAiClient();

  const responseSchema: any = {
    type: Type.OBJECT,
    properties: {
      analysis: { type: Type.STRING, description: "Detailed analysis of the video content based on the prompt." },
      strategicAnalysis: { type: Type.STRING, description: "Phase 1 Strategic Analysis: Gap, Search Intent, Verbal SEO, Retention Spike suggestions." },
      retentionCurve: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            timePoint: { type: Type.STRING, description: "Time point in the video, e.g., '0:00', '1:00', or percentage '0%', '25%'" },
            retention: { type: Type.NUMBER, description: "Predicted retention percentage (0-100)" }
          }
        },
        description: "Predicted audience retention curve based on video pacing, topic complexity, and audience engagement signals identified in the content."
      }
    },
    required: ["analysis", "strategicAnalysis", "retentionCurve"]
  };

  const preferred = getActiveModel('text');
  const modelsToTry = [preferred];
  if (preferred !== 'gemini-3-flash-preview') {
    modelsToTry.push('gemini-3-flash-preview');
  }

  let lastError: any;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: {
          parts: [
            {
              inlineData: {
                data: fileBase64,
                mimeType: mimeType
              }
            },
            { text: `Analyze the media content based on this prompt: ${prompt}\n\nAdditionally, provide a retention curve prediction based on video pacing, topic complexity, and audience engagement signals identified in the content.\n\nFinally, provide a Strategic Analysis section detailing Gap, Search Intent, Verbal SEO, and Retention Spike suggestions.` }
          ]
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
        }
      });

      const text = response.text;
      if (!text) throw new Error("Could not analyze content.");
      const jsonStr = cleanJsonString(text);
      return JSON.parse(jsonStr) as MediaAnalysisResult;
    } catch (error: any) {
      console.warn(`Media Analysis failed with model ${model}:`, error.message);
      lastError = error;
      if (error.message?.includes('INVALID_ARGUMENT')) {
        throw new Error("Error: File too large or invalid format. Please use a file smaller than 20MB.");
      }
      if (model === modelsToTry[modelsToTry.length - 1]) {
        break;
      }
    }
  }

  console.error("All models failed for Media Analysis. Last error:", lastError);
  throw lastError;
};

export const transcribeMediaContent = async (
  fileBase64: string,
  mimeType: string
): Promise<string> => {
  const ai = getAiClient();

  const preferred = getActiveModel('text');
  const modelsToTry = [preferred];
  if (preferred !== 'gemini-3-flash-preview') {
    modelsToTry.push('gemini-3-flash-preview');
  }

  let lastError: any;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: {
          parts: [
            {
              inlineData: {
                data: fileBase64,
                mimeType: mimeType
              }
            },
            { text: "Transcribe audio verbatim. No timestamps. Raw text only." }
          ]
        }
      });

      return response.text || "Could not transcribe content.";
    } catch (error: any) {
      console.warn(`Transcription failed with model ${model}:`, error.message);
      lastError = error;
      if (error.message?.includes('INVALID_ARGUMENT')) {
        return "Error: File too large. Transcription failed.";
      }
      if (model === modelsToTry[modelsToTry.length - 1]) {
        break;
      }
    }
  }

  console.error("All models failed for Transcription. Last error:", lastError);
  throw lastError;
};

export const generateHook = async (
  input: string,
  inputType: 'script' | 'video'
): Promise<HookResult[]> => {
  const ai = getAiClient();

  const prompt = `
    ${HOOK_GENERATION_INSTRUCTIONS}

    INPUT DATA:
    "${input}"
    (Type: ${inputType})
  `;

  const responseSchema: any = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        styleName: { type: Type.STRING },
        explanation: { type: Type.STRING },
        script: { type: Type.STRING },
        visualSuggestion: { type: Type.STRING },
        timeline: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              time: { type: Type.STRING },
              audio: { type: Type.STRING },
              visuals: { type: Type.STRING }
            },
            required: ['time', 'audio', 'visuals']
          }
        },
        assemblyInstructions: { type: Type.STRING }
      },
      required: ['styleName', 'explanation', 'script', 'visualSuggestion', 'timeline', 'assemblyInstructions']
    }
  };

  const preferred = getActiveModel('analysis');
  const modelsToTry = [preferred];
  if (preferred !== 'gemini-3-flash-preview') {
    modelsToTry.push('gemini-3-flash-preview');
  }

  let lastError: any;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
        }
      });

      const jsonStr = cleanJsonString(response.text || "[]");
      return JSON.parse(jsonStr) as HookResult[];
    } catch (error: any) {
      console.warn(`Hook Generation failed with model ${model}:`, error.message);
      lastError = error;
      if (model === modelsToTry[modelsToTry.length - 1]) {
        break;
      }
    }
  }

  console.error("All models failed for Hook Generation. Last error:", lastError);
  throw lastError;
};
export const analyzeChannelData = async (
  csvContent: string,
  systemPrompt?: string,
  onProgress?: (partialResult: AnalyticsResult) => void
): Promise<AnalyticsResult> => {
  if (!hasGeminiKey()) {
    throw new Error("Gemini API key missing. Go to System -> Key Vault and save your Gemini key.");
  }

  const ai = getAiClient();

  const responseSchema: any = {
    type: Type.OBJECT,
    properties: {
      executiveSummary: { type: Type.STRING },
      stats: {
        type: Type.OBJECT,
        properties: {
          views: { type: Type.NUMBER },
          watchTime: { type: Type.NUMBER },
          revenue: { type: Type.NUMBER },
          subscribers: { type: Type.NUMBER },
          rpm: { type: Type.NUMBER },
          ctr: { type: Type.NUMBER }
        },
        required: ["views", "watchTime", "revenue", "subscribers", "rpm", "ctr"]
      },
      sections: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            chartSuggestion: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ["bar", "line", "pie", "radar", "scatter", "bubble"] },
                title: { type: Type.STRING },
                xAxisKey: { type: Type.STRING, description: "Exact CSV header name for X-axis" },
                dataKeys: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Exact CSV header names for Y-axis" },
                description: { type: Type.STRING },
                interactiveFilter: { type: Type.BOOLEAN }
              }
            }
          },
          required: ["title", "content"]
        }
      },
      miniSpreadsheets: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            headers: { type: Type.ARRAY, items: { type: Type.STRING } },
            rows: {
              type: Type.ARRAY,
              items: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            }
          },
          required: ["title", "headers", "rows"]
        },
        description: "Exactly 8 mini spreadsheets (3-5 rows each, EXACTLY 5 columns) showing grouped or comparative data."
      },
      keywordComparisonTable: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          headers: { type: Type.ARRAY, items: { type: Type.STRING } },
          rows: {
            type: Type.ARRAY,
            items: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        },
        required: ["title", "headers", "rows"],
        description: "A long comparative table showing Top 10 Title Keywords with Avg Views, Avg Retention, Avg Subs Gained, Avg Likes, and Avg Comments."
      }
    },
    required: ["executiveSummary", "stats", "sections", "miniSpreadsheets", "keywordComparisonTable"]
  };

  const prompt = `
    ${systemPrompt || DATA_ANALYSIS_SYSTEM_PROMPT}

    ${DATA_HANDLING_INSTRUCTIONS}

    ### FINAL CONSTRAINTS
    1. YOUR OUTPUT MUST BE A VALID JSON OBJECT.
    2. DO NOT ADD ANY TEXT BEFORE OR AFTER THE JSON.
    3. Use the exact CSV Headers provided in the data for all keys.
    4. Ensure the report structure matches the 9 sections requested in the system prompt.
    
    DATA (CSV):
    ${csvContent.length > 60000 ? csvContent.substring(0, csvContent.lastIndexOf('\n', 60000)) + "... [TRUNCATED FOR LENGTH]" : csvContent}
  `;

  const preferred = getActiveModel('analysis');
  const modelsToTry = Array.from(
    new Set([preferred, 'gemini-3-flash-preview', 'gemini-3.1-flash-lite-preview']),
  );

  let lastError: any;

  for (const model of modelsToTry) {
    console.log(`DEBUG: Starting analysis with model ${model}`);
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      let fullText = '';
      try {
        const responseStream = await ai.models.generateContentStream({
          model: model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: responseSchema,
            maxOutputTokens: 32768,
          }
        });

        let lastProgressTime = 0;
        console.log(`DEBUG: Stream started for model ${model}`);
        for await (const chunk of responseStream) {
          const c = chunk as GenerateContentResponse;
          if (c.text) {
            fullText += c.text;
            // Log progress occasionally
            if (Date.now() - lastProgressTime > 5000) {
              console.log(`DEBUG: Received ${fullText.length} characters from ${model}`);
              lastProgressTime = Date.now();
            }
            if (onProgress) {
              const now = Date.now();
              if (now - lastProgressTime > 200) { // Throttle to 5 times per second
                try {
                  const partialJsonStr = cleanJsonString(fullText, true);
                  const partialResult = JSON.parse(partialJsonStr) as AnalyticsResult;
                  onProgress(partialResult);
                  lastProgressTime = now;
                } catch (e) {
                  // Ignore parse errors on partial chunks
                }
              }
            }
          }
        }
        console.log(`DEBUG: Stream finished for model ${model}. Total length: ${fullText.length}`);

        if (!fullText) throw new Error("No analytics generated");

        const jsonStr = cleanJsonString(fullText);
        try {
          const result = JSON.parse(jsonStr) as AnalyticsResult;
          return result;
        } catch (e) {
          console.error("JSON Parse Error. Full text:", fullText);
          throw new Error(`JSON Parse Error: ${e instanceof Error ? e.message : String(e)}`);
        }

      } catch (error: any) {
        const errorMessage = String(error?.message || '');
        const errorStatus = String(error?.status || error?.error?.status || '').toUpperCase();
        const errorCode = Number(error?.code || error?.error?.code || 0);
        const isTransient =
          errorCode === 429 ||
          errorCode === 500 ||
          errorCode === 502 ||
          errorCode === 503 ||
          errorCode === 504 ||
          errorStatus.includes('UNAVAILABLE') ||
          errorStatus.includes('RESOURCE_EXHAUSTED') ||
          errorMessage.includes('503') ||
          errorMessage.includes('429') ||
          errorMessage.includes('UNAVAILABLE');

        // If we got partial stream text, try to salvage it before failing.
        if (fullText.trim()) {
          try {
            const partialJson = cleanJsonString(fullText);
            const partialResult = JSON.parse(partialJson) as AnalyticsResult;
            console.warn(`Recovered partial Channel Analysis result from model ${model} after stream error.`);
            return partialResult;
          } catch {
            // ignore and continue normal retry/fallback flow
          }
        }

        const isLastAttempt = attempt >= maxRetries;
        if (isTransient && !isLastAttempt) {
          const backoff = Math.pow(2, attempt) * 1000;
          console.warn(
            `Attempt ${attempt} failed for model ${model} with transient error. Retrying in ${backoff}ms...`,
            errorMessage,
          );
          await new Promise((resolve) => setTimeout(resolve, backoff));
          continue;
        }

        console.warn(`Attempt failed with model ${model}:`, errorMessage || errorStatus || errorCode);
        lastError = error instanceof Error ? error : new Error(errorMessage || `Model ${model} failed.`);
        break; // Move to next model
      }
    }
  }

  const resolvedError =
    lastError instanceof Error
      ? lastError
      : new Error("Channel analysis failed after retries. The model may be overloaded (503). Please retry.");

  console.error("All models failed for Channel Analysis. Last error:", resolvedError);
  if (lastError?.message?.includes('INVALID_ARGUMENT')) {
    throw new Error("CSV data too large. Please upload a smaller timeframe or fewer columns.");
  }
  throw resolvedError;
};

// --- Algorithm Architect (Master Blueprint) ---

export const generateAlgorithmDiagnosis = async (
  channelData: string
): Promise<AlgorithmDiagnosis> => {
  const ai = getAiClient();

  const responseSchema: any = {
    type: Type.OBJECT,
    properties: {
      clusterCenter: { type: Type.STRING },
      nicheAuthority: { type: Type.NUMBER },
      audienceDNA: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            interest: { type: Type.STRING },
            overlap: { type: Type.NUMBER }
          }
        }
      },
      velocityBaseline: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            period: { type: Type.STRING },
            views: { type: Type.NUMBER }
          }
        }
      },
      hiddenStory: { type: Type.STRING }
    },
    required: ["clusterCenter", "nicheAuthority", "audienceDNA", "velocityBaseline", "hiddenStory"]
  };

  const prompt = `
    ${ALGORITHM_DIAGNOSIS_INSTRUCTIONS}
    
    DATA:
    ${channelData}
  `;

  return await executeWithRetry(async () => {
    const modelId = getActiveModel('analysis');
    const result = await getAiClient().models.generateContent({
      model: modelId,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        maxOutputTokens: 16380,
      }
    });

    const text = result.text;
    if (!text) throw new Error("No diagnosis generated");

    try {
      const jsonStr = cleanJsonString(text);
      return JSON.parse(jsonStr) as AlgorithmDiagnosis;
    } catch (e) {
      console.warn(`[Gemini] Diagnosis JSON parse failed, attempting self-correction...`);
      return await selfCorrectJson(text, responseSchema);
    }
  });
};

export const generateDailyBrief = async (
  diagnosis: AlgorithmDiagnosis,
  recentPerformance: string
): Promise<DailyBrief> => {
  const ai = getAiClient();

  const responseSchema: any = {
    type: Type.OBJECT,
    properties: {
      mainPriority: { type: Type.STRING },
      actionSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
      algorithmSentiment: { type: Type.STRING, enum: ['positive', 'neutral', 'negative'] },
      estimatedImpact: { type: Type.STRING }
    },
    required: ["mainPriority", "actionSteps", "algorithmSentiment", "estimatedImpact"]
  };

  const prompt = `
    ${DAILY_COMMAND_INSTRUCTIONS}

    INPUT: 
    - Diagnosis: ${JSON.stringify(diagnosis)}
    - Performance: ${recentPerformance}
  `;

  return await executeWithRetry(async () => {
    const modelId = getActiveModel('text');
    const result = await getAiClient().models.generateContent({
      model: modelId,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        maxOutputTokens: 8192,
      }
    });

    const text = result.text;
    if (!text) throw new Error("No brief generated");

    try {
      const jsonStr = cleanJsonString(text);
      return JSON.parse(jsonStr) as DailyBrief;
    } catch (e) {
      console.warn(`[Gemini] Daily Brief JSON parse failed, attempting self-correction...`);
      return await selfCorrectJson(text, responseSchema);
    }
  });
};

export const generateInterestSeeding = async (
  topic: string,
  niche: string,
  targetAudience: string,
  diagnosis?: AlgorithmDiagnosis | null
): Promise<PollBlueprint> => {
  const ai = getAiClient();

  const responseSchema: any = {
    type: Type.OBJECT,
    properties: {
      question: { type: Type.STRING },
      options: { type: Type.ARRAY, items: { type: Type.STRING } },
      strategy: { type: Type.STRING }
    },
    required: ["question", "options", "strategy"]
  };

  const contextPrompt = diagnosis ? `
    CHANNEL CONTEXT (Algorithmic Fingerprint):
    - Cluster Center: ${diagnosis.clusterCenter}
    - Audience DNA: ${diagnosis.audienceDNA.map(d => `${d.interest} (${d.overlap}%)`).join(', ')}
    - Authority Score: ${diagnosis.nicheAuthority}%
  ` : '';

  const prompt = `
    IDENTITY: YouTube Algorithm Specialist.
    TASK: Generate an "Interest Seeding" poll blueprint. 
    GOAL: Create a community tab poll that primes the algorithm and audience for an upcoming video on: "${topic}" in the "${niche}" niche.
    TARGET AUDIENCE: ${targetAudience}
    ${contextPrompt}

    CRITICAL: Use the Channel Context to ensure the poll aligns with the existing "Cluster Center" while bridging into the new topic.

    The poll should:
    1. Be highly engaging (high vote count).
    2. Naturally use keywords related to the upcoming video.
    3. Include a "Strategy" explanation of how this poll "seeds" the recommendation engine.
    
    OUTPUT: JSON with 'question', 'options' (max 4), and 'strategy'.
  `;

  return await executeWithRetry(async () => {
    const modelId = getActiveModel('text');
    const result = await getAiClient().models.generateContent({
      model: modelId,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      }
    });

    const text = result.text;
    if (!text) throw new Error("No seeding poll generated");

    try {
      const jsonStr = cleanJsonString(text);
      return JSON.parse(jsonStr) as PollBlueprint;
    } catch (e) {
      console.warn(`[Gemini] Interest Seeding JSON parse failed, attempting self-correction...`);
      return await selfCorrectJson(text, responseSchema);
    }
  });
};

export const generateProjectStrategy = async (
  concept: string,
  niche: string,
  targetAudience: string
): Promise<ProjectPlan> => {
  const ai = getAiClient();

  const responseSchema: any = {
    type: Type.OBJECT,
    properties: {
      topic: { type: Type.STRING },
      description: { type: Type.STRING },
      length: { type: Type.STRING },
      audience: { type: Type.STRING },
      vision: { type: Type.STRING },
      hook: { type: Type.STRING }
    },
    required: ["topic", "description", "length", "audience", "vision", "hook"]
  };

  const prompt = `
    IDENTITY: Elite YouTube Strategist.
    TASK: Create a detailed Project Plan for a new video.
    
    INPUT:
    Concept: ${concept}
    Niche: ${niche}
    Target Audience: ${targetAudience}
    
    Return a JSON object containing the topic, description, estimated length, target audience details, creative vision, and a scroll-stopping hook.
  `;

  return await executeWithRetry(async () => {
    const modelId = getActiveModel('text');
    const result = await getAiClient().models.generateContent({
      model: modelId,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      }
    });

    const text = result.text;
    if (!text) throw new Error("No project strategy generated");

    try {
      const jsonStr = cleanJsonString(text);
      return JSON.parse(jsonStr) as ProjectPlan;
    } catch (e) {
      console.warn("[Gemini] Project Strategy JSON parse failed, attempting self-correction...");
      return await selfCorrectJson(text, responseSchema);
    }
  });
};

export const generateStoryboard = async (
  script: string,
  concept?: string
): Promise<Scene[]> => {
  const ai = getAiClient();

  const responseSchema: any = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        name: { type: Type.STRING },
        text: { type: Type.STRING, description: "The spoken text or narrative for this scene." },
        broll: { type: Type.STRING, description: "Visual description of the b-roll or camera shot." },
        emotionScore: { type: Type.NUMBER, description: "Emotional intensity 1-10" },
        durationEstimate: { type: Type.NUMBER, description: "Estimated duration in seconds" }
      },
      required: ["id", "name", "text", "broll", "emotionScore", "durationEstimate"]
    }
  };

  const prompt = `
    IDENTITY: Expert YouTube Director and Video Editor.
    TASK: Break down the following script/concept into a highly engaging visual storyboard.
    
    ${concept ? `CONCEPT: ${concept}` : ''}
    SCRIPT/NOTES:
    ${script}
    
    INSTRUCTIONS:
    1. Segment the script into logical scenes.
    2. Assign a dramatic, descriptive 'name' to each scene.
    3. Detail the exact 'text' (voiceover/dialogue) for that segment.
    4. Describe the 'broll' (what is seen on screen). Make it highly visual and engaging.
    5. Score the 'emotionScore' (1-10) to dictate pacing.
    6. Estimate the 'durationEstimate' in seconds.
  `;

  return await executeWithRetry(async () => {
    const modelId = getActiveModel('analysis');
    const result = await getAiClient().models.generateContent({
      model: modelId,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      }
    });

    const text = result.text;
    if (!text) throw new Error("No storyboard generated");

    const processScenes = (parsed: any[]) => parsed.map((scene: any) => ({ ...scene, imageUrl: null, voiceoverUrl: null }));

    try {
      const jsonStr = cleanJsonString(text);
      return processScenes(JSON.parse(jsonStr));
    } catch (e) {
      console.warn("[Gemini] Storyboard JSON parse failed, attempting self-correction...");
      const corrected = await selfCorrectJson(text, responseSchema);
      return processScenes(corrected);
    }
  });
};

export const generateProjectSuggestions = async (
  projectInfo: any,
  channelData: any,
  csvData: any[]
): Promise<string[]> => {
  const ai = getAiClient();
  const model = getActiveModel('analysis');

  const context = `
Channel Info:
${JSON.stringify(channelData || {}, null, 2)}

Recent Performance Data (Sample):
${JSON.stringify((csvData || []).slice(0, 5), null, 2)}

Current Project Details:
Name: ${projectInfo.name}
Description: ${projectInfo.description}
Tags: ${projectInfo.tags}
Script Snippet: ${projectInfo.script ? projectInfo.script.substring(0, 500) : 'None'}
Current Tasks: ${projectInfo.tasks.map((t: any) => t.text).join(', ')}
  `;

  const prompt = `
You are an expert YouTube strategist. Based on the provided channel context, performance data, and current project details, generate 5 simple, highly actionable suggestions for the preparation or publishing of this specific project.
These suggestions should be formatted as short, punchy task items that the creator can add directly to their checklist.
Do not include any introductory or concluding text. Just return a JSON array of 5 strings.

Context:
${context}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating project suggestions:", error);
    return [
      "Review competitor thumbnails for similar topics",
      "Draft 3 alternative titles before publishing",
      "Create a pinned comment to drive engagement",
      "Schedule a community post to tease the video",
      "Identify key moments for YouTube Shorts extraction"
    ];
  }
};

export const generateChannelTaskSuggestions = async (
  channelData: any,
  currentTasks: any[]
): Promise<string[]> => {
  const ai = getAiClient();
  const model = getActiveModel('analysis');

  const context = `
Channel Info:
${JSON.stringify(channelData || {}, null, 2)}

Current Channel Tasks:
${currentTasks.map(t => t.text).join(', ')}
  `;

  const prompt = `
You are an expert YouTube channel manager. Based on the provided channel context and current tasks, generate 5 simple, high-impact tasks for general channel optimization and maintenance.
These tasks should be short, punchy items that the creator can add to their channel to-do list.
Focus on things like:
- Branding consistency
- Community engagement
- Analytics review
- Technical optimization (tags, descriptions, playlists)
- Workflow improvements

Do not include any introductory or concluding text. Just return a JSON array of 5 strings.

Context:
${context}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating channel task suggestions:", error);
    return [
      "Update channel banner for upcoming series",
      "Audit top 5 videos for broken links in description",
      "Reply to 10 recent comments to boost engagement",
      "Review 'Research' tab in YouTube Analytics for new trends",
      "Optimize channel 'About' section with current keywords"
    ];
  }
};

export const generateFunnelTeaser = async (
  topic: string,
  niche: string,
  longFormTitle: string,
  diagnosis?: AlgorithmDiagnosis | null
): Promise<ShortsConcept> => {
  const ai = getAiClient();

  const responseSchema: any = {
    type: Type.OBJECT,
    properties: {
      hook: { type: Type.STRING },
      script: { type: Type.STRING },
      visuals: { type: Type.STRING },
      bridgeStrategy: { type: Type.STRING }
    },
    required: ["hook", "script", "visuals", "bridgeStrategy"]
  };

  const contextPrompt = diagnosis ? `
    CHANNEL CONTEXT (Algorithmic Fingerprint):
    - Cluster Center: ${diagnosis.clusterCenter}
    - Audience DNA: ${diagnosis.audienceDNA.map(d => `${d.interest} (${d.overlap}%)`).join(', ')}
  ` : '';

  const prompt = `
    IDENTITY: YouTube Shorts & Virality Specialist.
    TASK: Generate a "Funnel Teaser" Shorts concept.
    GOAL: Create a high-energy vertical video concept that bridges viewers to a main long-form video titled: "${longFormTitle}".
    VIDEO TOPIC: ${topic}
    NICHE: ${niche}
    ${contextPrompt}

    CRITICAL: Use the Audience DNA to craft a hook that specifically triggers the interests of your existing core viewers.

    The Shorts concept should:
    1. Have a "stop-the-scroll" hook.
    2. Provide a "value nugget" but leave a curiosity gap.
    3. EXPLICITLY explain the bridging strategy (how it pushes traffic to the long-form video).
    
    OUTPUT: JSON with 'hook', 'script', 'visuals', and 'bridgeStrategy'.
  `;

  return await executeWithRetry(async () => {
    const modelId = getActiveModel('text');
    const result = await getAiClient().models.generateContent({
      model: modelId,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      }
    });

    const text = result.text;
    if (!text) throw new Error("No funnel teaser generated");

    try {
      const jsonStr = cleanJsonString(text);
      return JSON.parse(jsonStr) as ShortsConcept;
    } catch (e) {
      console.warn(`[Gemini] Funnel Teaser JSON parse failed, attempting self-correction...`);
      return await selfCorrectJson(text, responseSchema);
    }
  });
};

// --- Deep Research ---
export const performDeepResearch = async (topic: string): Promise<string> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: getActiveModel('analysis'),
    contents: `Perform a comprehensive, deep research on the topic: "${topic}". Provide a detailed report covering key aspects, current trends, and actionable insights. Use Google Search to ground your research.`,
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: "You are an expert researcher. Provide detailed, well-structured, and comprehensive reports."
    },
  });
  return response.text || "No research generated.";
};

// --- EXTENDED COMMUNITY & ENGAGEMENT TOOLS ---

export const generateCommunityPosts = async (schedule: string, channelData: string): Promise<string> => {
  const ai = getAiClient();
  const prompt = `IDENTITY: Elite YouTube Community Manager.
  TASK: Generate 7 days of highly engaging community posts based on the creator's schedule and channel context. Include a mix of text posts, image polls, regular polls, video posts, and audience questions. Ensure they specifically boost the planned upcoming content.
  CHANNEL CONTEXT: ${channelData}
  SCHEDULE/PLANS: ${schedule}
  OUTPUT: Provide the response in clear Markdown format broken down by Day 1 to Day 7. Make it highly engaging.`;
  const response = await ai.models.generateContent({ model: getActiveModel('text'), contents: prompt });
  return response.text || "";
};

export const generateCommentResponses = async (comments: string, channelData: string): Promise<string> => {
  const ai = getAiClient();
  const prompt = `IDENTITY: Elite YouTube Audience Strategist.
  TASK: Analyze these recent comments and generate the most effective, engaging responses. For each response, thoughtfully recommend another specific video or playlist from the channel and explain to the viewer exactly WHY they should watch it based on their comment context.
  CHANNEL CONTEXT: ${channelData}
  COMMENTS: ${comments}
  OUTPUT: Provide the response in clear Markdown format. Make it sound human and genuine.`;
  const response = await ai.models.generateContent({ model: getActiveModel('text'), contents: prompt });
  return response.text || "";
};

export const generateEndScreen = async (videoTopic: string, channelData: string): Promise<string> => {
  const ai = getAiClient();
  const prompt = `IDENTITY: YouTube Retention & Binge-Watching Expert.
  TASK: Design an end-screen strategy for a video about "${videoTopic}".
  1. Provide a visual layout description (where to put the subscribe circle, the 'best for viewer' video, and specific playlist).
  2. Write a 10-20 second outro script that naturally transitions into the end screen, asks an engaging question for the comments, and pitches the next specific video to watch (and why it relates to what they just watched).
  3. Suggest the optimal specific video or playlist to link for maximum conversion.
  CHANNEL CONTEXT: ${channelData}
  OUTPUT: Provide the response in clear Markdown format.`;
  const response = await ai.models.generateContent({ model: getActiveModel('text'), contents: prompt });
  return response.text || "";
};
