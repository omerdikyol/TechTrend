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
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
      <SafeAreaView style={styles.safeArea} edges={['right', 'left', 'bottom']}>
        <View style={styles.container}>
          <View style={styles.headerOverlay}>
            <SafeAreaView edges={['top']}>
              <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                  <Ionicons
                    name="arrow-back"
                    size={24}
                    color="#fff"
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
                      color="#fff"
                    />
                  </Pressable>
                  <Pressable 
                    style={styles.actionButton}
                    onPress={handleToggleSave}
                  >
                    <Ionicons
                      name={isSaved(article.id) ? "bookmark" : "bookmark-outline"}
                      size={24}
                      color="#fff"
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
                        color="#fff"
                      />
                    </Pressable>
                  )}
                  <Pressable style={styles.actionButton} onPress={handleShare}>
                    <Ionicons
                      name="share-outline"
                      size={24}
                      color="#fff"
                    />
                  </Pressable>
                </View>
              </View>
            </SafeAreaView>
          </View>
          <ScrollView style={styles.content}>
            <View style={styles.imageContainer}>
              <Image source={{ uri: article.imageUrl }} style={styles.image} />
            </View>
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
        </View>
      </SafeAreaView>
    </Background>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(10px)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 52,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  content: {
    flex: 1,
    paddingTop: 52, // Add padding to account for the header height
  },
  imageContainer: {
    height: 300,
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
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
