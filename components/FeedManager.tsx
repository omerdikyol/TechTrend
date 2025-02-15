import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  useColorScheme,
} from 'react-native';
import { newsFeedService, CustomFeed } from '../services/NewsFeedService';

export function FeedManager() {
  const [feeds, setFeeds] = useState<CustomFeed[]>(newsFeedService.getAllFeeds());
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const toggleFeed = useCallback((id: string, enabled: boolean) => {
    newsFeedService.toggleFeed(id, enabled);
    setFeeds(newsFeedService.getAllFeeds());
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1A1A1A' : '#fff' }]}>
      <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>News Sources</Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 60,
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
