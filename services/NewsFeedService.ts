import { NewsItem } from '../components/NewsCard';
import { CacheService } from './CacheService';
import axios from 'axios';
import * as rssParser from 'react-native-rss-parser';
const NEWS_API_KEY = process.env.EXPO_PUBLIC_NEWS_API_KEY;

export interface CustomFeed {
  id: string;
  name: string;
  url: string;
  type: 'rss' | 'api';
  enabled: boolean;
}

class NewsFeedService {
  private defaultFeeds: CustomFeed[] = [
    {
      id: 'devto',
      name: 'Dev.to',
      url: 'https://dev.to/feed',
      type: 'rss',
      enabled: true,
    },
    {
      id: 'techcrunch',
      name: 'TechCrunch',
      url: 'https://techcrunch.com/feed/',
      type: 'rss',
      enabled: true,
    },
    {
      id: 'css-tricks',
      name: 'CSS-Tricks',
      url: 'https://css-tricks.com/feed/',
      type: 'rss',
      enabled: true,
    },
    {
      id: 'smashing',
      name: 'Smashing Magazine',
      url: 'https://www.smashingmagazine.com/feed/',
      type: 'rss',
      enabled: true,
    },
    {
      id: 'reddit-programming',
      name: 'Reddit Programming',
      url: 'https://www.reddit.com/r/programming/.rss',
      type: 'rss',
      enabled: true,
    },
    {
      id: 'github-blog',
      name: 'GitHub Blog',
      url: 'https://github.blog/feed/',
      type: 'rss',
      enabled: true,
    },
    {
      id: 'web-dev',
      name: 'web.dev',
      url: 'https://web.dev/feed.xml',
      type: 'rss',
      enabled: true,
    },
  ];

  private customFeeds: CustomFeed[] = [];

  private getCacheKey(feed: CustomFeed): string {
    return `feed:${feed.id}`;
  }

  async fetchAllFeeds(forceFresh: boolean = false): Promise<NewsItem[]> {
    const allFeeds = [...this.defaultFeeds, ...this.customFeeds].filter(feed => feed.enabled);
    const newsPromises = allFeeds.map(feed => this.fetchFeed(feed, forceFresh));
    const results = await Promise.all(newsPromises);
    const flatResults = results.flat();
    
    // Ensure all items have valid Date objects
    const validResults = flatResults.filter(item => item.publishedAt instanceof Date);
    
    // Sort by date
    return validResults.sort((a, b) => 
      b.publishedAt.getTime() - a.publishedAt.getTime()
    );
  }

  private async fetchFeed(feed: CustomFeed, forceFresh: boolean = false): Promise<NewsItem[]> {
    try {
      const items = await (feed.type === 'rss' ? this.fetchRSSFeed(feed, forceFresh) : this.fetchNewsAPI(feed, forceFresh));
      // this.logNewsItems(items, feed.name);
      return items;
    } catch (error) {
      console.error(`Error fetching feed ${feed.name}:`, error);
      return [];
    }
  }

  private async fetchRSSFeed(feed: CustomFeed, forceFresh: boolean = false): Promise<NewsItem[]> {
    const cacheKey = this.getCacheKey(feed);

    // Try to get from cache first
    if (!forceFresh) {
      const cached = await CacheService.get<NewsItem[]>(cacheKey);
      if (cached) {
        // Convert cached dates back to Date objects
        return cached.map(item => ({
          ...item,
          publishedAt: new Date(item.publishedAt)
        }));
      }
    }

    try {
      const response = await fetch(feed.url);
      const responseData = await response.text();
      const rssData = await rssParser.parse(responseData);

      const articles = rssData.items.map(item => {
        // Parse Hacker News specific data
        let points, commentCount, commentsUrl;
        if (feed.id === 'hackernews') {
          const description = item.description || '';
          const pointsMatch = description.match(/(\d+)\s+points?/);
          const commentsMatch = description.match(/(\d+)\s+comments?/);
          points = pointsMatch ? parseInt(pointsMatch[1]) : undefined;
          commentCount = commentsMatch ? parseInt(commentsMatch[1]) : 0;
          
          // Extract comments URL
          const links = item.links || [];
          commentsUrl = links.length > 1 ? links[1].url : undefined;
        }

        return {
          id: item.id || item.links[0]?.url || Math.random().toString(),
          title: item.title || 'No Title',
          summary: item.description || 'No description available',
          imageUrl: this.extractImageFromContent(item.content || item.description) || null,
          source: feed.name,
          publishedAt: item.published ? new Date(item.published) : new Date(),
          tags: item.categories?.map(cat => cat.name) || [],
          url: item.links[0]?.url || '',
          commentsUrl,
          points,
          commentCount,
        };
      });

      // Cache the results
      await CacheService.set(cacheKey, articles);
      // Cache the results
      await CacheService.set(cacheKey, articles);
      return articles;
    } catch (error) {
      console.error(`Error fetching RSS feed ${feed.name}:`, error);
      return [];
    }
  }

