import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { newsFeedService, CustomFeed } from '../services/NewsFeedService';

export function FeedManager() {
  const [feeds, setFeeds] = useState<CustomFeed[]>(newsFeedService.getCustomFeeds());
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [newFeedName, setNewFeedName] = useState('');

  const addFeed = () => {
    if (!newFeedUrl || !newFeedName) {
      Alert.alert('Error', 'Please provide both name and URL for the feed');
      return;
    }

    try {
      const url = new URL(newFeedUrl);
      const feed = newsFeedService.addCustomFeed({
        name: newFeedName,
        url: newFeedUrl,
        type: newFeedUrl.includes('newsapi.org') ? 'api' : 'rss',
      });
      setFeeds([...feeds, feed]);
      setNewFeedUrl('');
      setNewFeedName('');
    } catch (error) {
      Alert.alert('Error', 'Please enter a valid URL');
    }
  };

  const removeFeed = (id: string) => {
    newsFeedService.removeCustomFeed(id);
    setFeeds(feeds.filter(feed => feed.id !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Custom Feeds</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Feed Name"
          value={newFeedName}
          onChangeText={setNewFeedName}
        />
        <TextInput
          style={styles.input}
          placeholder="Feed URL"
          value={newFeedUrl}
          onChangeText={setNewFeedUrl}
          autoCapitalize="none"
          keyboardType="url"
        />
        <Pressable style={styles.addButton} onPress={addFeed}>
          <Text style={styles.buttonText}>Add Feed</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.feedList}>
        {feeds.map(feed => (
          <View key={feed.id} style={styles.feedItem}>
            <View style={styles.feedInfo}>
              <Text style={styles.feedName}>{feed.name}</Text>
              <Text style={styles.feedUrl} numberOfLines={1}>
                {feed.url}
              </Text>
            </View>
            <Pressable
              style={styles.removeButton}
              onPress={() => removeFeed(feed.id)}
            >
              <Ionicons name="trash-outline" size={24} color="#FF3B30" />
            </Pressable>
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
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  feedList: {
    flex: 1,
  },
  feedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  feedInfo: {
    flex: 1,
    marginRight: 12,
  },
  feedName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  feedUrl: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    padding: 8,
  },
});
