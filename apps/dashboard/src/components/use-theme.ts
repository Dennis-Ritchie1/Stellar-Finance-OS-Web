import { useCallback, useState } from 'react';

type Theme = 'light' | 'dark';
const KEY = 'finance-os.theme';

function initialTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

/** Toggles the `.dark` class used by the shared Tailwind tokens, and remembers the choice. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', next === 'dark');
      try {
        localStorage.setItem(KEY, next);
      } catch {
        // ignore unavailable storage
      }
      return next;
    });
  }, []);
  return { theme, toggle };
}
