import React, { createContext, useContext, useState, useCallback } from 'react';
import { NewsItem } from '../components/NewsCard';
import { newsFeedService } from '../services/NewsFeedService';
import { imageService } from '../services/ImageService';

interface NewsContextType {
  articles: NewsItem[];
  isLoading: boolean;
  error: string | null;
  fetchNews: (forceFresh?: boolean) => Promise<void>;
  clearArticles: () => void;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export function NewsProvider({ children }: { children: React.ReactNode }) {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async (forceFresh: boolean = false) => {
    if (isLoading) return; // Prevent multiple simultaneous fetches
    
    try {
      setIsLoading(true);
      setError(null);
      
      const news = await newsFeedService.fetchAllFeeds(forceFresh);
      console.log('Fetched news articles:', news.length);
      const articlesWithImages = await Promise.all(
        news.map(async (article) => {
          if (!article.imageUrl) {
            const relatedImage = await imageService.getRelatedImage(
              article.title,
              article.tags
            );
            if (relatedImage) {
              return {
                ...article,
                imageUrl: relatedImage,
              };
            }
          }
          return article;
        })
      );
      
      setArticles(articlesWithImages);
    } catch (err) {
      setError('Failed to fetch news. Please try again later.');
      console.error('Error fetching news:', err);
    } finally {
      setIsLoading(false);
    }
  }, [articles.length]);

  const clearArticles = useCallback(() => {
    setArticles([]);
  }, []);

  return (
    <NewsContext.Provider
      value={{
        articles,
        isLoading,
        error,
        fetchNews,
        clearArticles,
      }}
    >
      {children}
    </NewsContext.Provider>
  );
}

export function useNews() {
  const context = useContext(NewsContext);
  if (context === undefined) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
}
