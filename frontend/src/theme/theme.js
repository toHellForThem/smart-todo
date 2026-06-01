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

export const mintColors = {
  primary: '#10B981',
  primaryLight: '#D1FAE5',
  background: '#F0FDF4',
  surface: '#FFFFFF',
  text: {
    primary: '#064E3B',
    secondary: '#374151',
    muted: '#6B7280',
    white: '#FFFFFF',
    link: '#10B981',
  },
  border: {
    light: '#E6F4EA',
    default: '#A7F3D0',
  },
  danger: '#EF4444',
  icon: {
    primary: '#10B981',
    active: '#FFFFFF',
    bg: '#D1FAE5',
    bgActive: '#10B981',
  },
};

export const pinkColors = {
  primary: '#EC4899',
  primaryLight: '#FCE7F3',
  background: '#FDF2F8',
  surface: '#FFFFFF',
  text: {
    primary: '#3F2C35', // Soft, highly readable deep rose-charcoal
    secondary: '#5C4E55', // Soft warm slate
    muted: '#94A3B8',
    white: '#FFFFFF',
    link: '#EC4899',
  },
  border: {
    light: '#FCE7F3',
    default: '#FBCFE8',
  },
  danger: '#EF4444',
  icon: {
    primary: '#EC4899',
    active: '#FFFFFF',
    bg: '#FCE7F3',
    bgActive: '#EC4899',
  },
};


export const getTheme = (themeName) => {
  let colors = defaultColors;
  if (themeName === 'dark') {
    colors = darkColors;
  } else if (themeName === 'mint') {
    colors = mintColors;
  } else if (themeName === 'pink') {
    colors = pinkColors;
  }
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
    if (saved?.theme === 'mint') {
      return mintColors;
    }
    if (saved?.theme === 'pink') {
      return pinkColors;
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
