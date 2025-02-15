import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Pressable, ActivityIndicator, RefreshControl, ScrollView, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import NewsCard from '../../components/NewsCard';
import { useNews } from '../../context/NewsContext';
import { useTheme } from '../../constants/theme';
import ThemeToggle from '../../components/ThemeToggle';
import { useSavedArticles } from '../../context/SavedArticlesContext';
import SavedArticles from '@/components/SavedArticles';

const MAX_VISIBLE_CARDS = 3; // Only show 3 cards at a time for better performance

export default function MainScreen() {
  const { articles, isLoading, error, fetchNews } = useNews();
  const [refreshing, setRefreshing] = useState(false);
  const [currentArticles, setCurrentArticles] = useState(articles);
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('discover');
  const { saveArticle } = useSavedArticles();
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  useEffect(() => {
    fetchNews(false).then(() => setHasInitiallyLoaded(true));
  }, []);

  useEffect(() => {
    setCurrentArticles(articles);
  }, [articles]);

  const handleSwipeLeft = () => {
    setCurrentArticles((prevArticles) => prevArticles.slice(1));
  };

  const handleSwipeRight = () => {
    if (currentArticles.length > 0) {
      saveArticle(currentArticles[0]);
      setCurrentArticles(prev => prev.slice(1));
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchNews(true);
    setRefreshing(false);
  }, [fetchNews]);

  const handleRefresh = () => {
    fetchNews(true);
  };

  // Calculate tab width based on screen width minus padding
  const tabWidth = (Dimensions.get('window').width - 32 - 82) / 2; // horizontal padding + right elements width

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ 
      translateX: withSpring(activeTab === 'discover' ? 0 : tabWidth, {
        mass: 0.5,
        damping: 12,
        stiffness: 100,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 2
      })
    }],
  }));

  const visibleArticles = currentArticles.slice(0, MAX_VISIBLE_CARDS);

  const renderDiscoverContent = () => (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.scrollContent, !visibleArticles.length && { flex: 1 }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={isDark ? '#fff' : '#000'}
        />
      }
    >
      {isLoading && !hasInitiallyLoaded ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
          <Text style={[styles.loadingText, { color: isDark ? '#ccc' : '#666' }]}>
            Finding interesting articles for you...
          </Text>
          <Text style={[styles.loadingSubtext, { color: isDark ? '#999' : '#888' }]}>
            This might take a moment
          </Text>
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
      ) : hasInitiallyLoaded && visibleArticles.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons 
            name="reload-circle-outline" 
            size={64} 
            color={isDark ? '#333' : '#ccc'}
          />
          <Text style={[styles.emptyText, { color: isDark ? '#fff' : '#000' }]}>
            No more articles to read
          </Text>
          <Text style={[styles.emptySubtext, { color: isDark ? '#ccc' : '#666', marginBottom: 16 }]}>
            Pull down to refresh and get new articles
          </Text>
          <Pressable
            style={[styles.refreshButton, { backgroundColor: isDark ? '#333' : '#e0e0e0' }]}
            onPress={handleRefresh}>
            <Text style={[styles.refreshButtonText, { color: isDark ? '#fff' : '#000' }]}>
              Refresh Articles
            </Text>
          </Pressable>
        </View>
      ) : (
        visibleArticles.map((item, index) => (
          <NewsCard
            key={item.id}
            item={item}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            style={{
              position: 'absolute',
              zIndex: visibleArticles.length - index,
            }}
          />
        ))
      )}
      {isLoading && hasInitiallyLoaded && (
        <View style={[styles.overlayLoading, { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)' }]}>
          <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
        </View>
      )}
    </ScrollView>
  );

  return (
    <View style={styles.mainContainer}>
      <View style={styles.header}>
        <View style={styles.navigationContainer}>
          <View style={[styles.tabBar, { backgroundColor: isDark ? '#333' : '#f0f0f0' }]}>
            <Animated.View 
              style={[
                styles.activeIndicator, 
                { backgroundColor: isDark ? '#fff' : '#000' },
                indicatorStyle
              ]} 
            />
            <Pressable 
              style={styles.tabButton} 
              onPress={() => setActiveTab('discover')}
            >
              <Text style={[
                styles.tabText,
                { color: activeTab === 'discover' ? (isDark ? '#fff' : '#000') : (isDark ? '#999' : '#666') }
              ]}>
                Discover
              </Text>
            </Pressable>
            <Pressable 
              style={styles.tabButton}
              onPress={() => setActiveTab('saved')}
            >
              <Text style={[
                styles.tabText,
                { color: activeTab === 'saved' ? (isDark ? '#fff' : '#000') : (isDark ? '#999' : '#666') }
              ]}>
                Saved
              </Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.headerActions}>
          <ThemeToggle />
          <Pressable 
            style={[styles.sourcesButton, { marginLeft: 8 }]}
            onPress={() => router.push('/feeds')}>
            <Ionicons 
              name="layers-outline" 
              size={24} 
              color={isDark ? '#fff' : '#000'} 
            />
          </Pressable>
        </View>
      </View>
      
      <View style={styles.content}>
        {activeTab === 'discover' ? renderDiscoverContent() : <SavedArticles />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
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
    paddingHorizontal: 16,
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
  navigationContainer: {
    flex: 1,
    marginRight: 16,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 25,
    position: 'relative',
    height: 44,
  },
  activeIndicator: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    borderRadius: 25,
    opacity: 0.1,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourcesButton: {
    padding: 8,
    borderRadius: 20,
  },
  loadingText: {
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  loadingSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: '80%',
  },
  overlayLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});