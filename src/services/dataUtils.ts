// src/services/dataUtils.ts
import { normalizeRow } from './dataNormalization';

export const generateFileId = (name: string) => `${name}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

export const parseCSVLine = (line: string) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim().replace(/^"|"$/g, ''));
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim().replace(/^"|"$/g, ''));
    return result;
};

export const extractMetadataFromPath = (fileName: string, folderName: string = '') => {
    let featureName = '';
    let dateRange = '';
    const folderParts = folderName.split('/');
    const lastFolder = folderParts[folderParts.length - 1] || fileName;
    
    // Match pattern like "Geography 2026-02-15_2026-03-15 The Motion Visual History"
    const dateMatch = lastFolder.match(/(\d{4}-\d{2}-\d{2}_\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
        dateRange = dateMatch[1];
        featureName = lastFolder.split(dateRange)[0].trim();
    } else {
        const match = lastFolder.match(/^(.*?)\s*(\d{4}-\d{2}-\d{2}_\d{4}-\d{2}-\d{2})?$/);
        if (match) {
            featureName = match[1].trim();
            dateRange = match[2] || '';
        }
    }
    return { featureName, dateRange };
};

export const cleanCSVValue = (val: any) => {
    if (val === '' || val === null || val === undefined) return null;

    if (typeof val === 'string' && val.includes(':')) {
        const parts = val.split(':').map(Number);
        if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
            return parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            return parts[0] * 60 + parts[1];
        }
    }

    // Strip commas, currency symbols, and spaces from numbers like "$ 1,234.56"
    const cleanVal = typeof val === 'string' ? val.replace(/[$,\s]/g, '') : val;
    if (cleanVal !== '' && !isNaN(Number(cleanVal))) {
        return Number(cleanVal);
    }
    return val;
};

export const processCSVText = (
    text: string, 
    fileName: string, 
    folderName: string = '', 
    fileId: string,
    videoType: 'shorts' | 'long' | 'combined' = 'combined'
) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) return [];

    const headers = parseCSVLine(lines[0]);
    
    // Detect type based on folder or filename
    let type = 'unknown';
    const lowerFolder = (folderName || '').toLowerCase();
    const lowerFile = (fileName || '').toLowerCase();
    if (lowerFolder.includes('table data') || lowerFile.includes('table data')) type = 'table';
    else if (lowerFolder.includes('chart data') || lowerFile.includes('chart data')) type = 'chart';
    else if (lowerFolder.includes('totals') || lowerFile.includes('totals')) type = 'totals';
    else if (lowerFile === 'all.csv') type = 'all';
    else if (lowerFile.includes('new, casual and regular viewers')) type = 'breakdown';
    else if (lowerFile.includes('subscribers')) type = 'subscribers';

    const { featureName, dateRange } = extractMetadataFromPath(fileName, folderName);

    return lines.slice(1).map(line => {
        const values = parseCSVLine(line);
        const row: any = {};
        headers.forEach((header, index) => {
            row[header] = cleanCSVValue(values[index]);
        });
        
        row['_sourceFile'] = fileName;
        row['_fileId'] = fileId;
        row['_folder'] = folderName;
        row['_type'] = type;
        row['_featureName'] = featureName;
        row['_dateRange'] = dateRange;
        row['_userTag'] = videoType;
        
        return normalizeRow(row);
    }).filter(row => {
        const isEmptyRow = Object.values(row).every(v => v === null || v === '' || v === 'null' || v === 'undefined');
        return !isEmptyRow;
    });
};
