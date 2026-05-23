import { vi, test, expect } from 'vitest';
import * as youtubeAnalyticsFetcher from './youtubeAnalyticsFetcher';

// Partially mock youtubeApiClient
vi.mock('./youtubeApiClient', async () => {
  const actual = await vi.importActual('./youtubeApiClient');
  return {
    ...actual,
    proxyFetch: vi.fn(),
    refreshTokenIfExpired: vi.fn().mockResolvedValue('mock-token'),
  };
});

test('chunks video IDs into batches of 250', async () => {
  const { proxyFetch } = await import('./youtubeApiClient');
  (proxyFetch as any).mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ rows: [['v1', 10]] })
  });

  const videoIds = Array.from({ length: 300 }, (_, i) => `vid${i}`);
  await youtubeAnalyticsFetcher.getVideoAnalytics(videoIds, '2024-01-01', '2024-01-02');

  // Verify called twice (once for 250, once for 50)
  expect(proxyFetch).toHaveBeenCalledTimes(2);
});
