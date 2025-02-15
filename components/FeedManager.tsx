import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { newsFeedService, CustomFeed } from '../services/NewsFeedService';
import { useTheme } from '../constants/theme';
import ThemeToggle from '../components/ThemeToggle';

export function FeedManager() {
  const [feeds, setFeeds] = useState<CustomFeed[]>(newsFeedService.getAllFeeds());
  const { isDark } = useTheme();

  const toggleFeed = useCallback((id: string, enabled: boolean) => {
    newsFeedService.toggleFeed(id, enabled);
    setFeeds(newsFeedService.getAllFeeds());
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1A1A1A' : '#fff' }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDark ? '#fff' : '#000'}
          />
        </Pressable>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>News Sources</Text>
        <ThemeToggle />
      </View>
      <ScrollView style={styles.feedList}>
        {feeds.map(feed => (
          <View key={feed.id} style={[styles.feedItem, { borderBottomColor: isDark ? '#333' : '#eee' }]}>
            <View style={styles.feedInfo}>
              <Text style={[styles.feedName, { color: isDark ? '#fff' : '#000' }]}>{feed.name}</Text>
            </View>
            <Switch
              value={feed.enabled}
              onValueChange={(enabled) => toggleFeed(feed.id, enabled)}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={feed.enabled ? '#007AFF' : '#f4f3f4'}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 60,
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 16,
  },
  feedList: {
    flex: 1,
  },
  feedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  feedInfo: {
    flex: 1,
    marginRight: 12,
  },
  feedName: {
    fontSize: 16,
    fontWeight: '500',
  },
});
