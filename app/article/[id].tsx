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
  Linking,
} from 'react-native';
import Background from '../../components/Background';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { useNews } from '../../context/NewsContext';
import { useSavedArticles } from '../../context/SavedArticlesContext';
import { parseHtml, styles as htmlStyles } from '../../utils/htmlParser';
import CodeBlock from '../../components/CodeBlock';

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { articles } = useNews();
  const { savedArticles, saveArticle, removeArticle, isSaved } = useSavedArticles();
  
  // First try to find the article in the main articles list, then in saved articles
  const article = [...articles, ...savedArticles].find((a) => a.id === id);

  if (!article) {
    router.back();
    return null;
  }
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

  const handleToggleSave = () => {
    if (isSaved(article.id)) {
      removeArticle(article.id);
    } else {
      saveArticle(article);
    }
  };

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
            <Pressable 
              style={styles.actionButton}
              onPress={() => Linking.openURL(article.url)}
            >
              <Ionicons
                name="globe-outline"
                size={24}
                color={isDark ? '#fff' : '#000'}
              />
            </Pressable>
            <Pressable 
              style={styles.actionButton}
              onPress={handleToggleSave}
            >
              <Ionicons
                name={isSaved(article.id) ? "bookmark" : "bookmark-outline"}
                size={24}
                color={isDark ? '#fff' : '#000'}
              />
            </Pressable>
            {article.source === 'Hacker News' && article.commentsUrl && (
              <Pressable 
                style={styles.actionButton}
                onPress={() => Linking.openURL(article.commentsUrl!)}
              >
                <Ionicons
                  name="chatbubble-outline"
                  size={24}
                  color={isDark ? '#fff' : '#000'}
                />
              </Pressable>
            )}
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
            {article.source === 'Hacker News' && (
              <View style={styles.hnStatsContainer}>
                {article.points !== undefined && (
                  <View style={styles.hnStat}>
                    <Ionicons
                      name="arrow-up"
                      size={16}
                      color={isDark ? '#fff' : '#000'}
                    />
                    <Text style={[styles.hnStatText, { color: isDark ? '#fff' : '#000' }]}>
                      {article.points} points
                    </Text>
                  </View>
                )}
                {article.commentCount !== undefined && (
                  <View style={styles.hnStat}>
                    <Ionicons
                      name="chatbubble-outline"
                      size={16}
                      color={isDark ? '#fff' : '#000'}
                    />
                    <Text style={[styles.hnStatText, { color: isDark ? '#fff' : '#000' }]}>
                      {article.commentCount} comments
                    </Text>
                  </View>
                )}
              </View>
            )}
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
            <View style={styles.summaryContainer}>
              {parseHtml(article.summary).map((part, index) => (
                <React.Fragment key={index}>
                  {part.type === 'text' ? (
                    <Text
                      style={[
                        styles.summaryText,
                        { color: isDark ? '#fff' : '#000' },
                        htmlStyles.paragraph
                      ]}>
                      {part.content}
                    </Text>
                  ) : (
                    <CodeBlock
                      code={part.content}
                      language={part.language}
                    />
                  )}
                </React.Fragment>
              ))}
            </View>
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
  hnStatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  hnStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hnStatText: {
    fontSize: 14,
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
  summaryContainer: {
    marginTop: 16,
  },
  summaryText: {
    fontSize: 18,
    lineHeight: 28,
  },
});
