/**
 * Auphonic Audio Service
 * Part of the Universal API Bridge for ViewTUBE.
 */

const BASE_URL = 'https://auphonic.com/api';

class AuphonicService {
  private getApiKey() {
    return localStorage.getItem('vt_auphonic_key');
  }

  public async startProduction(audioUrl: string, title: string) {
    const apiKey = this.getApiKey();
    if (!apiKey) throw new Error('Auphonic API Key not found in Vault');

    // Auphonic uses Basic Auth (Bearer ap_...) usually or a dedicated token
    const response = await fetch(`${BASE_URL}/productions.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        input_file: audioUrl,
        metadata: {
          title: `ViewTUBE: ${title}`
        },
        algorithms: {
          denoise: true,
          loudness: true,
          balancer: true
        },
        output_basename: `viewtube_enhanced_${Date.now()}`
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_message || 'Auphonic production failed');
    }

    return response.json();
  }

  public async getProductionStatus(uuid: string) {
    const apiKey = this.getApiKey();
    if (!apiKey) throw new Error('Auphonic API Key not found in Vault');

    const response = await fetch(`${BASE_URL}/production/${uuid}.json`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    return response.json();
  }
}

export const auphonicService = new AuphonicService();
