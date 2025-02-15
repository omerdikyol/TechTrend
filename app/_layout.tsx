import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SavedArticlesProvider } from '../context/SavedArticlesContext';
import { NewsProvider } from '../context/NewsContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NewsProvider>
        <SavedArticlesProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="article/[id]" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="light" />
        </SavedArticlesProvider>
      </NewsProvider>
    </GestureHandlerRootView>
  );
}