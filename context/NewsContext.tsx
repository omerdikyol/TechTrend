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
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const FETCH_COOLDOWN = 30000; // 30 seconds cooldown between fetches

  const fetchNews = useCallback(async (forceFresh: boolean = false) => {
    const now = Date.now();
    if (isLoading) return; // Prevent multiple simultaneous fetches
    if (!forceFresh && now - lastFetchTime < FETCH_COOLDOWN) {
      console.log('Skipping fetch due to cooldown');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setLastFetchTime(now);
      
      const news = await newsFeedService.fetchAllFeeds(forceFresh);
      console.log('Fetched news articles:', news.length);
      
      // Process images in smaller batches to prevent memory issues
      const batchSize = 5;
      const processedArticles: NewsItem[] = [];
      
      for (let i = 0; i < news.length; i += batchSize) {
        const batch = news.slice(i, i + batchSize);
        const batchPromises = batch.map(async (article) => {
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
        });
        
        const processedBatch = await Promise.all(batchPromises);
        processedArticles.push(...processedBatch);
        
        // Update articles progressively as batches complete
        setArticles(prev => [...processedArticles, ...prev.slice(processedArticles.length)]);
      }
      
      setArticles(processedArticles);
    } catch (err) {
      setError('Failed to fetch news. Please try again later.');
      console.error('Error fetching news:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, lastFetchTime]);

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
