import { fetchChannelProfile, fetchVideoList, fetchVideoStats, fetchAnalytics, fetchChannelAnalytics, fetchShortsPlaylistIds, fetchDemographicAnalytics, fetchTrafficSourceAnalytics, fetchDailyAnalytics } from './youtubeApi';
import { isChannelConnected, refreshTokenIfExpired } from './youtubeAuth';
import { ytApiQueue } from '../utils/RequestQueue';

let syncInterval: number | null = null;

export const performSync = async (force = false) => {
  if (!isChannelConnected()) return;

  // Smart Cache Check
  const prevCache = JSON.parse(localStorage.getItem('yt_analytics_cache') || '{}');
  if (!force && prevCache.lastSynced && (Date.now() - prevCache.lastSynced < 4 * 60 * 60 * 1000)) {
    console.log("Analytics Sync: Using fresh cache (less than 4 hours old).");
    return;
  }

  let cacheData = { ...prevCache, lastSynced: prevCache.lastSynced || null };

  try {
    const profile = await ytApiQueue.add(() => fetchChannelProfile());
    cacheData.profile = profile;

    let videos: any[] = [];
    let stats: Record<string, any> = {};

    try {
      videos = await ytApiQueue.add(() => fetchVideoList(500, undefined, profile.uploadsPlaylistId));
      if (videos.length > 0) cacheData.videos = videos;

      const videoIds = videos.map(v => v.videoId);
      if (videoIds.length > 0) {
        const [rawStats, shortsPlaylistIds] = await Promise.all([
          ytApiQueue.add(() => fetchVideoStats(videoIds)),
          ytApiQueue.add(() => fetchShortsPlaylistIds(profile.id))
        ]);

        rawStats.forEach(s => {
          let durationSeconds = 0;
          if (s.duration.startsWith('PT')) {
            const match = s.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
            if (match) {
              durationSeconds = (parseInt(match[1] || '0') * 3600) +
                (parseInt(match[2] || '0') * 60) +
                (parseInt(match[3] || '0'));
            }
          } else {
            durationSeconds = parseInt(s.duration) || 0;
          }

          stats[s.videoId] = {
            viewCount: parseInt(s.views),
            likeCount: parseInt(s.likes),
            commentCount: parseInt(s.comments),
            durationSeconds: durationSeconds,
            durationRaw: s.duration,
            isShort: shortsPlaylistIds.has(s.videoId)
          };
        });
        if (Object.keys(stats).length > 0) cacheData.stats = stats;
      }
    } catch (e) {
      console.warn("Video list or public stats fetch failed:", e);
    }

    const now = new Date();
    const endDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const startDate = new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Video-level analytics
    try {
      const analytics = await ytApiQueue.add(() => fetchAnalytics(startDate, endDate, profile.id));
      if (analytics) cacheData.analytics = analytics;
    } catch (e) {
      console.warn("Video-level Analytics API failed:", e);
    }

    // Channel-level analytics
    try {
      const channelAnalytics = await ytApiQueue.add(() => fetchChannelAnalytics(startDate, endDate, profile.id));
      if (channelAnalytics) cacheData.channelAnalytics = channelAnalytics;
    } catch (e) {
      console.warn("Channel-level Analytics API failed:", e);
    }

    // Demographic analytics
    try {
      const demographics = await ytApiQueue.add(() => fetchDemographicAnalytics(startDate, endDate, profile.id));
      if (demographics) cacheData.demographics = demographics;
    } catch (e) {
      console.warn("Demographic Analytics API failed:", e);
    }

    // Traffic Source analytics
    try {
      const trafficSources = await ytApiQueue.add(() => fetchTrafficSourceAnalytics(startDate, endDate, profile.id));
      if (trafficSources) cacheData.trafficSources = trafficSources;
    } catch (e) {
      console.warn("Traffic Source Analytics API failed:", e);
    }

    // Daily metrics
    try {
      const dailyMetrics = await ytApiQueue.add(() => fetchDailyAnalytics(startDate, endDate, profile.id));
      if (dailyMetrics) cacheData.dailyMetrics = dailyMetrics;
    } catch (e) {
      console.warn("Daily Analytics API failed:", e);
    }

    cacheData.lastSynced = Date.now();
    localStorage.setItem('yt_analytics_cache', JSON.stringify(cacheData));
    window.dispatchEvent(new CustomEvent('yt_analytics_synced', { detail: cacheData }));
  } catch (error: any) {
    console.error("Failed to sync YouTube analytics:", error);
    window.dispatchEvent(new CustomEvent('yt_analytics_synced', { detail: cacheData }));
    if (error?.message?.includes("session has expired") || error?.code === 401) {
      const { disconnectChannel } = await import('./youtubeAuth');
      disconnectChannel();
    }
    throw error;
  }
};

export const startAutoSync = (intervalMinutes = 30) => {
  if (syncInterval) return;

  if (isChannelConnected()) {
    performSync(); // Initial sync
  }

  syncInterval = window.setInterval(() => {
    if (isChannelConnected()) {
      performSync(true); // Force sync on interval
    } else {
      stopAutoSync();
    }
  }, intervalMinutes * 60 * 1000);
};

export const stopAutoSync = () => {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
};
