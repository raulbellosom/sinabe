import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { useUserPreference } from '../../context/UserPreferenceContext';

const THEME_STORAGE_KEY = 'sinabe-theme';
const THEMES = ['light', 'dark', 'system'];

const ThemeContext = createContext({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
});

const getSystemTheme = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const getStoredTheme = () => {
  const value = localStorage.getItem(THEME_STORAGE_KEY);
  return THEMES.includes(value) ? value : 'system';
};

export const ThemeProvider = ({ children }) => {
  const { user } = useAuthContext();
  const { preferences, updatePreference } = useUserPreference();
  const hasStoredThemeRef = useRef(
    typeof window !== 'undefined'
      ? localStorage.getItem(THEME_STORAGE_KEY) !== null
      : false,
  );

  const [theme, setThemeState] = useState(() => {
    if (typeof window === 'undefined') {
      return 'system';
    }
    return getStoredTheme();
  });

  const [resolvedTheme, setResolvedTheme] = useState(() =>
    typeof window === 'undefined' ? 'light' : getSystemTheme(),
  );

  const serverThemeAppliedRef = useRef(false);

  const applyTheme = useCallback((nextTheme) => {
    const root = document.documentElement;
    const effectiveTheme = nextTheme === 'system' ? getSystemTheme() : nextTheme;

    root.classList.toggle('dark', effectiveTheme === 'dark');
    root.dataset.theme = effectiveTheme;
    setResolvedTheme(effectiveTheme);
  }, []);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [theme, applyTheme]);

  useEffect(() => {
    const serverTheme = preferences?.preferences?.theme;

    if (
      user &&
      serverTheme &&
      THEMES.includes(serverTheme) &&
      !serverThemeAppliedRef.current &&
      !hasStoredThemeRef.current
    ) {
      setThemeState(serverTheme);
      serverThemeAppliedRef.current = true;
    }
  }, [preferences, user]);

  const setTheme = useCallback(
    async (nextTheme) => {
      if (!THEMES.includes(nextTheme)) {
        return;
      }

      setThemeState(nextTheme);
      hasStoredThemeRef.current = true;

      if (!user) {
        return;
      }

      try {
        await updatePreference('theme', nextTheme);
      } catch (error) {
        console.error('No se pudo sincronizar el tema con backend', error);
      }
    },
    [updatePreference, user],
  );

  const toggleTheme = useCallback(() => {
    const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  }, [resolvedTheme, setTheme]);

  const contextValue = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
      themes: THEMES,
    }),
    [theme, resolvedTheme, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
  );
};

export default ThemeContext;
