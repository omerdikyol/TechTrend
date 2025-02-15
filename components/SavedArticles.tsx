import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  ListRenderItem,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { NewsItem } from './NewsCard';
import { useSavedArticles } from '../context/SavedArticlesContext';
import { useTheme } from '../constants/theme';

export default function SavedArticles() {
  const { savedArticles, removeArticle } = useSavedArticles();
  const { isDark } = useTheme();

  const renderItem: ListRenderItem<NewsItem> = ({ item }) => (
    <Pressable
      style={[styles.card, { backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF' }]}
      onPress={() => router.push({ pathname: '/article/[id]', params: { id: item.id } })}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.cardHeader}>
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 2).map((tag) => (
              <View
                key={tag}
                style={[
                  styles.tag,
                  { backgroundColor: isDark ? '#333' : '#f0f0f0' },
                ]}>
                <Text
                  style={[styles.tagText, { color: isDark ? '#fff' : '#000' }]}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
          <Pressable
            onPress={() => removeArticle(item.id)}
            style={styles.removeButton}>
            <Ionicons
              name="bookmark"
              size={24}
              color={isDark ? '#fff' : '#000'}
            />
          </Pressable>
        </View>
        <Text
          style={[styles.title, { color: isDark ? '#fff' : '#000' }]}
          numberOfLines={2}>
          {item.title}
        </Text>
        <Text
          style={[styles.summary, { color: isDark ? '#ccc' : '#666' }]}
          numberOfLines={2}>
          {item.summary}
        </Text>
        <View style={styles.footer}>
          <Text style={[styles.source, { color: isDark ? '#ccc' : '#666' }]}>
            {item.source}
          </Text>
          <Text style={[styles.time, { color: isDark ? '#ccc' : '#666' }]}>
            {formatDistanceToNow(item.publishedAt, { addSuffix: true })}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {savedArticles.length > 0 ? (
        <FlatList
          data={savedArticles}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="bookmark-outline"
            size={64}
            color={isDark ? '#333' : '#ccc'}
          />
          <Text
            style={[styles.emptyText, { color: isDark ? '#fff' : '#000' }]}>
            No saved articles yet
          </Text>
          <Text
            style={[styles.emptySubtext, { color: isDark ? '#ccc' : '#666' }]}>
            Articles you save will appear here
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 20,
  },
  card: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    marginRight: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  removeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summary: {
    fontSize: 14,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  source: {
    fontSize: 14,
    fontWeight: '500',
  },
  time: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
  },
});