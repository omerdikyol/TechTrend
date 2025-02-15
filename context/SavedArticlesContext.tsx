import React, { createContext, useContext, useState, useCallback } from 'react';
import { NewsItem } from '../components/NewsCard';

interface SavedArticlesContextType {
  savedArticles: NewsItem[];
  saveArticle: (article: NewsItem) => void;
  removeArticle: (articleId: string) => void;
  isSaved: (articleId: string) => boolean;
}

const SavedArticlesContext = createContext<SavedArticlesContextType | undefined>(undefined);

export function SavedArticlesProvider({ children }: { children: React.ReactNode }) {
  const [savedArticles, setSavedArticles] = useState<NewsItem[]>([]);

  const saveArticle = useCallback((article: NewsItem) => {
    setSavedArticles((prev) => {
      if (prev.some((a) => a.id === article.id)) return prev;
      return [...prev, article];
    });
  }, []);

  const removeArticle = useCallback((articleId: string) => {
    setSavedArticles((prev) => prev.filter((article) => article.id !== articleId));
  }, []);

  const isSaved = useCallback((articleId: string) => {
    return savedArticles.some((article) => article.id === articleId);
  }, [savedArticles]);

  return (
    <SavedArticlesContext.Provider value={{ savedArticles, saveArticle, removeArticle, isSaved }}>
      {children}
    </SavedArticlesContext.Provider>
  );
}

export function useSavedArticles() {
  const context = useContext(SavedArticlesContext);
  if (context === undefined) {
    throw new Error('useSavedArticles must be used within a SavedArticlesProvider');
  }
  return context;
}
