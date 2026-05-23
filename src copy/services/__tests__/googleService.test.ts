import { GoogleService } from '../googleService';
import { getAccessToken, logout } from '../authSession';
import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';

// Mock authSession
vi.mock('../authSession', () => ({
  getAccessToken: vi.fn(),
  logout: vi.fn(),
}));

describe('GoogleService', () => {
  let googleService: GoogleService;

  beforeEach(() => {
    googleService = new GoogleService();
    (getAccessToken as any).mockReturnValue('fake-token');
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch user info', async () => {
    const mockUserInfo = { email: 'test@example.com' };
    (global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(mockUserInfo),
    });

    const result = await googleService.getUserInfo();
    
    expect(global.fetch).toHaveBeenCalledWith(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer fake-token',
        }),
      })
    );
    expect(result).toEqual(mockUserInfo);
  });
});
