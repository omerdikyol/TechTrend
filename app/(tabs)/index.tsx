import React, { useState } from 'react';
import { View, StyleSheet, useColorScheme, Alert } from 'react-native';
import NewsCard, { NewsItem } from '../../components/NewsCard';

// Mock data for demonstration
export const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'React 19 Alpha: The Future of React',
    summary:
      'The React team announces React 19 alpha with groundbreaking features including compiler optimizations and enhanced server components.',
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee',
    source: 'React Blog',
    publishedAt: new Date('2024-02-20'),
    tags: ['React', 'JavaScript', 'Frontend'],
    url: 'https://react.dev',
  },
  {
    id: '2',
    title: 'The Rise of AI in Code Generation',
    summary:
      'How AI-powered code generation tools are transforming the way developers write code and what it means for the future of programming.',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995',
    source: 'TechCrunch',
    publishedAt: new Date('2024-02-19'),
    tags: ['AI', 'Programming', 'Future Tech'],
    url: 'https://techcrunch.com',
  },
  {
    id: '3',
    title: 'TypeScript 5.4 Release Candidate',
    summary:
      'Explore the latest features and improvements in TypeScript 5.4, including enhanced type inference and new utility types.',
    imageUrl: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97',
    source: 'TypeScript Blog',
    publishedAt: new Date('2024-02-18'),
    tags: ['TypeScript', 'JavaScript', 'Programming'],
    url: 'https://devblogs.microsoft.com/typescript',
  },
];

export default function DiscoverScreen() {
  const [articles, setArticles] = useState<NewsItem[]>(mockNews);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleSwipeLeft = () => {
    if (articles.length <= 1) return;
    setArticles((prevArticles) => prevArticles.slice(1));
  };

  const handleSwipeRight = () => {
    if (articles.length <= 1) return;

    // Save the current article
    const currentArticle = articles[0];
    Alert.alert('Article Saved', `Saved: ${currentArticle.title}`);
    
    // Remove the current card
    setArticles((prevArticles) => prevArticles.slice(1));
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#000000' : '#F5F5F5' },
      ]}>
      {articles.map((item, index) => (
        <NewsCard
          key={item.id}
          item={item}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          style={{
            position: 'absolute',
            zIndex: articles.length - index,
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});