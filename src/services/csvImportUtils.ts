import JSZip from 'jszip';
import type { CsvFileWithTag, CsvTag, CsvUploadType } from '../types';
import type { AnalyticsWindow } from './analyticsContract';

const ZIP_MIME_TYPES = new Set([
  'application/zip',
  'application/x-zip-compressed',
]);

const CSV_MIME_TYPES = new Set([
  'text/csv',
  'application/vnd.ms-excel',
]);

const getFilePath = (file: File): string => {
  const webkitPath = (file as File & { webkitRelativePath?: string }).webkitRelativePath;
  return webkitPath && webkitPath.trim().length > 0 ? webkitPath : file.name;
};

export type CsvExportKind = 'table_data' | 'totals' | 'chart' | 'unknown';

export const extractDateRangeFromName = (name: string): string => {
  const lowerName = name.toLowerCase();
  const pastDaysMatch = lowerName.match(/(?:past|last)\s+(\d+)\s+days/);
  if (pastDaysMatch) return `Past ${pastDaysMatch[1]} Days`;

  if (lowerName.match(/all[\s_]*time/) || lowerName.includes('lifetime')) return 'All Time';

  const dateMatch = name.match(/(\d{4}[-/]\d{2}[-/]\d{2}).*?(\d{4}[-/]\d{2}[-/]\d{2})/);
  if (dateMatch) return `${dateMatch[1]} to ${dateMatch[2]}`;

  const textDateMatch = name.match(
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s_]+\d{1,2},?[\s_]+\d{4}.*?(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s_]+\d{1,2},?[\s_]+\d{4}/i,
  );
  if (textDateMatch) return `${textDateMatch[1]} to ${textDateMatch[2]}`;

  return '';
};

export const parseCSV = (text: string): Record<string, unknown>[] => {
  try {
    const lines = text.split('\n').filter((line) => line.trim());
    if (lines.length < 2) return [];

    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i += 1) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current);
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current);
      return result.map((value) => value.trim().replace(/^"|"$/g, ''));
    };

    const headers = parseLine(lines[0]);

    return lines.slice(1).map((line) => {
      const values = parseLine(line);
      const row: Record<string, unknown> = {};
      headers.forEach((header, index) => {
        const rawValue = values[index];
        if (rawValue === undefined) return;
        const numericCandidate = rawValue.replace(/%/g, '').replace(/,/g, '');
        if (numericCandidate !== '' && !Number.isNaN(Number(numericCandidate))) {
          row[header] = Number(numericCandidate);
        } else {
          row[header] = rawValue;
        }
      });
      return row;
    });
  } catch {
    return [];
  }
};

const normalizeHeader = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]/g, '');

const hasHeaderAny = (headers: string[], aliases: string[]): boolean => {
  const normalized = headers.map(normalizeHeader);
  return aliases.some((alias) => normalized.includes(normalizeHeader(alias)));
};

const hasHeaderIncludesAny = (headers: string[], needles: string[]): boolean => {
  const normalized = headers.map(normalizeHeader);
  return normalized.some((header) => needles.some((needle) => header.includes(normalizeHeader(needle))));
};

const getRowHeaders = (rows: Record<string, unknown>[]): string[] => {
  if (!Array.isArray(rows) || rows.length === 0) return [];
  return Object.keys(rows[0] || {});
};

export const inferAnalyticsWindowFromName = (name: string): AnalyticsWindow | null => {
  const lower = name.toLowerCase();
  if (lower.includes('lifetime') || lower.includes('all time') || lower.includes('all_time')) {
    return 'lifetime';
  }

  const daysMatch = lower.match(/(?:past|last|previous)?\s*(7|28|30|90|365)\s*(?:day|days)/);
  if (daysMatch) {
    const days = Number(daysMatch[1]);
    if (days === 7) return '7d';
    if (days === 28 || days === 30) return '28d';
    if (days === 90) return '90d';
    if (days === 365) return '365d';
  }

  if (lower.includes('7d')) return '7d';
  if (lower.includes('28d') || lower.includes('30d')) return '28d';
  if (lower.includes('90d')) return '90d';
  if (lower.includes('365d') || lower.includes('1y') || lower.includes('1yr')) return '365d';

  return null;
};

