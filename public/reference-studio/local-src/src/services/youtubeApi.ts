import { refreshTokenIfExpired } from './youtubeAuth';
import { normalizeRow, HEADER_MAP } from './dataNormalization';

export class YouTubeApiError extends Error {
    constructor(message: string, public code?: number, public reason?: string) {
        super(message);
        this.name = 'YouTubeApiError';
    }
}

export const handleYouTubeApiError = async (response: Response, defaultMessage: string) => {
    let errorMessage = response.statusText || defaultMessage;
    let code: number | undefined = response.status;
    let reason: string | undefined;

    try {
        const errorData = await response.json();
        if (errorData.error) {
            const apiError = errorData.error;
            errorMessage = apiError.message || errorMessage;
            code = apiError.code || code;

            if (apiError.errors && apiError.errors.length > 0) {
                reason = apiError.errors[0].reason;
            }
        }
    } catch (e) {
        // Ignore JSON parse error
    }

    // Map common errors to user-friendly messages
    if (code === 401 || reason === 'authError') {
        throw new YouTubeApiError("Your YouTube session has expired or is invalid. Please reconnect your channel in Settings.", code, reason);
    } else if (code === 403 && (reason === 'quotaExceeded' || reason === 'rateLimitExceeded')) {
        throw new YouTubeApiError("YouTube API quota exceeded. Please try again later or check your Google Cloud Console billing/quotas.", code, reason);
    } else if (code === 403 && (reason === 'forbidden' || reason === 'insufficientPermissions')) {
        throw new YouTubeApiError("Access forbidden. Ensure your API key is valid, has the YouTube Data API v3 enabled, and your account has sufficient permissions.", code, reason);
    } else if (code === 400 && reason === 'keyInvalid') {
        throw new YouTubeApiError("Invalid YouTube API key. Please check your API key in Settings or environment variables.", code, reason);
    }

    throw new YouTubeApiError(`${defaultMessage} (${code}): ${errorMessage}`, code, reason);
};

const normalizeReportData = (data: any) => {
    if (!data.rows || !data.columnHeaders) return data;

    const headers = data.columnHeaders.map((h: any) => h.name);
    const lowerHeaderMap = Object.keys(HEADER_MAP).reduce((acc, key) => {
        acc[key.toLowerCase()] = HEADER_MAP[key];
        return acc;
    }, {} as Record<string, string>);

    data.rows = data.rows.map((row: any[]) => {
        const rowObj: Record<string, any> = {};
        headers.forEach((h: string, i: number) => {
            rowObj[h] = row[i];
        });

        const normalized = normalizeRow(rowObj);

        // Return values in original header order, but using normalized values if they exist
        return headers.map((h: string) => {
            const stdKey = lowerHeaderMap[h.toLowerCase()] || h;
            return normalized[stdKey] ?? rowObj[h];
        });
    });
    return data;
};

export interface ChannelProfile {
    id: string;
    name: string;
    subscriberCount: string;
    totalViews: string;
    totalVideos: string;
    profilePictureUrl: string;
    uploadsPlaylistId?: string;
}

export interface VideoSnippet {
    videoId: string;
    title: string;
    publishedAt: string;
    thumbnail: string;
}

export interface VideoStats {
    videoId: string;
    views: string;
    likes: string;
    comments: string;
    duration: string;
}

const proxyFetch = async (url: string, options: RequestInit = {}) => {
    // Direct fetch — no proxy server needed for client-side OAuth
    return fetch(url, options);
};

export const fetchChannelProfile = async (): Promise<ChannelProfile> => {
    const token = await refreshTokenIfExpired();
    if (!token) throw new YouTubeApiError("Your YouTube session has expired or is invalid. Please reconnect your channel in Settings.", 401, "authError");

    const response = await proxyFetch('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&mine=true', {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
        await handleYouTubeApiError(response, "Failed to fetch channel profile");
    }
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
        throw new Error("No channel found for this user.");
    }

    const channel = data.items[0];

    return {
        id: channel.id,
        name: channel.snippet.title,
        subscriberCount: channel.statistics.subscriberCount,
        totalViews: channel.statistics.viewCount,
        totalVideos: channel.statistics.videoCount,
        profilePictureUrl: channel.snippet.thumbnails.default.url,
        uploadsPlaylistId: channel.contentDetails?.relatedPlaylists?.uploads || undefined
    };
};

