import type { AppSettings } from '@/types';

const KEY = 'archdraw.settings';
const DEFAULTS: AppSettings = { theme: 'dark', defaultShowGrid: true, defaultSnapToGrid: true };

export const settingsService = {
  get(): AppSettings {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  },
  set(patch: Partial<AppSettings>): AppSettings {
    const next = { ...settingsService.get(), ...patch };
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
    return next;
  },
  applyTheme(theme: AppSettings['theme']) {
    document.documentElement.dataset.theme = theme;
  },
};