export const classifyCsvExportKind = (
  fileName: string,
  rows: Record<string, unknown>[],
): CsvExportKind => {
  const headers = getRowHeaders(rows);
  if (headers.length === 0) return 'unknown';

  const lowerFile = fileName.toLowerCase();
  const rowCount = rows.length;

  const hasVideoDimension =
    hasHeaderAny(headers, ['Video title', 'Video ID', 'video', 'Dimension']) ||
    hasHeaderIncludesAny(headers, ['videotitle', 'videoid']);
  const hasDateDimension = hasHeaderAny(headers, ['Date', 'Day']) || hasHeaderIncludesAny(headers, ['date', 'day']);
  const hasCoreMetrics = hasHeaderAny(headers, ['Views', 'Watch Time (Hours)', 'Watch time (hours)', 'Likes', 'Comments']);
  const hasOnlyTotalsHint =
    lowerFile.includes('total') ||
    lowerFile.includes('summary') ||
    lowerFile.includes('overview') ||
    rows.every((row) => isLikelyTotalCsvRow(row));

  if (hasOnlyTotalsHint || (rowCount <= 2 && !hasVideoDimension && hasCoreMetrics)) {
    return 'totals';
  }

  if (hasVideoDimension && hasCoreMetrics) {
    return 'table_data';
  }

  if (hasDateDimension && !hasVideoDimension) {
    return 'chart';
  }

  if (hasHeaderIncludesAny(headers, ['linechart', 'trend', 'time series'])) {
    return 'chart';
  }

  return 'unknown';
};

