import { describe, it, expect, vi } from 'vitest';
import { googleService } from './googleService';

describe('GoogleService', () => {
  it('should fetch user info', async () => {
    const mockUser = { email: 'test@example.com' };
    vi.spyOn(googleService as any, 'request').mockResolvedValue(mockUser);
    
    const result = await googleService.getUserInfo();
    expect(result).toEqual(mockUser);
    expect(googleService['request']).toHaveBeenCalledWith('https://www.googleapis.com', '/oauth2/v3/userinfo');
  });
});
