export interface ShortsRetentionData {
  timestamp: number;
  retention: number;
}

export interface EngagementData {
  timestamp: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

export const MOCK_SHORTS_DATA: ShortsRetentionData[] = [
  { timestamp: 0, retention: 100 },
  { timestamp: 15, retention: 85 },
  { timestamp: 30, retention: 60 },
  { timestamp: 45, retention: 40 },
  { timestamp: 60, retention: 20 },
];

export const MOCK_ENGAGEMENT_DATA: EngagementData[] = [
  { timestamp: 0, views: 0, likes: 0, comments: 0, shares: 0 },
  { timestamp: 1, views: 100, likes: 10, comments: 2, shares: 1 },
  { timestamp: 2, views: 250, likes: 25, comments: 5, shares: 3 },
];
