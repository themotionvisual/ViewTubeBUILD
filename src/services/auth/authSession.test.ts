
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login, unifiedAuth } from './authSession';

describe('authSession', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      location: {
        origin: 'http://localhost',
        hash: '',
        pathname: '/',
        search: ''
      },
      crypto: {
        getRandomValues: vi.fn(),
        subtle: { digest: vi.fn() }
      },
      open: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      name: '',
      history: { replaceState: vi.fn() },
      close: vi.fn(),
      opener: null
    });
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn()
    });
    vi.stubGlobal('TextEncoder', vi.fn());
    vi.stubGlobal('btoa', vi.fn());
  });

  it('UnifiedAuthContract has login', () => {
    expect(unifiedAuth.login).toBeDefined();
  });

  it('login accepts mode parameter', async () => {
    // We cannot easily test redirect here because it changes window.location,
    // but we can check if it calls the popup flow as default.
    // The previous test was 'login is not a function', now 'login' exists.
    await expect(login('popup')).rejects.toThrow('Popup was blocked');
  });

  it('caches auth storage reads across repeated token lookups', async () => {
    vi.resetModules();

    const getItem = vi.fn().mockReturnValue(
      JSON.stringify({
        accessToken: 'cached-token',
        tokenExpiry: Date.now() + 60_000,
      }),
    );

    vi.stubGlobal('window', {
      location: {
        origin: 'http://localhost',
        hash: '',
        pathname: '/',
        search: ''
      },
      crypto: {
        getRandomValues: vi.fn(),
        subtle: { digest: vi.fn() }
      },
      open: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      name: '',
      history: { replaceState: vi.fn() },
      close: vi.fn(),
      opener: null
    });

    vi.stubGlobal('localStorage', {
      getItem,
      setItem: vi.fn(),
      removeItem: vi.fn()
    });

    const { getAccessToken } = await import('./authSession');

    expect(getAccessToken()).toBe('cached-token');
    expect(getAccessToken()).toBe('cached-token');
    expect(getItem).toHaveBeenCalledTimes(1);
  });

  it('logout clears auth keys without deleting analytics cache', async () => {
    vi.resetModules();

    const removeItem = vi.fn();
    const dispatchEvent = vi.fn();

    vi.stubGlobal('window', {
      location: {
        origin: 'http://localhost',
        hash: '',
        pathname: '/',
        search: ''
      },
      crypto: {
        getRandomValues: vi.fn(),
        subtle: { digest: vi.fn() }
      },
      open: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent,
      name: '',
      history: { replaceState: vi.fn() },
      close: vi.fn(),
      opener: null
    });

    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue('{}'),
      setItem: vi.fn(),
      removeItem
    });

    const { logout } = await import('./authSession');
    logout();

    expect(removeItem).toHaveBeenCalledWith('vt_auth');
    expect(removeItem).toHaveBeenCalledWith('vt_session');
    expect(removeItem).not.toHaveBeenCalledWith('yt_analytics_cache');
    expect(dispatchEvent).toHaveBeenCalled();
  });
});
