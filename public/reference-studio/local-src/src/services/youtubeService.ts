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

  }

  /**
   * Data API: Fetch comprehensive video list with fallback
   */
  public async fetchVideoList(maxResults = 50, query?: string) {
    // If query exists, use search
    if (query) {
      const data = await this.request(`${BASE_URL}/search?part=snippet&forMine=true&type=video&order=date&maxResults=${maxResults}&q=${encodeURIComponent(query)}`);
      return (data.items || []).map((item: any) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        publishedAt: item.snippet.publishedAt,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || ""
      }));
    }

    // Default: try search for mine (most reliable for "Recent")
    const data = await this.request(`${BASE_URL}/search?part=snippet&type=video&forMine=true&maxResults=${maxResults}&order=date`);
    return (data.items || []).map((item: any) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      publishedAt: item.snippet.publishedAt,
      thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || ""
    }));
  }

  /**
   * Data API: Fetch specific video stats
   */
  public async fetchVideoStats(videoIds: string[]) {
    const data = await this.request(`${BASE_URL}/videos?part=statistics,contentDetails&id=${videoIds.join(',')}`);
    
    const parseISO8601Duration = (duration: string) => {
      const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
      if (!match) return 0;
      const hours = (parseInt(match?.[1] || "0"));
      const minutes = (parseInt(match?.[2] || "0"));
      const seconds = (parseInt(match?.[3] || "0"));
      return hours * 3600 + minutes * 60 + seconds;
    };

    return (data.items || []).map((item: any) => ({
      videoId: item.id,
      views: item.statistics.viewCount || "0",
      likes: item.statistics.likeCount || "0",
      comments: item.statistics.commentCount || "0",
      duration: parseISO8601Duration(item.contentDetails.duration).toString()
    }));
  }

  /**
   * Data API: Fetch full video details
   */
  public async fetchVideoDetails(videoId: string) {
    const data = await this.request(`${BASE_URL}/videos?part=snippet,status&id=${videoId}`);
    const item = data.items?.[0];
    if (!item) throw new Error("Video not found");

    return {
      videoId: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
      tags: item.snippet.tags || [],
      categoryId: item.snippet.categoryId,
      privacyStatus: item.status.privacyStatus
    };
  }

  /**
   * Data API: Update video metadata
   */
  public async updateVideo(videoId: string, details: any) {
    const body = {
      id: videoId,
      snippet: {
        title: details.title,
        description: details.description,
        tags: details.tags,
        categoryId: details.categoryId
      },
      status: {
        privacyStatus: details.privacyStatus
      }
    };

    return this.request(`${BASE_URL}/videos?part=snippet,status`, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * Data API: Update thumbnail
   */
  public async updateVideoThumbnail(videoId: string, thumbnailFile: File) {
    return this.request(`https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${videoId}`, {
      method: 'POST',
      headers: { 'Content-Type': thumbnailFile.type },
      body: thumbnailFile
    });
  }

  /**
   * Data API: Categories & Playlists
   */
  public async fetchVideoCategories() {
    const data = await this.request(`${BASE_URL}/videoCategories?part=snippet&regionCode=US`);
    return (data.items || []).map((item: any) => ({ id: item.id, title: item.snippet.title }));
  }

  public async fetchUserPlaylists() {
    const data = await this.request(`${BASE_URL}/playlists?part=snippet&mine=true&maxResults=50`);
    return (data.items || []).map((item: any) => ({ id: item.id, title: item.snippet.title }));
  }

  public async fetchVideoPlaylistMemberships(videoId: string, playlistIds: string[]) {
    const memberships: any[] = [];
    await Promise.all(playlistIds.map(async (playlistId) => {
      try {
        const data = await this.request(`${BASE_URL}/playlistItems?part=id&playlistId=${playlistId}&videoId=${videoId}`);
        if (data.items && data.items.length > 0) {
          memberships.push({ playlistId, playlistItemId: data.items[0].id });
        }
      } catch (e) { /* ignore single playlist errors */ }
    }));
    return memberships;
  }

  public async addToPlaylist(playlistId: string, videoId: string) {
    return this.request(`${BASE_URL}/playlistItems?part=snippet`, {
      method: 'POST',
      body: JSON.stringify({
        snippet: {
          playlistId,
          resourceId: { kind: 'youtube#video', videoId }
        }
      }),
      headers: { 'Content-Type': 'application/json' }
    });
  }

  public async removeFromPlaylist(playlistItemId: string) {
    return this.request(`${BASE_URL}/playlistItems?id=${playlistItemId}`, { method: 'DELETE' });
  }

  /**
   * Analytics API: Single video deep dive
   */
  public async fetchSingleVideoAnalytics(videoId: string) {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = '2000-01-01';
    const metrics = 'shares,averageViewPercentage,annotationClickThroughRate,estimatedRevenue';
    
    try {
      const data = await this.request(`${ANALYTICS_URL}/reports?ids=channel==MINE&filters=video==${videoId}&startDate=${startDate}&endDate=${endDate}&metrics=${metrics}`);
      if (data.rows && data.rows.length > 0) {
        const row = data.rows[0];
        return {
          shares: row[0].toString(),
          averageViewPercentage: row[1].toFixed(1),
          clickThroughRate: row[2] ? row[2].toFixed(1) + '%' : 'N/A',
          estimatedRevenue: row[3] ? row[3].toFixed(2) : '0.00'
        };
      }
    } catch (e) { console.warn("Deep analytics failed", e); }
    return null;
  }
}

export const youtubeService = new YouTubeService();
