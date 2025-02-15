import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SavedArticlesProvider } from '../context/SavedArticlesContext';
import { NewsProvider } from '../context/NewsContext';
import { ThemeProvider } from '../constants/theme';
import { useTheme } from '../constants/theme';
import ThemeToggle from '../components/ThemeToggle';
import { View } from 'react-native';

function AppLayout() {
  const { isDark } = useTheme();

  return (
    <Stack screenOptions={{
      headerShown: false,
      headerRight: () => (
        <View style={{ marginRight: 16 }}>
          <ThemeToggle />
        </View>
      ),
    }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="article/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <NewsProvider>
          <SavedArticlesProvider>
            <AppLayout />
            <StatusBar style="auto" />
          </SavedArticlesProvider>
        </NewsProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}