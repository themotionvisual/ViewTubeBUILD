export type VaultKeyName = 'gemini' | 'googleClientId' | 'elevenLabs' | 'auphonic';

const KEY_MAP: Record<VaultKeyName, string> = {
  gemini: 'yt_api_key',
  googleClientId: 'yt_google_client_id',
  elevenLabs: 'vt_elevenlabs_key',
  auphonic: 'vt_auphonic_key',
};

const GEMINI_ALIASES = ['yt_api_key', 'vt_gemini_api_key', 'gemini_api_key', 'google_api_key'];

const DEFAULTS: Partial<Record<VaultKeyName, string>> = {
  googleClientId: '365513395077-1cpc5mgn763t62ggcujkgbiv11rdbhsv.apps.googleusercontent.com',
};

export interface VaultSnapshot {
  gemini: string;
  googleClientId: string;
  elevenLabs: string;
  auphonic: string;
}

export const getVaultKey = (name: VaultKeyName): string => {
  if (name === 'gemini') {
    const found = GEMINI_ALIASES.map((key) => localStorage.getItem(key) || '').find((value) => value.trim().length > 0);
    return found || '';
  }
  const storageKey = KEY_MAP[name];
  return localStorage.getItem(storageKey) || DEFAULTS[name] || '';
};

export const setVaultKey = (name: VaultKeyName, value: string): void => {
  if (name === 'gemini') {
    const trimmed = value.trim();
    if (!trimmed) {
      GEMINI_ALIASES.forEach((key) => localStorage.removeItem(key));
      return;
    }
    GEMINI_ALIASES.forEach((key) => localStorage.setItem(key, trimmed));
    return;
  }

  const storageKey = KEY_MAP[name];
  if (!value) {
    localStorage.removeItem(storageKey);
    return;
  }
  localStorage.setItem(storageKey, value);
};

export const getVaultSnapshot = (): VaultSnapshot => ({
  gemini: getVaultKey('gemini'),
  googleClientId: getVaultKey('googleClientId'),
  elevenLabs: getVaultKey('elevenLabs'),
  auphonic: getVaultKey('auphonic'),
});

export const setVaultSnapshot = (snapshot: Partial<VaultSnapshot>): void => {
  if (snapshot.gemini !== undefined) setVaultKey('gemini', snapshot.gemini);
  if (snapshot.googleClientId !== undefined) setVaultKey('googleClientId', snapshot.googleClientId);
  if (snapshot.elevenLabs !== undefined) setVaultKey('elevenLabs', snapshot.elevenLabs);
  if (snapshot.auphonic !== undefined) setVaultKey('auphonic', snapshot.auphonic);
};

export const hasVaultKey = (name: VaultKeyName): boolean => {
  return getVaultKey(name).trim().length > 0;
};
