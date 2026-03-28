import { authService } from './authService';

/**
 * Google Sheets Service
 * Handles data portability and sync for ViewTUBE.
 */

const BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

interface ExportOptions {
  title: string;
  rows: any[][];
}

class SheetsService {
  private async request(url: string, options: RequestInit = {}) {
    const token = authService.getAccessToken();
    if (!token) throw new Error('Not authenticated');

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    };

    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 401) {
      authService.logout();
      throw new Error('Session expired');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Sheets API Request failed');
    }

    return response.json();
  }

  /**
   * Create a new spreadsheet and populate it with data
   */
  public async exportToNewSheet(options: ExportOptions) {
    // 1. Create the spreadsheet
    const spreadsheet = await this.request(BASE_URL, {
      method: 'POST',
      body: JSON.stringify({
        properties: {
          title: `ViewTUBE Export: ${options.title}`
        }
      })
    });

    const spreadsheetId = spreadsheet.spreadsheetId;

    // 2. Add the data
    await this.request(`${BASE_URL}/${spreadsheetId}/values/A1:append?valueInputOption=USER_ENTERED`, {
      method: 'POST',
      body: JSON.stringify({
        values: options.rows
      })
    });

    return {
      spreadsheetId,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
    };
  }

  /**
   * Specifically export SEO Results
   */
  public async exportSeoResult(projectName: string, seoData: any) {
    const rows = [
      ['ViewTUBE SEO Engine Export', '', new Date().toLocaleString()],
      ['Project', projectName],
      [''],
      ['Suggested Titles'],
      ...seoData.titleSets.map((t: any) => [t.title]),
      [''],
      ['Description Draft'],
      [seoData.description],
      [''],
      ['Keyword Tags'],
      [seoData.tags]
    ];

    return this.exportToNewSheet({
      title: projectName,
      rows
    });
  }
}

export const sheetsService = new SheetsService();
