import { useEffect, useState } from 'react';
import { settingsService } from '@/services/settingsService';
import type { AppSettings } from '@/types';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => settingsService.get());
  useEffect(() => settingsService.applyTheme(settings.theme), [settings.theme]);
  const update = (patch: Partial<AppSettings>) => setSettings(settingsService.set(patch));
  return { settings, update };
}