const toNumber = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return 0;
  const cleaned = value.replace(/[^0-9.:-]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

const durationToSeconds = (duration: unknown): number => {
  if (typeof duration === 'number' && Number.isFinite(duration)) return duration;
  const raw = String(duration ?? '').trim();
  if (!raw) return 0;

  if (raw.includes(':')) {
    const parts = raw.split(':').map((part) => Number(part) || 0);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
  }

  return toNumber(raw);
};

const isLikelyTotalRow = (row: Record<string, unknown>): boolean => {
  const firstKey = Object.keys(row)[0];
  if (!firstKey) return false;
  return String(row[firstKey] ?? '').trim().toLowerCase() === 'total';
};

export const isLikelyTotalCsvRow = (row: Record<string, unknown>): boolean => isLikelyTotalRow(row);

export const detectContentTagFromRows = (rows: Record<string, unknown>[]): CsvTag | null => {
  if (rows.length === 0) return null;

  const dataRows = rows.filter((row) => !isLikelyTotalRow(row));
  if (dataRows.length === 0) return null;

  let shortEvidence = 0;
  let longEvidence = 0;

  dataRows.forEach((row) => {
    const stayedToWatch = toNumber(
      row['Stayed to watch (%)'] ?? row['Stayed to watch at 0:30 (%)'] ?? 0,
    );
    const endScreenShown = toNumber(row['End screen elements shown'] ?? 0);
    const shortsFeedViews = toNumber(
      row['Views from Shorts feed'] ?? row['Shorts feed views'] ?? 0,
    );
    const durationSec = durationToSeconds(row['Average view duration'] ?? row['Duration'] ?? 0);

    if (stayedToWatch > 0 || shortsFeedViews > 0 || (durationSec > 0 && durationSec <= 180)) {
      shortEvidence += 1;
    }
    if (endScreenShown > 0 || durationSec > 180) {
      longEvidence += 1;
    }
  });

  const isSingle = dataRows.length === 1;
  if (shortEvidence > 0 && longEvidence > 0) return 'mixed';
  if (shortEvidence > 0 && longEvidence === 0) return isSingle ? 'single_short_video' : 'shorts';
  if (longEvidence > 0 && shortEvidence === 0) return isSingle ? 'single_long_video' : 'long';
  return null;
};

export const inferTagFromPath = (pathLike: string): CsvTag => {
  const path = pathLike.toLowerCase();
  if (path.includes('traffic') || path.includes('source')) return 'traffic';
  if (path.includes('audience') || path.includes('viewer') || path.includes('subscriber')) return 'audience';
  if (path.includes('geography') || path.includes('location') || path.includes('country')) return 'geo';
  if (path.includes('external')) return 'external';
  if (path.includes('search term') || path.includes('search')) return 'search';
  if (path.includes('daily') || path.includes('date')) return 'daily';
  if (path.includes('short')) return 'shorts';
  if (path.includes('long') || path.includes('video')) return 'long';
  if (path.includes('total') || path.includes('channel') || path.includes('all')) return 'mixed';
  return 'other';
};

export const expandCsvAndZipFiles = async (
  files: File[],
): Promise<{ csvFiles: File[]; extractedDateRange: string }> => {
  const csvFiles: File[] = [];
  let extractedDateRange = '';

  for (const file of files) {
    const filePath = getFilePath(file);
    if (!extractedDateRange) {
      extractedDateRange = extractDateRangeFromName(filePath);
    }

    const lowerName = file.name.toLowerCase();
    const isZip = lowerName.endsWith('.zip') || ZIP_MIME_TYPES.has(file.type);
    const isCsv = lowerName.endsWith('.csv') || CSV_MIME_TYPES.has(file.type);

    if (isZip) {
      try {
        const zip = await JSZip.loadAsync(file);
        for (const relativePath in zip.files) {
          const entry = zip.files[relativePath];
          if (entry.dir || !entry.name.toLowerCase().endsWith('.csv')) continue;

          if (!extractedDateRange) {
            extractedDateRange = extractDateRangeFromName(entry.name);
          }

          const blob = await entry.async('blob');
          csvFiles.push(new File([blob], `${file.name}/${entry.name}`, { type: 'text/csv' }));
        }
      } catch (error) {
        console.warn(`Failed to extract zip: ${file.name}`, error);
      }
      continue;
    }

    if (isCsv) {
      csvFiles.push(file);
    }
  }

  return { csvFiles, extractedDateRange };
};

export const buildCsvFilesWithTags = async (
  files: File[],
  uploadType: CsvUploadType,
): Promise<CsvFileWithTag[]> => {
  return Promise.all(
    files.map(async (file) => {
      const text = await file.text();
      const data = parseCSV(text);

      let tag: CsvTag;
      if (uploadType !== 'auto') {
        tag = uploadType;
      } else {
        const detected = detectContentTagFromRows(data);
        tag = detected ?? inferTagFromPath(getFilePath(file));
      }

      const filePath = getFilePath(file);
      const inferredWindow = inferAnalyticsWindowFromName(filePath);
      const exportKind = classifyCsvExportKind(filePath, data);

      return {
        id: crypto.randomUUID(),
        name: file.name,
        file,
        data,
        tag,
        analyticsWindow: inferredWindow ?? undefined,
        exportKind,
      };
    }),
  );
};

export const getCsvTagColorClass = (tag: string): string => {
  switch (tag) {
    case 'shorts':
      return 'bg-[#FF7497] text-white';
    case 'long':
      return 'bg-[#00CCFF] text-black';
    case 'single_long_video':
      return 'bg-[#00CCFF] text-black';
    case 'single_short_video':
      return 'bg-[#FF7497] text-white';
    case 'traffic':
      return 'bg-[#CCFF00] text-black';
    case 'audience':
      return 'bg-[#FFB158] text-black';
    case 'geo':
      return 'bg-[#B14AED] text-white';
    case 'mixed':
    case 'combined':
      return 'bg-[#FFDD00] text-black';
    case 'external':
      return 'bg-[#24D3FF] text-black';
    case 'search':
      return 'bg-[#FFE357] text-black';
    case 'daily':
      return 'bg-[#F8FAFC] text-black';
    default:
      return 'bg-white text-black';
  }
};
