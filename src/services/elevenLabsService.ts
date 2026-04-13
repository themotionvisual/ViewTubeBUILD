/**
 * ElevenLabs TTS Service
 * Part of the Universal API Bridge for ViewTUBE.
 */
import { getVaultKey } from './keyVault';

const BASE_URL = 'https://api.elevenlabs.io/v1';

class ElevenLabsService {
  private getApiKey() {
    return getVaultKey('elevenLabs');
  }

  public async generateSpeech(text: string, voiceId = '21m00Tcm4TlvDq8ikWAM') {
    const apiKey = this.getApiKey();
    if (!apiKey) throw new Error('ElevenLabs API Key not found in Vault');

    const response = await fetch(`${BASE_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.message || 'ElevenLabs request failed');
    }

    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
  }

  public async getVoices() {
    const apiKey = this.getApiKey();
    if (!apiKey) throw new Error('ElevenLabs API Key not found in Vault');

    const response = await fetch(`${BASE_URL}/voices`, {
      headers: { 'xi-api-key': apiKey }
    });

    return response.json();
  }
}

export const elevenLabsService = new ElevenLabsService();