  private async fetchNewsAPI(feed: CustomFeed, forceFresh: boolean = false): Promise<NewsItem[]> {
    const cacheKey = this.getCacheKey(feed);

    // Try to get from cache first
    if (!forceFresh) {
      const cached = await CacheService.get<NewsItem[]>(cacheKey);
      if (cached) {
        // Convert cached dates back to Date objects
        return cached.map(item => ({
          ...item,
          publishedAt: new Date(item.publishedAt)
        }));
      }
    }

    if (!NEWS_API_KEY) {
      console.error('NewsAPI key not configured');
      return [];
    }

    const response = await axios.get(
      `https://newsapi.org/v2/top-headlines?category=technology&apiKey=${NEWS_API_KEY}`
    );

    return response.data.articles.map(article => ({
      id: article.url,
      title: article.title,
      summary: article.description || 'No description available',
      imageUrl: article.urlToImage || null,
      source: article.source.name,
      publishedAt: new Date(article.publishedAt),
      tags: ['technology'],
      url: article.url,
    }));
  }

  private extractImageFromContent(content?: string): string | null {
    if (!content) return null;

    // Try to find image in src attribute
    const imgMatch = content.match(/<img[^>]+src=[\"|']([^"']+)[\"|']/i);
    if (imgMatch) return imgMatch[1];

    // Try to find image in srcset attribute
    const srcsetMatch = content.match(/<img[^>]+srcset=[\"|']([^"']+)[\"|']/i);
    if (srcsetMatch) {
      const srcset = srcsetMatch[1];
      const firstImage = srcset.split(',')[0].trim().split(' ')[0];
      return firstImage;
    }

    // Try to find image URL in a link
    const linkMatch = content.match(/<a[^>]+href=[\"|']([^"']+\.(jpg|jpeg|png|gif|webp))(\?[^"']*)?[\"|']/i);
    if (linkMatch) return linkMatch[1];

    // Try to find any URL that looks like an image
    const urlMatch = content.match(/https?:\/\/[^\s<"']+\.(jpg|jpeg|png|gif|webp)(\?[^\s<"']*)?/i);
    return urlMatch ? urlMatch[0] : null;
  }

  private logNewsItems(items: NewsItem[], source: string): void {
    console.log(`[${new Date().toISOString()}] Received ${items.length} items from ${source}`);
    items.forEach((item, index) => {
      console.log(`[${index + 1}] Title: ${item.title}`);
      console.log(`     Source: ${item.source}`);
      // console.log(`     Published: ${item.publishedAt.toISOString()}`);
      console.log(`     URL: ${item.url}`);
      console.log(`     Summary: ${item.summary}`);
      console.log('     ---');
    });
  }

  addCustomFeed(feed: Omit<CustomFeed, 'id'>): CustomFeed {
    const newFeed = {
      ...feed,
      id: Math.random().toString(),
      enabled: true,
    };
    this.customFeeds.push(newFeed);
    return newFeed;
  }

  toggleFeed(id: string, enabled: boolean): void {
    // Try to find and update in default feeds
    const defaultFeedIndex = this.defaultFeeds.findIndex(feed => feed.id === id);
    if (defaultFeedIndex !== -1) {
      this.defaultFeeds[defaultFeedIndex].enabled = enabled;
      return;
    }

    // Try to find and update in custom feeds
    const customFeedIndex = this.customFeeds.findIndex(feed => feed.id === id);
    if (customFeedIndex !== -1) {
      this.customFeeds[customFeedIndex].enabled = enabled;
    }
  }

  getAllFeeds(): CustomFeed[] {
    return [...this.defaultFeeds, ...this.customFeeds];
  }

  removeCustomFeed(id: string): void {
    this.customFeeds = this.customFeeds.filter(feed => feed.id !== id);
  }

  getCustomFeeds(): CustomFeed[] {
    return this.customFeeds;
  }
}

export const newsFeedService = new NewsFeedService();
