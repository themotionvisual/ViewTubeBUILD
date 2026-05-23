import { hasVaultKey } from './keyVault';
import { elevenLabsService } from './elevenLabsService';
import { auphonicService } from './auphonicService';
import { generateSpeech as generateGeminiSpeech } from './gemini';

export type SpeechProvider = 'elevenlabs' | 'gemini';

export interface AudioProviderStatus {
  elevenLabsReady: boolean;
  auphonicReady: boolean;
  geminiReady: boolean;
}

export interface SpeechRequest {
  text: string;
  provider?: SpeechProvider;
  voiceId?: string;
  geminiVoiceName?: string;
}

export const getAudioProviderStatus = (): AudioProviderStatus => ({
  elevenLabsReady: hasVaultKey('elevenLabs'),
  auphonicReady: hasVaultKey('auphonic'),
  geminiReady: hasVaultKey('gemini'),
});

export const synthesizeSpeech = async ({
  text,
  provider = 'elevenlabs',
  voiceId,
  geminiVoiceName,
}: SpeechRequest): Promise<string> => {
  if (provider === 'gemini') {
    return generateGeminiSpeech(text, geminiVoiceName || 'Kore');
  }

  return elevenLabsService.generateSpeech(text, voiceId);
};

export const enhanceSpeech = async (audioUrl: string, title: string) => {
  return auphonicService.startProduction(audioUrl, title);
};

export const pollEnhancedSpeech = async (uuid: string) => {
  return auphonicService.getProductionStatus(uuid);
};
