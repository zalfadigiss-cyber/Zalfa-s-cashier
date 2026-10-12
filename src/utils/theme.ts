export type ThemeSetting = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export function getInitialTheme(): ThemeSetting {
  try {
    const saved = localStorage.getItem('kasirku_theme') as ThemeSetting | null;
    if (saved === 'dark' || saved === 'light' || saved === 'system') {
      return saved;
    }
  } catch {
    // fallback
  }
  return 'system';
}

export function getResolvedTheme(setting: ThemeSetting): ResolvedTheme {
  if (setting === 'system') {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }
  return setting;
}

export function applyTheme(setting: ThemeSetting): ResolvedTheme {
  const resolved = getResolvedTheme(setting);
  try {
    localStorage.setItem('kasirku_theme', setting);
    if (typeof document !== 'undefined') {
      if (resolved === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
        document.documentElement.style.colorScheme = 'light';
      }
    }
  } catch (e) {
    console.warn('[Theme] Could not apply theme:', e);
  }
  return resolved;
}

export function setupSystemThemeListener(onSystemThemeChange: () => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return () => {};
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = () => {
    const currentSetting = getInitialTheme();
    if (currentSetting === 'system') {
      applyTheme('system');
      onSystemThemeChange();
    }
  };

  try {
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  } catch {
    mediaQuery.addListener(handler);
    return () => mediaQuery.removeListener(handler);
  }
}