export const fetchVideoList = async (maxResults = 50, query?: string, uploadsIdFromProfile?: string): Promise<VideoSnippet[]> => {
    const token = await refreshTokenIfExpired();
    if (!token) throw new YouTubeApiError("Your YouTube session has expired or is invalid. Please reconnect your channel in Settings.", 401, "authError");

    // Case 1: Search Query provided by user
    if (query) {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&forMine=true&type=video&order=date&maxResults=${maxResults}&q=${encodeURIComponent(query)}`;
        const response = await proxyFetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) await handleYouTubeApiError(response, "Failed to fetch video search results");
        const data = await response.json();
        return (data.items || []).map((item: any) => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            publishedAt: item.snippet.publishedAt,
            thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || ""
        }));
    }

    // Case 2: Try stable PlaylistItems API via uploads playlist
    let uploadsId = uploadsIdFromProfile || "";

    if (!uploadsId) {
        try {
            const cache = localStorage.getItem('yt_analytics_cache');
            if (cache) {
                const parsed = JSON.parse(cache);
                if (parsed.profile?.uploadsPlaylistId) uploadsId = parsed.profile.uploadsPlaylistId;
            }
        } catch (e) { }
    }

    if (!uploadsId) {
        try {
            const profileReq = await proxyFetch('https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (profileReq.ok) {
                const pData = await profileReq.json();
                if (pData.items && pData.items.length > 0) {
                    uploadsId = pData.items[0].contentDetails?.relatedPlaylists?.uploads || "";
                }
            }
        } catch (e) { }
    }

    if (uploadsId) {
        try {
            let items: any[] = [];
            let nextPageToken = "";
            let fetched = 0;

            while (fetched < maxResults) {
                const fetchCount = Math.min(50, maxResults - fetched);
                let playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsId}&maxResults=${fetchCount}`;
                if (nextPageToken) playlistUrl += `&pageToken=${nextPageToken}`;

                const response = await proxyFetch(playlistUrl, { headers: { Authorization: `Bearer ${token}` } });
                if (!response.ok) throw new Error("Playlist items fetch failed");

                const data = await response.json();
                const newItems = data.items || [];
                items = items.concat(newItems);
                fetched += newItems.length;
                nextPageToken = data.nextPageToken;
                if (!nextPageToken || newItems.length === 0) break;
            }

            return items.map((item: any) => ({
                videoId: item.contentDetails?.videoId || item.snippet.resourceId.videoId,
                title: item.snippet.title,
                publishedAt: item.snippet.publishedAt,
                thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || ""
            }));
        } catch (e) {
            console.warn("Playlist items fetch failed, falling back to search:", e);
        }
    }

    // Case 3: Final fallback to "My Videos" Search API
    const response = await proxyFetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&forMine=true&maxResults=${maxResults}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) await handleYouTubeApiError(response, "Failed to fetch video list (all methods failed)");
    const data = await response.json();
    return (data.items || []).map((item: any) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        publishedAt: item.snippet.publishedAt,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || ""
    }));
};

export const fetchVideoStats = async (videoIds: string[]): Promise<VideoStats[]> => {
    const token = await refreshTokenIfExpired();
    if (!token) throw new YouTubeApiError("Your YouTube session has expired or is invalid. Please reconnect your channel in Settings.", 401, "authError");

    const stats: VideoStats[] = [];
    for (let i = 0; i < videoIds.length; i += 50) {
        const batch = videoIds.slice(i, i + 50);
        const response = await proxyFetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${batch.join(',')}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
            await handleYouTubeApiError(response, "Failed to fetch video stats");
        }
        const data = await response.json();

        const parseISO8601Duration = (duration: string) => {
            const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
            if (!match) return 0;
            const hours = (parseInt(match[1]) || 0);
            const minutes = (parseInt(match[2]) || 0);
            const seconds = (parseInt(match[3]) || 0);
            return hours * 3600 + minutes * 60 + seconds;
        };

        (data.items || []).forEach((item: any) => {
            stats.push({
                videoId: item.id,
                views: item.statistics.viewCount || "0",
                likes: item.statistics.likeCount || "0",
                comments: item.statistics.commentCount || "0",
                duration: parseISO8601Duration(item.contentDetails.duration).toString()
            });
        });
    }

    return stats;
};

