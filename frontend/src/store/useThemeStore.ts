import { create } from 'zustand';
import Cookies from 'js-cookie';

const THEME_STORAGE_KEY = 'haven-theme';
const THEME_COOKIE_KEY = 'haven_theme';

type HavenTheme = 'light' | 'dark';

const applyTheme = (theme: HavenTheme) => {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }

  Cookies.set(THEME_COOKIE_KEY, theme, { expires: 365, sameSite: 'strict' });
};

const resolveInitialTheme = (): HavenTheme => {
  if (typeof window === 'undefined') {
    return (Cookies.get(THEME_COOKIE_KEY) as HavenTheme) || 'light';
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY) as HavenTheme | null;
  const cookieTheme = Cookies.get(THEME_COOKIE_KEY) as HavenTheme | undefined;

  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  if (cookieTheme === 'light' || cookieTheme === 'dark') {
    return cookieTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

interface ThemeState {
  theme: HavenTheme;
  toggleTheme: () => void;
  setTheme: (theme: HavenTheme) => void;
  initializeTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: resolveInitialTheme(),
  toggleTheme: () => set((state) => {
    const newTheme: HavenTheme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    return { theme: newTheme };
  }),
  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
  initializeTheme: () => {
    const theme = resolveInitialTheme();
    applyTheme(theme);
    set({ theme });
  },
}));
