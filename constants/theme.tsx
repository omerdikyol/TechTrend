import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';

type ThemeContextType = {
  colors: typeof theme.light;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = theme[isDark ? 'dark' : 'light'];

  return (
    <ThemeContext.Provider value={{ colors, isDark }}>
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


