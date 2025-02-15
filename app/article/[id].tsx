import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  useColorScheme,
  Pressable,
  Share,
  Alert,
  SafeAreaView,
} from 'react-native';
import Background from '../../components/Background';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { mockNews } from '../(tabs)/index';

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const article = mockNews.find((a) => a.id === id);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${article?.title}\n\nRead more at: ${article?.url}`,
        url: article?.url, // iOS only
        title: article?.title, // Android only
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share the article');
    }
  };

  if (!article) {
    return (
      <View style={styles.container}>
        <Text style={[styles.text, { color: isDark ? '#fff' : '#000' }]}>
          Article not found
        </Text>
      </View>
    );
  }

  return (
    <Background>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDark ? '#fff' : '#000'}
            />
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable style={styles.actionButton}>
              <Ionicons
                name="bookmark-outline"
                size={24}
                color={isDark ? '#fff' : '#000'}
              />
            </Pressable>
            <Pressable style={styles.actionButton} onPress={handleShare}>
              <Ionicons
                name="share-outline"
                size={24}
                color={isDark ? '#fff' : '#000'}
              />
            </Pressable>
          </View>
        </View>
        <ScrollView style={styles.content}>
          <Image source={{ uri: article.imageUrl }} style={styles.image} />
          <View style={styles.articleContent}>
            <View style={styles.tagsContainer}>
              {article.tags.map((tag) => (
                <View
                  key={tag}
                  style={[
                    styles.tag,
                    { backgroundColor: isDark ? '#333' : '#f0f0f0' },
                  ]}>
                  <Text
                    style={[
                      styles.tagText,
                      { color: isDark ? '#fff' : '#000' },
                    ]}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
            <Text
              style={[
                styles.title,
                { color: isDark ? '#fff' : '#000' },
              ]}>
              {article.title}
            </Text>
            <View style={styles.meta}>
              <Text
                style={[
                  styles.source,
                  { color: isDark ? '#ccc' : '#666' },
                ]}>
                {article.source}
              </Text>
              <Text
                style={[
                  styles.date,
                  { color: isDark ? '#ccc' : '#666' },
                ]}>
                {formatDistanceToNow(article.publishedAt, { addSuffix: true })}
              </Text>
            </View>
            <Text
              style={[
                styles.summary,
                { color: isDark ? '#fff' : '#000' },
              ]}>
              {article.summary}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  articleContent: {
    padding: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  source: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  date: {
    fontSize: 14,
  },
  summary: {
    fontSize: 18,
    lineHeight: 28,
  },
});
