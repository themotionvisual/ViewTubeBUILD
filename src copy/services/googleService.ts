import { getAccessToken, logout } from './authSession';

/**
 * Base Google Service
 * Provides a unified request handler for all Google APIs (Drive, Calendar, etc.)
 */
export class GoogleService {
  protected async request(baseUrl: string, endpoint: string, options: RequestInit = {}) {
    const token = getAccessToken();
    if (!token) throw new Error('Not authenticated');

    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
    
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    };

    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 401) {
      logout();
      throw new Error('Session expired or unauthorized');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown API error' } }));
      throw new Error(error.error?.message || `API Request failed: ${response.status}`);
    }

    return response.json();
  }

  // --- Drive API ---
  public async createFolder(name: string, parentId?: string) {
    const body: any = {
      name,
      mimeType: 'application/vnd.google-apps.folder'
    };
    if (parentId) body.parents = [parentId];

    return this.request('https://www.googleapis.com/drive/v3', '/files', {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  public async uploadFile(name: string, content: string | Blob, mimeType: string, parentId?: string) {
    // For simplicity in a web-based Creator OS, we use the simple upload endpoint
    // More complex uploads would use the /upload/drive/v3/files?uploadType=multipart
    
    const metadata = {
      name,
      mimeType,
      parents: parentId ? [parentId] : []
    };

    // Multipart upload
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', content instanceof Blob ? content : new Blob([content], { type: mimeType }));

    return this.request('https://www.googleapis.com/upload/drive/v3', '/files?uploadType=multipart', {
      method: 'POST',
      body: form,
      // override default content-type for multipart
      headers: { 'Content-Type': undefined } as any 
    });
  }

  // --- Calendar API ---
  public async createEvent(calendarId: string, event: { summary: string, description: string, start: { date: string }, end: { date: string } }) {
    return this.request('https://www.googleapis.com/calendar/v3', `/calendars/${calendarId}/events`, {
      method: 'POST',
      body: JSON.stringify(event)
    });
  }

  public async listFiles(query?: string) {
    const q = query ? `?q=${encodeURIComponent(query)}` : '';
    return this.request('https://www.googleapis.com/drive/v3', `/files${q}`);
  }

  public async getUserInfo(): Promise<{ email: string }> {
    return this.request('https://www.googleapis.com', '/oauth2/v3/userinfo');
  }
}

export const googleService = new GoogleService();
