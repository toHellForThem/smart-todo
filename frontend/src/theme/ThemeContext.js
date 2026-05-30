import { createContext, useContext, useMemo } from 'react';
import { getTheme } from './theme';

export const ThemeContext = createContext({
  theme: getTheme('default'),
  isDark: false,
});

export const useAppTheme = () => useContext(ThemeContext);

export const useStyles = (styleCreator) => {
  const { theme } = useAppTheme();
  return useMemo(() => {
    if (typeof styleCreator === 'function') {
      return styleCreator(theme);
    }
    return styleCreator;
  }, [theme, styleCreator]);
};
