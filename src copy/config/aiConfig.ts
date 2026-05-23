export type GeminiModelFamily = '3.0' | '3.1'
export type GeminiModelTier = 'flash' | 'pro' | 'lite' | 'image'

export interface GeminiModel {
  id: string
  name: string
  family: GeminiModelFamily
  tier: GeminiModelTier
  costMultiplier: number
  description: string
}

/**
 * GEMINI MODEL REGISTRY - MAY 2026 EDITION
 * Updated to reflect new model aliases and specialized tiers.
 */
export const GEMINI_MODELS: GeminiModel[] = [
  // 3.1 Family (Primary)
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview', family: '3.1', tier: 'pro', costMultiplier: 15, description: 'Deep reasoning, complex coding, and strategic analysis.' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', family: '3.1', tier: 'lite', costMultiplier: 1, description: 'High-volume, low-latency. Best for SEO & Metadata.' },
  { id: 'gemini-3.1-flash-image-preview', name: 'Gemini 3.1 Flash Image', family: '3.1', tier: 'image', costMultiplier: 5, description: 'Optimized for thumbnail generation and text rendering in images.' },
  
  // 3.0 Family
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', family: '3.0', tier: 'flash', costMultiplier: 2, description: 'Balanced multimodal understanding for video and audio analysis.' },
  
  // Legacy / Fallback (Internal Only)
  { id: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro (Standard)', family: '3.1', tier: 'pro', costMultiplier: 15, description: 'Standard pro tier.' },
  { id: 'gemini-3.1-flash', name: 'Gemini 3.1 Flash (Standard)', family: '3.1', tier: 'flash', costMultiplier: 1.5, description: 'Standard flash tier.' },
  { id: 'gemini-3.0-flash', name: 'Gemini 3.0 Flash (Legacy)', family: '3.0', tier: 'flash', costMultiplier: 1, description: 'Deprecated. Use Flash Lite instead.' },
]

export const DEFAULT_MODEL_ID = 'gemini-3.1-flash-lite'

