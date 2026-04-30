import React, { useMemo, useState } from 'react';
import type { ChartConfig } from '../types';
import { RenderChart } from './ChartEngine';
import { CHART_THEME, getChartSpecById } from '../chartSystem/unifiedChartSpec';
import {
  getAvpRawPercent,
  resolveCtrPercent,
  resolveImpressions,
} from '../services/metricAliasResolver';

type Rows = Array<Record<string, unknown>>;

interface ChannelyticsChartToolboxProps {
  rows: Rows;
  dataDateRange?: string;
}

type FormatFilter = 'all' | 'shorts' | 'long';
type TimeFilter = 'all' | '30d' | '90d';
type SelectionMode = 'all_visible' | 'top_10' | 'top_25' | 'top_50';

const num = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return 0;
  const cleaned = value.replace(/,/g, '').replace(/%/g, '').trim();
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

const text = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (value == null) return '';
  return String(value);
};

const firstDefined = (row: Record<string, unknown>, keys: string[]): unknown => {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && text(value).trim() !== '') return value;
  }
  return undefined;
};

const getByPattern = (row: Record<string, unknown>, exact: string[], contains: string[]): number => {
  const direct = num(firstDefined(row, exact));
  if (direct > 0) return direct;
  const hit = Object.entries(row).find(([key]) => {
    const lower = key.toLowerCase();
    return contains.some((pattern) => lower.includes(pattern));
  });
  return hit ? num(hit[1]) : 0;
};

const getViews = (row: Record<string, unknown>): number =>
  getByPattern(row, ['Views', 'View count', 'Engaged views'], ['view']);

const getImpressions = (row: Record<string, unknown>): number =>
  resolveImpressions(row).value ?? 0;

const getWatchHours = (row: Record<string, unknown>): number => {
  const hours = getByPattern(row, ['Watch Time (Hours)', 'Watch time (hours)', 'Watch Hours'], ['watch time (hours)']);
  if (hours > 0) return hours;
  const minutes = getByPattern(row, ['Estimated minutes watched', 'estimatedMinutesWatched'], ['minuteswatched']);
  if (minutes > 0) return minutes / 60;
  return 0;
};

const getSubscribers = (row: Record<string, unknown>): number =>
  getByPattern(row, ['Subscribers Gained', 'Subscribers', 'subscribersGained'], ['subscriber']);

const getRevenue = (row: Record<string, unknown>): number =>
  getByPattern(
    row,
    ['Revenue', 'Estimated revenue', 'Estimated revenue (USD)', 'Your estimated revenue (USD)', 'estimatedRevenue'],
    ['revenue'],
  );

const getCtr = (row: Record<string, unknown>): number => {
  return resolveCtrPercent(row).value ?? 0;
};

const getAvp = (row: Record<string, unknown>): number => {
  const directRaw = getAvpRawPercent(row);
  if (directRaw && Number.isFinite(directRaw) && directRaw > 0) {
    return Math.min(200, directRaw);
  }
  const raw = getByPattern(
    row,
    [
      'AVP %',
      'AVP (%)',
      'Average percentage viewed (%)',
      'averageViewPercentage',
      'STW %',
      'Stayed to watch (%)',
      'stayedToWatch',
    ],
    ['averageviewpercentage', 'avp', 'stayed to watch', 'stw'],
  );
  const pct = raw > 0 && raw <= 1 ? raw * 100 : raw;
  return Math.min(200, pct);
};

const getAvdSeconds = (row: Record<string, unknown>): number => {
  const direct = getByPattern(
    row,
    ['Average view duration', 'averageViewDuration', 'AVD (Sec)'],
    ['average view duration', 'avd'],
  );
  if (direct > 0) return direct;
  const textDuration = text(firstDefined(row, ['Average view duration', 'averageViewDuration']));
  if (!textDuration.includes(':')) return 0;
  const parts = textDuration.split(':').map((part) => Number(part) || 0);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
};

const getDurationSeconds = (row: Record<string, unknown>): number => {
  const raw = firstDefined(row, ['Duration', 'Video length', 'videoLength']);
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  const value = text(raw).trim();
  if (!value) return 0;
  if (value.includes(':')) {
    const parts = value.split(':').map((part) => Number(part) || 0);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
  }
  const asNum = Number(value);
  return Number.isFinite(asNum) ? asNum : 0;
};

const getTitle = (row: Record<string, unknown>, index: number): string =>
  text(firstDefined(row, ['Video title', 'Video', 'Dimension', 'Title'])) || `Video ${index + 1}`;