export const fetchAnalytics = async (startDate: string, endDate: string, channelId: string): Promise<any> => {
    const token = await refreshTokenIfExpired();
    if (!token) throw new YouTubeApiError("Your YouTube session has expired or is invalid. Please reconnect your channel in Settings.", 401, "authError");

    const ids = `channel==${channelId}`;

    // Step 1: Core video metrics (NOTE: impressions is NOT supported with video dimension)
    const coreUrl = `https://youtubeanalytics.googleapis.com/v2/reports?ids=${ids}&startDate=${startDate}&endDate=${endDate}&metrics=views,comments,likes,estimatedMinutesWatched,averageViewDuration,shares&dimensions=video&sort=-views`;

    let coreResponse = await proxyFetch(coreUrl, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!coreResponse.ok || (await coreResponse.clone().json()).rows?.length === 0) {
        console.warn("Retrying video analytics with channel==MINE");
        const mineUrl = coreUrl.replace(/ids=channel==[^&]+/, 'ids=channel==MINE');
        coreResponse = await proxyFetch(mineUrl, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    if (!coreResponse.ok) {
        await handleYouTubeApiError(coreResponse, "Failed to fetch video analytics");
    }
    const coreData = normalizeReportData(await coreResponse.json());

    // Step 2: Extract common indices
    const videoIdIdx = coreData.columnHeaders.findIndex((h: any) => h.name.toLowerCase() === 'video');
    if (videoIdIdx === -1) return coreData;

    // Step 3: Fetch Retention % (averageViewPercentage) - often fails when combined
    try {
        const retUrl = `https://youtubeanalytics.googleapis.com/v2/reports?ids=${ids}&startDate=${startDate}&endDate=${endDate}&metrics=averageViewPercentage&dimensions=video`;
        let retResponse = await proxyFetch(retUrl, { headers: { Authorization: `Bearer ${token}` } });
        if (!retResponse.ok) {
            const mineRetUrl = retUrl.replace(/ids=channel==[^&]+/, 'ids=channel==MINE');
            retResponse = await proxyFetch(mineRetUrl, { headers: { Authorization: `Bearer ${token}` } });
        }
        if (retResponse.ok) {
            const retData = normalizeReportData(await retResponse.json());
            const revVideoIdIdx = retData.columnHeaders.findIndex((h: any) => h.name.toLowerCase() === 'video');
            const retMetricIdx = retData.columnHeaders.findIndex((h: any) => h.name.toLowerCase() === 'averageviewpercentage');
            if (revVideoIdIdx !== -1 && retMetricIdx !== -1) {
                const retMap: Record<string, number> = {};
                retData.rows.forEach((row: any[]) => { retMap[row[revVideoIdIdx]] = row[retMetricIdx]; });
                coreData.columnHeaders.push(retData.columnHeaders[retMetricIdx]);
                coreData.rows.forEach((row: any[]) => { row.push(retMap[row[videoIdIdx]] || 0); });
            }
        }
    } catch (e) { console.warn("Retention metrics not available", e); }

    // Step 4: Fetch Subscribers Gained
    try {
        const subUrl = `https://youtubeanalytics.googleapis.com/v2/reports?ids=${ids}&startDate=${startDate}&endDate=${endDate}&metrics=subscribersGained&dimensions=video`;
        let subResponse = await proxyFetch(subUrl, { headers: { Authorization: `Bearer ${token}` } });
        if (!subResponse.ok) {
            const mineSubUrl = subUrl.replace(/ids=channel==[^&]+/, 'ids=channel==MINE');
            subResponse = await proxyFetch(mineSubUrl, { headers: { Authorization: `Bearer ${token}` } });
        }
        if (subResponse.ok) {
            const subData = normalizeReportData(await subResponse.json());
            const subVideoIdIdx = subData.columnHeaders.findIndex((h: any) => h.name.toLowerCase() === 'video');
            const subMetricIdx = subData.columnHeaders.findIndex((h: any) => h.name.toLowerCase() === 'subscribersgained');
            if (subVideoIdIdx !== -1 && subMetricIdx !== -1) {
                const subMap: Record<string, number> = {};
                subData.rows.forEach((row: any[]) => { subMap[row[subVideoIdIdx]] = row[subMetricIdx]; });
                coreData.columnHeaders.push(subData.columnHeaders[subMetricIdx]);
                coreData.rows.forEach((row: any[]) => { row.push(subMap[row[videoIdIdx]] || 0); });
            }
        }
    } catch (e) { console.warn("Subscriber metrics not available", e); }

    // Step 5: Optional revenue per video
    try {
        const revUrl = `https://youtubeanalytics.googleapis.com/v2/reports?ids=${ids}&startDate=${startDate}&endDate=${endDate}&metrics=estimatedRevenue&dimensions=video`;
        let revResponse = await proxyFetch(revUrl, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!revResponse.ok || (await revResponse.clone().json()).rows?.length === 0) {
            const mineRevUrl = revUrl.replace(/ids=channel==[^&]+/, 'ids=channel==MINE');
            revResponse = await proxyFetch(mineRevUrl, {
                headers: { Authorization: `Bearer ${token}` }
            });
        }

        if (revResponse.ok) {
            const revData = normalizeReportData(await revResponse.json());
            if (revData.rows && revData.rows.length > 0 && coreData.rows && coreData.rows.length > 0) {
                // Build a map for easy lookup by Video ID (assume video id is the first dimension)
                const videoIdIdx = coreData.columnHeaders.findIndex((h: any) => h.name.toLowerCase() === 'video');
                const revVideoIdIdx = revData.columnHeaders.findIndex((h: any) => h.name.toLowerCase() === 'video');
                const revMetricIdx = revData.columnHeaders.findIndex((h: any) => h.name.toLowerCase() === 'estimatedrevenue');

                if (videoIdIdx !== -1 && revVideoIdIdx !== -1 && revMetricIdx !== -1) {
                    const revMap: Record<string, number> = {};
                    revData.rows.forEach((row: any[]) => {
                        revMap[row[revVideoIdIdx]] = row[revMetricIdx];
                    });

                    coreData.columnHeaders.push(revData.columnHeaders[revMetricIdx]);
                    coreData.rows.forEach((row: any[]) => {
                        const vid = row[videoIdIdx];
                        row.push(revMap[vid] || 0);
                    });
                }
            }
        }
    } catch (e) {
        console.warn("Video-level revenue analytics not available", e);
    }

    // Step 3: Optional CTR per video (separated because it often fails in combined reports)
    try {
        const ctrUrl = `https://youtubeanalytics.googleapis.com/v2/reports?ids=${ids}&startDate=${startDate}&endDate=${endDate}&metrics=impressionClickThroughRate&dimensions=video`;
        let ctrResponse = await proxyFetch(ctrUrl, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (ctrResponse.ok) {
            const ctrData = normalizeReportData(await ctrResponse.json());
            if (ctrData.rows && ctrData.rows.length > 0 && coreData.rows && coreData.rows.length > 0) {
                const videoIdIdx = coreData.columnHeaders.findIndex((h: any) => h.name.toLowerCase() === 'video');
                const ctrVideoIdIdx = ctrData.columnHeaders.findIndex((h: any) => h.name.toLowerCase() === 'video');
                const ctrMetricIdx = ctrData.columnHeaders.findIndex((h: any) => h.name.toLowerCase() === 'impressionclickthroughrate');

                if (videoIdIdx !== -1 && ctrVideoIdIdx !== -1 && ctrMetricIdx !== -1) {
                    const ctrMap: Record<string, number> = {};
                    ctrData.rows.forEach((row: any[]) => {
                        ctrMap[row[ctrVideoIdIdx]] = Number(row[ctrMetricIdx]) * 100; // Store as %
                    });

                    coreData.columnHeaders.push(ctrData.columnHeaders[ctrMetricIdx]);
                    coreData.rows.forEach((row: any[]) => {
                        const vid = row[videoIdIdx];
                        row.push(ctrMap[vid] || 0);
                    });
                }
            }
        }
    } catch (e) {
        console.warn("Video-level CTR analytics not available", e);
    }

    return coreData;
};

export const fetchTrafficSourceAnalytics = async (startDate: string, endDate: string, channelId: string): Promise<any> => {
    const token = await refreshTokenIfExpired();
    if (!token) throw new YouTubeApiError("Your YouTube session has expired or is invalid.", 401, "authError");

    const url = `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==${channelId}&startDate=${startDate}&endDate=${endDate}&metrics=views,estimatedMinutesWatched,subscribersGained&dimensions=insightTrafficSourceType&sort=-views`;

    try {
        const response = await proxyFetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) return { columnHeaders: [], rows: [] };
        return await response.json();
    } catch (e) {
        console.warn("Traffic source analytics failed", e);
        return { columnHeaders: [], rows: [] };
    }
};

export const fetchDailyAnalytics = async (startDate: string, endDate: string, channelId: string): Promise<any> => {
    const token = await refreshTokenIfExpired();
    if (!token) throw new YouTubeApiError("Your YouTube session has expired or is invalid.", 401, "authError");

    const url = `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==${channelId}&startDate=${startDate}&endDate=${endDate}&metrics=views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained,estimatedRevenue&dimensions=day&sort=day`;

    try {
        const response = await proxyFetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) return { columnHeaders: [], rows: [] };
        return await response.json();
    } catch (e) {
        console.warn("Daily analytics failed", e);
        return { columnHeaders: [], rows: [] };
    }
};

export const fetchChannelAnalytics = async (startDate: string, endDate: string, channelId: string): Promise<any> => {
    const token = await refreshTokenIfExpired();
    if (!token) throw new YouTubeApiError("Your YouTube session has expired or is invalid. Please reconnect your channel in Settings.", 401, "authError");

    const ids = `channel==${channelId}`;

    const fetchReport = async (targetIds: string) => {
        // Core metrics that are usually always available
        const coreMetrics = 'views,comments,likes,estimatedMinutesWatched,averageViewDuration,subscribersGained';
        const url = `https://youtubeanalytics.googleapis.com/v2/reports?ids=${targetIds}&startDate=${startDate}&endDate=${endDate}&metrics=${coreMetrics}`;
        const response = await proxyFetch(url, { headers: { Authorization: `Bearer ${token}` } });
        return response;
    };

    const fetchRevenue = async (targetIds: string) => {
        const url = `https://youtubeanalytics.googleapis.com/v2/reports?ids=${targetIds}&startDate=${startDate}&endDate=${endDate}&metrics=estimatedRevenue`;
        const response = await proxyFetch(url, { headers: { Authorization: `Bearer ${token}` } });
        return response;
    };

    // Step 1: Try explicit ID for core metrics
    let response = await fetchReport(ids);

    // Step 2: Fallback to MINE for core metrics
    if (response.status === 400 || !response.ok || (await response.clone().json()).rows?.length === 0) {
        console.warn("Channel analytics failed or empty, retrying with channel==MINE");
        response = await fetchReport('channel==MINE');
    }

    if (!response.ok) {
        console.error("Channel analytics failed completely:", await response.clone().text());
        return { columnHeaders: [], rows: [] };
    }

    const data = normalizeReportData(await response.json());
    console.log("Channel Analytics Response:", data);

    // Step 3: Try to fetch revenue separately
    try {
        let revResponse = await fetchRevenue(ids);
        if (!revResponse.ok || (await revResponse.clone().json()).rows?.length === 0) {
            revResponse = await fetchRevenue('channel==MINE');
        }

        if (revResponse.ok) {
            const revData = normalizeReportData(await revResponse.json());
            if (revData.rows && revData.rows.length > 0 && data.rows && data.rows.length > 0) {
                data.columnHeaders.push(...revData.columnHeaders);
                data.rows[0].push(...revData.rows[0]);
            }
        }
    } catch (e) {
        console.warn("Revenue metrics not available for this channel", e);
    }

    console.log("Channel Total Analytics:", data.rows?.[0]);
    return data;
};

export const fetchDemographicAnalytics = async (startDate: string, endDate: string, channelId: string): Promise<any> => {
    const token = await refreshTokenIfExpired();
    if (!token) throw new YouTubeApiError("Your YouTube session has expired or is invalid. Please reconnect your channel in Settings.", 401, "authError");

    const ids = `channel==${channelId}`;

    // 1. Fetch by Country
    const countryUrl = `https://youtubeanalytics.googleapis.com/v2/reports?ids=${ids}&startDate=${startDate}&endDate=${endDate}&metrics=views&dimensions=country&sort=-views&maxResults=25`;

    // 2. Fetch by Device
    const deviceUrl = `https://youtubeanalytics.googleapis.com/v2/reports?ids=${ids}&startDate=${startDate}&endDate=${endDate}&metrics=views&dimensions=deviceType&sort=-views`;

    try {
        const [countryRes, deviceRes] = await Promise.all([
            proxyFetch(countryUrl, { headers: { Authorization: `Bearer ${token}` } }),
            proxyFetch(deviceUrl, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const countryData = countryRes.ok ? await countryRes.json() : null;
        const deviceData = deviceRes.ok ? await deviceRes.json() : null;

        return {
            country: countryData,
            device: deviceData
        };
    } catch (e) {
        console.warn("Demographic analytics failed", e);
        return { country: null, device: null };
    }
};

/**
 * Fetches the IDs of all videos in the channel's "Shorts" hidden playlist.
 * Strategy: Replace the 'UC' prefix of the Channel ID with 'UUSH'.
 */
export const fetchShortsPlaylistIds = async (channelId: string): Promise<Set<string>> => {
    const token = await refreshTokenIfExpired();
    if (!token) throw new YouTubeApiError("Your YouTube session has expired or is invalid. Please reconnect your channel in Settings.", 401, "authError");

    // Construct the Shorts playlist ID
    const shortsPlaylistId = channelId.startsWith('UC') ? 'UU' + 'SH' + channelId.substring(2) : channelId;
    const shortsIds = new Set<string>();

    try {
        let nextPageToken = '';
        do {
            const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${shortsPlaylistId}&maxResults=50&pageToken=${nextPageToken}`;
            const response = await proxyFetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) break;

            const data = await response.json();
            (data.items || []).forEach((item: any) => {
                if (item.contentDetails?.videoId) {
                    shortsIds.add(item.contentDetails.videoId);
                }
            });
            nextPageToken = data.nextPageToken || '';
        } while (nextPageToken);
    } catch (e) {
        console.warn("Failed to fetch Shorts playlist", e);
    }

    return shortsIds;
};

export interface VideoDetails extends VideoSnippet {
    description: string;
    tags: string[];
    categoryId: string;
    privacyStatus: string;
}

export const fetchVideoDetails = async (videoId: string): Promise<VideoDetails> => {
    const token = await refreshTokenIfExpired();
    if (!token) throw new YouTubeApiError("Your YouTube session has expired or is invalid. Please reconnect your channel in Settings.", 401, "authError");

    const response = await proxyFetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,status&id=${videoId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
        await handleYouTubeApiError(response, "Failed to fetch video details");
    }
    const data = await response.json();
    if (!data.items || data.items.length === 0) throw new Error("Video not found");

    const item = data.items[0];
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
};

export const updateVideo = async (videoId: string, details: Partial<VideoDetails>): Promise<void> => {
    const token = await refreshTokenIfExpired();
    if (!token) throw new YouTubeApiError("Your YouTube session has expired or is invalid. Please reconnect your channel in Settings.", 401, "authError");

    // First fetch current details to ensure we don't overwrite with empty values if not provided
    const current = await fetchVideoDetails(videoId);

    const body = {
        id: videoId,
        snippet: {
            title: details.title ?? current.title,
            description: details.description ?? current.description,
            tags: details.tags ?? current.tags,
            categoryId: details.categoryId ?? current.categoryId
        },
        status: {
            privacyStatus: details.privacyStatus ?? current.privacyStatus
        }
    };

    const response = await proxyFetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,status`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        await handleYouTubeApiError(response, "Failed to update video");
    }
};

export const updateVideoThumbnail = async (videoId: string, thumbnailFile: File): Promise<void> => {
    const token = await refreshTokenIfExpired();
    if (!token) throw new YouTubeApiError("Your YouTube session has expired or is invalid. Please reconnect your channel in Settings.", 401, "authError");

    const response = await proxyFetch(`https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${videoId}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': thumbnailFile.type
        },
        body: thumbnailFile
    });

    if (!response.ok) {
        await handleYouTubeApiError(response, "Failed to update thumbnail");
    }
};

export interface VideoCategory {
    id: string;
    title: string;
}

export interface Playlist {
    id: string;
    title: string;
}

export interface PlaylistMembership {
    playlistId: string;
    playlistItemId: string;
}

export const fetchVideoCategories = async (regionCode = 'US'): Promise<VideoCategory[]> => {
    const token = await refreshTokenIfExpired();
    if (!token) throw new YouTubeApiError("Your YouTube session has expired or is invalid. Please reconnect your channel in Settings.", 401, "authError");

    const response = await proxyFetch(`https://www.googleapis.com/youtube/v3/videoCategories?part=snippet&regionCode=${regionCode}`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
        await handleYouTubeApiError(response, "Failed to fetch categories");
    }
    const data = await response.json();
    return (data.items || []).map((item: any) => ({
        id: item.id,
        title: item.snippet.title
    }));
};

export const fetchUserPlaylists = async (): Promise<Playlist[]> => {
    const token = await refreshTokenIfExpired();
    if (!token) throw new YouTubeApiError("Your YouTube session has expired or is invalid. Please reconnect your channel in Settings.", 401, "authError");

    const response = await proxyFetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&mine=true&maxResults=50`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
        await handleYouTubeApiError(response, "Failed to fetch playlists");
    }
    const data = await response.json();
    return (data.items || []).map((item: any) => ({
        id: item.id,
        title: item.snippet.title
    }));
};

/**
 * Finds which of the user's playlists a video belongs to.
 * This is an expensive operation as it requires checking each playlist.
 */
export const fetchVideoPlaylistMemberships = async (videoId: string, playlistIds: string[]): Promise<PlaylistMembership[]> => {
    const token = await refreshTokenIfExpired();
    if (!token) throw new YouTubeApiError("Your YouTube session has expired or is invalid. Please reconnect your channel in Settings.", 401, "authError");

    const memberships: PlaylistMembership[] = [];

    // We check each playlist. To optimize, we could limit this or only check relevant ones.
    // For now, we'll check the provided playlistIds.
    await Promise.all(playlistIds.map(async (playlistId) => {
        const response = await proxyFetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=id&playlistId=${playlistId}&videoId=${videoId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            if (data.items && data.items.length > 0) {
                memberships.push({
                    playlistId,
                    playlistItemId: data.items[0].id
                });
            }
        }
    }));

    return memberships;
};

export const addToPlaylist = async (playlistId: string, videoId: string): Promise<void> => {
    const token = await refreshTokenIfExpired();
    if (!token) throw new YouTubeApiError("Your YouTube session has expired or is invalid. Please reconnect your channel in Settings.", 401, "authError");

    const response = await proxyFetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            snippet: {
                playlistId,
                resourceId: {
                    kind: 'youtube#video',
                    videoId
                }
            }
        })
    });

    if (!response.ok) {
        await handleYouTubeApiError(response, "Failed to add to playlist");
    }
};

export const removeFromPlaylist = async (playlistItemId: string): Promise<void> => {
    const token = await refreshTokenIfExpired();
    if (!token) throw new YouTubeApiError("Your YouTube session has expired or is invalid. Please reconnect your channel in Settings.", 401, "authError");

    const response = await proxyFetch(`https://www.googleapis.com/youtube/v3/playlistItems?id=${playlistItemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
        await handleYouTubeApiError(response, "Failed to remove from playlist");
    }
};

export interface SingleVideoAnalytics {
    shares: string;
    averageViewPercentage: string;
    estimatedRevenue: string;
    clickThroughRate: string;
}

export const fetchSingleVideoAnalytics = async (videoId: string): Promise<SingleVideoAnalytics | null> => {
    const token = await refreshTokenIfExpired();
    if (!token) return null;

    const endDate = new Date().toISOString().split('T')[0];
    const startDate = '2000-01-01';

    try {
        const metrics = 'shares,averageViewPercentage,annotationClickThroughRate';
        const url = `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE&filters=video==${videoId}&startDate=${startDate}&endDate=${endDate}&metrics=${metrics}`;

        const response = await proxyFetch(url, { headers: { Authorization: `Bearer ${token}` } });
        let shares = "0";
        let apv = "0";
        let ctr = "N/A";

        if (response.ok) {
            const data = await response.json();
            if (data.rows && data.rows.length > 0) {
                const headers = data.columnHeaders.map((h: any) => h.name);
                const row = data.rows[0];
                const sharesIdx = headers.indexOf('shares');
                const apvIdx = headers.indexOf('averageViewPercentage');
                const ctrIdx = headers.indexOf('annotationClickThroughRate');

                if (sharesIdx !== -1) shares = row[sharesIdx].toString();
                if (apvIdx !== -1) apv = Number(row[apvIdx]).toFixed(1);
                if (ctrIdx !== -1 && row[ctrIdx] != null) ctr = (Number(row[ctrIdx]) * 100).toFixed(1) + '%';
            }
        } else {
            const fallbackUrl = `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE&filters=video==${videoId}&startDate=${startDate}&endDate=${endDate}&metrics=shares,averageViewPercentage`;
            const fallbackResponse = await proxyFetch(fallbackUrl, { headers: { Authorization: `Bearer ${token}` } });
            if (fallbackResponse.ok) {
                const data = await fallbackResponse.json();
                if (data.rows && data.rows.length > 0) {
                    const headers = data.columnHeaders.map((h: any) => h.name);
                    const row = data.rows[0];
                    const sharesIdx = headers.indexOf('shares');
                    const apvIdx = headers.indexOf('averageViewPercentage');
                    if (sharesIdx !== -1) shares = row[sharesIdx].toString();
                    if (apvIdx !== -1) apv = Number(row[apvIdx]).toFixed(1);
                }
            }
        }

        let revenue = "0.00";
        const revUrl = `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE&filters=video==${videoId}&startDate=${startDate}&endDate=${endDate}&metrics=estimatedRevenue`;
        const revResponse = await proxyFetch(revUrl, { headers: { Authorization: `Bearer ${token}` } });
        if (revResponse.ok) {
            const revData = await revResponse.json();
            if (revData.rows && revData.rows.length > 0) {
                const revHeaders = revData.columnHeaders.map((h: any) => h.name);
                const revIdx = revHeaders.indexOf('estimatedRevenue');
                if (revIdx !== -1) revenue = Number(revData.rows[0][revIdx]).toFixed(2);
            }
        }

        return { shares, averageViewPercentage: apv, estimatedRevenue: revenue, clickThroughRate: ctr };
    } catch (e) {
        console.warn("Failed to fetch single video analytics", e);
        return null;
    }
};