import React, { useMemo, useState } from 'react';
import type { ChartConfig } from '../types';
import { RenderChart } from './ChartEngine';

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
  getByPattern(row, ['Impressions'], ['impression']);

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
  const raw = getByPattern(
    row,
    ['CTR (%)', 'Impressions click-through rate (%)', 'impressionClickThroughRate', 'clickThroughRate'],
    ['ctr', 'click-through'],
  );
  if (raw > 0) return raw <= 1 ? raw * 100 : raw;
  const views = getViews(row);
  const impressions = getImpressions(row);
  return impressions > 0 ? (views / impressions) * 100 : 0;
};

const getAvp = (row: Record<string, unknown>): number => {
  const raw = getByPattern(
    row,
    ['AVP (%)', 'Average percentage viewed (%)', 'averageViewPercentage'],
    ['averageviewpercentage', 'avp'],
  );
  const pct = raw > 0 && raw <= 1 ? raw * 100 : raw;
  return Math.min(200, pct);
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
  const [formatFilter, setFormatFilter] = useState<FormatFilter>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [topLimit, setTopLimit] = useState<number>(25);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('top_25');

  const filteredRows = useMemo(() => {
    const now = Date.now();
    const cutoffMs = timeFilter === '30d' ? 30 * 86_400_000 : timeFilter === '90d' ? 90 * 86_400_000 : 0;

    return rows
      .filter((row) => {
        if (formatFilter !== 'all' && getTag(row) !== formatFilter) return false;
        if (cutoffMs > 0) {
          const date = getDate(row);
          if (!date) return false;
          if (date.getTime() < now - cutoffMs) return false;
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
        const views = getViews(row);
        const impressions = Math.max(getImpressions(row), Math.round(views * 8));
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
      title: 'Top Performers Trio',
      subtitle: 'Revenue / Watch / Subs',
      type: 'TopPerformersTrio',
      provider: 'google',
      xAxisKey: 'Video',
      dataKeys: ['Views'],
      data: () => topPerformersData as unknown as any[],
    }),
    [topPerformersData],
  );

  const valueMatrixChart: ChartConfig = useMemo(
    () => ({
      title: 'Video Value Matrix',
      subtitle: 'CTR × Retention × Views',
      type: 'bubble',
      provider: 'google',
      xAxisKey: 'CTR %',
      dataKeys: ['Retention %', 'Views'],
      data: () => valueMatrixData,
      options: {
        chartArea: { left: 55, right: 20, top: 20, bottom: 45, width: '88%', height: '78%' },
        hAxis: { title: 'CTR %', baselineColor: '#000', viewWindow: { min: 0, max: 12 } },
        vAxis: { title: 'RETENTION %', baselineColor: '#000', viewWindow: { min: 0, max: 200 } },
        colors: ['#00CCFF', '#FF7497'],
        legend: { position: 'none' },
      },
    }),
    [valueMatrixData],
  );

  const triggerChart: ChartConfig = useMemo(
    () => ({
      title: 'Algorithm Trigger',
      subtitle: 'Impressions vs CTR Momentum',
      type: 'scatter',
      provider: 'google',
      xAxisKey: 'CTR %',
      dataKeys: ['Impressions'],
      data: () => triggerData,
      options: {
        hAxis: { title: 'CTR %' },
        vAxis: { title: 'IMPRESSIONS', format: 'short' },
        colors: ['#FF7497'],
        legend: { position: 'none' },
        trendlines: { 0: { type: 'linear', color: '#000', opacity: 0.3 } },
      },
    }),
    [triggerData],
  );

  const deviceChart: ChartConfig = useMemo(
    () => ({
      title: 'Device Immersion',
      subtitle: 'Consumption Environment',
      type: 'pie',
      provider: 'google',
      xAxisKey: 'Device',
      dataKeys: ['Views'],
      data: () => deviceData,
      options: {
        is3D: true,
        pieHole: 0.25,
        chartArea: { width: '92%', height: '92%', left: '4%', top: '4%' },
        colors: ['#00CCFF', '#CCFF00', '#FFDD00', '#FFB158', '#FF7497'],
        legend: { position: 'right' },
      },
    }),
    [deviceData],
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
      title: 'Global Footprint',
      subtitle: 'Market Heat Map',
      type: 'geochart',
      provider: 'google',
      xAxisKey: 'Country',
      dataKeys: ['Views'],
      data: () => geoData,
      options: {
        colorAxis: { colors: ['#00CCFF', '#CCFF00', '#FFDD00', '#FFB158', '#FF7497'] },
        datalessRegionColor: '#efefef',
      },
    }),
    [geoData],
  );

  const chartCards: Array<{
    id: string;
    title: string;
    header: string;
    chart: ChartConfig;
    stationTag: string;
    colSpan?: string;
  }> = [
    { id: 'top-trio', title: 'Top Performers Trio', header: 'bg-[#FFDD00]', chart: topPerformersChart, stationTag: 'Core', colSpan: 'xl:col-span-2' },
    { id: 'value-matrix', title: 'Video Value Matrix', header: 'bg-[#00CCFF]', chart: valueMatrixChart, stationTag: 'Matrix' },
    { id: 'algorithm-trigger', title: 'Algorithm Trigger', header: 'bg-[#CCFF00]', chart: triggerChart, stationTag: 'Signals' },
    { id: 'device-immersion', title: 'Device Immersion', header: 'bg-[#FFB158]', chart: deviceChart, stationTag: 'Audience' },
    { id: 'global-footprint', title: 'Global Footprint', header: 'bg-[#EA73E8]', chart: geoChart, stationTag: 'Geo' },
    { id: 'narrative-dna', title: 'Narrative DNA', header: 'bg-[#FF7497]', chart: narrativeChart, stationTag: 'Semantic' },
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
        {chartCards.map((card) => (
          <div
            key={card.id}
            className={`border-[4px] border-black rounded-2xl bg-white overflow-hidden shadow-[6px_6px_0px_0px_black] ${card.colSpan ?? ''}`}
          >
            <div className={`${card.header} border-b-[4px] border-black px-3 py-2 flex items-center justify-between`}>
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-3 h-3 rounded-full border-2 border-black bg-white shrink-0" />
                <span className="text-[11px] font-black uppercase tracking-widest truncate">{card.title}</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-black/70">{card.stationTag}</span>
            </div>
            <div className="px-3 py-1.5 border-b-[3px] border-black bg-white flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-black/45">Render Scope</span>
              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-black/70">{dataDateRange || 'Data Window'}</span>
            </div>
            <div className="p-3 bg-[#F7F7F7]">
              <div className="h-[420px] border-[3px] border-black rounded-xl bg-white overflow-hidden">
                <RenderChart chart={card.chart} isModal data={selectedRows} dataDateRange={dataDateRange} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChannelyticsChartToolbox;