const getDate = (row: Record<string, unknown>): Date | null => {
  const candidate = text(firstDefined(row, ['Date', 'Video publish time', 'Publish Date', 'publishedAt']));
  if (!candidate) return null;
  const parsed = new Date(candidate);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getTag = (row: Record<string, unknown>): 'shorts' | 'long' => {
  const value = text(row._userTag).toLowerCase();
  if (value === 'shorts') return 'shorts';
  return 'long';
};

export const ChannelyticsChartToolbox: React.FC<ChannelyticsChartToolboxProps> = ({
  rows,
  dataDateRange = '',
}) => {
  const topPerformersSpec = getChartSpecById('top-performers-trio');
  const valueMatrixSpec = getChartSpecById('video-value-matrix');
  const triggerSpec = getChartSpecById('algorithm-trigger');
  const deviceSpec = getChartSpecById('device-immersion');
  const geoSpec = getChartSpecById('global-footprint');
  const engagementSpec = getChartSpecById('engagement-map');

  const [formatFilter, setFormatFilter] = useState<FormatFilter>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [topLimit, setTopLimit] = useState<number>(25);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('top_25');
  const [engagementSortBy, setEngagementSortBy] = useState<'Comments' | 'Subscribers' | 'Shares' | 'Likes'>('Comments');

  const filteredRows = useMemo(() => {
    const latestRowTimestamp = rows.reduce((maxTs, row) => {
      const ts = getDate(row)?.getTime() ?? 0;
      return ts > maxTs ? ts : maxTs;
    }, 0);
    const anchorTs = latestRowTimestamp || 0;
    const cutoffMs = timeFilter === '30d' ? 30 * 86_400_000 : timeFilter === '90d' ? 90 * 86_400_000 : 0;

    return rows
      .filter((row) => {
        if (formatFilter !== 'all' && getTag(row) !== formatFilter) return false;
        if (cutoffMs > 0) {
          const date = getDate(row);
          if (!date) return false;
          if (date.getTime() < anchorTs - cutoffMs) return false;
        }
        return true;
      })
      .sort((a, b) => getViews(b) - getViews(a));
  }, [rows, formatFilter, timeFilter]);

  const visibleRows = useMemo(() => filteredRows.slice(0, topLimit), [filteredRows, topLimit]);

  const selectedRows = useMemo(() => {
    if (selectionMode === 'top_10') return visibleRows.slice(0, 10);
    if (selectionMode === 'top_25') return visibleRows.slice(0, 25);
    if (selectionMode === 'top_50') return visibleRows.slice(0, 50);
    return visibleRows;
  }, [visibleRows, selectionMode]);

  const selectedRowsLabel = `${selectedRows.length} videos shown`;

  const topPerformersData = useMemo(() => {
    const topRevenue = [...selectedRows]
      .map((row, index) => ({ title: getTitle(row, index), value: getRevenue(row) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
    const topWatch = [...selectedRows]
      .map((row, index) => ({ title: getTitle(row, index), value: getWatchHours(row) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
    const topSubs = [...selectedRows]
      .map((row, index) => ({ title: getTitle(row, index), value: getSubscribers(row) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    return {
      moneyMakers: [['Video', 'Revenue'], ...topRevenue.map((item) => [item.title, item.value])],
      mostViewed: [['Video', 'Watch Hours'], ...topWatch.map((item) => [item.title, item.value])],
      newSubs: [['Video', 'Subscribers'], ...topSubs.map((item) => [item.title, item.value])],
    };
  }, [selectedRows]);

  const engagementMapData = useMemo(() => {
    const recent = [...selectedRows]
      .filter((row) => getViews(row) > 0)
      .sort((a, b) => (getDate(b)?.getTime() || 0) - (getDate(a)?.getTime() || 0))
      .slice(0, 50);

    const metricAccessor = (row: Record<string, unknown>, metric: typeof engagementSortBy): number => {
      if (metric === 'Comments') return getByPattern(row, ['Comments', 'commentCount'], ['comment']);
      if (metric === 'Subscribers') return getByPattern(row, ['Subscribers Gained', 'Subscribers', 'subscribersGained'], ['subscriber']);
      if (metric === 'Shares') return getByPattern(row, ['Shares', 'shareCount'], ['share']);
      return getByPattern(row, ['Likes', 'likeCount'], ['like']);
    };

    const ranked = recent
      .map((row) => ({
        row,
        comments: metricAccessor(row, 'Comments'),
        subscribers: metricAccessor(row, 'Subscribers'),
        shares: metricAccessor(row, 'Shares'),
        likes: metricAccessor(row, 'Likes'),
      }))
      .sort((a, b) => metricAccessor(b.row, engagementSortBy) - metricAccessor(a.row, engagementSortBy));

    const header = ['Video', 'Comments', 'Subscribers', 'Shares', 'Likes'];
    if (ranked.length === 0) return [header, ['No Data', 0, 0, 0, 0]];
    return [
      header,
      ...ranked.map((item, idx) => [getTitle(item.row, idx).toUpperCase(), item.comments, item.subscribers, item.shares, item.likes]),
    ];
  }, [selectedRows, engagementSortBy]);

  const retentionCliffData = useMemo(() => {
    const header = ['Duration (Minutes)', 'Average % Viewed', { role: 'tooltip', type: 'string' }];
    const rows = selectedRows
      .map((row, index) => {
        const durationSec = getDurationSeconds(row);
        const durationMin = durationSec > 0 ? durationSec / 60 : 0;
        const avp = getAvp(row);
        const avdSeconds = getAvdSeconds(row);
        const cliffRatio = durationSec > 0 ? avdSeconds / durationSec : 0;
        const cliffLabel = cliffRatio < 0.35 ? 'EARLY CLIFF' : cliffRatio < 0.65 ? 'MID DROP' : 'LONG HOLD';
        const title = getTitle(row, index);
        return [
          Number(durationMin.toFixed(2)),
          Number(avp.toFixed(2)),
          `${title}\nLEN: ${durationMin.toFixed(2)}m\nAPV: ${avp.toFixed(1)}%\nPROFILE: ${cliffLabel}`,
        ];
      })
      .filter((point) => point[0] > 0 && point[1] > 0);
    return rows.length > 0 ? [header, ...rows] : [header, [0, 0, 'No Data']];
  }, [selectedRows]);

  const ctrDecayData = useMemo(() => {
    const buckets = [
      { label: '0-1k', min: 0, max: 1000 },
      { label: '1k-5k', min: 1000, max: 5000 },
      { label: '5k-20k', min: 5000, max: 20000 },
      { label: '20k-100k', min: 20000, max: 100000 },
      { label: '100k+', min: 100000, max: Number.POSITIVE_INFINITY },
    ];
    const header = ['Impression Band', 'Avg CTR %', 'Videos'];
    const rows = buckets.map((bucket) => {
      const inBucket = selectedRows.filter((row) => {
        const imp = getImpressions(row);
        return imp >= bucket.min && imp < bucket.max;
      });
      const ctrValues = inBucket.map((row) => getCtr(row)).filter((val) => val > 0);
      const avgCtr = ctrValues.length ? ctrValues.reduce((sum, val) => sum + val, 0) / ctrValues.length : 0;
      return [bucket.label, Number(avgCtr.toFixed(3)), inBucket.length];
    });
    return [header, ...rows];
  }, [selectedRows]);

  const titleIntentData = useMemo(() => {
    const positiveWords = ['best', 'win', 'easy', 'fast', 'secret', 'proven', 'ultimate', 'boost'];
    const negativeWords = ['avoid', 'mistake', 'worst', 'fail', 'stop', 'never', 'broken', 'wrong'];
    const header = ['ID', 'Intent Score', 'CTR %', 'Format', 'APV', { role: 'tooltip', type: 'string' }];
    const rows = selectedRows
      .map((row, index) => {
        const title = getTitle(row, index);
        const words = title.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(Boolean);
        let score = 0;
        words.forEach((word) => {
          if (positiveWords.includes(word)) score += 1;
          if (negativeWords.includes(word)) score -= 1;
        });
        const ctr = getCtr(row);
        const apv = getAvp(row);
        const format = getTag(row) === 'shorts' ? 'Shorts' : 'Long-form';
        return [
          '',
          score,
          Number(ctr.toFixed(3)),
          format,
          Number(Math.max(1, apv).toFixed(3)),
          `${title}\nINTENT: ${score}\nCTR: ${ctr.toFixed(2)}%\nAPV: ${apv.toFixed(1)}%`,
        ];
      })
      .filter((entry) => entry[2] > 0);
    return rows.length > 0 ? [header, ...rows] : [header, ['', 0, 0, 'No Data', 1, 'No Data']];
  }, [selectedRows]);

  const loyaltyFunnelData = useMemo(() => {
    const header = ['Stage', 'Audience'];
    const totals = selectedRows.reduce(
      (acc, row) => {
        const views = getViews(row);
        const apv = getAvp(row);
        const subs = getSubscribers(row);
        const comments = getByPattern(row, ['Comments', 'commentCount'], ['comment']);
        const engagedViewers = views * Math.max(0, Math.min(1, apv / 100));
        acc.views += views;
        acc.engaged += engagedViewers;
        acc.community += comments;
        acc.subscribers += subs;
        return acc;
      },
      { views: 0, engaged: 0, community: 0, subscribers: 0 },
    );
    const rows = [
      ['Views', Math.round(totals.views)],
      ['Engaged Watchers', Math.round(totals.engaged)],
      ['Community Actions', Math.round(totals.community)],
      ['Subscribers', Math.round(totals.subscribers)],
    ];
    return [header, ...rows];
  }, [selectedRows]);

  const valueMatrixData = useMemo(() => {
    const header = ['', 'CTR %', 'Retention %', 'Type', 'Views', { role: 'tooltip', type: 'string' }];
    const points = selectedRows
      .map((row, index) => {
        const ctr = getCtr(row);
        const avp = getAvp(row);
        const views = getViews(row);
        const title = getTitle(row, index);
        const tag = getTag(row) === 'shorts' ? 'Shorts' : 'Long-form';
        return [
          '',
          Number(ctr.toFixed(3)),
          Number(avp.toFixed(3)),
          tag,
          views,
          `${title}\nCTR: ${ctr.toFixed(2)}%\nAVP: ${avp.toFixed(2)}%\nViews: ${views.toLocaleString()}`,
        ];
      })
      .filter((point) => Number(point[4]) > 0 && (Number(point[1]) > 0 || Number(point[2]) > 0));
    return points.length > 0 ? [header, ...points] : [header, ['', 0, 0, 'No Data', 1, 'No data yet']];
  }, [selectedRows]);

  const triggerData = useMemo(() => {
    const header = ['CTR %', 'Impressions', { role: 'tooltip', type: 'string' }];
    const points = selectedRows
      .map((row, index) => {
        const title = getTitle(row, index);
        const ctr = getCtr(row);
        const impressions = getImpressions(row);
        return [ctr, impressions, `${title}\nIMP: ${impressions.toLocaleString()}\nCTR: ${ctr.toFixed(2)}%`];
      })
      .filter((point) => Number(point[0]) > 0 && Number(point[1]) > 0);
    return points.length > 0 ? [header, ...points] : [header, [0, 1, 'No data yet']];
  }, [selectedRows]);

  const deviceData = useMemo(() => {
    const map = new Map<string, number>();
    selectedRows.forEach((row) => {
      const explicit = text(firstDefined(row, ['Device type', 'Device', 'deviceType'])).trim();
      const fallback = getTag(row) === 'shorts' ? 'Mobile' : 'Desktop';
      const key = explicit || fallback;
      const views = getViews(row);
      if (views > 0) map.set(key, (map.get(key) || 0) + views);
    });
    const entries = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
    return entries.length > 0 ? [['Device', 'Views'], ...entries] : [['Device', 'Views'], ['Mobile', 1]];
  }, [selectedRows]);

  const geoData = useMemo(() => {
    const map = new Map<string, number>();
    selectedRows.forEach((row) => {
      const country = text(firstDefined(row, ['Country', 'Geography', 'Region', 'country'])).trim();
      if (!country) return;
      const views = getViews(row);
      if (views > 0) map.set(country.toUpperCase(), (map.get(country.toUpperCase()) || 0) + views);
    });
    const entries = Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 40);
    return entries.length > 0 ? [['Country', 'Views'], ...entries] : [['Country', 'Views'], ['US', 1]];
  }, [selectedRows]);

  const narrativeWordTreeData = useMemo(() => {
    const phrases = selectedRows
      .map((row, index) => [getTitle(row, index).replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim()])
      .filter((value) => value[0].length > 3);
    return phrases.length > 0 ? [['Phrases'], ...phrases] : [['Phrases'], ['no data available yet']];
  }, [selectedRows]);

  const rootWord = useMemo(() => {
    const counts = new Map<string, number>();
    selectedRows.forEach((row, index) => {
      getTitle(row, index)
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter((word) => word.length >= 4)
        .forEach((word) => counts.set(word, (counts.get(word) || 0) + 1));
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'video';
  }, [selectedRows]);

  const topPerformersChart: ChartConfig = useMemo(
    () => ({
      title: topPerformersSpec.title,
      subtitle: topPerformersSpec.subtitle,
      type: topPerformersSpec.chartType,
      provider: 'google',
      xAxisKey: 'Video',
      dataKeys: ['Views'],
      data: () => topPerformersData as unknown as unknown[],
    }),
    [topPerformersData, topPerformersSpec],
  );

  const valueMatrixChart: ChartConfig = useMemo(
    () => ({
      title: valueMatrixSpec.title,
      subtitle: valueMatrixSpec.subtitle,
      type: 'bubble',
      provider: 'google',
      xAxisKey: 'CTR %',
      dataKeys: ['Retention %', 'Views'],
      data: () => valueMatrixData,
      options: {
        chartArea: { left: 55, right: 20, top: 20, bottom: 45, width: '88%', height: '78%' },
        hAxis: { title: 'CTR %', baselineColor: '#000', viewWindow: { min: 0, max: 12 } },
        vAxis: { title: 'RETENTION %', baselineColor: '#000', viewWindow: { min: 0, max: 200 } },
        colors: [CHART_THEME.palette.cyan, CHART_THEME.palette.pink],
        legend: { position: 'none' },
      },
    }),
    [valueMatrixData, valueMatrixSpec],
  );

  const triggerChart: ChartConfig = useMemo(
    () => ({
      title: triggerSpec.title,
      subtitle: triggerSpec.subtitle,
      type: 'scatter',
      provider: 'google',
      xAxisKey: 'CTR %',
      dataKeys: ['Impressions'],
      data: () => triggerData,
      options: {
        hAxis: { title: 'CTR %' },
        vAxis: { title: 'IMPRESSIONS', format: 'short' },
        colors: [CHART_THEME.palette.pink],
        legend: { position: 'none' },
        trendlines: { 0: { type: 'linear', color: '#000', opacity: 0.3 } },
      },
    }),
    [triggerData, triggerSpec],
  );

  const deviceChart: ChartConfig = useMemo(
    () => ({
      title: deviceSpec.title,
      subtitle: deviceSpec.subtitle,
      type: 'pie',
      provider: 'google',
      xAxisKey: 'Device',
      dataKeys: ['Views'],
      data: () => deviceData,
      options: {
        is3D: true,
        pieHole: 0.25,
        pieSliceBorderColor: 'transparent',
        chartArea: { width: '92%', height: '92%', left: '4%', top: '4%' },
        colors: [
          CHART_THEME.palette.cyan,
          CHART_THEME.palette.lime,
          CHART_THEME.palette.yellow,
          CHART_THEME.palette.orange,
          CHART_THEME.palette.pink,
        ],
        legend: { position: 'right' },
      },
    }),
    [deviceData, deviceSpec],
  );

  const narrativeChart: ChartConfig = useMemo(
    () => ({
      title: 'Narrative DNA',
      subtitle: 'Semantic Topic Clustering',
      type: 'wordtree',
      provider: 'google',
      xAxisKey: 'Phrases',
      dataKeys: [],
      data: () => narrativeWordTreeData,
      options: {
        wordtree: { format: 'implicit', word: rootWord },
        backgroundColor: 'transparent',
      },
    }),
    [narrativeWordTreeData, rootWord],
  );

  const geoChart: ChartConfig = useMemo(
    () => ({
      title: geoSpec.title,
      subtitle: geoSpec.subtitle,
      type: 'geochart',
      provider: 'google',
      xAxisKey: 'Country',
      dataKeys: ['Views'],
      data: () => geoData,
      options: {
        colorAxis: {
          colors: [
            CHART_THEME.palette.cyan,
            CHART_THEME.palette.lime,
            CHART_THEME.palette.yellow,
            CHART_THEME.palette.orange,
            CHART_THEME.palette.pink,
          ],
        },
        datalessRegionColor: '#efefef',
      },
    }),
    [geoData, geoSpec],
  );

  const engagementMapChart: ChartConfig = useMemo(
    () => ({
      title: engagementSpec.title,
      subtitle: `Top 50 Recent by ${engagementSortBy}`,
      type: 'line',
      provider: 'google',
      xAxisKey: 'Video',
      dataKeys: ['Comments', 'Subscribers', 'Shares', 'Likes'],
      data: () => engagementMapData,
      options: {
        backgroundColor: 'transparent',
        vAxes: {
          0: { title: 'COMMENTS / SUBSCRIBERS / SHARES', baselineColor: '#000' },
          1: { title: 'LIKES', baselineColor: '#000' },
        },
        hAxis: { title: 'VIDEOS (RANKED)', textPosition: 'none', baselineColor: '#000' },
        series: {
          0: { targetAxisIndex: 0, color: CHART_THEME.palette.cyan },
          1: { targetAxisIndex: 0, color: CHART_THEME.palette.lime },
          2: { targetAxisIndex: 0, color: CHART_THEME.palette.yellow },
          3: { targetAxisIndex: 1, color: CHART_THEME.palette.pink },
        },
        lineWidth: 3,
        pointsVisible: false,
        legend: { position: 'none' },
        chartArea: { left: 95, right: 85, top: 20, bottom: 45, width: '84%', height: '72%' },
      },
    }),
    [engagementMapData, engagementSortBy, engagementSpec],
  );

  const retentionCliffChart: ChartConfig = useMemo(
    () => ({
      title: 'Retention Cliff Locator',
      subtitle: 'Length vs APV Profile',
      type: 'scatter',
      provider: 'google',
      xAxisKey: 'Duration',
      dataKeys: ['APV'],
      data: () => retentionCliffData,
      options: {
        hAxis: { title: 'DURATION (MINUTES)', baselineColor: '#000' },
        vAxis: { title: 'AVERAGE % VIEWED', baselineColor: '#000' },
        colors: ['#B14AED'],
        legend: { position: 'none' },
      },
    }),
    [retentionCliffData],
  );

  const ctrDecayChart: ChartConfig = useMemo(
    () => ({
      title: 'CTR Decay Curve',
      subtitle: 'Impression Band vs Avg CTR',
      type: 'combo',
      provider: 'google',
      xAxisKey: 'Band',
      dataKeys: ['CTR', 'Videos'],
      data: () => ctrDecayData,
      options: {
        seriesType: 'line',
        series: {
          0: { type: 'line', color: '#FF7497', lineWidth: 4, pointSize: 6 },
          1: { type: 'bars', targetAxisIndex: 1, color: '#00CCFF' },
        },
        vAxes: {
          0: { title: 'AVG CTR %', baselineColor: '#000' },
          1: { title: 'VIDEOS', baselineColor: '#000' },
        },
        hAxis: { title: 'IMPRESSION BAND', baselineColor: '#000' },
        legend: { position: 'none' },
      },
    }),
    [ctrDecayData],
  );

  const titleIntentChart: ChartConfig = useMemo(
    () => ({
      title: 'Title Intent Matrix',
      subtitle: 'Intent vs CTR vs APV',
      type: 'bubble',
      provider: 'google',
      xAxisKey: 'Intent',
      dataKeys: ['CTR', 'APV'],
      data: () => titleIntentData,
      options: {
        hAxis: { title: 'TITLE INTENT SCORE', baselineColor: '#000', viewWindow: { min: -6, max: 6 } },
        vAxis: { title: 'CTR %', baselineColor: '#000' },
        bubble: { textStyle: { fontSize: 0 }, opacity: 0.8 },
        colors: ['#00CCFF', '#FF7497'],
        legend: { position: 'none' },
      },
    }),
    [titleIntentData],
  );

  const loyaltyFunnelChart: ChartConfig = useMemo(
    () => ({
      title: 'Loyalty Conversion Funnel',
      subtitle: 'Views -> Engagement -> Community -> Subs',
      type: 'column',
      provider: 'google',
      xAxisKey: 'Stage',
      dataKeys: ['Audience'],
      data: () => loyaltyFunnelData,
      options: {
        hAxis: { title: 'STAGE', baselineColor: '#000' },
        vAxis: { title: 'AUDIENCE', baselineColor: '#000', format: 'short' },
        colors: ['#CCFF00'],
        legend: { position: 'none' },
      },
    }),
    [loyaltyFunnelData],
  );

  const hasMetric = (row: Record<string, unknown>, metricKey: string): boolean => {
    if (metricKey === 'views') return getViews(row) > 0;
    if (metricKey === 'impressions') return getImpressions(row) > 0;
    if (metricKey === 'ctr_percent') return getCtr(row) > 0;
    if (metricKey === 'retention_percent') return getAvp(row) > 0;
    if (metricKey === 'comments') return getByPattern(row, ['Comments', 'commentCount'], ['comment']) > 0;
    if (metricKey === 'subscribers_gained') return getSubscribers(row) > 0;
    if (metricKey === 'shares') return getByPattern(row, ['Shares', 'shareCount'], ['share']) > 0;
    if (metricKey === 'likes') return getByPattern(row, ['Likes', 'likeCount'], ['like']) > 0;
    if (metricKey === 'revenue') return getRevenue(row) > 0;
    if (metricKey === 'watch_hours') return getWatchHours(row) > 0;
    if (metricKey === 'country') return text(firstDefined(row, ['Country', 'Geography', 'Region', 'country'])).trim().length > 0;
    if (metricKey === 'video_length') return getDurationSeconds(row) > 0;
    if (metricKey === 'video_title') return text(firstDefined(row, ['Video title', 'Video', 'Dimension', 'Title'])).trim().length > 0;
    return false;
  };

  const getMissingMetrics = (rowsToCheck: Rows, required: string[] = []): string[] => {
    if (required.length === 0) return [];
    return required.filter((metricKey) => !rowsToCheck.some((row) => hasMetric(row, metricKey))).sort();
  };

  const chartCards: Array<{
    id: string;
    title: string;
    header: string;
    chart: ChartConfig;
    stationTag: string;
    requiredMetrics: string[];
    tier: 'A' | 'B';
    insight: { title: string; statPair: string; reveal: string };
    colSpan?: string;
  }> = [
    {
      id: 'top-trio',
      title: 'Top Performers Trio',
      header: 'bg-[#FFDD00]',
      chart: topPerformersChart,
      stationTag: 'Core',
      requiredMetrics: ['revenue', 'watch_hours', 'subscribers_gained'],
      tier: 'A',
      insight: {
        title: 'Leaders Wheel',
        statPair: 'REVENUE x WATCH HOURS',
        reveal: 'Shows which videos dominate earnings, attention, and subscriber pull.',
      },
      colSpan: 'xl:col-span-2',
    },
    {
      id: 'engagement-map',
      title: 'Engagement Map',
      header: 'bg-[#CCFF00]',
      chart: engagementMapChart,
      stationTag: 'Ranker',
      requiredMetrics: ['comments', 'subscribers_gained', 'shares', 'likes'],
      tier: 'A',
      insight: {
        title: 'Engagement Rail',
        statPair: 'COMMENTS x LIKES',
        reveal: 'Reorders videos by selected social signal without changing totals.',
      },
      colSpan: 'xl:col-span-2',
    },
    {
      id: 'value-matrix',
      title: 'Video Value Matrix',
      header: 'bg-[#00CCFF]',
      chart: valueMatrixChart,
      stationTag: 'Matrix',
      requiredMetrics: ['ctr_percent', 'retention_percent', 'views'],
      tier: 'A',
      insight: {
        title: 'Value Quadrants',
        statPair: 'CTR x RETENTION',
        reveal: 'Maps packaging vs delivery and sizes bubbles by views.',
      },
      colSpan: 'xl:col-span-2',
    },
    {
      id: 'algorithm-trigger',
      title: 'Algorithm Trigger',
      header: 'bg-[#CCFF00]',
      chart: triggerChart,
      stationTag: 'Signals',
      requiredMetrics: ['ctr_percent', 'impressions'],
      tier: 'A',
      insight: {
        title: 'Trigger Window',
        statPair: 'CTR x IMPRESSIONS',
        reveal: 'Shows whether reach and clickability scale together.',
      },
    },
    {
      id: 'device-immersion',
      title: 'Device Immersion',
      header: 'bg-[#FFB158]',
      chart: deviceChart,
      stationTag: 'Audience',
      requiredMetrics: ['views'],
      tier: 'B',
      insight: {
        title: 'Device Split',
        statPair: 'DEVICE x VIEWS',
        reveal: 'Highlights audience consumption environment concentration.',
      },
    },
    {
      id: 'global-footprint',
      title: 'Global Footprint',
      header: 'bg-[#EA73E8]',
      chart: geoChart,
      stationTag: 'Geo',
      requiredMetrics: ['country', 'views'],
      tier: 'B',
      insight: {
        title: 'Global Footprint',
        statPair: 'COUNTRY x VIEWS',
        reveal: 'Surfaces where your distribution currently concentrates.',
      },
    },
    {
      id: 'retention-cliff',
      title: 'Retention Cliff Locator',
      header: 'bg-[#B14AED]',
      chart: retentionCliffChart,
      stationTag: 'Retention',
      requiredMetrics: ['video_length', 'retention_percent'],
      tier: 'A',
      insight: {
        title: 'Cliff Finder',
        statPair: 'LENGTH x RETENTION',
        reveal: 'Flags where watch-through weakens as video length increases.',
      },
    },
    {
      id: 'ctr-decay',
      title: 'CTR Decay Curve',
      header: 'bg-[#FF7497]',
      chart: ctrDecayChart,
      stationTag: 'Distribution',
      requiredMetrics: ['impressions', 'ctr_percent'],
      tier: 'A',
      insight: {
        title: 'Decay Curve',
        statPair: 'IMPRESSION BAND x CTR',
        reveal: 'Shows click-through trend as distribution expands.',
      },
    },
    {
      id: 'title-intent',
      title: 'Title Intent Matrix',
      header: 'bg-[#00CCFF]',
      chart: titleIntentChart,
      stationTag: 'Packaging',
      requiredMetrics: ['video_title', 'ctr_percent', 'retention_percent'],
      tier: 'B',
      insight: {
        title: 'Intent Matrix',
        statPair: 'TITLE INTENT x CTR',
        reveal: 'Compares wording polarity to click and retention outcomes.',
      },
    },
    {
      id: 'loyalty-funnel',
      title: 'Loyalty Conversion Funnel',
      header: 'bg-[#CCFF00]',
      chart: loyaltyFunnelChart,
      stationTag: 'Conversion',
      requiredMetrics: ['views', 'retention_percent', 'comments', 'subscribers_gained'],
      tier: 'B',
      insight: {
        title: 'Loyalty Ladder',
        statPair: 'ENGAGED x SUBSCRIBERS',
        reveal: 'Measures conversion from viewers to active community members.',
      },
    },
    {
      id: 'narrative-dna',
      title: 'Narrative DNA',
      header: 'bg-[#FF7497]',
      chart: narrativeChart,
      stationTag: 'Semantic',
      requiredMetrics: ['video_title'],
      tier: 'B',
      insight: {
        title: 'Narrative DNA',
        statPair: 'TOPIC x TITLE',
        reveal: 'Clusters recurring language across video titles.',
      },
    },
  ];

  return (
    <div className="border-[4px] border-black rounded-2xl bg-[#ECEFF2] shadow-[8px_8px_0px_0px_black] overflow-hidden">
      <div className="bg-white border-b-[4px] border-black px-4 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl md:text-2xl font-[1000] uppercase tracking-tight">Engagement & Growth</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-black/40 mt-1">
            {dataDateRange || 'All Time'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-8 px-3 inline-flex items-center rounded-full bg-black text-white text-[10px] font-black uppercase tracking-[0.14em]">
            {chartCards.length} Active Stations
          </span>
          <span className="h-8 px-3 inline-flex items-center rounded-full bg-white border-[3px] border-black text-[10px] font-black uppercase tracking-[0.14em]">
            {selectedRowsLabel}
          </span>
        </div>
      </div>

      <div className="px-4 py-3 border-b-[4px] border-black bg-[#F7F7F7] flex flex-wrap items-center gap-3">
        <span className="h-8 px-3 inline-flex items-center rounded-lg bg-black text-white text-[10px] font-black uppercase tracking-[0.14em]">
          Filters
        </span>
        <select
          value={formatFilter}
          onChange={(event) => setFormatFilter(event.target.value as FormatFilter)}
          className="h-10 px-3 border-[3px] border-black rounded-lg text-sm font-black bg-white"
        >
          <option value="all">All Formats</option>
          <option value="shorts">Shorts</option>
          <option value="long">Long-Form</option>
        </select>
        <select
          value={timeFilter}
          onChange={(event) => setTimeFilter(event.target.value as TimeFilter)}
          className="h-10 px-3 border-[3px] border-black rounded-lg text-sm font-black bg-white"
        >
          <option value="all">All Time</option>
          <option value="90d">Last 90 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
        <select
          value={String(topLimit)}
          onChange={(event) => setTopLimit(Number(event.target.value))}
          className="h-10 px-3 border-[3px] border-black rounded-lg text-sm font-black bg-white"
        >
          <option value="25">Top 25</option>
          <option value="50">Top 50</option>
          <option value="100">Top 100</option>
          <option value="200">Top 200</option>
        </select>
        <select
          value={selectionMode}
          onChange={(event) => setSelectionMode(event.target.value as SelectionMode)}
          className="h-10 px-3 border-[3px] border-black rounded-lg text-sm font-black bg-white"
        >
          <option value="all_visible">Select Videos (Visible)</option>
          <option value="top_50">Select Videos (Top 50)</option>
          <option value="top_25">Select Videos (Top 25)</option>
          <option value="top_10">Select Videos (Top 10)</option>
        </select>
      </div>

      <div className="p-4 grid grid-cols-1 xl:grid-cols-2 gap-5">
        {chartCards.map((card) => {
          const missingMetrics = getMissingMetrics(selectedRows, card.requiredMetrics);
          const canRender = missingMetrics.length === 0;
          return (
          <div
            key={card.id}
            className={`border-[4px] border-black rounded-2xl bg-white overflow-hidden shadow-[6px_6px_0px_0px_black] ${card.colSpan ?? ''}`}
          >
            <div className={`${card.header} border-b-[4px] border-black px-3 py-2 flex items-center justify-between`}>
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-3 h-3 rounded-full border-2 border-black bg-white shrink-0" />
                <span className="text-[11px] font-black uppercase tracking-widest truncate">{card.title}</span>
              </div>
              <div className="flex items-center gap-2">
                {card.id === 'engagement-map' && (
                  <div className="flex items-center gap-1.5 mr-1">
                    {(['Comments', 'Subscribers', 'Shares', 'Likes'] as const).map((metric) => (
                      <button
                        key={metric}
                        onClick={() => setEngagementSortBy(metric)}
                        className={`px-2 py-0.5 text-[9px] font-black uppercase border-2 border-black rounded ${engagementSortBy === metric ? 'bg-black text-white' : 'bg-white text-black'}`}
                      >
                        {metric === 'Subscribers' ? 'Subs' : metric}
                      </button>
                    ))}
                  </div>
                )}
                <span className="text-[9px] font-black uppercase tracking-[0.18em] text-black/60">
                  Tier {card.tier}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-black/70">{card.stationTag}</span>
              </div>
            </div>
            <div className="px-3 py-1.5 border-b-[3px] border-black bg-white flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-black/45">Render Scope</span>
              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-black/70">{dataDateRange || 'Data Window'}</span>
            </div>
            <div className="p-3 bg-[#F7F7F7]">
              <div className="h-[420px] border-[3px] border-black rounded-xl bg-white overflow-hidden">
                {canRender ? (
                  <RenderChart
                    chart={{
                      ...card.chart,
                      requiredMetrics: card.requiredMetrics,
                      tier: card.tier,
                      insight: card.insight,
                    }}
                    isModal
                    data={selectedRows}
                    dataDateRange={dataDateRange}
                  />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-black/45">
                      Data missing for this chart
                    </p>
                    <p className="text-xl font-[1000] uppercase tracking-tight mt-2">
                      {card.title} unavailable
                    </p>
                    <p className="mt-2 text-[10px] font-black uppercase tracking-[0.14em] text-black/45">
                      Missing: {missingMetrics.join(', ')}
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-2 border-[2px] border-black rounded-lg px-2 py-2 bg-white text-[9px] font-black uppercase tracking-[0.14em] text-black/70">
                {card.insight.title} · {card.insight.statPair} · {card.insight.reveal}
              </div>
            </div>
          </div>
        )})}
      </div>
    </div>
  );
};

export default ChannelyticsChartToolbox;
