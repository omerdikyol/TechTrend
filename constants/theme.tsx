import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme, AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ColorScheme = 'light' | 'dark' | 'system';

type ThemeContextType = {
  colors: typeof theme.light;
  isDark: boolean;
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@theme_preference';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('system');

  useEffect(() => {
    // Load saved theme preference
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((value) => {
      if (value) {
        setColorSchemeState(value as ColorScheme);
      }
    });

    // Listen for app state changes to update theme
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && colorScheme === 'system') {
        // Force re-render when app becomes active to catch system theme changes
        setColorSchemeState('system');
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const setColorScheme = async (scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, scheme);
  };

  // Update immediately when system theme changes
  useEffect(() => {
    if (colorScheme === 'system') {
      // Force re-render
      setColorSchemeState('system');
    }
  }, [systemColorScheme]);

  const isDark = colorScheme === 'system' 
    ? systemColorScheme === 'dark'
    : colorScheme === 'dark';

  const colors = theme[isDark ? 'dark' : 'light'];

  return (
    <ThemeContext.Provider value={{ colors, isDark, colorScheme, setColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

const theme = {
  light: {
    background: {
      primary: '#FFFFFF',
      secondary: '#F5F5F5',
      tertiary: '#FAFAFA',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
      tertiary: '#999999',
    },
    border: {
      primary: 'rgba(0, 0, 0, 0.1)',
      secondary: 'rgba(0, 0, 0, 0.05)',
    },
    tag: {
      background: '#F0F0F0',
      text: '#666666',
    },
    gradient: {
      colors: ['#F5F5F5', '#FFFFFF', '#F5F5F5'],
      locations: [0, 0.5, 1],
    },
  },
  dark: {
    background: {
      primary: '#000000',
      secondary: '#1A1A1A',
      tertiary: '#2A2A2A',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#CCCCCC',
      tertiary: '#999999',
    },
    border: {
      primary: 'rgba(255, 255, 255, 0.1)',
      secondary: 'rgba(255, 255, 255, 0.05)',
    },
    tag: {
      background: '#333333',
      text: '#FFFFFF',
    },
    gradient: {
      colors: ['#000000', '#1A1A1A', '#000000'],
      locations: [0, 0.5, 1],
    },
  },
};


