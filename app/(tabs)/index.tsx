import React, { useState, useEffect } from 'react';
import { View, StyleSheet, useColorScheme, Text, Pressable, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Background from '../../components/Background';
import { useSavedArticles } from '../../context/SavedArticlesContext';
import NewsCard from '../../components/NewsCard';
import { useNews } from '../../context/NewsContext';

export default function DiscoverScreen() {
  const { articles, isLoading, error, fetchNews } = useNews();
  const [refreshing, setRefreshing] = useState(false);
  const [currentArticles, setCurrentArticles] = useState(articles);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    fetchNews(false); // Use cached data on initial load
  }, []);

  useEffect(() => {
    setCurrentArticles(articles);
  }, [articles]);

  const handleSwipeLeft = () => {
    setCurrentArticles((prevArticles) => prevArticles.slice(1));
  };

  const { saveArticle } = useSavedArticles();

  const handleSwipeRight = () => {
    // Save the current article
    if (currentArticles.length > 0) {
      saveArticle(currentArticles[0]);
      setCurrentArticles(prev => prev.slice(1));
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchNews(true); // Force fresh data
    setRefreshing(false);
  }, [fetchNews]);

  const handleRefresh = () => {
    fetchNews(true);
  };

  return (
    <Background>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#000' }]}>Discover</Text>
        <Pressable 
          style={styles.sourcesButton}
          onPress={() => router.push('/feeds')}>
          <Ionicons 
            name="layers-outline" 
            size={24} 
            color={isDark ? '#fff' : '#000'} 
          />
        </Pressable>
      </View>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, !currentArticles.length && { flex: 1 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? '#fff' : '#000'}
          />
        }
      >
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
            {error}
          </Text>
          <Pressable
            style={[styles.refreshButton, { backgroundColor: isDark ? '#333' : '#e0e0e0' }]}
            onPress={handleRefresh}>
            <Text style={[styles.refreshButtonText, { color: isDark ? '#fff' : '#000' }]}>
              Try Again
            </Text>
          </Pressable>
        </View>
      ) : currentArticles.length > 0 ? (
        currentArticles.map((item, index) => (
          <NewsCard
            key={item.id}
            item={item}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            style={{
              position: 'absolute',
              zIndex: currentArticles.length - index,
            }}
          />
        ))
      ) : (
        <View style={styles.centerContainer}>
          <Text style={[styles.emptyText, { color: isDark ? '#fff' : '#000' }]}>
            No more articles to read
          </Text>
          <Pressable
            style={[styles.refreshButton, { backgroundColor: isDark ? '#333' : '#e0e0e0' }]}
            onPress={handleRefresh}>
            <Text style={[styles.refreshButtonText, { color: isDark ? '#fff' : '#000' }]}>
              Refresh Articles
            </Text>
          </Pressable>
        </View>
      )}
      </ScrollView>
    </Background>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  centerContainer: {
    width: '100%',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorTextDark: {
    color: '#FF453A',
  },
  container: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  refreshButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  sourcesButton: {
    padding: 8,
    borderRadius: 20,
  },
});