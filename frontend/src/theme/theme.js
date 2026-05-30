import { AuthStorage } from '../utils/storage';

export const defaultColors = {
  primary: '#3B82F6',
  primaryLight: '#d9e7fd',
  background: '#F1F5F9',
  surface: '#FFFFFF',
  text: {
    primary: '#1E293B',
    secondary: '#64748B',
    muted: '#94A3B8',
    white: '#FFFFFF',
    link: '#3B82F6',
  },
  border: {
    light: '#E2E8F0',
    default: '#CBD5E1',
  },
  danger: '#EF4444',
  icon: {
    primary: '#3B82F6',
    active: '#FFFFFF',
    bg: '#d9e7fd',
    bgActive: '#3B82F6',
  },
};

export const darkColors = {
  primary: '#8B5CF6',
  primaryLight: '#2e1065',
  background: '#0F172A',
  surface: '#1E293B',
  text: {
    primary: '#F8FAFC',
    secondary: '#94A3B8',
    muted: '#64748B',
    white: '#FFFFFF',
    link: '#A78BFA',
  },
  border: {
    light: '#334155',
    default: '#475569',
  },
  danger: '#EF4444',
  icon: {
    primary: '#8B5CF6',
    active: '#FFFFFF',
    bg: '#2e1065',
    bgActive: '#8B5CF6',
  },
};

export const getTheme = (themeName) => {
  const colors = themeName === 'dark' ? darkColors : defaultColors;
  return {
    colors,
    spacing: {
      xs: 4,
      sm: 8,
      smd: 10,
      md: 12,
      lg: 16,
      xl: 20,
      xxl: 24,
    },
    radius: {
      xs: 4,
      sm: 6,
      md: 10,
      lg: 12,
      xl: 15,
      full: 9999,
    },
    sizes: {
      headerHeight: 60,
      footerHeight: 70,
      checkbox: 24,
      floatingContainer: 50,
      progressBar: 10,
      moodMeterHeight: 374,
    }
  };
};

// Fallback static theme for legacy non-dynamic components
const getActiveColors = () => {
  try {
    const saved = AuthStorage.getSettings();
    if (saved?.theme === 'dark') {
      return darkColors;
    }
  } catch (e) {
    // Fallback if MMKV is not loaded yet
  }
  return defaultColors;
};

export const theme = {
  colors: getActiveColors(),
  spacing: {
    xs: 4,
    sm: 8,
    smd: 10,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  radius: {
    xs: 4,
    sm: 6,
    md: 10,
    lg: 12,
    xl: 15,
    full: 9999,
  },
  sizes: {
    headerHeight: 60,
    footerHeight: 70,
    checkbox: 24,
    floatingContainer: 50,
    progressBar: 10,
    moodMeterHeight: 374,
  }
};
