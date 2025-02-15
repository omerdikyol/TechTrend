import { useCallback, useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SavedArticlesProvider } from '../context/SavedArticlesContext';
import { NewsProvider } from '../context/NewsContext';
import { ThemeProvider } from '../constants/theme';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NewsProvider>
          <SavedArticlesProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="article/[id]" options={{ headerShown: false }} />
            </Stack>
          </SavedArticlesProvider>
        </NewsProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  )
}