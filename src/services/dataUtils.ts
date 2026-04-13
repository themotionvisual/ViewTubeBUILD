import { normalizeRow } from './dataNormalization';

export const generateFileId = (name: string) => `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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

    const cleanVal = typeof val === 'string' ? val.replace(/[$,\s]/g, '') : val;
    if (cleanVal !== '' && !isNaN(Number(cleanVal))) {
        return Number(cleanVal);
    }
    return val;
};

export const processCSVText = (text: string, fileName: string, folderName: string = '', fileId: string = '') => {
    if (!text || text.trim().length === 0) return [];
    const lines = text.split('\n').filter(l => l.trim() !== '');
    if (lines.length < 2) return [];

    const headers = parseCSVLine(lines[0]);
    const data: any[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const rowObj: any = {};
        let isEmptyRow = true;

        for (let j = 0; j < headers.length; j++) {
            const h = headers[j];
            const val = values[j];

            if (val !== undefined && val !== '') {
                rowObj[h] = cleanCSVValue(val);
                if (rowObj[h] !== null) {
                    isEmptyRow = false;
                }
            } else {
                rowObj[h] = null;
            }
        }

        if (!isEmptyRow) {
            // Filter out 'Total' rows
            const firstColKey = Object.keys(rowObj)[0];
            const firstColVal = String(rowObj[firstColKey] || '').toLowerCase();
            if (firstColVal !== 'total' && firstColVal !== 'totals' && firstColVal !== 'grand total') {
                const metadata = extractMetadataFromPath(fileName, folderName);
                const normalizedRow = normalizeRow(rowObj);

                data.push({
                    ...normalizedRow,
                    _sourceFile: fileName,
                    _folderName: folderName,
                    _featureName: metadata.featureName,
                    _dateRange: metadata.dateRange,
                    _id: `${fileId}-${i}`
                });
            }
        }
    }
    return data;
};