import { authService } from './authService';

/**
 * YouTube Nexus Service
 * Orchestrates Data v3, Analytics, and Reporting APIs.
 */

const BASE_URL = 'https://www.googleapis.com/youtube/v3';
const ANALYTICS_URL = 'https://youtubeanalytics.googleapis.com/v2';

class YouTubeService {
  private async request(url: string, options: RequestInit = {}) {
    const token = authService.getAccessToken();
    if (!token) throw new Error('Not authenticated');

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    };

    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 401) {
      authService.logout();
      throw new Error('Session expired');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API Request failed');
    }

    return response.json();
  }

  /**
   * Data API: Fetch basic channel statistics
   */
  public async getChannelOverview() {
    const data = await this.request(`${BASE_URL}/channels?part=snippet,statistics,brandingSettings&mine=true`);
    const channel = data.items?.[0];
    
    if (!channel) throw new Error('No channel found');

    return {
      id: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
      customUrl: channel.snippet.customUrl,
      thumbnail: channel.snippet.thumbnails.high.url,
      stats: {
        viewCount: parseInt(channel.statistics.viewCount),
        subscriberCount: parseInt(channel.statistics.subscriberCount),
        videoCount: parseInt(channel.statistics.videoCount)
      }
    };
  }

  /**
   * Data API: Fetch recent videos
   */
  public async getRecentVideos(maxResults = 10) {
    const data = await this.request(`${BASE_URL}/search?part=snippet&maxResults=${maxResults}&order=date&type=video&forMine=true`);
    return data.items || [];
  }

  /**
   * Analytics API: Fetch metrics for a specific time range
   */
  public async getChannelAnalytics(startDate: string, endDate: string) {
    const metrics = [
      'views',
      'estimatedMinutesWatched',
      'averageViewDuration',
      'subscribersGained',
      'subscribersLost',
      'likes',
      'dislikes',
      'comments',
      'shares'
    ].join(',');

    const url = `${ANALYTICS_URL}/reports?` +
      `ids=channel==MINE&` +
      `startDate=${startDate}&` +
      `endDate=${endDate}&` +
      `metrics=${metrics}&` +
      `dimensions=day&` +
      `sort=day`;

    return this.request(url);
  }

  /**
   * Analytics API: Fetch specific video real-time stats
   */
  public async getVideoAnalytics(videoIds: string[], startDate: string, endDate: string) {
    const metrics = 'views,estimatedMinutesWatched,averageViewDuration,likes,subscribersGained';
    const ids = videoIds.map(id => `video==${id}`).join(',');
    
    const url = `${ANALYTICS_URL}/reports?` +
      `ids=channel==MINE&` +
      `startDate=${startDate}&` +
      `endDate=${endDate}&` +
      `metrics=${metrics}&` +
      `filters=video==${videoIds.join(',')}&` +
      `dimensions=video`;

    return this.request(url);
  }
}

export const youtubeService = new YouTubeService();
