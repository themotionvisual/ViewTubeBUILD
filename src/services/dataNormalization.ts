// src/services/dataNormalization.ts

export const HEADER_MAP: Record<string, string> = {
  // Dimensions
  'Video title': 'Dimension',
  'Title': 'Dimension',
  'Video': 'Dimension',
  'Geography': 'Dimension',
  'Traffic source': 'Dimension',
  'Device type': 'Dimension',
  'Subscription status': 'Dimension',
  'Viewer age': 'Dimension',
  'Viewer gender': 'Dimension',
  'Date': 'Date',

  // Core Metrics
  'Views': 'Views',
  'View count': 'Views',
  'Watch time (hours)': 'Watch Time (Hours)',
  'Watch Time (Hours)': 'Watch Time (Hours)',
  'Estimated revenue': 'Revenue',
  'Estimated revenue (USD)': 'Revenue',
  'Estimated revenue (Local)': 'Revenue',
  'estimatedRevenue': 'Revenue',
  'Revenue': 'Revenue',
  'Your estimated revenue (USD)': 'Revenue',
  'RPM': 'RPM',
  'RPM (USD)': 'RPM',
  'CPM': 'CPM',
  'CPM (USD)': 'CPM',
  'Subscribers': 'Subscribers Gained',
  'Subscribers gained': 'Subscribers Gained',
  'subscribersGained': 'Subscribers Gained',
  
  // Engagement
  'Impressions': 'Impressions',
  'Impressions click-through rate (%)': 'CTR (%)',
  'impressionClickThroughRate': 'CTR (%)',
  'CTR (%)': 'CTR (%)',
  'Average view duration': 'AVD (Sec)',
  'averageViewDuration': 'AVD (Sec)',
  'Average view percentage (%)': 'AVP (%)',
  'averageViewPercentage': 'AVP (%)',
  'AVP (%)': 'AVP (%)',
  'estimatedMinutesWatched': 'Watch Time (Hours)',
  'Likes': 'Likes',
  'Dislikes': 'Dislikes',
  'Comments': 'Comments',
  'Comments added': 'Comments',
  'Shares': 'Shares',
  'Hypes': 'Hypes',
  'Hype points': 'Hype Points',

  // Audience
  'Unique viewers': 'Unique Viewers',
  'New viewers': 'New Viewers',
  'Returning viewers': 'Returning Viewers',
  'Casual viewers': 'Casual Viewers',
  'Regular viewers': 'Regular Viewers',
  'Average views per viewer': 'Avg Views Per Viewer',
  
  // Membership & Shopping
  'Members gained': 'Members Gained',
  'Members lost': 'Members Lost',
  'Total members': 'Total Members',
  'Product clicks': 'Product Clicks',
  'Orders': 'Orders'
};

export const normalizeRow = (row: Record<string, any>): Record<string, any> => {
  const normalized: Record<string, any> = {};
  
  // Create a lowercase map for case-insensitive lookup
  const lowerHeaderMap = Object.keys(HEADER_MAP).reduce((acc, key) => {
    acc[key.toLowerCase()] = HEADER_MAP[key];
    return acc;
  }, {} as Record<string, string>);

  // Map headers case-insensitively
  Object.keys(row).forEach(key => {
    const val = row[key];
    const lowerKey = key.toLowerCase();
    const standardKey = lowerHeaderMap[lowerKey];

    if (standardKey) {
      // Calculate title length if standardKey is Dimension and we suspect it's a video title
      if (standardKey === 'Dimension' && typeof val === 'string') {
          normalized['titleLength'] = val.length;
      }

      // Clean numeric values
      if (typeof val === 'string' && standardKey !== 'Dimension' && standardKey !== 'Date') {
        const cleaned = val.replace(/[^0-9.-]/g, '');
        normalized[standardKey] = cleaned === '' ? 0 : Number(cleaned);
      } else {
        normalized[standardKey] = val;
      }

      // Special handling for units (e.g., minutes to hours)
      if (lowerKey === 'estimatedminuteswatched') {
        normalized[standardKey] = (Number(normalized[standardKey]) || 0) / 60;
      }
    } else if (key.startsWith('_')) {
      // Preserve private fields
      normalized[key] = val;
    } else {
      // Fallback for unmapped headers
      normalized[key] = val;
    }
  });

  return normalized;
};

export const getStandardKey = (rawKey: string): string => {
  return HEADER_MAP[rawKey] || rawKey;
};

export const METRIC_COLORS: Record<string, string> = {
  'Views': '#FF7497',
  'Revenue': '#CCFF00',
  'Subscribers Gained': '#00CCFF',
  'Watch Time (Hours)': '#FFDD00',
  'CTR (%)': '#FF00FF',
  'AVP (%)': '#00FFCC'
};
